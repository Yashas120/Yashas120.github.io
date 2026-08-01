"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { publications } from "@/data/publications";
import { useSlideStepper } from "@/components/data-plane/Deck";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#a78bfa";

export function PublicationList() {
  const [focus, setFocus] = useSlideStepper(publications.length);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] text-zinc-500">
        <span>references · {publications.length} papers</span>
        <span>
          {String(focus + 1).padStart(2, "0")}/{String(publications.length).padStart(2, "0")}
        </span>
      </div>

      <div className="space-y-1.5">
        {publications.map((p, i) => {
          const open = i === focus;
          return (
            <div
              key={p.id}
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
                className="block w-full px-3 py-2 text-left"
              >
                <span className="flex items-center gap-2 font-mono text-[10px]">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: ACCENT, opacity: open ? 1 : 0.5, boxShadow: open ? `0 0 8px ${hexToRgba(ACCENT, 0.9)}` : "none" }}
                  />
                  <span className="shrink-0 text-zinc-500">{p.venue} · {p.year}</span>
                </span>
                <span className="mt-1 block text-[13px] font-semibold leading-snug text-zinc-100">{p.title}</span>
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
                    <div className="border-t px-3 pb-2 pt-1.5" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>
                      <ul className="space-y-0.5">
                        {p.points.map((pt, j) => (
                          <li key={`${p.id}-${j}`} className="flex gap-1.5 text-[11px] leading-relaxed text-zinc-400">
                            <span style={{ color: ACCENT }}>›</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                      <a
                        href={`https://doi.org/${p.doi}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mt-1.5 inline-flex items-center gap-0.5 font-mono text-[10px] hover:underline"
                        style={{ color: ACCENT }}
                      >
                        doi.org/{p.doi} <ArrowUpRight className="h-3 w-3" />
                      </a>
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
