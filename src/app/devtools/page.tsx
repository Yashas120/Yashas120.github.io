"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { ElementsPanel } from "@/components/devtools/ElementsPanel";
import { NetworkPanel } from "@/components/devtools/NetworkPanel";
import { ConsolePanel } from "@/components/devtools/ConsolePanel";
import { SourcesPanel } from "@/components/devtools/SourcesPanel";
import { LighthousePanel } from "@/components/devtools/LighthousePanel";
import { profile } from "@/data/profile";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#f59e0b";

const tabs = [
  { id: "elements", label: "Elements" },
  { id: "console", label: "Console" },
  { id: "network", label: "Network" },
  { id: "sources", label: "Sources" },
  { id: "lighthouse", label: "Lighthouse" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function DevToolsPage() {
  const [tab, setTab] = useState<TabId>("elements");

  return (
    <main className="min-h-screen bg-ink-900 text-zinc-300">
      <header className="sticky top-0 z-40 border-b backdrop-blur" style={{ background: "rgb(var(--ink-900) / 0.85)", borderColor: hexToRgba(ACCENT, 0.2) }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 font-mono text-sm">
          <span className="font-mono text-zinc-500">Yashas Kadambi</span>
          <span style={{ color: ACCENT }}>devtools</span>
          <span className="hidden text-xs text-zinc-500 sm:block">Inspect the resume</span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="mb-1 text-2xl font-semibold text-zinc-50 sm:text-3xl">{profile.shortName}</h1>
        <p className="mb-6 text-sm text-zinc-400">{profile.tagline}</p>

        {/* browser window */}
        <div className="overflow-hidden rounded-xl border border-line/10 bg-ink-800 shadow-2xl">
          {/* chrome top bar */}
          <div className="flex items-center gap-3 border-b px-4 py-2.5" style={{ borderColor: "rgb(var(--line) / 0.08)", background: "#0b0d12" }}>
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="ml-2 flex flex-1 items-center gap-2 rounded-md px-3 py-1 font-mono text-[11px] text-zinc-400" style={{ background: "#08090c" }}>
              <Lock className="h-3 w-3 text-zinc-500" />
              yashas.dev/{tab}
            </div>
          </div>

          {/* devtools tabs */}
          <div className="flex overflow-x-auto border-b" style={{ borderColor: "rgb(var(--line) / 0.08)", background: "#0b0d12" }}>
            {tabs.map((tb) => (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className="whitespace-nowrap border-b-2 px-4 py-2 font-mono text-[12px] transition-colors"
                style={{
                  borderColor: tab === tb.id ? ACCENT : "transparent",
                  color: tab === tb.id ? ACCENT : "#a1a1aa",
                }}
              >
                {tb.label}
              </button>
            ))}
          </div>

          {/* panel body */}
          <div className="max-h-[62vh] min-h-[380px] overflow-auto" style={{ background: "#08090c" }}>
            {tab === "elements" && <ElementsPanel />}
            {tab === "console" && <ConsolePanel />}
            {tab === "network" && <NetworkPanel />}
            {tab === "sources" && <SourcesPanel />}
            {tab === "lighthouse" && <LighthousePanel />}
          </div>
        </div>

        <p className="mt-4 font-mono text-[11px] text-zinc-600">
          tip: open <span style={{ color: ACCENT }}>Console</span> and type <span style={{ color: ACCENT }}>contact()</span>
        </p>
      </div>
    </main>
  );
}
