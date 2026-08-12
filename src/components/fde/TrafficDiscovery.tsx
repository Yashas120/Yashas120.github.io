"use client";

import { motion } from "framer-motion";
import { Activity, CheckCircle2, FileText, HelpCircle, Users } from "lucide-react";
import { discoveryFacts } from "@/data/fde";
import { hexToRgba } from "@/lib/utils";
import { StepRail, useSequence } from "./Sequence";
import { ACCENT, GREEN, VIOLET } from "./palette";

const STEPS = ["config records", "read the traffic", "real consumers", "owning teams", "staged rollout", "cutover"];

/** Illustrative shape only: some consumers are on the list, most are not. */
const DOCUMENTED = ["consumer-1", "consumer-2", "consumer-3"];

// Exact counts are employer figures held under disclosure review, so the
// diagram shows the shape of the discovery without publishing the numbers.
// `discoveryFacts.approved` is the single switch for both.
const TEAMS = discoveryFacts.approved ? "12" : "multiple";
const INTEGRATIONS_LABEL = discoveryFacts.approved ? "~30" : "many";
const TRAFFIC_LABEL = discoveryFacts.approved ? "~500,000 API calls / day" : "high, continuous request volume";
/** Marker count is a visual density, not a published figure. */
const MARKERS = 30;

function Gate({ label, state, note }: { label: string; state: "idle" | "running" | "passed"; note: string }) {
  const color = state === "passed" ? GREEN : state === "running" ? ACCENT : "rgb(var(--zinc-600))";
  return (
    <div
      className="flex-1 rounded-md border px-3 py-2"
      style={{
        borderColor: state === "idle" ? "rgb(var(--line) / 0.12)" : hexToRgba(state === "passed" ? GREEN : ACCENT, 0.4),
        background: state === "idle" ? "transparent" : hexToRgba(state === "passed" ? GREEN : ACCENT, 0.06),
      }}
    >
      <p className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color }}>
        {state === "passed" ? <CheckCircle2 className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
        {label}
      </p>
      <p className="mt-0.5 text-[11px] leading-snug text-zinc-500">{note}</p>
    </div>
  );
}

export function TrafficDiscovery() {
  const { ref, step, goTo, replay, reduced } = useSequence(STEPS.length, 1700);

  const reading = step >= 1;
  const resolved = step >= 2;
  const grouped = step >= 3;
  const rolling = step >= 4;
  const done = step >= 5;

  const caption = [
    "The configuration records name a few consumers. Nothing guarantees that list is complete.",
    "Splunk traffic analysis reads which systems are actually calling the affected APIs.",
    "The traffic names integrations that no record mentioned.",
    "Each observed integration is connected back to the team that owns it, before anything changes.",
    "Rollout is sequenced by environment, with deployment-controlled feature flags. A staging failure is feedback, not an incident.",
    "The production cutover completes without customer impact.",
  ][step];

  return (
    <div ref={ref} className="overflow-hidden rounded-xl border border-line/10 bg-ink-800">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/10 px-4 py-2.5 font-mono text-[11px]">
        <span className="text-zinc-400">who is actually calling this?</span>
        <span className="text-zinc-600">evidence over assumption</span>
      </div>

      <div className="p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-line/10 bg-ink-900/50 p-3">
            <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
              <FileText className="h-3 w-3" /> configuration records
            </p>
            <div className="space-y-1 font-mono text-[10px]">
              {DOCUMENTED.map((d) => (
                <p key={d} className="rounded border border-line/10 px-2 py-1 text-zinc-400">
                  {d}
                </p>
              ))}
              <p
                className="flex items-center gap-1.5 rounded border border-dashed px-2 py-1"
                style={{ borderColor: hexToRgba(VIOLET, 0.4), color: VIOLET }}
              >
                <HelpCircle className="h-3 w-3" /> is this everyone?
              </p>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
              Not sufficient to identify every active consumer — so it is not the thing to plan a cutover against.
            </p>
          </div>

          <div className="rounded-lg border border-line/10 bg-ink-900/50 p-3">
            <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
              <Activity className="h-3 w-3" /> production traffic
            </p>

            <div className="relative h-16 overflow-hidden rounded-md border border-line/10">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="absolute inset-x-0" style={{ top: 8 + row * 13 }}>
                  <div className="h-px w-full" style={{ background: hexToRgba(ACCENT, reading ? 0.18 : 0.06) }} />
                  {reading && (
                    <motion.span
                      className="absolute top-0 h-1 w-1 -translate-y-1/2 rounded-full"
                      style={{ background: ACCENT, boxShadow: `0 0 6px ${hexToRgba(ACCENT, 0.9)}` }}
                      initial={{ left: "-2%" }}
                      animate={{ left: ["-2%", "100%"] }}
                      transition={{ duration: 2.1, repeat: Infinity, ease: "linear", delay: row * 0.4 }}
                    />
                  )}
                </div>
              ))}
              <p className="absolute bottom-1 right-2 font-mono text-[9px] text-zinc-600">{TRAFFIC_LABEL}</p>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <motion.div
                animate={{ opacity: resolved ? 1 : 0.25 }}
                className="rounded-md border px-2 py-1.5"
                style={{ borderColor: hexToRgba(ACCENT, 0.3), background: hexToRgba(ACCENT, 0.06) }}
              >
                <p className="font-mono text-lg font-semibold leading-none" style={{ color: ACCENT }}>
                  {INTEGRATIONS_LABEL}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-zinc-500">undocumented integrations found</p>
              </motion.div>
              <motion.div
                animate={{ opacity: grouped ? 1 : 0.25 }}
                className="rounded-md border px-2 py-1.5"
                style={{ borderColor: hexToRgba(VIOLET, 0.3), background: hexToRgba(VIOLET, 0.06) }}
              >
                <p className="flex items-center gap-1.5 font-mono text-lg font-semibold leading-none" style={{ color: VIOLET }}>
                  <Users className="h-4 w-4" /> {TEAMS}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-zinc-500">owning teams to coordinate</p>

              </motion.div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {Array.from({ length: MARKERS }, (_, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  animate={{
                    opacity: resolved ? 1 : 0.12,
                    backgroundColor: grouped ? hexToRgba(VIOLET, 0.5) : hexToRgba(ACCENT, 0.6),
                  }}
                  transition={{ delay: resolved ? i * 0.012 : 0, duration: 0.3 }}
                  className="h-2 w-2 rounded-sm"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Gate
            label="staging"
            state={done ? "passed" : rolling ? "running" : "idle"}
            note="validate behind deployment-controlled feature flags"
          />
          <Gate label="production" state={done ? "passed" : "idle"} note="cutover only after staging holds" />
          <Gate label="customer impact" state={done ? "passed" : "idle"} note={done ? "none" : "the thing being protected"} />
        </div>

        <p className="mt-3 text-[12px] leading-relaxed text-zinc-400">{caption}</p>

        <StepRail steps={STEPS} step={step} accent={ACCENT} onSelect={goTo} onReplay={replay} reduced={reduced} />
      </div>
    </div>
  );
}
