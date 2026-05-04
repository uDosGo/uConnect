/**
 * Minimal expression evaluation for PRINT / LET: literals, + concat, identifiers.
 */

function stripQuotes(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

function tokenizeConcat(expr: string): string[] {
  const parts: string[] = [];
  let cur = "";
  let i = 0;
  let inStr: '"' | "'" | null = null;
  while (i < expr.length) {
    const c = expr[i];
    if (inStr) {
      cur += c;
      if (c === inStr && expr[i - 1] !== "\\") inStr = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      inStr = c as '"' | "'";
      cur += c;
      i++;
      continue;
    }
    if (c === "+") {
      parts.push(cur.trim());
      cur = "";
      i++;
      continue;
    }
    cur += c;
    i++;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

export function evalExpr(expr: string, vars: Record<string, unknown>): string {
  const parts = tokenizeConcat(expr);
  let out = "";
  for (const p of parts) {
    const t = p.trim();
    if (!t) continue;
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
      out += stripQuotes(t);
    } else if (/^-?\d+(\.\d+)?$/.test(t)) {
      out += t;
    } else {
      const v = vars[t];
      if (v === undefined || v === null) out += "";
      else out += String(v);
    }
  }
  return out;
}

export function evalLetValue(expr: string, vars: Record<string, unknown>): unknown {
  const e = expr.trim();
  if ((e.startsWith('"') && e.endsWith('"')) || (e.startsWith("'") && e.endsWith("'"))) {
    return stripQuotes(e);
  }
  if (/^-?\d+$/.test(e)) return Number.parseInt(e, 10);
  if (/^-?\d+\.\d+$/.test(e)) return Number.parseFloat(e);
  if (e.toUpperCase() === "TRUE") return true;
  if (e.toUpperCase() === "FALSE") return false;
  if (vars[e] !== undefined) return vars[e];
  return evalExpr(e, vars);
}
