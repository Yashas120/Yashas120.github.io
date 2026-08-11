"use client";

import { MotionValue, motion, useReducedMotion, useTransform } from "framer-motion";
import { useIsLight } from "@/lib/useIsLight";
import { FLOOR_Y, FRONT_RACKS, PAN } from "@/lib/racks";

// Outlined data-center backdrop: rows of racks (the cluster nodes) in light/dark,
// gently panning as you step through scenes — the "camera through the aisles" feel.
// Purely ambient; the foreground scene carries the content.

export function ServerRoom({ progress }: Readonly<{ progress: MotionValue<number> }>) {
  const isLight = useIsLight();
  const reduced = useReducedMotion();
  const stroke = isLight ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.08)";
  const strokeDim = isLight ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.045)";

  const x = useTransform(progress, [0, 1], PAN.x);
  const scale = useTransform(progress, [0, 1], PAN.scale);

  // a dim back-row rack (decorative only)
  const backRack = (key: string, rx: number, w: number, h: number) => {
    const units = Math.floor(h / 14);
    return (
      <g key={key}>
        <rect x={rx} y={FLOOR_Y - h} width={w} height={h} rx={3} fill="none" stroke={strokeDim} strokeWidth={1} />
        {Array.from({ length: units }, (_, u) => (
          <line key={u} x1={rx + 2} y1={FLOOR_Y - h + 10 + u * 14} x2={rx + w - 2} y2={FLOOR_Y - h + 10 + u * 14} stroke={strokeDim} strokeWidth={0.75} />
        ))}
      </g>
    );
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-25" />
      <motion.svg
        viewBox="0 0 640 240"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
        style={{ x, scale }}
      >
        {/* back row (dim, smaller) */}
        {Array.from({ length: 10 }, (_, i) => backRack(`b-${i}`, 30 + i * 62, 44, 96))}
        {/* front row (brighter, taller) — the cluster nodes */}
        {FRONT_RACKS.map((rk) => {
          const units = Math.floor(rk.h / 14);
          return (
            <g key={`f-${rk.i}`}>
              <rect x={rk.x} y={rk.yTop} width={rk.w} height={rk.h} rx={3} fill="none" stroke={stroke} strokeWidth={1} />
              {Array.from({ length: units }, (_, u) => (
                <line key={u} x1={rk.x + 2} y1={rk.yTop + 10 + u * 14} x2={rk.x + rk.w - 2} y2={rk.yTop + 10 + u * 14} stroke={stroke} strokeWidth={0.75} />
              ))}
              <circle cx={rk.x + 6} cy={rk.yTop + 6} r={1.4} fill="#4ade80" opacity={0.55} />
              <circle cx={rk.x + 11} cy={rk.yTop + 6} r={1.4} fill="#22d3ee" opacity={0.5} />
              <text x={rk.cx} y={FLOOR_Y + 9} textAnchor="middle" fontSize={6} fontFamily="ui-monospace, monospace" fill={strokeDim}>
                n{rk.i}
              </text>
            </g>
          );
        })}
        {/* floor line */}
        <line x1={0} y1={FLOOR_Y} x2={640} y2={FLOOR_Y} stroke={stroke} strokeWidth={1} />

        {/* a few blinking activity LEDs along the aisle */}
        {!reduced &&
          Array.from({ length: 8 }, (_, i) => (
            <motion.circle
              key={`led-${i}`}
              cx={30 + i * 80}
              cy={90 + (i % 3) * 20}
              r={1.5}
              fill="#22d3ee"
              animate={{ opacity: [0.12, 0.55, 0.12] }}
              transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.35, ease: "easeInOut" }}
            />
          ))}
      </motion.svg>

      {/* vignette so foreground scenes stay legible */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgb(var(--ink-900) / 0.88) 100%)" }}
      />
    </div>
  );
}
