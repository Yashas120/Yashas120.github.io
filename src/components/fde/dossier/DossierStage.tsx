"use client";

/** One native scroll track, one pinned viewport, eleven reversible scene layers. */

import { useRef, type CSSProperties } from "react";
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useIsDesktop } from "@/lib/useIsDesktop";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import {
  BG,
  BG_DEEP,
  CopyBlock,
  INK,
  PAPER,
  PAPER_DEEP,
  SHEET,
  RegMark,
  useMech,
  useSceneOpacity,
  sceneWindow,
} from "./kit";
import type { SceneVisualProps } from "./types";
import { Scene01Hero } from "./Scene01Hero";
import { Scene02Workflow } from "./Scene02Workflow";
import { Scene03Tool } from "./Scene03Tool";
import { Scene04Production } from "./Scene04Production";
import { Scene05Rollout } from "./Scene05Rollout";
import { Scene06Diagnosis } from "./Scene06Diagnosis";
import { Scene07Constraints } from "./Scene07Constraints";
import { Scene06Leverage } from "./Scene06Leverage";
import { Scene07Rag } from "./Scene07Rag";
import { Scene10Optical } from "./Scene10Optical";
import { SceneHandoff } from "./SceneHandoff";
import { LeverageCopy } from "./copy";
import { leverageItems, scenes, type DossierScene, type DossierVisual } from "@/data/fdeDossier";

type Visual = (props: SceneVisualProps) => JSX.Element;

const VISUAL_BY_KEY: Record<DossierVisual, Visual> = {
  cover: Scene01Hero,
  workflow: Scene02Workflow,
  tool: Scene03Tool,
  production: Scene04Production,
  rollout: Scene05Rollout,
  diagnosis: Scene06Diagnosis,
  constraints: Scene07Constraints,
  leverage: Scene06Leverage,
  rag: Scene07Rag,
  optical: Scene10Optical,
  release: SceneHandoff,
};

/** Component, copy, slug, tone, evidence, and ordering share this registry. */
const SCENE_REGISTRY = scenes.map((scene) => ({ scene, Visual: VISUAL_BY_KEY[scene.visual] }));
const SCENE_COUNT = SCENE_REGISTRY.length;

const ALIGN = [
  "md:items-center",
  "md:items-start",
  "md:items-center",
  "md:items-end",
  "md:items-center",
  "md:items-start",
  "md:items-center",
  "md:items-start",
  "md:items-center",
  "md:items-center",
  "md:items-center",
] as const;

function StaticLeverageList() {
  return (
    <ul className="mt-5 space-y-2.5 text-[0.92rem] leading-[1.5]">
      {leverageItems.map((item) => <li key={item.id}><span className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-60">{item.label} · </span>{item.line}</li>)}
    </ul>
  );
}

function SceneCopy({ scene, index, p, compact, semantic }: Readonly<{ scene: DossierScene; index: number; p: MotionValue<number>; compact: boolean; semantic: boolean }>) {
  if (!semantic && scene.visual === "leverage") return <LeverageCopy p={p} scene={scene} compact={compact} />;
  return (
    <CopyBlock
      scene={scene.id}
      slug={index === 0 ? "THE DEPLOYMENT DOSSIER" : scene.slug}
      eyebrow={scene.eyebrow}
      headline={scene.headline}
      body={scene.body}
      notes={scene.notes}
      outcome={scene.outcome}
      hero={index === 0}
      compact={compact}
      as={semantic ? (index === 0 ? "h1" : "h2") : "div"}
    >
      {scene.visual === "leverage" ? <StaticLeverageList /> : null}
    </CopyBlock>
  );
}

function SemanticTranscript() {
  return (
    <div className="sr-only" data-fde-transcript>
      {SCENE_REGISTRY.map(({ scene }, index) => (
        <SemanticScene key={scene.id} scene={scene} index={index} />
      ))}
    </div>
  );
}

function SemanticScene({ scene, index }: Readonly<{ scene: DossierScene; index: number }>) {
  const complete = useMotionValue(1);
  return (
    <section id={`scene-${scene.id}`}>
      <SceneCopy scene={scene} index={index} p={complete} compact={false} semantic />
    </section>
  );
}

function SceneLayer({ entry, index, progress, compact }: Readonly<{ entry: (typeof SCENE_REGISTRY)[number]; index: number; progress: MotionValue<number>; compact: boolean }>) {
  const opacity = useSceneOpacity(progress, index, SCENE_COUNT);
  const mech = useMech(progress, index, SCENE_COUNT);
  const visibility = useTransform(opacity, (o) => (o < 0.02 ? "hidden" : "visible"));
  const sheetY = useTransform(mech, [0, 1], [10, -10]);
  const deep = entry.scene.panel === "deep";
  const { Visual } = entry;

  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity, visibility }}
      data-fde-scene={entry.scene.id}
      className={`fde-scene-layer absolute inset-0 grid min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-[58svh_minmax(0,1fr)] gap-2 px-5 pb-6 pt-[calc(var(--fde-header)+12px)] md:grid-rows-1 md:gap-10 md:pb-12 md:pl-10 md:pr-[92px] md:pt-[calc(var(--fde-header)+64px)] ${index === 0 ? "md:grid-cols-[48%_52%]" : "md:grid-cols-[43%_57%]"}`}
    >
      {deep ? <div className="absolute inset-0 -z-10" style={{ background: BG_DEEP }} /> : null}
      <div data-fde-copy-pane className={`relative flex min-w-0 items-start overflow-hidden pb-2 md:h-full ${ALIGN[index]}`}>
        <SceneCopy scene={entry.scene} index={index} p={mech} compact={compact} semantic={false} />
      </div>
      <motion.div className="relative flex min-h-0 min-w-0 items-center justify-center overflow-hidden" style={{ y: sheetY }}>
        <svg viewBox={`0 0 ${SHEET.w} ${SHEET.h}`} className="h-auto max-h-full w-full max-w-full" aria-hidden="true" focusable="false">
          <rect x={8} y={8} width={SHEET.w - 16} height={SHEET.h - 16} fill={deep ? PAPER_DEEP : PAPER} stroke="currentColor" strokeWidth={0.8} strokeOpacity={0.18} />
          <RegMark x={22} y={22} />
          <RegMark x={SHEET.w - 22} y={22} />
          <RegMark x={22} y={SHEET.h - 22} />
          <RegMark x={SHEET.w - 22} y={SHEET.h - 22} />
          <Visual p={mech} compact={compact} />
        </svg>
      </motion.div>
    </motion.div>
  );
}

