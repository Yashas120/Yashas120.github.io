"use client";

/**
 * Final state — handoff. Everything built across the previous scenes collapses
 * into one small completed field brief, stamped in the order the work happened.
 */

import { motion } from "framer-motion";
import { Ann, COBALT, GREEN, RegMark, useRange } from "./kit";
import { handoff } from "@/data/fdeDossier";
import type { SceneVisualProps } from "./types";

const PLATE = { x: 178, y: 104, w: 324, h: 252 };

const STAMP_POS = [
  { x: 210, y: 158, rot: -2.5, color: COBALT },
  { x: 318, y: 200, rot: 1.5, color: COBALT },
  { x: 210, y: 244, rot: -1, color: GREEN },
  { x: 300, y: 292, rot: 2, color: GREEN },
];

function Stamp({
  p,
  i,
  label,
}: Readonly<{ p: SceneVisualProps["p"]; i: number; label: string }>) {
  const pos = STAMP_POS[i];
  const a = 0.44 + i * 0.12;
  const opacity = useRange(p, a, a + 0.07, 0, 1);
  const scale = useRange(p, a, a + 0.07, 1.14, 1);
  return (
    <motion.g style={{ opacity, scale, originX: 0, originY: 0, x: pos.x, y: pos.y, rotate: pos.rot }}>
      <rect width={label.length * 7.6 + 18} height={24} fill="none" stroke={pos.color} strokeWidth={1.1} />
      <Ann x={9} y={16} size={10} color={pos.color}>
        {label}
      </Ann>
    </motion.g>
  );
}

export function SceneHandoff({ p, compact }: Readonly<SceneVisualProps>) {
  // the production topology collapsing into a single small document
  const collapse = useRange(p, 0, 0.34, 1, 0.34);
  const fade = useRange(p, 0.04, 0.3, 0.5, 0);
  const plate = useRange(p, 0.22, 0.46, 0, 1);

  return (
    <g>
      <motion.g style={{ opacity: fade, scale: collapse, originX: 0.5, originY: 0.5 }}>
        <g stroke="currentColor" strokeWidth={0.9} fill="none">
          <rect x={60} y={90} width={120} height={40} />
          <rect x={280} y={200} width={120} height={40} />
          <rect x={500} y={320} width={120} height={40} />
          <line x1={180} y1={110} x2={280} y2={220} />
          <line x1={400} y1={220} x2={500} y2={340} />
        </g>
      </motion.g>

      <motion.g style={{ opacity: plate }}>
        <rect x={PLATE.x} y={PLATE.y} width={PLATE.w} height={PLATE.h} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.6} />
        <line x1={PLATE.x} y1={PLATE.y + 30} x2={PLATE.x + PLATE.w} y2={PLATE.y + 30} stroke="currentColor" strokeWidth={0.8} opacity={0.4} />
        <Ann x={PLATE.x + 14} y={PLATE.y + 20} size={9} opacity={0.7}>
          FIELD BRIEF · CLOSED
        </Ann>
        <Ann x={PLATE.x + PLATE.w - 14} y={PLATE.y + 20} size={9} anchor="end" opacity={0.5}>
          {handoff.slug}
        </Ann>
        {!compact && (
          <>
            <RegMark x={PLATE.x - 18} y={PLATE.y - 18} />
            <RegMark x={PLATE.x + PLATE.w + 18} y={PLATE.y + PLATE.h + 18} />
          </>
        )}
      </motion.g>

      {handoff.stamps.map((s, i) => (
        <Stamp key={s} p={p} i={i} label={s} />
      ))}
    </g>
  );
}
