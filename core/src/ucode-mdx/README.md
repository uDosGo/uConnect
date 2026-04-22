# uCode for MDX (interactive documentation)

TypeScript runtime under **`@udos/core`** after `npm run build` → `dist/ucode-mdx/`.

- **Parse:** `parseMdxUcode(source)` → statement tree.
- **Run:** `runMdxUcode(stmts, host, options?)` or `parseAndRunMdxUcode(source, host, options?)`.
- **Session (browser only):** `createLocalStorageSession("udos:mdx-ucode:…")` passed as `options.session`.

Instruction set: `PRINT`, `INPUT`, `CHOICE`, `IF` / `ELSE` / `END IF`, `NEXT`, `BACK`, `GOTO`, `SHOW` / `HIDE`, `LET`, `QUIZ` / `OPTION` / `FEEDBACK`. System verbs (`LIST`, `DELETE`, `SYNC`, …) are rejected at parse time.
