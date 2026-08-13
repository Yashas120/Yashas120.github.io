"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import {
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { scrollScenes, type SceneProgress } from "@/data/devops/scrollScenes";

type SectionBounds = { top: number; bottom: number };

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const snapshotFor = (value: number, direction: 1 | -1): SceneProgress => {
  const scaled = clamp(value) * scrollScenes.length;
  const index = Math.min(scrollScenes.length - 1, Math.floor(scaled));
  return {
    scene: scrollScenes[index].id,
    local: index === scrollScenes.length - 1 && scaled >= scrollScenes.length ? 1 : scaled - index,
    global: clamp(value),
    direction,
  };
};

/**
 * Converts native document scroll into one reversible, deterministic scene value.
 * Section geometry is measured rather than assumed, so expanded evidence remains
 * readable without throwing the stage out of sync with the chapter beside it.
 */
export function useScrollNarrative(trackRef: RefObject<HTMLElement>) {
  const frameworkReducedMotion = useReducedMotion();
  const mediaReducedMotion = useSyncExternalStore(
    useCallback((notify) => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)");
      query.addEventListener?.("change", notify);
      return () => query.removeEventListener?.("change", notify);
    }, []),
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const reduceMotion = Boolean(frameworkReducedMotion || mediaReducedMotion);
  const { scrollY, scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const fallbackProgress = useTransform(scrollYProgress, [0, 1], [0, 1], { clamp: true });
  const targetProgress = useMotionValue(0);
  const springProgress = useSpring(targetProgress, { stiffness: 420, damping: 52, mass: 0.28 });
  const [progress, setProgress] = useState<SceneProgress>(() => snapshotFor(0, 1));
  const bounds = useRef<SectionBounds[]>([]);
  const rawDirection = useRef<1 | -1>(1);
  const previousScroll = useRef(0);

  const measure = useCallback(() => {
    const sections = Array.from(
      trackRef.current?.querySelectorAll<HTMLElement>("[data-chapter]") ?? [],
    );
    bounds.current = sections.map((section) => {
      const rect = section.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      return { top, bottom: top + rect.height };
    });
  }, [trackRef]);

  const resolveAt = useCallback((pageY: number) => {
    if (bounds.current.length !== scrollScenes.length) {
      targetProgress.set(fallbackProgress.get());
      return;
    }

    // The active copy line sits slightly below center on small screens because
    // the mini inspector occupies the upper part of the viewport.
    const compact = window.innerWidth < 1180;
    const anchor = pageY + window.innerHeight * (compact ? 0.72 : 0.5);
    let index = bounds.current.findIndex((section) => anchor < section.bottom);
    if (index < 0) index = bounds.current.length - 1;
    const section = bounds.current[index];
    let local = clamp((anchor - section.top) / Math.max(1, section.bottom - section.top));
    if (index === 0 && pageY <= 1) local = 0;
    if (index === bounds.current.length - 1 && pageY >= document.documentElement.scrollHeight - window.innerHeight - 2) local = 1;
    const next = (index + local) / scrollScenes.length;
    targetProgress.set(next);
    // Scene selection follows native scroll immediately. The spring is used for
    // cosmetic interpolation only, so rapid or reverse input never leaves the
    // inspector displaying a stale chapter.
    setProgress(snapshotFor(next, rawDirection.current));
  }, [fallbackProgress, targetProgress]);

  useEffect(() => {
    measure();
    resolveAt(window.scrollY);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => {
      measure();
      resolveAt(window.scrollY);
    });
    if (trackRef.current) observer?.observe(trackRef.current);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, resolveAt, trackRef]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest !== previousScroll.current) {
      rawDirection.current = latest > previousScroll.current ? 1 : -1;
      previousScroll.current = latest;
    }
    resolveAt(latest);
  });

  useMotionValueEvent(springProgress, "change", (latest) => {
    trackRef.current?.style.setProperty("--dv-smooth-global", String(latest));
  });

  useEffect(() => {
    const root = trackRef.current;
    if (!root) return;
    root.dataset.motionReady = "true";
    root.dataset.scene = progress.scene;
    root.querySelectorAll<HTMLElement>("[data-chapter]").forEach((section) => {
      section.dataset.active = section.id === scrollScenes.find((item) => item.id === progress.scene)?.chapter
        ? "true"
        : "false";
    });
  }, [progress.scene, trackRef]);

  return { progress, reduceMotion };
}
