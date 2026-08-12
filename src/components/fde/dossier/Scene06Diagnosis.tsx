"use client";

import { motion } from "framer-motion";
import { Ann, COBALT, GREEN, ORANGE, useRange } from "./kit";
import type { SceneVisualProps } from "./types";

const LAYERS = ["user symptom", "UI / API", "authentication rule", "service dependency", "deployment / LB", "data query"] as const;

function DiagnosisLayer({ p, label, index, x, width }: Readonly<{ p: SceneVisualProps["p"]; label: string; index: number; x: number; width: number }>) {
  const inspected = useRange(p, 0.1 + index * 0.085, 0.25 + index * 0.085, 0.28, 1);
  const y = 78 + index * 52;
  return (
    <motion.g style={{ opacity: inspected }}>
      <rect x={x} y={y} width={width} height={34} fill="none" stroke={index === 4 ? ORANGE : "currentColor"} strokeWidth={index === 4 ? 1.4 : 0.8} opacity={index === 4 ? 1 : 0.45} />
      <Ann x={x + 14} y={y + 22} size={9} color={index === 4 ? ORANGE : undefined}>{label}</Ann>
      <Ann x={x + width - 12} y={y + 22} size={8} anchor="end" opacity={0.55}>{index < 4 ? "inspect" : index === 4 ? "responsible layer" : "ruled out"}</Ann>
    </motion.g>
  );
}

export function Scene06Diagnosis({ p, compact }: Readonly<SceneVisualProps>) {
  const trace = useRange(p, 0.08, 0.72, 0, 1);
  const correction = useRange(p, 0.68, 0.94, 0, 1);
  const layerWidth = compact ? 330 : 430;
  const x = compact ? 176 : 126;

  return (
    <g>
      <Ann x={x} y={56} size={9} color={ORANGE}>SYMPTOM RECEIVED</Ann>
      {LAYERS.map((label, index) => <DiagnosisLayer key={label} p={p} label={label} index={index} x={x} width={layerWidth} />)}
      <motion.line x1={x - 24} y1={92} x2={x - 24} y2={352} stroke={COBALT} strokeWidth={1.8} style={{ pathLength: trace }} />
      <motion.g style={{ opacity: correction }}>
        <line x1={x + layerWidth + 18} y1={300} x2={x + layerWidth + 18} y2={372} stroke={GREEN} strokeWidth={1.6} />
        <Ann x={x + layerWidth + 8} y={392} size={9} anchor="end" color={GREEN}>minimal correction → verify</Ann>
      </motion.g>
      {!compact && (
        <>
          <Ann x={40} y={420} size={8} opacity={0.55}>CASE A · access rule through compiled dependency</Ann>
          <Ann x={640} y={420} size={8} anchor="end" opacity={0.55}>CASE B · rollout / load-balancer recovery</Ann>
        </>
      )}
    </g>
  );
}
