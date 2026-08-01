"use client";

import { CSSProperties, ReactNode, RefObject, useEffect, useRef, useState } from "react";
import {
  MotionValue,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

/** Long-tail ease used across the page so every reveal decelerates the same way. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Progress (0 -> 1) of the viewport travelling through a tall wrapper element.
 * Spring-smoothed so scroll-linked motion carries momentum instead of tracking
 * the wheel pixel-for-pixel; the raw value is used when reduced motion is asked for.
 */
export function useStageProgress(ref: RefObject<HTMLElement>): MotionValue<number> {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Soft spring: trades a little lag for genuinely fluid scrubbing.
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.5 });
  return reduced ? scrollYProgress : smooth;
}

/**
 * Progress of an element entering the viewport, used to drive an element's own
 * entrance rather than a whole pinned act.
 */
function useEnterProgress(ref: RefObject<HTMLElement>): MotionValue<number> {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 92%", "center 58%"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  return reduced ? scrollYProgress : smooth;
}

/**
 * A pinned "act": the wrapper is `vh` tall, the stage inside sticks to the
 * viewport for its whole length. Scrolling advances the act instead of moving
 * the page, which is what stops the site feeling like a document.
 */
export function ScrollStage({
  vh = 320,
  className,
  children,
}: {
  vh?: number;
  className?: string;
  children: (progress: MotionValue<number>) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useStageProgress(ref);

  return (
    // Pinned from `md` up. On narrow screens the act flows normally so tall
    // content can't be clipped by the fixed-height stage.
    <div
      ref={ref}
      className="relative md:h-[var(--stage-h)]"
      style={{ "--stage-h": `${vh}vh` } as CSSProperties}
    >
      <div className="flex items-center overflow-hidden py-14 md:sticky md:top-0 md:h-screen md:py-0">
        <div className={cn("mx-auto w-full max-w-5xl px-6 md:pt-12", className)}>
          {children(progress)}
        </div>
      </div>
    </div>
  );
}

/**
 * Unfolds an act as it locks to the viewport: it starts laid flat and pushed
 * back in Z, then hinges upright and grows into place — the "screen opening"
 * move. Driven by the act's own scroll progress, so it is scrubbable.
 */
export function StageOpen({
  progress,
  children,
  until = 0.1,
  deg = 62,
}: {
  progress: MotionValue<number>;
  children: ReactNode;
  until?: number;
  deg?: number;
}) {
  const rotateX = useTransform(progress, [0, until], [deg, 0]);
  const scale = useTransform(progress, [0, until], [0.78, 1]);
  const opacity = useTransform(progress, [0, until * 0.45], [0, 1]);
  const y = useTransform(progress, [0, until], [64, 0]);
  const filter = useTransform(progress, [0, until], ["blur(14px)", "blur(0px)"]);

  return (
    <div style={{ perspective: 1600 }}>
      <motion.div
        style={{
          rotateX,
          scale,
          opacity,
          y,
          filter,
          transformOrigin: "50% 90%",
          transformStyle: "preserve-3d",
          willChange: "transform, opacity, filter",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Grows out of the centre of the viewport — small, blurred and set back, then
 * resolving to full size as it reaches the middle of the screen.
 */
export function Emerge({
  children,
  className,
  scaleFrom = 0.8,
  blur = 12,
  lift = 28,
}: {
  children: ReactNode;
  className?: string;
  scaleFrom?: number;
  blur?: number;
  lift?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useEnterProgress(ref);

  const scale = useTransform(progress, [0, 1], [scaleFrom, 1]);
  const opacity = useTransform(progress, [0, 0.5], [0, 1]);
  const y = useTransform(progress, [0, 1], [lift, 0]);
  const filter = useTransform(progress, [0, 1], [`blur(${blur}px)`, "blur(0px)"]);

  return (
    // `relative` keeps framer's scroll-offset maths correct for the target.
    <motion.div
      ref={ref}
      style={{ scale, opacity, y, filter, willChange: "transform, opacity, filter" }}
      className={cn("relative", className)}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hinges open from its bottom edge like a lid being lifted, tied to scroll
 * position so the visitor controls the opening.
 */
export function OpenUp({
  children,
  className,
  deg = 64,
}: {
  children: ReactNode;
  className?: string;
  deg?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useEnterProgress(ref);

  const rotateX = useTransform(progress, [0, 1], [deg, 0]);
  const scale = useTransform(progress, [0, 1], [0.86, 1]);
  const opacity = useTransform(progress, [0, 0.4], [0, 1]);

  return (
    <div ref={ref} className={cn("relative", className)} style={{ perspective: 1500 }}>
      <motion.div
        style={{
          rotateX,
          scale,
          opacity,
          transformOrigin: "50% 100%",
          transformStyle: "preserve-3d",
          willChange: "transform, opacity",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Shows its children only while `progress` is inside [from, to], cross-fading at
 * the edges. Stack several absolutely-positioned Phases to narrate one visual.
 */
export function Phase({
  progress,
  from,
  to,
  className,
  children,
}: {
  progress: MotionValue<number>;
  from: number;
  to: number;
  className?: string;
  children: ReactNode;
}) {
  const fade = 0.05;
  const mid = (from + to) / 2;
  // Keep the keyframe stops strictly increasing even for very short phases.
  const inAt = Math.min(from + fade, mid - 1e-4);
  const outAt = Math.max(to - fade, mid + 1e-4);
  const stops = [from - fade, inAt, outAt, to + fade];

  const opacity = useTransform(progress, stops, [0, 1, 1, 0]);
  const y = useTransform(progress, stops, [20, 0, 0, -20]);
  const scale = useTransform(progress, stops, [0.94, 1, 1, 0.97]);

  return (
    <motion.div style={{ opacity, y, scale }} className={className}>
      {children}
    </motion.div>
  );
}

/** Discrete step (0..steps-1) derived from scroll progress across [from, to]. */
export function useStepIndex(
  progress: MotionValue<number>,
  steps: number,
  from = 0,
  to = 1
): number {
  const [index, setIndex] = useState(0);

  const resolve = (v: number) => {
    const t = (v - from) / (to - from);
    return Math.max(0, Math.min(steps - 1, Math.floor(t * steps)));
  };

  // Seed from the current scroll position so a mid-page reload isn't stuck at 0.
  useEffect(() => {
    setIndex(resolve(progress.get()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(progress, "change", (v) => {
    const next = resolve(v);
    setIndex((prev) => (prev === next ? prev : next));
  });

  return index;
}

/** Scales up out of the middle on first entry — used for section headers. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y, scale: 0.9, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10% 0px -8% 0px" }}
      transition={{ duration: 0.85, delay, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * One item of a grid inside a pinned act: its entrance is scrubbed by the act's
 * scroll progress, so the grid assembles itself as you scroll rather than
 * firing all at once when it enters view.
 */
export function staggerWindow(index: number, total: number, from = 0.12, to = 0.72) {
  const span = (to - from) / Math.max(total, 1);
  const start = from + index * span;
  return [start, start + span * 2.2] as [number, number];
}

export function StaggerItem({
  progress,
  index,
  total,
  from = 0.12,
  to = 0.72,
  className,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  from?: number;
  to?: number;
  className?: string;
  children: ReactNode;
}) {
  const [start, end] = staggerWindow(index, total, from, to);

  const opacity = useTransform(progress, [start, end], [0, 1]);
  const rotateX = useTransform(progress, [start, end], [34, 0]);
  const y = useTransform(progress, [start, end], [44, 0]);
  const scale = useTransform(progress, [start, end], [0.88, 1]);

  return (
    <div className={cn("h-full", className)} style={{ perspective: 1000 }}>
      <motion.div
        style={{
          opacity,
          rotateX,
          y,
          scale,
          transformOrigin: "50% 100%",
          transformStyle: "preserve-3d",
          willChange: "transform, opacity",
        }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Card entrance: tips up from a reclined 3D angle instead of sliding. */
export function TiltIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={cn("h-full", className)} style={{ perspective: 1000 }}>
      <motion.div
        initial={{ opacity: 0, rotateX: 32, scale: 0.9, y: 26 }}
        whileInView={{ opacity: 1, rotateX: 0, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-8% 0px" }}
        transition={{ duration: 0.85, delay, ease: EASE_OUT }}
        style={{
          transformOrigin: "50% 100%",
          transformStyle: "preserve-3d",
          willChange: "transform, opacity",
        }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
