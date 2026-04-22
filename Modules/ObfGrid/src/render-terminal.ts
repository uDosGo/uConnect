import chalk from "chalk";
import type { GridMode } from "./types.js";
import type { ParsedGrid } from "./types.js";

const PALETTE: Record<string, (s: string) => string> = {
  teletext: (ch) => {
    switch (ch) {
      case "█":
        return chalk.hex("#00FF00")(ch);
      case "▓":
        return chalk.hex("#008800")(ch);
      case "▒":
        return chalk.hex("#00AA00")(ch);
      case "░":
        return chalk.hex("#00DD00")(ch);
      case "□":
      case "■":
        return chalk.hex("#00FF00")(ch);
      default:
        return chalk.hex("#00FF00")(ch);
    }
  },
  mono: (ch) => {
    switch (ch) {
      case "█":
        return chalk.hex("#000000")(ch);
      case "▓":
        return chalk.hex("#333333")(ch);
      case "▒":
        return chalk.hex("#666666")(ch);
      case "░":
        return chalk.hex("#AAAAAA")(ch);
      default:
        return chalk.hex("#111111")(ch);
    }
  },
  wireframe: (ch) => {
    switch (ch) {
      case "█":
        return chalk.hex("#000000")(ch);
      case "▓":
        return chalk.hex("#444444")(ch);
      case "▒":
        return chalk.hex("#888888")(ch);
      case "░":
        return chalk.hex("#CCCCCC")(ch);
      default:
        return chalk.hex("#000000")(ch);
    }
  },
};

export function renderTerminal(g: ParsedGrid, modeOverride?: GridMode): string {
  const mode = modeOverride ?? g.options.mode;
  const paint = PALETTE[mode] ?? PALETTE.teletext;
  const lines: string[] = [];
  for (const row of g.rows) {
    lines.push(row.map((c) => paint(c === " " ? "·" : c)).join(""));
  }
  return lines.join("\n");
}

/** Plain ASCII (no ANSI) for export */
export function renderAscii(g: ParsedGrid): string {
  return g.rows.map((row) => row.join("")).join("\n");
}
