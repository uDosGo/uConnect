#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════
 * uDos Server Manager — Port/Task/Recovery System
 * ═══════════════════════════════════════════════════════════════════
 * 
 * A robust Node.js process manager for uConnect surfaces.
 * Handles: port allocation, process lifecycle, health checks,
 * auto-recovery, and clean shutdown.
 * 
 * Usage:
 *   node scripts/udos.js [command] [options]
 * 
 * Commands:
 *   start <surface>   Start a surface (ui, proseui, code3ui, etc.)
 *   start --all       Start all surfaces
 *   stop  <surface>   Stop a surface
 *   stop  --all       Stop all surfaces
 *   status            Show status of all surfaces
 *   restart <surface> Restart a surface
 *   menu-bar          Start the macOS menu bar app
 *   dev               Interactive dev mode
 * 
 * Port scheme:
 *   ui (hub)  → 5173
 *   proseui   → 5174
 *   code3ui   → 5175
 *   code4ui   → 5176
 *   opsui     → 5177
 *   gridui    → 5178
 * ═══════════════════════════════════════════════════════════════════
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');

// ─── Configuration ────────────────────────────────────────────────

const CONNECT_DIR = path.resolve(__dirname, '..');
const LOG_DIR = path.join(os.homedir(), '.udos');
const LOG_FILE = path.join(LOG_DIR, 'udos.log');
const STATE_FILE = path.join(LOG_DIR, 'state.json');

const SURFACES = [
  { name: 'ui',      label: 'UI Hub (Index)',  port: 5173, dir: 'ui' },
  { name: 'proseui', label: 'Prose Editor',    port: 5174, dir: 'proseui' },
  { name: 'code3ui', label: 'Code Editor v3',  port: 5175, dir: 'code3ui' },
  { name: 'code4ui', label: 'Code Editor v4',  port: 5176, dir: 'code4ui' },
  { name: 'opsui',   label: 'Server Ops',      port: 5177, dir: 'opsui' },
  { name: 'gridui',  label: 'Grid Workspace',  port: 5178, dir: 'gridui' },
];

// ─── State Management ─────────────────────────────────────────────

let state = { processes: {} };

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) {
    state = { processes: {} };
  }
}

function saveState() {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    // ignore
  }
}

function log(...args) {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const msg = `[${timestamp}] ${args.join(' ')}`;
  console.log(msg);
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.appendFileSync(LOG_FILE, msg + '\n');
  } catch (e) {
    // ignore
  }
}

// ─── Port Utilities ───────────────────────────────────────────────

function getPidOnPort(port) {
  try {
    const result = execSync(`lsof -ti :${port} 2>/dev/null`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    const pids = result.trim().split('\n').filter(Boolean);
    return pids.length > 0 ? pids.map(p => parseInt(p.trim())) : [];
  } catch {
    return [];
  }
}

function isPortInUse(port) {
  return getPidOnPort(port).length > 0;
}

function killPort(port) {
  const pids = getPidOnPort(port);
  for (const pid of pids) {
    try {
      process.kill(pid, 'SIGKILL');
      log(`  Killed PID ${pid} on port ${port}`);
    } catch (e) {
      // already dead
    }
  }
}

function waitForPort(port, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (isPortInUse(port)) {
        resolve(true);
      } else if (Date.now() - start > timeoutMs) {
        resolve(false);
      } else {
        setTimeout(check, 300);
      }
    };
    check();
  });
}

function waitForPortFree(port, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      if (!isPortInUse(port)) {
        resolve(true);
      } else if (Date.now() - start > timeoutMs) {
        resolve(false);
      } else {
        setTimeout(check, 200);
      }
    };
    check();
  });
}

// ─── Surface Management ───────────────────────────────────────────

function getSurface(name) {
  return SURFACES.find(s => s.name === name);
}

function getSurfaceDir(surface) {
  return path.join(CONNECT_DIR, surface.dir);
}

