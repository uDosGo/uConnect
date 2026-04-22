import { evalExpr } from "./expr.js";

const LAST = "__lastChoice";

export function evaluateCondition(cond: string, vars: Record<string, unknown>): boolean {
  const c = cond.trim();
  const up = c.toUpperCase();
  if (up === "YES" || up === "NO") {
    const last = String(vars[LAST] ?? "").toUpperCase();
    return last === up;
  }
  if (up === "TRUE") return true;
  if (up === "FALSE") return false;

  const eq = c.match(/^(\w+)\s*=\s*(.+)$/);
  if (eq) {
    const key = eq[1];
    let rhs = eq[2].trim();
    if ((rhs.startsWith('"') && rhs.endsWith('"')) || (rhs.startsWith("'") && rhs.endsWith("'"))) {
      rhs = rhs.slice(1, -1);
    }
    const left = vars[key];
    return String(left ?? "").toLowerCase() === rhs.toLowerCase();
  }

  const asExpr = evalExpr(c, vars);
  if (asExpr.toLowerCase() === "true") return true;
  if (asExpr.toLowerCase() === "false") return false;
  return Boolean(asExpr);
}
