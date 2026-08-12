"use client";

import { useEffect, useState } from "react";
import { CornerDownLeft, FileSearch, Sparkles, type LucideIcon } from "lucide-react";
import { hexToRgba } from "@/lib/utils";

export interface GroundedAnswer {
  chunks: string[];
  lines: string[];
  /** Shown when retrieval deliberately skipped sources the asker cannot see. */
  withheld?: string;
}

export interface GroundedEntry extends GroundedAnswer {
  q: string;
  keys: string[];
}

export interface GroundedConsoleProps {
  entries: GroundedEntry[];
  fallback: GroundedAnswer;
  accent: string;
  good: string;
  header: { left: string; right: string };
  footer: string;
  placeholder: string;
  inputLabel: string;
  icon?: LucideIcon;
  warn?: string;
  /** What the retrieved units are called in the trace line. */
  unit?: string;
}

type Phase = "idle" | "retrieving" | "answering" | "done";

/**
 * Retrieval first, answer second: the sources are shown before the prose, and
 * an off-index question gets a refusal instead of an invention.
 */
export function GroundedConsole({
  entries,
  fallback,
  accent,
  good,
  header,
  footer,
  placeholder,
  inputLabel,
  icon: Icon = Sparkles,
  warn = "#fbbf24",
  unit = "chunks",
}: GroundedConsoleProps) {
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<GroundedAnswer | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lineCount, setLineCount] = useState(0);

  const ask = (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    const hit = entries.find((e) => e.keys.some((k) => q.toLowerCase().includes(k)));
    setQuestion(q);
    setAnswer(hit ? { chunks: hit.chunks, lines: hit.lines, withheld: hit.withheld } : fallback);
    setLineCount(0);
    setPhase("retrieving");
  };

  useEffect(() => {
    if (phase !== "retrieving") return;
    const t = setTimeout(() => setPhase("answering"), 650);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "answering" || !answer) return;
    if (lineCount >= answer.lines.length) {
      setPhase("done");
      return;
    }
    const t = setTimeout(() => setLineCount((c) => c + 1), 420);
    return () => clearTimeout(t);
  }, [phase, lineCount, answer]);

  return (
    <div className="overflow-hidden rounded-xl border border-line/10 bg-ink-800">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/10 px-4 py-2.5 font-mono text-[11px]">
        <span className="flex items-center gap-2 text-zinc-400">
          <Icon className="h-3.5 w-3.5" style={{ color: accent }} /> {header.left}
        </span>
        <span className="text-zinc-600">{header.right}</span>
      </div>

      <div className="flex flex-wrap gap-2 px-4 py-3">
        {entries.map((e) => (
          <button
            key={e.q}
            onClick={() => ask(e.q)}
            className="rounded-full border px-3 py-1 text-left font-mono text-[11px] text-zinc-300 transition-colors hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderColor: hexToRgba(accent, 0.25), background: hexToRgba(accent, 0.06), outlineColor: accent }}
          >
            {e.q}
          </button>
        ))}
      </div>

      <div className="border-t border-line/10 px-4 py-3">
        <div className="flex items-center gap-2 font-mono text-[12px]">
          <span style={{ color: accent }}>?</span>
          <input
            aria-label={inputLabel}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-zinc-100 outline-none placeholder:text-zinc-600"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              ask(e.currentTarget.value);
              e.currentTarget.value = "";
            }}
          />
          <CornerDownLeft className="h-3.5 w-3.5 text-zinc-600" />
        </div>
      </div>

      {question && answer && (
        <div className="border-t border-line/10 px-4 py-3 font-mono text-[12px] leading-relaxed">
          <p className="text-zinc-300">
            <span style={{ color: accent }}>? </span>
            {question}
          </p>

          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-500">
            <FileSearch className="h-3 w-3" />
            {phase === "retrieving"
              ? "searching index…"
              : answer.chunks.length > 0
              ? `retrieved ${answer.chunks.length} ${unit}`
              : `0 ${unit} above threshold`}
            {phase !== "retrieving" &&
              answer.chunks.map((c) => (
                <span key={c} className="rounded px-1.5 py-0.5" style={{ background: hexToRgba(accent, 0.1), color: accent }}>
                  {c}
                </span>
              ))}
          </p>

          {phase !== "retrieving" && answer.withheld && (
            <p className="mt-1 text-[10px]" style={{ color: warn }}>
              {answer.withheld}
            </p>
          )}

          {phase !== "retrieving" && (
            <div className="mt-2 space-y-1.5">
              {answer.lines.slice(0, lineCount).map((l) => (
                <p key={l} className="flex gap-2 text-zinc-300">
                  <span style={{ color: answer.chunks.length > 0 ? good : warn }}>›</span>
                  <span>{l}</span>
                </p>
              ))}
              {phase === "answering" && <span className="inline-block h-3.5 w-1.5 animate-blink align-middle" style={{ background: accent }} />}
            </div>
          )}
        </div>
      )}

      <div className="border-t border-line/10 px-4 py-2 font-mono text-[10px] text-zinc-600">{footer}</div>
    </div>
  );
}
