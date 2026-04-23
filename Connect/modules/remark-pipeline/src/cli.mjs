import fs from "node:fs";
import path from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkLint from "remark-lint";
import remarkNoDeadUrls from "remark-lint-no-dead-urls";
import remarkToc from "remark-toc";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";
import { reporter } from "vfile-reporter";
import { parse as parseYaml } from "yaml";
import { remarkUdosObf } from "./plugins/udos-obf.mjs";
import { remarkUdosUsxd } from "./plugins/udos-usxd.mjs";
import { remarkUdosUcode } from "./plugins/udos-ucode.mjs";
import { remarkUdosTeletext } from "./plugins/udos-teletext.mjs";

const [, , cmd, ...args] = process.argv;

function arg(name, fallback = null) {
  const idx = args.indexOf(name);
  if (idx === -1 || idx + 1 >= args.length) return fallback;
  return args[idx + 1];
}

function has(name) {
  return args.includes(name);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
}

function baseRemark() {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter)
    .use(remarkUdosObf)
    .use(remarkUdosUsxd)
    .use(remarkUdosUcode);
}

async function run() {
  if (!cmd) throw new Error("missing command");
  const file = args[0];
  if (["format", "lint", "toc", "render", "frontmatter", "check"].includes(cmd) && !file) {
    throw new Error("missing file path");
  }

  if (cmd === "format") {
    const input = read(file);
    const out = String(
      await baseRemark().use(remarkStringify, { bullet: "-", fences: true }).process(input)
    );
    write(file, out);
    console.log(`formatted ${file}`);
    return;
  }

  if (cmd === "lint") {
    const input = read(file);
    const v = await baseRemark().use(remarkLint).use(remarkNoDeadUrls).process(input);
    const report = reporter(v);
    if (report) console.log(report);
    return;
  }

  if (cmd === "toc") {
    const input = read(file);
    const out = String(
      await baseRemark().use(remarkToc, { heading: "toc|table[ -]of[ -]contents?" }).use(remarkStringify).process(input)
    );
    console.log(out);
    return;
  }

  if (cmd === "render") {
    const input = read(file);
    const fmt = arg("--format", "html");
    const output = arg("--output");
    const terminal = has("--terminal");
    if (fmt === "teletext") {
      const vf = await baseRemark().use(remarkUdosTeletext, { width: 40 }).process(input);
      const tele = vf.data.teletext || "";
      if (output) write(output, tele);
      if (terminal || !output) console.log(tele);
      return;
    }
    const html = String(
      await baseRemark().use(remarkRehype).use(rehypeHighlight).use(rehypeStringify).process(input)
    );
    if (output) write(output, html);
    if (terminal || !output) console.log(html);
    return;
  }

  if (cmd === "frontmatter") {
    const input = read(file);
    const m = input.match(/^---\n([\s\S]*?)\n---/);
    if (!m) {
      console.log("{}");
      return;
    }
    const data = parseYaml(m[1]) || {};
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (cmd === "check") {
    const input = read(file);
    const links = [...input.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((m) => m[1]);
    const baseDir = path.dirname(path.resolve(file));
    let failed = 0;
    for (const l of links) {
      if (l.startsWith("http://") || l.startsWith("https://") || l.startsWith("#")) continue;
      const p = path.resolve(baseDir, l);
      if (!fs.existsSync(p)) {
        failed += 1;
        console.log(`missing link target: ${l}`);
      }
    }
    if (failed > 0) process.exitCode = 1;
    return;
  }

  throw new Error(`unknown command: ${cmd}`);
}

run().catch((err) => {
  console.error(`remark-pipeline error: ${err.message}`);
  process.exit(1);
});
