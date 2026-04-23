import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { serve } from "./server.js";
import { exportSurfaces } from "./exporter.js";
import { validateFile } from "./validator.js";
import { listSurfaces } from "./list-surfaces.js";
import { renderSurfaceFile } from "./render-terminal.js";

function portFromEnv(fallback: string): number {
  const n = Number(process.env.USXD_PORT ?? fallback);
  return Number.isFinite(n) && n > 0 ? n : parseInt(fallback, 10);
}

export async function main(argv: string[]): Promise<void> {
  const program = new Command();
  program.name("usxd-express").description("OBF / USXD — markdown surfaces to HTML (preview + export)");
  program.showHelpAfterError(true);

  program
    .command("serve")
    .description("Preview server with live reload (watch markdown)")
    .option("-f, --file <file>", "Watch a single markdown file")
    .option("-d, --dir <dir>", "Watch all **/*.md under this directory (default: current directory)")
    .option("-p, --port <port>", "HTTP port", String(portFromEnv("3000")))
    .option("--no-open", "Disable startup browser-open prompt")
    .action(async (o: { file?: string; dir?: string; port: string; open?: boolean }) => {
      const port = parseInt(o.port, 10) || 3000;
      await serve({
        file: o.file,
        dir: o.file ? undefined : (o.dir ?? process.cwd()),
        port,
        open: o.open !== false,
      });
    });

  program
    .command("export")
    .description("Export surfaces to static HTML (self-contained CSS, no Tailwind CDN)")
    .argument("[file]", "Markdown file (optional; same as --file)")
    .option("-f, --file <file>", "Single markdown file (alternative to positional [file])")
    .option("-d, --dir <dir>", "Directory of markdown files", "./surfaces")
    .option("-o, --output <dir>", "Output directory", "./dist")
    .option("--format <format>", "Export format: html | svg", "html")
    .action(
      async (positional: string | undefined, o: { file?: string; dir?: string; output: string; format: string }) => {
        const format = String(o.format ?? "html").toLowerCase();
        if (format !== "html") {
          if (format === "svg") {
            throw new Error("[A2 stub] USXD SVG export is planned; use --format html in A1.");
          }
          throw new Error(`Unsupported export format: ${format}. Supported: html`);
        }
      const file = positional ?? o.file;
      await exportSurfaces({
        file,
        dir: file ? undefined : o.dir,
        output: o.output,
      });
      }
    );

  program
    .command("render")
    .description("Render first USXD surface from markdown to terminal")
    .argument("<file>", "Markdown path")
    .option("--mode <m>", "teletext | mono | wireframe")
    .action(async (file: string, o: { mode?: string }) => {
      await renderSurfaceFile(file, o.mode as "teletext" | "mono" | "wireframe" | undefined);
    });

  program
    .command("validate")
    .description("Validate USXD + optional grid in a markdown file")
    .argument("<file>", "Markdown path")
    .action(async (file: string) => {
      const code = await validateFile(file);
      process.exit(code);
    });

  program
    .command("list")
    .description("List SURFACE names found in markdown files")
    .option("-d, --dir <dir>", "Root directory to scan")
    .action(async (o: { dir?: string }) => {
      await listSurfaces(o.dir ?? process.cwd());
    });

  const args = argv.slice(2);
  if (args.length === 0) {
    program.help();
    return;
  }

  await program.parseAsync(argv);
}

function invokedDirectly(): boolean {
  const a = process.argv[1];
  if (!a) return false;
  try {
    return path.resolve(a) === path.resolve(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (invokedDirectly()) {
  main(process.argv).catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
