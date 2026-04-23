import { Command } from "commander";
import { runInstall, runUpdate } from "./installer.js";

export async function main(argv: string[]): Promise<void> {
  const program = new Command();
  program
    .name("sonic-express")
    .description("uDos installer — prerequisites, core build, global `udo` link");

  program
    .command("install")
    .description("Install / refresh uDos core and link `udo` globally")
    .option("--skip-desktop-launcher", "Do not copy udos.command to Desktop (macOS)")
    .option("--verbose", "Show npm output")
    .action(
      async (o: { skipDesktopLauncher: boolean; verbose: boolean }) => {
        await runInstall({
          auto: true,
          skipDesktopLauncher: o.skipDesktopLauncher,
          silent: !o.verbose,
        });
      }
    );

  program
    .command("update")
    .description("Pull latest (if git), rebuild core, relink `udo`")
    .option("--verbose", "Show npm output")
    .action(async (o: { verbose: boolean }) => {
      await runUpdate({ auto: true, silent: !o.verbose });
    });

  await program.parseAsync(argv);
}
