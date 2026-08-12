// Editorial palettes for /cluster. Each mode has a base canvas plus an inverted
// canvas used for the one high-impact interlude chapter, so the "flip" moment
// works in both light and dark.

export type Tone = "base" | "inverted";

export interface Tokens {
  canvas: string;
  ink: string;
  muted: string;
  line: string;
  blue: string;
  coral: string;
  green: string;
}

/** Warm editorial paper. */
const WARM: Tokens = {
  canvas: "#F3F0E8",
  ink: "#111318",
  muted: "#565B65",
  line: "#8A877F",
  blue: "#1748D7",
  coral: "#B93628",
  green: "#0B6D4D",
};

/** Deep engineering night. Accents lifted for contrast on a dark canvas. */
const NIGHT: Tokens = {
  canvas: "#0D1117",
  ink: "#F1EFE9",
  muted: "#8B95A5",
  line: "#5A6677",
  blue: "#7D9BFF",
  coral: "#FF7A66",
  green: "#3FCB95",
};

/**
 * The interlude surface for dark mode: deeper than the base canvas rather than
 * inverted, so the high-impact chapter never flips to a white page.
 */
const DEEP: Tokens = {
  canvas: "#06080C",
  ink: "#F1EFE9",
  muted: "#8B95A5",
  line: "#5A6677",
  blue: "#7D9BFF",
  coral: "#FF7A66",
  green: "#3FCB95",
};

export interface Palette {
  base: Tokens;
  /** One high-impact chapter uses a deeper canvas than the base. */
  inverted: Tokens;
}

export const LIGHT: Palette = { base: WARM, inverted: NIGHT };
export const DARK: Palette = { base: NIGHT, inverted: DEEP };
