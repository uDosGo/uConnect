import { Command } from "commander";
import { VA1_HELP } from "./help-text.js";
import {
  cmdInit,
  cmdVaultInit,
  cmdList,
  cmdOpen,
  cmdEdit,
  cmdDelete,
  cmdRestore,
  cmdSearch,
} from "./actions/vault.js";
import { cmdMdFormat, cmdMdLint, cmdMdToc } from "./actions/markdown.js";
import { cmdFmAdd, cmdFmList, cmdFmEdit } from "./actions/frontmatter.js";
import { cmdTemplateList, cmdTemplateShow, cmdTemplateApply } from "./actions/templates.js";
import {
  cmdFeedList,
  cmdFeedView,
  cmdFeedExport,
  cmdFeedShow,
  cmdFeedEnable,
  cmdFeedDisable,
  cmdFeedTest,
} from "./actions/feed.js";
import {
  cmdSpoolList,
  cmdSpoolInfo,
  cmdSpoolExtract,
  cmdSpoolShow,
  cmdSpoolRun,
  cmdSpoolRunAll,
  cmdSpoolStatus,
} from "./actions/spool.js";
import {
  cmdPublishBuild,
  cmdPublishDeploy,
  cmdPublishPreview,
  cmdPublishStatus,
  cmdSyncStatus,
  cmdSyncPull,
  cmdSyncPush,
  cmdUsxdList,
  cmdUsxdApply,
  cmdUsxdShow,
} from "./actions/publish-sync-usxd.js";
import {
  cmdGuiBrowserOpen,
  cmdGuiDemos,
  cmdGuiLogs,
  cmdGuiOpen,
  cmdGuiStatus,
  cmdGuiStop,
  cmdUsxdEdit,
  runUsxdExpress,
} from "./actions/usxd-express-tool.js";
import {
  cmdVersion,
  cmdStatus,
  cmdDoctor,
  cmdCleanup,
  cmdClean,
  cmdTidy,
  cmdPing,
  cmdPong,
  cmdHealth,
  readPackageVersion,
} from "./actions/util.js";
import { getVaultRoot } from "./paths.js";
import { cmdTour } from "./actions/tour.js";
import { cmdUpdate, cmdUninstall } from "./actions/self-manage.js";
import { registerVibeCommand } from "./actions/vibe.js";
import { registerCodeCommands } from "./actions/code.js";
import { registerTestCommands } from "./actions/test.js";
import { registerCostCommands } from "./actions/cost.js";
import { registerConfigCommands } from "./actions/config.js";
import { registerBenchmarkCommands } from "./actions/benchmark.js";
import { registerSystemCheckCommands } from "./actions/doctor.js";
import { registerBackgroundCommands } from "./commands/background.js";
import { registerNetworkCommands } from "./commands/network.js";
import { registerPublishCommands } from "./commands/publish.js";
import { registerProcessCommands } from "./commands/process.js";
import { registerNetworkCommands } from "./commands/network.js";
import { cmdFontActivate, cmdFontInstall, cmdFontList, cmdFontPreview } from "./actions/font.js";
import {
  cmdServerConfigure,
  cmdServerLogs,
  cmdServerStart,
  cmdServerStatus,
  cmdServerStop,
} from "./actions/server.js";
import { cmdA2Configure, cmdA2Status } from "./actions/a2.js";
import { cmdBeaconScan } from "./actions/beacon.js";
import {
  cmdGitHubClone,
  cmdGitHubConfigure,
  cmdGitHubFork,
  cmdGitHubPull,
  cmdGitHubPush,
  cmdGitHubRelease,
  cmdGitHubStatus,
  cmdGitHubSync,
  cmdIssueCreate,
  cmdIssueList,
  cmdPrApprove,
  cmdPrCheckout,
  cmdPrCreate,
  cmdPrList,
  cmdPrReview,
  cmdPrMerge,
} from "./actions/github.js";
import {
  cmdWpPublish, 
  cmdWpReview, 
  cmdWpSync,
  cmdWpSubmit,
  cmdWpApprove,
  cmdWpSetup,
  cmdWpImport,
  cmdWpExport,
  cmdWpStatus,
  cmdWpApiTest,
  cmdWpApiPostsList,
  cmdWpSyncStatus
} from "./actions/wordpress.js";
import { cmdApprove, cmdReview, cmdSubmit } from "./actions/collab.js";
import {
  cmdGridEdit,
  cmdGridExport,
  cmdGridFlip,
  cmdGridLayerAdd,
  cmdGridLayerList,
  cmdGridLayerMerge,
  cmdGridLayerShow,
  cmdGridRender,
  cmdGridResize,
  cmdGridRotate,
  cmdGridValidate,
} from "./actions/grid.js";
import { cmdObfRender } from "./actions/obf-ui.js";
import { cmdAdaptorValidate } from "./actions/adaptor.js";
import { cmdAppLaunch, cmdAppList } from "./actions/uos-app.js";
import type { GridMode } from "@udos/obf-grid";

