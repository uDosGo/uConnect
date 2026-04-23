import chalk from "chalk";
import { upgradeMessage } from "../cloud-stubs/upgrade.js";

export async function cmdServerConfigure(port: number): Promise<void> {
  void port;
  console.log(chalk.yellow(upgradeMessage("Server configure")));
}

export async function cmdServerStart(): Promise<void> {
  console.log(chalk.yellow(upgradeMessage("Server start")));
}

export async function cmdServerStop(): Promise<void> {
  console.log(chalk.yellow(upgradeMessage("Server stop")));
}

export async function cmdServerStatus(): Promise<void> {
  console.log(chalk.yellow(upgradeMessage("Server status")));
}

export async function cmdServerLogs(): Promise<void> {
  console.log(chalk.yellow(upgradeMessage("Server logs")));
}