function RailItem({ index, progress }: Readonly<{ index: number; progress: MotionValue<number> }>) {
  const w = sceneWindow(index, SCENE_COUNT);
  const opacity = useTransform(progress, [w.start - 0.02, w.start + 0.01, w.end - 0.01, w.end + 0.02], [0.28, 1, 1, 0.28], { clamp: true });
  const width = useTransform(progress, [w.start - 0.02, w.start + 0.01, w.end - 0.01, w.end + 0.02], [8, 22, 22, 8], { clamp: true });
  return <li className="flex items-center gap-2"><motion.span className="block h-px bg-current" style={{ width, opacity }} /><motion.span className="font-mono text-[10px] tracking-[0.18em]" style={{ opacity }}>{scenes[index].id}</motion.span></li>;
}

function PinnedFilm({ compact }: Readonly<{ compact: boolean }>) {
  const trackRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const trackStyle = { "--fde-scenes": SCENE_COUNT } as CSSProperties;
  return (
    <section ref={trackRef} aria-label="The Deployment Dossier" className="fde-stage-track relative" style={trackStyle} data-scene-count={SCENE_COUNT}>
      <SemanticTranscript />
      <div className="sticky top-0 h-[100svh] overflow-hidden" style={{ background: BG, color: INK }}>
        <div className="fde-grain pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="fde-rules pointer-events-none absolute inset-0" aria-hidden="true" />
        {SCENE_REGISTRY.map((entry, index) => <SceneLayer key={entry.scene.id} entry={entry} index={index} progress={scrollYProgress} compact={compact} />)}
        <ol aria-hidden="true" className="absolute right-3 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-1.5 lg:flex">
          {SCENE_REGISTRY.map(({ scene }, index) => <RailItem key={scene.id} index={index} progress={scrollYProgress} />)}
        </ol>
      </div>
    </section>
  );
}

function StackedDocument({ compact }: Readonly<{ compact: boolean }>) {
  const done = useMotionValue(1);
  return (
    <div data-fde-reduced-motion>
      {SCENE_REGISTRY.map(({ scene, Visual }, index) => {
        const deep = scene.panel === "deep";
        return (
          <section key={scene.id} id={`scene-${scene.id}`} className="px-5 py-16 md:px-10 md:py-24" style={{ background: deep ? BG_DEEP : BG, color: INK }}>
            <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[43%_57%] md:items-center">
              <SceneCopy scene={scene} index={index} p={done} compact={compact} semantic />
              <svg viewBox={`0 0 ${SHEET.w} ${SHEET.h}`} className="h-auto w-full" aria-hidden="true" focusable="false">
                <rect x={8} y={8} width={SHEET.w - 16} height={SHEET.h - 16} fill={deep ? PAPER_DEEP : PAPER} stroke="currentColor" strokeWidth={0.8} strokeOpacity={0.18} />
                <Visual p={done} compact={compact} />
              </svg>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function DossierStage() {
  const desktop = useIsDesktop();
  const reduced = useReducedMotionSafe();
  return reduced ? <StackedDocument compact={!desktop} /> : <PinnedFilm compact={!desktop} />;
}
