"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KernelStageStep } from "./stageModel";

interface SceneMetric {
  step: KernelStageStep;
  top: number;
  height: number;
  element: HTMLElement;
}

export function useKernelStory(initialStep: KernelStageStep = "identity") {
  const rootRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<SceneMetric[]>([]);
  const activeRef = useRef<KernelStageStep>(initialStep);
  const [activeStep, setActiveStep] = useState<KernelStageStep>(initialStep);

  const measure = useCallback(() => {
    metricsRef.current = [...document.querySelectorAll<HTMLElement>("[data-kernel-step]")].map((element) => ({
      step: element.dataset.kernelStep as KernelStageStep,
      top: element.getBoundingClientRect().top + window.scrollY,
      height: element.offsetHeight,
      element,
    }));
  }, []);

  const update = useCallback(() => {
    const root = rootRef.current;
    const metrics = metricsRef.current;
    if (!root || !metrics.length) return;

    const readingLine = window.scrollY + window.innerHeight * (window.innerWidth < 820 ? 0.44 : 0.5);
    let metric = metrics[0];
    for (const candidate of metrics) {
      if (readingLine >= candidate.top) metric = candidate;
      else break;
    }

    const local = Math.max(0, Math.min(1, (readingLine - metric.top) / Math.max(1, metric.height)));
    root.style.setProperty("--scene-progress", local.toFixed(4));
    root.dataset.activeStep = metric.step;

    const viewport = root.querySelector<HTMLElement>("[data-story-viewport]");
    for (const scene of metrics) {
      const copy = scene.element.firstElementChild as HTMLElement | null;
      if (!copy) continue;

      if (!viewport || window.innerWidth < 820) {
        copy.style.removeProperty("--scene-opacity");
        copy.style.removeProperty("--scene-blur");
        copy.style.removeProperty("--scene-clip-top");
        copy.style.removeProperty("--scene-clip-bottom");
        continue;
      }

      const viewportRect = viewport.getBoundingClientRect();
      const copyRect = copy.getBoundingClientRect();
      const visibleHeight = Math.max(
        0,
        Math.min(copyRect.bottom, viewportRect.bottom) - Math.max(copyRect.top, viewportRect.top),
      );
      const fadeDistance = Math.min(96, Math.max(1, copyRect.height / 2));
      const opacity = Math.min(1, visibleHeight / fadeDistance);
      const clipTop = Math.max(0, Math.min(copyRect.height, viewportRect.top - copyRect.top));
      const clipBottom = Math.max(0, Math.min(copyRect.height, copyRect.bottom - viewportRect.bottom));

      copy.style.setProperty("--scene-opacity", opacity.toFixed(3));
      copy.style.setProperty("--scene-blur", `${((1 - opacity) * 5).toFixed(2)}px`);
      copy.style.setProperty("--scene-clip-top", `${clipTop.toFixed(2)}px`);
      copy.style.setProperty("--scene-clip-bottom", `${clipBottom.toFixed(2)}px`);
    }

    if (metric.step !== activeRef.current) {
      activeRef.current = metric.step;
      setActiveStep(metric.step);
    }
  }, []);

  useLayoutEffect(() => {
    measure();
    update();
  }, [measure, update]);

  useEffect(() => {
    let frame = 0;
    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (!document.hidden) update();
      });
    };
    const onResize = () => {
      measure();
      requestUpdate();
    };
    const observer = new ResizeObserver(onResize);
    if (rootRef.current) observer.observe(rootRef.current);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("hashchange", onResize);
    document.addEventListener("visibilitychange", requestUpdate);
    requestUpdate();
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("hashchange", onResize);
      document.removeEventListener("visibilitychange", requestUpdate);
    };
  }, [measure, update]);

  return { rootRef, activeStep };
}
