import { spawn } from "node:child_process";
import net from "node:net";
import { open as openFile } from "node:fs/promises";
import fs from "fs-extra";
import path from "node:path";
import { getVaultRoot, udosConnectRoot } from "../paths.js";

export function usxdExpressCliJs(): string {
  return path.join(udosConnectRoot(), "tools", "usxd-express", "dist", "cli.js");
}

export async function runUsxdExpress(args: string[]): Promise<void> {
  const cli = usxdExpressCliJs();
  if (!(await fs.pathExists(cli))) {
    console.error('USXD-Express is not built — run: npm run build -w @udos/usxd-express');
    process.exit(1);
  }
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [cli, ...args], {
      stdio: "inherit",
      cwd: process.cwd(),
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`usxd-express exited with code ${code}`));
    });
  });
}

/** Preview: prefer vault surfaces when the folder exists. */
export async function cmdUsxdEdit(file?: string): Promise<void> {
  if (file) {
    await runUsxdExpress(["serve", "--file", path.resolve(file)]);
    return;
  }
  const vault = getVaultRoot();
  const vaultSurfaces = path.join(vault, "surfaces");
  if (await fs.pathExists(vaultSurfaces)) {
    await runUsxdExpress(["serve", "--dir", vaultSurfaces]);
    return;
  }
  await runUsxdExpress(["serve"]);
}

function bundledDemoSurfacesDir(): string {
  return path.join(udosConnectRoot(), "tools", "usxd-express", "surfaces");
}

async function defaultGuiDir(): Promise<string> {
  const vault = getVaultRoot();
  const vaultSurfaces = path.join(vault, "surfaces");
  if (await fs.pathExists(vaultSurfaces)) return vaultSurfaces;
  return bundledDemoSurfacesDir();
}

type GuiMode = "index" | "demos";

type GuiState = {
  pid: number;
  port: number;
  url: string;
  dir: string;
  mode: GuiMode;
  logFile: string;
  startedAt: string;
};

function guiStatePath(): string {
  return path.join(getVaultRoot(), ".local", "runtime", "gui-service.json");
}

function defaultPort(mode: GuiMode): number {
  return mode === "demos" ? 4313 : 4312;
}

async function openInBrowser(url: string): Promise<void> {
  const platform = process.platform;
  let cmd = "xdg-open";
  let args = [url];
  if (platform === "darwin") {
    cmd = "open";
    args = [url];
  } else if (platform === "win32") {
    cmd = "cmd";
    args = ["/c", "start", "", url];
  }
  const child = spawn(cmd, args, { stdio: "ignore", detached: true });
  child.unref();
}

async function isPortAvailable(port: number): Promise<boolean> {
  return await new Promise<boolean>((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port);
  });
}

async function choosePort(preferred: number): Promise<number> {
  if (await isPortAvailable(preferred)) return preferred;
  for (let p = preferred + 1; p <= preferred + 40; p += 1) {
    if (await isPortAvailable(p)) return p;
  }
  throw new Error(`No available port found near ${preferred}`);
}

async function readGuiState(): Promise<GuiState | null> {
  const p = guiStatePath();
  if (!(await fs.pathExists(p))) return null;
  try {
    return JSON.parse(await fs.readFile(p, "utf8")) as GuiState;
  } catch {
    return null;
  }
}

function processRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function waitForPort(port: number, timeoutMs = 5000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (!(await isPortAvailable(port))) return true;
    await new Promise((r) => setTimeout(r, 150));
  }
  return false;
}

async function startGuiService(mode: GuiMode, opts?: { port?: string; noOpen?: boolean }): Promise<void> {
  const cli = usxdExpressCliJs();
  if (!(await fs.pathExists(cli))) {
    console.error('USXD-Express is not built — run: npm run build -w @udos/usxd-express');
    process.exit(1);
    return;
  }

  const current = await readGuiState();
  if (current && processRunning(current.pid)) {
    console.log(`GUI already running: ${current.url} (pid ${current.pid})`);
    if (!opts?.noOpen) await openInBrowser(current.url);
    return;
  }

  const dir = mode === "demos" ? bundledDemoSurfacesDir() : await defaultGuiDir();
  const preferred = opts?.port ? parseInt(opts.port, 10) || defaultPort(mode) : defaultPort(mode);
  const port = await choosePort(preferred);
  const url = `http://localhost:${port}`;

  const runtimeDir = path.dirname(guiStatePath());
  const logsDir = path.join(getVaultRoot(), ".local", "logs");
  await fs.ensureDir(runtimeDir);
  await fs.ensureDir(logsDir);
  const logFile = path.join(logsDir, `gui-${mode}.log`);
  const logHandle = await openFile(logFile, "a");
  const args = [cli, "serve", "--dir", dir, "--port", String(port), "--no-open"];
  const child = spawn(process.execPath, args, {
    cwd: process.cwd(),
    detached: true,
    stdio: ["ignore", logHandle.fd, logHandle.fd],
  });
  child.unref();
  await logHandle.close();
  const started = await waitForPort(port, 7000);

  const state: GuiState = {
    pid: child.pid ?? -1,
    port,
    url,
    dir,
    mode,
    logFile,
    startedAt: new Date().toISOString(),
  };
  await fs.writeFile(guiStatePath(), JSON.stringify(state, null, 2), "utf8");

  if (!started) {
    console.error(`GUI may have failed to start. Check logs: ${logFile}`);
    process.exitCode = 1;
    return;
  }
  console.log(`GUI started (${mode}) at ${url}`);
  console.log(`PID: ${state.pid}`);
  console.log(`Logs: ${logFile}`);
  if (port !== preferred) console.log(`Port manager selected ${port} (requested ${preferred} was busy).`);
  if (!opts?.noOpen) await openInBrowser(url);
}

export async function cmdGuiOpen(opts?: { port?: string; noOpen?: boolean }): Promise<void> {
  await startGuiService("index", opts);
}

export async function cmdGuiDemos(opts?: { port?: string; noOpen?: boolean }): Promise<void> {
  await startGuiService("demos", opts);
}

export async function cmdGuiStop(): Promise<void> {
  const state = await readGuiState();
  if (!state) {
    console.log("GUI is not running.");
    return;
  }
  if (processRunning(state.pid)) {
    try {
      process.kill(state.pid, "SIGTERM");
    } catch {
      // no-op
    }
  }
  await fs.remove(guiStatePath());
  console.log("GUI stopped.");
}

export async function cmdGuiStatus(): Promise<void> {
  const state = await readGuiState();
  if (!state) {
    console.log("GUI status: stopped");
    return;
  }
  const running = processRunning(state.pid);
  console.log({
    status: running ? "running" : "stopped",
    mode: state.mode,
    pid: state.pid,
    port: state.port,
    url: state.url,
    dir: state.dir,
    logFile: state.logFile,
    startedAt: state.startedAt,
  });
}

export async function cmdGuiLogs(lines = 80): Promise<void> {
  const state = await readGuiState();
  if (!state || !(await fs.pathExists(state.logFile))) {
    console.log("No GUI logs found.");
    return;
  }
  const content = await fs.readFile(state.logFile, "utf8");
  const tail = content.split(/\r?\n/).slice(-Math.max(1, lines)).join("\n");
  console.log(tail);
}

export async function cmdGuiBrowserOpen(): Promise<void> {
  const state = await readGuiState();
  if (!state) {
    console.log("GUI is not running. Start it with `udo gui` first.");
    process.exitCode = 1;
    return;
  }
  await openInBrowser(state.url);
  console.log(`Opened ${state.url}`);
}
