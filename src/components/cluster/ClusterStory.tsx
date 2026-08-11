"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { Network, Workflow } from "lucide-react";
import { ServerRoom } from "./ServerRoom";
import { CommitScene, RaftIntroScene } from "./RaftLog";
import { MRJOBS, EXECUTORS, type MRJob } from "@/lib/mapreduce";
import { RAFT_ENTRIES, RAFT_NODES, TERM, type RaftEntry } from "@/lib/raft";
import { profile } from "@/data/profile";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#22d3ee";
const GREEN = "#4ade80";
const EASE = [0.22, 1, 0.36, 1] as const;

type Scene =
  | { kind: "intro" }
  | { kind: "job"; job: MRJob; j: number }
  | { kind: "raftIntro" }
  | { kind: "commit"; entry: RaftEntry; c: number };

const SCENES: Scene[] = [
  { kind: "intro" },
  ...MRJOBS.map((job, j) => ({ kind: "job" as const, job, j })),
  { kind: "raftIntro" },
  ...RAFT_ENTRIES.map((entry, c) => ({ kind: "commit" as const, entry, c })),
];
const TOTAL = SCENES.length;

function isRaftScene(s: Scene): boolean {
  return s.kind === "raftIntro" || s.kind === "commit";
}

export function ClusterStory() {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(index);
  indexRef.current = index;

  const target = useMotionValue(0);
  const bg = useSpring(target, { stiffness: 60, damping: 26, mass: 0.6 });
  const lock = useRef(false);

  useEffect(() => {
    target.set(TOTAL > 1 ? index / (TOTAL - 1) : 0);
  }, [index, target]);

  const jump = useCallback((i: number) => {
    setIndex(Math.max(0, Math.min(TOTAL - 1, i)));
  }, []);

  // no real page scroll — scroll/swipe/key intent steps between scenes
  useEffect(() => {
    const step = (dir: number) => {
      if (lock.current) return;
      const nextIdx = Math.max(0, Math.min(TOTAL - 1, indexRef.current + dir));
      if (nextIdx === indexRef.current) return;
      lock.current = true;
      indexRef.current = nextIdx;
      setIndex(nextIdx);
      window.setTimeout(() => {
        lock.current = false;
      }, 480);
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 6) return;
      e.preventDefault();
      step(e.deltaY > 0 ? 1 : -1);
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        step(1);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        step(-1);
      }
    };
    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = startY - (e.changedTouches[0]?.clientY ?? startY);
      if (Math.abs(dy) > 44) step(dy > 0 ? 1 : -1);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const scene = SCENES[index];
  const raftAct = isRaftScene(scene);
  // projects committed before the current commit scene
  const committedBefore = SCENES.slice(0, index).filter((s) => s.kind === "commit").length;

  let sceneTag: string;
  let sceneStage: string;
  if (scene.kind === "job") {
    sceneTag = `${scene.job.org} · job ${scene.j + 1}/${MRJOBS.length}`;
    sceneStage = "map() → shuffle + sort → reduce()";
  } else if (scene.kind === "commit") {
    sceneTag = `project ${scene.c + 1}/${RAFT_ENTRIES.length}`;
    sceneStage = "append → replicate → commit";
  } else if (scene.kind === "raftIntro") {
    sceneTag = "raft://cluster";
    sceneStage = "consensus ready";
  } else {
    sceneTag = "mapreduce://cluster";
    sceneStage = "cluster ready";
  }

  let hint: string;
  if (index >= TOTAL - 1) hint = "log fully replicated";
  else if (raftAct) hint = "scroll ↓ / ↑ — commit the next project";
  else hint = "scroll ↓ / ↑ — run the next job";

  return (
    <div className="relative h-[100dvh] overflow-hidden">
      <ServerRoom progress={bg} />

      {/* HUD top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-3 font-mono text-[11px]">
        <span className="flex items-center gap-2" style={{ color: ACCENT }}>
          {raftAct ? <Network className="h-3.5 w-3.5" /> : <Workflow className="h-3.5 w-3.5" />}
          {raftAct ? "raft · consensus" : "mapreduce · profile"}
        </span>
        <span className="text-zinc-500">{raftAct ? `term ${TERM} · ${RAFT_NODES} nodes` : `${EXECUTORS} executors`}</span>
      </div>

      {/* scene label */}
      <div className="pointer-events-none absolute left-1/2 top-12 z-20 -translate-x-1/2 text-center font-mono text-[10.5px]">
        <span className="rounded px-2 py-0.5" style={{ background: hexToRgba(ACCENT, 0.12), color: ACCENT }}>
          {sceneTag}
        </span>
        <span className="ml-2 text-zinc-500">{sceneStage}</span>
      </div>

      {/* scenes */}
      <div className="absolute inset-0 z-10">
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="absolute inset-0 flex items-center justify-center px-6 pt-16"
          >
            {scene.kind === "intro" && <IntroScene />}
            {scene.kind === "job" && <JobScene job={scene.job} />}
            {scene.kind === "raftIntro" && <RaftIntroScene />}
            {scene.kind === "commit" && <CommitScene entry={scene.entry} committedCount={committedBefore} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* progress rail + hint */}
      <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-1.5 px-6 pb-4">
        <Rail index={index} onJump={jump} />
        <p className="font-mono text-[10px] text-zinc-600">{hint}</p>
      </div>
    </div>
  );
}

function railKey(s: Scene): string {
  if (s.kind === "job") return `job-${s.job.id}`;
  if (s.kind === "commit") return `commit-${s.entry.project.id}`;
  return s.kind;
}

