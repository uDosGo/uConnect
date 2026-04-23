import { evalExpr, evalLetValue } from "./expr.js";
import { evaluateCondition } from "./cond.js";
import type { MdxUcodeHost, RunOptions, Stmt } from "./types.js";

const LAST = "__lastChoice";

function stringifyVarsForSession(vars: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(vars)) {
    if (k.startsWith("__")) continue;
    if (v === undefined || v === null) continue;
    out[k] = typeof v === "string" ? v : JSON.stringify(v);
  }
  return out;
}

function loadSessionIntoVars(
  vars: Record<string, unknown>,
  stored: Record<string, string>
): void {
  for (const [k, v] of Object.entries(stored)) {
    try {
      vars[k] = JSON.parse(v);
    } catch {
      vars[k] = v;
    }
  }
}

export async function runMdxUcode(
  stmts: Stmt[],
  host: MdxUcodeHost,
  options: RunOptions = {}
): Promise<void> {
  const vars: Record<string, unknown> = {};
  if (options.session) {
    loadSessionIntoVars(vars, options.session.load());
  }
  await runBlock(stmts, host, vars, options);
  if (options.session) {
    options.session.save(stringifyVarsForSession(vars));
  }
}

async function runBlock(
  stmts: Stmt[],
  host: MdxUcodeHost,
  vars: Record<string, unknown>,
  options: RunOptions
): Promise<void> {
  for (const s of stmts) {
    await runStmt(s, host, vars, options);
  }
}

async function runStmt(
  s: Stmt,
  host: MdxUcodeHost,
  vars: Record<string, unknown>,
  options: RunOptions
): Promise<void> {
  switch (s.kind) {
    case "print": {
      const text = evalExpr(s.expr, vars);
      await Promise.resolve(host.print(text));
      return;
    }
    case "input": {
      const answer = await host.input(s.prompt);
      vars[s.varName] = answer;
      return;
    }
    case "choice": {
      const picked = await host.choice(s.prompt, s.options);
      vars[LAST] = picked;
      return;
    }
    case "next":
      await Promise.resolve(host.navigate("next", s.target));
      return;
    case "back":
      await Promise.resolve(host.navigate("back", s.target));
      return;
    case "goto":
      await Promise.resolve(host.navigate("goto", s.target));
      return;
    case "show": {
      const visible = s.condition ? evaluateCondition(s.condition, vars) : true;
      await Promise.resolve(host.setVisibility(s.id, visible));
      return;
    }
    case "hide": {
      await Promise.resolve(host.setVisibility(s.id, false));
      return;
    }
    case "let": {
      vars[s.name] = evalLetValue(s.expr, vars);
      return;
    }
    case "quiz": {
      const labels = s.options.map((o) => o.label);
      const picked = await host.choice(s.question, labels);
      const chosen = s.options.find((o) => o.label === picked);
      vars.__quizLastCorrect = Boolean(chosen?.correct);
      if (s.feedback) {
        await Promise.resolve(host.quizFeedback(s.feedback));
      }
      return;
    }
    case "feedback": {
      await Promise.resolve(host.quizFeedback(s.text));
      return;
    }
    case "if": {
      const ok = evaluateCondition(s.cond, vars);
      if (ok) await runBlock(s.then, host, vars, options);
      else await runBlock(s.else, host, vars, options);
      return;
    }
    default: {
      const _exhaustive: never = s;
      throw new Error(`MDX uCode: unknown stmt ${String(_exhaustive)}`);
    }
  }
}
