"use client";

import { useEffect, useRef, useState } from "react";
import { CornerDownLeft, FileSearch, Sparkles } from "lucide-react";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#60a5fa";
const GREEN = "#4ade80";

interface Answer {
  chunks: string[];
  lines: string[];
}

interface Entry extends Answer {
  q: string;
  keys: string[];
}

// A retrieval index over the resume, not a language model: every answer is a
// stored passage with its source, and anything off-index gets a refusal.
const entries: Entry[] = [
  {
    q: "What has he actually automated?",
    keys: ["automat", "terraform", "iac", "infra"],
    chunks: ["experience/cisco-backend#2", "experience/cisco-intern#1", "metrics/sdk-update"],
    lines: [
      "Terraform across the full PX Cloud footprint — EC2, ECS, Lambda, RDS, DynamoDB, SQS, SNS and IAM — behind common modules every service is provisioned through.",
      "A CI pipeline that regenerates and publishes the Python and Java SDKs on any API change, replacing a four-hour manual edit.",
      "Event triggers on DynamoDB, SQS and SNS so interdependent workflows fire themselves instead of waiting on a person.",
      "On the optical side: build and deploy of line-card binaries, plus near-real-time device-log streaming to local machines.",
    ],
  },
  {
    q: "Where has AI actually shipped, not just been demoed?",
    keys: ["ai", "llm", "rag", "chatbot", "openai", "ml"],
    chunks: ["experience/cisco-backend#8", "projects/voice-assistant", "projects/swift"],
    lines: [
      "A QA chatbot on the OpenAI APIs with RAG over topic-specific group chats — the CI/CD channel, for one — so repeat questions stop interrupting engineers.",
      "A multilingual RAG voice assistant tuned to run without a GPU at about 20s per query, helping farmers reach government subsidy programs.",
      "Both are retrieval-grounded: they answer from indexed sources rather than from the model's memory.",
    ],
  },
  {
    q: "How fast do his changes go out?",
    keys: ["fast", "deploy", "speed", "ship", "release", "time"],
    chunks: ["metrics/deployment-time", "experience/cisco-backend#2"],
    lines: [
      "Deploy time dropped 50% after the deployment plan was parallelized across independent resources.",
      "The IaC migration came first and made deploys repeatable; the speedup was the second step, not the first.",
    ],
  },
  {
    q: "What happens when production breaks?",
    keys: ["break", "outage", "incident", "prod", "reliab", "on-call", "oncall"],
    chunks: ["experience/cisco-backend#6", "metrics/outages", "metrics/auth-migration"],
    lines: [
      "Four production outages root-caused alongside ops and infra, each followed by a plan that removed the recurrence, not just the symptom.",
      "The Ping to Okta migration covered 7 products with zero production impact — staged behind checks rather than cut over at once.",
    ],
  },
  {
    q: "Is he only an automation person?",
    keys: ["only", "just", "depth", "low level", "systems", "kernel", "hardware"],
    chunks: ["experience/cisco-optical", "projects/ghost-scheduler", "projects/bitcoin-java"],
    lines: [
      "No — the same engineer owned dataplane software on the NCS 1014 line-card, including CDR hardware integration and a secure boot process.",
      "Also rebuilt the Linux kernel around Google's ghOSt to move scheduling policy into user space, and wrote Bitcoin from scratch in Java down to SHA-256 and elliptic-curve math.",
      "The systems depth is what makes the automation safe to trust.",
    ],
  },
];

const fallback: Answer = {
  chunks: [],
  lines: [
    "Not in the index. This answers only from the resume — saying so beats inventing an answer.",
    "Indexed: experience, projects, publications, metrics, highlights. Try one of the questions above, or just email him.",
  ],
};

type Phase = "idle" | "retrieving" | "answering" | "done";

export function RagConsole() {
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lineCount, setLineCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const ask = (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    const hit = entries.find((e) => e.keys.some((k) => q.toLowerCase().includes(k)));
    setQuestion(q);
    setAnswer(hit ? { chunks: hit.chunks, lines: hit.lines } : fallback);
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
      <div className="flex items-center justify-between border-b border-line/10 px-4 py-2.5 font-mono text-[11px]">
        <span className="flex items-center gap-2 text-zinc-400">
          <Sparkles className="h-3.5 w-3.5" style={{ color: ACCENT }} /> rag · index: resume
        </span>
        <span className="text-zinc-600">grounded · cites its sources · refuses when it can&apos;t</span>
      </div>

      <div className="flex flex-wrap gap-2 px-4 py-3">
        {entries.map((e) => (
          <button
            key={e.q}
            onClick={() => ask(e.q)}
            className="rounded-full border px-3 py-1 text-left font-mono text-[11px] text-zinc-300 transition-colors hover:brightness-125"
            style={{ borderColor: hexToRgba(ACCENT, 0.25), background: hexToRgba(ACCENT, 0.06) }}
          >
            {e.q}
          </button>
        ))}
      </div>

      <div className="border-t border-line/10 px-4 py-3">
        <div className="flex items-center gap-2 font-mono text-[12px]">
          <span style={{ color: ACCENT }}>?</span>
          <input
            ref={inputRef}
            aria-label="ask the resume index"
            placeholder="ask something about the resume…"
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
            <span style={{ color: ACCENT }}>? </span>
            {question}
          </p>

          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-500">
            <FileSearch className="h-3 w-3" />
            {phase === "retrieving"
              ? "searching index…"
              : answer.chunks.length > 0
              ? `retrieved ${answer.chunks.length} chunks`
              : "0 chunks above threshold"}
            {phase !== "retrieving" &&
              answer.chunks.map((c) => (
                <span
                  key={c}
                  className="rounded px-1.5 py-0.5"
                  style={{ background: hexToRgba(ACCENT, 0.1), color: ACCENT }}
                >
                  {c}
                </span>
              ))}
          </p>

          {phase !== "retrieving" && (
            <div className="mt-2 space-y-1.5">
              {answer.lines.slice(0, lineCount).map((l) => (
                <p key={l} className="flex gap-2 text-zinc-300">
                  <span style={{ color: answer.chunks.length > 0 ? GREEN : "#fbbf24" }}>›</span>
                  <span>{l}</span>
                </p>
              ))}
              {phase === "answering" && (
                <span className="inline-block h-3.5 w-1.5 animate-blink align-middle" style={{ background: ACCENT }} />
              )}
            </div>
          )}
        </div>
      )}

      <div className="border-t border-line/10 px-4 py-2 font-mono text-[10px] text-zinc-600">
        the same pattern as the QA bot shipped at Cisco: retrieve first, answer second, cite always
      </div>
    </div>
  );
}
