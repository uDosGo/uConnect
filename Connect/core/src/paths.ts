import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

const here = path.dirname(fileURLToPath(import.meta.url));

/** uDosConnect repo root when running from built `core/dist/*.js`. */
export function udosConnectRoot(): string {
  return path.resolve(here, "..", "..");
}

export function templatesDir(): string {
  if (process.env.UDOS_TEMPLATES_ROOT) return path.resolve(process.env.UDOS_TEMPLATES_ROOT);
  return path.join(udosConnectRoot(), "templates");
}

export function seedDir(): string {
  return path.join(udosConnectRoot(), "seed");
}

export function getVaultRoot(): string {
  return process.env.UDOS_VAULT ? path.resolve(process.env.UDOS_VAULT) : path.join(os.homedir(), "vault");
}

export function getVendorRoot(): string {
  return process.env.UDOS_VENDOR ? path.resolve(process.env.UDOS_VENDOR) : path.join(os.homedir(), "vendor");
}

export function resolveInVault(vaultRoot: string, file: string): string {
  const p = path.resolve(vaultRoot, file);
  if (!p.startsWith(vaultRoot)) {
    throw new Error("Path escapes vault root");
  }
  return p;
}
