/**
 * /backend design tokens.
 *
 * This route owns a fixed near-black operations surface rather than following the
 * site-wide light theme, so the state colours keep both their meaning and their
 * measured contrast. Colour is never the only carrier of a state: every coloured
 * element on this page is paired with a text label or a distinct shape.
 *
 * Contrast against `canvas`, computed rather than eyeballed:
 *   text 15.9:1 · muted 7.4:1 · active 6.8:1 · healthy 9.6:1 · warning 10.1:1 · failure 6.3:1
 */
export const colors = {
  canvas: "#070B10",
  surface: "#0D141C",
  raised: "#121C26",
  line: "#223142",
  text: "#E6EDF3",
  muted: "#91A4B7",
  active: "#60A5FA",
  healthy: "#4ADE80",
  warning: "#FBBF24",
  failure: "#F87171",
} as const;

/** Semantic meaning of each state colour, used for labels and legends. */
export type SystemState = "inactive" | "active" | "healthy" | "review" | "failed";

export const stateColor: Record<SystemState, string> = {
  inactive: colors.muted,
  active: colors.active,
  healthy: colors.healthy,
  review: colors.warning,
  failed: colors.failure,
};

/* ------------------------------------------------------------------ layout */

export const MAX_WIDTH = 1360;
export const HEADER_DESKTOP = 64;
export const HEADER_MOBILE = 56;

/** The one coordinate space the persistent visual is drawn in (desktop). */
export const STAGE = { w: 680, h: 560 };
/**
 * Narrow viewports get a short, wide canvas whose aspect ratio matches the
 * mobile diagram strip (~30svh). Sizing it like the desktop stage made the SVG
 * taller than its container and it drew over the copy. Because the canvas is
 * small, the mobile topology is deliberately simplified: a few large elements
 * with labels no smaller than 11px once scaled.
 */
export const STAGE_MOBILE = { w: 360, h: 268 };

export function stageFor(mobile: boolean) {
  return mobile ? STAGE_MOBILE : STAGE;
}

/* ---------------------------------------------------------------- chapters */

export interface ChapterRange {
  id: string;
  /** Chapter rail label. */
  rail: string;
  start: number;
  end: number;
}

/**
 * Fixed progress ranges. The visual and the copy both derive from these, so a
 * chapter's text and the system state it describes can never drift apart.
 */
export const CHAPTERS: ChapterRange[] = [
  { id: "hero", rail: "Intro", start: 0.0, end: 0.12 },
  { id: "experience", rail: "Experience", start: 0.12, end: 0.26 },
  { id: "infrastructure", rail: "Infrastructure", start: 0.26, end: 0.44 },
  { id: "events", rail: "Events", start: 0.44, end: 0.61 },
  { id: "reliability", rail: "Reliability", start: 0.61, end: 0.77 },
  { id: "projects", rail: "Projects", start: 0.77, end: 0.91 },
  { id: "contact", rail: "Contact", start: 0.91, end: 1.0 },
];

/** Substates inside the projects chapter: Cloud-Hack, then Bitcoin. */
export const PROJECT_SUBSTATES = [
  { start: 0.77, end: 0.84 },
  { start: 0.84, end: 0.91 },
];

/** The scroll position a rail link targets — the chapter's hold window. */
export function chapterAnchor(index: number): number {
  const c = CHAPTERS[index];
  return c.start + (c.end - c.start) * 0.35;
}

/**
 * Copy transition envelope for a chapter: fade in over the first 15% of its
 * range, hold through the middle, then fade and lift over the final 20%.
 */
export function copyStops(index: number) {
  const { start, end } = CHAPTERS[index];
  const len = end - start;
  const first = index === 0;
  const last = index === CHAPTERS.length - 1;
  return {
    // the hero is already resolved at rest; the last chapter never fades out
    inA: first ? -0.001 : start,
    inB: first ? 0 : start + len * 0.15,
    outA: last ? 1.1 : start + len * 0.8,
    outB: last ? 1.101 : end,
  };
}
