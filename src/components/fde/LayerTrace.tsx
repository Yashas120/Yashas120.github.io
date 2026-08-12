"use client";

import { motion } from "framer-motion";
import { Check, FileSearch, Layers, ShieldQuestion, UserCheck, X } from "lucide-react";
import { ReviewGate } from "@/components/shared/ReviewGate";
import { hexToRgba } from "@/lib/utils";
import { StepRail, useSequence } from "./Sequence";
import { ACCENT, GREEN, RED, VIOLET } from "./palette";

const STEPS = ["the symptom", "frontend", "backend service", "compiled dependency", "authorization", "confirm intent"];

const LAYERS = [
  { id: "ui", label: "frontend", note: "the action renders for one user and not the other", source: true },
  { id: "svc", label: "backend service", note: "no simple condition explains the difference", source: true },
  { id: "jar", label: "compiled dependency", note: "two Java archives with no available source", source: false },
  { id: "authz", label: "authorization", note: "the effective state that actually decides", source: true },
];

function UserRow({ label, allowed, revealed }: { label: string; allowed: boolean; revealed: boolean }) {
  const color = allowed ? GREEN : RED;
  return (
    <div
      className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-2"
      style={{ borderColor: hexToRgba(color, 0.35), background: hexToRgba(color, 0.06) }}
    >
      <span className="font-mono text-[10px] text-zinc-300">{label}</span>
      <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color }}>
        {allowed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
        {revealed ? (allowed ? "action available" : "action missing") : "?"}
      </span>
    </div>
  );
}

export function LayerTrace() {
  const { ref, step, goTo, replay, reduced } = useSequence(STEPS.length, 1700);

  // step 1..4 walk the layers; the trace reaches layer index step-1.
  const reached = Math.min(step - 1, LAYERS.length - 1);
  const confirmed = step >= 5;

  const caption = [
    "One production user cannot see an authorization-dependent action that appears correctly for another.",
    "The frontend is where it shows up, but a simple frontend condition does not explain it.",
    "The request path continues into the backend service, and the difference still is not there.",
    "Two dependencies in the path have no available source, so they were decompiled to read the logic that was actually running.",
    "With the effective authorization path reconstructed, the working and failing role combinations can be compared — without experimenting in production.",
    "Product management and support confirm the access that was intended, and only then is the least-risk correction recommended.",
  ][step];

  return (
    <div ref={ref} className="overflow-hidden rounded-xl border border-line/10 bg-ink-800">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/10 px-4 py-2.5 font-mono text-[11px]">
        <span className="flex items-center gap-2 text-zinc-400">
          <Layers className="h-3.5 w-3.5" style={{ color: ACCENT }} /> one symptom · four codebases
        </span>
        <span className="text-zinc-600">no customer, repository or role names</span>
      </div>

      <div className="p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="rounded-lg border border-line/10 bg-ink-900/50 p-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">what the users see</p>
            <div className="space-y-2">
              <UserRow label="user with the working behavior" allowed revealed={step >= 0} />
              <UserRow label="user reporting the problem" allowed={false} revealed={step >= 0} />
            </div>
            <motion.p animate={{ opacity: step >= 4 ? 1 : 0.25 }} className="mt-3 text-[11px] leading-relaxed text-zinc-400">
              The difference is an effective authorization state, not a missing button. Comparing the two role combinations
              is what identifies it.
            </motion.p>
          </div>

          <div className="rounded-lg border border-line/10 bg-ink-900/50 p-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">the path the trace had to cross</p>
            <div className="space-y-1.5">
              {LAYERS.map((l, i) => {
                const on = step >= 1 && i <= reached;
                const active = step >= 1 && i === reached;
                const color = l.source ? ACCENT : VIOLET;
                return (
                  <motion.div
                    key={l.id}
                    animate={{ opacity: on ? 1 : 0.25, x: active ? 4 : 0 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-md border px-2.5 py-2"
                    style={{
                      borderColor: on ? hexToRgba(color, 0.4) : "rgb(var(--line) / 0.1)",
                      background: on ? hexToRgba(color, 0.06) : "transparent",
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="font-mono text-[10px]" style={{ color: on ? color : "rgb(var(--zinc-600))" }}>
                        {l.label}
                      </span>
                      {!l.source && (
                        <span
                          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9px]"
                          style={{ background: hexToRgba(VIOLET, 0.14), color: VIOLET }}
                        >
                          <FileSearch className="h-2.5 w-2.5" /> no source · decompiled
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-zinc-500">{l.note}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <motion.div animate={{ opacity: confirmed ? 1 : 0.25 }} className="mt-3">
          <ReviewGate
            title="confirm the intended access before touching production"
            summary="effective authorization state identified"
            checks={[
              { label: "production experiments", result: "none run", level: "pass" },
              { label: "role combinations", result: "working vs failing compared", level: "pass" },
              { label: "intended access", result: confirmed ? "confirmed with product + support" : "not yet confirmed", level: confirmed ? "pass" : "warn" },
            ]}
            note="A code observation is not a resolution. The correction is only recommended once the people who own the rule agree what the rule is."
            icon={confirmed ? UserCheck : ShieldQuestion}
            tone={VIOLET}
            pass={GREEN}
          />
        </motion.div>

        <p className="mt-3 text-[12px] leading-relaxed text-zinc-400">{caption}</p>

        <StepRail steps={STEPS} step={step} accent={ACCENT} onSelect={goTo} onReplay={replay} reduced={reduced} />
      </div>
    </div>
  );
}
