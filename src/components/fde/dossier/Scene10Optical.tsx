"use client";

import { motion } from "framer-motion";
import { Ann, COBALT, GREEN, ORANGE, useRange } from "./kit";
import type { SceneVisualProps } from "./types";

const LAYERS = [
  ["host / control edge", COBALT],
  ["platform software", "currentColor"],
  ["table-driven programming", "currentColor"],
  ["CDR / hardware boundary", ORANGE],
  ["QPSK / HIGH-SPEED MODES + STATE", "currentColor"],
  ["secure recovery · PM · validation", GREEN],
] as const;

function OpticalLayer({ p, layer, index, compact, x, width }: Readonly<{ p: SceneVisualProps["p"]; layer: (typeof LAYERS)[number]; index: number; compact: boolean; x: number; width: number }>) {
  const reveal = useRange(p, 0.04 + index * 0.08, 0.23 + index * 0.08, 0, 1);
  const [label, color] = layer;
  const y = 60 + index * 54;
  return (
    <motion.g style={{ opacity: reveal }}>
      <rect x={x} y={y} width={width} height={36} fill="none" stroke={color} strokeWidth={index === 3 ? 1.5 : 0.85} opacity={index === 3 ? 1 : 0.55} />
      <Ann x={x + 14} y={y + 23} size={9} color={color}>{label}</Ann>
      {!compact && index === 4 && <Ann x={x + width - 14} y={y + 23} size={8} anchor="end" opacity={0.55}>QPSK · high-speed Ethernet</Ann>}
    </motion.g>
  );
}

export function Scene10Optical({ p, compact }: Readonly<SceneVisualProps>) {
  const signal = useRange(p, 0.1, 0.86, 0, 1);
  const reconciled = useRange(p, 0.66, 0.9, 0, 1);
  const width = compact ? 410 : 500;
  const x = compact ? 135 : 90;
  return (
    <g>
      {LAYERS.map((layer, index) => <OpticalLayer key={layer[0]} p={p} layer={layer} index={index} compact={compact} x={x} width={width} />)}
      <motion.path d={`M ${x - 28} 78 H ${x + width + 24} V 348`} fill="none" stroke={COBALT} strokeWidth={1.8} style={{ pathLength: signal }} />
      <motion.g style={{ opacity: reconciled }}>
        <path d={`M ${x + 70} 294 c 32 -18 64 18 96 0 c 32 -18 64 18 96 0`} fill="none" stroke={GREEN} strokeWidth={1.2} />
        <Ann x={x + width} y={394} size={8} anchor="end" color={GREEN}>state reconciled · recovery verified · feedback shortened</Ann>
      </motion.g>
    </g>
  );
}
