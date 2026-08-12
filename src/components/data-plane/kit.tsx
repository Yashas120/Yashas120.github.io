"use client";

/**
 * Shared vocabulary for the /data-plane film: scroll-window maths, the editorial
 * copy column, and the SVG primitives every chapter draws with.
 *
 * All motion is derived from a scroll MotionValue. There are no timers, no
 * requestAnimationFrame loops and no infinite animations, so disabling motion
 * simply pins every mechanism at its resolved end state.
 */

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";
import { AMBER, FAINT, GRID, MONO, MUTED, RAISED, RULE, SIGNAL, TEXT, VERIFIED } from "./palette";

/** Chapters that own a viewport slot in the pinned film. */
export const SLOTS = 9;

/* ------------------------------------------------- scroll windowing helpers */

export interface ChapterWindow {
  start: number;
  end: number;
  band: number;
}

export function chapterWindow(index: number, total = SLOTS): ChapterWindow {
  const band = 1 / total;
  return { band, start: index * band, end: (index + 1) * band };
}

/** Local 0→1 mechanism progress for a chapter, excluding its cross-fade edges. */
export function useMech(progress: MotionValue<number>, index: number, total = SLOTS) {
  const w = chapterWindow(index, total);
  return useTransform(progress, [w.start + 0.14 * w.band, w.end - 0.16 * w.band], [0, 1], { clamp: true });
}

/** Opacity for a chapter layer: adjacent chapters overlap through each boundary. */
export function useChapterOpacity(progress: MotionValue<number>, index: number, total = SLOTS) {
  const w = chapterWindow(index, total);
  const first = index === 0;
  const last = index === total - 1;
  const inA = first ? -1 : w.start - 0.12 * w.band;
  const inB = first ? -0.999 : w.start + 0.1 * w.band;
  const outA = last ? 2 : w.end - 0.1 * w.band;
  const outB = last ? 2.001 : w.end + 0.12 * w.band;
  return useTransform(progress, [inA, inB, outA, outB], [0, 1, 1, 0], { clamp: true });
}

/** Sub-range of a local progress value, clamped to 0→1. */
export function useRange(p: MotionValue<number>, a: number, b: number, from = 0, to = 1) {
  return useTransform(p, [a, b], [from, to], { clamp: true });
}

/** Staggered reveal: item `i` of `n` animates inside its own slice of `p`. */
export function stagger(i: number, n: number, spread = 0.6, offset = 0.06): [number, number] {
  const step = spread / Math.max(n, 1);
  const a = offset + i * step;
  return [a, Math.min(a + step * 1.8, 0.99)];
}

/* ----------------------------------------------------------- editorial copy */

export interface CopyProps {
  stage: string;
  chapter: string;
  eyebrow: string;
  heading: string;
  body?: string;
  points?: readonly string[];
  outcome?: string;
  note?: string;
  hero?: boolean;
  as?: "h1" | "h2";
  children?: ReactNode;
}

/**
 * The literal résumé column. Sans-serif for anything a reader must understand;
 * monospace only for the technical stage annotation. The narrative is fully
 * legible from this column alone — the diagram adds relationships, never facts.
 */
