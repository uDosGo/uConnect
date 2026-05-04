import chalk from "chalk";

export async function cmdBeaconScan(): Promise<void> {
  console.log(chalk.yellow("A1 local stub: beacon scan is reserved for A2/LAN discovery."));
  console.log(chalk.dim("Future: mDNS scan for uDos server peers on local network."));
}
