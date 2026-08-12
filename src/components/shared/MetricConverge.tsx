"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { hexToRgba } from "@/lib/utils";

export interface ConvergingMetric {
  label: string;
  unit: string;
  before: number;
  after: number;
  delta: string;
  context: string;
}

export interface MetricConvergeProps {
  metrics: ConvergingMetric[];
  accent: string;
  /** Colour the line lands on once it has settled. */
  good: string;
  header?: { left: string; right: string };
  columnsClass?: string;
  /** Change this to replay the convergence. */
  trigger?: number;
}

// A settling curve: starts at the "before" baseline and eases to "after" with a
// small overshoot, so it reads like a metric converging, not a straight line.
function curve(before: number, after: number, t: number) {
  const eased = 1 - Math.pow(1 - t, 3);
  const wobble = Math.sin(t * Math.PI * 3) * (1 - t) * 0.12;
  return before + (after - before) * Math.min(1, eased + wobble);
}

function Panel({ metric, accent, good, play, delay }: { metric: ConvergingMetric; accent: string; good: string; play: boolean; delay: number }) {
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
    return curve(metric.before, metric.after, localT);
  });
  const lo = Math.min(metric.before, metric.after);
  const hi = Math.max(metric.before, metric.after);
  const span = hi - lo || 1;
  const points = vals
    .map((v, i) => {
      const x = (i / (N - 1)) * 100;
      const y = 26 - ((v - lo) / span) * 22 - 2;
      return `${x},${y.toFixed(2)}`;
    })
    .join(" ");

  const current = curve(metric.before, metric.after, Math.min(1, t * 1.15));
  const display = metric.unit === "%" || metric.unit === "h" ? current.toFixed(current < 10 ? 1 : 0) : Math.round(current).toString();

  return (
    <div className="rounded-xl border border-line/10 bg-ink-800 p-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] text-zinc-500">{metric.label}</p>
        <span className="rounded-full px-2 py-0.5 font-mono text-[10px]" style={{ background: hexToRgba(good, 0.12), color: good }}>
          {metric.delta}
        </span>
      </div>
      <p className="mt-1 font-mono text-2xl font-semibold" style={{ color: accent }}>
        {display}
        <span className="ml-1 text-sm text-zinc-500">{metric.unit}</span>
      </p>
      <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="mt-1 h-10 w-full" aria-hidden>
        <line
          x1="0"
          y1={26 - ((metric.before - lo) / span) * 22 - 2}
          x2="100"
          y2={26 - ((metric.before - lo) / span) * 22 - 2}
          stroke={hexToRgba(accent, 0.25)}
          strokeWidth="0.5"
          strokeDasharray="2 2"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="0"
          y1={26 - ((metric.after - lo) / span) * 22 - 2}
          x2="100"
          y2={26 - ((metric.after - lo) / span) * 22 - 2}
          stroke={hexToRgba(good, 0.3)}
          strokeWidth="0.5"
          strokeDasharray="2 2"
          vectorEffect="non-scaling-stroke"
        />
        <polyline points={points} fill="none" stroke={t > 0.85 ? good : accent} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-0.5 flex items-center justify-between font-mono text-[10px] text-zinc-600">
        <span>
          was {metric.before}
          {metric.unit}
        </span>
        <span style={{ color: good }}>
          now {metric.after}
          {metric.unit}
        </span>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">{metric.context}</p>
    </div>
  );
}

/** Before/after numbers that animate from the old baseline to the measured result. */
export function MetricConverge({
  metrics,
  accent,
  good,
  header,
  columnsClass = "sm:grid-cols-2 lg:grid-cols-4",
  trigger = 0,
}: MetricConvergeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <div ref={ref} key={trigger}>
      {header && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
          <span className="text-zinc-400">{header.left}</span>
          <span className="text-zinc-600">{header.right}</span>
        </div>
      )}
      <div className={`grid grid-cols-1 gap-4 ${columnsClass}`}>
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
            <Panel metric={m} accent={accent} good={good} play={inView} delay={i * 0.12} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
