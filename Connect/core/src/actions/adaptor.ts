import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";
import YAML from "yaml";
import { udosConnectRoot } from "../paths.js";

type RuntimeType = "node" | "python" | "static" | "emulated";

type AdaptorDoc = {
  name?: unknown;
  version?: unknown;
  runtime?: {
    type?: unknown;
    port?: unknown;
    build?: unknown;
    start?: unknown;
  };
  integration?: {
    variables?: unknown;
    api?: unknown;
    events?: unknown;
  };
};

function schemaPath(): string {
  return path.join(udosConnectRoot(), "modules", "adaptors", "schema", "adaptor.schema.json");
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function validateAdaptor(doc: AdaptorDoc): string[] {
  const errors: string[] = [];
  if (!isObject(doc)) return ["Document must be an object"];
  if (typeof doc.name !== "string" || doc.name.trim().length === 0) errors.push("name must be a non-empty string");
  if (!Number.isInteger(doc.version) || Number(doc.version) < 1) errors.push("version must be an integer >= 1");
  if (!isObject(doc.runtime)) {
    errors.push("runtime must be an object");
  } else {
    const allowed: RuntimeType[] = ["node", "python", "static", "emulated"];
    if (!allowed.includes(doc.runtime.type as RuntimeType)) {
      errors.push(`runtime.type must be one of: ${allowed.join(", ")}`);
    }
    if (doc.runtime.port !== undefined && (!Number.isInteger(doc.runtime.port) || Number(doc.runtime.port) <= 0)) {
      errors.push("runtime.port must be a positive integer when provided");
    }
    if (doc.runtime.build !== undefined && typeof doc.runtime.build !== "string") {
      errors.push("runtime.build must be a string when provided");
    }
    if (doc.runtime.start !== undefined && typeof doc.runtime.start !== "string") {
      errors.push("runtime.start must be a string when provided");
    }
  }
  if (doc.integration !== undefined && !isObject(doc.integration)) {
    errors.push("integration must be an object when provided");
  } else if (isObject(doc.integration)) {
    if (doc.integration.variables !== undefined && !Array.isArray(doc.integration.variables)) {
      errors.push("integration.variables must be an array when provided");
    }
    if (doc.integration.api !== undefined && !Array.isArray(doc.integration.api)) {
      errors.push("integration.api must be an array when provided");
    }
    if (doc.integration.events !== undefined && !Array.isArray(doc.integration.events)) {
      errors.push("integration.events must be an array when provided");
    }
  }
  return errors;
}

function parseByExt(file: string, text: string): unknown {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".yaml" || ext === ".yml") return YAML.parse(text);
  return JSON.parse(text);
}

export async function cmdAdaptorValidate(file: string): Promise<void> {
  const abs = path.resolve(file);
  if (!(await fs.pathExists(abs))) {
    console.error(chalk.red(`Adaptor file not found: ${abs}`));
    process.exitCode = 1;
    return;
  }
  const text = await fs.readFile(abs, "utf8");
  let doc: unknown;
  try {
    doc = parseByExt(abs, text);
  } catch (e) {
    console.error(chalk.red(`Parse error: ${e instanceof Error ? e.message : String(e)}`));
    process.exitCode = 1;
    return;
  }

  const errors = validateAdaptor(doc as AdaptorDoc);
  if (errors.length > 0) {
    console.error(chalk.red(`Invalid adaptor config (${errors.length} error${errors.length === 1 ? "" : "s"}):`));
    for (const err of errors) console.error(`- ${err}`);
    process.exitCode = 1;
    return;
  }

  console.log(chalk.green("Adaptor config valid."));
  console.log(chalk.dim(`Schema reference: ${schemaPath()}`));
}
