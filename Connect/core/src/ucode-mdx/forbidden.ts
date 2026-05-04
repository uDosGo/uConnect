/** Commands that must never appear in MDX uCode (system / CLI profile). */

const FORBIDDEN_LEADING = new Set([
  "LIST",
  "DELETE",
  "SYNC",
  "FEED",
  "SPOOL",
  "LOAD",
  "SAVE",
  "QUERY",
  "EXEC",
  "RUN", // shell-style RUN
]);

export function assertMdxSafeLine(line: string): void {
  const upper = line.trim().toUpperCase();
  const word = upper.split(/\s+/)[0];
  if (word && FORBIDDEN_LEADING.has(word)) {
    throw new Error(
      `MDX uCode: "${word}" is not allowed in interactive docs (system operations belong in CLI uCode).`
    );
  }
}
