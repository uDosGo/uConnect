import type { MdxUcodeSessionStore } from "./types.js";

/**
 * Browser-only session persistence for MDX uCode variables (no vault).
 * No-ops on the server / when localStorage is missing.
 */
export function createLocalStorageSession(storageKey: string): MdxUcodeSessionStore {
  return {
    load(): Record<string, string> {
      if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) return {};
      try {
        const raw = globalThis.localStorage.getItem(storageKey);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as unknown;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed as Record<string, string>;
        }
      } catch {
        /* ignore */
      }
      return {};
    },
    save(vars: Record<string, string>): void {
      if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) return;
      try {
        globalThis.localStorage.setItem(storageKey, JSON.stringify(vars));
      } catch {
        /* quota / private mode */
      }
    },
  };
}
