"use client";

/**
 * Scene 07 — enterprise AI under real constraints. The automation rail becomes an
 * ingestion path. Retrieval results must pass a group-membership gate: an
 * unauthorized request visibly stops there, and a draft only advances after
 * access checks and a human approval gate.
 */

import { motion, useTransform } from "framer-motion";
import { Ann, COBALT, GREEN, ORANGE, useRange } from "./kit";
import type { SceneVisualProps } from "./types";

const STORE = { x: 196, y: 156, w: 104, h: 92 };
const GATE = { x: 402, y: 202 };
const MODEL = { x: 500, y: 174, w: 134, h: 58 };

function Doc({ p, i, compact }: Readonly<{ p: SceneVisualProps["p"]; i: number; compact: boolean }>) {
  const a = 0.04 + i * 0.05;
  const b = a + 0.2;
  const x = useRange(p, a, b, 44, STORE.x - 22);
  const y = useRange(p, a, b, 96 + i * 44, 196);
  const opacity = useTransform(p, [a - 0.03, a, b - 0.05, b], [0, 1, 1, 0], { clamp: true });
  return (
    <motion.g style={{ x, y, opacity }}>
      <rect width={compact ? 16 : 20} height={16} fill="none" stroke="currentColor" strokeWidth={0.9} opacity={0.6} />
      <line x1={4} y1={5} x2={14} y2={5} stroke="currentColor" strokeWidth={0.7} opacity={0.5} />
      <line x1={4} y1={9} x2={12} y2={9} stroke="currentColor" strokeWidth={0.7} opacity={0.5} />
    </motion.g>
  );
}

function IndexRow({ p, i }: Readonly<{ p: SceneVisualProps["p"]; i: number }>) {
  const width = useRange(p, 0.26 + i * 0.03, 0.46 + i * 0.03, 0, 72 - i * 8);
  return (
    <motion.rect x={STORE.x + 10} y={STORE.y + 12 + i * 13} height={5} fill={COBALT} style={{ width }} />
  );
}

const COMPACT_CHAIN = [
  ["APPROVED SOURCES", COBALT],
  ["MEMBERSHIP + RETRIEVAL", COBALT],
  ["DRAFT ANSWER", "currentColor"],
  ["HUMAN GATE", ORANGE],
  ["FEEDBACK / EVALUATION", GREEN],
] as const;

function CompactRag({ p }: Readonly<{ p: SceneVisualProps["p"] }>) {
  const trace = useRange(p, 0.04, 0.8, 0, 1);
  const support = useRange(p, 0.7, 0.94, 0, 1);
  return (
    <g>
      <Ann x={118} y={34} size={12} color={ORANGE}>PROOF OF CONCEPT · HUMAN CONTROLLED</Ann>
      <motion.line x1={146} y1={56} x2={146} y2={316} stroke={COBALT} strokeWidth={2} style={{ pathLength: trace }} />
      {COMPACT_CHAIN.map(([label, color], index) => <CompactRagStep key={label} p={p} index={index} label={label} color={color} />)}
      <motion.g style={{ opacity: support }}>
        <line x1={118} y1={346} x2={562} y2={346} stroke="currentColor" strokeWidth={0.8} opacity={0.3} />
        <Ann x={118} y={372} size={10} color={COBALT}>PROTOTYPE · ENGINEERING ANALYTICS</Ann>
        <Ann x={118} y={390} size={9.5} opacity={0.64}>PYTHON BACKEND · ANGULAR FRONTEND BY OTHERS</Ann>
        <Ann x={118} y={422} size={10} color={COBALT}>PROTOTYPE · MULTILINGUAL VOICE RETRIEVAL</Ann>
        <Ann x={118} y={440} size={9.5} opacity={0.64}>COLLABORATIVE · CPU-ONLY · POLICY INFORMATION</Ann>
      </motion.g>
    </g>
  );
}

function CompactRagStep({ p, index, label, color }: Readonly<{ p: SceneVisualProps["p"]; index: number; label: string; color: string }>) {
  const opacity = useRange(p, 0.04 + index * 0.14, 0.22 + index * 0.14, 0, 1);
  const y = 52 + index * 60;
  return (
    <motion.g style={{ opacity }}>
      <circle cx={146} cy={y + 17} r={7} fill="var(--fde-paper)" stroke={color} strokeWidth={2} />
      <rect x={184} y={y} width={344} height={36} fill="none" stroke={color} strokeWidth={index === 3 ? 1.5 : 1} strokeDasharray={index === 3 ? "5 4" : undefined} />
      <Ann x={202} y={y + 24} size={13} color={color}>{label}</Ann>
    </motion.g>
  );
}

