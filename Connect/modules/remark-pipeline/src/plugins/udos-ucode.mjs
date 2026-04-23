import { visit } from "unist-util-visit";

/**
 * Marks ```ucode fences for MDX / interactive docs.
 * Runtime (student-facing, no FS): `@udos/core` → `dist/ucode-mdx/` (`parseMdxUcode`, `runMdxUcode`).
 * CLI / system uCode is a separate profile (Go `ucode-cli`).
 */
export function remarkUdosUcode() {
  return (tree) => {
    visit(tree, "code", (node) => {
      if (node.lang === "ucode") {
        node.type = "ucode-block";
        node.data = {
          ...(node.data || {}),
          udos: { kind: "ucode", raw: node.value },
        };
      }
    });
  };
}
