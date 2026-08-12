/**
 * /data-plane palette — a line-card engineering workstation.
 *
 * This route owns a fixed near-black surface rather than following the
 * site-wide light theme (the same decision /cluster, /fde and /backend make),
 * so the colours are literal rather than token-driven.
 *
 * State colours carry meaning and are never decorative:
 *   SIGNAL   — active optical / configuration path, in flight
 *   VERIFIED — preserved, matched or validated state
 *   AMBER    — a mismatch, or an intervention the software had to make
 *   FAULT    — an actual failure, nothing else
 *   RESEARCH — research and teaching material only, never the dataplane accent
 *
 * Every state that uses colour is also carried by a label or a shape, so the
 * diagrams survive colour-blindness and monochrome printing.
 */

export const CANVAS = "#070B10";
export const SURFACE = "#0D141C";
export const RAISED = "#121C26";
export const GRID = "#223142";

export const SIGNAL = "#65E5FF";
export const VERIFIED = "#A8FF60";
export const AMBER = "#FFBE55";
export const RESEARCH = "#B69CFF";
/**
 * Reserved for real failures. Not in the supplied token list because the brief
 * assigns no failure colour, but chapter 09 documents an actual release-blocking
 * failure and amber already means "intervention"; this keeps the two distinct.
 */
export const FAULT = "#FF6B6B";

/**
 * Text ramp, contrast measured against CANVAS (#070B10) rather than eyeballed,
 * because the disclosure and scope notes are set in the faintest tone and must
 * still clear WCAG AA at normal size:
 *   TEXT ≈ 15.9:1   MUTED ≈ 8.1:1   FAINT ≈ 5.5:1
 */
export const TEXT = "#E6EDF3";
export const MUTED = "#91A4B7";
export const FAINT = "#7B8A9D";
export const RULE = "rgba(230, 237, 243, 0.12)";

/**
 * Stage coordinate spaces. Wide viewports get a landscape stage beside the copy.
 * Narrow viewports get a portrait one so the schematic becomes a simplified
 * vertical software-to-hardware path rather than a 720-wide drawing crushed into
 * a phone with 4px labels.
 */
export const STAGE = { w: 720, h: 560 };
export const CSTAGE = { w: 360, h: 540 };

export function stageFor(compact: boolean) {
  return compact ? CSTAGE : STAGE;
}

export const MONO = "var(--font-jetbrains), ui-monospace, monospace";
