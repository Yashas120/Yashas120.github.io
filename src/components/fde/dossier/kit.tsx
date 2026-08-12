"use client";

/**
 * Shared vocabulary for the /fde deployment dossier: palette, scene windowing
 * maths, the editorial copy block, and the small SVG annotation primitives every
 * scene draws with. Scenes own geometry; this file owns the art direction.
 */

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ palette
 *
 * The dossier has two separate, complete themes — mineral ivory and midnight —
 * and it never moves between them while reading. The site's light/dark toggle
 * picks one and it stays put, so every colour here resolves through a CSS custom
 * property defined once on `.fde-root` (see globals.css). Scenes 04–05 get a
 * small step *inside* the active theme (`--fde-bg-deep`), never a flip to the
 * other one.
 */

export const BG = "var(--fde-bg)";
export const BG_DEEP = "var(--fde-bg-deep)";
export const PAPER = "var(--fde-paper)";
export const PAPER_DEEP = "var(--fde-paper-deep)";
export const INK = "var(--fde-ink)";
export const COBALT = "var(--fde-cobalt)";
export const ORANGE = "var(--fde-orange)";
export const GREEN = "var(--fde-green)";
export const RULE = "var(--fde-rule)";

/** Fallback scene count; callers pass the registry length explicitly. */
export const SLOTS = 11;

/** The single coordinate space every scene draws the dossier in. */
export const SHEET = { w: 680, h: 460 };

/* ------------------------------------------------- scroll windowing helpers */

export interface SceneWindow {
  start: number;
  end: number;
  band: number;
}

export function sceneWindow(index: number, total = SLOTS): SceneWindow {
  const band = 1 / total;
  return { band, start: index * band, end: (index + 1) * band };
}

/** Local 0→1 mechanism progress for a scene, excluding its cross-fade edges. */
export function useMech(progress: MotionValue<number>, index: number, total = SLOTS) {
  const w = sceneWindow(index, total);
  return useTransform(progress, [w.start + 0.14 * w.band, w.end - 0.16 * w.band], [0, 1], {
    clamp: true,
  });
}

/** Opacity for a scene layer: fades in at its start and out before the next. */
export function useSceneOpacity(progress: MotionValue<number>, index: number, total = SLOTS) {
  const w = sceneWindow(index, total);
  const first = index === 0;
  const last = index === total - 1;
  const inA = first ? -1 : w.start + 0.01 * w.band;
  const inB = first ? -0.999 : w.start + 0.15 * w.band;
  const outA = last ? 2 : w.end - 0.15 * w.band;
  const outB = last ? 2.001 : w.end - 0.01 * w.band;
  return useTransform(progress, [inA, inB, outA, outB], [0, 1, 1, 0], { clamp: true });
}

/** Sub-range of a local progress value, clamped to 0→1. */
export function useRange(p: MotionValue<number>, a: number, b: number, from = 0, to = 1) {
  return useTransform(p, [a, b], [from, to], { clamp: true });
}

/** Staggered reveal: item `i` of `n` animates inside its own slice of `p`. */
export function stagger(i: number, n: number, spread = 0.62, offset = 0.04): [number, number] {
  const step = spread / Math.max(n, 1);
  const a = offset + i * step;
  return [a, Math.min(a + step * 1.9, 0.99)];
}

/** Point along a polyline at t ∈ 0..1, used for tracing dots without measuring DOM. */
export function pointAt(pts: readonly [number, number][], t: number): [number, number] {
  if (pts.length === 0) return [0, 0];
  const segs = pts.length - 1;
  if (segs <= 0) return pts[0];
  const clamped = Math.min(Math.max(t, 0), 1);
  const scaled = clamped * segs;
  const i = Math.min(Math.floor(scaled), segs - 1);
  const f = scaled - i;
  const [x0, y0] = pts[i];
  const [x1, y1] = pts[i + 1];
  return [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f];
}

export function polyline(pts: readonly [number, number][]) {
  return pts.map(([x, y]) => `${x},${y}`).join(" ");
}

/* ----------------------------------------------------------- editorial copy */

export interface CopyProps {
  scene: string;
  slug: string;
  eyebrow?: string;
  headline: string;
  body?: string;
  notes?: string[];
  outcome?: string;
  hero?: boolean;
  compact?: boolean;
  /** Heading level: the hero owns the h1, later scenes are h2. */
  as?: "h1" | "h2" | "h3" | "div";
  children?: ReactNode;
}

