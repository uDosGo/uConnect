import chalk from "chalk";
import { upgradeMessage } from "../cloud-stubs/upgrade.js";

export async function cmdA2Configure(url: string, apiKey?: string): Promise<void> {
  void url;
  void apiKey;
  console.log(chalk.yellow(upgradeMessage("A2 bridge configure")));
}

export async function cmdA2Status(): Promise<void> {
  console.log({
    mode: "A1 wireframe",
    bridge: "stub",
    message: "A2 features are not implemented in this repo. Use Universe or uDos.space.",
    stubs: [
      "wp sync/publish/review",
      "sync pull/push/status (WP cloud actions)",
      "a2 server start/stop/status/logs/configure",
      "workflow server start/status",
      "workflow webhook add/list",
      "workflow queue list",
      "beacon scan",
      "oauth2 provider",
      "realtime cloud events",
      "multi-tenant server",
      "multi-device sync",
    ],
  });
  console.log(chalk.yellow(upgradeMessage("A2 bridge status")));
}
