"use client";

/**
 * Scene 06 — repetition becomes leverage. The regional lanes fold into a single
 * automation rail. Manual work enters as separate orange tokens and leaves as one
 * reusable green pipeline; each accomplishment reshapes the same rail instead of
 * spawning another card.
 */

import { motion, useTransform } from "framer-motion";
import { Ann, COBALT, GREEN, ORANGE, useRange } from "./kit";
import { leverageItems } from "@/data/fdeDossier";
import type { SceneVisualProps } from "./types";

const RAIL_Y = 224;
const RAIL_X1 = 48;
const RAIL_X2 = 640;
const N = leverageItems.length;

function Token({ p, i, compact }: Readonly<{ p: SceneVisualProps["p"]; i: number; compact: boolean }>) {
  const a = 0.06 + (i / N) * 0.78;
  const b = a + 0.16;
  const x = useRange(p, a, b, RAIL_X1, 336);
  const opacity = useTransform(p, [a - 0.03, a, b - 0.04, b], [0, 1, 1, 0], { clamp: true });
  const label = useTransform(p, [a, a + 0.03, b - 0.05, b], [0, 1, 1, 0], { clamp: true });

  return (
    <motion.g style={{ x, opacity }}>
      <rect y={RAIL_Y - 9} width={18} height={18} fill="none" stroke={ORANGE} strokeWidth={1.1} />
      <line x1={4} y1={RAIL_Y - 4} x2={14} y2={RAIL_Y + 5} stroke={ORANGE} strokeWidth={0.9} />
      {!compact && (
        <motion.g style={{ opacity: label }}>
          <Ann x={0} y={RAIL_Y - 18} size={8} color={ORANGE}>
            manual
          </Ann>
        </motion.g>
      )}
    </motion.g>
  );
}

/** A tick on the rail for each piece of work the pipeline absorbed. */
function Marker({ p, i }: Readonly<{ p: SceneVisualProps["p"]; i: number }>) {
  const a = 0.1 + (i / N) * 0.78;
  const opacity = useRange(p, a, a + 0.06, 0, 1);
  const x = 372 + i * 52;
  return (
    <motion.g style={{ opacity }}>
      <line x1={x} y1={RAIL_Y + 14} x2={x} y2={RAIL_Y + 26} stroke={GREEN} strokeWidth={1} />
    </motion.g>
  );
}

/** The active item's label, printed once in the same place rather than repeated. */
function ActiveLabel({ p, i }: Readonly<{ p: SceneVisualProps["p"]; i: number }>) {
  const step = 1 / N;
  const a = i * step;
  const opacity = useTransform(
    p,
    [a - step * 0.2, a + step * 0.2, a + step * 0.8, a + step * 1.2],
    [0, 1, 1, 0],
    { clamp: true }
  );
  return (
    <motion.g style={{ opacity }}>
      <Ann x={372} y={RAIL_Y + 46} size={9} color={GREEN}>
        {leverageItems[i].label}
      </Ann>
    </motion.g>
  );
}

/** The stack of repeated manual work, emptying as the rail absorbs it. */
function Backlog({ p, i }: Readonly<{ p: SceneVisualProps["p"]; i: number }>) {
  const a = 0.06 + (i / N) * 0.78;
  const opacity = useRange(p, a, a + 0.05, 0.75, 0);
  return (
    <motion.rect
      x={52}
      y={RAIL_Y - 74 + i * 26}
      width={14}
      height={14}
      fill="none"
      stroke={ORANGE}
      strokeWidth={1}
      style={{ opacity }}
    />
  );
}

export function Scene06Leverage({ p, compact }: Readonly<SceneVisualProps>) {
  const fold = useRange(p, 0, 0.16, 1, 0);
  const railDraw = useRange(p, 0.02, 0.3, 0, 1);
  const capsuleW = useRange(p, 0.12, 0.92, 0, RAIL_X2 - 356);
  const capsuleLabel = useRange(p, 0.5, 0.7, 0, 1);

  return (
    <g>
      {/* the two lanes from scene 05 folding into one rail */}
      <motion.g style={{ opacity: fold }}>
        <line x1={RAIL_X1} y1={RAIL_Y - 52} x2={RAIL_X2} y2={RAIL_Y - 52} stroke="currentColor" strokeWidth={0.9} opacity={0.4} />
        <line x1={RAIL_X1} y1={RAIL_Y + 52} x2={RAIL_X2} y2={RAIL_Y + 52} stroke="currentColor" strokeWidth={0.9} opacity={0.4} />
      </motion.g>

      <motion.line
        x1={RAIL_X1}
        y1={RAIL_Y}
        x2={RAIL_X2}
        y2={RAIL_Y}
        stroke="currentColor"
        strokeWidth={0.9}
        opacity={0.45}
        style={{ scaleX: railDraw, originX: 0 }}
      />

      {Array.from({ length: N }, (_, i) => (
        <Token key={i} p={p} i={i} compact={compact} />
      ))}

      {/* one reusable pipeline */}
      <g>
        <motion.rect x={356} y={RAIL_Y - 13} height={26} fill="none" stroke={GREEN} strokeWidth={1.2} style={{ width: capsuleW }} />
        <motion.g style={{ opacity: capsuleLabel }}>
          <Ann x={362} y={RAIL_Y - 22} size={9} color={GREEN}>
            reusable pipeline
          </Ann>
        </motion.g>
      </g>

      <g transform={compact ? "translate(-40 0)" : ""}>
        {Array.from({ length: N }, (_, i) => (
          <Marker key={i} p={p} i={i} />
        ))}
        {Array.from({ length: N }, (_, i) => (
          <ActiveLabel key={`l-${i}`} p={p} i={i} />
        ))}
      </g>

      {Array.from({ length: N }, (_, i) => (
        <Backlog key={`b-${i}`} p={p} i={i} />
      ))}
      <Ann x={52} y={RAIL_Y - 84} size={8} color={ORANGE} opacity={0.8}>
        repeated manual work
      </Ann>

      <Ann x={RAIL_X1} y={RAIL_Y + 96} size={8} color={COBALT} opacity={0.7}>
        automation rail
      </Ann>
    </g>
  );
}
