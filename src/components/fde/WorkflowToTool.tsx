"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileSpreadsheet, Lock, Monitor, Users } from "lucide-react";
import { hexToRgba } from "@/lib/utils";
import { StepRail, useSequence } from "./Sequence";
import { ACCENT, GREEN, VIOLET } from "./palette";

const STEPS = ["scattered knowledge", "dependency model", "changed part", "test plan", "workstations", "2 days → 2 hours", "~35 users"];

/** The four relationship categories that had to be elicited before any code. */
const KNOWLEDGE = [
  { id: "components", label: "changed components", tilt: -3 },
  { id: "behavior", label: "affected behavior", tilt: 2 },
  { id: "tests", label: "required tests", tilt: -1.5 },
  { id: "failures", label: "expected failure modes", tilt: 3 },
];

const PARTS = ["part A", "part B", "part C", "part D", "part E"];
const TESTS = ["T1", "T2", "T3", "T4", "T5", "T6"];

// Structure only — an illustration of the shape of the mapping, not the team's
// actual switchgear data.
const MAP: boolean[][] = [
  [true, false, true, false, false, true],
  [false, true, true, false, true, false],
  [true, true, false, false, true, true],
  [false, false, true, true, false, false],
  [true, false, false, true, true, false],
];

const CHANGED = 2;
const AFFECTED = TESTS.filter((_, i) => MAP[CHANGED][i]);

function Panel({ title, active, children }: { title: string; active: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.4 }}
      transition={{ duration: 0.4 }}
      className="rounded-lg border border-line/10 bg-ink-900/50 p-3"
    >
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">{title}</p>
      {children}
    </motion.div>
  );
}

function Meter({ play }: { play: boolean }) {
  return (
    <div>
      <div className="flex items-baseline justify-between font-mono text-[11px]">
        <span className="text-zinc-500">engineering effort per feature</span>
      </div>
      <div className="mt-2 space-y-2">
        <div>
          <p className="font-mono text-[10px] text-zinc-500">before · meetings across specialists</p>
          <div className="mt-1 h-3 w-full overflow-hidden rounded-full" style={{ background: hexToRgba(VIOLET, 0.12) }}>
            <div className="h-full w-full rounded-full" style={{ background: hexToRgba(VIOLET, 0.55) }} />
          </div>
          <p className="mt-0.5 font-mono text-[11px]" style={{ color: VIOLET }}>
            ~2 days
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] text-zinc-500">after · select components, verify the generated plan</p>
          <div className="mt-1 h-3 w-full overflow-hidden rounded-full" style={{ background: hexToRgba(GREEN, 0.12) }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: hexToRgba(GREEN, 0.75) }}
              initial={{ width: "100%" }}
              animate={{ width: play ? "8%" : "100%" }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          </div>
          <p className="mt-0.5 font-mono text-[11px]" style={{ color: GREEN }}>
            ~2 hours
          </p>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
        More than 90% less effort, across about 20 feature workflows.
      </p>
    </div>
  );
}

