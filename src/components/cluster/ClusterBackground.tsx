"use client";

import { MotionValue, motion, useReducedMotion, useTransform } from "framer-motion";
import { hexToRgba } from "@/lib/utils";
import { useIsLight } from "@/lib/useIsLight";

const ACCENT = "#22d3ee";
const INDIGO = "#6366f1";
const VIOLET = "#a78bfa";

// Fixed coordinates (0..1000 viewBox) keep server and client markup identical.
const MESH = [
  { x: 90, y: 170 },
  { x: 235, y: 620 },
  { x: 380, y: 280 },
  { x: 510, y: 740 },
  { x: 640, y: 215 },
  { x: 780, y: 575 },
  { x: 915, y: 330 },
  { x: 155, y: 880 },
  { x: 470, y: 455 },
  { x: 865, y: 830 },
];

const LINKS: [number, number][] = [
  [0, 2],
  [2, 4],
  [4, 6],
  [1, 3],
  [3, 5],
  [5, 9],
  [8, 2],
  [8, 3],
  [8, 4],
  [7, 1],
  [0, 1],
  [6, 5],
];

/**
 * The backdrop is driven by page scroll: the mesh flies toward the viewer and
 * rotates while the colour wash moves cyan -> indigo -> violet. Because the
 * scenery keeps changing, travelling down the page reads as moving through a
 * space rather than scrolling a document.
 */
export function ClusterBackground({ progress }: { progress: MotionValue<number> }) {
  const reduced = useReducedMotion();
  const isLight = useIsLight();
  const linkOpacity = isLight ? 0.16 : 0.1;

  const meshScale = useTransform(progress, [0, 1], [1, 1.75]);
  const meshRotate = useTransform(progress, [0, 1], [0, 20]);
  const meshY = useTransform(progress, [0, 1], ["0%", "-12%"]);
  const meshOpacity = useTransform(progress, [0, 0.55, 1], [1, 0.6, 0.28]);
  const gridOpacity = useTransform(progress, [0, 0.45], [0.5, 0.1]);

  // Three colour washes cross-fading across the journey.
  const cyanO = useTransform(progress, [0, 0.32], [0.95, 0]);
  const indigoO = useTransform(progress, [0.16, 0.45, 0.72], [0, 1, 0]);
  const violetO = useTransform(progress, [0.6, 0.9], [0, 0.95]);

  const washX = useTransform(progress, [0, 1], ["0%", "26%"]);
  const washY = useTransform(progress, [0, 1], ["0%", "-18%"]);
  const wash2X = useTransform(progress, [0, 1], ["0%", "-24%"]);

  const blob = (color: string) =>
    `radial-gradient(circle, ${hexToRgba(color, 0.18)} 0%, transparent 65%)`;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div className="grid-bg absolute inset-0" style={{ opacity: gridOpacity }} />

      {/* colour washes — which one dominates depends on how far you've travelled */}
      <motion.div
        className="absolute -left-1/4 top-[-20%] h-[75vh] w-[75vh] rounded-full blur-3xl"
        style={{ background: blob(ACCENT), opacity: cyanO, x: washX, y: washY }}
      />
      <motion.div
        className="absolute left-[20%] top-[15%] h-[80vh] w-[80vh] rounded-full blur-3xl"
        style={{ background: blob(INDIGO), opacity: indigoO, x: wash2X, y: washY }}
      />
      <motion.div
        className="absolute -right-1/4 bottom-[-25%] h-[85vh] w-[85vh] rounded-full blur-3xl"
        style={{ background: blob(VIOLET), opacity: violetO, x: washX }}
      />

      <motion.svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        style={{ scale: meshScale, rotate: meshRotate, y: meshY, opacity: meshOpacity }}
      >
        {LINKS.map(([a, b], i) => (
          <line
            key={`l-${i}`}
            x1={MESH[a].x}
            y1={MESH[a].y}
            x2={MESH[b].x}
            y2={MESH[b].y}
            stroke={hexToRgba(ACCENT, linkOpacity)}
            strokeWidth={1}
          />
        ))}
        {MESH.map((n, i) => (
          <motion.circle
            key={`n-${i}`}
            cx={n.x}
            cy={n.y}
            r={2.5}
            fill={hexToRgba(ACCENT, 0.5)}
            initial={{ opacity: 0.4 }}
            animate={reduced ? undefined : { opacity: [0.25, 0.8, 0.25] }}
            transition={{ duration: 3.6, repeat: Infinity, delay: i * 0.42, ease: "easeInOut" }}
          />
        ))}
      </motion.svg>

      {/* Vignette keeps the mesh from competing with the foreground cards. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgb(var(--ink-900) / 0.78) 100%)",
        }}
      />
    </div>
  );
}
