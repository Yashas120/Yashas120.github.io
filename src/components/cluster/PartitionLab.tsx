"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Unplug, Link2, RotateCcw } from "lucide-react";
import { hexToRgba } from "@/lib/utils";
import { useIsLight } from "@/lib/useIsLight";
import { EASE_OUT } from "./scroll";

const ACCENT = "#22d3ee";
const RED = "#f87171";
const AMBER = "#fbbf24";

const nodes = [
  { id: "n0", label: "optical" },
  { id: "n1", label: "backend" },
  { id: "n2", label: "devops" },
  { id: "n3", label: "research" },
  { id: "n4", label: "systems" },
];

const MAJORITY = [0, 1, 2];
const MINORITY = [3, 4];
const START_LEADER = 4; // sits in the minority, so a split forces a re-election
const SPLIT_LEADER = 1;

const CX = 170;
const CY = 150;
const R = 110;

const pos = nodes.map((_, i) => {
  const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
});

const FAULT = "142,6 134,48 146,94 132,138 144,184 133,228 145,272 137,304";

type Mode = "healthy" | "split" | "healing";

export function PartitionLab() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const reduced = useReducedMotion();
  const isLight = useIsLight();

  const [mode, setMode] = useState<Mode>("healthy");
  const [term, setTerm] = useState(8);
  const [leader, setLeader] = useState(START_LEADER);
  const [majCommit, setMajCommit] = useState(24);
  const [minCommit, setMinCommit] = useState(24);

  const nodeFill = isLight ? "#e2e8f0" : "#11141b";
  const idleStroke = isLight ? "rgba(15,23,42,0.25)" : "rgba(255,255,255,0.15)";
  // Concrete rgba: framer cannot interpolate `rgb(var(--line) / a)`.
  const idleBorder = isLight ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.10)";
  const split = mode !== "healthy";
  const lag = majCommit - minCommit;

  // The cluster keeps committing on its own, but only while it is on screen.
  useEffect(() => {
    if (!inView) return;

    if (mode === "healthy") {
      const iv = setInterval(() => {
        setMajCommit((c) => c + 1);
        setMinCommit((c) => c + 1);
      }, 1600);
      return () => clearInterval(iv);
    }

    if (mode === "split") {
      const iv = setInterval(() => setMajCommit((c) => c + 1), 900);
      return () => clearInterval(iv);
    }

    // healing: the stale replicas stream the entries they missed
    const iv = setInterval(() => setMinCommit((c) => c + 1), 70);
    return () => clearInterval(iv);
  }, [mode, inView]);

  useEffect(() => {
    if (mode === "healing" && minCommit >= majCommit) {
      setMinCommit(majCommit);
      setMode("healthy");
    }
  }, [mode, minCommit, majCommit]);

  const partition = () => {
    setMode("split");
    setLeader(SPLIT_LEADER);
    setTerm((t) => t + 1);
  };

  const heal = () => setMode("healing");

  const reset = () => {
    setMode("healthy");
    setLeader(START_LEADER);
    setTerm(8);
    setMajCommit(24);
    setMinCommit(24);
  };

  const groupFor = (i: number) => (MAJORITY.includes(i) ? "maj" : "min");

  const renderNode = (i: number) => {
    const isLeader = i === leader;
    const stranded = split && groupFor(i) === "min";
    const stroke = isLeader ? ACCENT : stranded ? hexToRgba(RED, 0.6) : idleStroke;

    return (
      <g key={nodes[i].id}>
        {isLeader && !reduced && (
          <motion.circle
            cx={pos[i].x}
            cy={pos[i].y}
            fill="none"
            stroke={ACCENT}
            strokeWidth={1}
            initial={{ r: 18, opacity: 0.55 }}
            animate={{ r: [18, 38], opacity: [0.55, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <motion.circle
          cx={pos[i].x}
          cy={pos[i].y}
          fill={isLeader ? hexToRgba(ACCENT, 0.9) : nodeFill}
          stroke={stroke}
          initial={{ r: 15, opacity: 1 }}
          animate={{ r: isLeader ? 19 : 15, opacity: stranded ? 0.55 : 1 }}
          strokeWidth={isLeader ? 2 : 1}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          style={isLeader ? { filter: `drop-shadow(0 0 9px ${hexToRgba(ACCENT, 0.7)})` } : undefined}
        />
        <text
          x={pos[i].x}
          y={pos[i].y + 32}
          textAnchor="middle"
          className="font-mono"
          fontSize={9}
          fill={isLeader ? ACCENT : stranded ? RED : "#71717a"}
        >
          {nodes[i].label}
        </text>
      </g>
    );
  };

  return (
    <div ref={ref} className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
      <div className="flex justify-center">
        <svg width="340" height="312" viewBox="0 0 340 312" className="max-w-full">
          {/* links from the acting leader to peers it can still reach */}
          {nodes.map((_, i) => {
            if (i === leader) return null;
            const reachable = !split || groupFor(i) === groupFor(leader);
            return (
              <motion.line
                key={`link-${i}`}
                x1={pos[leader].x}
                y1={pos[leader].y}
                x2={pos[i].x}
                y2={pos[i].y}
                stroke={reachable ? hexToRgba(ACCENT, 0.25) : hexToRgba(RED, 0.22)}
                strokeWidth={1}
                strokeDasharray={reachable ? undefined : "4 4"}
                initial={{ opacity: 1 }}
                animate={{ opacity: reachable ? 1 : 0.5 }}
              />
            );
          })}

          {/* heartbeats only flow inside the leader's own partition */}
          {!reduced &&
            nodes.map((_, i) => {
              if (i === leader) return null;
              if (split && groupFor(i) !== groupFor(leader)) return null;
              return (
                <motion.g
                  key={`beat-${i}`}
                  initial={{ x: pos[leader].x, y: pos[leader].y }}
                  animate={{ x: [pos[leader].x, pos[i].x], y: [pos[leader].y, pos[i].y] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                >
                  <circle r={3} fill={ACCENT} />
                </motion.g>
              );
            })}

          <motion.g animate={{ x: split ? 24 : 0 }} transition={{ duration: 0.7, ease: EASE_OUT }}>
            {MAJORITY.map(renderNode)}
          </motion.g>
          <motion.g animate={{ x: split ? -24 : 0 }} transition={{ duration: 0.7, ease: EASE_OUT }}>
            {MINORITY.map(renderNode)}
          </motion.g>

          <motion.polyline
            points={FAULT}
            fill="none"
            stroke={RED}
            strokeWidth={1.5}
            strokeDasharray="6 6"
            initial={{ opacity: 0 }}
            animate={{ opacity: split ? 0.85 : 0 }}
            transition={{ duration: 0.4 }}
          />
        </svg>
      </div>

      <div>
        <div className="grid gap-3 sm:grid-cols-2">
          <motion.div
            className="rounded-xl border p-4"
            initial={{ borderColor: idleBorder }}
            animate={{ borderColor: split ? hexToRgba(ACCENT, 0.4) : idleBorder }}
            style={{ background: "rgb(var(--ink-800) / 0.8)" }}
          >
            <p className="font-mono text-[10.5px] text-zinc-500">partition A · 3 nodes</p>
            <p className="mt-1 text-sm font-semibold" style={{ color: ACCENT }}>
              {split ? "quorum retained" : "single cluster"}
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">
              {split
                ? `Elected ${nodes[SPLIT_LEADER].label} in term ${term}. Still accepting writes.`
                : `Leader ${nodes[leader].label} · term ${term}. All five nodes in sync.`}
            </p>
            <p className="mt-2 font-mono text-lg" style={{ color: ACCENT }}>
              commitIndex {majCommit}
            </p>
          </motion.div>

          <motion.div
            className="rounded-xl border p-4"
            initial={{ borderColor: idleBorder }}
            animate={{ borderColor: split ? hexToRgba(RED, 0.4) : idleBorder }}
            style={{ background: "rgb(var(--ink-800) / 0.8)" }}
          >
            <p className="font-mono text-[10.5px] text-zinc-500">partition B · 2 nodes</p>
            <p
              className="mt-1 text-sm font-semibold"
              style={{ color: split ? RED : ACCENT }}
            >
              {split ? "no quorum · read-only" : "single cluster"}
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">
              {split
                ? "Two of five cannot elect a leader. These nodes refuse writes and serve stale reads."
                : "Nothing is partitioned — every node can reach the leader."}
            </p>
            <p
              className="mt-2 font-mono text-lg"
              style={{ color: split ? RED : ACCENT }}
            >
              commitIndex {minCommit}
              {lag > 0 && <span className="ml-2 text-[11px] text-zinc-500">−{lag} behind</span>}
            </p>
          </motion.div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          {mode === "healthy" && lag === 0 && (
            <>
              Five healthy nodes, one leader, one log. Cut the network and Raft has to choose
              between staying consistent and staying available.
            </>
          )}
          {mode === "split" && (
            <>
              This is CAP resolved in favour of <span style={{ color: ACCENT }}>consistency</span>.
              The minority side could have kept serving writes and diverged; instead it stops. A
              stale read is recoverable, a split-brain log is not.
            </>
          )}
          {mode === "healing" && (
            <>
              The link is back. The stale replicas are replaying the entries they missed — they
              adopt the higher term and truncate anything that conflicts.
            </>
          )}
        </p>

        <div className="mt-4 flex flex-wrap gap-2.5 font-mono text-xs">
          <button
            onClick={partition}
            disabled={mode !== "healthy"}
            className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: hexToRgba(RED, 0.45), color: RED, background: hexToRgba(RED, 0.08) }}
          >
            <Unplug className="h-3.5 w-3.5" /> partition the cluster
          </button>
          <button
            onClick={heal}
            disabled={mode !== "split"}
            className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: hexToRgba(ACCENT, 0.45), color: ACCENT, background: hexToRgba(ACCENT, 0.08) }}
          >
            <Link2 className="h-3.5 w-3.5" /> heal the partition
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-line/15 px-3.5 py-2 text-zinc-400 transition-colors hover:text-zinc-200"
          >
            <RotateCcw className="h-3.5 w-3.5" /> reset
          </button>
        </div>

        <p className="mt-3 font-mono text-[10.5px]" style={{ color: mode === "split" ? AMBER : "#52525b" }}>
          {mode === "split" ? "● degraded — 2 nodes unreachable" : "● cluster nominal"}
        </p>
      </div>
    </div>
  );
}