export function WorkflowToTool() {
  const { ref, step, goTo, replay, reduced } = useSequence(STEPS.length, 1700);

  const modelled = step >= 1;
  const changed = step >= 2;
  const planned = step >= 3;
  const distributed = step >= 4;
  const measured = step >= 5;
  const adopted = step >= 6;

  const caption = [
    "Several mechanical specialists each hold part of the answer; nothing is written down as a specification.",
    "The elicited relationships consolidate into one maintained component-to-test model.",
    "An engineer selects the component a feature changed.",
    "The model resolves the affected tests into a generated Excel plan the engineer verifies.",
    "The SSO-protected application is deployed onto the team's own Windows machines.",
    "The measured workflow drops from about two days to about two hours.",
    "About 35 engineers use it, and the team keeps using it after the internship ends.",
  ][step];

  return (
    <div ref={ref} className="overflow-hidden rounded-xl border border-line/10 bg-ink-800">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/10 px-4 py-2.5 font-mono text-[11px]">
        <span className="text-zinc-400">domain knowledge → deployed workflow</span>
        <span className="text-zinc-600">Schneider Electric · 2022</span>
      </div>

      <div className="p-4">
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Panel title="Elicited domain knowledge" active={!modelled}>
              <div className={`flex flex-wrap items-start gap-2 ${modelled ? "" : "min-h-[86px]"}`}>
                <AnimatePresence initial={false}>
                  {!modelled &&
                    KNOWLEDGE.map((k, i) => (
                      <motion.span
                        key={k.id}
                        initial={{ opacity: 0, y: 8, rotate: k.tilt }}
                        animate={{ opacity: 1, y: 0, rotate: k.tilt }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.12 }}
                        className="rounded-md border px-2 py-1.5 font-mono text-[10px]"
                        style={{ borderColor: hexToRgba(VIOLET, 0.4), background: hexToRgba(VIOLET, 0.08), color: VIOLET }}
                      >
                        {k.label}
                      </motion.span>
                    ))}
                </AnimatePresence>
                {modelled && <p className="text-[11px] leading-relaxed text-zinc-500">Consolidated into the model below.</p>}
              </div>
            </Panel>

            <Panel title="Maintained component/test model" active={modelled}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[260px] border-separate border-spacing-1 font-mono text-[10px]">
                  <caption className="sr-only">
                    Illustrative component-to-test mapping: selecting a changed component resolves the affected tests.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col" className="text-left font-normal text-zinc-600">
                        component
                      </th>
                      {TESTS.map((t) => (
                        <th key={t} scope="col" className="font-normal text-zinc-600">
                          {t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PARTS.map((p, r) => {
                      const isChanged = changed && r === CHANGED;
                      return (
                        <tr key={p}>
                          <th
                            scope="row"
                            className="whitespace-nowrap pr-1 text-left font-normal"
                            style={{ color: isChanged ? ACCENT : "rgb(var(--zinc-500))" }}
                          >
                            {p}
                          </th>
                          {TESTS.map((t, c) => {
                            const linked = MAP[r][c];
                            const hot = isChanged && linked;
                            return (
                              <td key={t} className="p-0">
                                <motion.span
                                  animate={{
                                    opacity: modelled ? 1 : 0,
                                    scale: hot ? 1 : 0.9,
                                  }}
                                  transition={{ duration: 0.3, delay: modelled && !changed ? (r * TESTS.length + c) * 0.012 : 0 }}
                                  className="block h-4 w-full rounded-sm"
                                  style={{
                                    background: hot
                                      ? hexToRgba(ACCENT, 0.85)
                                      : linked
                                      ? hexToRgba(VIOLET, 0.32)
                                      : "rgb(var(--line) / 0.06)",
                                  }}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[10px] leading-snug text-zinc-600">
                Illustrative structure. The real mapping is the team&rsquo;s domain knowledge, maintained by them.
              </p>
            </Panel>

            <Panel title="Deployed to the team" active={distributed}>
              <div className="flex items-end gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: distributed ? 1 : 0.3, y: distributed ? 0 : 6 }}
                    transition={{ delay: distributed ? i * 0.14 : 0 }}
                    className="flex flex-1 flex-col items-center gap-1 rounded-md border px-2 py-2"
                    style={{ borderColor: hexToRgba(ACCENT, 0.3), background: hexToRgba(ACCENT, 0.06) }}
                  >
                    <Monitor className="h-4 w-4" style={{ color: ACCENT }} />
                    <span className="font-mono text-[9px] text-zinc-500">workstation</span>
                  </motion.div>
                ))}
              </div>
              <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
                <Lock className="h-3 w-3" /> access through the company&rsquo;s existing single sign-on
              </p>
            </Panel>
          </div>

          <div className="flex flex-col gap-3">
            <Panel title="Generated test plan" active={planned}>
              <div className="overflow-hidden rounded-md border border-line/10" style={{ background: "rgb(var(--code-bg))" }}>
                <div className="flex items-center gap-1.5 border-b border-line/10 px-2.5 py-1 font-mono text-[10px] text-zinc-500">
                  <FileSpreadsheet className="h-3 w-3" /> test-plan.xlsx
                </div>
                <div className="px-2.5 py-1.5 font-mono text-[10px]">
                  {AFFECTED.map((t, i) => (
                    <motion.p
                      key={t}
                      animate={{ opacity: planned ? 1 : 0, x: planned ? 0 : -6 }}
                      transition={{ delay: planned ? i * 0.12 : 0 }}
                      className="flex items-center justify-between py-0.5"
                    >
                      <span className="text-zinc-300">
                        {t} · required after change to {PARTS[CHANGED]}
                      </span>
                      <span className="text-zinc-600">verify</span>
                    </motion.p>
                  ))}
                  <p className="pt-1 text-[10px] text-zinc-600">engineer confirms the plan before anything runs</p>
                </div>
              </div>
            </Panel>

            <Panel title="Measured outcome" active={measured}>
              <Meter play={measured} />
              <motion.div
                animate={{ opacity: adopted ? 1 : 0.2 }}
                className="mt-3 flex items-center gap-2 border-t border-line/10 pt-2.5"
              >
                <Users className="h-4 w-4 flex-shrink-0" style={{ color: adopted ? GREEN : undefined }} />
                <div className="min-w-0">
                  <p className="font-mono text-[11px]" style={{ color: adopted ? GREEN : "rgb(var(--zinc-500))" }}>
                    ~35 engineers
                  </p>
                  <p className="text-[11px] leading-snug text-zinc-500">still using it after the internship ended</p>
                </div>
              </motion.div>
            </Panel>
          </div>
        </div>

        <p className="mt-3 text-[12px] leading-relaxed text-zinc-400">{caption}</p>

        <StepRail steps={STEPS} step={step} accent={ACCENT} onSelect={goTo} onReplay={replay} reduced={reduced} />
      </div>
    </div>
  );
}
