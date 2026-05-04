import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** uDosConnect repo root when running from `tools/sonic-express/dist/*.js`. */
export function udosConnectRoot(): string {
  return path.resolve(here, "..", "..", "..");
}

export function coreDir(): string {
  return path.join(udosConnectRoot(), "core");
}
