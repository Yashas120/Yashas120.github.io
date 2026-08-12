"use client";

import { useRef } from "react";
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import type { Tone } from "@/lib/clusterTheme";
import { contact, disclose, hero, links, scenes, type SceneCopy } from "@/lib/clusterContent";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useIsDesktop } from "@/lib/useIsDesktop";
import { useClusterTheme, useTokens } from "./theme";
import type { DiagramProps, Step } from "./diagrams/primitives";
import { DependencyDagDiagram, EventFanoutDiagram, ReplicationDiagram } from "./diagrams/work";
import { ConsumerDiscoveryDiagram, CutoverDiagram, ReconciliationDiagram, RolloutDiagram } from "./diagrams/platform";
import { AllocationDiagram, ContextDiagram, DataPipelineDiagram, SchedulingDiagram, StreamingDiagram } from "./diagrams/projects";
import { EvidenceIndex } from "./EvidenceIndex";

const DIAGRAMS: Record<string, React.ComponentType<DiagramProps>> = {
  events: EventFanoutDiagram,
  backend: DependencyDagDiagram,
  discovery: ConsumerDiscoveryDiagram,
  cutover: CutoverDiagram,
  rollout: RolloutDiagram,
  reconcile: ReconciliationDiagram,
  pipeline: DataPipelineDiagram,
  ghost: SchedulingDiagram,
  streaming: StreamingDiagram,
  provisioning: AllocationDiagram,
  now: ContextDiagram,
};

const TOTAL = scenes.length + 2; // hero + mechanism scenes + contact
const INVERTED_INDEX = scenes.findIndex((s) => s.tone === "inverted") + 1; // +1 for the hero slot

/** Fade windows for a scene: the previous scene reaches 0 before the next rises. */
function windows(index: number, total: number) {
  const band = 1 / total;
  const start = index * band;
  const end = start + band;
  return {
    band,
    start,
    end,
    fi0: index === 0 ? -1 : start - 0.02 * band,
    fi1: index === 0 ? -0.999 : start + 0.12 * band,
    fo0: index === total - 1 ? 2 : end - 0.14 * band,
    fo1: index === total - 1 ? 2.001 : end - 0.02 * band,
  };
}

export function ClusterFilm() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const reduced = useReducedMotionSafe();
  const desktop = useIsDesktop();
  const vertical = !desktop;
  const base = useTokens("base");
  const inv = useTokens("inverted");

  // The canvas inverts while the *previous* copy is already fading out, and
  // returns only after the inverted copy has gone — so no scene is ever read
  // against a half-transitioned background.
  const iw = windows(INVERTED_INDEX, TOTAL);
  const invOpacity = useTransform(
    scrollYProgress,
    [iw.start - 0.13 * iw.band, iw.start, iw.end - 0.08 * iw.band, iw.end + 0.01 * iw.band],
    [0, 1, 1, 0],
    { clamp: true },
  );
  const headerInk = useTransform(invOpacity, [0, 1], [base.ink, inv.ink]);
  const headerMuted = useTransform(invOpacity, [0, 1], [base.muted, inv.muted]);

  return (
    <div className="relative overflow-x-clip" style={{ background: base.canvas }}>
      <a
        href="#evidence"
        className="skip-link rounded-br-lg px-4 py-2 text-sm font-medium"
        style={{ background: base.blue, color: base.canvas }}
      >
        Skip to résumé details
      </a>

      <FilmHeader ink={headerInk} muted={headerMuted} />

      <div ref={trackRef} style={{ height: `${TOTAL * 150}vh` }} className="relative">
        <div className="sticky top-0 h-svh overflow-hidden">
          <motion.div className="absolute inset-0" style={{ background: inv.canvas, opacity: invOpacity }} />

          <SceneSlot index={0} progress={scrollYProgress} reduced={reduced}>
            {(mech, copyY) => (
              <SceneFrame
                copyY={copyY}
                copy={<HeroCopy />}
                diagram={<ReplicationDiagram p={mech} vertical={vertical} tone="base" />}
              />
            )}
          </SceneSlot>

          {scenes.map((s, i) => {
            const Diagram = DIAGRAMS[s.id];
            const tone: Tone = s.tone ?? "base";
            return (
              <SceneSlot key={s.id} index={i + 1} progress={scrollYProgress} reduced={reduced}>
                {(mech, copyY) => (
                  <SceneFrame
                    copyY={copyY}
                    copy={<SceneCopyBlock scene={s} />}
                    diagram={<Diagram p={mech} vertical={vertical} tone={tone} />}
                  />
                )}
              </SceneSlot>
            );
          })}

          <SceneSlot index={TOTAL - 1} progress={scrollYProgress} reduced={reduced}>
            {(_mech, copyY) => <ContactFrame copyY={copyY} />}
          </SceneSlot>
        </div>
      </div>

      <EvidenceIndex />
    </div>
  );
}

