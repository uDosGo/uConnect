export interface VaultEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export interface JekyllExportOpts {
  layout?: string;
  permalinkBase?: string;
}

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function toJekyllMarkdown(entry: VaultEntry, opts: JekyllExportOpts = {}): string {
  const layout = opts.layout ?? "post";
  const slug = sanitizeSlug(entry.title) || entry.id;
  const permalinkBase = opts.permalinkBase ?? "/vault";
  const permalink = `${permalinkBase}/${slug}/`;
  const tags = entry.tags.map((tag) => `"${tag}"`).join(", ");

  return [
    "---",
    `layout: ${layout}`,
    `title: "${entry.title.replace(/"/g, '\\"')}"`,
    `date: ${entry.updatedAt}`,
    `permalink: ${permalink}`,
    `tags: [${tags}]`,
    "---",
    "",
    entry.content,
    "",
  ].join("\n");
}

