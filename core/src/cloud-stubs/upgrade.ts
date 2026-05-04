const UNIVERSE_URL = "https://github.com/udos-universe/udos-universe";
const SPACE_URL = "https://udos.space";

export function upgradeMessage(feature: string): string {
  return [
    `${feature} is not implemented in uDos A1 wireframe core.`,
    "Cloud actions are WP-supported via the universal orchestrator (udos.space).",
    "A1 still supports local build + GitHub publishing workflows.",
    `Use uDos Universe (A2 self-host): ${UNIVERSE_URL}`,
    `or uDos.space (managed cloud): ${SPACE_URL}`,
  ].join("\n");
}
