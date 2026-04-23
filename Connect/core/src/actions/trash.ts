import fs from "fs-extra";
import path from "node:path";
import crypto from "node:crypto";
import chalk from "chalk";
import { DatabaseSync } from "node:sqlite";

type TrashType = "deleted" | "version" | "import";

type TrashRow = {
  id: string;
  original_path: string;
  compost_path: string;
  timestamp: string;
  type: TrashType;
  size: number | null;
  hash: string | null;
  is_binary: number;
  restored_at: string | null;
  deleted_at: string | null;
};

const BINARY_EXT = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".mp3",
  ".wav",
  ".m4a",
  ".zip",
  ".tar",
  ".gz",
]);

function trashRoot(vaultRoot: string): string {
  return path.join(vaultRoot, ".compost");
}

function indexPath(vaultRoot: string): string {
  return path.join(trashRoot(vaultRoot), "index.db");
}

function objectsDir(vaultRoot: string): string {
  return path.join(trashRoot(vaultRoot), "objects");
}

function versionsDir(vaultRoot: string): string {
  return path.join(trashRoot(vaultRoot), "versions");
}

function importsDir(vaultRoot: string): string {
  return path.join(trashRoot(vaultRoot), "imports");
}

function nowIso(): string {
  return new Date().toISOString();
}

function isBinaryFile(relPath: string): number {
  const ext = path.extname(relPath).toLowerCase();
  return BINARY_EXT.has(ext) ? 1 : 0;
}

function openDb(vaultRoot: string): DatabaseSync {
  return new DatabaseSync(indexPath(vaultRoot));
}

function ensureSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS compost_entries (
      id TEXT PRIMARY KEY,
      original_path TEXT NOT NULL,
      compost_path TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      type TEXT NOT NULL,
      size INTEGER,
      hash TEXT,
      is_binary INTEGER DEFAULT 0,
      restored_at TEXT,
      deleted_at TEXT
    );
    CREATE TABLE IF NOT EXISTS version_chain (
      file_path TEXT NOT NULL,
      version_timestamp TEXT NOT NULL,
      compost_id TEXT NOT NULL,
      is_current INTEGER DEFAULT 0,
      PRIMARY KEY (file_path, version_timestamp)
    );
    CREATE TABLE IF NOT EXISTS import_records (
      original_file TEXT NOT NULL,
      converted_to TEXT NOT NULL,
      compost_id TEXT NOT NULL,
      imported_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_original_path ON compost_entries(original_path);
    CREATE INDEX IF NOT EXISTS idx_timestamp ON compost_entries(timestamp);
    CREATE INDEX IF NOT EXISTS idx_is_binary ON compost_entries(is_binary);
  `);
}

async function fileHash(absPath: string): Promise<string> {
  const buf = await fs.readFile(absPath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function generateId(relPath: string): string {
  const nonce = crypto.randomBytes(4).toString("hex");
  return `${Date.now().toString(36)}-${nonce}-${path.basename(relPath)}`;
}

export async function ensureTrashStorage(vaultRoot: string): Promise<void> {
  await fs.mkdir(objectsDir(vaultRoot), { recursive: true });
  await fs.mkdir(versionsDir(vaultRoot), { recursive: true });
  await fs.mkdir(importsDir(vaultRoot), { recursive: true });
  const db = openDb(vaultRoot);
  try {
    ensureSchema(db);
  } finally {
    db.close();
  }
}

export async function trashMove(vaultRoot: string, relPath: string, type: TrashType = "deleted"): Promise<string> {
  await ensureTrashStorage(vaultRoot);
  const abs = path.join(vaultRoot, relPath);
  if (!(await fs.pathExists(abs))) throw new Error(`Not found: ${relPath}`);
  const id = generateId(relPath);
  const targetDir = type === "version" ? versionsDir(vaultRoot) : type === "import" ? importsDir(vaultRoot) : objectsDir(vaultRoot);
  const relCompostPath = path.join(path.basename(targetDir), id);
  const dest = path.join(targetDir, id);
  const st = await fs.stat(abs);
  const hash = st.isFile() ? await fileHash(abs) : null;
  await fs.move(abs, dest, { overwrite: false });
  const db = openDb(vaultRoot);
  try {
    ensureSchema(db);
    db.prepare(
      `INSERT INTO compost_entries (id, original_path, compost_path, timestamp, type, size, hash, is_binary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, relPath, relCompostPath, nowIso(), type, st.size, hash, isBinaryFile(relPath));
  } finally {
    db.close();
  }
  return id;
}

