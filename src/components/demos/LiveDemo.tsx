"use client";

import { ReactNode, type RefObject } from "react";
import { Github, Zap, BookOpen } from "lucide-react";
import { hexToRgba } from "@/lib/utils";
import { demoEvidence, type DemoId } from "@/data/demos";

interface LiveDemoProps {
  title: string;
  subtitle: string;
  repoUrl?: string;
  accent: string;
  children: ReactNode;
  id?: DemoId;
  kind?: "interactive" | "explainer";
  tech?: string[];
  role?: string;
  result?: string;
  embedded?: boolean;
  contentRef?: RefObject<HTMLDivElement>;
  contentLabel?: string;
}

// Shared shell for a project demo card.
export function LiveDemo({
  title, subtitle, repoUrl, accent, children,
  id, kind = "interactive", tech, role, result,
  embedded = false, contentRef, contentLabel,
}: LiveDemoProps) {
  const interactive = kind === "interactive";
  const evidence = id ? demoEvidence(id) : undefined;
  const content = (
    <div
      ref={contentRef}
      tabIndex={contentRef ? 0 : undefined}
      aria-label={contentLabel}
      className={contentRef ? "rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2" : undefined}
      style={contentRef ? { "--tw-ring-color": accent } as React.CSSProperties : undefined}
    >
      {children}
    </div>
  );

  if (embedded) return content;

  return (
    <div id={id} className="scroll-mt-20 rounded-xl border bg-ink-800" style={{ borderColor: hexToRgba(accent, 0.18) }}>
      <div className="flex items-start justify-between gap-4 border-b px-5 py-4" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold leading-tight text-zinc-100">{title}</h2>
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
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-zinc-400">
              {role && <span><span className="text-zinc-400">role</span> · {role}</span>}
              {result && <span><span className="text-zinc-400">result</span> · {result}</span>}
            </div>
          )}
          {evidence && (
            <dl className="mt-3 grid gap-2 text-[12px] leading-relaxed text-zinc-400 sm:grid-cols-2">
              <div><dt className="font-mono text-[10px] uppercase tracking-wide text-zinc-400">My contribution</dt><dd>{evidence.contribution}</dd></div>
              <div><dt className="font-mono text-[10px] uppercase tracking-wide text-zinc-400">Browser fidelity</dt><dd>{evidence.simplification}</dd></div>
            </dl>
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
      {evidence?.warning && (
        <p role="note" className="border-b px-5 py-3 text-[12px] font-medium leading-relaxed" style={{ borderColor: hexToRgba(accent, 0.2), background: hexToRgba(accent, 0.08), color: accent }}>
          {evidence.warning}
        </p>
      )}
      <div className="p-5">{content}</div>
      {evidence && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t px-5 py-3 font-mono text-[11px]" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>
          {evidence.projectSourceHref && <a className="min-h-11 py-3 text-zinc-400 hover:text-zinc-100" href={evidence.projectSourceHref} target="_blank" rel="noreferrer noopener">Original project source</a>}
          {evidence.upstreamHref && <a className="min-h-11 py-3 text-zinc-400 hover:text-zinc-100" href={evidence.upstreamHref} target="_blank" rel="noreferrer noopener">Upstream source</a>}
          {evidence.browserImplementationHref && <a className="min-h-11 py-3 text-zinc-400 hover:text-zinc-100" href={evidence.browserImplementationHref} target="_blank" rel="noreferrer noopener">Browser implementation source</a>}
        </div>
      )}
    </div>
  );
}
