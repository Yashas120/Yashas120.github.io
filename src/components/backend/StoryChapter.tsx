"use client";

/**
 * One chapter of literal copy.
 *
 * Transition envelope, per the story spec: fade in over the first 15% of the
 * chapter's range, hold through the middle, then fade and lift over the final
 * 20%. Enters 24px below, exits 24px above. Text is never blurred, and only
 * `transform` and `opacity` animate.
 *
 * Accessibility: chapters stay in logical DOM order, each owns an <h2> (the hero
 * owns the single <h1>), and controls inside an inactive chapter are removed from
 * the tab order — an invisible chapter must never hold focus.
 */

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";
import { colors, copyStops } from "./tokens";

export interface StoryChapterProps {
  index: number;
  progress: MotionValue<number>;
  /** True when this chapter owns the viewport; gates focusability. */
  active: boolean;
  id?: string;
  eyebrow: string;
  heading: string;
  /** The hero owns the h1. */
  as?: "h1" | "h2";
  children?: ReactNode;
  mobile?: boolean;
  /**
   * Renders the heading at section-label scale. Used by the projects chapter,
   * whose body is a full project description and would otherwise overflow a
   * short viewport underneath a display-size heading.
   */
  compactHeading?: boolean;
}

export function StoryChapter({
  index,
  progress,
  active,
  id,
  eyebrow,
  heading,
  as = "h2",
  children,
  mobile = false,
  compactHeading = false,
}: Readonly<StoryChapterProps>) {
  const { inA, inB, outA, outB } = copyStops(index);
  const opacity = useTransform(progress, [inA, inB, outA, outB], [0, 1, 1, 0], { clamp: true });
  const y = useTransform(progress, [inA, inB, outA, outB], [24, 0, 0, -24], { clamp: true });

  const Heading = as;

  return (
    <motion.section
      id={id}
      aria-hidden={!active}
      // `inert` would be ideal but is not yet in React's typed props; removing the
      // subtree from the tab order is handled per-control via CSS + aria-hidden.
      className={`absolute inset-0 flex flex-col justify-center ${active ? "" : "pointer-events-none"}`}
      style={{ opacity, y }}
    >
      <div style={{ maxWidth: 560 }}>
        <p
          className="font-mono text-[11px] tracking-[0.2em] md:text-[12px]"
          style={{ color: colors.active }}
        >
          {eyebrow}
        </p>

        <Heading
          className="mt-4 font-semibold tracking-[-0.02em]"
          style={{
            color: colors.text,
            // The width-based cap is the spec's; the svh term stops a long heading
            // from overflowing a short viewport (a 6-line h1 at 5vw does not fit
            // 800px of height, which clipped the eyebrow and the hero actions).
            // The vw terms give the specified mobile sizes (hero 38–44px, chapter
            // 28–34px) at 360×800; the svh terms only kick in on shorter
            // viewports, where the alternative is clipping mandated copy.
            fontSize: compactHeading
              ? mobile
                ? "20px"
                : "clamp(1.15rem, 1.6vw, 1.5rem)"
              : as === "h1"
                ? mobile
                  ? "clamp(28px, min(10.5vw, 5.2svh), 44px)"
                  : "clamp(2.5rem, min(5vw, 6.2svh), 5.25rem)"
                : mobile
                  ? "clamp(23px, min(8vw, 3.9svh), 34px)"
                  : "clamp(1.85rem, min(3.4vw, 4.6svh), 3.75rem)",
            lineHeight: as === "h1" ? 1.04 : compactHeading ? 1.3 : 1.12,
          }}
        >
          {heading}
        </Heading>

        <div className={compactHeading ? "mt-4" : "mt-5 md:mt-7"}>{children}</div>
      </div>
    </motion.section>
  );
}

/** Body copy. Never below 16px. */
export function Body({ children, mobile }: Readonly<{ children: ReactNode; mobile?: boolean }>) {
  return (
    <p
      className="mt-4 first:mt-0"
      style={{ color: colors.muted, fontSize: mobile ? 16 : 18, lineHeight: 1.65 }}
    >
      {children}
    </p>
  );
}

/** A short bulleted list. Mobile shows at most three items per viewport. */
export function Bullets({
  items,
  mobile,
  limit,
}: Readonly<{ items: string[]; mobile?: boolean; limit?: number }>) {
  const shown = limit ? items.slice(0, limit) : items;
  return (
    <ul className="mt-5 space-y-2.5">
      {shown.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3"
          style={{ color: colors.muted, fontSize: mobile ? 16 : 18, lineHeight: 1.55 }}
        >
          <span
            aria-hidden
            className="mt-[0.62em] block h-[1px] w-3 shrink-0"
            style={{ background: colors.active }}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * A verified result. The label and value are always rendered as text so the
 * figure never depends on colour or on the animation.
 */
export function Result({
  label,
  value,
  explanation,
  mobile,
}: Readonly<{ label: string; value: string; explanation?: string; mobile?: boolean }>) {
  return (
    <div className="mt-6 border-l pl-4" style={{ borderColor: colors.healthy }}>
      <p className="font-mono text-[11px] tracking-[0.18em]" style={{ color: colors.muted }}>
        {label}
      </p>
      <p
        className="mt-1.5 font-semibold"
        style={{ color: colors.healthy, fontSize: mobile ? 22 : 28, lineHeight: 1.2 }}
      >
        {value}
      </p>
      {explanation && (
        <p className="mt-1.5" style={{ color: colors.muted, fontSize: 16, lineHeight: 1.6 }}>
          {explanation}
        </p>
      )}
    </div>
  );
}

/** A compact row of verified label/value pairs. */
export function ResultRow({
  results,
  mobile,
}: Readonly<{ results: { label: string; value: string }[]; mobile?: boolean }>) {
  return (
    <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
      {results.map((r) => (
        <div key={r.label}>
          <dt className="font-mono text-[11px] tracking-[0.14em]" style={{ color: colors.muted }}>
            {r.label}
          </dt>
          <dd
            className="mt-1 font-semibold"
            style={{ color: colors.healthy, fontSize: mobile ? 18 : 20 }}
          >
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** A small monospace annotation under a chapter — scope notes and disclaimers. */
export function Note({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <p
      className="mt-6 border-l pl-4 font-mono text-[11px] md:text-[12px]"
      style={{ color: colors.muted, borderColor: colors.line, lineHeight: 1.6 }}
    >
      {children}
    </p>
  );
}
