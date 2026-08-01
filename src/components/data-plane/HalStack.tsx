"use client";

import { AnimatePresence, motion } from "framer-motion";
import { experience } from "@/data/experience";
import { useSlideStepper } from "@/components/data-plane/Deck";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#a78bfa";

// Each role is its own Hardware Abstraction Layer source file: a clean API
// over the messy hardware underneath. TA role is intentionally left out.
const roles = experience.filter((e) => e.id !== "pes-ta");

const fileName: Record<string, string> = {
  ucsd: "grad_research.hal",
  "cisco-optical": "optical_linecard.hal",
  "cisco-backend": "cloud_platform.hal",
  "cisco-intern": "sdk_pipeline.hal",
  schneider: "switchgear_tool.hal",
};

function fileFor(id: string) {
  return fileName[id] ?? `${id.replaceAll("-", "_")}.hal`;
}

export function HalStack() {
  const [focus, setFocus] = useSlideStepper(roles.length);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] text-zinc-500">
        <span>hal/ · {roles.length} source files</span>
        <span>
          {String(focus + 1).padStart(2, "0")}/{String(roles.length).padStart(2, "0")}
        </span>
      </div>

      <div className="space-y-1">
        {roles.map((e, i) => {
          const open = i === focus;
          return (
            <div
              key={e.id}
              className="overflow-hidden rounded-lg border transition-colors"
              style={{
                borderColor: open ? hexToRgba(ACCENT, 0.4) : "rgb(var(--line) / 0.1)",
                background: open ? hexToRgba(ACCENT, 0.06) : "rgb(var(--ink-800))",
              }}
            >
              <button
                type="button"
                onClick={() => setFocus(i)}
                aria-expanded={open}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left font-mono text-[11px]"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: ACCENT, opacity: open ? 1 : 0.5, boxShadow: open ? `0 0 8px ${hexToRgba(ACCENT, 0.9)}` : "none" }}
                />
                <span className="shrink-0" style={{ color: open ? ACCENT : "#a1a1aa" }}>{fileFor(e.id)}</span>
                <span className="min-w-0 flex-1 truncate text-zinc-500">
                  {e.role} · {e.org}
                </span>
                <span className="hidden shrink-0 text-[9px] text-zinc-600 sm:inline">{e.start} → {e.end}</span>
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div
                      className="mx-3 mb-2 rounded border p-2 font-mono text-[9.5px] leading-snug"
                      style={{ borderColor: "rgb(var(--line) / 0.08)", background: "rgb(var(--ink-900))" }}
                    >
                      {e.location && <p className="mb-1 text-zinc-600">{`/* ${e.location} · ${e.start} → ${e.end} */`}</p>}
                      <p>
                        <span style={{ color: ACCENT }}>hal_export</span> <span className="text-zinc-600">{"{"}</span>
                      </p>
                      {e.points.map((p, j) => (
                        <p key={`${e.id}-${j}`} className="flex gap-1.5 pl-2">
                          <span className="shrink-0 text-zinc-600">{"//"}</span>
                          <span className="text-zinc-400">{p}</span>
                        </p>
                      ))}
                      <p className="text-zinc-600">{"}"}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
