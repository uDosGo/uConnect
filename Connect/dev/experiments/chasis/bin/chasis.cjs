#!/usr/bin/env node
"use strict";

const { spawnSync } = require("node:child_process");
const path = require("node:path");
const readline = require("node:readline");
const {
  DB_PATH,
  REPOS_DIR,
  ADAPTORS_DIR,
  initProject,
  startProject,
  stopProject,
  listProjects,
  logsProject,
  removeProject,
} = require("../src/chasis-manager.cjs");
const { repoWithContainerByName } = require("../src/db.cjs");
const { openSurfaceUrl } = require("../src/surface-proxy.cjs");

function banner() {
  process.stderr.write(
    "\nWARNING: CHASIS is EXPERIMENTAL in /dev/experiments/\n" +
      "- May change or disappear without notice\n" +
      "- Do not depend on this in production\n\n"
  );
}

function help() {
  process.stdout.write(
    "CHASIS - Container Hosted Application Surface Integration System\n\n" +
      "Usage:\n" +
      "  chasis init <repo-url|path> [--name <name>]\n" +
      "  chasis start <name>\n" +
      "  chasis stop <name>\n" +
      "  chasis list\n" +
      "  chasis logs <name>\n" +
      "  chasis remove <name>\n" +
      "  chasis adaptor edit <name>\n" +
      "  chasis surface open <name>\n\n" +
      "Database:\n" +
      `  ${DB_PATH}\n` +
      "Repos directory:\n" +
      `  ${REPOS_DIR}\n` +
      "Adaptors directory:\n" +
      `  ${ADAPTORS_DIR}\n`
  );
}

function promptProceed() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
    rl.question("Proceed? (y/N) ", (ans) => {
      rl.close();
      resolve(ans.trim().toLowerCase() === "y");
    });
  });
}

function parseNameFlag(args) {
  const i = args.indexOf("--name");
  if (i >= 0 && args[i + 1]) return args[i + 1];
  return undefined;
}

function runEditor(filePath) {
  const editor = process.env.EDITOR || "vi";
  const res = spawnSync(editor, [filePath], { stdio: "inherit" });
  if (res.status !== 0) process.exit(res.status || 1);
}

async function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];
  const sub = argv[1];

  if (!command || command === "help" || command === "--help") return help();

  banner();
  const ok = await promptProceed();
  if (!ok) process.exit(1);

  try {
    if (command === "init") {
      const repoPath = argv[1];
      if (!repoPath) throw new Error("Usage: chasis init <repo-url|path> [--name <name>]");
      const result = initProject(repoPath, parseNameFlag(argv));
      process.stdout.write(
        `\nInitialized: ${result.name}\nRepo: ${result.targetDir}\nRuntime: ${result.runtime}\nNext: chasis start ${result.name}\n`
      );
      return;
    }
    if (command === "start") {
      const name = argv[1];
      if (!name) throw new Error("Usage: chasis start <name>");
      const state = startProject(name);
      process.stdout.write(`Started ${name} at http://localhost:${state.port}\n`);
      return;
    }
    if (command === "stop") {
      const name = argv[1];
      if (!name) throw new Error("Usage: chasis stop <name>");
      stopProject(name);
      process.stdout.write(`Stopped ${name}\n`);
      return;
    }
    if (command === "list") {
      const rows = listProjects();
      if (!rows.length) process.stdout.write("No CHASIS projects found.\n");
      else
        rows.forEach((s) =>
          process.stdout.write(`${s.name} (${s.runtime || "?"}) - ${s.status || "initialized"}${s.port ? ` :${s.port}` : ""}\n`)
        );
      return;
    }
    if (command === "logs") {
      if (!argv[1]) throw new Error("Usage: chasis logs <name>");
      logsProject(argv[1]);
      return;
    }
    if (command === "remove") {
      if (!argv[1]) throw new Error("Usage: chasis remove <name>");
      removeProject(argv[1]);
      process.stdout.write(`Removed ${argv[1]}; original repo preserved under ${REPOS_DIR}\n`);
      return;
    }
    if (command === "adaptor" && sub === "edit") {
      if (!argv[2]) throw new Error("Usage: chasis adaptor edit <name>");
      runEditor(path.join(ADAPTORS_DIR, `${argv[2]}.yaml`));
      return;
    }
    if (command === "surface" && sub === "open") {
      if (!argv[2]) throw new Error("Usage: chasis surface open <name>");
      process.stdout.write(`${openSurfaceUrl(argv[2], repoWithContainerByName(argv[2]))}\n`);
      return;
    }
    throw new Error(`Unknown command: ${argv.join(" ")}`);
  } catch (err) {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  }
}

main();
