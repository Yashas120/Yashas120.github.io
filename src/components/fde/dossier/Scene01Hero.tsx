"use client";

/**
 * Scene 01 — ambiguity resolves. Five scattered fragments are crossed by a
 * cobalt calibration line and settle into the first revision of the dossier.
 */

import { motion, useTransform } from "framer-motion";
import { Ann, COBALT, useRange } from "./kit";
import type { SceneVisualProps } from "./types";

const FRAGMENTS = [
  { label: "workflow", from: [64, 92, -9], to: [232, 118] },
  { label: "constraint", from: [430, 62, 7], to: [232, 164] },
  { label: "security", from: [122, 330, 5], to: [232, 210] },
  { label: "operator", from: [462, 306, -6], to: [232, 256] },
  { label: "production", from: [286, 190, 11], to: [232, 302] },
] as const;

function Fragment({
  p,
  index,
  frag,
}: Readonly<{ p: SceneVisualProps["p"]; index: number; frag: (typeof FRAGMENTS)[number] }>) {
  const [fx, fy, fr] = frag.from;
  const [tx, ty] = frag.to;
  // The line sweeps left to right, so each fragment locks as it is crossed.
  const a = 0.16 + index * 0.09;
  const b = a + 0.26;
  const x = useRange(p, a, b, fx, tx);
  const y = useRange(p, a, b, fy, ty);
  const rot = useRange(p, a, b, fr, 0);
  const settled = useRange(p, a, b, 0, 1);
  const strokeOpacity = useTransform(settled, [0, 1], [0.35, 0.85]);
  const accent = useTransform(settled, [0.6, 1], [0, 1]);

  return (
    <motion.g style={{ x, y, rotate: rot }}>
      <motion.rect
        width={176}
        height={30}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.9}
        style={{ opacity: strokeOpacity }}
      />
      <motion.rect width={3} height={30} fill={COBALT} style={{ opacity: accent }} />
      <g transform="translate(14 20)">
        <Ann x={0} y={0} size={11}>
          {frag.label}
        </Ann>
      </g>
    </motion.g>
  );
}

export function Scene01Hero({ p, compact }: Readonly<SceneVisualProps>) {
  const sweepX = useRange(p, 0.06, 0.76, 24, 664);
  const sweepOpacity = useTransform(p, [0.02, 0.1, 0.72, 0.86], [0, 1, 1, 0], { clamp: true });
  const plateOpacity = useRange(p, 0.72, 0.95, 0, 1);
  const spineHeight = useRange(p, 0.5, 0.95, 0, 232);

  return (
    <g>
      {/* the spine the fragments align against */}
      <motion.rect
        x={222}
        y={110}
        width={1}
        height={spineHeight}
        fill={COBALT}
        style={{ opacity: 0.5 }}
      />

      {FRAGMENTS.map((f, i) => (
        <Fragment key={f.label} p={p} index={i} frag={f} />
      ))}

      {/* calibration line */}
      <motion.g style={{ x: sweepX, opacity: sweepOpacity }}>
        <line x1={0} y1={20} x2={0} y2={440} stroke={COBALT} strokeWidth={1.4} />
        <rect x={-1} y={20} width={2} height={40} fill={COBALT} />
        <g transform="translate(8 16)">
          <Ann x={0} y={0} size={9} color={COBALT}>
            CALIBRATE
          </Ann>
        </g>
      </motion.g>

      <motion.g style={{ opacity: plateOpacity }}>
        <line x1={222} y1={352} x2={408} y2={352} stroke="currentColor" strokeWidth={0.9} opacity={0.5} />
        <Ann x={222} y={372} size={9} opacity={0.6}>
          DEPLOYMENT DOSSIER · REV 01
        </Ann>
        {!compact && (
          <>
            <Ann x={608} y={128} size={9} anchor="end" opacity={0.55}>
              inputs: ambiguous
            </Ann>
            <Ann x={608} y={146} size={9} anchor="end" color={COBALT}>
              status: aligned
            </Ann>
          </>
        )}
      </motion.g>
    </g>
  );
}
