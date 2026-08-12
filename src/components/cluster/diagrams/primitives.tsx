"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { Tone } from "@/lib/clusterTheme";
import { useTokens } from "../theme";

// Small shared building blocks for the mechanism diagrams. These are drawing
// primitives only — each mechanism composes them into its own dedicated diagram.

export type Step = MotionValue<number>;

export interface DiagramProps {
  /** 0..1 progress for this scene's mechanism. */
  p: Step;
  /** Stack the flow vertically (mobile). */
  vertical?: boolean;
  tone?: Tone;
}

/** Slice a scene's 0..1 progress into a sub-step. */
export function useStep(p: Step, a: number, b: number): Step {
  return useTransform(p, [a, b], [0, 1], { clamp: true });
}

export interface BoxProps {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  step: Step;
  tone?: Tone;
  accent?: string;
  mono?: boolean;
}

/** A labelled component box that resolves in as its step advances. */
export function Box({ x, y, w, h, label, sub, step, tone, accent, mono }: Readonly<BoxProps>) {
  const t = useTokens(tone);
  // Keep the full topology legible before any desktop scroll enhancement. The
  // motion adds emphasis; it never gates comprehension of the mechanism.
  const opacity = useTransform(step, [0, 0.35], [0.72, 1]);
  return (
    <motion.g style={{ opacity }}>
      <rect x={x} y={y} width={w} height={h} rx={7} fill={t.canvas} stroke={accent ?? t.line} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 4 : y + h / 2 + 4}
        textAnchor="middle"
        fontSize={mono ? 12 : 13}
        fontFamily={mono ? "var(--font-jetbrains), ui-monospace, monospace" : "inherit"}
        fontWeight={500}
        fill={t.ink}
      >
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" fontSize={11} fill={t.muted}>
          {sub}
        </text>
      )}
    </motion.g>
  );
}

/** A connector whose stroke draws in with its step. */
export function Conn({
  d,
  step,
  color,
  width = 1.4,
  dashed,
  tone,
}: Readonly<{ d: string; step: Step; color?: string; width?: number; dashed?: boolean; tone?: Tone }>) {
  const t = useTokens(tone);
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color ?? t.line}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dashed ? "4 4" : undefined}
      vectorEffect="non-scaling-stroke"
      style={{ pathLength: step }}
    />
  );
}

/** A payload travelling from one point to another. */
export function Dot({
  from,
  to,
  step,
  color,
  r = 5,
  tone,
}: Readonly<{ from: [number, number]; to: [number, number]; step: Step; color?: string; r?: number; tone?: Tone }>) {
  const t = useTokens(tone);
  const cx = useTransform(step, (v) => from[0] + (to[0] - from[0]) * v);
  const cy = useTransform(step, (v) => from[1] + (to[1] - from[1]) * v);
  const opacity = useTransform(step, [0, 0.08, 0.92, 1], [0, 1, 1, 0]);
  return <motion.circle r={r} fill={color ?? t.blue} style={{ cx, cy, opacity }} />;
}

/** A compact state callout. */
export function Tag({
  x,
  y,
  text,
  step,
  color,
  anchor = "middle",
  tone,
}: Readonly<{ x: number; y: number; text: string; step: Step; color?: string; anchor?: "start" | "middle"; tone?: Tone }>) {
  const t = useTokens(tone);
  const opacity = useTransform(step, [0, 1], [0, 1]);
  const yShift = useTransform(step, [0, 1], [6, 0]);
  return (
    <motion.g style={{ opacity, y: yShift }}>
      <text
        x={x}
        y={y}
        textAnchor={anchor}
        fontSize={12.5}
        fontWeight={600}
        fontFamily="var(--font-jetbrains), ui-monospace, monospace"
        fill={color ?? t.green}
      >
        {text}
      </text>
    </motion.g>
  );
}

/** Plain caption text inside a diagram. */
export function Caption({
  x,
  y,
  text,
  step,
  tone,
  anchor = "middle",
  size = 11.5,
}: Readonly<{ x: number; y: number; text: string; step: Step; tone?: Tone; anchor?: "start" | "middle" | "end"; size?: number }>) {
  const t = useTokens(tone);
  const opacity = useTransform(step, [0, 1], [0, 1]);
  return (
    <motion.text x={x} y={y} textAnchor={anchor} fontSize={size} fill={t.muted} style={{ opacity }}>
      {text}
    </motion.text>
  );
}
