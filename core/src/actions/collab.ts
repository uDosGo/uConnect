import { cmdPrApprove, cmdPrCreate, cmdPrReview } from "./github.js";
import { cmdWpApprove, cmdWpReview, cmdWpSubmit } from "./wordpress.js";

type Track = "code" | "docs";

function detectTrack(input?: string, override?: string): Track {
  if (override === "code" || override === "docs") return override;
  const p = (input ?? "").replace(/\\/g, "/").toLowerCase();
  if (
    p.startsWith("docs/") ||
    p.startsWith("courses/") ||
    p.startsWith("templates/") ||
    p.includes("/vault/content/") ||
    p.includes("content/")
  ) {
    return "docs";
  }
  return "code";
}

export async function cmdSubmit(pathOrArea?: string, target?: string): Promise<void> {
  const track = detectTrack(pathOrArea, target);
  if (track === "code") {
    await cmdPrCreate();
    return;
  }
  await cmdWpSubmit();
}

export async function cmdReview(pathOrArea?: string, target?: string, prId?: string): Promise<void> {
  const track = detectTrack(pathOrArea, target);
  if (track === "code") {
    if (!prId) {
      throw new Error("Code review requires --pr <id>.");
    }
    await cmdPrReview(prId);
    return;
  }
  await cmdWpReview();
}

export async function cmdApprove(pathOrArea?: string, target?: string, prId?: string): Promise<void> {
  const track = detectTrack(pathOrArea, target);
  if (track === "code") {
    if (!prId) {
      throw new Error("Code approve requires --pr <id>.");
    }
    await cmdPrApprove(prId);
    return;
  }
  await cmdWpApprove();
}
