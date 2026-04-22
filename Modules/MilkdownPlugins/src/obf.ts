export type ObfBlock = {
  raw: string;
  attributes: Record<string, string>;
};

const OBF_FENCE = /```obf([\s\S]*?)```/gm;

export function parseObfFences(markdown: string): ObfBlock[] {
  const blocks: ObfBlock[] = [];
  for (const match of markdown.matchAll(OBF_FENCE)) {
    const raw = (match[1] ?? "").trim();
    const attributes = parseHeader(raw.split("\n")[0] ?? "");
    blocks.push({ raw, attributes });
  }
  return blocks;
}

export function renderObfHtml(block: ObfBlock): string {
  const escaped = escapeHtml(block.raw);
  return `<section data-obf="true"><pre>${escaped}</pre></section>`;
}

function parseHeader(line: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const token of line.split(/\s+/)) {
    const [k, v] = token.split("=");
    if (!k || !v) continue;
    attrs[k] = v.replace(/^"|"$/g, "");
  }
  return attrs;
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
