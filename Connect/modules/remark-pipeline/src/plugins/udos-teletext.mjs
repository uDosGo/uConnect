import { visit } from "unist-util-visit";

function flattenText(tree) {
  const out = [];
  visit(tree, (node) => {
    if (node.type === "text") out.push(node.value);
    if (node.type === "heading") out.push("\n");
    if (node.type === "paragraph") out.push("\n");
  });
  return out.join(" ").replace(/\s+/g, " ").trim();
}

export function remarkUdosTeletext(options = { width: 40 }) {
  return (tree, file) => {
    const raw = flattenText(tree);
    const width = options.width || 40;
    const lines = [];
    for (let i = 0; i < raw.length; i += width) {
      lines.push(raw.slice(i, i + width));
    }
    file.data.teletext = lines.join("\n");
  };
}
