"use client";

/**
 * Scene 04 — the dossier becomes an x-ray of a running system. One real request
 * trace moves through the topology; dependencies that no configuration record
 * listed only appear when the trace reaches them; the authentication path turns
 * signal orange; application and compiled-dependency layers separate beneath.
 *
 * Every line here stands for something named in the copy. Nothing is decorative
 * traffic.
 */

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Ann, COBALT, GREEN, ORANGE, pointAt, polyline, useRange } from "./kit";
import type { SceneVisualProps } from "./types";

const TRACE: readonly [number, number][] = [
  [46, 176],
  [138, 176],
  [138, 118],
  [268, 118],
  [268, 196],
  [396, 196],
  [534, 196],
];

const NODES = [
  { x: 138, y: 118, label: "auth" },
  { x: 268, y: 118, label: "api gateway" },
  { x: 268, y: 196, label: "service" },
  { x: 396, y: 196, label: "integration" },
  { x: 534, y: 196, label: "datastore" },
] as const;

/** Consumers the records did not list: revealed only as the trace arrives. */
const HIDDEN = [
  { from: [268, 196], to: [268, 268], label: "undocumented consumer", at: 0.42 },
  { from: [396, 196], to: [396, 108], label: "scheduled job", at: 0.52 },
  { from: [396, 196], to: [470, 262], label: "partner integration", at: 0.6 },
] as const;

function Node({
  p,
  n,
  i,
}: Readonly<{ p: SceneVisualProps["p"]; n: (typeof NODES)[number]; i: number }>) {
  const appear = useRange(p, 0.04 + i * 0.03, 0.2 + i * 0.03, 0, 1);
  return (
    <motion.g style={{ opacity: appear }}>
      <rect x={n.x - 26} y={n.y - 11} width={52} height={22} fill="none" stroke="currentColor" strokeWidth={0.9} opacity={0.55} />
      <Ann x={n.x} y={n.y + 24} size={8} anchor="middle" opacity={0.6}>
        {n.label}
      </Ann>
    </motion.g>
  );
}

function HiddenDep({
  p,
  dep,
  compact,
}: Readonly<{ p: SceneVisualProps["p"]; dep: (typeof HIDDEN)[number]; compact: boolean }>) {
  const o = useRange(p, dep.at, dep.at + 0.08, 0, 1);
  const [x1, y1] = dep.from;
  const [x2, y2] = dep.to;
  return (
    <motion.g style={{ opacity: o }}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={COBALT} strokeWidth={0.9} strokeDasharray="3 4" />
      <rect x={x2 - 5} y={y2 - 5} width={10} height={10} fill="none" stroke={COBALT} strokeWidth={0.9} />
      {!compact && (
        <Ann x={x2 + 10} y={y2 + 4} size={8} color={COBALT}>
          {dep.label}
        </Ann>
      )}
    </motion.g>
  );
}

function RepoLayer({
  p,
  i,
  opacity,
}: Readonly<{ p: SceneVisualProps["p"]; i: number; opacity: MotionValue<number> }>) {
  const y = useRange(p, 0.72, 0.92, i * 6, i * 22);
  return (
    <motion.g style={{ y }}>
      <motion.rect
        width={176}
        height={16}
        fill="none"
        stroke={i === 1 ? ORANGE : "currentColor"}
        strokeWidth={0.9}
        style={{ opacity }}
      />
      <motion.g style={{ opacity }}>
        <Ann x={182} y={12} size={8} color={i === 1 ? ORANGE : undefined} opacity={i === 1 ? 1 : 0.55}>
          {`repo ${i + 1}`}
        </Ann>
      </motion.g>
    </motion.g>
  );
}

export function Scene04Production({ p, compact }: Readonly<SceneVisualProps>) {
  const traceT = useRange(p, 0.16, 0.66, 0, 1);
  const dotX = useTransform(traceT, (t) => pointAt(TRACE, t)[0]);
  const dotY = useTransform(traceT, (t) => pointAt(TRACE, t)[1]);
  const traceDash = useTransform(traceT, (t) => `${t * 900} 900`);
  const defect = useRange(p, 0.6, 0.72, 0, 1);
  const layers = useRange(p, 0.72, 0.92, 0, 1);
  const jars = useRange(p, 0.86, 1, 0, 1);
  const scale = useRange(p, 0.2, 0.5, 0, 1);

  return (
    <g transform="translate(0 22)">
      {/* x-ray plate rules */}
      <g opacity={0.16} stroke="currentColor" strokeWidth={0.6}>
        <line x1={24} y1={62} x2={656} y2={62} />
        <line x1={24} y1={318} x2={656} y2={318} />
      </g>

      <polyline
        points={polyline(TRACE)}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.8}
        opacity={0.28}
      />
      <motion.polyline
        points={polyline(TRACE)}
        fill="none"
        stroke={GREEN}
        strokeWidth={1.6}
        strokeLinecap="round"
        style={{ strokeDasharray: traceDash }}
      />
      <motion.circle r={4} fill={GREEN} style={{ cx: dotX, cy: dotY }} />

      {NODES.map((n, i) => (
        <Node key={n.label} p={p} n={n} i={i} />
      ))}
      {HIDDEN.map((d) => (
        <HiddenDep key={d.label} p={p} dep={d} compact={compact} />
      ))}

      {/* the authentication defect: the same path, now failing */}
      <motion.g style={{ opacity: defect }}>
        <polyline
          points={polyline([
            [138, 176],
            [138, 118],
            [268, 118],
          ])}
          fill="none"
          stroke={ORANGE}
          strokeWidth={2}
        />
        <Ann x={104} y={100} size={8} color={ORANGE}>
          auth defect
        </Ann>
      </motion.g>

      {/* application layers separating, then compiled dependencies opening beneath */}
      <g transform={compact ? "translate(300 300) scale(0.8)" : "translate(392 288)"}>
        {[0, 1, 2].map((i) => (
          <RepoLayer key={i} p={p} i={i} opacity={layers} />
        ))}
        {[0].map((i) => (
          <motion.g key={`jar-${i}`} style={{ opacity: jars }}>
            <rect x={16 + i * 92} y={104} width={72} height={14} fill="none" stroke={ORANGE} strokeWidth={0.9} strokeDasharray="3 3" />
            <Ann x={22 + i * 92} y={114} size={8} color={ORANGE}>
              compiled dependency
            </Ann>
          </motion.g>
        ))}
      </g>

      {/* public-safe method annotations attached to the mechanism */}
      <motion.g style={{ opacity: scale }}>
        <Ann x={46} y={134} size={8} opacity={0.6}>
          observed production traffic
        </Ann>
        <Ann x={534} y={172} size={8} anchor="middle" opacity={0.6}>
          active consumer
        </Ann>
        {!compact && (
          <>
            <Ann x={24} y={54} size={8} opacity={0.5}>
              documentation incomplete
            </Ann>
            <Ann x={656} y={54} size={8} anchor="end" opacity={0.5}>
              owners mapped from evidence
            </Ann>
          </>
        )}
      </motion.g>
    </g>
  );
}
