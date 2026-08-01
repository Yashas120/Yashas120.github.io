"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Play, Workflow } from "lucide-react";
import { AgentLoop } from "@/components/backend/AgentLoop";
import { SloConverge } from "@/components/backend/SloConverge";
import { TimeReclaimed } from "@/components/backend/TimeReclaimed";
import { ToilDiff } from "@/components/backend/ToilDiff";
import { EventMesh } from "@/components/backend/EventMesh";
import { RagConsole } from "@/components/backend/RagConsole";
import { ControlPlaneBackground } from "@/components/backend/ControlPlaneBackground";
import { profile } from "@/data/profile";
import { skills } from "@/data/skills";
import { metrics } from "@/data/metrics";
import { projects } from "@/data/projects";
import { highlights } from "@/data/highlights";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#60a5fa";
const GREEN = "#4ade80";

// How the work gets done, stated once so the rest of the page can just show it.
const principles = [
  "declare it, don't click it",
  "review the plan, not the keystrokes",
  "if it happens twice, it becomes a pipeline",
  "AI only where it's grounded and cited",
];

const ledger = metrics.filter((m) => m.domains.includes("devops") || m.domains.includes("web"));

function moduleName(category: string) {
  return category.toLowerCase().replace(/[^a-z]+/g, "_").replace(/^_|_$/g, "");
}

