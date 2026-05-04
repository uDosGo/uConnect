import { assertMdxSafeLine } from "./forbidden.js";
import type { Stmt } from "./types.js";

function normalizeSource(src: string): string[] {
  return src.split(/\r?\n/).map((l) => l.replace(/\t/g, "  "));
}

function parseChoiceOptions(rest: string): string[] {
  const opts: string[] = [];
  let i = 0;
  while (i < rest.length) {
    while (i < rest.length && /\s/.test(rest[i])) i++;
    if (i >= rest.length) break;
    if (rest[i] === '"') {
      let j = i + 1;
      while (j < rest.length && rest[j] !== '"') j++;
      opts.push(rest.slice(i + 1, j));
      i = j + 1;
    } else {
      let j = i;
      while (j < rest.length && !/\s/.test(rest[j])) j++;
      opts.push(rest.slice(i, j));
      i = j;
    }
  }
  return opts.filter(Boolean);
}

function parseSingle(line: string): Stmt {
  const t = line.trim();
  const up = t.toUpperCase();

  const printM = /^PRINT\s+(.+)$/i.exec(t);
  if (printM) return { kind: "print", expr: printM[1].trim() };

  const inputM = /^INPUT\s+"([^"]*)"\s+(\w+)$/i.exec(t);
  if (inputM) return { kind: "input", prompt: inputM[1], varName: inputM[2] };

  const choiceM = /^CHOICE\s+"([^"]*)"\s+(.+)$/i.exec(t);
  if (choiceM) {
    return {
      kind: "choice",
      prompt: choiceM[1],
      options: parseChoiceOptions(choiceM[2]),
    };
  }

  const nextM = /^NEXT\s+"([^"]+)"$/i.exec(t);
  if (nextM) return { kind: "next", target: nextM[1] };

  const backM = /^BACK\s+"([^"]+)"$/i.exec(t);
  if (backM) return { kind: "back", target: backM[1] };

  const gotoM = /^GOTO\s+"([^"]+)"$/i.exec(t);
  if (gotoM) return { kind: "goto", target: gotoM[1] };
  const gotoBare = /^GOTO\s+(\w+)$/i.exec(t);
  if (gotoBare) return { kind: "goto", target: gotoBare[1] };

  const showM = /^SHOW\s+"([^"]+)"(?:\s+IF\s+(.+))?$/i.exec(t);
  if (showM) return { kind: "show", id: showM[1], condition: showM[2]?.trim() };

  const hideM = /^HIDE\s+"([^"]+)"(?:\s+DEFAULT)?$/i.exec(t);
  if (hideM) return { kind: "hide", id: hideM[1], defaultHidden: /\bDEFAULT\b/i.test(t) };

  const letM = /^LET\s+(\w+)\s*=\s*(.+)$/i.exec(t);
  if (letM) return { kind: "let", name: letM[1], expr: letM[2].trim() };

  const fbM = /^FEEDBACK\s+"([^"]*)"$/i.exec(t);
  if (fbM) return { kind: "feedback", text: fbM[1] };

  throw new Error(`MDX uCode: unrecognized statement: ${t.slice(0, 80)}`);
}

function parseStatements(lines: string[], start: number): { stmts: Stmt[]; i: number } {
  const stmts: Stmt[] = [];
  let i = start;
  while (i < lines.length) {
    const raw = lines[i];
    assertMdxSafeLine(raw);
    const line = raw.trim();
    if (!line || line.startsWith("//")) {
      i++;
      continue;
    }
    const up = line.toUpperCase();
    if (up === "ELSE" || up === "END IF") return { stmts, i };

    if (up.startsWith("IF ") && up.endsWith(" THEN")) {
      const cond = line.slice(3, -5).trim();
      i++;
      const thenPart = parseStatements(lines, i);
      i = thenPart.i;
      let elseStmts: Stmt[] = [];
      if (i < lines.length && lines[i].trim().toUpperCase() === "ELSE") {
        i++;
        const elsePart = parseStatements(lines, i);
        elseStmts = elsePart.stmts;
        i = elsePart.i;
      }
      if (i >= lines.length || lines[i].trim().toUpperCase() !== "END IF") {
        throw new Error("MDX uCode: expected END IF");
      }
      i++;
      stmts.push({ kind: "if", cond, then: thenPart.stmts, else: elseStmts });
      continue;
    }

    if (up.startsWith("QUIZ ")) {
      const q = /^QUIZ\s+"([^"]*)"$/i.exec(line);
      if (!q) throw new Error("MDX uCode: invalid QUIZ line");
      const options: { label: string; correct: boolean }[] = [];
      i++;
      while (i < lines.length) {
        const inner = lines[i].trim();
        if (!inner || inner.startsWith("//")) {
          i++;
          continue;
        }
        if (inner.toUpperCase().startsWith("FEEDBACK ")) break;
        const om = /^OPTION\s+"([^"]*)"\s+(TRUE|FALSE)$/i.exec(inner);
        if (!om) throw new Error(`MDX uCode: expected OPTION or FEEDBACK, got: ${inner}`);
        options.push({ label: om[1], correct: om[2].toUpperCase() === "TRUE" });
        i++;
      }
      let feedback: string | undefined;
      if (i < lines.length) {
        const fbLine = lines[i].trim();
        const fbm = /^FEEDBACK\s+"([^"]*)"$/i.exec(fbLine);
        if (fbm) {
          feedback = fbm[1];
          i++;
        }
      }
      stmts.push({ kind: "quiz", question: q[1], options, feedback });
      continue;
    }

    if (up.startsWith("OPTION ")) {
      throw new Error("MDX uCode: OPTION must follow QUIZ");
    }

    stmts.push(parseSingle(line));
    i++;
  }
  return { stmts, i };
}

export function parseMdxUcode(source: string): Stmt[] {
  const lines = normalizeSource(source);
  const { stmts } = parseStatements(lines, 0);
  return stmts;
}
