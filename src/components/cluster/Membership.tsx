"use client";

import { MotionValue, motion, useTransform } from "framer-motion";
import { highlights } from "@/data/highlights";
import { profile } from "@/data/profile";
import { hexToRgba } from "@/lib/utils";
import { staggerWindow } from "./scroll";

const ACCENT = "#22d3ee";

function Row({
  progress,
  index,
  total,
  label,
  detail,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  label: string;
  detail: string;
}) {
  const [start, end] = staggerWindow(index, total, 0.18, 0.78);
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const x = useTransform(progress, [start, end], [-28, 0]);

  return (
    <motion.div
      style={{ opacity, x }}
      className="grid gap-1 border-b border-line/5 px-4 py-3 last:border-b-0 sm:grid-cols-[1.4fr_auto_auto_2fr] sm:gap-4"
    >
      <span className="text-xs font-medium text-zinc-100">{label}</span>
      <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px]" style={{ color: ACCENT }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#4ade80" }} />
        ALIVE
      </span>
      <span className="font-mono text-[10.5px] text-zinc-600">{index + 1}</span>
      <span className="text-[11px] leading-relaxed text-zinc-500">{detail}</span>
    </motion.div>
  );
}

export function Membership({ progress }: { progress: MotionValue<number> }) {
  const pillsOpacity = useTransform(progress, [0.1, 0.22], [0, 1]);
  const pillsY = useTransform(progress, [0.1, 0.22], [24, 0]);
  const footOpacity = useTransform(progress, [0.72, 0.85], [0, 1]);

  return (
    <div>
      <motion.div
        style={{ opacity: pillsOpacity, y: pillsY }}
        className="mb-4 flex flex-wrap gap-2 font-mono text-xs"
      >
        <span
          className="rounded-full border px-3 py-1 text-zinc-200"
          style={{ borderColor: hexToRgba(ACCENT, 0.3), background: hexToRgba(ACCENT, 0.06) }}
        >
          {profile.current}
        </span>
        <span className="rounded-full border border-line/10 px-3 py-1 text-zinc-300">
          {profile.previous}
        </span>
        <span className="rounded-full border border-line/10 px-3 py-1 text-zinc-300">
          {profile.education}
        </span>
      </motion.div>

      <div className="overflow-hidden rounded-xl border border-line/10 bg-ink-800/80 backdrop-blur">
        <div className="hidden grid-cols-[1.4fr_auto_auto_2fr] gap-4 border-b border-line/10 px-4 py-2.5 font-mono text-[10.5px] text-zinc-500 sm:grid">
          <span>node</span>
          <span>state</span>
          <span>incarnation</span>
          <span>metadata</span>
        </div>

        {highlights.map((h, i) => (
          <Row
            key={h.id}
            progress={progress}
            index={i}
            total={highlights.length}
            label={h.label}
            detail={h.detail}
          />
        ))}
      </div>

      <motion.p style={{ opacity: footOpacity }} className="mt-3 font-mono text-[10.5px] text-zinc-600">
        gossip converged · {highlights.length} members · 0 suspect · 0 failed
      </motion.p>
    </div>
  );
}
