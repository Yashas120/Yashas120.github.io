"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Boxes, FileQuestion, MessagesSquare, PackageCheck, ServerCog } from "lucide-react";
import { hexToRgba } from "@/lib/utils";
import { StepRail, useSequence } from "./Sequence";
import { ACCENT, GREEN, VIOLET } from "./palette";

const STEPS = ["brief", "signals", "scope", "build", "deploy", "feedback", "pattern"];

/** The four real-world inputs that turn a vague brief into a scoped one. */
const SIGNALS = [
  { id: "workflow", label: "workflow", note: "what people do today, step by step" },
  { id: "users", label: "users", note: "who is blocked, and how often" },
  { id: "constraints", label: "constraints", note: "environment, access, approvals, time" },
  { id: "data", label: "data", note: "the records and systems that already exist" },
];

const SCOPED = [
  "the decision the workflow actually makes",
  "who is blocked, and how often",
  "where the data already lives",
  "what the environment will allow",
];

const PARTS = [
  { id: "app", label: "application" },
  { id: "data", label: "data" },
  { id: "infra", label: "infrastructure" },
];

function Zone({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">{title}</p>
      <div className="flex min-h-[188px] flex-1 flex-col gap-2 rounded-lg border border-line/10 bg-ink-900/50 p-3">{children}</div>
    </div>
  );
}

function Chip({ label, color, on, delay = 0 }: { label: string; color: string; on: boolean; delay?: number }) {
  return (
    <motion.span
      animate={{ opacity: on ? 1 : 0.18, y: on ? 0 : 4 }}
      transition={{ duration: 0.35, delay: on ? delay : 0 }}
      className="inline-flex items-center rounded-md border px-2 py-1 font-mono text-[10px]"
      style={{ borderColor: hexToRgba(color, on ? 0.45 : 0.15), background: hexToRgba(color, on ? 0.1 : 0.03), color: on ? color : "rgb(var(--zinc-600))" }}
    >
      {label}
    </motion.span>
  );
}

