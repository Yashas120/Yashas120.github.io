"use client";

/** Scene 11 — the film opens into the complete semantic record below. */

import { motion } from "framer-motion";
import { Ann, COBALT, GREEN, RegMark, useRange } from "./kit";
import type { SceneVisualProps } from "./types";

const ROLES = ["CISCO OPTICAL", "CISCO BACKEND + CLOUD", "CISCO INTERNSHIP", "SCHNEIDER", "PES TEACHING"] as const;
const DOMAINS = ["PRODUCTION", "CLOUD", "OPTICAL", "SYSTEMS", "ML / CV", "TEACHING"] as const;

function RoleRow({ p, role, index, compact }: Readonly<{ p: SceneVisualProps["p"]; role: string; index: number; compact: boolean }>) {
  const opacity = useRange(p, 0.16 + index * 0.09, 0.34 + index * 0.09, 0, 1);
  const x = compact ? 112 : 170;
  const width = compact ? 456 : 340;
  const y = 108 + index * 42;
  return (
    <motion.g style={{ opacity }}>
      <line x1={x} y1={y + 24} x2={x + width} y2={y + 24} stroke="currentColor" strokeWidth={0.7} opacity={0.28} />
      <Ann x={x} y={y + 16} size={9}>{String(index + 1).padStart(2, "0")} · {role}</Ann>
      <Ann x={x + width} y={y + 16} size={8} anchor="end" color={GREEN}>VERIFIED</Ann>
    </motion.g>
  );
}

export function SceneHandoff({ p, compact }: Readonly<SceneVisualProps>) {
  const plate = useRange(p, 0.04, 0.28, 0, 1);
  const rule = useRange(p, 0.58, 0.96, 0, 1);
  const domains = useRange(p, 0.52, 0.78, 0, 1);
  return (
    <g>
      <motion.g style={{ opacity: plate }}>
        <rect x={compact ? 92 : 148} y={52} width={compact ? 496 : 384} height={344} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.62} />
        <line x1={compact ? 92 : 148} y1={88} x2={compact ? 588 : 532} y2={88} stroke="currentColor" strokeWidth={0.8} opacity={0.4} />
        <Ann x={compact ? 108 : 164} y={76} size={9} color={COBALT}>VERIFIED RECORD · INDEX</Ann>
        {!compact && <RegMark x={130} y={34} />}
      </motion.g>
      {ROLES.map((role, index) => <RoleRow key={role} p={p} role={role} index={index} compact={compact} />)}
      <motion.g style={{ opacity: domains }}>
        {DOMAINS.map((domain, i) => (
          <Ann key={domain} x={(compact ? 112 : 170) + (i % 3) * (compact ? 152 : 112)} y={344 + Math.floor(i / 3) * 20} size={8} color={COBALT}>{domain}</Ann>
        ))}
      </motion.g>
      <motion.line x1={340} y1={396} x2={340} y2={452} stroke={GREEN} strokeWidth={1.5} style={{ scaleY: rule, originY: 0 }} />
      <Ann x={340} y={438} size={8} anchor="middle" color={GREEN}>CONTINUES BELOW</Ann>
    </g>
  );
}
