"use strict";

const { DatabaseSync } = require("node:sqlite");
const { DB_PATH, STATE_DIR, ensureDir } = require("./utils.cjs");

function openDb() {
  ensureDir(STATE_DIR);
  const db = new DatabaseSync(DB_PATH);
  db.exec(`
CREATE TABLE IF NOT EXISTS repos (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE,
  url TEXT,
  local_path TEXT,
  runtime TEXT,
  cloned_at TEXT
);

CREATE TABLE IF NOT EXISTS containers (
  id TEXT PRIMARY KEY,
  repo_id TEXT,
  status TEXT,
  docker_id TEXT,
  port INTEGER,
  started_at TEXT
);

CREATE TABLE IF NOT EXISTS adaptors (
  repo_id TEXT PRIMARY KEY,
  adaptor_path TEXT,
  skin TEXT,
  lens_config TEXT,
  FOREIGN KEY (repo_id) REFERENCES repos(id)
);

CREATE TABLE IF NOT EXISTS downloads (
  url TEXT PRIMARY KEY,
  local_path TEXT,
  sha256 TEXT,
  downloaded_at TEXT
);
`);
  return db;
}

function repoByName(name) {
  const db = openDb();
  try {
    return db.prepare(`SELECT * FROM repos WHERE name = ?`).get(name);
  } finally {
    db.close();
  }
}

function upsertRepo(row) {
  const db = openDb();
  try {
    db.prepare(
      `INSERT INTO repos (id, name, url, local_path, runtime, cloned_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(name) DO UPDATE SET
         url=excluded.url,
         local_path=excluded.local_path,
         runtime=excluded.runtime`
    ).run(row.id, row.name, row.url, row.local_path, row.runtime, row.cloned_at);
  } finally {
    db.close();
  }
}

function upsertAdaptor(row) {
  const db = openDb();
  try {
    db.prepare(
      `INSERT INTO adaptors (repo_id, adaptor_path, skin, lens_config)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(repo_id) DO UPDATE SET
         adaptor_path=excluded.adaptor_path,
         skin=excluded.skin,
         lens_config=excluded.lens_config`
    ).run(row.repo_id, row.adaptor_path, row.skin, row.lens_config);
  } finally {
    db.close();
  }
}

function upsertContainer(row) {
  const db = openDb();
  try {
    db.prepare(
      `INSERT INTO containers (id, repo_id, status, docker_id, port, started_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         status=excluded.status,
         docker_id=excluded.docker_id,
         port=excluded.port,
         started_at=excluded.started_at`
    ).run(row.id, row.repo_id, row.status, row.docker_id, row.port, row.started_at);
  } finally {
    db.close();
  }
}

function listReposWithContainer() {
  const db = openDb();
  try {
    return db
      .prepare(
        `SELECT r.name, r.runtime, r.local_path, c.status, c.port
         FROM repos r
         LEFT JOIN containers c ON c.repo_id = r.id
         ORDER BY r.name`
      )
      .all();
  } finally {
    db.close();
  }
}

function repoWithContainerByName(name) {
  const db = openDb();
  try {
    return db
      .prepare(
        `SELECT r.id, r.name, r.runtime, r.local_path, c.status, c.port
         FROM repos r
         LEFT JOIN containers c ON c.repo_id = r.id
         WHERE r.name = ?`
      )
      .get(name);
  } finally {
    db.close();
  }
}

function removeRepoData(repoId) {
  const db = openDb();
  try {
    db.prepare(`DELETE FROM containers WHERE repo_id = ?`).run(repoId);
    db.prepare(`DELETE FROM adaptors WHERE repo_id = ?`).run(repoId);
    db.prepare(`DELETE FROM repos WHERE id = ?`).run(repoId);
  } finally {
    db.close();
  }
}

module.exports = {
  DB_PATH,
  repoByName,
  upsertRepo,
  upsertAdaptor,
  upsertContainer,
  listReposWithContainer,
  repoWithContainerByName,
  removeRepoData,
};
