/**
 * ASCII character sets for uGridComposer
 */

export const ASCII_CHARS = {
  full: "█",
  threeQuarters: "■",
  half: "▀",
  quarter: "▄",
  light: "░",
  medium: "▒",
  dark: "▓",
  checkerboard: "□",
  dot: "⋅",
  circle: "●",
  diamond: "◆",
  heart: "♥",
  spade: "♠",
  club: "♣",
  star: "★",
  music: "♪",
  smile: "☺",
  sun: "☼",
  female: "♀",
  male: "♂",
  arrowUp: "↑",
  arrowDown: "↓",
  arrowLeft: "←",
  arrowRight: "→",
  doubleArrowUp: "⇑",
  doubleArrowDown: "⇓",
  doubleArrowLeft: "⇐",
  doubleArrowRight: "⇒",
  block: "▬",
  triangleUp: "▲",
  triangleDown: "▼",
  triangleLeft: "◄",
  triangleRight: "►",
  house: "⌂",
  paragraph: "¶",
  section: "§",
  copyright: "©",
  registered: "®",
  trademark: "™",
  degree: "°",
  plusMinus: "±",
  notEqual: "≠",
  lessEqual: "≤",
  greaterEqual: "≥",
  infinity: "∞",
  division: "÷",
  multiplication: "×",
  emptySet: "∅",
  epsilon: "ε",
  phi: "φ",
  pi: "π",
  sigma: "σ",
  omega: "ω",
};

export const ASCII_PALLETES = {
  monochrome: ["█", "▓", "▒", "░", " "] as const,
  shades: ["■", "▀", "▄", "░", " "] as const,
  blocks: ["█", "■", "▓", "▒", "░", " "] as const,
};

export function getCharForDensity(density: number, palette: readonly string[] = ASCII_PALLETES.shades): string {
  const index = Math.min(Math.floor(density * palette.length), palette.length - 1);
  return palette[index];
}