function Section({ tag, title, children }: { tag: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-4 font-mono">
        <p className="text-[11px]" style={{ color: ACCENT }}>
          {tag}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-100">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function BackendPage() {
  const [runs, setRuns] = useState(0);

  return (
    <main className="relative min-h-screen text-zinc-300">
      <ControlPlaneBackground />
      <div className="relative z-10">
        <header
          className="sticky top-0 z-40 border-b backdrop-blur"
          style={{ background: "rgb(var(--ink-900) / 0.72)", borderColor: hexToRgba(ACCENT, 0.2) }}
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3 font-mono text-sm">
            <span className="text-zinc-500">Yashas Kadambi</span>
            <span className="flex items-center gap-2" style={{ color: ACCENT }}>
              <Workflow className="h-4 w-4" /> agent@px-cloud:~$
            </span>
            <span className="hidden items-center gap-1.5 text-xs text-zinc-500 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: GREEN }} /> loop closed · drift 0
            </span>
          </div>
        </header>

        <section className="mx-auto max-w-5xl px-6 pt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-50 sm:text-3xl">{profile.shortName}</h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-400">
                Backend and platform engineer. The job was never clicking through a console or hand-editing SDKs — it is
                building the system that does that work, then reviewing what it proposes.
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">{profile.summary}</p>
            </div>
            <button
              onClick={() => setRuns((r) => r + 1)}
              className="inline-flex items-center gap-2 self-start rounded-lg border px-4 py-2 font-mono text-sm transition-colors hover:brightness-110"
              style={{ borderColor: ACCENT, color: ACCENT, background: hexToRgba(ACCENT, 0.1) }}
            >
              <Play className="h-4 w-4" /> dispatch intent {runs > 0 ? `· run ${runs + 1}` : ""}
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 font-mono text-[11px]">
            {principles.map((p) => (
              <span
                key={p}
                className="rounded-full border px-3 py-1 text-zinc-300"
                style={{ borderColor: hexToRgba(ACCENT, 0.25), background: hexToRgba(ACCENT, 0.06) }}
              >
                {p}
              </span>
            ))}
          </div>
        </section>

        <Section tag="agent/run" title="One intent in, reviewed infrastructure out">
          <AgentLoop trigger={runs} />
        </Section>

        <Section tag="observe/" title="Close the loop — watch the SLOs converge">
          <SloConverge trigger={runs} />
        </Section>

        <section className="mx-auto max-w-5xl px-6 py-8">
          <TimeReclaimed />
        </section>

        <Section tag="diff" title="How this used to be built vs what actually shipped">
          <ToilDiff />
        </Section>

        <Section tag="events/" title="Nothing polls — the work triggers itself">
          <EventMesh />
        </Section>

        <Section tag="rag/" title="Ask the resume — retrieval first, answer second">
          <RagConsole />
        </Section>

        <Section tag="ledger" title="Measured impact — the numbers behind it">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ledger.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-line/10 bg-ink-800 p-4"
              >
                <p className="font-mono text-[11px] text-zinc-500">{m.label}</p>
                <p className="mt-1 font-mono text-2xl font-semibold" style={{ color: ACCENT }}>
                  {m.value}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{m.context}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        <Section tag="registry" title="Module registry — the stack, declared">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((g, gi) => (
              <motion.div
                key={g.category}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: gi * 0.05 }}
                className="rounded-xl border border-line/10 bg-ink-800 p-4 font-mono text-[11px] leading-relaxed"
              >
                <p>
                  <span style={{ color: ACCENT }}>module</span>{" "}
                  <span className="text-zinc-200">&quot;{moduleName(g.category)}&quot;</span>{" "}
                  <span className="text-zinc-600">{"{"}</span>
                </p>
                <p className="pl-3 text-zinc-500">
                  provides = [
                </p>
                <div className="flex flex-wrap gap-1.5 py-1 pl-6">
                  {g.items.map((it) => (
                    <span
                      key={it}
                      className="rounded-md border px-2 py-1 text-zinc-300"
                      style={{ borderColor: hexToRgba(ACCENT, 0.25), background: hexToRgba(ACCENT, 0.06) }}
                    >
                      {it}
                    </span>
                  ))}
                </div>
                <p className="pl-3 text-zinc-500">]</p>
                <p className="text-zinc-600">{"}"}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        <Section tag="catalog" title="Service catalog — what's deployed">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {projects.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-line/10 bg-ink-800 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono text-[11px] text-zinc-500">svc/{p.id}</span>
                  <span className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${
                        p.status === "archived" ? "text-zinc-400" : ""
                      }`}
                      style={{
                        background: p.status === "archived" ? "rgb(var(--line) / 0.08)" : hexToRgba(GREEN, 0.12),
                        color: p.status === "archived" ? undefined : GREEN,
                      }}
                    >
                      {p.status === "archived" ? "retired" : "deployed"}
                    </span>
                    {p.repoUrl && (
                      <a
                        href={p.repoUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`${p.title} repository`}
                        className="text-zinc-500 transition-colors hover:text-zinc-200"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </span>
                </div>
                <h3 className="mt-1.5 text-sm font-semibold leading-snug text-zinc-100">{p.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">{p.blurb}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <span key={t} className="rounded-md border border-line/10 px-2 py-1 font-mono text-[10px] text-zinc-400">
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        <Section tag="markers" title="Markers — awards, certs & education">
          <div className="mb-4 flex flex-wrap gap-2 font-mono text-xs">
            <span
              className="rounded-full border px-3 py-1 text-zinc-200"
              style={{ borderColor: hexToRgba(ACCENT, 0.3), background: hexToRgba(ACCENT, 0.06) }}
            >
              {profile.current}
            </span>
            <span className="rounded-full border border-line/10 px-3 py-1 text-zinc-300">{profile.previous}</span>
            <span className="rounded-full border border-line/10 px-3 py-1 text-zinc-300">{profile.education}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((h, i) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-line/10 bg-ink-800 p-4"
              >
                <p className="text-sm font-semibold text-zinc-100">{h.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{h.detail}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        <section className="mx-auto max-w-5xl px-6 pb-20">
          <div
            className="rounded-xl border p-5 font-mono text-sm"
            style={{ borderColor: hexToRgba(ACCENT, 0.25), background: hexToRgba(ACCENT, 0.04) }}
          >
            <p className="text-xs text-zinc-500"># dispatch a real one</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <a href={`mailto:${profile.email}`} className="rounded-md border border-line/10 px-3 py-2 text-zinc-200 hover:border-line/30">
                {profile.email}
              </a>
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-md border border-line/10 px-3 py-2 text-zinc-200 hover:border-line/30"
              >
                @{profile.githubUser}
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-md border border-line/10 px-3 py-2 text-zinc-200 hover:border-line/30"
              >
                linkedin
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
