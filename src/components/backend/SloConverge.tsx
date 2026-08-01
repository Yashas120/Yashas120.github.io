"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#60a5fa";
const GREEN = "#4ade80";

interface Slo {
  label: string;
  unit: string;
  before: number;
  after: number;
  // "down" means lower-is-better (the line should fall to green).
  direction: "down" | "up";
  delta: string;
  context: string;
}

const slos: Slo[] = [
  { label: "p95 page load", unit: "ms", before: 820, after: 492, direction: "down", delta: "-40%", context: "DB query + index work across Postgres, Mongo, Cassandra." },
  { label: "deploy time", unit: "min", before: 24, after: 12, direction: "down", delta: "-50%", context: "Plan graph parallelized across independent resources." },
  { label: "SDK publish", unit: "h", before: 4, after: 0, direction: "down", delta: "→ 0", context: "Regenerated from the spec on every merge." },
  { label: "change failure rate", unit: "%", before: 9, after: 2, direction: "down", delta: "-78%", context: "Reviewed plans + guardrails before apply, staged rollouts." },
];

// A settling curve: starts at the "before" baseline and eases to "after" with a
// small overshoot, so it reads like a metric converging, not a straight line.
function curve(before: number, after: number, t: number) {
  const eased = 1 - Math.pow(1 - t, 3);
  const wobble = Math.sin(t * Math.PI * 3) * (1 - t) * 0.12;
  return before + (after - before) * Math.min(1, eased + wobble);
}

function Panel({ slo, play, delay }: { slo: Slo; play: boolean; delay: number }) {
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!play) {
      setT(0);
      return;
    }
    let raf = 0;
    let start = 0;
    const dur = 1400;
    const wait = delay * 1000;
    const tick = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start - wait;
      const p = Math.max(0, Math.min(1, elapsed / dur));
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, delay]);

  const N = 40;
  const vals = Array.from({ length: N }, (_, i) => {
    const localT = Math.max(0, Math.min(1, t * 1.15 - i / N + 0.0));
    return curve(slo.before, slo.after, localT);
  });
  const lo = Math.min(slo.before, slo.after);
  const hi = Math.max(slo.before, slo.after);
  const span = hi - lo || 1;
  const points = vals
    .map((v, i) => {
      const x = (i / (N - 1)) * 100;
      const y = 26 - ((v - lo) / span) * 22 - 2;
      return `${x},${y.toFixed(2)}`;
    })
    .join(" ");

  const current = curve(slo.before, slo.after, Math.min(1, t * 1.15));
  const display = slo.unit === "%" || slo.unit === "h" ? current.toFixed(current < 10 ? 1 : 0) : Math.round(current).toString();

  return (
    <div className="rounded-xl border border-line/10 bg-ink-800 p-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] text-zinc-500">{slo.label}</p>
        <span className="rounded-full px-2 py-0.5 font-mono text-[10px]" style={{ background: hexToRgba(GREEN, 0.12), color: GREEN }}>
          {slo.delta}
        </span>
      </div>
      <p className="mt-1 font-mono text-2xl font-semibold" style={{ color: ACCENT }}>
        {display}
        <span className="ml-1 text-sm text-zinc-500">{slo.unit}</span>
      </p>
      <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="mt-1 h-10 w-full">
        <line x1="0" y1={26 - ((slo.before - lo) / span) * 22 - 2} x2="100" y2={26 - ((slo.before - lo) / span) * 22 - 2} stroke={hexToRgba(ACCENT, 0.25)} strokeWidth="0.5" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1={26 - ((slo.after - lo) / span) * 22 - 2} x2="100" y2={26 - ((slo.after - lo) / span) * 22 - 2} stroke={hexToRgba(GREEN, 0.3)} strokeWidth="0.5" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        <polyline points={points} fill="none" stroke={t > 0.85 ? GREEN : ACCENT} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-0.5 flex items-center justify-between font-mono text-[10px] text-zinc-600">
        <span>was {slo.before}{slo.unit}</span>
        <span style={{ color: GREEN }}>now {slo.after}{slo.unit}</span>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">{slo.context}</p>
    </div>
  );
}

export function SloConverge({ trigger = 0 }: { trigger?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });
  // Re-run the convergence whenever it scrolls into view or a new run dispatches.
  const play = inView;

  return (
    <div ref={ref} key={trigger}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
        <span className="text-zinc-400">observe · watch the metrics settle after the loop closes</span>
        <span className="text-zinc-600">dashed = before · solid = after</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {slos.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
            <Panel slo={s} play={play} delay={i * 0.12} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
