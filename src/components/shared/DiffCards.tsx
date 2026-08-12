"use client";

import { motion } from "framer-motion";
import { hexToRgba } from "@/lib/utils";

export interface DiffEntry {
  id: string;
  title: string;
  before: string[];
  after: string[];
  delta: string;
}

export interface DiffCardsProps {
  entries: DiffEntry[];
  accent: string;
  removed?: string;
  added?: string;
  labels?: { before: string; after: string };
  columnsClass?: string;
}

function Line({ sign, text, removed, added }: { sign: "-" | "+"; text: string; removed: string; added: string }) {
  const color = sign === "-" ? removed : added;
  return (
    <p
      className={`flex gap-2 px-3 py-1 font-mono text-[11px] leading-relaxed ${sign === "-" ? "text-zinc-500" : "text-zinc-200"}`}
      style={{ background: hexToRgba(color, 0.06) }}
    >
      <span style={{ color }}>{sign}</span>
      <span>{text}</span>
    </p>
  );
}

/**
 * Side-by-side "how it used to go" against "what shipped instead", read as a
 * diff. The delta chip carries the measured result.
 */
export function DiffCards({
  entries,
  accent,
  removed = "#f87171",
  added = "#4ade80",
  labels = { before: "--- the manual way", after: "+++ what shipped instead" },
  columnsClass = "lg:grid-cols-2",
}: DiffCardsProps) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${columnsClass}`}>
      {entries.map((d, i) => (
        <motion.div
          key={d.id}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className="overflow-hidden rounded-xl border border-line/10 bg-ink-800"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/10 px-4 py-2.5">
            <span className="font-mono text-[11px] text-zinc-300">{d.title}</span>
            <span className="rounded-full px-2 py-0.5 font-mono text-[10px]" style={{ background: hexToRgba(accent, 0.12), color: accent }}>
              {d.delta}
            </span>
          </div>

          <div className="px-4 pt-2 font-mono text-[10px] text-zinc-600">{labels.before}</div>
          <div className="mt-1 space-y-px px-1">
            {d.before.map((b) => (
              <Line key={b} sign="-" text={b} removed={removed} added={added} />
            ))}
          </div>

          <div className="px-4 pt-2.5 font-mono text-[10px] text-zinc-600">{labels.after}</div>
          <div className="mb-3 mt-1 space-y-px px-1">
            {d.after.map((a) => (
              <Line key={a} sign="+" text={a} removed={removed} added={added} />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
