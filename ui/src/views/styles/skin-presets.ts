export type UvSkinId = "default" | "terminal" | "nord" | "amber";

export interface UvSkinPreset {
  id: UvSkinId;
  label: string;
  cssVars: Record<string, string>;
}

export const UV_SKIN_PRESETS: UvSkinPreset[] = [
  {
    id: "default",
    label: "Default",
    cssVars: {
      "--uv-bg": "#161618",
      "--uv-surface": "#1e1e22",
      "--uv-border": "#2e2e34",
      "--uv-text": "#e8e8ec",
      "--uv-muted": "#9898a4",
      "--uv-accent": "#5b8cff",
      "--uv-danger": "#e85d5d",
      "--uv-success": "#4caf7a",
      "--uv-warning": "#e6a23c",
    },
  },
  {
    id: "terminal",
    label: "Terminal Green",
    cssVars: {
      "--uv-bg": "#000000",
      "--uv-surface": "#0c130c",
      "--uv-border": "#1b2c1b",
      "--uv-text": "#00ff8a",
      "--uv-muted": "#67b88c",
      "--uv-accent": "#00ff8a",
      "--uv-danger": "#ff4d4d",
      "--uv-success": "#00ff8a",
      "--uv-warning": "#ffd84d",
    },
  },
  {
    id: "nord",
    label: "Nord",
    cssVars: {
      "--uv-bg": "#2e3440",
      "--uv-surface": "#3b4252",
      "--uv-border": "#4c566a",
      "--uv-text": "#eceff4",
      "--uv-muted": "#d8dee9",
      "--uv-accent": "#88c0d0",
      "--uv-danger": "#bf616a",
      "--uv-success": "#a3be8c",
      "--uv-warning": "#ebcb8b",
    },
  },
  {
    id: "amber",
    label: "Amber Mono",
    cssVars: {
      "--uv-bg": "#130e05",
      "--uv-surface": "#1f1608",
      "--uv-border": "#3a2b13",
      "--uv-text": "#ffd18a",
      "--uv-muted": "#ccab74",
      "--uv-accent": "#ffbf4d",
      "--uv-danger": "#ff6e5e",
      "--uv-success": "#8bd17c",
      "--uv-warning": "#ffd18a",
    },
  },
];

export function skinVarsFor(skin: UvSkinId): Record<string, string> {
  return UV_SKIN_PRESETS.find((x) => x.id === skin)?.cssVars ?? {};
}