function Rail({ index, onJump }: Readonly<{ index: number; onJump: (i: number) => void }>) {
  return (
    <div className="flex max-w-2xl flex-wrap items-center justify-center gap-1">
      {SCENES.map((s, i) => {
        const on = i === index;
        const boundary = s.kind === "intro" || s.kind === "raftIntro";
        return (
          <button
            key={railKey(s)}
            onClick={() => onJump(i)}
            aria-label={`scene ${i + 1}`}
            aria-current={on ? "step" : undefined}
            className="p-0.5"
          >
            <span
              className="block rounded-full transition-all"
              style={{
                height: on ? 8 : boundary ? 6 : 5,
                width: on ? 8 : boundary ? 6 : 5,
                background: i <= index ? ACCENT : "rgb(var(--line) / 0.3)",
                boxShadow: on ? `0 0 8px ${hexToRgba(ACCENT, 0.9)}` : "none",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

function IntroScene() {
  return (
    <div className="mx-auto w-full max-w-2xl text-center">
      <p className="font-mono text-[11px] tracking-wide" style={{ color: ACCENT }}>
        mapreduce://cluster · {EXECUTORS} executors online
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">{profile.shortName}</h1>
      <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">{profile.summary}</p>
      <div className="mt-6 flex items-center justify-center gap-2">
        {Array.from({ length: EXECUTORS }, (_, i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full"
            style={{ background: GREEN }}
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}
        <span className="ml-1 font-mono text-[10.5px] text-zinc-500">executors ready</span>
      </div>
      <p className="mt-6 font-mono text-[10.5px] text-zinc-600">scroll ↓ — run a MapReduce job for each role</p>
    </div>
  );
}

/* ---------- the per-job MapReduce diagram ---------- */

function ColHead({ children }: Readonly<{ children: React.ReactNode }>) {
  return <p className="mb-2 shrink-0 text-center font-mono text-[10.5px]" style={{ color: ACCENT }}>{children}</p>;
}

function ColArrow() {
  return (
    <div className="flex h-full items-center justify-center pt-6">
      <span className="text-lg" style={{ color: hexToRgba(ACCENT, 0.5) }}>→</span>
    </div>
  );
}

function JobScene({ job }: Readonly<{ job: MRJob }>) {
  // phased auto-play: 0 inputs → 1 map → 2 shuffle(regroup) → 3 reduce
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [job.id]);

  // shuffle: reorder the mapped pairs from input order into grouped-by-key order
  const order = phase < 2 ? job.mapped : job.groups.flatMap((g) => g.items);

  return (
    <div className="mx-auto flex h-[76vh] w-full max-w-6xl flex-col overflow-hidden">
      <div className="mb-1 text-center">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-50 sm:text-xl">
          {job.role} <span className="text-zinc-500">· {job.org}</span>
        </h2>
        <p className="font-mono text-[10px] text-zinc-500">
          {job.dates}
          {job.location ? ` · ${job.location}` : ""}
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1.1fr_auto_0.85fr_auto_1.1fr] items-start gap-3 pt-2">
        {/* input splits */}
        <div className="flex min-h-0 flex-col">
          <ColHead>input splits · {job.inputs.length}</ColHead>
          <div className="flex flex-col gap-1.5 overflow-hidden">
            {job.inputs.map((text, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: EASE }}
                className="rounded-lg border border-line/10 bg-ink-800/80 p-2.5 text-left text-[12px] leading-snug text-zinc-200 backdrop-blur"
              >
                <span className="mr-1 font-mono text-[9px] text-zinc-500">split-{i}</span>
                <span className="line-clamp-3">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <ColArrow />

        {/* map() → shuffle + sort */}
        <div className="flex min-h-0 flex-col">
          <ColHead>map() → shuffle + sort</ColHead>
          <div className="flex flex-col gap-1.5">
            {order.map((p) => (
              <motion.div
                layout
                key={p.text}
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 1 ? 1 : 0 }}
                transition={{ layout: { type: "spring", stiffness: 320, damping: 32 }, duration: 0.35, ease: EASE }}
                className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5 font-mono text-[11px]"
                style={{ borderColor: hexToRgba(p.color, 0.5), background: hexToRgba(p.color, 0.09), color: p.color }}
              >
                <span className="truncate">({p.label},</span>
                <span className="font-semibold">{p.value})</span>
              </motion.div>
            ))}
          </div>
          <motion.p
            className="mt-2 text-center font-mono text-[9px] text-zinc-600"
            animate={{ opacity: phase >= 1 ? 1 : 0 }}
          >
            {phase >= 2 ? "grouped by key" : "emitting (key, value)"}
          </motion.p>
        </div>

        <ColArrow />

        {/* reduce() */}
        <div className="flex min-h-0 flex-col">
          <ColHead>reduce() → outcomes</ColHead>
          <div className="flex flex-col gap-2">
            {job.groups.map((g, i) => (
              <motion.div
                key={g.key}
                initial={{ opacity: 0, x: 10, scale: 0.97 }}
                animate={phase >= 3 ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 10, scale: 0.97 }}
                transition={{ delay: phase >= 3 ? i * 0.12 : 0, duration: 0.4, ease: EASE }}
                className="rounded-lg border p-3 text-left backdrop-blur"
                style={{ borderColor: hexToRgba(g.color, 0.4), background: hexToRgba(g.color, 0.07) }}
              >
                <div className="mb-1 flex items-center gap-2 font-mono text-[10px]">
                  <span className="font-semibold" style={{ color: g.color }}>{g.label}</span>
                  <span className="text-zinc-500">· {g.count} pts · Σ{g.sum}</span>
                </div>
                <p className="line-clamp-3 text-[12.5px] leading-snug text-zinc-100">{g.top}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