export async function main(argv: string[]): Promise<void> {
  const args = argv.slice(2);
  if (args.length === 0 || args[0] === "help") {
    console.log(VA1_HELP);
    return;
  }

  const program = new Command();
  program.name("udo").description("uDos VA1 — pure TypeScript CLI");
  program.version(await readPackageVersion(), "-V, --version");

  program.command("init").description("Initialize vault (full scaffold)").action(async () => cmdInit());
  const vaultCmd = program.command("vault").description("Vault layout and workspace scaffold");
  vaultCmd
    .command("init")
    .argument("[path]", "Vault root (default: UDOS_VAULT or ~/vault)")
    .description("Initialize vault — same layout as udo init, optional explicit path")
    .action(async (p: string | undefined) => cmdVaultInit(p));
  program.command("list").description("List vault contents").action(async () => cmdList());
  program.command("open").argument("<file>").description("Open in $EDITOR").action(async (f) => cmdOpen(f));
  program.command("edit").argument("<file>").description("Edit via editor").action(async (f) => cmdEdit(f));
  program.command("delete").argument("<file>").description("Move to .compost/").action(async (f) => cmdDelete(f));
  program.command("restore").argument("<id>").description("Restore from compost").action(async (id) => cmdRestore(id));
  program.command("search").argument("<query>").description("Search vault").action(async (q) => cmdSearch(q));

  const md = program.command("md").description("Markdown utilities");
  md.command("format").argument("<file>").action(async (f) => cmdMdFormat(f));
  md.command("lint").argument("<file>").action(async (f) => cmdMdLint(f));
  md.command("toc").argument("<file>").action(async (f) => cmdMdToc(f));

  const fm = program.command("fm").description("Frontmatter");
  fm.command("add")
    .argument("<file>")
    .requiredOption("--tag <tag>", "Tag to add")
    .action(async (f, o) => cmdFmAdd(f, o.tag));
  fm.command("list").argument("<file>").action(async (f) => cmdFmList(f));
  fm.command("edit").argument("<file>").action(async (f) => cmdFmEdit(f));

  const tpl = program.command("template").description("Templates");
  tpl.command("list").action(async () => cmdTemplateList());
  tpl.command("apply").argument("<name>").action(async (n) => cmdTemplateApply(n));
  tpl.command("show").argument("<name>").action(async (n) => cmdTemplateShow(n));

  const feed = program.command("feed").description("Feeds (read-only)");
  feed.command("list").action(async () => cmdFeedList());
  feed.command("view").argument("<name>").action(async (n) => cmdFeedView(n));
  feed.command("show").argument("<name>").action(async (n) => cmdFeedShow(n));
  feed.command("enable").argument("<name>").action(async (n) => cmdFeedEnable(n));
  feed.command("disable").argument("<name>").action(async (n) => cmdFeedDisable(n));
  feed
    .command("test")
    .argument("<name>")
    .option("--dry-run", "Inspect action only")
    .action(async (n, o: { dryRun?: boolean }) => cmdFeedTest(n, Boolean(o.dryRun)));
  feed
    .command("export")
    .argument("<name>")
    .option("--json", "Pretty JSON array")
    .action(async (n, o) => cmdFeedExport(n, Boolean(o.json)));

  const spool = program.command("spool").description("Spools");
  spool.command("list").action(async () => cmdSpoolList());
  spool.command("info").argument("<name>").action(async (n) => cmdSpoolInfo(n));
  spool.command("show").argument("<name>").action(async (n) => cmdSpoolShow(n));
  spool.command("extract").argument("<name>").action(async (n) => cmdSpoolExtract(n));
  spool
    .command("run")
    .argument("[name]")
    .option("--all", "Run all enabled spools")
    .option("--dry-run", "Show impact only")
    .action(async (name: string | undefined, o: { all?: boolean; dryRun?: boolean }) => {
      if (o.all) return cmdSpoolRunAll(Boolean(o.dryRun));
      if (!name) throw new Error("spool run requires <name> unless --all is used");
      return cmdSpoolRun(name, Boolean(o.dryRun));
    });
  spool.command("status").action(async () => cmdSpoolStatus());

  const trash = program.command("trash").description("Trash/composer operations");
  trash.command("move").argument("<file>").action(async (f) => {
    const t = await import("./actions/trash.js");
    return t.cmdTrashMove(getVaultRoot(), f);
  });
  trash
    .command("restore")
    .argument("<idOrPath>")
    .option("--to <path>", "Restore destination")
    .action(async (id: string, o: { to?: string }) => {
      const t = await import("./actions/trash.js");
      return t.cmdTrashRestore(getVaultRoot(), id, o.to);
    });
  trash.command("list").action(async () => {
    const t = await import("./actions/trash.js");
    return t.cmdTrashList(getVaultRoot());
  });
  trash.command("search").argument("<query>").action(async (q) => {
    const t = await import("./actions/trash.js");
    return t.cmdTrashSearch(getVaultRoot(), q);
  });
  trash
    .command("clean")
    .option("--older-than <d>", "Age cutoff, e.g. 30d")
    .option("--priority-binary", "Delete binary entries first")
    .option("--dry-run", "Show candidates only")
    .action(async (o: { olderThan?: string; priorityBinary?: boolean; dryRun?: boolean }) => {
      const t = await import("./actions/trash.js");
      return t.cmdTrashClean(getVaultRoot(), {
        olderThan: o.olderThan,
        priorityBinary: Boolean(o.priorityBinary),
        dryRun: Boolean(o.dryRun),
      });
    });

  const compost = program.command("compost").description("Compost index operations");
  const compostIndex = compost.command("index").description("Compost index");
  compostIndex.command("rebuild").action(async () => {
    const t = await import("./actions/trash.js");
    return t.cmdCompostIndexRebuild(getVaultRoot());
  });
  compostIndex.command("verify").action(async () => {
    const t = await import("./actions/trash.js");
    return t.cmdCompostIndexVerify(getVaultRoot());
  });
  compostIndex.command("stats").action(async () => {
    const t = await import("./actions/trash.js");
    return t.cmdCompostIndexStats(getVaultRoot());
  });

  const pub = program.command("publish").description("Publishing");
  pub.command("build").action(async () => cmdPublishBuild());
  pub.command("preview").action(async () => cmdPublishPreview());
  pub.command("status").action(async () => cmdPublishStatus());
  pub.command("deploy").description("Deploy built site to GitHub Pages (gh-pages)").action(async () => cmdPublishDeploy());

  const sync = program.command("sync").description("Cloud sync (stub)");
  sync.command("status").action(async () => cmdSyncStatus());
  sync.command("pull").action(async () => cmdSyncPull());
  sync.command("push").action(async () => cmdSyncPush());

  const github = program.command("github").description("GitHub-native vault + repo workflow");
  github.command("status").action(async () => cmdGitHubStatus());
  github.command("pull").action(async () => cmdGitHubPull());
  github
    .command("push")
    .option("-m, --message <msg>", "Commit message")
    .action(async (o: { message?: string }) => cmdGitHubPush(o.message));
  github
    .command("sync")
    .option("-m, --message <msg>", "Commit message")
    .action(async (o: { message?: string }) => cmdGitHubSync(o.message));
  github
    .command("clone")
    .argument("<repo>", "owner/repo or clone URL")
    .option("-d, --dir <path>", "Target directory (default: vault path)")
    .action(async (repo: string, o: { dir?: string }) => cmdGitHubClone(repo, o.dir));
  github
    .command("fork")
    .argument("[repo]", "owner/repo (default from github config)")
    .action(async (repo?: string) => cmdGitHubFork(repo));
  github
    .command("configure")
    .option("--username <u>", "GitHub username")
    .option("--repo <owner/repo>", "Default repo")
    .action(async (o: { username?: string; repo?: string }) => cmdGitHubConfigure(o.username, o.repo));
  github
    .command("release")
    .argument("<tag>", "Tag name")
    .option("--notes <notes>", "Release notes")
    .action(async (tag: string, o: { notes?: string }) => cmdGitHubRelease(tag, o.notes));

  const issue = program.command("issue").description("GitHub issues");
  issue
    .command("create")
    .requiredOption("--title <title>", "Issue title")
    .option("--body <body>", "Issue body")
    .action(async (o: { title: string; body?: string }) => cmdIssueCreate(o.title, o.body));
  issue.command("list").option("--limit <n>", "Limit", "20").action(async (o: { limit: string }) => cmdIssueList(parseInt(o.limit, 10) || 20));

  const pr = program.command("pr").description("GitHub pull requests");
  pr
    .command("create")
    .option("--title <title>")
    .option("--body <body>")
    .option("--base <branch>", "Base branch")
    .action(async (o: { title?: string; body?: string; base?: string }) => cmdPrCreate(o.title, o.body, o.base));
  pr.command("list").option("--limit <n>", "Limit", "20").action(async (o: { limit: string }) => cmdPrList(parseInt(o.limit, 10) || 20));
  pr.command("checkout").argument("<id>").action(async (id: string) => cmdPrCheckout(id));
  pr
    .command("review")
    .argument("<id>")
    .option("--body <text>", "Review comment body")
    .action(async (id: string, o: { body?: string }) => cmdPrReview(id, o.body));
  pr.command("approve").argument("<id>").action(async (id: string) => cmdPrApprove(id));
  pr.command("merge").argument("<id>").action(async (id: string) => cmdPrMerge(id));

  const wp = program.command("wp").description("WordPress docs/content workflow (A2 implementation)");
  
  // Main sync command (A2 implementation)
  wp.command("sync").description("Bidirectional synchronization (A2)").action(async () => cmdWpSync());
  
  // Sync subcommands
  const syncSub = wp.command("sync-sub");
  syncSub.command("status").description("Show sync status").action(async () => cmdWpSyncStatus());
  syncSub.command("run").action(async () => cmdWpSync()); // Alias for main sync
  
  // API commands
  const api = wp.command("api").description("WordPress API direct access");
  api.command("test").action(async () => cmdWpApiTest());
  api.command("posts").action(async () => cmdWpApiPostsList());
  
  // Other commands
  wp.command("publish").action(async () => cmdWpPublish());
  wp.command("review").action(async () => cmdWpReview());
  wp.command("submit").action(async () => cmdWpSubmit());
  wp.command("approve").action(async () => cmdWpApprove());
  wp.command("setup").action(async () => cmdWpSetup());
  
  // Import command with options
  wp.command("import")
    .description("Import WordPress posts to uDos")
    .option("--all", "Import all posts")
    .option("--category <category>", "Import posts from specific category")
    .option("--tag <tag>", "Import posts with specific tag")
    .option("--since <date>", "Import posts since date (YYYY-MM-DD)")
    .option("--limit <num>", "Limit number of posts to import", "10")
    .option("--include-media", "Include media attachments")
    .option("--dry-run", "Preview import without executing")
    .action(async (o: { all?: boolean; category?: string; tag?: string; since?: string; limit?: string; includeMedia?: boolean; dryRun?: boolean }) => {
      const { cmdWpImportWithOptions } = await import("./actions/wordpress.js");
      return cmdWpImportWithOptions({
        all: Boolean(o.all),
        category: o.category,
        tag: o.tag,
        since: o.since,
        limit: parseInt(o.limit || "10", 10),
        includeMedia: Boolean(o.includeMedia),
        dryRun: Boolean(o.dryRun)
      });
    });
  
  // Export command with options
  wp.command("export")
    .description("Export uDos notes to WordPress")
    .option("--all", "Export all notes")
    .option("--category <category>", "Export notes with specific category")
    .option("--tag <tag>", "Export notes with specific tag")
    .option("--since <date>", "Export notes since date (YYYY-MM-DD)")
    .option("--limit <num>", "Limit number of notes to export", "10")
    .option("--include-media", "Include media attachments")
    .option("--dry-run", "Preview export without executing")
    .action(async (o: { all?: boolean; category?: string; tag?: string; since?: string; limit?: string; includeMedia?: boolean; dryRun?: boolean }) => {
      const { cmdWpExportWithOptions } = await import("./actions/wordpress.js");
      return cmdWpExportWithOptions({
        all: Boolean(o.all),
        category: o.category,
        tag: o.tag,
        since: o.since,
        limit: parseInt(o.limit || "10", 10),
        includeMedia: Boolean(o.includeMedia),
        dryRun: Boolean(o.dryRun)
      });
    });
  
  wp.command("status").action(async () => cmdWpStatus());

  program
    .command("submit")
    .argument("[pathOrArea]", "Path used for auto-detection (code/docs)")
    .option("--target <t>", "code | docs")
    .action(async (p?: string, o?: { target?: string }) => cmdSubmit(p, o?.target));
  program
    .command("review")
    .argument("[pathOrArea]", "Path used for auto-detection (code/docs)")
    .option("--target <t>", "code | docs")
    .option("--pr <id>", "PR id for code reviews")
    .action(async (p?: string, o?: { target?: string; pr?: string }) => cmdReview(p, o?.target, o?.pr));
  program
    .command("approve")
    .argument("[pathOrArea]", "Path used for auto-detection (code/docs)")
    .option("--target <t>", "code | docs")
    .option("--pr <id>", "PR id for code approvals")
    .action(async (p?: string, o?: { target?: string; pr?: string }) => cmdApprove(p, o?.target, o?.pr));

  const workflow = program.command("workflow").description("A1 local workflow engine (SQLite) + A2 bridge stubs");
  workflow.command("list").action(async () => {
    const w = await import("./actions/workflow.js");
    return w.cmdWorkflowList();
  });
  workflow
    .command("create")
    .argument("<name>")
    .requiredOption("--step <action...>", "Step action(s), e.g. --step 'shell:echo hi' --step 'spool:create'")
    .action(async (name: string, o: { step: string[] }) => {
      const w = await import("./actions/workflow.js");
      return w.cmdWorkflowCreate(name, o.step);
    });
  workflow.command("run").argument("<name>").action(async (name: string) => {
    const w = await import("./actions/workflow.js");
    return w.cmdWorkflowRun(name);
  });
  workflow
    .command("schedule")
    .argument("<name>")
    .requiredOption("--cron <expr>", "Cron expression, e.g. '0 2 * * *'")
    .action(async (name: string, o: { cron: string }) => {
      const w = await import("./actions/workflow.js");
      return w.cmdWorkflowSchedule(name, o.cron);
    });
  workflow.command("status").argument("<name>").action(async (name: string) => {
    const w = await import("./actions/workflow.js");
    return w.cmdWorkflowStatus(name);
  });
  workflow.command("logs").argument("<name>").action(async (name: string) => {
    const w = await import("./actions/workflow.js");
    return w.cmdWorkflowLogs(name);
  });
  const workflowServer = workflow.command("server").description("A2 workflow server stubs");
  workflowServer.command("start").action(async () => {
    const w = await import("./actions/workflow.js");
    return w.cmdWorkflowServerStart();
  });
  workflowServer.command("status").action(async () => {
    const w = await import("./actions/workflow.js");
    return w.cmdWorkflowServerStatus();
  });
  const workflowWebhook = workflow.command("webhook").description("A2 webhook stubs");
  workflowWebhook
    .command("add")
    .argument("<name>")
    .requiredOption("--url <url>", "Webhook URL")
    .action(async (name: string, o: { url: string }) => {
      const w = await import("./actions/workflow.js");
      return w.cmdWorkflowWebhookAdd(name, o.url);
    });
  workflowWebhook.command("list").action(async () => {
    const w = await import("./actions/workflow.js");
    return w.cmdWorkflowWebhookList();
  });
  const workflowQueue = workflow.command("queue").description("A2 bridge queue");
  workflowQueue.command("list").action(async () => {
    const w = await import("./actions/workflow.js");
    return w.cmdWorkflowQueueList();
  });

  const a2 = program.command("a2").description("A2 bridge config");
  a2.command("status").action(async () => cmdA2Status());
  a2
    .command("configure")
    .requiredOption("--url <url>", "A2 base URL, e.g. https://api.example.com")
    .option("--api-key <key>", "Bearer API key")
    .action(async (o: { url: string; apiKey?: string }) => cmdA2Configure(o.url, o.apiKey));
  const a2Server = a2.command("server").description("A2 always-on server controls (A1 stubs)");
  a2Server.command("start").action(async () => cmdServerStart());
  a2Server.command("stop").action(async () => cmdServerStop());
  a2Server.command("status").action(async () => cmdServerStatus());
  a2Server.command("logs").action(async () => cmdServerLogs());
  a2Server
    .command("configure")
    .requiredOption("--port <port>", "Port number, e.g. 8080")
    .action(async (o: { port: string }) => cmdServerConfigure(parseInt(o.port, 10) || 8080));

  const beacon = program.command("beacon").description("Local network discovery stubs");
  beacon.command("scan").action(async () => cmdBeaconScan());

  // Register network commands
  registerNetworkCommands(program);

  // Register process commands
  registerProcessCommands(program);

  // Register network commands
  registerNetworkCommands(program);

  // Register publish commands (disabled - duplicate with publish command group above)
  // registerPublishCommands(program);

  // Register admin panel commands
  const { registerAdminPanelCommands } = await import("./commands/admin-panel.js");
  registerAdminPanelCommands(program);

  // Register shakedown commands
  const { registerShakedownCommands } = await import("./commands/shakedown.js");
  registerShakedownCommands(program);

  const usxd = program.command("usxd").description("USXD surfaces (themes + USXD-Express preview)");
  usxd.command("list").description("List theme packs in templates/usxd/").action(async () => cmdUsxdList());
  usxd.command("apply").argument("<name>").action(async (n) => cmdUsxdApply(n));
  usxd.command("show").action(async () => cmdUsxdShow());
  usxd
    .command("serve")
    .description("USXD-Express — preview markdown surfaces (live reload)")
    .option("-f, --file <file>", "Watch a single .md file")
    .option("-d, --dir <dir>", "Watch **/*.md under this directory")
    .option("-p, --port <port>", "HTTP port (or USXD_PORT)")
    .action(async (o: { file?: string; dir?: string; port?: string }) => {
      const args = ["serve"];
      if (o.file) args.push("--file", o.file);
      if (o.dir) args.push("--dir", o.dir);
      if (o.port) args.push("--port", o.port);
      await runUsxdExpress(args);
    });
  usxd
    .command("export")
    .description("USXD-Express — export surfaces to static HTML")
    .argument("[file]", "Markdown file (optional; same as --file)")
    .option("-f, --file <file>", "Single markdown file")
    .option("-d, --dir <dir>", "Directory of .md files", "./surfaces")
    .option("-o, --output <dir>", "Output directory", "./dist")
    .option("--format <format>", "Export format: html | svg", "html")
    .action(
      async (positional: string | undefined, o: { file?: string; dir?: string; output?: string; format?: string }) => {
      const file = positional ?? o.file;
      const args = ["export", "--output", o.output ?? "./dist"];
      if (o.format) args.push("--format", o.format);
      if (file) args.push("--file", file);
      else args.push("--dir", o.dir ?? "./surfaces");
      await runUsxdExpress(args);
      }
    );
  usxd
    .command("edit")
    .description("USXD-Express — open preview (prefers ~/vault/surfaces when present)")
    .argument("[file]", "Markdown file to watch")
    .action(async (f?: string) => cmdUsxdEdit(f));
  usxd
    .command("render")
    .description("USXD-Express — render markdown surface to terminal")
    .argument("<file>", "Path to .md")
    .option("--mode <m>", "teletext | mono | wireframe")
    .action(async (file: string, o: { mode?: string }) => {
      const args = ["render", file];
      if (o.mode) args.push("--mode", o.mode);
      await runUsxdExpress(args);
    });
  usxd
    .command("validate")
    .description("USXD-Express — validate ```usxd``` + optional ```grid``` in a markdown file")
    .argument("<file>", "Path to .md")
    .action(async (f: string) => {
      await runUsxdExpress(["validate", f]);
    });

  const gui = program.command("gui").description("Open browser GUI index (USXD-Express)");
  gui
    .option("-p, --port <port>", "HTTP port")
    .option("--no-open", "Disable startup browser-open prompt")
    .action(async (o: { port?: string; open?: boolean }) =>
      cmdGuiOpen({ port: o.port, noOpen: o.open === false })
    );
  gui
    .command("start")
    .description("Start GUI service in background (port-managed)")
    .option("-p, --port <port>", "Preferred HTTP port")
    .option("--no-open", "Do not open browser after start")
    .action(async (o: { port?: string; open?: boolean }) =>
      cmdGuiOpen({ port: o.port, noOpen: o.open === false })
    );
  gui
    .command("demos")
    .description("Start bundled demo surfaces GUI in background")
    .option("-p, --port <port>", "HTTP port")
    .option("--no-open", "Disable startup browser-open prompt")
    .action(async (o: { port?: string; open?: boolean }) =>
      cmdGuiDemos({ port: o.port, noOpen: o.open === false })
    );
  gui
    .command("index")
    .description("Alias: open browser GUI index")
    .option("-p, --port <port>", "HTTP port")
    .option("--no-open", "Disable startup browser-open prompt")
    .action(async (o: { port?: string; open?: boolean }) =>
      cmdGuiOpen({ port: o.port, noOpen: o.open === false })
    );
  gui.command("status").description("Show GUI service status").action(async () => cmdGuiStatus());
  gui.command("stop").description("Stop background GUI service").action(async () => cmdGuiStop());
  gui
    .command("logs")
    .description("Show GUI service logs")
    .option("-n, --lines <n>", "Tail lines", "80")
    .action(async (o: { lines: string }) => cmdGuiLogs(parseInt(o.lines, 10) || 80));
  gui.command("open").description("Open running GUI URL in browser").action(async () => cmdGuiBrowserOpen());

  const appCmd = program.command("app").description("External app launcher (uos OBX manifests; requires Go)");
  appCmd.command("list").description("List known app manifests").action(async () => cmdAppList());
  appCmd
    .command("launch")
    .description("Launch app (default: dry-run prints container invocation)")
    .argument("<app>", "Manifest name without .obx")
    .argument("[args...]", "Forwarded to manifest command")
    .option("--dry-run", "Print docker/podman invocation (default)")
    .option("--execute", "Run docker/podman (stdio inherited)")
    .option("--runtime <engine>", "docker or podman (overrides OBX; env UOS_RUNTIME)")
    .action(async (appName: string, forwarded: string[], o: { execute?: boolean; dryRun?: boolean; runtime?: string }) => {
      if (o.execute && o.dryRun) {
        console.error("Use only one of --dry-run or --execute.");
        process.exitCode = 1;
        return;
      }
      const rt = o.runtime?.trim();
      if (rt && rt !== "docker" && rt !== "podman") {
        console.error("--runtime must be docker or podman.");
        process.exitCode = 1;
        return;
      }
      await cmdAppLaunch(appName, forwarded, { execute: Boolean(o.execute), runtime: rt });
    });

  const adaptor = program.command("adaptor").description("Adaptor schema and tooling");
  adaptor
    .command("validate")
    .argument("<file>", "Adaptor YAML or JSON file")
    .description("Validate adaptor config against A2 baseline schema")
    .action(async (f: string) => cmdAdaptorValidate(f));

  const grid = program.command("grid").description("OBF grid — text surfaces (see docs/specs/obf-grid-spec.md)");
  grid
    .command("render")
    .argument("<file>", ".md / .grid with ```grid block")
    .option("--mode <m>", "teletext | mono | wireframe")
    .action(async (file: string, o: { mode?: string }) =>
      cmdGridRender(file, o.mode as GridMode | undefined)
    );
  grid
    .command("export")
    .argument("<file>")
    .requiredOption("--format <f>", "ascii | obf | svg | png")
    .option("-o, --output <path>")
    .action(async (file: string, o: { format: string; output?: string }) =>
      cmdGridExport(file, o.format, o.output)
    );
  grid.command("validate").argument("<file>").action(async (f) => cmdGridValidate(f));
  grid.command("edit").argument("<file>").action(async (f) => cmdGridEdit(f));
  grid
    .command("resize")
    .argument("<file>")
    .requiredOption("--size <size>", "New dimensions, e.g. 24x24")
    .action(async (file: string, o: { size: string }) => cmdGridResize(file, o.size));
  grid
    .command("rotate")
    .argument("<file>")
    .requiredOption("--degrees <deg>", "90 | 180 | 270")
    .action(async (file: string, o: { degrees: string }) => cmdGridRotate(file, o.degrees));
  grid
    .command("flip")
    .argument("<file>")
    .option("--horizontal", "Flip left/right")
    .option("--vertical", "Flip up/down (default)")
    .action(async (file: string, o: { horizontal?: boolean; vertical?: boolean }) =>
      cmdGridFlip(file, Boolean(o.horizontal) && !Boolean(o.vertical))
    );

  const layer = grid.command("layer").description("Layer operations (multiple ```grid blocks per file)");
  layer
    .command("add")
    .argument("<file>")
    .requiredOption("--name <name>", "Layer name")
    .action(async (file: string, o: { name: string }) => cmdGridLayerAdd(file, o.name));
  layer.command("list").argument("<file>").action(async (file: string) => cmdGridLayerList(file));
  layer
    .command("show")
    .argument("<file>")
    .requiredOption("--layer <index>", "Layer index (0-based)")
    .option("--mode <m>", "teletext | mono | wireframe")
    .action(async (file: string, o: { layer: string; mode?: string }) =>
      cmdGridLayerShow(file, parseInt(o.layer, 10), o.mode as GridMode | undefined)
    );
  layer
    .command("merge")
    .argument("<file>")
    .requiredOption("--layers <csv>", "Comma list, e.g. 0,1,2")
    .action(async (file: string, o: { layers: string }) => cmdGridLayerMerge(file, o.layers));

  const obf = program.command("obf").description("OBF UI blocks — markdown-first text components");
  obf
    .command("render")
    .argument("<file>", ".md / .obf containing ```obf blocks")
    .option("--format <format>", "terminal | html", "terminal")
    .action(async (file: string, o: { format?: string }) =>
      cmdObfRender(file, (o.format === "html" ? "html" : "terminal") as "terminal" | "html")
    );

  // SPATIAL ALGEBRA (v1.4)
  const cell = program.command("cell").description("Navigate voxel cells (spatial algebra v1.4)");
  cell
    .argument("<x>", "X coordinate")
    .argument("<y>", "Y coordinate")
    .argument("<z>", "Z coordinate (depth 0–5)")
    .action(async (x: string, y: string, z: string) => {
      const { cmdCellNavigate } = await import("./actions/spatial.js");
      await cmdCellNavigate(parseInt(x, 10), parseInt(y, 10), parseInt(z, 10));
    });

  const cube = program.command("cube").description("Render depth cubes (spatial algebra v1.4)");
  cube
    .argument("<x>", "X coordinate")
    .argument("<y>", "Y coordinate")
    .action(async (x: string, y: string) => {
      const { cmdCubeRender } = await import("./actions/spatial.js");
      await cmdCubeRender(parseInt(x, 10), parseInt(y, 10));
    });

  const surface = program.command("surface").description("Surface management (spatial algebra v1.4)");
  surface
    .command("create")
    .argument("<id>", "Surface ID")
    .option("--cubes <cubes>", "Comma-separated cube coordinates, e.g. 1,2,3,4")
    .action(async (id: string, o: { cubes?: string }) => {
      const { cmdSurfaceCreate } = await import("./actions/spatial.js");
      await cmdSurfaceCreate(id, o.cubes?.split(",").map(Number));
    });
  surface.command("list").action(async () => {
    const { cmdSurfaceList } = await import("./actions/spatial.js");
    await cmdSurfaceList();
  });
  surface.command("show").argument("<id>", "Surface ID").action(async (id: string) => {
    const { cmdSurfaceShow } = await import("./actions/spatial.js");
    await cmdSurfaceShow(id);
  });

  // TOWER OF KNOWLEDGE (v1.4)
  const tower = program.command("tower").description("Tower of Knowledge (slots 0–7)");
  tower.command("view").description("View all slots").action(async () => {
    const { cmdTowerView } = await import("./actions/tower.js");
    await cmdTowerView();
  });
  tower
    .command("list")
    .argument("<slot>", "Slot number (0–7)")
    .action(async (slot: string) => {
      const { cmdTowerList } = await import("./actions/tower.js");
      await cmdTowerList(parseInt(slot, 10));
    });
  tower
    .command("move")
    .argument("<surface>", "Surface ID")
    .requiredOption("--to <slot>", "Target slot (0–7)")
    .action(async (surface: string, o: { to: string }) => {
      const { cmdTowerMove } = await import("./actions/tower.js");
      await cmdTowerMove(surface, parseInt(o.to, 10));
    });
  tower
    .command("publish")
    .argument("<surface>", "Surface ID")
    .description("Publish to slot 5 (Global Knowledge Bank)")
    .action(async (surface: string) => {
      const { cmdTowerPublish } = await import("./actions/tower.js");
      await cmdTowerPublish(surface);
    });

  const font = program.command("font").description("Font bundles (stub — see docs/specs/font-system-obf.md)");
  font.command("install").argument("[bundle]", "e.g. retro").action(async (b) => cmdFontInstall(b ?? "retro"));
  font.command("list").action(async () => cmdFontList());
  font.command("activate").argument("<name>").action(async (n) => cmdFontActivate(n));
  font
    .command("preview")
    .argument("<name>")
    .description("Show cache path + sample strip (terminal)")
    .action(async (n) => cmdFontPreview(n));

  program.command("status").description("System status").action(async () => cmdStatus());
  program.command("doctor").description("Health checks").action(async () => cmdDoctor());
  program.command("cleanup").description("Remove cache").action(async () => cmdCleanup());
  program
    .command("clean")
    .description("Clean vault-local .local cache/tmp/logs")
    .option("--logs", "Also clean .local/logs")
    .option("--dry-run", "Show targets only")
    .action(async (o: { logs?: boolean; dryRun?: boolean }) => cmdClean({ logs: Boolean(o.logs), dryRun: Boolean(o.dryRun) }));
  program.command("tidy").description("List cwd entries sorted").action(async () => cmdTidy());
  program.command("ping").description("Respond with ping").action(async () => cmdPing());
  program.command("pong").description("Respond with pong").action(async () => cmdPong());
  program
    .command("health")
    .description("Health report (doctor alias)")
    .option("--quick", "Quick pass/fail")
    .action(async (o: { quick?: boolean }) => cmdHealth(Boolean(o.quick)));
  program.command("version").description("Show version").action(async () => cmdVersion());
  program
    .command("tour")
    .description("Interactive quickstart walkthrough")
    .action(async () => cmdTour());
  program.command("update").description("Rebuild core via sonic-express").action(async () => cmdUpdate());
  program
    .command("uninstall")
    .description("Remove global udo and optionally delete vault")
    .option("--yes", "Skip confirmation prompts")
    .option("--delete-vault", "Also delete the vault directory (destructive)")
    .action(async (o: { yes?: boolean; deleteVault?: boolean }) =>
      cmdUninstall({ yes: Boolean(o.yes), deleteVault: Boolean(o.deleteVault) })
    );
  program.command("help").description("Show help").action(() => console.log(VA1_HELP));

  // Register code commands
  registerCodeCommands(program);

  // Register test commands
  registerTestCommands(program);

  // Register cost commands
  registerCostCommands(program);

  // Register config commands
  registerConfigCommands(program);

  // Register benchmark commands
  registerBenchmarkCommands(program);

  // Register system check commands
  registerSystemCheckCommands(program);

  // Register background commands
  registerBackgroundCommands(program);

  // Register vibe command
  registerVibeCommand(program);

  await program.parseAsync(argv);
}
