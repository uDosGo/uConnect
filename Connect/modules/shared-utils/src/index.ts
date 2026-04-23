import type { SemverParts } from "@udos/shared-types";

/** Parse `v1.2.3` or `1.2.3` into major/minor/patch. */
export function parseSemver(version: string): SemverParts | null {
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version.trim());
  if (!m) return null;
  return {
    major: parseInt(m[1]!, 10),
    minor: parseInt(m[2]!, 10),
    patch: parseInt(m[3]!, 10),
  };
}
