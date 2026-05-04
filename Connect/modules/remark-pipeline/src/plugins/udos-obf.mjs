import { visit } from "unist-util-visit";

export function remarkUdosObf() {
  return (tree) => {
    visit(tree, "code", (node) => {
      if (node.lang === "obf") {
        node.type = "obf-block";
        node.data = {
          ...(node.data || {}),
          udos: { kind: "obf", raw: node.value },
        };
      }
    });
  };
}
