"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { hexToRgba } from "@/lib/utils";
import { MAJORITY, RAFT_NODES, TERM, type RaftEntry } from "@/lib/raft";
import { Project } from "@/types";

const ACCENT = "#22d3ee";
const GREEN = "#4ade80";
const AMBER = "#fbbf24";
const EASE = [0.22, 1, 0.36, 1] as const;

// node layout in the cluster SVG (viewBox 0 0 360 210)
const LEADER = { x: 180, y: 40 };
const FOLLOWERS = [
  { x: 52, y: 104 },
  { x: 122, y: 150 },
  { x: 238, y: 150 },
  { x: 308, y: 104 },
];

const STATUS_COLOR: Record<Project["status"], string> = {
  active: GREEN,
  completed: ACCENT,
  archived: "#94a3b8",
};

/* ---------------- cluster visualization ---------------- */

function RaftCluster({
  phase,
  committedCount,
  entry,
}: Readonly<{ phase: number; committedCount: number; entry?: RaftEntry }>) {
  const reduced = useReducedMotion();
  const replicating = phase >= 2;
  const committed = phase >= 3;

  // committed log boxes + (optionally) the current entry box
  const boxW = 30;
  const gap = 6;
  const totalBoxes = committedCount + (entry ? 1 : 0);
  const stripW = totalBoxes * (boxW + gap) - gap;
  const startX = 180 - stripW / 2;
  const boxY = 178;

  return (
    <svg viewBox="0 0 360 210" className="mx-auto h-auto w-full max-w-[420px]">
      {/* edges leader -> followers */}
      {FOLLOWERS.map((f, i) => (
        <line
          key={`edge-${i}`}
          x1={LEADER.x}
          y1={LEADER.y}
          x2={f.x}
          y2={f.y}
          stroke={hexToRgba(ACCENT, 0.25)}
          strokeWidth={1}
        />
      ))}

      {/* replication + ack pulses */}
      {replicating && !reduced &&
        FOLLOWERS.map((f, i) => (
          <g key={`pulse-${entry?.index ?? "x"}-${i}`}>
            <motion.circle
              r={3}
              fill={ACCENT}
              initial={{ cx: LEADER.x, cy: LEADER.y, opacity: 0 }}
              animate={{ cx: f.x, cy: f.y, opacity: [0, 1, 1] }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
            />
            <motion.circle
              r={3}
              fill={GREEN}
              initial={{ cx: f.x, cy: f.y, opacity: 0 }}
              animate={{ cx: LEADER.x, cy: LEADER.y, opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.06, ease: EASE }}
            />
          </g>
        ))}

      {/* followers */}
      {FOLLOWERS.map((f, i) => (
        <g key={`f-${i}`}>
          <circle
            cx={f.x}
            cy={f.y}
            r={16}
            fill={committed ? hexToRgba(GREEN, 0.12) : "rgba(148,163,184,0.06)"}
            stroke={committed ? hexToRgba(GREEN, 0.7) : hexToRgba(ACCENT, 0.35)}
            strokeWidth={1.2}
          />
          <text x={f.x} y={f.y + 3} textAnchor="middle" fontSize={9} fontFamily="ui-monospace, monospace" fill={committed ? GREEN : "#94a3b8"}>
            F{i + 1}
          </text>
        </g>
      ))}

      {/* leader — radar-style heartbeat rings expanding outward */}
      {!reduced &&
        [0, 1.1].map((delay) => (
          <motion.circle
            key={`ping-${delay}`}
            cx={LEADER.x}
            cy={LEADER.y}
            r={18}
            fill="none"
            stroke={ACCENT}
            strokeWidth={1}
            initial={{ opacity: 0 }}
            animate={{ r: [18, 42], opacity: [0, 0.5, 0], strokeWidth: [1.4, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay }}
          />
        ))}
      {!reduced && (
        <motion.circle
          cx={LEADER.x}
          cy={LEADER.y}
          r={18}
          fill={hexToRgba(ACCENT, 0.16)}
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          stroke="none"
        />
      )}
      <circle cx={LEADER.x} cy={LEADER.y} r={18} fill={reduced ? hexToRgba(ACCENT, 0.16) : "none"} stroke={ACCENT} strokeWidth={1.5} />
      <text x={LEADER.x} y={LEADER.y + 3} textAnchor="middle" fontSize={11} fontFamily="ui-monospace, monospace" fill={ACCENT} fontWeight={600}>
        L
      </text>
      <text x={LEADER.x} y={LEADER.y - 26} textAnchor="middle" fontSize={8} fontFamily="ui-monospace, monospace" fill={hexToRgba(ACCENT, 0.8)}>
        leader · term {TERM}
      </text>

      {/* committed log strip */}
      {entry && (
        <text x={180} y={boxY - 8} textAnchor="middle" fontSize={8} fontFamily="ui-monospace, monospace" fill="#94a3b8">
          log · idx {entry.index} · term {entry.term}
        </text>
      )}
      {Array.from({ length: totalBoxes }, (_, k) => {
        const isCurrent = entry && k === committedCount;
        const isGreen = !isCurrent || committed;
        const color = isGreen ? GREEN : AMBER;
        const idx = k + 1;
        return (
          <g key={`box-${k}`}>
            <rect
              x={startX + k * (boxW + gap)}
              y={boxY}
              width={boxW}
              height={22}
              rx={2}
              fill={hexToRgba(color, 0.12)}
              stroke={hexToRgba(color, isCurrent && !committed ? 0.8 : 0.5)}
              strokeWidth={1}
            />
            <text
              x={startX + k * (boxW + gap) + boxW / 2}
              y={boxY + 15}
              textAnchor="middle"
              fontSize={9}
              fontFamily="ui-monospace, monospace"
              fill={color}
            >
              {idx}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- project card (the payoff) ---------------- */

function ProjectCard({ entry, committed }: Readonly<{ entry: RaftEntry; committed: boolean }>) {
  const p = entry.project;
  const statusColor = STATUS_COLOR[p.status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={committed ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="rounded-xl border bg-ink-800/75 p-5 text-left backdrop-blur sm:p-6"
      style={{ borderColor: hexToRgba(GREEN, 0.3) }}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-50 sm:text-xl">{p.title}</h2>
        <span
          className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] uppercase"
          style={{ background: hexToRgba(statusColor, 0.14), color: statusColor }}
        >
          {p.status}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-zinc-300">{p.detail}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.tech.map((t) => (
          <span key={t} className="rounded border px-2 py-0.5 font-mono text-[10px]" style={{ borderColor: hexToRgba(ACCENT, 0.25), color: ACCENT }}>
            {t}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line/10 pt-3">
        <span className="font-mono text-[10px] text-zinc-500">
          pid {p.pid} · {p.cpu}% cpu · {p.mem}% mem · [{p.state}]
        </span>
        {p.repoUrl && (
          <a
            href={p.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex items-center gap-1 font-mono text-[10px] transition-colors hover:text-zinc-200"
            style={{ color: ACCENT }}
          >
            <ExternalLink className="h-3 w-3" /> repo
          </a>
        )}
      </div>
      <p className="mt-3 font-mono text-[10px]" style={{ color: GREEN }}>
        ✓ committed · term {entry.term} · index {entry.index}
      </p>
    </motion.div>
  );
}

/* ---------------- scenes ---------------- */

export function CommitScene({ entry, committedCount }: Readonly<{ entry: RaftEntry; committedCount: number }>) {
  // phased auto-play: 0 receive -> 1 append -> 2 replicate -> 3 commit
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => setPhase(3), 1700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [entry.project.id]);

  let caption: string;
  if (phase >= 3) caption = `committed · majority (${MAJORITY}/${RAFT_NODES}) acked`;
  else if (phase >= 2) caption = "AppendEntries → replicating to followers";
  else caption = "leader appends entry to log";

  return (
    <div className="mx-auto flex h-[76vh] w-full max-w-5xl flex-col items-center justify-center gap-5 overflow-hidden md:flex-row">
      <div className="w-full md:w-[42%]">
        <RaftCluster phase={phase} committedCount={committedCount} entry={entry} />
        <p className="mt-2 text-center font-mono text-[10.5px]" style={{ color: phase >= 3 ? GREEN : ACCENT }}>
          {caption}
        </p>
      </div>
      <div className="w-full md:w-[58%]">
        <ProjectCard entry={entry} committed={phase >= 3} />
      </div>
    </div>
  );
}

export function RaftIntroScene() {
  return (
    <div className="mx-auto w-full max-w-xl text-center">
      <p className="font-mono text-[11px] tracking-wide" style={{ color: ACCENT }}>
        raft://cluster · consensus
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">The project log</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
        A {RAFT_NODES}-node cluster with an elected leader. Each project is a log entry the leader replicates to the
        followers and commits once a majority acks.
      </p>
      <div className="mt-5">
        <RaftCluster phase={0} committedCount={0} />
      </div>
      <p className="mt-4 font-mono text-[10.5px] text-zinc-600">scroll ↓ — commit each project to the log</p>
    </div>
  );
}
