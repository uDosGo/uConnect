const OBF_FENCE = /```obf([\s\S]*?)```/gm;
export function parseObfFences(markdown) {
    const blocks = [];
    for (const match of markdown.matchAll(OBF_FENCE)) {
        const raw = (match[1] ?? "").trim();
        const attributes = parseHeader(raw.split("\n")[0] ?? "");
        blocks.push({ raw, attributes });
    }
    return blocks;
}
export function renderObfHtml(block) {
    const escaped = escapeHtml(block.raw);
    return `<section data-obf="true"><pre>${escaped}</pre></section>`;
}
function parseHeader(line) {
    const attrs = {};
    for (const token of line.split(/\s+/)) {
        const [k, v] = token.split("=");
        if (!k || !v)
            continue;
        attrs[k] = v.replace(/^"|"$/g, "");
    }
    return attrs;
}
function escapeHtml(input) {
    return input
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}
