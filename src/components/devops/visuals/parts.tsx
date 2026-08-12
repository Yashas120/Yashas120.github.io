/**
 * Shared diagram primitives for the /devtools inspector.
 *
 * Every visual on this route is semantic SVG rather than canvas, so the shapes are
 * in the accessibility tree, scale with zoom, and survive with scripting disabled.
 * Each frame carries a <title> and a <desc>; the panels additionally print the
 * same relationships as prose, so no information exists only as a picture.
 *
 * One coordinate space (360 units wide) is shared by all six visuals, which keeps
 * label sizes consistent across the docked, inline and bottom-sheet renderings.
 */

"use client";

import { useId } from "react";
import { DV } from "../tokens";

export const VW = 360;

export interface DiagramFrameProps {
  /** Short name of the diagram. */
  title: string;
  /** Prose description of the relationships drawn, for non-visual readers. */
  desc: string;
  height: number;
  children: React.ReactNode;
  className?: string;
}

export function DiagramFrame({ title, desc, height, children, className }: Readonly<DiagramFrameProps>) {
  const id = useId();
  return (
    <svg
      role="img"
      aria-labelledby={`${id}-t ${id}-d`}
      viewBox={`0 0 ${VW} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      // Height is reserved by the aspect ratio, so the panel never shifts on load.
      className={`block h-auto w-full ${className ?? ""}`}
      style={{ maxHeight: height * 1.35 }}
    >
      <title id={`${id}-t`}>{title}</title>
      <desc id={`${id}-d`}>{desc}</desc>
      {children}
    </svg>
  );
}

export interface GNodeProps {
  x: number;
  y: number;
  w: number;
  h?: number;
  /** Pre-broken label lines — SVG does not wrap text. */
  lines: string[];
  accent?: string;
  /** A node that is waiting rather than acting: hollow, not merely dimmer. */
  waiting?: boolean;
  /** Small mono tag under the label, e.g. "gate" or "human". */
  tag?: string;
}

/** A labelled box. Shape and text carry the state; colour only reinforces it. */
export function GNode({ x, y, w, h = 40, lines, accent = DV.muted, waiting, tag }: Readonly<GNodeProps>) {
  const cx = x + w / 2;
  const top = y + (h - (lines.length - 1) * 13) / 2 + 4;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={waiting ? "transparent" : DV.raised}
        stroke={accent}
        strokeWidth={1}
        strokeDasharray={waiting ? "3 3" : undefined}
      />
      {lines.map((l, i) => (
        <text
          key={l}
          x={cx}
          y={top + i * 13}
          textAnchor="middle"
          fontSize={13}
          fill={DV.text}
          className="font-sans"
        >
          {l}
        </text>
      ))}
      {tag && (
        <text x={cx} y={y + h + 13} textAnchor="middle" fontSize={12} fill={accent} className="font-mono">
          {tag}
        </text>
      )}
    </g>
  );
}

export interface EdgeProps {
  d: string;
  accent?: string;
  /** Animate the dashes along the path. Dashed at rest either way. */
  flow?: boolean;
  /** Arrowhead position and direction. */
  head?: { x: number; y: number; dir: "down" | "right" | "left" };
  delay?: number;
}

export function Edge({ d, accent = DV.border, flow, head, delay = 0 }: Readonly<EdgeProps>) {
  const points =
    head?.dir === "down"
      ? `${head.x - 4},${head.y - 6} ${head.x + 4},${head.y - 6} ${head.x},${head.y}`
      : head?.dir === "right"
        ? `${head.x - 6},${head.y - 4} ${head.x - 6},${head.y + 4} ${head.x},${head.y}`
        : head
          ? `${head.x + 6},${head.y - 4} ${head.x + 6},${head.y + 4} ${head.x},${head.y}`
          : "";
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={accent}
        strokeWidth={1.5}
        className={flow ? "dv-flow" : undefined}
        style={flow ? { animationDelay: `${delay}ms` } : { strokeDasharray: "4 8" }}
      />
      {head && <polygon points={points} fill={accent} />}
    </g>
  );
}

/** Section label inside a diagram. */
export function GLabel({ x, y, text, accent = DV.muted, anchor = "start" }: Readonly<{ x: number; y: number; text: string; accent?: string; anchor?: "start" | "middle" | "end" }>) {
  return (
    <text x={x} y={y} fontSize={12} fill={accent} textAnchor={anchor} className="font-mono">
      {text}
    </text>
  );
}
