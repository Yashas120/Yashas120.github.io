/**
 * /devtools design tokens.
 *
 * The colour values themselves live in `.devops` in globals.css so both themes
 * are declared in one place; this file exposes them as `rgb(var(--…))` strings
 * for inline styles and keeps the route's repeated class strings in one spot.
 *
 * Colour is never the only carrier of meaning on this route: every coloured node,
 * bar or badge is paired with a text label or a distinct shape.
 */

export const DV = {
  canvas: "rgb(var(--dv-canvas))",
  browser: "rgb(var(--dv-browser))",
  inspector: "rgb(var(--dv-inspector))",
  raised: "rgb(var(--dv-raised))",
  border: "rgb(var(--dv-border))",
  text: "rgb(var(--dv-text))",
  muted: "rgb(var(--dv-muted))",
  amber: "rgb(var(--dv-amber))",
  cyan: "rgb(var(--dv-cyan))",
  green: "rgb(var(--dv-green))",
  /** Failure states only. Never used decoratively. */
  red: "rgb(var(--dv-red))",
  /** Human approval or a retained human decision. */
  violet: "rgb(var(--dv-violet))",
} as const;

/** Translucent fills, for node backgrounds that must stay legible in both themes. */
export const wash = (v: string, alpha: number) => `rgb(var(${v}) / ${alpha})`;

export const MAX_WIDTH = 1440;
/** Browser chrome strip inside the shell. */
export const CHROME_H = 46;
/** Sticky site header above the shell. */
export const HEADER_H = 56;
export const TAB_H = 38;
export const CONTEXT_H = 28;

/** 44px minimum pointer target, applied to every action on the route. */
export const ACTION =
  "inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-2.5 text-[14px] transition-colors duration-150 hover:opacity-80";

export const MONO = "font-mono text-[12px] leading-relaxed";
