"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const crypto = require("node:crypto");
const { detectRuntime } = require("./runtime-detector.cjs");
const { generateAdaptor } = require("./adaptor-generator.cjs");
const {
  DB_PATH,
  REPOS_DIR,
  ADAPTORS_DIR,
  CONTAINERS_DIR,
  DOWNLOADS_DIR,
  LENSES_DIR,
  ensureDir,
  getRuntimePort,
} = require("./utils.cjs");
const { repoByName, upsertRepo, upsertContainer, upsertAdaptor, listReposWithContainer, removeRepoData } = require("./db.cjs");

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (res.status !== 0) throw new Error(`Command failed: ${cmd} ${args.join(" ")}`);
}

function initProject(repoPath, nameOverride) {
  const name = nameOverride || path.basename(repoPath).replace(/\.git$/, "");
  if (repoByName(name)) {
    throw new Error(`CHASIS project already exists: ${name}`);
  }
  const targetDir = path.join(REPOS_DIR, name);
  ensureDir(REPOS_DIR);
  ensureDir(ADAPTORS_DIR);
  ensureDir(CONTAINERS_DIR);
  ensureDir(DOWNLOADS_DIR);
  ensureDir(LENSES_DIR);

  if (fs.existsSync(repoPath) && fs.lstatSync(repoPath).isDirectory()) run("cp", ["-R", repoPath, targetDir]);
  else run("git", ["clone", repoPath, targetDir]);

  const runtime = detectRuntime(targetDir);
  const repoId = crypto.randomUUID();
  const clonedAt = new Date().toISOString();
  generateAdaptor(name, targetDir, runtime);
  upsertRepo({ id: repoId, name, url: repoPath, local_path: targetDir, runtime, cloned_at: clonedAt });
  upsertAdaptor({
    repo_id: repoId,
    adaptor_path: path.join(ADAPTORS_DIR, `${name}.yaml`),
    skin: "default",
    lens_config: "",
  });
  upsertContainer({
    id: `ctr-${repoId}`,
    repo_id: repoId,
    status: "initialized",
    docker_id: "",
    port: null,
    started_at: null,
  });
  return { name, targetDir, runtime };
}

function startProject(name) {
  const state = repoByName(name);
  if (!state) throw new Error(`CHASIS not found: ${name}`);
  const adaptorDir = path.join(ADAPTORS_DIR, name);

  run("docker", ["build", "-t", `chasis-${name}`, adaptorDir]);
  const internalPort = getRuntimePort(state.runtime);
  const hostPort = Math.floor(3000 + Math.random() * 1000);
  run("docker", [
    "run",
    "-d",
    "--name",
    `chasis-${name}`,
    "-p",
    `${hostPort}:${internalPort}`,
    "-v",
    `${state.local_path}:/workspace:ro`,
    "-w",
    "/workspace",
    "-e",
    `UDOS_THEME=${process.env.UDOS_THEME || "default"}`,
    "-e",
    `UDOS_SKIN=${process.env.UDOS_SKIN || process.env.UDOS_THEME || "default"}`,
    "-e",
    `UDOS_LENS=${process.env.UDOS_LENS || ""}`,
    `chasis-${name}`,
  ]);

  upsertContainer({
    id: `ctr-${state.id}`,
    repo_id: state.id,
    status: "running",
    docker_id: `chasis-${name}`,
    port: hostPort,
    started_at: new Date().toISOString(),
  });
  return { ...state, port: hostPort };
}

function stopProject(name) {
  const state = repoByName(name);
  if (!state) throw new Error(`CHASIS not found: ${name}`);
  run("docker", ["stop", `chasis-${name}`]);
  run("docker", ["rm", `chasis-${name}`]);
  upsertContainer({
    id: `ctr-${state.id}`,
    repo_id: state.id,
    status: "stopped",
    docker_id: `chasis-${name}`,
    port: null,
    started_at: null,
  });
}

function listProjects() {
  return listReposWithContainer();
}

function logsProject(name) {
  run("docker", ["logs", `chasis-${name}`]);
}

function removeProject(name) {
  const repo = repoByName(name);
  if (!repo) throw new Error(`CHASIS not found: ${name}`);
  try {
    stopProject(name);
  } catch (_e) {}
  fs.rmSync(path.join(ADAPTORS_DIR, name), { recursive: true, force: true });
  fs.rmSync(path.join(CONTAINERS_DIR, name), { recursive: true, force: true });
  fs.rmSync(path.join(ADAPTORS_DIR, `${name}.yaml`), { force: true });
  removeRepoData(repo.id);
}

module.exports = {
  DB_PATH,
  REPOS_DIR,
  ADAPTORS_DIR,
  initProject,
  startProject,
  stopProject,
  listProjects,
  logsProject,
  removeProject,
};
