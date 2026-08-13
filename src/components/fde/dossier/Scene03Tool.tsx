"use client";

/**
 * Scene 03 — the specification becomes a deployed tool. The spine folds into the
 * outline of the Windows application, workflow strips pass through it and leave
 * as finished test plans, a two-day interval compresses to two hours, and users
 * only appear once the deployment has completed.
 */

import { motion, useTransform } from "framer-motion";
import { Ann, COBALT, GREEN, DrawLine, useRange } from "./kit";
import type { SceneVisualProps } from "./types";

const WIN = { x: 258, y: 92, w: 300, h: 214 };

function Passing({ p, i, n }: Readonly<{ p: SceneVisualProps["p"]; i: number; n: number }>) {
  const a = 0.3 + (i / n) * 0.42;
  const b = a + 0.2;
  const x = useRange(p, a, b, 32, 592);
  const y = 118 + i * (n > 6 ? 22 : 34);
  const opacity = useTransform(p, [a - 0.05, a, b - 0.02, b], [0, 1, 1, 0.9], { clamp: true });
  const done = useTransform(p, [a + 0.13, b], [0, 1], { clamp: true });
  const rawWidth = useTransform(x, (v) => (v > WIN.x + WIN.w ? 26 : 74));
  const color = useTransform(done, (d) => (d > 0.6 ? GREEN : "currentColor"));

  return (
    <motion.g style={{ x, opacity }}>
      <motion.rect y={y} height={2.5} style={{ width: rawWidth, fill: color }} />
    </motion.g>
  );
}

const COMPACT_STATES = [
  ["01 · SCHEMA", "COMPONENT → TEST → EXPECTED BEHAVIOR"],
  ["02 · GENERATED PLAN", "EXCEL TEST PLAN · FUNCTIONALLY VERIFIED"],
  ["03 · DEPLOYMENT + HANDOFF", "LOCAL WINDOWS + SSO · DOCS + KT"],
] as const;

function CompactTool({ p }: Readonly<{ p: SceneVisualProps["p"] }>) {
  const connector = useRange(p, 0.08, 0.78, 0, 1);
  const released = useRange(p, 0.72, 0.96, 0, 1);
  return (
    <g>
      <motion.line x1={340} y1={92} x2={340} y2={358} stroke={COBALT} strokeWidth={2} style={{ pathLength: connector }} />
      {COMPACT_STATES.map(([label, detail], index) => <CompactToolState key={label} p={p} index={index} label={label} detail={detail} />)}
      <motion.g style={{ opacity: released }}>
        <Ann x={132} y={414} size={14} color={GREEN}>VERIFIED · DEPLOYED · HANDED OFF</Ann>
      </motion.g>
    </g>
  );
}

function CompactToolState({ p, index, label, detail }: Readonly<{ p: SceneVisualProps["p"]; index: number; label: string; detail: string }>) {
  const opacity = useRange(p, 0.04 + index * 0.22, 0.28 + index * 0.22, 0, 1);
  const y = 48 + index * 118;
  return (
    <motion.g style={{ opacity }}>
      <rect x={126} y={y} width={428} height={82} fill="none" stroke={index === 2 ? GREEN : "currentColor"} strokeWidth={1.2} opacity={0.74} />
      <Ann x={150} y={y + 32} size={16} color={index === 2 ? GREEN : COBALT}>{label}</Ann>
      <Ann x={150} y={y + 58} size={11.5} opacity={0.64}>{detail}</Ann>
      {index < 2 ? <path d={`M 331 ${y + 91} l 9 10 l 9 -10`} fill="none" stroke={COBALT} strokeWidth={1.6} /> : null}
    </motion.g>
  );
}

