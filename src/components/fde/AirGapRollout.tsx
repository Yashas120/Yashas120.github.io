"use client";

import { motion } from "framer-motion";
import { CloudOff, PackageSearch, ShieldCheck } from "lucide-react";
import { hexToRgba } from "@/lib/utils";
import { StepRail, useSequence } from "./Sequence";
import { ACCENT, GREEN, VIOLET } from "./palette";

const STEPS = ["the estate", "the air gap", "rollout", "the hard three", "no downtime"];

const TOTAL = 50;
/** The three legacy environments that needed dependency remediation and decompilation. */
const HARD = [11, 27, 43];

export function AirGapRollout() {
  const { ref, step, goTo, replay, reduced } = useSequence(STEPS.length, 1700);

  const gapped = step >= 1;
  const rolling = step >= 2;
  const hard = step >= 3;
  const done = step >= 4;

  const caption = [
    "Approximately 50 virtual-machine environments running an end-of-life logging library.",
    "No internet, and no ordinary internet-based build path — every dependency has to arrive another way.",
    "Environments move to a patched release progressively rather than all at once.",
    "Three legacy environments need deeper dependency remediation and decompilation, because their source is unavailable.",
    "The rollout completes without downtime.",
  ][step];

  return (
    <div ref={ref} className="overflow-hidden rounded-xl border border-line/10 bg-ink-800">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/10 px-4 py-2.5 font-mono text-[11px]">
        <span className="text-zinc-400">air-gapped estate · end-of-life logging library → patched release</span>
        <span className="text-zinc-600">worked on, as part of a team</span>
      </div>

      <div className="p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="flex flex-col gap-2">
            <motion.div
              animate={{ opacity: gapped ? 1 : 0.3 }}
              className="rounded-md border px-3 py-2.5"
              style={{ borderColor: hexToRgba(VIOLET, 0.35), background: hexToRgba(VIOLET, 0.06) }}
            >
              <p className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: VIOLET }}>
                <CloudOff className="h-3 w-3" /> the constraint
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                No internet. Ordinary build paths that fetch dependencies on demand simply do not exist here.
              </p>
            </motion.div>

            <motion.div
              animate={{ opacity: hard ? 1 : 0.3 }}
              className="rounded-md border px-3 py-2.5"
              style={{ borderColor: hexToRgba(ACCENT, 0.35), background: hexToRgba(ACCENT, 0.06) }}
            >
              <p className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: ACCENT }}>
                <PackageSearch className="h-3 w-3" /> three legacy environments
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                Deeper dependency remediation and decompilation, because source and the usual build route were unavailable.
              </p>
            </motion.div>

            <motion.div
              animate={{ opacity: done ? 1 : 0.3 }}
              className="mt-auto rounded-md border px-3 py-2.5"
              style={{ borderColor: hexToRgba(GREEN, 0.35), background: hexToRgba(GREEN, 0.06) }}
            >
              <p className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: GREEN }}>
                <ShieldCheck className="h-3 w-3" /> completed without downtime
              </p>
            </motion.div>
          </div>

          <div className="rounded-lg border border-line/10 bg-ink-900/50 p-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">~50 VM environments</p>
            <div className="grid grid-cols-10 gap-1.5" role="img" aria-label="Approximately 50 air-gapped environments moving from an end-of-life logging library to a patched release, three of them requiring deeper remediation">
              {Array.from({ length: TOTAL }, (_, i) => {
                const isHard = HARD.includes(i);
                const patched = rolling && (!isHard || hard);
                const color = patched ? (isHard ? ACCENT : GREEN) : VIOLET;
                return (
                  <motion.span
                    key={i}
                    animate={{
                      backgroundColor: hexToRgba(color, patched ? 0.55 : 0.18),
                      borderColor: hexToRgba(color, patched ? 0.8 : 0.3),
                    }}
                    transition={{ duration: 0.4, delay: rolling ? (isHard ? 0.6 : i * 0.02) : 0 }}
                    className="aspect-square rounded-sm border"
                  />
                );
              })}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-3 font-mono text-[9px] text-zinc-500">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm" style={{ background: hexToRgba(VIOLET, 0.5) }} /> end-of-life
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm" style={{ background: hexToRgba(GREEN, 0.6) }} /> patched release
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm" style={{ background: hexToRgba(ACCENT, 0.7) }} /> needed decompilation
              </span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[12px] leading-relaxed text-zinc-400">{caption}</p>

        <StepRail steps={STEPS} step={step} accent={ACCENT} onSelect={goTo} onReplay={replay} reduced={reduced} />
      </div>
    </div>
  );
}