/* ---------------- header ---------------- */

function FilmHeader({ ink, muted }: Readonly<{ ink: MotionValue<string>; muted: MotionValue<string> }>) {
  const { mode, toggle } = useClusterTheme();
  const linkCls =
    "text-[14px] underline-offset-4 transition-opacity hover:opacity-70 hover:underline focus-visible:underline focus-visible:outline-none";
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4 md:px-10 lg:px-14">
      <motion.span style={{ color: ink }} className="text-[15px] font-semibold tracking-tight">
        Yashas Kadambi
      </motion.span>
      <nav aria-label="Primary" className="pointer-events-auto flex items-center gap-5 sm:gap-6">
        <motion.a href={links.github} target="_blank" rel="noopener noreferrer" style={{ color: muted }} className={linkCls}>
          GitHub
        </motion.a>
        <motion.a href={links.email} style={{ color: muted }} className={linkCls}>
          Email
        </motion.a>
        <motion.button
          type="button"
          onClick={toggle}
          aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          style={{ color: muted }}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          {mode === "dark" ? <Sun className="h-[18px] w-[18px]" aria-hidden /> : <Moon className="h-[18px] w-[18px]" aria-hidden />}
        </motion.button>
      </nav>
    </header>
  );
}

/* ---------------- scene plumbing ---------------- */

function SceneSlot({
  index,
  progress,
  reduced,
  children,
}: Readonly<{
  index: number;
  progress: MotionValue<number>;
  reduced: boolean;
  children: (mech: Step, copyY: MotionValue<number>) => React.ReactNode;
}>) {
  const w = windows(index, TOTAL);
  const opacity = useTransform(progress, [w.fi0, w.fi1, w.fo0, w.fo1], [0, 1, 1, 0], { clamp: true });
  const visibility = useTransform(opacity, (o) => (o < 0.02 ? "hidden" : "visible"));
  const pointerEvents = useTransform(opacity, (o) => (o < 0.6 ? "none" : "auto"));

  // copy settles in, holds, then lifts a short distance as the scene ends
  const copyY = useTransform(progress, [w.fi0, w.fi1, w.fo0, w.fo1], [14, 0, 0, -22], { clamp: true });

  const live = useTransform(progress, [w.start + 0.1 * w.band, w.end - 0.16 * w.band], [0, 1], { clamp: true });
  const still = useMotionValue(1);
  const mech = reduced ? still : live;

  return (
    <motion.div style={{ opacity, visibility, pointerEvents }} className="absolute inset-0">
      {children(mech, reduced ? still : copyY)}
    </motion.div>
  );
}

function SceneFrame({
  copy,
  diagram,
  copyY,
}: Readonly<{ copy: React.ReactNode; diagram: React.ReactNode; copyY: MotionValue<number> }>) {
  return (
    <div className="mx-auto flex h-full w-full max-w-[1440px] flex-col justify-center gap-4 px-5 pb-5 pt-[64px] md:gap-5 md:px-10 md:pb-10 md:pt-20 lg:grid lg:grid-cols-[minmax(0,36fr)_minmax(0,60fr)] lg:items-center lg:gap-12 lg:px-14 lg:pt-14">
      <motion.div style={{ y: copyY }} className="order-2 min-w-0 lg:order-1">
        {copy}
      </motion.div>
      <div className="order-1 h-[34svh] min-h-[18svh] w-full lg:order-2 lg:h-[74vh]">{diagram}</div>
    </div>
  );
}

/* ---------------- copy blocks ---------------- */

function HeroCopy() {
  const t = useTokens("base");
  return (
    <div>
      <p className="text-[12px] font-medium uppercase tracking-[0.16em]" style={{ color: t.blue }}>
        {hero.eyebrow}
      </p>
      <h1 className="mt-3 text-[clamp(2.3rem,6.4vw,6rem)] font-semibold leading-[0.95] tracking-[-0.03em] md:mt-4" style={{ color: t.ink }}>
        {hero.name}
      </h1>
      <p className="mt-3 text-[clamp(1.2rem,2.4vw,2.6rem)] font-medium leading-[1.15] tracking-[-0.02em] md:mt-4" style={{ color: t.ink }}>
        {hero.statement}
      </p>
      <p className="mt-3 max-w-[48ch] text-[14.5px] leading-relaxed md:mt-5 md:text-[17px]" style={{ color: t.muted }}>
        {hero.body}
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 md:mt-6 md:gap-x-5 md:gap-y-2">
        {hero.evidence.map((h) => (
          <li key={h} className="flex items-center gap-2 text-[13px] leading-snug md:text-[14.5px]" style={{ color: t.ink }}>
            <span aria-hidden className="h-[3px] w-3 shrink-0 md:w-3.5" style={{ background: t.blue }} />
            {h}
          </li>
        ))}
      </ul>
      <div className="mt-7 flex flex-wrap items-center gap-5 text-[15px]">
        <a href={links.github} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:opacity-70" style={{ color: t.blue }}>
          GitHub
        </a>
        <a href={links.email} className="underline underline-offset-4 hover:opacity-70" style={{ color: t.blue }}>
          Email
        </a>
        <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:opacity-70" style={{ color: t.blue }}>
          LinkedIn
        </a>
      </div>
    </div>
  );
}