async function installDeps(surface) {
  const dir = getSurfaceDir(surface);
  const nodeModulesDir = path.join(dir, 'node_modules');
  
  if (fs.existsSync(nodeModulesDir)) {
    return true;
  }
  
  log(`  📦 Installing dependencies for ${surface.name}...`);
  
  return new Promise((resolve) => {
    const proc = spawn('npm', ['install', '--no-audit', '--no-fund'], {
      cwd: dir,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    
    let output = '';
    proc.stdout.on('data', d => output += d.toString());
    proc.stderr.on('data', d => output += d.toString());
    
    proc.on('close', (code) => {
      if (code === 0) {
        log(`  ✅ Dependencies installed for ${surface.name}`);
        resolve(true);
      } else {
        log(`  ❌ npm install failed for ${surface.name} (exit ${code})`);
        log(`  ${output.slice(0, 500)}`);
        resolve(false);
      }
    });
    
    proc.on('error', (err) => {
      log(`  ❌ Failed to run npm install for ${surface.name}: ${err.message}`);
      resolve(false);
    });
  });
}

async function startSurface(surface) {
  const dir = getSurfaceDir(surface);
  
  if (!fs.existsSync(dir)) {
    log(`  ❌ Directory not found: ${dir}`);
    return false;
  }
  
  // Kill existing on this port
  if (isPortInUse(surface.port)) {
    log(`  ⚠️  Port ${surface.port} in use, killing...`);
    killPort(surface.port);
    await waitForPortFree(surface.port);
  }
  
  // Install deps if needed
  const depsOk = await installDeps(surface);
  if (!depsOk) {
    return false;
  }
  
  // Start vite
  log(`  🚀 Starting ${surface.name} on port ${surface.port}...`);
  
  const proc = spawn('npx', ['vite', '--port', String(surface.port), '--host'], {
    cwd: dir,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
  
  const pid = proc.pid;
  
  // Log output
  proc.stdout.on('data', d => {
    fs.appendFileSync(LOG_FILE, `[${surface.name}] ${d.toString()}`);
  });
  proc.stderr.on('data', d => {
    fs.appendFileSync(LOG_FILE, `[${surface.name}] ${d.toString()}`);
  });
  
  proc.on('exit', (code, signal) => {
    log(`  ${surface.name} exited (code: ${code}, signal: ${signal})`);
    // Auto-recovery: restart if it crashed unexpectedly
    if (code !== 0 && signal !== 'SIGTERM' && signal !== 'SIGKILL') {
      log(`  🔄 Auto-recovering ${surface.name}...`);
      setTimeout(() => startSurface(surface), 1000);
    }
  });
  
  // Unref so the process can outlive the parent
  proc.unref();
  
  // Wait for it to be ready
  const ready = await waitForPort(surface.port);
  if (ready) {
    log(`  ✅ ${surface.label} → http://localhost:${surface.port} (PID: ${pid})`);
    
    // Store in state
    state.processes[surface.name] = {
      pid,
      port: surface.port,
      started: new Date().toISOString(),
    };
    saveState();
    
    return true;
  } else {
    log(`  ⚠️  ${surface.name} may still be starting...`);
    return true; // optimistic
  }
}

async function stopSurface(surface) {
  if (isPortInUse(surface.port)) {
    log(`  ⏹  Stopping ${surface.name}...`);
    killPort(surface.port);
    await waitForPortFree(surface.port);
    log(`  ✅ ${surface.name} stopped`);
  } else {
    log(`  ⚪ ${surface.name} not running`);
  }
  
  delete state.processes[surface.name];
  saveState();
}

function getStatus(surface) {
  const inUse = isPortInUse(surface.port);
  const pids = getPidOnPort(surface.port);
  const icon = inUse ? '🟢' : '⚪';
  const pidStr = pids.length > 0 ? `(PID: ${pids.join(', ')})` : '';
  return { surface, running: inUse, pids, icon, pidStr };
}

// ─── Menu Bar ─────────────────────────────────────────────────────

function startMenuBar() {
  const swiftSrc = path.join(CONNECT_DIR, 'scripts', 'udos-menu-bar.swift');
  const binary = '/tmp/udos-menu-bar';
  
  // Check if already running
  try {
    const existing = execSync('pgrep -f "udos-menu-bar" 2>/dev/null', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    if (existing.trim()) {
      log('  ✅ Menu bar app already running');
      return;
    }
  } catch {
    // not running
  }
  
  log('  🔨 Compiling menu bar app...');
  
  try {
    execSync(`swiftc -o "${binary}" "${swiftSrc}" 2>/dev/null`, { stdio: ['pipe', 'pipe', 'pipe'] });
    log('  ✅ Compiled menu bar app');
    
    const proc = spawn(binary, [], {
      stdio: 'ignore',
      detached: true,
    });
    proc.unref();
    
    log('  ✅ Menu bar app started');
    log('  🔄 Look for the 🍔 icon in your menu bar!');
  } catch (e) {
    log('  ⚠️  Could not compile menu bar app (Swift may not be available)');
  }
}

// ─── Commands ─────────────────────────────────────────────────────

async function cmdStart(args) {
  if (args.includes('--all') || args.includes('-a')) {
    log('');
    log('╔══════════════════════════════════════════════════════════╗');
    log('║   🚀 uDos / Connect — Launching All Surfaces            ║');
    log('╚══════════════════════════════════════════════════════════╝');
    log('');
    
    const results = await Promise.allSettled(
      SURFACES.map(s => startSurface(s))
    );
    
    const succeeded = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.filter(r => r.status === 'fulfilled' && !r.value).length;
    
    log('');
    log(`  ✅ ${succeeded} surfaces started`);
    if (failed > 0) log(`  ⚠️  ${failed} surfaces failed`);
    log('');
    log('  📝 Logs: ' + LOG_FILE);
    log('  🌐 Hub:  http://localhost:5173');
    log('');
    
    // Start menu bar
    startMenuBar();
    
    // Keep alive
    log('  🛑 Press Ctrl+C to stop');
    process.stdin.resume();
    
  } else if (args.length > 0) {
    const surface = getSurface(args[0]);
    if (!surface) {
      console.error(`❌ Unknown surface: ${args[0]}`);
      console.error(`   Available: ${SURFACES.map(s => s.name).join(', ')}`);
      process.exit(1);
    }
    await startSurface(surface);
  } else {
    console.error('❌ Usage: node scripts/udos.js start <surface|--all>');
    process.exit(1);
  }
}

async function cmdStop(args) {
  if (args.includes('--all') || args.includes('-a')) {
    log('  ⏹  Stopping all surfaces...');
    for (const surface of SURFACES) {
      await stopSurface(surface);
    }
    log('  ✅ All surfaces stopped');
  } else if (args.length > 0) {
    const surface = getSurface(args[0]);
    if (!surface) {
      console.error(`❌ Unknown surface: ${args[0]}`);
      process.exit(1);
    }
    await stopSurface(surface);
  } else {
    console.error('❌ Usage: node scripts/udos.js stop <surface|--all>');
    process.exit(1);
  }
}

function cmdStatus() {
  log('');
  log('╔══════════════════════════════════════════════════════════╗');
  log('║   📡 uDos / Connect — Surface Status                     ║');
  log('╚══════════════════════════════════════════════════════════╝');
  log('');
  
  for (const surface of SURFACES) {
    const { icon, pids, pidStr } = getStatus(surface);
    log(`  ${icon} :${surface.port}  ${surface.label.padEnd(25)} ${pidStr}`);
  }
  
  log('');
  log('  📝 Logs: ' + LOG_FILE);
  log('');
}

async function cmdRestart(args) {
  if (args.length === 0) {
    console.error('❌ Usage: node scripts/udos.js restart <surface>');
    process.exit(1);
  }
  
  const surface = getSurface(args[0]);
  if (!surface) {
    console.error(`❌ Unknown surface: ${args[0]}`);
    process.exit(1);
  }
  
  log(`  🔄 Restarting ${surface.name}...`);
  await stopSurface(surface);
  await startSurface(surface);
}

function cmdMenuBar() {
  startMenuBar();
  // Keep alive
  process.stdin.resume();
}

function cmdDev() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   🛠️  uDos Dev Mode — Surface Selector                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  
  function showMenu() {
    console.log('  Select a surface:');
    console.log('');
    
    SURFACES.forEach((s, i) => {
      const status = isPortInUse(s.port) ? '🟢' : '⚪';
      console.log(`    ${i + 1}) ${status} ${s.label}  :${s.port}`);
    });
    
    console.log('    a) 🚀 Launch ALL surfaces');
    console.log('    s) 📡 Show status');
    console.log('    q) Quit');
    console.log('');
    
    rl.question('  Choice [1-6/a/s/q]: ', async (answer) => {
      const choice = answer.trim().toLowerCase();
      
      if (choice === 'q') {
        console.log('  👋 Goodbye!');
        rl.close();
        return;
      }
      
      if (choice === 'a') {
        await cmdStart(['--all']);
        showMenu();
        return;
      }
      
      if (choice === 's') {
        cmdStatus();
        showMenu();
        return;
      }
      
      const num = parseInt(choice);
      if (num >= 1 && num <= SURFACES.length) {
        const surface = SURFACES[num - 1];
        if (isPortInUse(surface.port)) {
          rl.question(`  ${surface.label} is running. Stop (s) or Restart (r)? [s/r/c]: `, async (ans) => {
            if (ans === 's') {
              await stopSurface(surface);
            } else if (ans === 'r') {
              await cmdRestart([surface.name]);
            }
            showMenu();
          });
        } else {
          await startSurface(surface);
          showMenu();
        }
        return;
      }
      
      console.log('  ❌ Invalid choice');
      showMenu();
    });
  }
  
  showMenu();
}

// ─── Main ─────────────────────────────────────────────────────────

async function main() {
  loadState();
  
  const args = process.argv.slice(2);
  const command = args[0];
  const commandArgs = args.slice(1);
  
  // Ensure log dir exists
  fs.mkdirSync(LOG_DIR, { recursive: true });
  
  switch (command) {
    case 'start':
      await cmdStart(commandArgs);
      break;
    case 'stop':
      await cmdStop(commandArgs);
      break;
    case 'status':
    case 'st':
      cmdStatus();
      break;
    case 'restart':
      await cmdRestart(commandArgs);
      break;
    case 'menu-bar':
    case 'menu':
      cmdMenuBar();
      break;
    case 'dev':
    case 'dev-mode':
      cmdDev();
      break;
    case '--all':
    case '-a':
      await cmdStart(['--all']);
      break;
    default:
      console.log('');
      console.log('╔══════════════════════════════════════════════════════════╗');
      console.log('║   🚀 uDos / Connect — Server Manager                    ║');
      console.log('╚══════════════════════════════════════════════════════════╝');
      console.log('');
      console.log('  Usage: node scripts/udos.js <command> [options]');
      console.log('');
      console.log('  Commands:');
      console.log('    start <surface|--all>   Start a surface or all');
      console.log('    stop  <surface|--all>   Stop a surface or all');
      console.log('    status                  Show surface status');
      console.log('    restart <surface>       Restart a surface');
      console.log('    menu-bar                Start macOS menu bar app');
      console.log('    dev                     Interactive dev mode');
      console.log('');
      console.log('  Surfaces:');
      SURFACES.forEach(s => {
        console.log(`    ${s.name.padEnd(10)} → :${s.port}  ${s.label}`);
      });
      console.log('');
      break;
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