export async function trashRestore(vaultRoot: string, idOrPath: string, destRel?: string): Promise<string> {
  await ensureTrashStorage(vaultRoot);
  const db = openDb(vaultRoot);
  let row: TrashRow | null = null;
  try {
    ensureSchema(db);
    row =
      (db.prepare(`SELECT * FROM compost_entries WHERE id = ? LIMIT 1`).get(idOrPath) as TrashRow | undefined) ??
      (db
        .prepare(
          `SELECT * FROM compost_entries
           WHERE original_path = ? AND restored_at IS NULL
           ORDER BY timestamp DESC LIMIT 1`
        )
        .get(idOrPath) as TrashRow | undefined) ??
      null;
    if (!row) throw new Error(`Unknown trash id/path: ${idOrPath}`);
    const src = path.join(trashRoot(vaultRoot), row.compost_path);
    if (!(await fs.pathExists(src))) throw new Error(`Missing trash object: ${row.compost_path}`);
    const outRel = destRel && destRel.length > 0 ? destRel : row.original_path;
    const outAbs = path.join(vaultRoot, outRel);
    await fs.ensureDir(path.dirname(outAbs));
    await fs.move(src, outAbs, { overwrite: true });
    db.prepare(`UPDATE compost_entries SET restored_at = ? WHERE id = ?`).run(nowIso(), row.id);
    return outRel;
  } finally {
    db.close();
  }
}

export async function trashList(vaultRoot: string, limit = 50): Promise<TrashRow[]> {
  await ensureTrashStorage(vaultRoot);
  const db = openDb(vaultRoot);
  try {
    ensureSchema(db);
    return db
      .prepare(`SELECT * FROM compost_entries ORDER BY timestamp DESC LIMIT ?`)
      .all(limit) as TrashRow[];
  } finally {
    db.close();
  }
}

export async function trashSearch(vaultRoot: string, query: string, limit = 50): Promise<TrashRow[]> {
  await ensureTrashStorage(vaultRoot);
  const db = openDb(vaultRoot);
  try {
    ensureSchema(db);
    const q = `%${query}%`;
    return db
      .prepare(
        `SELECT * FROM compost_entries
         WHERE id LIKE ? OR original_path LIKE ? OR compost_path LIKE ?
         ORDER BY timestamp DESC LIMIT ?`
      )
      .all(q, q, q, limit) as TrashRow[];
  } finally {
    db.close();
  }
}

function parseOlderThan(raw: string | undefined): number {
  if (!raw) return 30;
  const m = raw.trim().match(/^(\d+)\s*d$/i);
  if (!m) return 30;
  return Math.max(0, parseInt(m[1]!, 10));
}

export async function trashClean(
  vaultRoot: string,
  opts: { olderThan?: string; priorityBinary?: boolean; dryRun?: boolean }
): Promise<{ removed: number; bytes: number; candidates: TrashRow[] }> {
  await ensureTrashStorage(vaultRoot);
  const days = parseOlderThan(opts.olderThan);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const db = openDb(vaultRoot);
  try {
    ensureSchema(db);
    let rows = db
      .prepare(`SELECT * FROM compost_entries WHERE restored_at IS NULL ORDER BY timestamp ASC`)
      .all() as TrashRow[];
    rows = rows.filter((r) => Date.parse(r.timestamp) <= cutoff);
    if (opts.priorityBinary) rows.sort((a, b) => b.is_binary - a.is_binary || (b.size ?? 0) - (a.size ?? 0));
    let removed = 0;
    let bytes = 0;
    for (const r of rows) {
      const abs = path.join(trashRoot(vaultRoot), r.compost_path);
      if (!(await fs.pathExists(abs))) continue;
      if (!opts.dryRun) {
        await fs.remove(abs);
        db.prepare(`UPDATE compost_entries SET deleted_at = ? WHERE id = ?`).run(nowIso(), r.id);
      }
      removed++;
      bytes += r.size ?? 0;
    }
    return { removed, bytes, candidates: rows };
  } finally {
    db.close();
  }
}

