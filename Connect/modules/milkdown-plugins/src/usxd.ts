export type UsxdSurface = {
  title: string;
  body: string;
};

const USXD_FENCE = /```usxd([\s\S]*?)```/gm;

export function parseUsxdFences(markdown: string): UsxdSurface[] {
  const surfaces: UsxdSurface[] = [];
  for (const match of markdown.matchAll(USXD_FENCE)) {
    const body = (match[1] ?? "").trim();
    const firstLine = body.split("\n")[0] ?? "surface";
    surfaces.push({
      title: firstLine.replace(/^#\s*/, "").trim() || "surface",
      body,
    });
  }
  return surfaces;
}

export function renderUsxdHtml(surface: UsxdSurface): string {
  return `<article data-usxd="true"><h3>${escapeHtml(surface.title)}</h3><pre>${escapeHtml(
    surface.body
  )}</pre></article>`;
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
