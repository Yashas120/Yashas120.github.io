"use client";

/**
 * Scene 05 — safe rollout. The single request trace splits into two regional
 * lanes. New instances arrive provisional (dashed orange), health checks travel
 * through the load balancer and its dependencies, the old instances keep serving
 * until the replacement path verifies green, and only then do they recede.
 */

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Ann, COBALT, GREEN, ORANGE, useRange } from "./kit";
import type { SceneVisualProps } from "./types";

interface LaneProps {
  p: SceneVisualProps["p"];
  y: number;
  label: string;
  delay: number;
  compact: boolean;
}

function Instance({
  x,
  y,
  verified,
  provisional,
}: Readonly<{ x: number; y: number; verified: MotionValue<number>; provisional: MotionValue<number> }>) {
  const dash = useTransform(verified, (v) => (v > 0.6 ? "0" : "4 4"));
  const stroke = useTransform(verified, (v) => (v > 0.6 ? GREEN : ORANGE));
  return (
    <motion.g style={{ opacity: provisional }}>
      <motion.rect
        x={x}
        y={y - 12}
        width={44}
        height={24}
        fill="none"
        strokeWidth={1.1}
        style={{ stroke, strokeDasharray: dash }}
      />
    </motion.g>
  );
}

function Lane({ p, y, label, delay, compact }: Readonly<LaneProps>) {
  const enter = useRange(p, 0.12 + delay, 0.34 + delay, 0, 1);
  const provisional = useRange(p, 0.2 + delay, 0.4 + delay, 0, 1);
  const check = useRange(p, 0.42 + delay, 0.68 + delay, 0, 1);
  const verified = useRange(p, 0.6 + delay, 0.76 + delay, 0, 1);
  const recede = useRange(p, 0.78 + delay, 0.94 + delay, 1, 0.18);

  const checkX = useTransform(check, [0, 1], [186, 560]);
  const oldStroke = useTransform(verified, (v) => (v > 0.7 ? GREEN : "currentColor"));

  return (
    <g>
      {/* load balancer */}
      <motion.g style={{ opacity: enter }}>
        <rect x={132} y={y - 16} width={48} height={32} fill="none" stroke={COBALT} strokeWidth={1} />
        <Ann x={156} y={y + 30} size={8} anchor="middle" color={COBALT}>
          lb
        </Ann>
        <Ann x={24} y={y + 4} size={9} opacity={0.65}>
          {label}
        </Ann>
        <line x1={92} y1={y} x2={132} y2={y} stroke="currentColor" strokeWidth={0.9} opacity={0.4} />
      </motion.g>

      {/* old path stays available */}
      <motion.g style={{ opacity: recede }}>
        <line x1={180} y1={y - 34} x2={430} y2={y - 34} stroke="currentColor" strokeWidth={0.9} opacity={0.45} />
        {[0, 1].map((i) => (
          <motion.rect
            key={i}
            x={430 + i * 58}
            y={y - 46}
            width={44}
            height={24}
            fill="none"
            strokeWidth={1}
            style={{ stroke: oldStroke }}
          />
        ))}
        {!compact && (
          <Ann x={430} y={y - 54} size={8} opacity={0.6}>
            old pods · serving
          </Ann>
        )}
      </motion.g>

      {/* new path, provisional until health checks pass */}
      <motion.line
        x1={180}
        y1={y + 6}
        x2={556}
        y2={y + 6}
        stroke={ORANGE}
        strokeWidth={0.9}
        strokeDasharray="4 5"
        style={{ opacity: provisional }}
      />
      {[0, 1].map((i) => (
        <Instance key={i} x={430 + i * 58} y={y + 6} verified={verified} provisional={provisional} />
      ))}

      {/* the health check itself */}
      <motion.circle r={3.4} cy={y + 6} fill={GREEN} style={{ cx: checkX, opacity: check }} />
      {!compact && (
        <motion.g style={{ opacity: verified }}>
          <Ann x={430} y={y + 40} size={8} color={GREEN}>
            healthy → cut over
          </Ann>
        </motion.g>
      )}
    </g>
  );
}

export function Scene05Rollout({ p, compact }: Readonly<SceneVisualProps>) {
  const moduleOpacity = useRange(p, 0.06, 0.28, 0, 1);
  const saving = useRange(p, 0.82, 0.98, 0, 1);

  return (
    <g>
      <Lane p={p} y={140} label="region a" delay={0} compact={compact} />
      <Lane p={p} y={302} label="region b" delay={0.06} compact={compact} />

      <motion.g style={{ opacity: moduleOpacity }}>
        <rect x={26} y={190} width={30} height={62} fill="none" stroke={COBALT} strokeWidth={0.9} />
        <line x1={56} y1={200} x2={132} y2={140} stroke={COBALT} strokeWidth={0.8} opacity={0.5} />
        <line x1={56} y1={242} x2={132} y2={302} stroke={COBALT} strokeWidth={0.8} opacity={0.5} />
        <Ann x={20} y={288} size={8} color={COBALT}>
          terraform module
        </Ann>
      </motion.g>

      <motion.g style={{ opacity: saving }}>
        <line x1={26} y1={412} x2={340} y2={412} stroke={GREEN} strokeWidth={2.4} />
        <line x1={340} y1={412} x2={654} y2={412} stroke="currentColor" strokeWidth={0.9} strokeDasharray="3 4" opacity={0.4} />
        <Ann x={26} y={402} size={9} color={GREEN}>
          parallel-safe work · gated prerequisites · verified release
        </Ann>
      </motion.g>
    </g>
  );
}
