"use client";

import { useState } from "react";
import { ArrowRight, Database, ExternalLink, KeyRound, Monitor, RotateCcw, Server } from "lucide-react";
import { cardProps } from "@/data/demos";
import {
  AUTH_FLOW,
  BACKEND_ROUTES,
  PETRA_CHAPTERS,
  READ_FLOW,
  SESSION_MOMENTS,
  type PetraActor,
  type PetraChapterId,
  type PetraTraceStep,
} from "@/lib/demos/petra";
import { LiveDemo } from "./LiveDemo";

const REPO = "https://github.com/Yashas120/Petra";
const BACKEND_REPO = "https://github.com/iVishalr/petra-backend";
const ACCENT = "#14b8a6";

const actorColor: Record<PetraActor, string> = {
  React: "#60a5fa",
  Google: "#f472b6",
  Express: "#14b8a6",
  MongoDB: "#4ade80",
  Browser: "#fbbf24",
};

function Trace({ steps }: Readonly<{ steps: readonly PetraTraceStep[] }>) {
  const [active, setActive] = useState(0);
  const step = steps[active];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,.88fr)_minmax(0,1.12fr)]">
      <ol className="space-y-1" aria-label="Request trace">
        {steps.map((item, index) => (
          <li key={`${item.actor}-${item.title}`}>
            <button
              type="button"
              aria-pressed={active === index}
              onClick={() => setActive(index)}
              className="flex min-h-11 w-full items-center gap-2 rounded-md border px-3 text-left"
              style={{
                borderColor: active === index ? actorColor[item.actor] : "rgb(var(--line) / 0.12)",
                background: active === index ? `${actorColor[item.actor]}12` : "transparent",
              }}
            >
              <span className="font-mono text-[9px] text-zinc-500">{String(index + 1).padStart(2, "0")}</span>
              <span className="font-mono text-[10px] font-semibold" style={{ color: actorColor[item.actor] }}>{item.actor}</span>
              <span className="min-w-0 truncate text-[12px] text-zinc-300">{item.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <section className="rounded-lg border bg-ink-900 p-4" style={{ borderColor: "rgb(var(--line) / 0.14)" }} aria-live="polite">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide" style={{ color: actorColor[step.actor] }}>
          {step.actor}<ArrowRight className="h-3 w-3" aria-hidden /> step {active + 1} of {steps.length}
        </div>
        <h4 className="mt-3 text-sm font-semibold text-zinc-100">{step.title}</h4>
        <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{step.detail}</p>
        <pre className="mt-3 overflow-x-auto rounded-md border p-3 font-mono text-[10px] leading-relaxed text-zinc-300" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>{step.code}</pre>
      </section>
    </div>
  );
}

function RouteInventory() {
  return (
    <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "rgb(var(--line) / 0.14)" }}>
      <table className="w-full min-w-[580px] border-collapse text-left text-[11px]">
        <caption className="sr-only">Documented Petra backend routes</caption>
        <thead className="font-mono uppercase tracking-wide text-zinc-500">
          <tr>{["method", "path", "Mongo read", "response", "JWT guard"].map((label) => <th key={label} className="border-b px-3 py-2" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>{label}</th>)}</tr>
        </thead>
        <tbody>
          {BACKEND_ROUTES.map((route) => (
            <tr key={`${route.method}-${route.path}`} className="text-zinc-300">
              <td className="border-b px-3 py-2 font-mono" style={{ borderColor: "rgb(var(--line) / 0.08)", color: ACCENT }}>{route.method}</td>
              <td className="border-b px-3 py-2 font-mono" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>{route.path}</td>
              <td className="border-b px-3 py-2" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>{route.reads}</td>
              <td className="border-b px-3 py-2" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>{route.response}</td>
              <td className="border-b px-3 py-2 font-mono text-amber-400" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>{route.guarded ? "yes" : "none"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SessionTrace() {
  const [active, setActive] = useState(0);
  const moment = SESSION_MOMENTS[active];

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {SESSION_MOMENTS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={active === index}
            onClick={() => setActive(index)}
            className="min-h-11 rounded-md border px-3 font-mono text-[10px]"
            style={{ borderColor: active === index ? ACCENT : "rgb(var(--line) / 0.12)", color: active === index ? ACCENT : "rgb(var(--zinc-500))" }}
          >
            {item.label}
          </button>
        ))}
        <button type="button" onClick={() => setActive(0)} className="min-h-11 rounded-md border px-3 text-zinc-400" style={{ borderColor: "rgb(var(--line) / 0.12)" }} aria-label="Reset session trace"><RotateCcw className="h-3.5 w-3.5" aria-hidden /></button>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[.72fr_1.28fr]">
        <section className="rounded-lg border p-4" style={{ borderColor: "rgb(var(--line) / 0.14)" }}>
          <p className="font-mono text-[10px] uppercase tracking-wide" style={{ color: ACCENT }}>{moment.route}</p>
          <h4 className="mt-2 text-sm font-semibold text-zinc-100">{moment.label}</h4>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{moment.change}</p>
        </section>
        <div className="space-y-2">
          {moment.values.map((value) => (
            <section key={value.key} className="rounded-lg border p-3" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
              <div className="flex items-center gap-2"><Database className="h-3.5 w-3.5" style={{ color: ACCENT }} aria-hidden /><strong className="font-mono text-[11px] text-zinc-200">sessionStorage.{value.key}</strong></div>
              <code className="mt-2 block overflow-x-auto font-mono text-[10px] text-zinc-400">{value.preview}</code>
              <p className="mt-1 text-[11px] text-zinc-500">{value.purpose}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function BackendAndSession() {
  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-3">
        {[
          { icon: Server, title: "Express · :3001", lines: "CORS, JSON routes, static hotel images", color: actorColor.Express },
          { icon: Database, title: "MongoDB · petraDB", lines: "users, city summaries, full hotel records", color: actorColor.MongoDB },
          { icon: Monitor, title: "Browser · current tab", lines: "router state and four sessionStorage keys", color: actorColor.Browser },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <section key={item.title} className="rounded-lg border p-3" style={{ borderColor: `${item.color}40`, background: `${item.color}08` }}>
              <div className="flex items-center gap-2" style={{ color: item.color }}>
                <Icon className="h-4 w-4" aria-hidden />
                <h4 className="font-mono text-[11px] font-semibold">{item.title}</h4>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">{item.lines}</p>
            </section>
          );
        })}
      </div>

      <div className="mt-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-zinc-500">How the backend reads</p>
        <RouteInventory />
      </div>

      <div className="mt-5 border-t pt-4" style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-zinc-500">How the browser session changes</p>
        <SessionTrace />
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_auto] md:items-center" style={{ borderColor: "rgba(245, 158, 11, 0.32)", background: "rgba(245, 158, 11, 0.05)" }}>
        <p className="text-[11px] leading-relaxed text-zinc-400">
          <strong className="font-medium text-amber-400">The real boundary:</strong> Express returns a seven-day JWT after Google verification, but the React app never stores or sends it. The auth-prefixed read routes do not validate a token, and <code>express-session</code> is not configured. Petra&apos;s continuing login state is the tab&apos;s <code>sessionStorage</code>, not a server session.
        </p>
        <a href={BACKEND_REPO} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-md border px-3 py-2 font-mono text-[10px] text-zinc-400 hover:text-zinc-100" style={{ borderColor: "rgb(var(--line) / 0.14)" }}>
          backend source <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      </div>
    </div>
  );
}

export function PetraDemo({ embedded = false }: Readonly<{ embedded?: boolean }> = {}) {
  const [chapter, setChapter] = useState<PetraChapterId>("read");
  const selected = PETRA_CHAPTERS.find((item) => item.id === chapter) ?? PETRA_CHAPTERS[0];

  return (
    <LiveDemo
      title="Petra — three full-stack walkthroughs"
      subtitle="One hotel read, one Google authentication handoff, and one source-grounded view of the Express backend and browser session. No live Google, Express, or MongoDB service is contacted."
      repoUrl={REPO}
      accent={ACCENT}
      embedded={embedded}
      {...cardProps("petra")}
    >
      <div className="mb-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Petra explainer chapters">
        {PETRA_CHAPTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={chapter === item.id}
            onClick={() => setChapter(item.id)}
            className="min-h-11 rounded-md border px-3 text-left"
            style={{ borderColor: chapter === item.id ? ACCENT : "rgb(var(--line) / 0.12)", background: chapter === item.id ? `${ACCENT}12` : "transparent" }}
          >
            <span className="block font-mono text-[9px] text-zinc-500">{item.number} · {item.label}</span>
            <span className="mt-0.5 block text-[12px] text-zinc-200">{item.title}</span>
          </button>
        ))}
      </div>

      <p className="mb-4 text-[13px] leading-relaxed text-zinc-400">{selected.summary}</p>
      <div role="tabpanel">
        {chapter === "read" && <Trace steps={READ_FLOW} />}
        {chapter === "auth" && <><div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-zinc-500"><KeyRound className="h-3.5 w-3.5" aria-hidden /> identity proof crosses a server verification boundary</div><Trace steps={AUTH_FLOW} /></>}
        {chapter === "session" && <BackendAndSession />}
      </div>
    </LiveDemo>
  );
}

export function PetraLab() {
  return <PetraDemo embedded />;
}
