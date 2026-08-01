"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#fb7185";

// Transition matrix from Worksheet 5 (the 99th-precinct scenario).
// Row i = probability a report currently at unit i moves to unit j tomorrow.
const P = [
  [0.002, 0.666, 0.31, 0.0, 0.022],
  [0.466, 0.102, 0.222, 0.0, 0.21],
  [0.022, 0.11, 0.502, 0.0, 0.366],
  [0.0, 0.0, 0.0, 1.0, 0.0],
  [0.11, 0.122, 0.066, 0.0, 0.702],
];

const units = ["Major Crimes", "Traffic", "Vice", "General (absorbing)", "Feedback"];

function step(state: number[]): number[] {
  const n = state.length;
  const out = new Array(n).fill(0);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) out[j] += state[i] * P[i][j];
  return out;
}

function distributionAfter(startUnit: number, days: number): number[] {
  let state = new Array(5).fill(0);
  state[startUnit] = 1;
  for (let d = 0; d < days; d++) state = step(state);
  return state;
}

const presets = [0, 1, 2, 10, 100, 1000, 1001];

export function MarkovSimulator() {
  const [start, setStart] = useState(0);
  const [days, setDays] = useState(2);

  const dist = useMemo(() => distributionAfter(start, days), [start, days]);
  const converged = useMemo(() => {
    const a = distributionAfter(start, 1000);
    const b = distributionAfter(start, 1001);
    return a.every((v, i) => Math.abs(v - b[i]) < 1e-6);
  }, [start]);

  return (
    <div className="rounded-xl border border-line/10 bg-ink-800 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs text-zinc-500">
          <span style={{ color: ACCENT }}>interactive</span> · Worksheet 5 — where does a report end up after N days?
        </p>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <label className="text-zinc-500" htmlFor="start-unit">start:</label>
          <select
            id="start-unit"
            value={start}
            onChange={(e) => setStart(Number(e.target.value))}
            className="rounded border border-line/10 bg-ink-900 px-2 py-1 text-zinc-200 outline-none"
          >
            {units.map((u, i) => (
              <option key={u} value={i}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* bars */}
      <div className="space-y-2">
        {units.map((u, i) => (
          <div key={u} className="flex items-center gap-3">
            <span className="w-32 flex-shrink-0 truncate text-right font-mono text-[11px] text-zinc-400">{u}</span>
            <div className="relative h-5 flex-1 overflow-hidden rounded" style={{ background: "rgb(var(--line) / 0.05)" }}>
              <motion.div
                className="absolute inset-y-0 left-0 rounded"
                style={{ background: i === 3 ? "rgb(var(--zinc-500))" : ACCENT }}
                animate={{ width: `${dist[i] * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
            <span className="w-14 flex-shrink-0 text-right font-mono text-[11px] text-zinc-300">{(dist[i] * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>

      {/* day control */}
      <div className="mt-4">
        <div className="flex items-center justify-between font-mono text-[11px] text-zinc-500">
          <span>days elapsed: <span style={{ color: ACCENT }}>{days}</span></span>
          {converged && days >= 100 && <span className="text-[#4ade80]">≈ stationary distribution reached</span>}
        </div>
        <input
          type="range"
          min={0}
          max={40}
          value={Math.min(days, 40)}
          onChange={(e) => setDays(Number(e.target.value))}
          aria-label="days elapsed"
          className="mt-2 w-full accent-[#fb7185]"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setDays(p)}
              className="rounded border px-2 py-0.5 font-mono text-[10px] transition-colors"
              style={{
                borderColor: days === p ? ACCENT : "rgb(var(--line) / 0.12)",
                color: days === p ? ACCENT : "rgb(var(--zinc-400))",
                background: days === p ? hexToRgba(ACCENT, 0.08) : "transparent",
              }}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 font-mono text-[10px] leading-relaxed text-zinc-500">
        Chapman–Kolmogorov: dist(N) = e_start · P^N. Try starting in{" "}
        <span style={{ color: ACCENT }}>General (absorbing)</span> — once a report lands there it never leaves. From any other unit it converges to the same long-run mix.
      </p>
    </div>
  );
}
