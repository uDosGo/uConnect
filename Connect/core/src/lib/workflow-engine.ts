import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { getVaultRoot } from "../paths.js";
import { callA2, getA2Bridge } from "./a2-bridge.js";
import { appendWorkflowLog, ensureWorkflowSchema, withWorkflowDb } from "./workflow-db.js";

export type WorkflowRecord = {
  id: string;
  name: string;
  description: string;
  steps: string[];
  schedule?: string;
  enabled: number;
  created_at: number;
  updated_at: number;
};

function id(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function createWorkflow(name: string, steps: string[]): Promise<void> {
  await ensureWorkflowSchema();
  const now = Date.now();
  await withWorkflowDb((db) => {
    const wfId = id("wf");
    db.prepare(
      `INSERT INTO workflows (id, name, description, steps, schedule, enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(wfId, name, "", JSON.stringify(steps), null, 1, now, now);
    db.prepare(
      `INSERT INTO workflow_triggers (id, workflow_id, type, config)
       VALUES (?, ?, ?, ?)`
    ).run(id("trg"), wfId, "manual", "{}");
  });
  await appendWorkflowLog(`[workflow:create] name=${name} steps=${steps.length}`);
}

export async function listWorkflows(): Promise<WorkflowRecord[]> {
  await ensureWorkflowSchema();
  return withWorkflowDb((db) => {
    const rows = db.prepare(
      `SELECT id, name, description, steps, schedule, enabled, created_at, updated_at
       FROM workflows ORDER BY name ASC`
    ).all() as Array<Record<string, unknown>>;
    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      description: String(r.description ?? ""),
      steps: JSON.parse(String(r.steps ?? "[]")) as string[],
      schedule: r.schedule ? String(r.schedule) : undefined,
      enabled: Number(r.enabled ?? 1),
      created_at: Number(r.created_at ?? 0),
      updated_at: Number(r.updated_at ?? 0),
    }));
  });
}

export async function setWorkflowSchedule(name: string, cron: string): Promise<void> {
  await ensureWorkflowSchema();
  await withWorkflowDb((db) => {
    const now = Date.now();
    db.prepare(`UPDATE workflows SET schedule = ?, updated_at = ? WHERE name = ?`).run(cron, now, name);
    const wf = db.prepare(`SELECT id FROM workflows WHERE name = ?`).get(name) as
      | { id?: string }
      | undefined;
    if (wf?.id) {
      db.prepare(`INSERT INTO workflow_triggers (id, workflow_id, type, config) VALUES (?, ?, ?, ?)`)
        .run(id("trg"), wf.id, "schedule", JSON.stringify({ cron }));
    }
  });
  await appendWorkflowLog(`[workflow:schedule] name=${name} cron="${cron}"`);
}

function parseRemoteWorkflow(step: string): string | null {
  const m = /^remote\s*:\s*(.+)$/i.exec(step.trim());
  return m?.[1]?.trim() ?? null;
}

async function runStep(step: string): Promise<{ ok: boolean; output: string }> {
  const s = step.trim();
  const remoteName = parseRemoteWorkflow(s);
  if (remoteName) {
    const bridge = await getA2Bridge();
    if (bridge) {
      const result = await callA2("workflow/trigger", { workflow: remoteName });
      return { ok: true, output: `remote:${remoteName} ${JSON.stringify(result)}` };
    }
    return { ok: false, output: `remote workflow "${remoteName}" requested but A2 not configured` };
  }
  if (/^shell\s*:/i.test(s)) {
    const cmd = s.replace(/^shell\s*:/i, "").trim();
    const r = spawnSync(cmd, { shell: true, encoding: "utf8" });
    return {
      ok: (r.status ?? 1) === 0,
      output: (r.stdout ?? "") + (r.stderr ?? ""),
    };
  }
  if (/^feed\b/i.test(s)) return { ok: true, output: "feed processed (A1 stub)" };
  if (/^spool\b/i.test(s)) {
    const vault = getVaultRoot();
    const d = path.join(vault, "spool", "workflows");
    await fs.mkdir(d, { recursive: true });
    await fs.writeFile(path.join(d, `${Date.now()}.txt`), s + "\n", "utf8");
    return { ok: true, output: "spool item created" };
  }
  if (/^ucode\b/i.test(s)) return { ok: true, output: "uCode step queued (A1 stub)" };
  if (/^notify\b/i.test(s)) return { ok: true, output: "notify step queued (A1 stub)" };
  return { ok: true, output: `noop: ${s}` };
}

export async function runWorkflow(name: string): Promise<{ status: string; output: string[] }> {
  await ensureWorkflowSchema();
  const wf = await withWorkflowDb((db) =>
    db.prepare(`SELECT id, steps FROM workflows WHERE name = ?`).get(name) as
      | { id?: string; steps?: string }
      | undefined
  );
  if (!wf?.id) throw new Error(`Workflow not found: ${name}`);
  const steps = JSON.parse(String(wf.steps ?? "[]")) as string[];
  const runId = id("run");
  const started = Date.now();
  await withWorkflowDb((db) => {
    db.prepare(
      `INSERT INTO workflow_runs (id, workflow_id, status, started_at, completed_at, result, error)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(runId, wf.id, "running", started, null, null, null);
  });

  const output: string[] = [];
  let status = "success";
  let error = "";
  for (const step of steps) {
    try {
      const r = await runStep(step);
      output.push(`[step] ${step} -> ${r.output.trim()}`);
      if (!r.ok) {
        status = "failed";
        error = r.output;
        break;
      }
    } catch (e) {
      status = "failed";
      error = e instanceof Error ? e.message : String(e);
      output.push(`[step-error] ${step} -> ${error}`);
      break;
    }
  }

  const completed = Date.now();
  await withWorkflowDb((db) => {
    db.prepare(
      `UPDATE workflow_runs SET status = ?, completed_at = ?, result = ?, error = ? WHERE id = ?`
    ).run(status, completed, JSON.stringify(output), error || null, runId);
  });
  await appendWorkflowLog(`[workflow:run] name=${name} status=${status} run=${runId}`);
  return { status, output };
}

export async function workflowStatus(name: string): Promise<Record<string, unknown> | null> {
  await ensureWorkflowSchema();
  return withWorkflowDb((db) => {
    const row = db.prepare(
      `SELECT w.name as name, w.schedule as schedule, r.status as run_status, r.started_at as started_at, r.completed_at as completed_at
       FROM workflows w
       LEFT JOIN workflow_runs r ON r.workflow_id = w.id
       WHERE w.name = ?
       ORDER BY r.started_at DESC
       LIMIT 1`
    ).get(name) as Record<string, unknown> | undefined;
    return row ?? null;
  });
}

export async function workflowLogLines(name: string, limit = 30): Promise<string[]> {
  const file = path.join(os.homedir(), ".local", "share", "udos", "logs", "workflow.log");
  if (!(await fs.pathExists(file))) return [];
  const lines = (await fs.readFile(file, "utf8")).split(/\r?\n/).filter(Boolean);
  return lines.filter((l) => l.includes(`name=${name}`)).slice(-limit);
}
