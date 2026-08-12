"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { hexToRgba } from "@/lib/utils";

/**
 * Drives the step-by-step visuals. It advances on its own once the diagram is
 * on screen, hands control over the moment someone clicks a step, and jumps
 * straight to the finished state when reduced motion is requested — so the
 * information is never gated behind an animation.
 */
export function useSequence(count: number, intervalMs = 1600) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });
  const reduced = useReducedMotionSafe();
  const [step, setStep] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (reduced) setStep(count - 1);
  }, [reduced, count]);

  useEffect(() => {
    if (reduced || manual || !inView || step >= count - 1) return;
    const t = setTimeout(() => setStep((s) => s + 1), intervalMs);
    return () => clearTimeout(t);
  }, [reduced, manual, inView, step, count, intervalMs]);

  const goTo = useCallback((i: number) => {
    setManual(true);
    setStep(i);
  }, []);

  const replay = useCallback(() => {
    setManual(false);
    setStep(0);
  }, []);

  return { ref, step, goTo, replay, reduced };
}

export interface StepRailProps {
  steps: string[];
  step: number;
  accent: string;
  onSelect: (i: number) => void;
  onReplay: () => void;
  reduced: boolean;
}

/** The steps as buttons, so the sequence can be read without waiting for it. */
export function StepRail({ steps, step, accent, onSelect, onReplay, reduced }: StepRailProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-1.5">
      {steps.map((label, i) => {
        const done = i <= step;
        return (
          <button
            key={label}
            onClick={() => onSelect(i)}
            aria-current={i === step ? "step" : undefined}
            className="rounded-full border px-2.5 py-1 font-mono text-[10px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              borderColor: done ? hexToRgba(accent, 0.5) : "rgb(var(--line) / 0.12)",
              background: i === step ? hexToRgba(accent, 0.14) : "transparent",
              color: done ? accent : "rgb(var(--zinc-500))",
              outlineColor: accent,
            }}
          >
            {i + 1}. {label}
          </button>
        );
      })}
      {!reduced && (
        <button
          onClick={onReplay}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-line/12 px-2.5 py-1 font-mono text-[10px] text-zinc-500 transition-colors hover:text-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ outlineColor: accent }}
        >
          <RotateCcw className="h-3 w-3" /> replay
        </button>
      )}
    </div>
  );
}