export function Scene07Rag({ p, compact }: Readonly<SceneVisualProps>) {
  const nDocs = compact ? 4 : 7;
  const store = useRange(p, 0.14, 0.34, 0, 1);
  const indexFill = useRange(p, 0.24, 0.5, 0, 1);

  const authorized = useRange(p, 0.5, 0.72, 0, 1);
  const authX = useTransform(authorized, [0, 1], [STORE.x + STORE.w, MODEL.x]);
  const blocked = useRange(p, 0.58, 0.74, 0, 1);
  const blockedX = useTransform(blocked, [0, 1], [STORE.x + STORE.w, GATE.x - 16]);
  const stop = useRange(p, 0.72, 0.82, 0, 1);
  const active = useRange(p, 0.78, 0.94, 0, 1);
  const modelStroke = useTransform(active, (v) => (v > 0.5 ? GREEN : "currentColor"));
  const indexOpacity = useTransform(indexFill, [0, 1], [0, 0.08]);
  const modelOpacity = useTransform(active, [0, 1], [0.4, 1]);

  if (compact) return <CompactRag p={p} />;

  return (
    <g>
      <Ann x={44} y={74} size={9} opacity={0.6}>
        approved conversations · scheduled ingestion
      </Ann>
      {Array.from({ length: nDocs }, (_, i) => (
        <Doc key={i} p={p} i={i} compact={compact} />
      ))}

      {/* vector store */}
      <motion.g style={{ opacity: store }}>
        <rect x={STORE.x} y={STORE.y} width={STORE.w} height={STORE.h} fill="none" stroke={COBALT} strokeWidth={1.1} />
        {[0, 1, 2, 3, 4].map((i) => (
          <IndexRow key={i} p={p} i={i} />
        ))}
        <motion.rect
          x={STORE.x}
          y={STORE.y}
          width={STORE.w}
          height={STORE.h}
          fill={COBALT}
          style={{ opacity: indexOpacity }}
        />
        <Ann x={STORE.x} y={STORE.y + STORE.h + 18} size={8} color={COBALT}>
          vector retrieval
        </Ann>
      </motion.g>

      {/* membership gate */}
      <g>
        <line x1={GATE.x} y1={112} x2={GATE.x} y2={344} stroke="currentColor" strokeWidth={0.9} opacity={0.35} strokeDasharray="4 5" />
        <path
          d={`M ${GATE.x} ${GATE.y - 18} l 18 18 l -18 18 l -18 -18 Z`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.7}
        />
        <Ann x={GATE.x} y={368} size={8} anchor="middle" opacity={0.7}>
          group-membership authorization
        </Ann>
      </g>

      {/* authorized request reaches the model */}
      <motion.g style={{ opacity: authorized }}>
        <line x1={STORE.x + STORE.w} y1={202} x2={MODEL.x} y2={202} stroke={GREEN} strokeWidth={1.2} />
      </motion.g>
      <motion.circle r={4} cy={202} fill={GREEN} style={{ cx: authX, opacity: authorized }} />

      {/* unauthorized request stops at the gate */}
      <motion.line
        x1={STORE.x + STORE.w}
        y1={286}
        x2={GATE.x - 12}
        y2={286}
        stroke={ORANGE}
        strokeWidth={1}
        strokeDasharray="4 5"
        style={{ opacity: blocked }}
      />
      <motion.circle r={4} cy={286} fill={ORANGE} style={{ cx: blockedX, opacity: blocked }} />
      <motion.g style={{ opacity: stop }}>
        <line x1={GATE.x - 12} y1={272} x2={GATE.x - 12} y2={300} stroke={ORANGE} strokeWidth={2} />
        <Ann x={GATE.x - 22} y={290} size={8} anchor="end" color={ORANGE}>
          not a member · stopped
        </Ann>
      </motion.g>

      {/* model node, active only after retrieval + authorization */}
      <motion.rect
        x={MODEL.x}
        y={MODEL.y}
        width={MODEL.w}
        height={MODEL.h}
        fill="none"
        strokeWidth={1.2}
        style={{ stroke: modelStroke, opacity: modelOpacity }}
      />
      <motion.g style={{ opacity: active }}>
        <Ann x={MODEL.x + 10} y={MODEL.y + 30} size={9} color={GREEN}>
          draft answer
        </Ann>
      </motion.g>
      <Ann x={MODEL.x} y={MODEL.y + MODEL.h + 20} size={8} color={ORANGE}>
        HUMAN GATE · PROOF OF CONCEPT
      </Ann>
      <motion.g style={{ opacity: active }}>
        <path d={`M ${MODEL.x + MODEL.w} 202 V 382 H ${STORE.x + 52} V ${STORE.y + STORE.h}`} fill="none" stroke={GREEN} strokeWidth={0.9} strokeDasharray="4 4" />
        <Ann x={MODEL.x + MODEL.w} y={374} size={8} anchor="end" color={GREEN}>feedback / evaluation</Ann>
        <Ann x={44} y={410} size={8} color={COBALT}>PROTOTYPE · ENGINEERING ANALYTICS · PYTHON BACKEND</Ann>
        <Ann x={44} y={430} size={8} color={COBALT}>PROTOTYPE · MULTILINGUAL VOICE RETRIEVAL · COLLABORATIVE</Ann>
      </motion.g>
    </g>
  );
}
