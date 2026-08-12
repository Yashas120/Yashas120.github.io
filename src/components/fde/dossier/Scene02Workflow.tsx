"use client";

/**
 * Scene 02 — requirement discovery. Loose workflow fragments drift in, are
 * measured, and align into a single specification spine. The strips carry no
 * copy: the motion (listening, then ordering) is the message.
 */

import { motion, useTransform } from "framer-motion";
import { Ann, COBALT, Dim, useRange, stagger } from "./kit";
import type { SceneVisualProps } from "./types";

const SPINE_X = 214;
const TOP = 96;

/** Deterministic pseudo-scatter so the layout is identical on every render. */
function scatter(i: number, n: number) {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  const r1 = s - Math.floor(s);
  const t = Math.sin(i * 78.233 + 1.7) * 12345.6789;
  const r2 = t - Math.floor(t);
  return {
    x: 40 + r1 * 520,
    y: 60 + r2 * 330,
    rot: (r1 - 0.5) * 26,
    len: 70 + r2 * 60,
    order: i / n,
  };
}

function Strip({
  p,
  i,
  n,
  gap,
}: Readonly<{ p: SceneVisualProps["p"]; i: number; n: number; gap: number }>) {
  const s = scatter(i, n);
  const [a, b] = stagger(i, n, 0.66, 0.08);
  const x = useRange(p, a, b, s.x, SPINE_X + 10);
  const y = useRange(p, a, b, s.y, TOP + i * gap);
  const rot = useRange(p, a, b, s.rot, 0);
  const len = useRange(p, a, b, s.len, 118);
  const settle = useRange(p, a, b, 0, 1);
  const opacity = useTransform(p, [Math.max(a - 0.08, 0), a], [0, 1], { clamp: true });
  const ink = useTransform(settle, [0, 1], [0.3, 0.62]);

  return (
    <motion.g style={{ x, y, rotate: rot, opacity }}>
      <motion.rect height={2} fill="currentColor" style={{ width: len, opacity: ink }} />
      <motion.rect width={2} height={2} fill={COBALT} style={{ opacity: settle }} />
    </motion.g>
  );
}

export function Scene02Workflow({ p, compact }: Readonly<SceneVisualProps>) {
  const n = compact ? 10 : 20;
  const gap = compact ? 24 : 13;
  const spineH = useRange(p, 0.2, 0.9, 0, TOP + n * gap - TOP + 10);
  const annOpacity = useRange(p, 0.62, 0.9, 0, 1);
  const dimOpacity = useRange(p, 0.4, 0.72, 0, 1);
  const bracket = useRange(p, 0.7, 0.96, 0, 1);

  return (
    <g>
      <motion.rect x={SPINE_X} y={TOP} width={1.4} height={spineH} fill={COBALT} />

      {Array.from({ length: n }, (_, i) => (
        <Strip key={i} p={p} i={i} n={n} gap={gap} />
      ))}

      <motion.g style={{ opacity: dimOpacity }}>
        <Dim x1={SPINE_X + 10} x2={SPINE_X + 128} y={TOP - 16} label="mapped calculation" />
      </motion.g>

      <motion.g style={{ opacity: annOpacity }}>
        <Ann x={SPINE_X - 14} y={TOP + 4} size={9} anchor="end" opacity={0.6}>
          domain interviews
        </Ann>
        <Ann x={SPINE_X - 14} y={TOP + 22} size={9} anchor="end" opacity={0.6}>
          informal process
        </Ann>
        <Ann x={SPINE_X - 14} y={TOP + 40} size={9} anchor="end" color={COBALT}>
          constraints
        </Ann>
        <Ann x={SPINE_X + 10} y={TOP + n * gap + 34} size={9} color={COBALT}>
          SPECIFICATION SPINE
        </Ann>
        <Ann x={SPINE_X + 186} y={TOP + 14} size={9} opacity={0.55}>
          feature workflows
        </Ann>
        <Ann x={SPINE_X + 186} y={TOP + 32} size={9} opacity={0.55}>
          part → test relationships
        </Ann>
        <Ann x={SPINE_X + 186} y={TOP + 50} size={9} opacity={0.55}>
          failure modes
        </Ann>
      </motion.g>

      {/* closing bracket: the spec is now a single reviewable object */}
      <motion.path
        d={`M ${SPINE_X + 150} ${TOP - 6} h 14 V ${TOP + n * gap + 8} h -14`}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.9}
        style={{ opacity: bracket }}
      />
    </g>
  );
}