function SceneCopyBlock({ scene }: Readonly<{ scene: SceneCopy }>) {
  const t = useTokens(scene.tone ?? "base");
  const scaleLines = scene.scale ? disclose(scene.scale) : null;
  return (
    <div>
      <p className="text-[12px] font-medium uppercase tracking-[0.16em]" style={{ color: t.blue }}>
        {scene.kicker}
      </p>
      <h2 className="mt-3 text-[clamp(1.5rem,2.5vw,2.4rem)] font-semibold leading-[1.08] tracking-[-0.02em]" style={{ color: t.ink }}>
        {scene.heading}
      </h2>

      {scene.ownership && (
        <p className="mt-2 font-mono text-[11.5px] uppercase tracking-wider" style={{ color: t.muted }}>
          {scene.ownership}
        </p>
      )}

      <p className="mt-3 max-w-[48ch] text-[14.5px] leading-relaxed md:mt-4 md:text-[16.5px]" style={{ color: t.muted }}>
        {scene.body}
      </p>
      {/* Secondary paragraph and disclosure line are dropped on phones, where the
          stage cannot fit them beside a legible diagram. Both remain in the index. */}
      {scene.support && (
        <p className="mt-3 hidden max-w-[48ch] text-[15.5px] leading-relaxed md:block md:text-[16.5px]" style={{ color: t.muted }}>
          {scene.support}
        </p>
      )}

      {scene.arch && (
        <p className="mt-3 font-mono text-[11.5px] leading-relaxed md:mt-4 md:text-[12.5px]" style={{ color: t.blue }}>
          {scene.arch}
        </p>
      )}

      <ul className="mt-4 space-y-1.5 md:mt-5 md:space-y-2">
        {scene.highlights.map((h) => (
          <li key={h} className="flex gap-3 text-[13.5px] leading-snug md:text-[15.5px]" style={{ color: t.ink }}>
            <span aria-hidden className="mt-[8px] h-[3px] w-3.5 shrink-0 md:mt-[9px] md:w-4" style={{ background: t.blue }} />
            {h}
          </li>
        ))}
      </ul>

      {scaleLines && (
        <ul className="mt-4 hidden space-y-1 md:block">
          {scaleLines.map((s) => (
            <li key={s} className="text-[13.5px] leading-snug" style={{ color: t.muted }}>
              {s}
            </li>
          ))}
        </ul>
      )}

      {(scene.stack || scene.repo) && (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          {scene.stack && (
            <p className="font-mono text-[12px]" style={{ color: t.muted }}>
              {scene.stack}
            </p>
          )}
          {scene.repo && (
            <a
              href={scene.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13.5px] underline underline-offset-4 hover:opacity-70"
              style={{ color: t.blue }}
            >
              Repository
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function ContactFrame({ copyY }: Readonly<{ copyY: MotionValue<number> }>) {
  const t = useTokens("base");
  return (
    <div className="mx-auto flex h-full w-full max-w-[1440px] items-center px-5 pt-20 md:px-10 lg:px-14">
      <motion.div style={{ y: copyY }} className="max-w-[52ch]">
        <p className="text-[12px] font-medium uppercase tracking-[0.16em]" style={{ color: t.blue }}>
          {contact.kicker}
        </p>
        <h2 className="mt-3 text-[clamp(2.25rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em]" style={{ color: t.ink }}>
          {contact.heading}
        </h2>
        <p className="mt-5 text-[17px] leading-relaxed md:text-[19px]" style={{ color: t.muted }}>
          {contact.body}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-6 text-[16px]">
          <a href={links.email} className="underline underline-offset-4 hover:opacity-70" style={{ color: t.blue }}>
            {links.emailPlain}
          </a>
          <a href={links.github} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:opacity-70" style={{ color: t.blue }}>
            GitHub
          </a>
          <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:opacity-70" style={{ color: t.blue }}>
            LinkedIn
          </a>
        </div>
        <p className="mt-10 text-[14px]" style={{ color: t.muted }}>
          Full experience, projects, publications and skills continue below.
        </p>
      </motion.div>
    </div>
  );
}
