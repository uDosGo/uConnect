"use strict";

const fs = require("node:fs");
const path = require("node:path");

function has(repoPath, name) {
  return fs.existsSync(path.join(repoPath, name));
}

function detectRuntime(repoPath) {
  if (has(repoPath, "package.json")) return "node";
  if (has(repoPath, "requirements.txt") || has(repoPath, "setup.py") || has(repoPath, "pyproject.toml")) {
    return "python";
  }
  if (has(repoPath, "index.html") || has(repoPath, "build") || has(repoPath, "dist")) return "static";
  return "unknown";
}

module.exports = { detectRuntime };
