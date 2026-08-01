"use client";

import { Trophy, ArrowUpRight, Check } from "lucide-react";
import { KaggleComp } from "@/data/teaching";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#fb7185";
const KAGGLE = "#20beff";

export function KaggleCard({ comp }: Readonly<{ comp: KaggleComp }>) {
  return (
    <div className="rounded-xl border p-4 sm:p-5" style={{ borderColor: hexToRgba(KAGGLE, 0.3), background: hexToRgba(KAGGLE, 0.05) }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5" style={{ color: KAGGLE }} />
          <div>
            <p className="text-sm font-semibold text-zinc-100">{comp.title}</p>
            <p className="mt-0.5 font-mono text-[11px] text-zinc-500">{comp.host}</p>
          </div>
        </div>
        <a
          href={comp.url}
          target="_blank"
          rel="noreferrer noopener"
          className="flex flex-shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-[11px] transition-colors hover:brightness-110"
          style={{ borderColor: hexToRgba(KAGGLE, 0.5), color: KAGGLE }}
        >
          View on Kaggle <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-zinc-400">{comp.desc}</p>

      {/* real scale, from the private leaderboard */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border px-3 py-2 text-center" style={{ borderColor: hexToRgba(KAGGLE, 0.3) }}>
          <div className="font-mono text-lg font-semibold" style={{ color: KAGGLE }}>{comp.teams}</div>
        </div>
        <div className="rounded-lg border px-3 py-2 text-center" style={{ borderColor: hexToRgba(KAGGLE, 0.3) }}>
          <div className="font-mono text-lg font-semibold" style={{ color: KAGGLE }}>{comp.participants}</div>
        </div>
      </div>

      {/* What I built / ran — the TA-relevant part */}
      <div className="mt-3">
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider" style={{ color: ACCENT }}>what I built &amp; ran</p>
        <ul className="space-y-1.5">
          {comp.built.map((b) => (
            <li key={b} className="flex gap-2 text-xs leading-relaxed text-zinc-300">
              <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: KAGGLE }} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {comp.format.map((f) => (
          <span key={f} className="rounded-full border px-2.5 py-0.5 font-mono text-[10px]" style={{ borderColor: "rgb(var(--line) / 0.12)", color: "rgb(var(--zinc-400))" }}>
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
