import { upgradeMessage } from "./upgrade.js";

export async function syncStatusStub(): Promise<string> {
  return upgradeMessage("WP cloud sync status");
}

export async function syncPullStub(): Promise<string> {
  return upgradeMessage("WP cloud sync pull");
}

export async function syncPushStub(): Promise<string> {
  return upgradeMessage("WP cloud sync push");
}
