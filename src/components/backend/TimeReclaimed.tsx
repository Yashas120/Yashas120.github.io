"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#60a5fa";
const GREEN = "#4ade80";

// A deliberately conservative, auditable back-of-envelope — the assumptions are
// shown so the headline number reads as arithmetic, not a boast.
interface LineItem {
  label: string;
  math: string;
  hours: number;
}

const items: LineItem[] = [
  { label: "SDK regeneration", math: "4h saved × ~1 API change/wk × 50", hours: 200 },
  { label: "Hands-off deploys", math: "0.5h × 3 deploys/wk × 50", hours: 75 },
  { label: "Repeat questions to the RAG bot", math: "0.25h × 5/wk × 50", hours: 62 },
  { label: "Console provisioning avoided", math: "one-time 3 envs, then never again", hours: 24 },
];

const total = items.reduce((s, i) => s + i.hours, 0);

function useCountUp(target: number, play: boolean, ms = 1200) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!play) {
      setV(0);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, play, ms]);
  return v;
}

export function TimeReclaimed() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const count = useCountUp(total, inView);
  const weeks = Math.round(total / 40);

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-xl border p-5"
      style={{ borderColor: hexToRgba(ACCENT, 0.25), background: `linear-gradient(135deg, ${hexToRgba(ACCENT, 0.08)}, transparent 70%)` }}
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-center">
        <div>
          <p className="font-mono text-[11px] text-zinc-500"># toil deleted, in the only unit that matters</p>
          <p className="mt-1 font-mono text-4xl font-semibold leading-none sm:text-5xl" style={{ color: ACCENT }}>
            ~{count}
            <span className="ml-2 text-lg text-zinc-400">engineer-hours / yr</span>
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            roughly <span style={{ color: GREEN }}>{weeks} work-weeks</span> handed back to the team every year — spent on
            problems instead of on repeating themselves.
          </p>
        </div>

        <div className="rounded-lg border border-line/10 bg-ink-800/70 p-3 font-mono text-[11px]">
          {items.map((it) => (
            <div key={it.label} className="flex items-baseline justify-between gap-3 border-b border-line/5 py-1.5 last:border-0">
              <span className="min-w-0">
                <span className="text-zinc-300">{it.label}</span>
                <span className="ml-2 hidden text-[10px] text-zinc-600 sm:inline">{it.math}</span>
              </span>
              <span className="shrink-0" style={{ color: ACCENT }}>
                {it.hours}h
              </span>
            </div>
          ))}
          <p className="mt-1.5 text-[10px] text-zinc-600">conservative, illustrative — the assumptions are shown on purpose</p>
        </div>
      </div>
    </div>
  );
}
