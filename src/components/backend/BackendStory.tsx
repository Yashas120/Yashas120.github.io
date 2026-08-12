"use client";

/**
 * The scroll story.
 *
 * One tall wrapper (760svh) with a single sticky viewport-sized stage. Native
 * scrolling only: no wheel listeners, no `preventDefault`, no discrete slide
 * advancing, no input locking, no scroll-snap requirement, no timers driving the
 * sequence, and no autoplay. Scrolling up reverses the system state because every
 * value is a pure transform of scroll position.
 *
 * The active chapter index is tracked in React state so that controls inside
 * off-screen chapters can be removed from the tab order. That state changes once
 * per chapter boundary — not per frame.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import {
  contact,
  contactLinks,
  events,
  experience,
  hero,
  infrastructure,
  projectsChapter,
  reliability,
  resumeLink,
} from "@/data/backend";
import { CHAPTERS, MAX_WIDTH, PROJECT_SUBSTATES, chapterAnchor, colors } from "./tokens";
import { BackendHeader } from "./BackendHeader";
import { ControlPlaneVisual } from "./ControlPlaneVisual";
import { Body, Bullets, Note, Result, ResultRow, StoryChapter } from "./StoryChapter";
import { BackendProjects } from "./BackendProjects";
import { BackendContact } from "./BackendContact";
import { ReducedMotionBackend } from "./ReducedMotionBackend";

/** Hydration-safe viewport check. Matches SSR on the first client render. */
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

/** Hydration-safe reduced-motion: false on the server and first client render. */
function useReducedMotionSafe() {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? Boolean(reduced) : false;
}

export function BackendStory() {
  const reduced = useReducedMotionSafe();
  const mobile = useIsMobile();

  // The reduced-motion document is the complete accessible alternative: it drops
  // the sticky sequence entirely rather than degrading it.
  if (reduced) return <ReducedMotionBackend mobile={mobile} />;
  return <ScrollStory mobile={mobile} />;
}

