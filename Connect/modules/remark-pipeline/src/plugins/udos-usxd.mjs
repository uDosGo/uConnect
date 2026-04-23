import { visit } from "unist-util-visit";

export function remarkUdosUsxd() {
  return (tree) => {
    visit(tree, "code", (node) => {
      if (node.lang === "usxd") {
        node.type = "usxd-surface";
        node.data = {
          ...(node.data || {}),
          udos: { kind: "usxd", raw: node.value },
        };
      }
    });
  };
}
