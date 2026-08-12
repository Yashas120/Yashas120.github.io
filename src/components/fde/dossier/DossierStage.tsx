"use client";

/**
 * The /fde stage: one long scroll track with a single pinned viewport. Every
 * scene is absolutely layered inside that viewport, so nothing scrolls past the
 * reader — the dossier transforms in place and the copy is exchanged in the same
 * editorial zone. Native scrolling only: no wheel interception, no smooth-scroll
 * dependency, no timers.
 *
 * Under `prefers-reduced-motion` the same scenes render as a stacked, fully
 * legible document with every mechanism resolved.
 */

import { useRef } from "react";
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
  isDeepScene,
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
import { Scene06Leverage } from "./Scene06Leverage";
import { Scene07Rag } from "./Scene07Rag";
import { SceneHandoff } from "./SceneHandoff";
import { LeverageCopy, HandoffCopy } from "./copy";
import { scenes } from "@/data/fdeDossier";

const VISUALS: ((props: SceneVisualProps) => JSX.Element)[] = [
  Scene01Hero,
  Scene02Workflow,
  Scene03Tool,
  Scene04Production,
  Scene05Rollout,
  Scene06Leverage,
  Scene07Rag,
  SceneHandoff,
];

/** Deliberate asymmetry: the editorial block does not sit dead-centre every time. */
const ALIGN = [
  "md:items-center",
  "md:items-start",
  "md:items-center",
  "md:items-end",
  "md:items-center",
  "md:items-start",
  "md:items-center",
  "md:items-center",
];

function SceneCopy({
  index,
  p,
  compact,
}: Readonly<{ index: number; p: MotionValue<number>; compact: boolean }>) {
  if (index === VISUALS.length - 1) return <HandoffCopy />;
  const s = scenes[index];
  if (s.id === "06") return <LeverageCopy p={p} scene={s} compact={compact} />;
  return (
    <CopyBlock
      scene={s.id}
      slug={s.slug}
      eyebrow={s.eyebrow}
      headline={s.headline}
      body={s.body}
      notes={s.notes}
      outcome={s.outcome}
      hero={index === 0}
      as={index === 0 ? "h1" : "h2"}
    />
  );
}

function SceneLayer({
  index,
  progress,
  compact,
}: Readonly<{ index: number; progress: MotionValue<number>; compact: boolean }>) {
  const opacity = useSceneOpacity(progress, index);
  const mech = useMech(progress, index);
  const visibility = useTransform(opacity, (o) => (o < 0.02 ? "hidden" : "visible"));
  const pointerEvents = useTransform(opacity, (o) => (o < 0.7 ? "none" : "auto"));
  const Visual = VISUALS[index];
  const deep = isDeepScene(index);
  // a few degrees of layer separation, tied to scroll rather than to a clock
  const sheetY = useTransform(mech, [0, 1], [10, -10]);

  return (
    <motion.div
      style={{ opacity, visibility, pointerEvents }}
      className={`absolute inset-0 grid grid-rows-[46svh_minmax(0,1fr)] gap-2 px-6 pb-8 pt-[calc(var(--fde-header)+16px)] md:grid-rows-1 md:gap-10 md:pb-12 md:pl-10 md:pr-[92px] md:pt-[calc(var(--fde-header)+64px)] ${
        index === 0 ? "md:grid-cols-[52%_48%]" : "md:grid-cols-[43%_57%]"
      }`}
    >
      {/* A small step inside the active theme — not a jump to the other one.
          It rides this layer's own cross-fade, so it enters and leaves with the
          scene instead of animating the whole stage's colour. */}
      {deep && (
        <div
          className="absolute inset-0 -z-10"
          style={{ background: BG_DEEP }}
          aria-hidden
        />
      )}

      {/* pb keeps bottom-aligned copy clear of the site's floating theme pill */}
      <div
        className={`relative flex items-start overflow-hidden pb-2 md:h-full md:pb-[68px] ${ALIGN[index]}`}
      >
        <SceneCopy index={index} p={mech} compact={compact} />
      </div>

      <motion.div className="relative flex min-h-0 items-center justify-center" style={{ y: sheetY }}>
        <svg
          viewBox={`0 0 ${SHEET.w} ${SHEET.h}`}
          className="h-auto max-h-full w-full"
          aria-hidden="true"
          focusable="false"
        >
          <rect
            x={8}
            y={8}
            width={SHEET.w - 16}
            height={SHEET.h - 16}
            fill={deep ? PAPER_DEEP : PAPER}
            stroke="currentColor"
            strokeWidth={0.8}
            strokeOpacity={0.18}
          />
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
  const w = sceneWindow(index);
  const opacity = useTransform(
    progress,
    [w.start - 0.02, w.start + 0.01, w.end - 0.01, w.end + 0.02],
    [0.28, 1, 1, 0.28],
    { clamp: true }
  );
  const width = useTransform(
    progress,
    [w.start - 0.02, w.start + 0.01, w.end - 0.01, w.end + 0.02],
    [8, 22, 22, 8],
    { clamp: true }
  );
  return (
    <li className="flex items-center gap-2">
      <motion.span aria-hidden className="block h-[1px] bg-current" style={{ width, opacity }} />
      <motion.span className="font-mono text-[10px] tracking-[0.18em]" style={{ opacity }}>
        {scenes[index].id}
      </motion.span>
    </li>
  );
}

function PinnedFilm({ compact }: Readonly<{ compact: boolean }>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  return (
    <section
      ref={trackRef}
      aria-label="Deployment dossier"
      className="relative h-[700svh] md:h-[950svh]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden" style={{ background: BG, color: INK }}>
        <div className="fde-grain pointer-events-none absolute inset-0" aria-hidden />
        <div className="fde-rules pointer-events-none absolute inset-0" aria-hidden />

        {VISUALS.map((_, i) => (
          <SceneLayer key={i} index={i} progress={scrollYProgress} compact={compact} />
        ))}

        <ol className="absolute right-3 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-2 md:flex">
          {scenes.map((s, i) => (
            <RailItem key={s.id} index={i} progress={scrollYProgress} />
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Reduced-motion fallback: the same document, resolved and stacked. */
function StackedDocument({ compact }: Readonly<{ compact: boolean }>) {
  const done = useMotionValue(1);
  return (
    <div>
      {VISUALS.map((Visual, i) => {
        const deep = isDeepScene(i);
        return (
          <section
            key={i}
            className="px-6 py-16 md:px-10 md:py-24"
            style={{ background: deep ? BG_DEEP : BG, color: INK }}
          >
            <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[43%_57%] md:items-center">
              <SceneCopy index={i} p={done} compact={compact} />
              <svg
                viewBox={`0 0 ${SHEET.w} ${SHEET.h}`}
                className="h-auto w-full"
                aria-hidden="true"
                focusable="false"
              >
                <rect
                  x={8}
                  y={8}
                  width={SHEET.w - 16}
                  height={SHEET.h - 16}
                  fill={deep ? PAPER_DEEP : PAPER}
                  stroke="currentColor"
                  strokeWidth={0.8}
                  strokeOpacity={0.18}
                />
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
  if (reduced) return <StackedDocument compact={!desktop} />;
  return <PinnedFilm compact={!desktop} />;
}
