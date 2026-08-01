"use client";

import { useEffect, useState } from "react";

const scores = [
  { label: "Systems depth", value: 96, note: "kernel, dataplane, from-scratch crypto" },
  { label: "Reliability", value: 94, note: "4 outages RCA'd, zero-downtime auth migration" },
  { label: "Delivery", value: 92, note: "50% faster deploys, 90% less UT time" },
  { label: "Research", value: 88, note: "2 publications, SWIFT super-resolution" },
];

function Gauge({ value, note, label, delay }: { value: number; note: string; label: string; delay: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  const color = value >= 90 ? "#4ade80" : value >= 50 ? "#f59e0b" : "#f87171";
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center rounded-xl border border-line/10 bg-ink-900 p-4 text-center">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="rgb(var(--line) / 0.08)" strokeWidth="6" />
        <circle
          cx="45"
          cy="45"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * v) / 100}
          transform="rotate(-90 45 45)"
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
        <text x="45" y="50" textAnchor="middle" fontSize="18" fontFamily="var(--font-jetbrains)" fill={color}>
          {v}
        </text>
      </svg>
      <p className="mt-2 text-sm font-medium text-zinc-100">{label}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{note}</p>
    </div>
  );
}

export function LighthousePanel() {
  return (
    <div className="p-4">
      <p className="mb-4 font-mono text-[11px] text-zinc-500">// audit report — generated from the resume</p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {scores.map((s, i) => (
          <Gauge key={s.label} label={s.label} value={s.value} note={s.note} delay={i * 150} />
        ))}
      </div>
    </div>
  );
}
