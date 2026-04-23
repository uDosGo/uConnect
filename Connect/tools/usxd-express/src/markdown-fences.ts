import { lexer } from "marked";
import type { Token, Tokens } from "marked";

function langOf(code: Tokens.Code): string {
  return (code.lang ?? "").trim().toLowerCase();
}

/** Fenced ```usxd blocks via Marked lexer (OBF markdown). */
export function extractUsxdFenceBodies(markdown: string): string[] {
  const tokens = lexer(markdown, { gfm: true }) as Token[];
  const bodies: string[] = [];
  for (const t of tokens) {
    if (t.type === "code") {
      const c = t as Tokens.Code;
      const lang = langOf(c);
      if (lang === "usxd" || lang.startsWith("usxd")) {
        bodies.push((c.text ?? "").trimEnd());
      }
    }
  }
  return bodies;
}

/** Rebuild first ```grid ... ``` fence as markdown for `@udos/obf-grid` (regex parser). */
export function firstGridFenceAsMarkdown(markdown: string): string | null {
  const tokens = lexer(markdown, { gfm: true }) as Token[];
  for (const t of tokens) {
    if (t.type === "code") {
      const c = t as Tokens.Code;
      const lang = langOf(c);
      if (lang === "grid" || lang.startsWith("grid")) {
        const header = (c.lang ?? "grid").trim();
        return `\`\`\`${header}\n${c.text ?? ""}\n\`\`\``;
      }
    }
  }
  return null;
}
