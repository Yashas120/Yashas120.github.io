"use client";

import { motion } from "framer-motion";
import { Lock, Timer } from "lucide-react";
import { hexToRgba } from "@/lib/utils";
import { StepRail, useSequence } from "./Sequence";
import { ACCENT, GREEN, VIOLET } from "./palette";

const STEPS = ["serial plan", "what is independent", "run it together", "gate the rest", "measured result"];

interface Bar {
  id: string;
  label: string;
  start: number;
  dur: number;
  lane: number;
  /** Prerequisite-bound work stays behind a gate no matter how slow that makes it. */
  gated?: boolean;
}

// Units are relative: the serial plan is 100 wide, so every bar reads as a share
// of the deployment it used to take.
const SERIAL: Bar[] = [
  { id: "net", label: "networking", start: 0, dur: 12, lane: 0 },
  { id: "iam", label: "IAM", start: 12, dur: 8, lane: 0 },
  { id: "queues", label: "queues + topics", start: 20, dur: 10, lane: 0 },
  { id: "db", label: "databases · 3 regions", start: 30, dur: 26, lane: 0, gated: true },
  { id: "compute", label: "compute", start: 56, dur: 16, lane: 0, gated: true },
  { id: "lambda", label: "functions", start: 72, dur: 12, lane: 0, gated: true },
  { id: "svc", label: "services", start: 84, dur: 10, lane: 0, gated: true },
  { id: "verify", label: "verification", start: 94, dur: 6, lane: 0, gated: true },
];

const PLANNED: Bar[] = [
  { id: "net", label: "networking", start: 0, dur: 12, lane: 0 },
  { id: "iam", label: "IAM", start: 0, dur: 8, lane: 1 },
  { id: "queues", label: "queues + topics", start: 0, dur: 10, lane: 2 },
  { id: "db-a", label: "databases · region A", start: 12, dur: 10, lane: 0, gated: true },
  { id: "db-b", label: "region B", start: 12, dur: 10, lane: 1, gated: true },
  { id: "db-c", label: "region C", start: 12, dur: 10, lane: 2, gated: true },
  { id: "compute", label: "compute", start: 22, dur: 12, lane: 0, gated: true },
  { id: "lambda", label: "functions", start: 22, dur: 10, lane: 1, gated: true },
  { id: "svc", label: "services", start: 34, dur: 8, lane: 0, gated: true },
  { id: "verify", label: "verification", start: 42, dur: 6, lane: 0, gated: true },
];

const PLANNED_TOTAL = 48;
const GATES = [12, 22, 34];
const LANE_H = 20;

function Chart({
  bars,
  lanes,
  show,
  highlightIndependent,
  showGates,
  accent,
}: {
  bars: Bar[];
  lanes: number;
  show: boolean;
  highlightIndependent: boolean;
  showGates: boolean;
  accent: string;
}) {
  return (
    <div className="relative w-full" style={{ height: lanes * LANE_H + 4 }}>
      {showGates &&
        GATES.map((g) => (
          <div
            key={g}
            className="absolute top-0 border-l border-dashed"
            style={{ left: `${g}%`, height: lanes * LANE_H, borderColor: hexToRgba(VIOLET, 0.5) }}
          />
        ))}

      {bars.map((b, i) => {
        const independent = !b.gated;
        const dim = highlightIndependent && !independent;
        const color = independent ? accent : VIOLET;
        return (
          <motion.div
            key={b.id}
            className="absolute overflow-hidden rounded-sm border"
            style={{
              left: `${b.start}%`,
              top: b.lane * LANE_H,
              height: LANE_H - 5,
              borderColor: hexToRgba(color, 0.45),
              background: hexToRgba(color, 0.16),
            }}
            initial={false}
            animate={{ width: show ? `${b.dur}%` : 0, opacity: show ? (dim ? 0.3 : 1) : 0 }}
            transition={{ duration: 0.45, delay: show ? i * 0.05 : 0 }}
          >
            <span className="block truncate px-1.5 font-mono text-[9px] leading-[15px]" style={{ color }}>
              {b.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

export function DependencyPlan() {
  const { ref, step, goTo, replay, reduced } = useSequence(STEPS.length, 1700);

  const highlight = step === 1;
  const planned = step >= 2;
  const gated = step >= 3;
  const measured = step >= 4;

  const caption = [
    "Deployed serially, every stage waits for the one before it — including the stages that never needed to.",
    "Some resources and services are genuinely independent. Others cannot start until their prerequisites are healthy.",
    "The independent work runs concurrently, including database bring-up across three regions.",
    "Dependent stages stay gated behind a healthy prerequisite, so faster never means unsafe.",
    "Independent work runs concurrently while prerequisite-bound stages remain behind explicit health gates.",
  ][step];

  return (
    <div ref={ref} className="overflow-hidden rounded-xl border border-line/10 bg-ink-800">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/10 px-4 py-2.5 font-mono text-[11px]">
        <span className="text-zinc-400">deployment order · independent vs prerequisite-bound</span>
        <span className="text-zinc-600">relative to one full serial deployment</span>
      </div>

      <div className="p-4">
        <div className="rounded-lg border border-line/10 bg-ink-900/50 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">everything serial</p>
          <Chart bars={SERIAL} lanes={1} show highlightIndependent={highlight} showGates={false} accent={ACCENT} />
          <p className="mt-1 text-right font-mono text-[10px] text-zinc-500">100% of the original deployment window</p>
        </div>

        <div className="mt-3 rounded-lg border border-line/10 bg-ink-900/50 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
            independent work concurrent · dependent stages gated
          </p>
          <Chart bars={PLANNED} lanes={3} show={planned} highlightIndependent={false} showGates={gated} accent={ACCENT} />
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: gated ? VIOLET : "rgb(var(--zinc-600))" }}>
              <Lock className="h-3 w-3" /> dashed line = prerequisite must be healthy first
            </span>
            <motion.span animate={{ opacity: planned ? 1 : 0.2 }} className="font-mono text-[10px]" style={{ color: GREEN }}>
              ~{PLANNED_TOTAL}% of the original window
            </motion.span>
          </div>
        </div>

        <motion.div
          animate={{ opacity: measured ? 1 : 0.25 }}
          className="mt-3 grid gap-2 sm:grid-cols-2"
        >
          <div className="rounded-md border px-3 py-2" style={{ borderColor: hexToRgba(GREEN, 0.35), background: hexToRgba(GREEN, 0.06) }}>
            <p className="flex items-center gap-1.5 font-mono text-lg font-semibold leading-none" style={{ color: GREEN }}>
              <Timer className="h-4 w-4" /> parallel-safe
            </p>
            <p className="mt-1 text-[11px] leading-snug text-zinc-500">less overall deployment time</p>
          </div>
          <div className="rounded-md border px-3 py-2" style={{ borderColor: hexToRgba(GREEN, 0.35), background: hexToRgba(GREEN, 0.06) }}>
            <p className="font-mono text-lg font-semibold leading-none" style={{ color: GREEN }}>
              gated release
            </p>
            <p className="mt-1 text-[11px] leading-snug text-zinc-500">
              saved by parallel database bring-up across three regions, in applicable deployments
            </p>
          </div>
        </motion.div>

        <p className="mt-3 text-[12px] leading-relaxed text-zinc-400">{caption}</p>

        <StepRail steps={STEPS} step={step} accent={ACCENT} onSelect={goTo} onReplay={replay} reduced={reduced} />
      </div>
    </div>
  );
}
