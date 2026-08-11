"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { hexToRgba } from "@/lib/utils";

const DEFAULT_ACCENT = "#a78bfa";

// One gesture must equal exactly one slide. Wheel deltas accumulate so a stray
// nudge never advances, and the lock releases once trackpad momentum goes quiet
// (or once MAX_LOCK_MS passes, so a long glide never feels stuck).
const ANIM_MS = 340;
const COOLDOWN_MS = 380;
const MAX_LOCK_MS = 900;
const QUIET_MS = 70;
const GESTURE_GAP_MS = 200;
const WHEEL_TRIGGER = 48;
const SWIPE_THRESHOLD = 40;

/** Returns true when the slide handled the step itself and the deck should stay put. */
export type SlideStepper = (delta: number) => boolean;

export interface DeckApi {
  active: number;
  count: number;
  direction: number;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  registerStepper: (fn: SlideStepper) => () => void;
}

export interface DeckSlide {
  id: string;
  tag?: string;
  node: React.ReactNode;
}

const DeckContext = createContext<DeckApi | null>(null);

/** Navigate the deck from inside any slide. */
export function useDeck(): DeckApi {
  const api = useContext(DeckContext);
  if (!api) throw new Error("useDeck must be used inside a <Deck>");
  return api;
}

/**
 * Lets a slide walk its own items before the deck moves on: each step focuses
 * the next item, and only a step past either end hands control back to the deck.
 * Entering a slide backwards starts at the last item so the walk stays continuous.
 */
export function useSlideStepper(count: number): readonly [number, (index: number) => void] {
  const { registerStepper, direction } = useDeck();
  const [index, setIndex] = useState(() => (direction < 0 && count > 0 ? count - 1 : 0));
  const indexRef = useRef(index);

  const focus = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(count - 1, next));
      indexRef.current = clamped;
      setIndex(clamped);
    },
    [count]
  );

  useEffect(
    () =>
      registerStepper((delta) => {
        const next = indexRef.current + delta;
        if (next < 0 || next >= count) return false;
        indexRef.current = next;
        setIndex(next);
        return true;
      }),
    [count, registerStepper]
  );

  return [index, focus] as const;
}

