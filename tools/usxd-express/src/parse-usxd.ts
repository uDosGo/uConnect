import type { ParsedUsxd, UsxdControl } from "./types.js";
import { extractUsxdFenceBodies } from "./markdown-fences.js";

export { extractUsxdFenceBodies };

function parseSurfaceLine(line: string): { name: string; version?: string } {
  const nameM = /name\s*=\s*"([^"]+)"/i.exec(line);
  const verM = /version\s*=\s*"([^"]+)"/i.exec(line);
  return {
    name: nameM?.[1]?.trim() ?? "surface",
    version: verM?.[1]?.trim(),
  };
}

function trimQuotes(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

/**
 * Parse USXD block text (inside ```usxd fence, without fences).
 * Line-oriented: SURFACE, STYLE / REGIONS / CONTROLS sections.
 */
export function parseUsxdBlock(body: string): ParsedUsxd | null {
  const lines = body.split(/\r?\n/);
  if (lines.length === 0) return null;

  let name = "surface";
  let version: string | undefined;
  const style: Record<string, string> = {};
  const regions: Record<string, string> = {};
  const controls: UsxdControl[] = [];

  let section: "none" | "style" | "regions" | "controls" = "none";

  const first = lines[0]!.trim();
  if (/^SURFACE\b/i.test(first)) {
    const s = parseSurfaceLine(first);
    name = s.name;
    version = s.version;
  }

  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i]!;
    const line = raw.trim();
    if (!line) continue;

    const sec = line.toUpperCase();
    if (sec === "STYLE") {
      section = "style";
      continue;
    }
    if (sec === "REGIONS") {
      section = "regions";
      continue;
    }
    if (sec === "CONTROLS") {
      section = "controls";
      continue;
    }

    if (section === "style") {
      const kv = /^([^:]+):\s*(.+)$/.exec(line);
      if (kv) {
        style[kv[1]!.trim().toLowerCase()] = trimQuotes(kv[2]!);
      }
      continue;
    }

    if (section === "regions") {
      const kv = /^([^:]+):\s*(.+)$/.exec(line);
      if (kv) {
        regions[kv[1]!.trim().toLowerCase()] = trimQuotes(kv[2]!);
      }
      continue;
    }

    if (section === "controls") {
      const ctl = /^(.+?):\s*(.+)$/.exec(line);
      if (ctl) {
        controls.push({ keys: ctl[1]!.trim(), action: ctl[2]!.trim() });
      }
    }
  }

  return { name, version, style, regions, controls };
}

export function parseAllUsxdFromMarkdown(markdown: string): ParsedUsxd[] {
  const bodies = extractUsxdFenceBodies(markdown);
  const out: ParsedUsxd[] = [];
  for (const b of bodies) {
    const p = parseUsxdBlock(b);
    if (p) out.push(p);
  }
  return out;
}
