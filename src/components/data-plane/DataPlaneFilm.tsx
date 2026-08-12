"use client";

/**
 * The /data-plane flagship film: the platform bring-up story, in nine chapters,
 * on one persistent line-card system.
 *
 * Scroll progress drives every mechanism continuously and reversibly. Native
 * scrolling only: no wheel interception, no preventDefault, no gesture cooldown,
 * no body scroll lock, no forced slide deck, no timers, and the stage is never
 * unmounted between chapters — the base system stays mounted for the whole track
 * while chapter overlays cross-fade inside the same SVG coordinate space.
 *
 * Three presentations of the same nine chapters:
 *
 *   PinnedFilm     — desktop. One sticky viewport-sized stage; copy and the
 *                    system sit side by side and chapters cross-fade in place.
 *   FlowDocument   — narrow viewports. Sequential sections, each diagram still
 *                    scroll-linked, drawn in the portrait coordinate space so the
 *                    schematic becomes a vertical software-to-hardware path
 *                    rather than a shrunken desktop drawing.
 *   StaticDocument — prefers-reduced-motion. Identical content with every
 *                    mechanism resolved to its end state.
 *
 * The narrative is fully legible from the copy alone in all three.
 */

import { useRef } from "react";
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useIsDesktop } from "@/lib/useIsDesktop";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { dpChapters, validationCampaigns } from "@/data/dataPlane";
import { CANVAS, FAINT, MUTED, RULE, SIGNAL, TEXT, stageFor } from "./palette";
import { CopyBlock, OwnershipTag, SLOTS, chapterWindow, useChapterOpacity, useMech } from "./kit";
import { LineCardBase, geoFor, restingPhase } from "./system";
import type { ChapterVisualProps } from "./types";
import { Ch1Platform, Ch2Precursor, Ch3Cdr } from "./chapters/platform";
import { Ch4Features, Ch5Reconcile, Ch6Validation } from "./chapters/features";
import { Ch7Harness, Ch8SecureBoot, Ch9Diagnose } from "./chapters/hardening";

const VISUALS: ((props: ChapterVisualProps) => JSX.Element)[] = [
  Ch1Platform,
  Ch2Precursor,
  Ch3Cdr,
  Ch4Features,
  Ch5Reconcile,
  Ch6Validation,
  Ch7Harness,
  Ch8SecureBoot,
  Ch9Diagnose,
];

/* ------------------------------------------------------------------ copy */

/** Chapter 04 carries three feature branches with distinct ownership. */
function FeatureBranches() {
  const branches = dpChapters[3].branches ?? [];
  return (
    <ul className="mt-4 space-y-3.5 md:mt-5">
      {branches.map((br) => (
        <li key={br.label} className="border-l pl-3.5" style={{ borderColor: RULE }}>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="text-[0.9rem] font-semibold md:text-[0.98rem]" style={{ color: TEXT }}>
              {br.label}
            </span>
            <OwnershipTag ownership={br.ownership} />
          </div>
          <p className="mt-1.5 text-[0.82rem] leading-[1.55] md:text-[0.9rem]" style={{ color: MUTED }}>
            {br.body}
          </p>
        </li>
      ))}
    </ul>
  );
}

