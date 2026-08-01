"use client";

import { MotionValue, AnimatePresence, motion } from "framer-motion";
import { experience } from "@/data/experience";
import { hexToRgba } from "@/lib/utils";
import { EASE_OUT, useStepIndex } from "./scroll";

const ACCENT = "#22d3ee";

// Oldest first, so scrolling forward reads like an append-only log.
const entries = [...experience].reverse();

export function ReplicatedLog({ progress }: { progress: MotionValue<number> }) {
  const index = useStepIndex(progress, entries.length, 0.13, 0.96);
  const active = entries[index];
  const committed = index + 1;
  const extraPoints = Math.max(0, active.points.length - 4);

  return (
    <div className="grid gap-6 md:grid-cols-[1.05fr_1fr] md:items-start">
      {/* the log itself */}
      <div className="rounded-xl border border-line/10 bg-ink-800/80 p-4 backdrop-blur sm:p-5">
        <div className="flex items-center justify-between font-mono text-[11px] text-zinc-500">
          <span>/var/log/career.log</span>
          <span style={{ color: ACCENT }}>
            commitIndex {committed}/{entries.length}
          </span>
        </div>

        <div className="mt-3 h-px w-full overflow-hidden bg-line/10">
          <motion.div
            className="h-full"
            style={{ background: ACCENT }}
            initial={{ width: "0%" }}
            animate={{ width: `${(committed / entries.length) * 100}%` }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          />
        </div>

        <ol className="mt-4 space-y-1.5">
          {entries.map((e, i) => {
            const isCommitted = i <= index;
            const isActive = i === index;
            return (
              <motion.li
                key={e.id}
                className="rounded-lg px-2.5 py-2"
                initial={{ opacity: 0.32, backgroundColor: "rgba(0,0,0,0)" }}
                animate={{
                  opacity: isCommitted ? 1 : 0.32,
                  backgroundColor: isActive ? hexToRgba(ACCENT, 0.08) : "rgba(0,0,0,0)",
                }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
              >
                <div className="flex items-center gap-2.5 font-mono text-[10.5px]">
                  <span className="text-zinc-600">idx {String(i + 1).padStart(2, "0")}</span>
                  <span
                    className="rounded px-1.5 py-0.5"
                    style={
                      isCommitted
                        ? { background: hexToRgba(ACCENT, 0.14), color: ACCENT }
                        : { background: "rgb(var(--line) / 0.06)", color: "#71717a" }
                    }
                  >
                    {isCommitted ? "COMMITTED" : "PENDING"}
                  </span>
                  <span className="text-zinc-600">t{Math.floor(i / 2) + 1}</span>
                </div>
                <p className="mt-1 truncate text-xs text-zinc-300">
                  {isCommitted ? (
                    <>
                      {e.role} <span className="text-zinc-600">·</span>{" "}
                      <span className="text-zinc-500">{e.org}</span>
                    </>
                  ) : (
                    <span className="font-mono text-zinc-600">— awaiting replication —</span>
                  )}
                </p>
              </motion.li>
            );
          })}
        </ol>
      </div>

      {/* the state machine the log is applied to */}
      <div className="relative min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="rounded-xl border border-line/10 bg-ink-800/80 p-5 backdrop-blur sm:p-6"
          >
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span style={{ color: ACCENT }}>applied → state machine</span>
              <span className="text-zinc-500">
                {active.start} → {active.end}
              </span>
            </div>

            <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-50 sm:text-xl">
              {active.role}
            </h3>
            <p className="mt-0.5 text-sm text-zinc-400">
              {active.org}
              {active.location ? ` · ${active.location}` : ""}
            </p>

            <ul className="mt-4 space-y-2">
              {active.points.slice(0, 4).map((p, j) => (
                <motion.li
                  key={j}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + j * 0.07, duration: 0.4, ease: EASE_OUT }}
                  className="flex gap-2 text-xs leading-relaxed text-zinc-400"
                >
                  <span style={{ color: ACCENT }}>›</span>
                  <span>{p}</span>
                </motion.li>
              ))}
            </ul>

            {extraPoints > 0 && (
              <p className="mt-3 font-mono text-[10.5px] text-zinc-600">
                +{extraPoints} more entries in this batch
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-1.5">
              {active.tags.map((t) => (
                <span
                  key={t}
                  className="rounded border px-2 py-0.5 font-mono text-[10px]"
                  style={{ borderColor: hexToRgba(ACCENT, 0.25), color: ACCENT }}
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
