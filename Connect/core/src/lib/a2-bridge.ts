import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { ensureWorkflowSchema, withWorkflowDb } from "./workflow-db.js";

export interface A2Bridge {
  configured: boolean;
  baseUrl: string;
  apiKey?: string;
}

function a2ConfigPath(): string {
  return path.join(os.homedir(), ".config", "udos", "a2.yaml");
}

function parseSimpleYaml(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of source.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const m = /^([A-Za-z0-9_]+)\s*:\s*(.+)$/.exec(t);
    if (!m) continue;
    out[m[1]!.trim()] = m[2]!.trim().replace(/^['"]|['"]$/g, "");
  }
  return out;
}

export async function getA2Bridge(): Promise<A2Bridge | null> {
  const file = a2ConfigPath();
  if (!(await fs.pathExists(file))) return null;
  const raw = await fs.readFile(file, "utf8");
  const cfg = parseSimpleYaml(raw);
  const baseUrl = cfg["baseUrl"] ?? "";
  if (!baseUrl) return null;
  return {
    configured: true,
    baseUrl: baseUrl.replace(/\/+$/, ""),
    apiKey: cfg["apiKey"],
  };
}

export async function saveA2BridgeConfig(baseUrl: string, apiKey?: string): Promise<void> {
  const file = a2ConfigPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const lines = [
    "# uDos A2 bridge config",
    `baseUrl: "${baseUrl.replace(/\/+$/, "")}"`,
    apiKey ? `apiKey: "${apiKey}"` : "",
    "",
  ].filter(Boolean);
  await fs.writeFile(file, lines.join("\n"), "utf8");
}

export async function queueA2Request(endpoint: string, payload: unknown): Promise<void> {
  await ensureWorkflowSchema();
  await withWorkflowDb((db) => {
    const now = Date.now();
    const id = `q_${now}_${Math.random().toString(36).slice(2, 8)}`;
    db.prepare(
      `INSERT INTO workflow_queue (id, workflow_id, trigger_id, payload, status, queued_at, processed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, "a2-bridge", endpoint, JSON.stringify({ endpoint, payload }), "queued", now, null);
  });
}

export async function callA2(
  endpoint: string,
  payload: unknown,
  method: "POST" | "GET" = "POST"
): Promise<unknown> {
  const bridge = await getA2Bridge();
  if (!bridge) {
    throw new Error("A2 not configured. Run `udo a2 configure --url <url>`");
  }
  const url = `${bridge.baseUrl}/api/v1/${endpoint.replace(/^\/+/, "")}`;
  const r = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(bridge.apiKey ? { Authorization: `Bearer ${bridge.apiKey}` } : {}),
    },
    body: method === "POST" ? JSON.stringify(payload ?? {}) : undefined,
  });
  if (!r.ok) {
    throw new Error(`A2 call failed (${r.status}): ${url}`);
  }
  const text = await r.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
