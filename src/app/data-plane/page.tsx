"use client";

import { useState } from "react";
import { Zap, Waves } from "lucide-react";
import { motion } from "framer-motion";
import { Bringup } from "@/components/data-plane/Bringup";
import { HalStack } from "@/components/data-plane/HalStack";
import { DriverBus } from "@/components/data-plane/DriverBus";
import { PublicationList } from "@/components/data-plane/PublicationList";
import { LabBackground } from "@/components/data-plane/LabBackground";
import { Deck, useDeck, type DeckSlide } from "@/components/data-plane/Deck";
import { profile } from "@/data/profile";
import { skills } from "@/data/skills";
import { highlights } from "@/data/highlights";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#a78bfa";
const HEADER_OFFSET = 52;
const BRINGUP_SLIDE = 1;

function Section({ tag, title, children }: Readonly<{ tag: string; title: string; children: React.ReactNode }>) {
  return (
    <section className="mx-auto w-full max-w-5xl px-6">
      <div className="mb-3 font-mono">
        <p className="text-[11px]" style={{ color: ACCENT }}>{tag}</p>
        <h2 className="mt-0.5 text-base font-semibold text-zinc-100 sm:text-lg">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function IntroSlide({ channels, onBringUp }: Readonly<{ channels: number; onBringUp: () => void }>) {
  const deck = useDeck();
  return (
    <section className="mx-auto w-full max-w-5xl px-6">
      <h1 className="text-3xl font-semibold text-zinc-50 sm:text-5xl">{profile.shortName}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">{profile.summary}</p>
      <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs">
        <span className="rounded-full border px-3 py-1 text-zinc-200" style={{ borderColor: hexToRgba(ACCENT, 0.3), background: hexToRgba(ACCENT, 0.06) }}>
          {profile.current}
        </span>
        <span className="rounded-full border border-line/10 px-3 py-1 text-zinc-300">{profile.previous}</span>
      </div>
      <button
        onClick={() => {
          onBringUp();
          deck.goTo(BRINGUP_SLIDE);
        }}
        className="mt-7 inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-sm transition-colors hover:brightness-110"
        style={{ borderColor: ACCENT, color: ACCENT, background: hexToRgba(ACCENT, 0.1) }}
      >
        <Zap className="h-4 w-4" /> bring up λ {channels > 0 ? `· ch${channels}` : ""}
      </button>
    </section>
  );
}

export default function DataPlanePage() {
  const [channels, setChannels] = useState(0);

  const slides: DeckSlide[] = [
    {
      id: "intro",
      tag: "intro",
      node: <IntroSlide channels={channels} onBringUp={() => setChannels((c) => c + 1)} />,
    },
    {
      id: "bringup",
      tag: "dev/bringup",
      node: (
        <Section tag="dev/bringup" title="Traffic bringup — the span from Bengaluru to La Jolla">
          <Bringup trigger={channels} />
        </Section>
      ),
    },
    {
      id: "drivers",
      tag: "drv/",
      node: (
        <Section tag="drv/" title="PSM — optical protection switching (working ⇄ protect)">
          <DriverBus />
        </Section>
      ),
    },
    {
      id: "hal",
      tag: "hal/",
      node: (
        <Section tag="hal/" title="HAL stack — descend from control plane to the metal">
          <HalStack />
        </Section>
      ),
    },
    {
      id: "skills",
      tag: "channel plan",
      node: (
        <Section tag="channel plan" title="Spectrum — skills across the band">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((g, gi) => (
              <motion.div
                key={g.category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.04 }}
                className="rounded-lg border border-line/10 bg-ink-800 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-mono text-[11px] text-zinc-400">{g.category}</p>
                  <span className="font-mono text-[10px]" style={{ color: ACCENT }}>λ{gi + 1}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {g.items.map((it) => (
                    <span
                      key={it}
                      className="rounded border px-1.5 py-0.5 font-mono text-[10px] text-zinc-300"
                      style={{ borderColor: hexToRgba(ACCENT, 0.25), background: hexToRgba(ACCENT, 0.06) }}
                    >
                      {it}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      ),
    },
    {
      id: "publications",
      tag: "references",
      node: (
        <Section tag="references" title="Published work — reference signals">
          <PublicationList />
        </Section>
      ),
    },
    {
      id: "markers",
      tag: "markers",
      node: (
        <Section tag="markers" title="Markers — awards, certs & education">
          <div className="mb-3 flex flex-wrap gap-2 font-mono text-[11px]">
            <span className="rounded-full border px-3 py-1 text-zinc-200" style={{ borderColor: hexToRgba(ACCENT, 0.3), background: hexToRgba(ACCENT, 0.06) }}>
              {profile.current}
            </span>
            <span className="rounded-full border border-line/10 px-3 py-1 text-zinc-300">{profile.education}</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((h, i) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-lg border border-line/10 bg-ink-800 p-3"
              >
                <p className="text-[13px] font-semibold text-zinc-100">{h.label}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">{h.detail}</p>
              </motion.div>
            ))}
          </div>
        </Section>
      ),
    },
    {
      id: "contact",
      tag: "contact",
      node: (
        <section className="mx-auto w-full max-w-5xl px-6">
          <div className="rounded-xl border p-5 font-mono text-sm" style={{ borderColor: hexToRgba(ACCENT, 0.25), background: hexToRgba(ACCENT, 0.04) }}>
            <p className="text-xs text-zinc-500"># open a case</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a href={`mailto:${profile.email}`} className="rounded-md border border-line/10 px-3 py-2 text-zinc-200 hover:border-line/30">{profile.email}</a>
              <a href={profile.github} target="_blank" rel="noreferrer noopener" className="rounded-md border border-line/10 px-3 py-2 text-zinc-200 hover:border-line/30">@{profile.githubUser}</a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer noopener" className="rounded-md border border-line/10 px-3 py-2 text-zinc-200 hover:border-line/30">linkedin</a>
            </div>
          </div>
        </section>
      ),
    },
  ];

  return (
    <main className="relative h-[100dvh] overflow-hidden text-zinc-300">
      <LabBackground />

      <header
        className="fixed inset-x-0 top-0 z-40 border-b backdrop-blur"
        style={{ background: "rgb(var(--ink-900) / 0.72)", borderColor: hexToRgba(ACCENT, 0.2) }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3 font-mono text-sm">
          <span className="font-mono text-zinc-500">Yashas Kadambi</span>
          <span className="flex items-center gap-2" style={{ color: ACCENT }}>
            <Waves className="h-4 w-4" /> optical@ncs1014
          </span>
          <span className="hidden items-center gap-1.5 text-xs text-zinc-500 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" /> LINK UP · λ locked
          </span>
        </div>
      </header>

      <Deck slides={slides} headerOffset={HEADER_OFFSET} />
    </main>
  );
}
