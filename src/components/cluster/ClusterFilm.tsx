"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from "framer-motion";
import { storyScenes, totalStorySpan, type StoryScene } from "@/lib/clusterContent";
import { useIsDesktop } from "@/lib/useIsDesktop";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { EventTopologyDiagram, SafeChangeDiagram } from "./diagrams/work";
import { ReconciliationDiagram } from "./diagrams/platform";
import { EvidenceSpineDiagram, HandoffDiagram } from "./diagrams/projects";
import { SceneStory } from "./ClusterStaticStory";
import styles from "./cluster.module.css";

type FilmStyle = CSSProperties & { "--story-height": string };
type MarkerStyle = CSSProperties & { "--scene-start": string };

const sceneRanges = storyScenes.map((scene, index) => {
  const previous = storyScenes.slice(0, index).reduce((sum, item) => sum + item.span, 0);
  return {
    start: previous / totalStorySpan,
    end: (previous + scene.span) / totalStorySpan,
  };
});

function SceneVisual({ scene, progress, vertical }: Readonly<{ scene: StoryScene; progress: MotionValue<number>; vertical: boolean }>) {
  const tone = scene.tone === "night" ? "inverted" : "base";
  switch (scene.visual) {
    case "events":
      return <EventTopologyDiagram p={progress} vertical={vertical} tone={tone} />;
    case "change":
      return <SafeChangeDiagram p={progress} vertical={vertical} tone={tone} />;
    case "reconcile":
      return <ReconciliationDiagram p={progress} vertical={vertical} tone={tone} />;
    case "evidence":
      return <EvidenceSpineDiagram p={progress} vertical={vertical} tone={tone} />;
    case "handoff":
      return <HandoffDiagram p={progress} vertical={vertical} tone={tone} />;
  }
}

function StoryChapter({
  scene,
  index,
  enhanced,
  filmProgress,
}: Readonly<{
  scene: StoryScene;
  index: number;
  enhanced: boolean;
  filmProgress: MotionValue<number>;
}>) {
  const range = sceneRanges[index];
  const band = range.end - range.start;
  const enterEnd = range.start + band * 0.16;
  const exitStart = range.end - band * 0.16;
  const still = useMotionValue(1);
  const mechanism = useTransform(filmProgress, [range.start + band * 0.1, range.end - band * 0.1], [0, 1], { clamp: true });

  const opacityInput = index === 0
    ? [range.start, exitStart, range.end]
    : index === storyScenes.length - 1
      ? [range.start, enterEnd, range.end]
      : [range.start, enterEnd, exitStart, range.end];
  const opacityOutput = index === 0 ? [1, 1, 0] : index === storyScenes.length - 1 ? [0, 1, 1] : [0, 1, 1, 0];
  const copyXOutput = index === 0 ? [0, 0, 44] : index === storyScenes.length - 1 ? [-44, 0, 0] : [-44, 0, 0, 44];
  const copyYOutput = index === 0 ? [0, 0, -10] : index === storyScenes.length - 1 ? [10, 0, 0] : [10, 0, 0, -10];

  const opacity = useTransform(filmProgress, opacityInput, opacityOutput, { clamp: true });
  const copyX = useTransform(filmProgress, opacityInput, copyXOutput, { clamp: true });
  const copyY = useTransform(filmProgress, opacityInput, copyYOutput, { clamp: true });
  const visibility = useTransform(opacity, (value) => (value < 0.02 ? "hidden" : "visible"));
  const pointerEvents = useTransform(opacity, (value) => (value < 0.55 ? "none" : "auto"));

  return (
    <motion.article
      id={enhanced ? undefined : scene.id}
      className={`${styles.filmSegment} ${scene.tone === "night" ? styles.night : ""}`}
      aria-labelledby={`${scene.id}-heading`}
      data-scene-span={scene.span}
      data-story-scene={scene.id}
      style={enhanced ? { opacity, visibility, pointerEvents } : undefined}
    >
      <div className={styles.sceneGrid}>
        <motion.div
          className={styles.copyMotion}
          data-scene-copy={scene.id}
          style={enhanced ? { opacity, x: copyX, y: copyY } : undefined}
        >
          <SceneStory scene={scene} index={index} headingId={`${scene.id}-heading`} />
        </motion.div>
        <motion.figure className={styles.visual} style={enhanced ? { opacity } : undefined}>
          <figcaption className={styles.visualLabel}>
            {scene.visual === "events" ? "Illustrative topology · not scale" : "Mechanism view · transcript adjacent"}
          </figcaption>
          <SceneVisual scene={scene} progress={enhanced ? mechanism : still} vertical={!enhanced} />
        </motion.figure>
      </div>
    </motion.article>
  );
}

/**
 * A single native-scroll track and sticky stage. The track height is reserved by
 * CSS before hydration, so enabling the desktop motion layer does not move the
 * complete profile or anchor destinations.
 */
export function ClusterFilm() {
  const trackRef = useRef<HTMLDivElement>(null);
  const desktop = useIsDesktop();
  const reduced = useReducedMotionSafe();
  const enhanced = desktop && !reduced;
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const filmStyle: FilmStyle = { "--story-height": `${totalStorySpan}svh` };

  return (
    <section className={styles.film} aria-label="Production systems story" data-total-span={totalStorySpan}>
      <a className={styles.storySkip} href="#complete-profile">
        Skip story to complete profile
      </a>
      <div ref={trackRef} className={styles.filmTrack} style={filmStyle} data-enhanced={enhanced ? "true" : "false"}>
        {enhanced && storyScenes.map((scene, index) => {
          const markerStyle: MarkerStyle = { "--scene-start": `${sceneRanges[index].start * 100}%` };
          return <span key={scene.id} id={scene.id} className={styles.sceneMarker} style={markerStyle} aria-hidden="true" />;
        })}
        <div className={styles.filmStage}>
          {storyScenes.map((scene, index) => (
            <StoryChapter
              key={scene.id}
              scene={scene}
              index={index}
              enhanced={enhanced}
              filmProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
