#!/usr/bin/env node
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

const PORT_FILE = path.join(__dirname, '../.port');
const PID_FILE = path.join(__dirname, '../.pid');
const TAURI_CONF = path.join(__dirname, '../src-tauri/tauri.conf.json');
const TAURI_CONF_BACKUP = path.join(__dirname, '../src-tauri/tauri.conf.json.bak');

function log(step, message) {
  const steps = ['START', 'CLEANUP', 'INSTALL', 'PORT', 'VITE', 'TAURI'];
  const currentIndex = steps.indexOf(step);
  
  // Create progress bar
  const progress = '█'.repeat(currentIndex + 1) + '░'.repeat(steps.length - currentIndex - 1);
  const percentage = Math.round(((currentIndex + 1) / steps.length) * 100);
  
  console.log(`\n${progress} [${percentage}%] [${step}] ${message}`);
}

async function findFreePort(startPort = 1420, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const isFree = await new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      server.listen(port);
    });
    if (isFree) return port;
  }
  throw new Error('No free port found');
}

async function killOldProcess() {
  if (fs.existsSync(PID_FILE)) {
    const oldPid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
    try {
      process.kill(oldPid, 'SIGTERM');
      log('CLEANUP', `Killed old process ${oldPid}`);
    } catch (e) {
      // Process already dead
    }
    fs.unlinkSync(PID_FILE);
  }
}

async function ensureDependencies() {
  const nodeModules = path.join(__dirname, '..', 'node_modules');
  if (!fs.existsSync(nodeModules)) {
    log('INSTALL', 'Installing dependencies (first run)...');
    execSync('npm install', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
  }
}

async function backupTauriConfig() {
  if (!fs.existsSync(TAURI_CONF_BACKUP)) {
    fs.copyFileSync(TAURI_CONF, TAURI_CONF_BACKUP);
  }
}

async function patchTauriConfig(port) {
  const conf = JSON.parse(fs.readFileSync(TAURI_CONF, 'utf8'));
  conf.build.devUrl = `http://localhost:${port}`;
  fs.writeFileSync(TAURI_CONF, JSON.stringify(conf, null, 2));
}

async function restoreTauriConfig() {
  if (fs.existsSync(TAURI_CONF_BACKUP)) {
    fs.copyFileSync(TAURI_CONF_BACKUP, TAURI_CONF);
  }
}

async function start() {
  log('START', '🚀 Launching ThinUI development server...');
  
  // Step 1: Cleanup
  await killOldProcess();
  
  // Step 2: Ensure dependencies
  await ensureDependencies();
  
  // Step 3: Find free port
  const port = await findFreePort(1420);
  log('PORT', `✅ Using port ${port}`);
  fs.writeFileSync(PORT_FILE, port.toString());
  
  // Step 4: Backup and patch Tauri config
  await backupTauriConfig();
  await patchTauriConfig(port);
  
  // Step 5: Start Vite dev server
  log('VITE', '🔄 Starting Vite dev server...');
  const vite = spawn('npx', ['vite', '--port', port.toString()], {
    cwd: path.join(__dirname, '..', 'ui'),
    stdio: 'pipe',
  });
  
  vite.stdout.on('data', (data) => {
    const str = data.toString();
    process.stdout.write(data);
    if (str.includes('ready') || str.includes('Local:')) {
      log('VITE', '✅ Vite ready!');
      // Start Tauri
      log('TAURI', '🚀 Launching Tauri application...');
      const tauri = spawn('npm', ['run', 'tauri', 'dev'], {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
      });
      
      tauri.on('exit', () => {
        restoreTauriConfig().then(() => process.exit());
      });
      
      tauri.on('error', (err) => {
        console.error('Tauri error:', err);
        restoreTauriConfig().then(() => process.exit(1));
      });
    }
  });
  
  vite.stderr.on('data', (data) => process.stderr.write(data));
  
  vite.on('exit', (code) => {
    restoreTauriConfig().then(() => process.exit(code));
  });
  
  vite.on('error', (err) => {
    console.error('Vite error:', err);
    restoreTauriConfig().then(() => process.exit(1));
  });
  
  fs.writeFileSync(PID_FILE, vite.pid.toString());
}

start().catch(err => {
  console.error('❌ Fatal error:', err);
  restoreTauriConfig().then(() => process.exit(1));
});
