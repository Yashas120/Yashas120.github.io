"use client";

import { MotionValue, motion, useTransform } from "framer-motion";
import { metrics } from "@/data/metrics";
import { StaggerItem, staggerWindow } from "./scroll";

const ACCENT = "#22d3ee";

/** Deterministic shape — decorative, not derived from a real time series. */
function Spark({
  progress,
  index,
  total,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const [start, end] = staggerWindow(index, total);
  const pathLength = useTransform(progress, [start, end], [0, 1]);

  const points = Array.from({ length: 20 }, (_, i) => {
    const y = 20 - (Math.sin(i * 0.78 + index) * 4.5 + (i % 4) * 1.4 + 7);
    return `${(i / 19) * 100},${y.toFixed(2)}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-9 w-full">
      <motion.polyline
        points={points}
        fill="none"
        stroke={ACCENT}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        style={{ pathLength }}
      />
    </svg>
  );
}

export function SloDashboard({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((m, i) => (
        <StaggerItem key={m.label} progress={progress} index={i} total={metrics.length}>
          <div className="h-full rounded-xl border border-line/10 bg-ink-800/80 p-4 backdrop-blur">
            <p className="font-mono text-[10.5px] text-zinc-500">{m.label}</p>
            <p className="mt-1 font-mono text-2xl font-semibold" style={{ color: ACCENT }}>
              {m.value}
            </p>
            <Spark progress={progress} index={i} total={metrics.length} />
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{m.context}</p>
          </div>
        </StaggerItem>
      ))}
    </div>
  );
}
