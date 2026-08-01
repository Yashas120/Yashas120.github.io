"use client";

import { MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { publications } from "@/data/publications";
import { hexToRgba } from "@/lib/utils";
import { StaggerItem } from "./scroll";

const ACCENT = "#22d3ee";

export function PaperTrail({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {publications.map((p, i) => (
        <StaggerItem key={p.id} progress={progress} index={i} total={publications.length}>
          <a
            href={`https://doi.org/${p.doi}`}
            target="_blank"
            rel="noreferrer noopener"
            className="group flex h-full flex-col rounded-xl border border-line/10 bg-ink-800/80 p-5 backdrop-blur transition-colors hover:border-line/25"
          >
            <div className="flex items-center justify-between font-mono text-[10.5px]">
              <span className="text-zinc-500">
                RFC {String(i + 1).padStart(4, "0")} · {p.venue} · {p.year}
              </span>
              <span className="inline-flex items-center gap-1 group-hover:underline" style={{ color: ACCENT }}>
                doi <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>

            <h3 className="mt-2 text-sm font-semibold leading-snug text-zinc-100">{p.title}</h3>

            <ul className="mt-3 space-y-1.5">
              {p.points.map((pt, j) => (
                <li key={j} className="flex gap-2 text-xs leading-relaxed text-zinc-400">
                  <span style={{ color: ACCENT }}>›</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            <p
              className="mt-4 inline-block self-start rounded border px-2 py-0.5 font-mono text-[10px]"
              style={{ borderColor: hexToRgba(ACCENT, 0.25), color: ACCENT }}
            >
              status: published
            </p>
          </a>
        </StaggerItem>
      ))}
    </div>
  );
}