export async function trashIndexRebuild(vaultRoot: string): Promise<{ inserted: number }> {
  await ensureTrashStorage(vaultRoot);
  const entries: Array<{ type: TrashType; relDir: string; absDir: string }> = [
    { type: "deleted", relDir: "objects", absDir: objectsDir(vaultRoot) },
    { type: "version", relDir: "versions", absDir: versionsDir(vaultRoot) },
    { type: "import", relDir: "imports", absDir: importsDir(vaultRoot) },
  ];
  const db = openDb(vaultRoot);
  let inserted = 0;
  try {
    ensureSchema(db);
    for (const e of entries) {
      const files = await fs.readdir(e.absDir).catch(() => []);
      for (const id of files) {
        const exists = db.prepare(`SELECT 1 FROM compost_entries WHERE id = ? LIMIT 1`).get(id);
        if (exists) continue;
        const abs = path.join(e.absDir, id);
        const st = await fs.stat(abs).catch(() => null);
        if (!st) continue;
        const inferredOriginal = id.replace(/^[^-]+-[^-]+-/, "");
        const relCompost = path.join(e.relDir, id);
        db.prepare(
          `INSERT INTO compost_entries (id, original_path, compost_path, timestamp, type, size, hash, is_binary)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(id, inferredOriginal, relCompost, nowIso(), e.type, st.size, null, isBinaryFile(inferredOriginal));
        inserted++;
      }
    }
  } finally {
    db.close();
  }
  return { inserted };
}

export async function trashIndexVerify(vaultRoot: string): Promise<{ ok: boolean; missingFiles: number }> {
  await ensureTrashStorage(vaultRoot);
  const db = openDb(vaultRoot);
  try {
    ensureSchema(db);
    const rows = db.prepare(`SELECT compost_path FROM compost_entries WHERE deleted_at IS NULL`).all() as Array<{ compost_path: string }>;
    let missingFiles = 0;
    for (const r of rows) {
      const abs = path.join(trashRoot(vaultRoot), r.compost_path);
      if (!(await fs.pathExists(abs))) missingFiles++;
    }
    return { ok: missingFiles === 0, missingFiles };
  } finally {
    db.close();
  }
}

export async function trashIndexStats(vaultRoot: string): Promise<{
  total: number;
  active: number;
  binary: number;
  totalBytes: number;
}> {
  await ensureTrashStorage(vaultRoot);
  const db = openDb(vaultRoot);
  try {
    ensureSchema(db);
    const total = (db.prepare(`SELECT COUNT(*) AS n FROM compost_entries`).get() as { n: number }).n;
    const active = (db
      .prepare(`SELECT COUNT(*) AS n FROM compost_entries WHERE restored_at IS NULL AND deleted_at IS NULL`)
      .get() as { n: number }).n;
    const binary = (db
      .prepare(`SELECT COUNT(*) AS n FROM compost_entries WHERE is_binary = 1 AND restored_at IS NULL AND deleted_at IS NULL`)
      .get() as { n: number }).n;
    const totalBytes = (db
      .prepare(`SELECT COALESCE(SUM(size), 0) AS n FROM compost_entries WHERE restored_at IS NULL AND deleted_at IS NULL`)
      .get() as { n: number }).n;
    return { total, active, binary, totalBytes };
  } finally {
    db.close();
  }
}

export async function cmdTrashMove(vaultRoot: string, relPath: string): Promise<void> {
  const id = await trashMove(vaultRoot, relPath, "deleted");
  console.log(chalk.green(`Moved to trash: ${id}`));
}

export async function cmdTrashRestore(vaultRoot: string, idOrPath: string, dest?: string): Promise<void> {
  const out = await trashRestore(vaultRoot, idOrPath, dest);
  console.log(chalk.green(`Restored to: ${out}`));
}

export async function cmdTrashList(vaultRoot: string): Promise<void> {
  const rows = await trashList(vaultRoot, 200);
  if (rows.length === 0) {
    console.log(chalk.dim("Trash is empty."));
    return;
  }
  for (const r of rows) {
    console.log(`${r.id}\t${r.type}\t${r.original_path}\t${r.timestamp}`);
  }
}

export async function cmdTrashSearch(vaultRoot: string, q: string): Promise<void> {
  const rows = await trashSearch(vaultRoot, q, 200);
  if (rows.length === 0) {
    console.log(chalk.dim("No trash matches."));
    return;
  }
  for (const r of rows) {
    console.log(`${r.id}\t${r.original_path}\t${r.timestamp}`);
  }
}

export async function cmdTrashClean(
  vaultRoot: string,
  opts: { olderThan?: string; priorityBinary?: boolean; dryRun?: boolean }
): Promise<void> {
  const res = await trashClean(vaultRoot, opts);
  const mode = opts.dryRun ? "dry-run" : "clean";
  console.log({ mode, removed: res.removed, bytes: res.bytes });
}

export async function cmdCompostIndexRebuild(vaultRoot: string): Promise<void> {
  const res = await trashIndexRebuild(vaultRoot);
  console.log(chalk.green(`Index rebuilt, inserted rows: ${res.inserted}`));
}

export async function cmdCompostIndexVerify(vaultRoot: string): Promise<void> {
  const res = await trashIndexVerify(vaultRoot);
  if (res.ok) console.log(chalk.green("Compost index OK"));
  else {
    console.log(chalk.yellow(`Compost index mismatch: missing files = ${res.missingFiles}`));
    process.exitCode = 1;
  }
}

export async function cmdCompostIndexStats(vaultRoot: string): Promise<void> {
  console.log(await trashIndexStats(vaultRoot));
}
