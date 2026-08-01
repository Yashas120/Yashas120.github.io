"use client";

import { useState } from "react";
import { MotionValue, motion, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";
import { hexToRgba } from "@/lib/utils";
import { useIsLight } from "@/lib/useIsLight";
import { Phase } from "./scroll";

const ACCENT = "#22d3ee";
const AMBER = "#fbbf24";

const nodes = [
  { id: "n0", label: "optical", role: "Optical / Dataplane" },
  { id: "n1", label: "backend", role: "Backend Platforms" },
  { id: "n2", label: "devops", role: "Cloud / DevOps" },
  { id: "n3", label: "research", role: "ML / Research" },
  { id: "n4", label: "systems", role: "Low-level Systems" },
];

/** The node that times out first and wins the term. */
const CANDIDATE = 4;
/** Peers that grant their vote — candidate + these two is the 3/5 majority. */
const VOTERS = [0, 2];

const CX = 170;
const CY = 152;
const R = 112;

const pos = nodes.map((_, i) => {
  const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
});

// Leaves the first ~10% of the act to the 3D unfold before the story starts.
const STEPS = [0.26, 0.44, 0.62, 0.79] as const;
const BOOT_AT = 0.11;
type NodeState = "follower" | "candidate" | "voted" | "leader";

function stateFor(i: number, phase: number): NodeState {
  if (phase >= 4) return i === CANDIDATE ? "leader" : "follower";
  if (phase === 3) {
    if (i === CANDIDATE) return "candidate";
    return VOTERS.includes(i) ? "voted" : "follower";
  }
  if (phase === 2 && i === CANDIDATE) return "candidate";
  return "follower";
}

/** A single RPC in flight, its position tied directly to scroll offset. */
function Packet({
  progress,
  from,
  to,
  start,
  end,
  color,
}: {
  progress: MotionValue<number>;
  from: { x: number; y: number };
  to: { x: number; y: number };
  start: number;
  end: number;
  color: string;
}) {
  const x = useTransform(progress, [start, end], [from.x, to.x]);
  const y = useTransform(progress, [start, end], [from.y, to.y]);
  const opacity = useTransform(progress, [start, start + 0.012, end - 0.025, end], [0, 1, 1, 0]);

  return (
    <motion.g style={{ x, y, opacity }}>
      <circle r={3.5} fill={color} />
    </motion.g>
  );
}

function RaftNode({
  progress,
  index,
  state,
  nodeFill,
  followerStroke,
}: {
  progress: MotionValue<number>;
  index: number;
  state: NodeState;
  nodeFill: string;
  followerStroke: string;
}) {
  const appearAt = BOOT_AT + index * 0.025;
  const opacity = useTransform(progress, [appearAt, appearAt + 0.05], [0, 1]);
  const p = pos[index];

  const fill =
    state === "leader"
      ? hexToRgba(ACCENT, 0.9)
      : state === "candidate"
        ? hexToRgba(AMBER, 0.15)
        : nodeFill;
  const stroke =
    state === "leader"
      ? ACCENT
      : state === "candidate"
        ? AMBER
        : state === "voted"
          ? hexToRgba(ACCENT, 0.7)
          : followerStroke;

  return (
    <motion.g style={{ opacity }}>
      {state === "leader" && (
        <motion.circle
          cx={p.x}
          cy={p.y}
          fill="none"
          stroke={ACCENT}
          strokeWidth={1}
          initial={{ r: 20, opacity: 0.6 }}
          animate={{ r: [20, 42], opacity: [0.6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <motion.circle
        cx={p.x}
        cy={p.y}
        fill={fill}
        stroke={stroke}
        initial={{ r: 17, strokeWidth: 1 }}
        animate={{ r: state === "leader" ? 21 : 17, strokeWidth: state === "follower" ? 1 : 2 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        style={state === "leader" ? { filter: `drop-shadow(0 0 10px ${hexToRgba(ACCENT, 0.75)})` } : undefined}
      />
      <text
        x={p.x}
        y={p.y + 36}
        textAnchor="middle"
        className="font-mono"
        fontSize={9.5}
        fill={state === "leader" ? ACCENT : state === "candidate" ? AMBER : "#71717a"}
      >
        {nodes[index].label}
      </text>
    </motion.g>
  );
}

function Copy({ tag, title, body }: { tag: string; title: string; body: string }) {
  return (
    <>
      <p className="font-mono text-[11px]" style={{ color: ACCENT }}>
        {tag}
      </p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">{body}</p>
    </>
  );
}

export function RaftElection({ progress }: { progress: MotionValue<number> }) {
  const [phase, setPhase] = useState(0);
  const isLight = useIsLight();
  const reduced = useReducedMotion();

  const nodeFill = isLight ? "#e2e8f0" : "#11141b";
  const followerStroke = isLight ? "rgba(15,23,42,0.25)" : "rgba(255,255,255,0.15)";

  useMotionValueEvent(progress, "change", (v) => {
    const next = STEPS.filter((s) => v >= s).length;
    setPhase((prev) => (prev === next ? prev : next));
  });

  const term = phase >= 2 ? 8 : 7;

  return (
    <div className="grid items-center gap-8 md:grid-cols-2">
      <div className="flex justify-center">
        <svg width="340" height="330" viewBox="0 0 340 330" className="max-w-full">
          {/* quorum outline */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke={hexToRgba(ACCENT, 0.12)} strokeWidth={1} />

          {/* leader -> follower heartbeat links, only once a leader exists */}
          {phase >= 4 &&
            pos.map((p, i) =>
              i === CANDIDATE ? null : (
                <line
                  key={`hb-${i}`}
                  x1={pos[CANDIDATE].x}
                  y1={pos[CANDIDATE].y}
                  x2={p.x}
                  y2={p.y}
                  stroke={hexToRgba(ACCENT, 0.22)}
                  strokeWidth={1}
                />
              )
            )}

          {/* RequestVote fan-out — driven by scroll */}
          {pos.map((p, i) =>
            i === CANDIDATE ? null : (
              <Packet
                key={`rv-${i}`}
                progress={progress}
                from={pos[CANDIDATE]}
                to={p}
                start={0.46 + i * 0.018}
                end={0.56 + i * 0.018}
                color={AMBER}
              />
            )
          )}

          {/* Granted votes travelling back */}
          {VOTERS.map((i, k) => (
            <Packet
              key={`vote-${i}`}
              progress={progress}
              from={pos[i]}
              to={pos[CANDIDATE]}
              start={0.64 + k * 0.03}
              end={0.75 + k * 0.03}
              color={ACCENT}
            />
          ))}

          {/* Steady-state AppendEntries heartbeats */}
          {phase >= 4 &&
            !reduced &&
            pos.map((p, i) =>
              i === CANDIDATE ? null : (
                <motion.g
                  key={`beat-${i}`}
                  initial={{ x: pos[CANDIDATE].x, y: pos[CANDIDATE].y }}
                  animate={{ x: [pos[CANDIDATE].x, p.x], y: [pos[CANDIDATE].y, p.y] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                >
                  <circle r={3} fill={ACCENT} />
                </motion.g>
              )
            )}

          {nodes.map((n, i) => (
            <RaftNode
              key={n.id}
              progress={progress}
              index={i}
              state={stateFor(i, phase)}
              nodeFill={nodeFill}
              followerStroke={followerStroke}
            />
          ))}

          <text x={CX} y={CY - 4} textAnchor="middle" className="font-mono" fontSize={10} fill="#52525b">
            term
          </text>
          <text x={CX} y={CY + 12} textAnchor="middle" className="font-mono" fontSize={14} fill={ACCENT}>
            {term}
          </text>
        </svg>
      </div>

      <div className="relative min-h-[220px]">
        <Phase progress={progress} from={BOOT_AT} to={STEPS[0]} className="absolute inset-0">
          <Copy
            tag="term 7 · cold start"
            title="Five nodes come online"
            body="Every node boots as a follower with an empty log. Nobody is in charge — in Raft the cluster has to agree on that too."
          />
        </Phase>

        <Phase progress={progress} from={STEPS[0]} to={STEPS[1]} className="absolute inset-0">
          <Copy
            tag="term 7 · no leader"
            title="The election timeout"
            body="Followers wait for a heartbeat that never arrives. Whichever node's randomised timer fires first gets to campaign."
          />
        </Phase>

        <Phase progress={progress} from={STEPS[1]} to={STEPS[2]} className="absolute inset-0">
          <Copy
            tag="term 8 · candidate"
            title="systems requests votes"
            body="The systems node times out first, increments the term, votes for itself, and fans RequestVote RPCs out to every peer."
          />
        </Phase>

        <Phase progress={progress} from={STEPS[2]} to={STEPS[3]} className="absolute inset-0">
          <Copy
            tag="term 8 · 3 of 5"
            title="Quorum, not unanimity"
            body="Two peers grant their vote; with its own that is a majority. Raft never waits for everyone — the stragglers can be slow, or gone."
          />
        </Phase>

        <Phase progress={progress} from={STEPS[3]} to={1} className="absolute inset-0">
          <Copy
            tag="term 8 · leader elected"
            title="Low-level systems leads"
            body="AppendEntries heartbeats now stream from the leader. Ask the cluster what I do and it answers with one voice: systems and distributed infrastructure."
          />
        </Phase>
      </div>
    </div>
  );
}