function ScrollStory({ mobile }: Readonly<{ mobile: boolean }>) {
  const storyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ["start start", "end end"],
  });

  // A light damping only; the spring never decouples the story from the scrollbar.
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  const [chapter, setChapter] = useState(0);
  const [projectSubstate, setProjectSubstate] = useState(0);

  useMotionValueEvent(progress, "change", (v) => {
    const next = CHAPTERS.findIndex((c) => v >= c.start && v < c.end);
    const resolved = next === -1 ? (v >= 1 ? CHAPTERS.length - 1 : 0) : next;
    if (resolved !== chapter) setChapter(resolved);
    const sub = v >= PROJECT_SUBSTATES[1].start ? 1 : 0;
    if (sub !== projectSubstate) setProjectSubstate(sub);
  });

  /** Scrolls to a chapter without hijacking any subsequent scrolling. */
  const goToChapter = (index: number) => {
    const el = storyRef.current;
    if (!el) return;
    const top = el.offsetTop;
    const scrollable = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + scrollable * chapterAnchor(index), behavior: "smooth" });
  };

  return (
    <>
      <BackendHeader progress={progress} />

      <div ref={storyRef} className="relative" style={{ height: "760svh" }}>
        <div className="sticky top-0 overflow-hidden" style={{ height: "100svh" }}>
          {/* restrained background grid; it does not move on its own */}
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.5]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(${colors.line} 1px, transparent 1px), linear-gradient(90deg, ${colors.line} 1px, transparent 1px)`,
                backgroundSize: "48px 48px",
                opacity: 0.28,
              }}
            />
          </div>

          {mobile ? (
            <MobileStage progress={progress} chapter={chapter} projectSubstate={projectSubstate} />
          ) : (
            <DesktopStage progress={progress} chapter={chapter} projectSubstate={projectSubstate} />
          )}

          {mobile ? (
            <ChapterDots chapter={chapter} onSelect={goToChapter} />
          ) : (
            <ChapterRail chapter={chapter} onSelect={goToChapter} />
          )}
        </div>
      </div>
    </>
  );
}

/* ----------------------------------------------------------- chapter copy */

interface StageProps {
  progress: import("framer-motion").MotionValue<number>;
  chapter: number;
  projectSubstate: number;
}

/** The seven chapters of literal copy, in logical DOM order. */
function Chapters({ progress, chapter, projectSubstate, mobile }: StageProps & { mobile: boolean }) {
  const on = (i: number) => chapter === i;

  return (
    <>
      <StoryChapter
        index={0}
        progress={progress}
        active={on(0)}
        eyebrow={hero.eyebrow}
        heading={hero.heading}
        as="h1"
        mobile={mobile}
      >
        <Body mobile={mobile}>{hero.body}</Body>
        {/* the proof explanation is desktop-only; the value and label, which carry
            the verified result, are always shown */}
        <Result
          label={hero.proofLabel}
          value={hero.proofValue}
          explanation={mobile ? undefined : hero.proofExplanation}
          mobile={mobile}
        />
        <HeroActions active={on(0)} />
      </StoryChapter>

      <StoryChapter
        index={1}
        progress={progress}
        active={on(1)}
        id="experience"
        eyebrow={experience.eyebrow}
        heading={experience.heading}
        mobile={mobile}
      >
        <Body mobile={mobile}>{mobile ? experience.introMobile : experience.intro}</Body>
        {/* Two on mobile: three still overflowed a 360×800 chapter, and clipping
            a bullet mid-sentence is worse than showing one fewer. All four are
            listed in full in the reduced-motion document. */}
        <Bullets items={experience.bullets} mobile={mobile} limit={mobile ? 2 : undefined} />
        {!mobile && (
          <Note>
            {experience.previousRole} — {experience.internshipSummary} {experience.progressionNote}
          </Note>
        )}
      </StoryChapter>

      <StoryChapter
        index={2}
        progress={progress}
        active={on(2)}
        eyebrow={infrastructure.eyebrow}
        heading={infrastructure.heading}
        mobile={mobile}
      >
        <Body mobile={mobile}>{infrastructure.paragraphs[0]}</Body>
        <Body mobile={mobile}>{infrastructure.paragraphs[1]}</Body>
        {!mobile && <Body mobile={mobile}>{infrastructure.paragraphs[2]}</Body>}
        <ResultRow results={infrastructure.results} mobile={mobile} />
      </StoryChapter>

      <StoryChapter
        index={3}
        progress={progress}
        active={on(3)}
        eyebrow={events.eyebrow}
        heading={events.heading}
        mobile={mobile}
      >
        <Body mobile={mobile}>{events.body}</Body>
        {!mobile && <Body mobile={mobile}>{events.supporting}</Body>}
        {/* the disclaimer is required on every viewport */}
        <Note>{events.disclaimer}</Note>
      </StoryChapter>

      <StoryChapter
        index={4}
        progress={progress}
        active={on(4)}
        eyebrow={reliability.eyebrow}
        heading={reliability.heading}
        mobile={mobile}
      >
        <Body mobile={mobile}>{reliability.paragraphs[0]}</Body>
        {!mobile && <Body mobile={mobile}>{reliability.paragraphs[1]}</Body>}
        <Body mobile={mobile}>{reliability.paragraphs[2]}</Body>
        <ResultRow results={reliability.results} mobile={mobile} />
      </StoryChapter>

      <StoryChapter
        index={5}
        progress={progress}
        active={on(5)}
        id="projects"
        eyebrow={projectsChapter.eyebrow}
        heading={projectsChapter.heading}
        mobile={mobile}
        compactHeading
      >
        <BackendProjects
          progress={progress}
          active={on(5)}
          activeSubstate={projectSubstate}
          mobile={mobile}
        />
      </StoryChapter>

      <StoryChapter
        index={6}
        progress={progress}
        active={on(6)}
        eyebrow={contact.eyebrow}
        heading={contact.heading}
        mobile={mobile}
      >
        <BackendContact active={on(6)} mobile={mobile} />
      </StoryChapter>
    </>
  );
}

/** Hero actions. Focusable only while the hero is the active chapter. */
function HeroActions({ active }: Readonly<{ active: boolean }>) {
  const tab = active ? undefined : -1;
  const cls =
    "inline-flex min-h-[44px] items-center gap-2 rounded-md border px-4 text-[15px] transition-colors";
  return (
    <div className="mt-7 flex flex-wrap gap-2.5">
      <a
        href="#experience"
        tabIndex={tab}
        className={cls}
        style={{ borderColor: colors.active, color: colors.text, background: colors.raised }}
      >
        View experience
      </a>
      <a
        href={resumeLink.href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={resumeLink.ariaLabel}
        tabIndex={tab}
        className={cls}
        style={{ borderColor: colors.line, color: colors.text }}
      >
        Résumé
      </a>
      <a
        href={contactLinks.github}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="GitHub — Yashas120 (opens in a new tab)"
        tabIndex={tab}
        className={cls}
        style={{ borderColor: colors.line, color: colors.text }}
      >
        GitHub
      </a>
      <a
        href={contactLinks.emailHref}
        aria-label={`Email ${contactLinks.email}`}
        tabIndex={tab}
        className={cls}
        style={{ borderColor: colors.line, color: colors.text }}
      >
        Email
      </a>
    </div>
  );
}

/* --------------------------------------------------------------- stages */

/** Desktop: copy left (~42%), the persistent visual right (~58%). */
function DesktopStage({ progress, chapter, projectSubstate }: StageProps) {
  return (
    <div
      className="relative mx-auto grid h-full grid-cols-[42%_58%] items-center gap-10 px-8"
      style={{ maxWidth: MAX_WIDTH, paddingTop: "var(--bk-header)" }}
    >
      <div className="relative h-full">
        <Chapters progress={progress} chapter={chapter} projectSubstate={projectSubstate} mobile={false} />
      </div>
      {/* the right gutter reserves room for the chapter rail, which would
          otherwise sit on top of the topology's right-hand nodes */}
      <div className="flex h-full items-center justify-center pr-[124px]">
        <div className="w-full" style={{ maxWidth: 720 }}>
          <ControlPlaneVisual progress={progress} />
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile: copy in the upper region, a simplified vertical diagram in the lower
 * one — for the chapters where both fit.
 *
 * The hero, the projects and the contact chapters get the full height instead.
 * On a 360×800 viewport their copy plus a diagram strip does not fit, and the
 * content that would be clipped is exactly the content that matters most: the
 * opening pitch, the repository evidence links, and the contact actions. The
 * diagram is the part that can be given up there, so it is.
 *
 * `chapter` changes once per boundary, so this is not a per-frame layout change.
 */
function MobileStage({ progress, chapter, projectSubstate }: StageProps) {
  const fullHeight = chapter === 0 || chapter >= 5;
  // fades in entering chapter 2 and back out entering the projects chapter
  const diagramOpacity = useTransform(progress, [0.1, 0.14, 0.75, 0.78], [0, 1, 1, 0], {
    clamp: true,
  });

  return (
    <div className="relative h-full px-5" style={{ paddingTop: "calc(var(--bk-header) + 10px)" }}>
      <div
        className="relative h-full transition-[padding] duration-300"
        style={{ paddingBottom: fullHeight ? "44px" : "calc(30svh + 44px)" }}
      >
        <div className="relative h-full overflow-hidden">
          <Chapters progress={progress} chapter={chapter} projectSubstate={projectSubstate} mobile />
        </div>
      </div>

      <motion.div
        className="pointer-events-none absolute inset-x-5 bottom-11 flex items-end justify-center overflow-hidden"
        style={{ height: "30svh", opacity: diagramOpacity }}
        aria-hidden={fullHeight}
      >
        <ControlPlaneVisual progress={progress} mobile />
      </motion.div>
    </div>
  );
}

/* ---------------------------------------------------------- navigation */

/** Desktop chapter rail. Completed chapters are green, the current one brighter. */
function ChapterRail({
  chapter,
  onSelect,
}: Readonly<{ chapter: number; onSelect: (i: number) => void }>) {
  return (
    <nav aria-label="Chapters" className="absolute right-5 top-1/2 -translate-y-1/2">
      <ol className="flex flex-col items-end gap-1">
        {CHAPTERS.map((c, i) => {
          const done = i < chapter;
          const current = i === chapter;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={current ? "step" : undefined}
                className="flex min-h-[44px] items-center justify-end gap-2 px-1 text-right text-[12px]"
                style={{ color: current ? colors.text : done ? colors.healthy : colors.muted }}
              >
                <span className="font-mono tracking-[0.08em]">{c.rail}</span>
                <span
                  aria-hidden
                  className="block h-[1px] transition-all"
                  style={{
                    width: current ? 22 : 10,
                    background: current ? colors.active : done ? colors.healthy : colors.line,
                  }}
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Mobile: seven compact dots, each with an accessible label. */
function ChapterDots({
  chapter,
  onSelect,
}: Readonly<{ chapter: number; onSelect: (i: number) => void }>) {
  return (
    <nav
      aria-label="Chapters"
      className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 pb-1"
    >
      {CHAPTERS.map((c, i) => {
        const done = i < chapter;
        const current = i === chapter;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(i)}
            aria-current={current ? "step" : undefined}
            aria-label={`Go to ${c.rail}`}
            className="flex h-[44px] w-[44px] items-center justify-center"
          >
            <span
              aria-hidden
              className="block rounded-full transition-all"
              style={{
                width: current ? 22 : 7,
                height: 7,
                background: current ? colors.active : done ? colors.healthy : colors.line,
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