export function CopyBlock({
  stage,
  chapter,
  eyebrow,
  heading,
  body,
  points,
  outcome,
  note,
  hero = false,
  as = "h2",
  children,
}: Readonly<CopyProps>) {
  const Heading = as;
  return (
    <div className="max-w-[620px]">
      <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: FAINT }}>
        <span aria-hidden className="inline-block h-[1px] w-6 align-middle" style={{ background: FAINT }} />
        {chapter}
        <span>/ {stage}</span>
      </p>

      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.24em] md:mt-5" style={{ color: SIGNAL }}>
        {eyebrow}
      </p>

      <Heading
        className="mt-2.5 font-semibold tracking-[-0.025em] md:mt-3.5"
        style={{
          color: TEXT,
          fontSize: hero ? "clamp(1.85rem, 4.6vw, 3.9rem)" : "clamp(1.3rem, 2.5vw, 2.35rem)",
          lineHeight: hero ? 1.02 : 1.14,
        }}
      >
        {heading}
      </Heading>

      {body && (
        <p
          className="mt-3.5 max-w-[48ch] text-[0.9rem] leading-[1.6] md:mt-5 md:text-[1.03rem] md:leading-[1.62]"
          style={{ color: MUTED }}
        >
          {body}
        </p>
      )}

      {outcome && (
        <p
          className="mt-4 flex items-start gap-2.5 text-[0.9rem] font-medium leading-[1.5] md:mt-5 md:text-[1.02rem]"
          style={{ color: VERIFIED }}
        >
          <span aria-hidden className="mt-[0.45em] block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: VERIFIED }} />
          {outcome}
        </p>
      )}

      {points && points.length > 0 && (
        <ul className="mt-4 space-y-2 md:mt-5 md:space-y-2.5">
          {points.map((pt) => (
            <li
              key={pt}
              className="flex items-start gap-2.5 text-[0.83rem] leading-[1.55] md:text-[0.92rem]"
              style={{ color: MUTED }}
            >
              <span aria-hidden className="mt-[0.5em] block h-[1px] w-3 shrink-0" style={{ background: SIGNAL }} />
              {pt}
            </li>
          ))}
        </ul>
      )}

      {children}

      {note && (
        <p
          className="mt-4 max-w-[56ch] border-l pl-3.5 font-mono text-[10.5px] leading-[1.62] md:mt-5 md:text-[11px]"
          style={{ color: FAINT, borderColor: RULE }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

/** Ownership is a fact, so it is labelled rather than dressed up. */
export function OwnershipTag({ ownership }: Readonly<{ ownership: "complete" | "co-owned" }>) {
  const complete = ownership === "complete";
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-1.5 py-[2px] font-mono text-[9.5px] uppercase tracking-[0.12em]"
      style={{
        color: complete ? VERIFIED : AMBER,
        borderColor: complete ? "rgba(168,255,96,0.4)" : "rgba(255,190,85,0.4)",
      }}
    >
      <span aria-hidden className="block h-1 w-1 rounded-full" style={{ background: complete ? VERIFIED : AMBER }} />
      {complete ? "Completely owned" : "Co-owned"}
    </span>
  );
}

/* -------------------------------------------------------- SVG micro-elements */

/** Monospace annotation inside the stage coordinate space. */
export function Ann({
  x,
  y,
  children,
  size = 10,
  color = MUTED,
  anchor = "start",
  opacity = 1,
  weight,
}: Readonly<{
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  color?: string;
  anchor?: "start" | "middle" | "end";
  opacity?: number;
  weight?: number;
}>) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor={anchor}
      fill={color}
      opacity={opacity}
      fontWeight={weight}
      style={{ fontFamily: MONO, letterSpacing: "0.06em" }}
    >
      {children}
    </text>
  );
}

/** A hairline plate with a monospace label — a layer, resource or boundary. */
export function Plate({
  x,
  y,
  w,
  h,
  label,
  sub,
  color = GRID,
  fill = RAISED,
  dashed = false,
  labelColor = TEXT,
  size = 11,
}: Readonly<{
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  sub?: string;
  color?: string;
  fill?: string;
  dashed?: boolean;
  labelColor?: string;
  size?: number;
}>) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={5}
        fill={fill}
        stroke={color}
        strokeWidth={1.2}
        strokeDasharray={dashed ? "4 4" : undefined}
      />
      {label && (
        <Ann x={x + 10} y={y + (sub ? h / 2 - 2 : h / 2 + 3.5)} size={size} color={labelColor}>
          {label}
        </Ann>
      )}
      {sub && (
        <Ann x={x + 10} y={y + h / 2 + 11} size={size - 1.5} color={MUTED}>
          {sub}
        </Ann>
      )}
    </g>
  );
}

/** A connector whose stroke draws in with its step. */
export function DrawLine({
  d,
  step,
  color = GRID,
  width = 1.2,
  dashed,
}: Readonly<{ d: string; step: MotionValue<number>; color?: string; width?: number; dashed?: boolean }>) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dashed ? "4 4" : undefined}
      style={{ pathLength: step }}
    />
  );
}

/** Fade-and-lift a group as its step advances. */
export function Reveal({
  step,
  children,
  lift = 6,
}: Readonly<{ step: MotionValue<number>; children: ReactNode; lift?: number }>) {
  const y = useTransform(step, [0, 1], [lift, 0]);
  return (
    <motion.g style={{ opacity: step, y }}>
      {children}
    </motion.g>
  );
}

/**
 * A state marker: colour plus a glyph, so "preserved" and "corrected" are
 * distinguishable without relying on hue.
 */
export function StatusMark({
  x,
  y,
  kind,
  step,
  label,
}: Readonly<{ x: number; y: number; kind: "keep" | "fix" | "fail"; step: MotionValue<number>; label?: string }>) {
  const color = kind === "keep" ? VERIFIED : kind === "fix" ? AMBER : "#FF6B6B";
  const glyph = kind === "keep" ? "M -3 0 L -0.5 2.5 L 3.5 -2.5" : kind === "fix" ? "M -3 -3 L 3 3 M 3 -3 L -3 3" : "M 0 -3.5 L 0 1 M 0 3 L 0 3.5";
  return (
    <motion.g style={{ opacity: step }}>
      <circle cx={x} cy={y} r={6.5} fill="none" stroke={color} strokeWidth={1.1} />
      <path d={glyph} transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      {label && (
        <Ann x={x + 12} y={y + 3.5} size={9.5} color={color}>
          {label}
        </Ann>
      )}
    </motion.g>
  );
}