/** Chapter 06 keeps its two validation campaigns visibly separate. */
function ValidationCampaigns() {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 md:mt-5">
      {validationCampaigns.map((c) => (
        <div key={c.id} className="border-l pl-3.5" style={{ borderColor: RULE }}>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em]" style={{ color: SIGNAL }}>
            {c.title}
          </p>
          <ul className="mt-2 space-y-1.5">
            {c.facts.map((f) => (
              <li key={f} className="text-[0.79rem] leading-[1.5] md:text-[0.85rem]" style={{ color: MUTED }}>
                {f}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ChapterCopy({ index }: Readonly<{ index: number }>) {
  const ch = dpChapters[index];
  return (
    <CopyBlock
      chapter={ch.id}
      stage={ch.stage}
      eyebrow={ch.eyebrow}
      heading={ch.heading}
      body={ch.body}
      points={ch.points}
      outcome={ch.outcome}
      note={ch.note}
    >
      {index === 3 && <FeatureBranches />}
      {index === 5 && <ValidationCampaigns />}
    </CopyBlock>
  );
}

/* --------------------------------------------------------------- diagram */

/**
 * The persistent system plus one or all chapter overlays.
 *
 * `phase` is a continuous chapter index that tells the base system where the
 * story is. In the pinned film it is scroll progress scaled across all nine
 * chapters; in the flow and static documents it is that section's own index.
 */
function Stage({
  compact,
  phase,
  children,
  labelledBy,
}: Readonly<{ compact: boolean; phase: MotionValue<number>; children: React.ReactNode; labelledBy: string }>) {
  const box = stageFor(compact);
  const geo = geoFor(compact);
  return (
    <svg
      viewBox={`0 0 ${box.w} ${box.h}`}
      className="mx-auto h-auto max-h-full w-full"
      style={{ maxWidth: compact ? 420 : undefined }}
      role="img"
      aria-labelledby={labelledBy}
    >
      <LineCardBase geo={geo} phase={phase} />
      {children}
    </svg>
  );
}

/** Accessible title/description pair for a chapter's diagram. */
function DiagramCaption({ index }: Readonly<{ index: number }>) {
  const ch = dpChapters[index];
  return (
    <>
      <title id={`dp-d-${ch.id}-t`}>{ch.diagram.title}</title>
      <desc id={`dp-d-${ch.id}-d`}>{ch.diagram.desc}</desc>
    </>
  );
}

/* --------------------------------------------------------------- pinned film */

function ChapterCopyLayer({ index, progress }: Readonly<{ index: number; progress: MotionValue<number> }>) {
  const opacity = useChapterOpacity(progress, index);
  const mech = useMech(progress, index);
  const visibility = useTransform(opacity, (o) => (o < 0.02 ? "hidden" : "visible"));
  const pointerEvents = useTransform(opacity, (o) => (o < 0.7 ? "none" : "auto"));
  const y = useTransform(mech, [0, 1], [8, -8]);

  return (
    <motion.div
      style={{ opacity, visibility, pointerEvents, y }}
      className="absolute inset-y-0 left-0 flex w-[46%] items-center overflow-y-auto pb-8 pl-10 pr-6 pt-[calc(var(--dp-header)+24px)] xl:pl-14"
    >
      <ChapterCopy index={index} />
    </motion.div>
  );
}

/**
 * One chapter's mechanism, cross-faded inside the shared SVG. Layers stay
 * mounted for the whole track — the scene is never torn down between chapters —
 * but fully faded layers are marked hidden so the browser skips painting them.
 */
function ChapterVisualLayer({ index, progress }: Readonly<{ index: number; progress: MotionValue<number> }>) {
  const opacity = useChapterOpacity(progress, index);
  const mech = useMech(progress, index);
  const visibility = useTransform(opacity, (o) => (o < 0.02 ? "hidden" : "visible"));
  const Visual = VISUALS[index];
  return (
    <motion.g style={{ opacity, visibility }}>
      <Visual p={mech} compact={false} />
    </motion.g>
  );
}

function ProgressRail({ progress }: Readonly<{ progress: MotionValue<number> }>) {
  return (
    <ol className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-end gap-2">
      {dpChapters.map((c, i) => (
        <RailItem key={c.id} index={i} progress={progress} />
      ))}
    </ol>
  );
}

function RailItem({ index, progress }: Readonly<{ index: number; progress: MotionValue<number> }>) {
  const w = chapterWindow(index);
  const stops = [w.start - 0.02, w.start + 0.02, w.end - 0.02, w.end + 0.02];
  const opacity = useTransform(progress, stops, [0.3, 1, 1, 0.3], { clamp: true });
  const width = useTransform(progress, stops, [8, 20, 20, 8], { clamp: true });
  return (
    <li className="flex items-center gap-2">
      <motion.span aria-hidden className="block h-[1px]" style={{ width, opacity, background: SIGNAL }} />
      <motion.span className="font-mono text-[10px] tracking-[0.16em]" style={{ opacity, color: FAINT }}>
        {dpChapters[index].id}
      </motion.span>
    </li>
  );
}

function PinnedFilm() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  // Chapter i occupies phase [i, i+1], matching the windows the base system uses.
  const phase = useTransform(scrollYProgress, [0, 1], [0, SLOTS]);

  return (
    <div ref={trackRef} style={{ height: `${SLOTS * 150}svh` }} className="relative">
      <div className="sticky top-0 h-[100svh] overflow-hidden" style={{ background: CANVAS }}>
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-40" />

        {dpChapters.map((c, i) => (
          <ChapterCopyLayer key={c.id} index={i} progress={scrollYProgress} />
        ))}

        <div className="absolute inset-y-0 right-0 flex w-[54%] items-center justify-center pb-8 pl-2 pr-[68px] pt-[calc(var(--dp-header)+20px)]">
          {/* One title/desc for the persistent system: the nine chapter
              descriptions would otherwise all be announced at once, and each
              chapter's copy column already carries its own content. */}
          <Stage compact={false} phase={phase} labelledBy="dp-system-t dp-system-d">
            <title id="dp-system-t">Line-card software and hardware system</title>
            <desc id="dp-system-d">
              A persistent schematic of the line card: shared platform software, feature and provisioning logic, the
              hardware abstraction layer, the C driver path, the CDR and firmware boundary, and the optical hardware,
              with client and trunk interfaces, configuration descending the left rail, telemetry ascending the right
              rail, and a continuous traffic path along the bottom. Each chapter transforms this system; the copy beside
              it states every fact.
            </desc>
            {dpChapters.map((c, i) => (
              <ChapterVisualLayer key={c.id} index={i} progress={scrollYProgress} />
            ))}
          </Stage>
        </div>

        <ProgressRail progress={scrollYProgress} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ flow document */

function FlowChapter({ index }: Readonly<{ index: number }>) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const ch = dpChapters[index];
  const Visual = VISUALS[index];
  const phase = useMotionValue(restingPhase(index));

  return (
    <div ref={ref} className="border-b px-5 py-12 sm:px-8 md:py-16" style={{ borderColor: RULE }}>
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[46%_54%] lg:items-center lg:gap-12">
        <ChapterCopy index={index} />
        <Stage compact phase={phase} labelledBy={`dp-d-${ch.id}-t dp-d-${ch.id}-d`}>
          <DiagramCaption index={index} />
          <Visual p={scrollYProgress} compact />
        </Stage>
      </div>
    </div>
  );
}

function FlowDocument() {
  return (
    <div className="relative" style={{ background: CANVAS }}>
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative">
        {dpChapters.map((c, i) => (
          <FlowChapter key={c.id} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- static document */

/** prefers-reduced-motion: the same nine chapters, every mechanism resolved. */
function StaticChapter({ index, compact }: Readonly<{ index: number; compact: boolean }>) {
  const done = useMotionValue(1);
  const phase = useMotionValue(restingPhase(index));
  const ch = dpChapters[index];
  const Visual = VISUALS[index];
  return (
    <div className="border-b px-5 py-12 sm:px-8 md:py-16" style={{ borderColor: RULE }}>
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[46%_54%] lg:items-center lg:gap-12">
        <ChapterCopy index={index} />
        <Stage compact={compact} phase={phase} labelledBy={`dp-d-${ch.id}-t dp-d-${ch.id}-d`}>
          <DiagramCaption index={index} />
          <Visual p={done} compact={compact} />
        </Stage>
      </div>
    </div>
  );
}

function StaticDocument({ compact }: Readonly<{ compact: boolean }>) {
  return (
    <div className="relative" style={{ background: CANVAS }}>
      {dpChapters.map((c, i) => (
        <StaticChapter key={c.id} index={i} compact={compact} />
      ))}
    </div>
  );
}

export function DataPlaneFilm() {
  const desktop = useIsDesktop();
  const reduced = useReducedMotionSafe();

  if (reduced) return <StaticDocument compact={!desktop} />;
  if (!desktop) return <FlowDocument />;
  return <PinnedFilm />;
}