export function CopyBlock({
  scene,
  slug,
  eyebrow,
  headline,
  body,
  notes,
  outcome,
  hero = false,
  compact = false,
  as = "h2",
  children,
}: Readonly<CopyProps>) {
  const Heading = as;
  return (
    <div className="min-w-0 max-w-[600px]" data-fde-copy>
      <p className={`flex items-center font-mono uppercase text-current opacity-45 ${compact ? "gap-2 text-[10px] tracking-[0.14em]" : "gap-3 text-[10px] tracking-[0.22em]"}`}>
        <span aria-hidden className="inline-block h-[1px] w-6 bg-current align-middle" />
        {`scene ${scene}`}
        <span className="opacity-60">/ {slug}</span>
      </p>

      {eyebrow && (
        <p
          className={compact ? "mt-3 font-mono text-[10px] uppercase tracking-[0.2em]" : "mt-5 font-mono text-[11px] uppercase tracking-[0.28em]"}
          style={{ color: COBALT }}
        >
          {eyebrow}
        </p>
      )}

      <Heading
        className={
          hero
            ? `${compact ? "mt-2" : "mt-4"} font-semibold leading-[0.92] tracking-[-0.03em]`
            : `${compact ? "mt-2" : "mt-4"} font-semibold leading-[1.02] tracking-[-0.025em]`
        }
        style={{
          fontSize: compact
            ? hero
              ? "clamp(1.68rem, 7.2vw, 1.9rem)"
              : "clamp(1.45rem, 6vw, 1.75rem)"
            : hero
              ? "clamp(1.9rem, 5vw, 4.4rem)"
              : "clamp(1.75rem, 3.4vw, 3.25rem)",
        }}
      >
        {headline}
      </Heading>

      {body && (
        <p
          className={compact ? "mt-3 max-w-[42ch] text-[15px] leading-[1.45] opacity-75" : "mt-5 max-w-[38ch] text-[1rem] leading-[1.55] opacity-75"}
        >
          {body}
        </p>
      )}

      {outcome && (
        <p
          className={compact ? "mt-3 font-mono text-[1.2rem] font-medium tracking-[-0.02em]" : "mt-5 font-mono text-[clamp(1.4rem,2.6vw,2.25rem)] font-medium tracking-[-0.02em]"}
          style={{ color: GREEN }}
        >
          {outcome}
        </p>
      )}

      {notes?.map((n) => (
        <p
          key={n}
          className={compact ? "mt-3 max-w-[52ch] border-l pl-3 font-mono text-[10px] leading-[1.5] opacity-70" : "mt-4 max-w-[52ch] border-l pl-4 font-mono text-[11px] leading-[1.6] opacity-70"}
          style={{ borderColor: "currentColor" }}
        >
          {n}
        </p>
      ))}

      {children}
    </div>
  );
}

/* -------------------------------------------------------- SVG micro-elements */

/** Mono annotation text inside the sheet's coordinate space. */
export function Ann({
  x,
  y,
  children,
  size = 10,
  color,
  anchor = "start",
  opacity = 1,
}: Readonly<{
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  color?: string;
  anchor?: "start" | "middle" | "end";
  opacity?: number;
}>) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor={anchor}
      fill={color ?? "currentColor"}
      opacity={opacity}
      style={{ fontFamily: "var(--font-jetbrains), ui-monospace, monospace", letterSpacing: "0.08em" }}
    >
      {children}
    </text>
  );
}

/** Registration mark: the corner crosses of an engineering plate. */
export function RegMark({ x, y, r = 7 }: Readonly<{ x: number; y: number; r?: number }>) {
  return (
    <g stroke="currentColor" strokeWidth={0.8} opacity={0.35}>
      <line x1={x - r} y1={y} x2={x + r} y2={y} />
      <line x1={x} y1={y - r} x2={x} y2={y + r} />
    </g>
  );
}

/** Measured dimension line with tick ends. */
export function Dim({
  x1,
  x2,
  y,
  label,
  color,
}: Readonly<{ x1: number; x2: number; y: number; label?: string; color?: string }>) {
  const c = color ?? "currentColor";
  return (
    <g stroke={c} strokeWidth={0.8} opacity={0.7}>
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} />
      <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} />
      {label && (
        <g stroke="none">
          <Ann x={(x1 + x2) / 2} y={y - 7} anchor="middle" size={9} color={c}>
            {label}
          </Ann>
        </g>
      )}
    </g>
  );
}

/** A line that draws itself as `p` advances (SVG path length progress). */
export function DrawLine({
  d,
  p,
  length,
  color,
  width = 1.2,
  dash,
  opacity = 1,
  a = 0,
  b = 1,
}: Readonly<{
  d: string;
  p: MotionValue<number>;
  length: number;
  color?: string;
  width?: number;
  dash?: string;
  opacity?: number;
  a?: number;
  b?: number;
}>) {
  const offset = useRange(p, a, b, length, 0);
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth={width}
      strokeLinecap="round"
      opacity={opacity}
      style={{ strokeDasharray: dash ?? length, strokeDashoffset: dash ? undefined : offset }}
    />
  );
}
