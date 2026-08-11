"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { hexToRgba } from "@/lib/utils";
import { PHOSPHOR } from "./types";

type Placement = "center" | "dock" | "menu" | "tray";

interface Step {
  title: string;
  body: string;
  placement: Placement;
}

const steps: Step[] = [
  {
    title: "Welcome 👋",
    body: "This is my résumé, built as a tiny operating system. Don't worry — you don't need to be technical. This quick guide shows you around.",
    placement: "center",
  },
  {
    title: "Start with the résumé",
    body: "The window in front is my résumé in plain English. Everything about me is reachable from here.",
    placement: "center",
  },
  {
    title: "The dock = the tour",
    body: "The bar along the bottom is the app dock. Each icon opens a different part of my story — Projects, Work experience, Publications, and more.",
    placement: "dock",
  },
  {
    title: "Everything, anytime",
    body: "The yashOS menu (top-left) lists every app with plain-English names. The ? button up there reopens this guide whenever you want.",
    placement: "menu",
  },
];

/** Card position per step. Region-anchored (no element measurement) so it's
 *  robust and works the same on mobile. */
const placementClass: Record<Placement, string> = {
  center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
  dock: "left-1/2 bottom-24 -translate-x-1/2",
  menu: "left-3 top-14",
  tray: "right-3 top-14",
};

export function DesktopTour({ open, onClose }: Readonly<{ open: boolean; onClose: () => void }>) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (open) setI(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "Enter") setI((s) => Math.min(s + 1, steps.length - 1));
      if (e.key === "ArrowLeft") setI((s) => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const step = steps[i];
  const last = i === steps.length - 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60]"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={onClose}
        >
          <motion.aside
            key={i}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
            className={`absolute w-[min(20rem,calc(100vw-1.5rem))] rounded-xl border p-4 win-shadow ${placementClass[step.placement]}`}
            style={{ borderColor: hexToRgba(PHOSPHOR, 0.35), background: "rgb(var(--ink-800))" }}
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-sm font-semibold text-zinc-100">{step.title}</h2>
              <button
                onClick={onClose}
                aria-label="Close guide"
                className="rounded p-0.5 text-zinc-500 transition-colors hover:bg-line/10 hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">{step.body}</p>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-1.5" aria-hidden>
                {steps.map((s, idx) => (
                  <span
                    key={s.title}
                    className="h-1.5 w-1.5 rounded-full transition-colors"
                    style={{ background: idx === i ? PHOSPHOR : "rgb(var(--line) / 0.25)" }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {i > 0 && (
                  <button
                    onClick={() => setI((s) => Math.max(s - 1, 0))}
                    className="rounded-md px-2.5 py-1 font-mono text-[11px] text-zinc-400 transition-colors hover:text-zinc-100"
                  >
                    back
                  </button>
                )}
                {last ? (
                  <button
                    onClick={onClose}
                    className="rounded-md border px-3 py-1 font-mono text-[11px] transition-colors"
                    style={{ borderColor: hexToRgba(PHOSPHOR, 0.4), background: hexToRgba(PHOSPHOR, 0.1), color: PHOSPHOR }}
                  >
                    got it
                  </button>
                ) : (
                  <button
                    onClick={() => setI((s) => Math.min(s + 1, steps.length - 1))}
                    className="rounded-md border px-3 py-1 font-mono text-[11px] transition-colors"
                    style={{ borderColor: hexToRgba(PHOSPHOR, 0.4), background: hexToRgba(PHOSPHOR, 0.1), color: PHOSPHOR }}
                  >
                    next →
                  </button>
                )}
              </div>
            </div>

            {i === 0 && (
              <button
                onClick={onClose}
                className="mt-2 w-full text-center font-mono text-[10px] text-zinc-600 transition-colors hover:text-zinc-400"
              >
                skip the guide
              </button>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
