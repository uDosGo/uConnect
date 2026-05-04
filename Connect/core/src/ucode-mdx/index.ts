/**
 * uCode for MDX — interactive documentation runtime (student-facing).
 * No filesystem, database, or cloud. Optional session strings via localStorage in browser.
 */

export type { MdxUcodeHost, MdxUcodeSessionStore, RunOptions, Stmt } from "./types.js";
export { parseMdxUcode } from "./parse.js";
export { runMdxUcode } from "./runtime.js";
export { evalExpr, evalLetValue } from "./expr.js";
export { evaluateCondition } from "./cond.js";
export { assertMdxSafeLine } from "./forbidden.js";
export { createLocalStorageSession } from "./session-store.js";

import { parseMdxUcode } from "./parse.js";
import { runMdxUcode } from "./runtime.js";
import type { MdxUcodeHost, RunOptions } from "./types.js";

/** Parse source, then run. */
export async function parseAndRunMdxUcode(
  source: string,
  host: MdxUcodeHost,
  options?: RunOptions
): Promise<void> {
  const stmts = parseMdxUcode(source);
  await runMdxUcode(stmts, host, options);
}
