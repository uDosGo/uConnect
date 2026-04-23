import fs from "fs-extra";
import os from "node:os";
import path from "node:path";

type DbLike = {
  exec(sql: string): void;
  prepare(sql: string): {
    run: (...args: unknown[]) => unknown;
    all: (...args: unknown[]) => unknown[];
    get: (...args: unknown[]) => unknown;
  };
};

function workflowDbPath(): string {
  return path.join(os.homedir(), ".local", "share", "udos", "workflow.db");
}

export function workflowLogPath(): string {
  return path.join(os.homedir(), ".local", "share", "udos", "logs", "workflow.log");
}

export async function appendWorkflowLog(line: string): Promise<void> {
  const log = workflowLogPath();
  await fs.mkdir(path.dirname(log), { recursive: true });
  await fs.appendFile(log, `${new Date().toISOString()} ${line}\n`, "utf8");
}

export async function withWorkflowDb<T>(fn: (db: DbLike) => T): Promise<T> {
  const dbFile = workflowDbPath();
  await fs.mkdir(path.dirname(dbFile), { recursive: true });
  const mod = (await import("node:sqlite")) as unknown as {
    DatabaseSync: new (file: string) => DbLike;
  };
  const db = new mod.DatabaseSync(dbFile);
  try {
    return fn(db);
  } finally {
    const c = db as unknown as { close?: () => void };
    c.close?.();
  }
}

export async function ensureWorkflowSchema(): Promise<void> {
  await withWorkflowDb((db) => {
    db.exec(`
CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE,
  description TEXT,
  steps JSON,
  schedule TEXT,
  enabled BOOLEAN DEFAULT 1,
  created_at INTEGER,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id TEXT PRIMARY KEY,
  workflow_id TEXT,
  status TEXT,
  started_at INTEGER,
  completed_at INTEGER,
  result JSON,
  error TEXT,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);

CREATE TABLE IF NOT EXISTS workflow_triggers (
  id TEXT PRIMARY KEY,
  workflow_id TEXT,
  type TEXT,
  config JSON,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);

CREATE TABLE IF NOT EXISTS workflow_queue (
  id TEXT PRIMARY KEY,
  workflow_id TEXT,
  trigger_id TEXT,
  payload JSON,
  status TEXT,
  queued_at INTEGER,
  processed_at INTEGER,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);

CREATE TABLE IF NOT EXISTS remote_workflows (
  id TEXT PRIMARY KEY,
  name TEXT,
  remote_url TEXT,
  last_sync INTEGER,
  enabled BOOLEAN DEFAULT 0
);
`);
  });
}
