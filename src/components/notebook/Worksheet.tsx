"use client";

import { FileText, Lock } from "lucide-react";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#fb7185";

const problems = [
  {
    n: "Problem 1",
    pts: "2 pts",
    q: "Which technique models the probability of a report reaching the correct unit after N days? Is the chain irreducible — and justify. What is the distribution after 1 day?",
  },
  {
    n: "Problem 2",
    pts: "4 pts",
    q: "Using the Chapman–Kolmogorov relation, find the distribution after 1, 2, 10, 1000, and 1001 days. What does the 1000 vs 1001 comparison tell you about convergence?",
  },
  {
    n: "Problem 3",
    pts: "4 pts",
    q: "A bug makes 'General' and 'Feedback' absorbing states. Model the effect Amy Santiago has (A/B test) on the probability a report is eventually absorbed into Feedback.",
  },
];

export function Worksheet() {
  return (
    <div className="rounded-xl border border-line/10 bg-ink-800 p-4 sm:p-5">
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" style={{ color: ACCENT }} />
          <div>
            <p className="text-sm font-semibold text-zinc-100">Worksheet 5 — Markov Chains &amp; A/B Testing</p>
            <p className="font-mono text-[10px] text-zinc-500">UE20CS312 · designed by Yashas Kadambi · 10 points</p>
          </div>
        </div>
        <span className="hidden items-center gap-1 rounded px-2 py-0.5 font-mono text-[9px] text-zinc-500 sm:flex" style={{ background: "rgb(var(--line) / 0.05)" }}>
          <Lock className="h-2.5 w-2.5" /> representative
        </span>
      </div>

      {/* scenario */}
      <div className="mt-3 rounded-lg border-l-2 pl-3" style={{ borderColor: ACCENT }}>
        <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: ACCENT }}>Scenario · the 99th precinct</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400">
          It&apos;s a freezing week in New York and the 99th precinct is reporting suspiciously few crimes. Captain Holt adds a <span className="text-zinc-300">Feedback</span> unit alongside the four existing units and wants to model where a citizen&apos;s report ends up as it bounces between units over N days. Students build the transition matrix, reason about irreducibility and absorbing states, then run an A/B test on whether Amy Santiago&apos;s involvement changes the odds a report reaches Feedback.
        </p>
      </div>

      {/* problems */}
      <ol className="mt-4 space-y-2.5">
        {problems.map((p) => (
          <li key={p.n} className="rounded-lg border border-line/5 bg-ink-900 p-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-zinc-200">{p.n}</span>
              <span className="rounded px-1.5 py-0.5 font-mono text-[9px]" style={{ background: hexToRgba(ACCENT, 0.12), color: ACCENT }}>{p.pts}</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{p.q}</p>
          </li>
        ))}
      </ol>

      <p className="mt-3 font-mono text-[10px] leading-relaxed text-zinc-500">
        Paraphrased excerpt — the full worksheet is PES University coursework. Solve Problem 2 with the interactive model below.
      </p>
    </div>
  );
}