export function Deck({
  slides,
  headerOffset = 52,
  accent = DEFAULT_ACCENT,
  onActiveChange,
  transition = "slide",
}: Readonly<{
  slides: DeckSlide[];
  headerOffset?: number;
  accent?: string;
  onActiveChange?: (index: number) => void;
  // "slide": vertical translate (default). "zoom": depth cross-dissolve that
  // grows the incoming slide from centre so it doesn't read as page scrolling.
  transition?: "slide" | "zoom";
}>) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduce = useReducedMotion();

  useEffect(() => {
    onActiveChange?.(active);
  }, [active, onActiveChange]);

  const lockedRef = useRef(false);
  const lastWheelRef = useRef(0);
  const wheelAccumRef = useRef(0);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<number | null>(null);
  const stepperRef = useRef<SlideStepper | null>(null);
  const activeRef = useRef(0);
  const countRef = useRef(slides.length);
  countRef.current = slides.length;

  const lock = useCallback(() => {
    lockedRef.current = true;
    wheelAccumRef.current = 0;
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    const lockedAt = Date.now();
    const release = () => {
      const quiet = Date.now() - lastWheelRef.current >= QUIET_MS;
      const expired = Date.now() - lockedAt >= MAX_LOCK_MS;
      if (!quiet && !expired) {
        lockTimerRef.current = setTimeout(release, QUIET_MS);
        return;
      }
      lockedRef.current = false;
      wheelAccumRef.current = 0;
    };
    lockTimerRef.current = setTimeout(release, COOLDOWN_MS);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(countRef.current - 1, index));
      if (clamped === activeRef.current) return;
      setDirection(clamped > activeRef.current ? 1 : -1);
      activeRef.current = clamped;
      setActive(clamped);
      lock();
    },
    [lock]
  );

  // The active slide gets first refusal on every step so it can walk its own
  // items; only when it declines does the deck change slides.
  const registerStepper = useCallback((fn: SlideStepper) => {
    stepperRef.current = fn;
    return () => {
      if (stepperRef.current === fn) stepperRef.current = null;
    };
  }, []);

  const step = useCallback(
    (delta: number) => {
      if (lockedRef.current) return;
      if (stepperRef.current?.(delta)) {
        lock();
        return;
      }
      goTo(activeRef.current + delta);
    },
    [goTo, lock]
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  // Wheel / trackpad: the page itself never scrolls, each gesture advances once.
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      // A pause means a fresh gesture, so intent starts from zero again.
      if (now - lastWheelRef.current > GESTURE_GAP_MS) wheelAccumRef.current = 0;
      lastWheelRef.current = now;
      if (lockedRef.current) return;

      wheelAccumRef.current += e.deltaY;
      if (Math.abs(wheelAccumRef.current) < WHEEL_TRIGGER) return;

      const dir = wheelAccumRef.current > 0 ? 1 : -1;
      wheelAccumRef.current = 0;
      step(dir);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
        case " ":
          e.preventDefault();
          step(1);
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          step(-1);
          break;
        case "Home":
          e.preventDefault();
          goTo(0);
          break;
        case "End":
          e.preventDefault();
          goTo(countRef.current - 1);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, goTo]);

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0]?.clientY ?? null;
    };
    const onEnd = (e: TouchEvent) => {
      const start = touchStartRef.current;
      const endY = e.changedTouches[0]?.clientY;
      touchStartRef.current = null;
      if (start == null || endY == null) return;
      const delta = start - endY;
      if (Math.abs(delta) < SWIPE_THRESHOLD) return;
      step(delta > 0 ? 1 : -1);
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [step]);

  // The deck owns the viewport: nothing behind it may scroll.
  useEffect(() => {
    const { body, documentElement: html } = document;
    const prevBody = body.style.overflow;
    const prevHtml = html.style.overflow;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    return () => {
      body.style.overflow = prevBody;
      html.style.overflow = prevHtml;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, []);

  const api = useMemo<DeckApi>(
    () => ({ active, count: slides.length, direction, goTo, next, prev, registerStepper }),
    [active, slides.length, direction, goTo, next, prev, registerStepper]
  );
  const slide = slides[active];

  const slideVariants = {
    enter: (dir: number) => (reduce ? { opacity: 0 } : { opacity: 0, y: dir > 0 ? 32 : -32, scale: 0.96 }),
    center: reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 },
    exit: (dir: number) => (reduce ? { opacity: 0 } : { opacity: 0, y: dir > 0 ? -32 : 32, scale: 0.97 }),
  };

  // Depth cross-dissolve: no vertical travel, so it reads as moving through
  // slides rather than scrolling a document.
  const zoomVariants = {
    enter: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, filter: "blur(12px)" },
    center: reduce ? { opacity: 1 } : { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08, filter: "blur(12px)" },
  };

  const variants = transition === "zoom" ? zoomVariants : slideVariants;

  return (
    <DeckContext.Provider value={api}>
      <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ top: headerOffset }}>
        {/* Slides overlap so one cross-fades through center as the other leaves. */}
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={slide.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduce ? 0.16 : ANIM_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center overflow-hidden px-4"
          >
            <div className="max-h-full w-full overflow-hidden">{slide.node}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* jump dots */}
      <nav aria-label="Sections" className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-2.5 sm:flex">
        {slides.map((s, i) => {
          const isActive = i === active;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={s.tag ?? s.id}
              aria-current={isActive ? "true" : undefined}
              className="group flex items-center gap-2"
            >
              <span className="pointer-events-none whitespace-nowrap font-mono text-[10px] opacity-0 transition-opacity group-hover:opacity-100" style={{ color: accent }}>
                {s.tag ?? s.id}
              </span>
              <span
                className="block rounded-full transition-all"
                style={{
                  height: isActive ? 10 : 6,
                  width: isActive ? 10 : 6,
                  background: isActive ? accent : "rgb(var(--line) / 0.35)",
                  boxShadow: isActive ? `0 0 10px ${hexToRgba(accent, 0.9)}` : "none",
                }}
              />
            </button>
          );
        })}
      </nav>

      {/* position + hint */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex items-center justify-center gap-3 font-mono text-[10px] text-zinc-600">
        <span style={{ color: hexToRgba(accent, 0.7) }}>
          {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <span>· scroll or ↑↓ to step ·</span>
      </div>
    </DeckContext.Provider>
  );
}
