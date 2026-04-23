"use strict";

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const STATE_DIR = path.join(os.homedir(), ".local", "share", "chasis");
const DB_PATH = path.join(STATE_DIR, "chasis.db");
const REPOS_DIR = path.join(STATE_DIR, "repos");
const ADAPTORS_DIR = path.join(STATE_DIR, "adaptors");
const CONTAINERS_DIR = path.join(STATE_DIR, "containers");
const DOWNLOADS_DIR = path.join(STATE_DIR, "downloads");
const LENSES_DIR = path.join(STATE_DIR, "lenses");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function projectStatePath(name) {
  return path.join(STATE_DIR, name, "state.json");
}

function loadState(name) {
  const p = projectStatePath(name);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function saveState(name, state) {
  const dir = path.dirname(projectStatePath(name));
  ensureDir(dir);
  fs.writeFileSync(projectStatePath(name), JSON.stringify(state, null, 2));
}

function getRuntimePort(runtime) {
  const ports = { node: 3000, python: 8000, static: 8080, emulated: 8080 };
  return ports[runtime] || 8080;
}

module.exports = {
  STATE_DIR,
  DB_PATH,
  REPOS_DIR,
  ADAPTORS_DIR,
  CONTAINERS_DIR,
  DOWNLOADS_DIR,
  LENSES_DIR,
  ensureDir,
  loadState,
  saveState,
  getRuntimePort,
};
