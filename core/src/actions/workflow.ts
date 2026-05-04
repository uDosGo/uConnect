import chalk from "chalk";
import {
  createWorkflow,
  listWorkflows,
  runWorkflow,
  setWorkflowSchedule,
  workflowLogLines,
  workflowStatus,
} from "../lib/workflow-engine.js";
import { upgradeMessage } from "../cloud-stubs/upgrade.js";

export async function cmdWorkflowList(): Promise<void> {
  const rows = await listWorkflows();
  if (rows.length === 0) {
    console.log(chalk.dim("No workflows. Create one with: udo workflow create <name> --step 'shell:echo hi'"));
    return;
  }
  for (const r of rows) {
    console.log(
      `${r.name}\tsteps=${r.steps.length}\t${r.schedule ? `cron=${r.schedule}` : "manual"}\tenabled=${r.enabled}`
    );
  }
}

export async function cmdWorkflowCreate(name: string, steps: string[]): Promise<void> {
  if (steps.length === 0) {
    console.error(chalk.red("Provide at least one --step '<action>'"));
    process.exitCode = 1;
    return;
  }
  await createWorkflow(name, steps);
  console.log(chalk.green(`Created workflow "${name}" with ${steps.length} step(s)`));
}

export async function cmdWorkflowRun(name: string): Promise<void> {
  try {
    const r = await runWorkflow(name);
    console.log(chalk.green(`Workflow "${name}" ${r.status}`));
    r.output.forEach((l) => console.log(l));
  } catch (e) {
    console.error(chalk.red(e instanceof Error ? e.message : String(e)));
    process.exitCode = 1;
  }
}

export async function cmdWorkflowSchedule(name: string, cron: string): Promise<void> {
  await setWorkflowSchedule(name, cron);
  console.log(chalk.green(`Scheduled "${name}" cron="${cron}" (A1 local schedule metadata)`));
}

export async function cmdWorkflowStatus(name: string): Promise<void> {
  const s = await workflowStatus(name);
  if (!s) {
    console.log(chalk.dim(`Workflow not found: ${name}`));
    process.exitCode = 1;
    return;
  }
  console.log(s);
}

export async function cmdWorkflowLogs(name: string): Promise<void> {
  const lines = await workflowLogLines(name);
  if (lines.length === 0) {
    console.log(chalk.dim(`No logs for workflow: ${name}`));
    return;
  }
  lines.forEach((l) => console.log(l));
}

export async function cmdWorkflowServerStart(): Promise<void> {
  console.log(chalk.yellow(`[A2 stub] ${upgradeMessage("Workflow server start")}`));
}

export async function cmdWorkflowServerStatus(): Promise<void> {
  console.log(chalk.yellow(`[A2 stub] ${upgradeMessage("Workflow server status")}`));
}

export async function cmdWorkflowWebhookAdd(name: string, url: string): Promise<void> {
  void name;
  void url;
  console.log(chalk.yellow(`[A2 stub] ${upgradeMessage("Workflow webhook add")}`));
}

export async function cmdWorkflowWebhookList(): Promise<void> {
  console.log(chalk.yellow(`[A2 stub] ${upgradeMessage("Workflow webhook list")}`));
}

export async function cmdWorkflowQueueList(): Promise<void> {
  console.log(chalk.yellow(`[A2 stub] ${upgradeMessage("Workflow queue")}`));
}
