"use client";

import { ExternalLink } from "lucide-react";
import { publications } from "@/data/publications";
import { highlights } from "@/data/highlights";
import { hexToRgba } from "@/lib/utils";
import { PHOSPHOR } from "../desktop/types";
import { AppHeader } from "./ui";

export function Papers() {
  return (
    <div className="min-h-full">
      <AppHeader
        command="ls ~/papers && dmesg | grep -i award"
        hint={`${publications.length} publications · ${highlights.length} highlights`}
      />

      <div className="space-y-4 p-4">
        {publications.map((p) => (
          <article
            key={p.id}
            className="rounded-lg border p-4"
            style={{ borderColor: "rgb(var(--line) / 0.1)", background: "rgb(var(--ink-700))" }}
          >
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
              <span
                className="rounded px-1.5 py-0.5"
                style={{ background: hexToRgba(PHOSPHOR, 0.14), color: PHOSPHOR }}
              >
                {p.year}
              </span>
              <span className="text-zinc-500">{p.venue}</span>
            </div>
            <h3 className="mt-2 text-[13px] font-semibold leading-snug text-zinc-100">{p.title}</h3>
            <ul className="mt-2 space-y-1">
              {p.points.map((pt) => (
                <li key={pt} className="flex gap-2 text-[12px] leading-relaxed text-zinc-400">
                  <span className="flex-shrink-0" style={{ color: PHOSPHOR }}>
                    ›
                  </span>
                  {pt}
                </li>
              ))}
            </ul>
            <a
              href={`https://doi.org/${p.doi}`}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-400 transition-colors hover:text-zinc-100"
            >
              <ExternalLink className="h-3 w-3" />
              doi:{p.doi}
            </a>
          </article>
        ))}

        <div className="pt-1">
          <p className="mb-2 font-mono text-[11px] text-zinc-600">$ dmesg | grep -i award</p>
          <ul className="space-y-1.5 font-mono text-[11px]">
            {highlights.map((h, i) => (
              <li key={h.id} className="flex flex-wrap gap-x-2">
                <span className="flex-shrink-0 text-zinc-600">
                  [{(120.4 + i * 3.17).toFixed(6)}]
                </span>
                <span className="flex-1">
                  <span style={{ color: PHOSPHOR }}>[ OK ] </span>
                  <span className="text-zinc-200">{h.label}</span>
                  <span className="ml-1.5 font-sans text-[12px] text-zinc-500">{h.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
