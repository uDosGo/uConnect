#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${repo_root}"

echo "[drift] checking npm workspace resolution"
npm run --silent workspaces:check

echo "[drift] checking code-workspace folders and paths"
node <<'EOF'
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = process.cwd();
const workspacePath = path.join(repoRoot, "uDos.code-workspace");
const requiredFolders = [
  ".",
  "core",
  "core-rs",
  "ui",
  "tools",
  "modules",
  "dev",
  "templates",
  "launcher",
  "seed",
  "docs",
  "courses",
  "scripts",
];

const workspace = JSON.parse(fs.readFileSync(workspacePath, "utf8"));
const folders = Array.isArray(workspace.folders) ? workspace.folders : [];
const paths = folders.map((f) => f.path).filter((p) => typeof p === "string");

const missing = requiredFolders.filter((folder) => !paths.includes(folder));
if (missing.length) {
  throw new Error(`workspace missing required folders: ${missing.join(", ")}`);
}

const blockedAbsolutePrefixes = ["/Users/", "/home/", "C:\\\\Users\\\\"];
const absoluteCustom = paths.filter((p) =>
  blockedAbsolutePrefixes.some((prefix) => p.startsWith(prefix))
);
if (absoluteCustom.length) {
  throw new Error(
    `workspace has machine-specific absolute paths: ${absoluteCustom.join(", ")}`
  );
}

const unresolved = paths
  .filter((p) => p !== ".")
  .filter((p) => !fs.existsSync(path.join(repoRoot, p)));
if (unresolved.length) {
  throw new Error(`workspace contains missing paths: ${unresolved.join(", ")}`);
}

console.log("[drift] workspace checks OK");
EOF

echo "[drift] all checks passed"
