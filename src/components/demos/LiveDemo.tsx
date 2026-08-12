"use client";

import { ReactNode } from "react";
import { Github, Zap, BookOpen } from "lucide-react";
import { hexToRgba } from "@/lib/utils";

interface LiveDemoProps {
  title: string;
  subtitle: string;
  repoUrl?: string;
  accent: string;
  children: ReactNode;
  id?: string;
  kind?: "interactive" | "explainer";
  tech?: string[];
  role?: string;
  result?: string;
}

// Shared shell for a project demo card.
export function LiveDemo({
  title, subtitle, repoUrl, accent, children,
  id, kind = "interactive", tech, role, result,
}: LiveDemoProps) {
  const interactive = kind === "interactive";
  return (
    <div id={id} className="scroll-mt-20 rounded-xl border bg-ink-800" style={{ borderColor: hexToRgba(accent, 0.18) }}>
      <div className="flex items-start justify-between gap-4 border-b px-5 py-4" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold text-zinc-100">{title}</h2>
            <span
              className="inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px]"
              style={{ background: hexToRgba(accent, 0.12), color: accent }}
            >
              {interactive ? <Zap className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
              {interactive ? "runs in your browser" : "interactive explainer"}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
          {(role || result) && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-zinc-500">
              {role && <span><span className="text-zinc-600">role</span> · {role}</span>}
              {result && <span><span className="text-zinc-600">result</span> · {result}</span>}
            </div>
          )}
          {tech && tech.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tech.map((t) => (
                <span key={t} className="rounded px-1.5 py-0.5 font-mono text-[10px] text-zinc-400" style={{ background: "rgb(var(--line) / 0.08)" }}>{t}</span>
              ))}
            </div>
          )}
        </div>
        {repoUrl && (
          <a href={repoUrl} target="_blank" rel="noopener noreferrer"
            className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs text-zinc-300 transition-colors hover:text-zinc-100"
            style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
            <Github className="h-3.5 w-3.5" /> source
          </a>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
