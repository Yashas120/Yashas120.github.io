"use client";

import { motion } from "framer-motion";
import { Ann, COBALT, GREEN, ORANGE, useRange } from "./kit";
import type { SceneVisualProps } from "./types";

const ENVELOPES = [
  { title: "OFFLINE", constraint: "air-gapped legacy", resolution: "bundle dependencies" },
  { title: "LOCAL ARCHITECTURE", constraint: "Apple Silicon", resolution: "compatible runtime" },
  { title: "SECURE HARDWARE", constraint: "trust boundary", resolution: "verified recovery" },
] as const;

function ConstraintEnvelope({ p, item, index, vertical }: Readonly<{ p: SceneVisualProps["p"]; item: (typeof ENVELOPES)[number]; index: number; vertical: boolean }>) {
  const enter = useRange(p, 0.04 + index * 0.22, 0.28 + index * 0.22, 0, 1);
  const resolved = useRange(p, 0.18 + index * 0.22, 0.42 + index * 0.22, 0, 1);
  const x = vertical ? 142 : 54 + index * 210;
  const y = vertical ? 58 + index * 126 : 142;
  return (
    <motion.g style={{ opacity: enter }}>
      <rect x={x} y={y} width={vertical ? 396 : 182} height={vertical ? 92 : 170} fill="none" stroke={COBALT} strokeWidth={1} />
      <path d={`M ${x} ${y} l ${vertical ? 198 : 91} ${vertical ? 50 : 62} l ${vertical ? 198 : 91} -${vertical ? 50 : 62}`} fill="none" stroke="currentColor" strokeWidth={0.7} opacity={0.28} />
      <Ann x={x + 12} y={y + 20} size={9} color={COBALT}>{item.title}</Ann>
      <Ann x={x + 12} y={y + (vertical ? 66 : 112)} size={8} color={ORANGE}>{item.constraint}</Ann>
      <motion.g style={{ opacity: resolved }}>
        <Ann x={x + 12} y={y + (vertical ? 82 : 136)} size={8} color={GREEN}>→ {item.resolution}</Ann>
        <rect x={x + (vertical ? 354 : 146)} y={y + 12} width={24} height={16} fill="none" stroke={GREEN} strokeWidth={1} />
        <path d={`M ${x + (vertical ? 359 : 151)} ${y + 20} l 5 5 l 9 -10`} fill="none" stroke={GREEN} strokeWidth={1.2} />
      </motion.g>
    </motion.g>
  );
}

export function Scene07Constraints({ p, compact }: Readonly<SceneVisualProps>) {
  const vertical = compact;
  return (
    <g>
      {ENVELOPES.map((item, index) => <ConstraintEnvelope key={item.title} p={p} item={item} index={index} vertical={vertical} />)}
      {!vertical && <Ann x={340} y={356} size={9} anchor="middle" opacity={0.55}>same verified artifact · environment-specific delivery wrapper</Ann>}
    </g>
  );
}
