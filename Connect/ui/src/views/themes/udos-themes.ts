export type UdosThemeId =
  | "github-dark"
  | "github-light"
  | "nes"
  | "bedstead"
  | "c64";

export interface UdosThemePreset {
  id: UdosThemeId;
  label: string;
  cssVars: Record<string, string>;
}

// Theme presets map external style inspiration to unified USXD tokens.
export const UDOS_THEME_PRESETS: UdosThemePreset[] = [
  {
    id: "github-dark",
    label: "GitHub Dark",
    cssVars: {
      "--uv-bg": "#0d1117",
      "--uv-surface": "#161b22",
      "--uv-border": "#30363d",
      "--uv-text": "#c9d1d9",
      "--uv-muted": "#8b949e",
      "--uv-accent": "#2f81f7",
      "--uv-success": "#238636",
      "--uv-warning": "#d29922",
      "--uv-danger": "#da3633",
    },
  },
  {
    id: "github-light",
    label: "GitHub Light",
    cssVars: {
      "--uv-bg": "#ffffff",
      "--uv-surface": "#f6f8fa",
      "--uv-border": "#d0d7de",
      "--uv-text": "#1f2328",
      "--uv-muted": "#57606a",
      "--uv-accent": "#0969da",
      "--uv-success": "#1a7f37",
      "--uv-warning": "#9a6700",
      "--uv-danger": "#cf222e",
    },
  },
  {
    id: "nes",
    label: "NES.css",
    cssVars: {
      "--uv-bg": "#f7f7f7",
      "--uv-surface": "#ffffff",
      "--uv-border": "#212529",
      "--uv-text": "#212529",
      "--uv-muted": "#4f4f4f",
      "--uv-accent": "#209cee",
      "--uv-success": "#92cc41",
      "--uv-warning": "#f7d51d",
      "--uv-danger": "#e76e55",
    },
  },
  {
    id: "bedstead",
    label: "Bedstead Mono",
    cssVars: {
      "--uv-bg": "#141414",
      "--uv-surface": "#1c1c1c",
      "--uv-border": "#3e3e3e",
      "--uv-text": "#f1f1f1",
      "--uv-muted": "#b1b1b1",
      "--uv-accent": "#9cdcfe",
      "--uv-success": "#4ec9b0",
      "--uv-warning": "#dcdcaa",
      "--uv-danger": "#f48771",
    },
  },
  {
    id: "c64",
    label: "C64 CSS3",
    cssVars: {
      "--uv-bg": "#40318d",
      "--uv-surface": "#5040a0",
      "--uv-border": "#b8c76f",
      "--uv-text": "#d8e090",
      "--uv-muted": "#b8c76f",
      "--uv-accent": "#70a4b2",
      "--uv-success": "#6fd08c",
      "--uv-warning": "#f7e26b",
      "--uv-danger": "#f2777a",
    },
  },
];

export function udosThemeVarsFor(theme: UdosThemeId): Record<string, string> {
  return UDOS_THEME_PRESETS.find((preset) => preset.id === theme)?.cssVars ?? {};
}