export function DeliveryLoop() {
  const { ref, step, goTo, replay, reduced } = useSequence(STEPS.length, 1500);

  const scoped = step >= 2;
  const built = step >= 3;
  const deployed = step >= 4;
  const feedback = step >= 5;
  const pattern = step >= 6;

  const caption = [
    "An incomplete brief enters the system.",
    "Domain signals, user constraints, data sources and environment constraints appear.",
    "Those inputs resolve into a scoped technical model.",
    "Application, data and infrastructure components assemble.",
    "The solution moves into a deployment environment.",
    "Adoption and operational feedback return.",
    "The successful pattern becomes a reusable module or playbook.",
  ][step];

  return (
    <div ref={ref} className="overflow-hidden rounded-xl border border-line/10 bg-ink-800">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/10 px-4 py-2.5 font-mono text-[11px]">
        <span className="text-zinc-400">field delivery loop</span>
        <span className="text-zinc-600">discover → model → build → deploy → learn → codify</span>
      </div>

      <div className="p-4">
        <div className="grid gap-3 lg:grid-cols-3">
          <Zone title="Operational reality">
            <div
              className="rounded-md border p-2.5"
              style={{ borderColor: hexToRgba(scoped ? ACCENT : VIOLET, 0.35), background: hexToRgba(scoped ? ACCENT : VIOLET, 0.06) }}
            >
              <p className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: scoped ? ACCENT : VIOLET }}>
                <FileQuestion className="h-3 w-3" /> {scoped ? "scoped brief" : "incomplete brief"}
              </p>
              <AnimatePresence mode="wait" initial={false}>
                {scoped ? (
                  <motion.ul
                    key="scoped"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-1.5 space-y-1"
                  >
                    {SCOPED.map((s, i) => (
                      <motion.li
                        key={s}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex gap-1.5 text-[11px] leading-snug text-zinc-300"
                      >
                        <span style={{ color: ACCENT }}>·</span>
                        {s}
                      </motion.li>
                    ))}
                  </motion.ul>
                ) : (
                  <motion.div key="vague" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-1.5">
                    <p className="text-[11px] italic leading-snug text-zinc-400">
                      &ldquo;the current process takes too long&rdquo;
                    </p>
                    <div className="mt-1.5 space-y-1" aria-hidden>
                      {[86, 64, 74].map((w) => (
                        <div key={w} className="h-1.5 rounded-full bg-line/10" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {SIGNALS.map((s, i) => (
                <Chip key={s.id} label={s.label} color={VIOLET} on={step >= 1} delay={i * 0.1} />
              ))}
            </div>
            <p className="mt-auto text-[10px] leading-snug text-zinc-600">
              {step >= 1 ? SIGNALS[Math.min(step, SIGNALS.length - 1)].note : "nothing is specified yet"}
            </p>
          </Zone>

          <Zone title="Delivery workspace">
            <div className="flex flex-wrap gap-1.5">
              <Chip label="prototype" color={ACCENT} on={built} />
              {PARTS.map((p, i) => (
                <Chip key={p.id} label={p.label} color={ACCENT} on={built} delay={0.1 + i * 0.1} />
              ))}
            </div>

            <div className="relative mt-1 flex-1 rounded-md border border-dashed border-line/12 p-2.5">
              <p className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
                <Boxes className="h-3 w-3" /> assembled solution
              </p>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {PARTS.map((p, i) => (
                  <motion.div
                    key={p.id}
                    animate={{ opacity: built ? 1 : 0.15, y: built ? 0 : 8 }}
                    transition={{ duration: 0.4, delay: built ? i * 0.12 : 0 }}
                    className="rounded border px-1.5 py-3 text-center font-mono text-[9px]"
                    style={{ borderColor: hexToRgba(ACCENT, 0.35), background: hexToRgba(ACCENT, 0.07), color: ACCENT }}
                  >
                    {p.label}
                  </motion.div>
                ))}
              </div>
              <motion.p
                animate={{ opacity: deployed ? 1 : 0.2 }}
                className="mt-2 font-mono text-[10px]"
                style={{ color: deployed ? GREEN : undefined }}
              >
                → shipping to the environment
              </motion.p>
            </div>
          </Zone>

          <Zone title="Operational outcome">
            <motion.div
              animate={{ opacity: deployed ? 1 : 0.2 }}
              className="rounded-md border p-2.5"
              style={{ borderColor: hexToRgba(GREEN, deployed ? 0.4 : 0.12), background: hexToRgba(GREEN, deployed ? 0.07 : 0.02) }}
            >
              <p className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: deployed ? GREEN : "rgb(var(--zinc-600))" }}>
                <ServerCog className="h-3 w-3" /> deployment
              </p>
              <p className="mt-1 text-[11px] leading-snug text-zinc-400">running where the work actually happens</p>
            </motion.div>

            <motion.div
              animate={{ opacity: feedback ? 1 : 0.2 }}
              className="flex items-start gap-2 rounded-md border border-line/10 p-2.5"
            >
              <MessagesSquare className="mt-0.5 h-3 w-3 flex-shrink-0" style={{ color: feedback ? VIOLET : "rgb(var(--zinc-600))" }} />
              <span className="min-w-0">
                <span className="block font-mono text-[10px]" style={{ color: feedback ? VIOLET : "rgb(var(--zinc-600))" }}>
                  feedback
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-zinc-400">adoption, complaints, the parts nobody touches</span>
              </span>
            </motion.div>

            <motion.div
              animate={{ opacity: pattern ? 1 : 0.2 }}
              className="mt-auto rounded-md border p-2.5"
              style={{ borderColor: hexToRgba(ACCENT, pattern ? 0.4 : 0.12), background: hexToRgba(ACCENT, pattern ? 0.07 : 0.02) }}
            >
              <p className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: pattern ? ACCENT : "rgb(var(--zinc-600))" }}>
                <PackageCheck className="h-3 w-3" /> reusable pattern
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] leading-snug text-zinc-400">
                <ArrowLeft className="h-3 w-3 flex-shrink-0" style={{ color: pattern ? ACCENT : undefined }} />
                module, script, guide or playbook — so the next brief starts further along
              </p>
            </motion.div>
          </Zone>
        </div>

        <p className="mt-3 min-h-[2.5rem] text-[12px] leading-relaxed text-zinc-400 sm:min-h-0">{caption}</p>

        <StepRail steps={STEPS} step={step} accent={ACCENT} onSelect={goTo} onReplay={replay} reduced={reduced} />
      </div>
    </div>
  );
}