export function Scene03Tool({ p, compact }: Readonly<SceneVisualProps>) {
  const n = compact ? 5 : 9;
  const perimeter = (WIN.w + WIN.h) * 2;
  const winFill = useRange(p, 0.14, 0.4, 0, 0.05);
  const chrome = useRange(p, 0.24, 0.46, 0, 1);

  // two days → two hours, as one interval closing on itself
  const barW = useRange(p, 0.56, 0.86, 560, 118);
  const barLabel = useTransform(p, [0.68, 0.74], [0, 1], { clamp: true });
  const beforeLabel = useTransform(p, [0.6, 0.68], [1, 0], { clamp: true });

  const users = useRange(p, 0.84, 0.99, 0, 1);

  if (compact) return <CompactTool p={p} />;

  return (
    <g>
      <motion.rect
        x={WIN.x}
        y={WIN.y}
        width={WIN.w}
        height={WIN.h}
        fill="currentColor"
        style={{ opacity: winFill }}
      />
      <DrawLine
        d={`M ${WIN.x} ${WIN.y} h ${WIN.w} v ${WIN.h} h ${-WIN.w} Z`}
        p={p}
        length={perimeter}
        a={0.06}
        b={0.42}
        width={1.1}
      />

      {/* application chrome: a restrained outline, not a screenshot */}
      <motion.g style={{ opacity: chrome }}>
        <line
          x1={WIN.x}
          y1={WIN.y + 26}
          x2={WIN.x + WIN.w}
          y2={WIN.y + 26}
          stroke="currentColor"
          strokeWidth={0.9}
          opacity={0.6}
        />
        <rect x={WIN.x + WIN.w - 18} y={WIN.y + 10} width={8} height={6} fill="currentColor" opacity={0.5} />
        <Ann x={WIN.x + 12} y={WIN.y + 18} size={9} opacity={0.7}>
          test-scope · windows · SSO
        </Ann>
        <Ann x={WIN.x + 12} y={WIN.y + WIN.h + 18} size={9} color={COBALT}>
          excel-backed knowledge store
        </Ann>
      </motion.g>

      {Array.from({ length: n }, (_, i) => (
        <Passing key={i} p={p} i={i} n={n} />
      ))}

      <motion.g style={{ opacity: chrome }}>
        <Ann x={32} y={84} size={8} opacity={0.55}>
          domain model in
        </Ann>
        <Ann x={648} y={84} size={8} anchor="end" color={GREEN}>
          verified test plan out
        </Ann>
      </motion.g>

      {/* interval compression */}
      <g transform="translate(60 384)">
        <motion.rect height={3} fill={COBALT} style={{ width: barW }} />
        <motion.g style={{ opacity: beforeLabel }}>
          <Ann x={0} y={-10} size={9} opacity={0.7}>
            scoping effort · ~2 days
          </Ann>
        </motion.g>
        <motion.g style={{ opacity: barLabel }}>
          <Ann x={0} y={-10} size={9} color={GREEN}>
            ~2 hours
          </Ann>
        </motion.g>
        <line x1={0} y1={-6} x2={0} y2={9} stroke="currentColor" strokeWidth={0.9} opacity={0.6} />
      </g>

      {/* adoption, only after the tool is deployed */}
      <motion.g style={{ opacity: users }}>
        {Array.from({ length: compact ? 8 : 16 }, (_, i) => (
          <circle
            key={i}
            cx={WIN.x + 12 + (i % (compact ? 5 : 12)) * 14}
            cy={332 + Math.floor(i / (compact ? 5 : 12)) * 13}
            r={2.4}
            fill={GREEN}
          />
        ))}
        <Ann x={WIN.x + 12} y={382} size={9} color={GREEN}>
          deployed · documented · still in use
        </Ann>
        {(["VERIFIED", "DEPLOYED", "HANDED OFF"] as const).map((label, index) => (
          <g key={label} transform={`translate(${258 + index * 104} 408)`}>
            <rect width={94} height={24} fill="none" stroke={GREEN} strokeWidth={1} />
            <Ann x={47} y={16} size={8} anchor="middle" color={GREEN}>{label}</Ann>
          </g>
        ))}
      </motion.g>
    </g>
  );
}
