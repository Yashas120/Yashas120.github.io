"use client";

/**
 * The persistent control-plane visualization.
 *
 * This is ONE system, not seven illustrations. Composition:
 *
 *   ANCHOR ZONE (top)  — the control plane plate and its single status line. Drawn
 *                        once, never unmounted, present in every chapter. This is
 *                        what makes the story feel continuous.
 *   BODY ZONE (below)  — the subsystem currently under discussion. Each chapter
 *                        draws here and clears out again, so no two chapters ever
 *                        overlap and nothing collides with the anchor.
 *
 * Everything is derived from one scroll MotionValue through `useTransform`: no
 * timers, no requestAnimationFrame, no infinite animation, no per-frame React
 * state. Scrolling up reverses every state. Passing a constant progress value
 * renders a completely static diagram, which is what reduced motion does.
 *
 * The visual carries no facts: no counts, no durations, no timestamps, no logs,
 * no costs. Every figure lives in the copy column.
 */

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";
import { CHAPTERS, colors, stageFor } from "./tokens";
import {
  events as eventsCopy,
  infrastructure as infraCopy,
  reliability as reliabilityCopy,
} from "@/data/backend";

const MONO = {
  fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
  letterSpacing: "0.06em",
};

/* ------------------------------------------------------------------ helpers */

function useLocal(p: MotionValue<number>, index: number) {
  const { start, end } = CHAPTERS[index];
  return useTransform(p, [start, end], [0, 1], { clamp: true });
}

function useSub(p: MotionValue<number>, a: number, b: number, from = 0, to = 1) {
  return useTransform(p, [a, b], [from, to], { clamp: true });
}

/** Fade a group in across [a,b], optionally back out across [c,d]. */
function Phase({
  p,
  a,
  b,
  c,
  d,
  children,
}: Readonly<{
  p: MotionValue<number>;
  a: number;
  b: number;
  c?: number;
  d?: number;
  children: ReactNode;
}>) {
  const stops = c !== undefined && d !== undefined ? [a, b, c, d] : [a, b, 2, 2.001];
  const opacity = useTransform(p, stops, [0, 1, 1, 0], { clamp: true });
  return <motion.g style={{ opacity }}>{children}</motion.g>;
}

/** A chapter's body-zone layer: visible only while that chapter is on screen. */
function Layer({
  p,
  index,
  children,
}: Readonly<{ p: MotionValue<number>; index: number; children: ReactNode }>) {
  const { start, end } = CHAPTERS[index];
  const len = end - start;
  const first = index === 0;
  const last = index === CHAPTERS.length - 1;
  const opacity = useTransform(
    p,
    [
      first ? -1 : start - len * 0.04,
      first ? -0.999 : start + len * 0.1,
      last ? 2 : end - len * 0.05,
      last ? 2.001 : end + len * 0.02,
    ],
    [0, 1, 1, 0],
    { clamp: true }
  );
  return <motion.g style={{ opacity }}>{children}</motion.g>;
}

function Ann({
  x,
  y,
  children,
  size = 11,
  fill = colors.muted,
  anchor = "start",
}: Readonly<{
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  fill?: string;
  anchor?: "start" | "middle" | "end";
}>) {
  return (
    <text x={x} y={y} fontSize={size} textAnchor={anchor} fill={fill} style={MONO}>
      {children}
    </text>
  );
}

function Plate({
  x,
  y,
  w,
  h,
  label,
  stroke = colors.line,
  fill = colors.raised,
  labelFill = colors.text,
  size = 11,
  dashed = false,
}: Readonly<{
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  stroke?: string;
  fill?: string;
  labelFill?: string;
  size?: number;
  dashed?: boolean;
}>) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        fill={fill}
        stroke={stroke}
        strokeWidth={1}
        strokeDasharray={dashed ? "3 3" : undefined}
      />
      {label && (
        <Ann x={x + w / 2} y={y + h / 2 + 4} anchor="middle" size={size} fill={labelFill}>
          {label}
        </Ann>
      )}
    </g>
  );
}

/** State marker: a distinct glyph per state, so colour is never load-bearing. */
function Mark({
  x,
  y,
  state,
  r = 5,
}: Readonly<{ x: number; y: number; state: "healthy" | "active" | "review" | "failed"; r?: number }>) {
  const c = {
    healthy: colors.healthy,
    active: colors.active,
    review: colors.warning,
    failed: colors.failure,
  }[state];
  if (state === "healthy")
    return (
      <path
        d={`M${x - r} ${y} l${r * 0.8} ${r * 0.8} l${r * 1.3} ${-r * 1.7}`}
        fill="none"
        stroke={c}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    );
  if (state === "review")
    return (
      <path
        d={`M${x} ${y - r} L${x + r} ${y + r * 0.75} L${x - r} ${y + r * 0.75} Z`}
        fill="none"
        stroke={c}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    );
  if (state === "failed")
    return (
      <g stroke={c} strokeWidth={1.7} strokeLinecap="round">
        <line x1={x - r * 0.7} y1={y - r * 0.7} x2={x + r * 0.7} y2={y + r * 0.7} />
        <line x1={x + r * 0.7} y1={y - r * 0.7} x2={x - r * 0.7} y2={y + r * 0.7} />
      </g>
    );
  return <circle cx={x} cy={y} r={r * 0.7} fill={c} />;
}

function Draw({
  d,
  p,
  len,
  a,
  b,
  stroke = colors.active,
  width = 1.2,
  opacity = 1,
}: Readonly<{
  d: string;
  p: MotionValue<number>;
  len: number;
  a: number;
  b: number;
  stroke?: string;
  width?: number;
  opacity?: number;
}>) {
  const offset = useSub(p, a, b, len, 0);
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      opacity={opacity}
      strokeDasharray={len}
      style={{ strokeDashoffset: offset }}
    />
  );
}

/** An envelope in motion. Every envelope corresponds to a real message state. */
function Envelope({
  p,
  from,
  to,
  a,
  b,
  fill = colors.active,
  size = 10,
}: Readonly<{
  p: MotionValue<number>;
  from: [number, number];
  to: [number, number];
  a: number;
  b: number;
  fill?: string;
  size?: number;
}>) {
  const x = useSub(p, a, b, from[0], to[0]);
  const y = useSub(p, a, b, from[1], to[1]);
  const opacity = useTransform(p, [a - 0.03, a, b, b + 0.03], [0, 1, 1, 0], { clamp: true });
  return (
    <motion.g style={{ x, y, opacity }}>
      <rect x={-size / 2} y={-size * 0.36} width={size} height={size * 0.72} rx={1} fill={fill} />
      <path
        d={`M${-size / 2} ${-size * 0.36} L0 ${size * 0.08} L${size / 2} ${-size * 0.36}`}
        fill="none"
        stroke={colors.canvas}
        strokeWidth={1}
      />
    </motion.g>
  );
}

/* --------------------------------------------------------------- geometry */

/**
 * Zone layout. The anchor occupies the top; every chapter draws inside the body
 * zone and nowhere else. This is what keeps chapters from colliding with the
 * persistent control plane or with each other.
 */
function geometry(mobile: boolean) {
  const s = stageFor(mobile);
  const cx = s.w / 2;
  const core = mobile ? { w: 152, h: 32 } : { w: 190, h: 54 };
  const coreY = mobile ? 2 : 20;
  const statusY = coreY + core.h + (mobile ? 15 : 22);
  const body = { top: statusY + (mobile ? 14 : 26), bottom: s.h - (mobile ? 6 : 14) };
  return { s, cx, core, coreY, statusY, body, mobile };
}

type Geo = ReturnType<typeof geometry>;

/* ---------------------------------------------------------- anchor: core */

function Core({ p, g }: Readonly<{ p: MotionValue<number>; g: Geo }>) {
  const { cx, core, coreY, mobile, s } = g;

  const stroke = useTransform(
    p,
    [0, 0.05, 0.9, 1],
    [colors.line, colors.active, colors.active, colors.healthy]
  );
  const glow = useTransform(p, [0, 0.1, 0.9, 1], [0.1, 0.2, 0.18, 0.28]);
  const glowFill = useTransform(p, [0, 0.88, 1], [colors.active, colors.active, colors.healthy]);

  return (
    <g>
      {/* subtle radial light behind the active system */}
      <motion.circle
        cx={cx}
        cy={coreY + core.h / 2}
        r={mobile ? 120 : 180}
        style={{ opacity: glow, fill: glowFill }}
        filter="url(#bk-soft)"
      />
      <motion.rect
        x={cx - core.w / 2}
        y={coreY}
        width={core.w}
        height={core.h}
        rx={6}
        fill={colors.surface}
        strokeWidth={1.4}
        style={{ stroke }}
      />
      <Ann x={cx} y={coreY + core.h / 2 + 4} anchor="middle" size={mobile ? 11 : 12} fill={colors.text}>
        control plane
      </Ann>
      <Status p={p} g={g} />
      {/* a hairline separating the persistent anchor from the chapter body */}
      <line
        x1={mobile ? 10 : 30}
        y1={g.body.top - (mobile ? 10 : 14)}
        x2={s.w - (mobile ? 10 : 30)}
        y2={g.body.top - (mobile ? 10 : 14)}
        stroke={colors.line}
        strokeWidth={1}
        strokeOpacity={0.6}
      />
    </g>
  );
}

/** The single status line. A categorical state word, never a metric. */
function Status({ p, g }: Readonly<{ p: MotionValue<number>; g: Geo }>) {
  const phases = [
    { label: "idle", a: -0.02, b: 0.035, color: colors.muted },
    { label: "request received", a: 0.035, b: 0.12, color: colors.active },
    { label: "reconciling", a: 0.12, b: 0.26, color: colors.active },
    { label: "plan · review · apply", a: 0.26, b: 0.44, color: colors.active },
    { label: "events in flight", a: 0.44, b: 0.61, color: colors.active },
    { label: "observing", a: 0.61, b: 0.77, color: colors.active },
    { label: "steady", a: 0.77, b: 0.91, color: colors.healthy },
    { label: "healthy · desired state reached", a: 0.91, b: 1.02, color: colors.healthy },
  ];
  return (
    <g>
      {phases.map((ph, i) => (
        <StatusWord
          key={ph.label}
          p={p}
          phase={ph}
          x={g.cx}
          y={g.statusY}
          last={i === phases.length - 1}
          size={g.mobile ? 12 : 11.5}
        />
      ))}
    </g>
  );
}

function StatusWord({
  p,
  phase,
  x,
  y,
  last,
  size,
}: Readonly<{
  p: MotionValue<number>;
  phase: { label: string; a: number; b: number; color: string };
  x: number;
  y: number;
  last: boolean;
  size: number;
}>) {
  const span = phase.b - phase.a;
  const opacity = useTransform(
    p,
    [
      phase.a,
      phase.a + span * 0.12,
      last ? 2 : phase.b - span * 0.12,
      last ? 2.001 : phase.b,
    ],
    [0, 1, 1, 0],
    { clamp: true }
  );
  return (
    <motion.g style={{ opacity }}>
      <Ann x={x} y={y} anchor="middle" size={size} fill={phase.color}>
        {phase.label}
      </Ann>
    </motion.g>
  );
}

/* ------------------------------------------------- chapter 1: the request */

function HeroLayer({ p, g }: Readonly<{ p: MotionValue<number>; g: Geo }>) {
  const t = useLocal(p, 0);
  const { cx, core, coreY, body, mobile } = g;

  // six inactive infrastructure nodes, in the body zone
  const nodes = mobile
    ? ["compute", "data", "queue", "identity", "delivery", "observe"]
    : ["compute", "data", "messaging", "identity", "delivery", "observability"];
  const cols = 3;
  const nw = mobile ? 112 : 190;
  const nh = mobile ? 30 : 38;
  const gapX = mobile ? 8 : 26;
  const gapY = mobile ? 12 : 28;
  const gridW = cols * nw + (cols - 1) * gapX;
  const x0 = cx - gridW / 2;
  const y0 = body.top + (mobile ? 30 : 70);

  const entry: [number, number] = [10, coreY + core.h / 2];
  const target: [number, number] = [cx - core.w / 2 - 12, coreY + core.h / 2];

  return (
    <Layer p={p} index={0}>
      {/* one request arrives and stays; it does not loop */}
      <Draw
        d={`M${entry[0]} ${entry[1]} L${target[0]} ${target[1]}`}
        p={t}
        len={Math.abs(target[0] - entry[0])}
        a={-0.02}
        b={0.5}
        stroke={colors.active}
        opacity={0.45}
      />
      <Envelope p={t} from={entry} to={target} a={-0.02} b={0.55} size={mobile ? 9 : 11} />
      <Phase p={t} a={-0.02} b={0.2}>
        <Ann x={entry[0] - 4} y={entry[1] - 14} size={mobile ? 13 : 11} fill={colors.active}>
          request
        </Ann>
      </Phase>
      <Phase p={t} a={0.55} b={0.72}>
        <Mark x={target[0] + 5} y={target[1]} state="active" r={4} />
      </Phase>

      {nodes.map((n, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = x0 + col * (nw + gapX);
        const y = y0 + row * (nh + gapY);
        // all six are present at rest and stay dim: they are context, and the
        // spec's initial state calls for them to be visible before any scrolling
        return (
          <Phase key={n} p={t} a={-0.12} b={-0.02}>
            <Plate x={x} y={y} w={nw} h={nh} label={n} stroke={colors.line} labelFill={colors.muted} size={mobile ? 13 : 11} />
          </Phase>
        );
      })}

      <Phase p={t} a={0.06} b={0.24}>
        <Ann x={x0} y={y0 - (mobile ? 10 : 16)} size={mobile ? 13 : 11} fill={colors.muted}>
          infrastructure · inactive
        </Ann>
      </Phase>
    </Layer>
  );
}

/* -------------------------------------------- chapter 2: system boundaries */

function ExperienceLayer({ p, g }: Readonly<{ p: MotionValue<number>; g: Geo }>) {
  const t = useLocal(p, 1);
  const { cx, core, coreY, body, mobile } = g;

  const boundaries = ["api", "infrastructure", "data", "observability"];
  const bw = mobile ? 170 : 200;
  const bh = mobile ? 30 : 42;
  const gapX = mobile ? 10 : 40;
  const gapY = mobile ? 12 : 34;
  const gridW = 2 * bw + gapX;
  const x0 = cx - gridW / 2;
  const y0 = body.top + (mobile ? 26 : 56);

  return (
    <Layer p={p} index={1}>
      {boundaries.map((b, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = x0 + col * (bw + gapX);
        const y = y0 + row * (bh + gapY);
        const a = 0.06 + i * 0.14;
        return (
          <g key={b}>
            {/* each boundary connects up to the same control plane */}
            <Draw
              d={`M${x + bw / 2} ${y} L${x + bw / 2} ${y - gapY / 2} L${cx} ${y - gapY / 2} L${cx} ${coreY + core.h}`}
              p={t}
              len={520}
              a={a + 0.05}
              b={a + 0.18}
              stroke={colors.active}
              opacity={0.32}
            />
            <Phase p={t} a={a} b={a + 0.12}>
              <Plate x={x} y={y} w={bw} h={bh} label={b} stroke={colors.active} labelFill={colors.text} size={mobile ? 13 : 11.5} />
            </Phase>
          </g>
        );
      })}

      {/* progression markers only; titles and dates live in the copy column */}
      <Phase p={t} a={0.62} b={0.78}>
        <line
          x1={x0}
          y1={body.bottom - (mobile ? 18 : 34)}
          x2={x0 + gridW}
          y2={body.bottom - (mobile ? 18 : 34)}
          stroke={colors.line}
          strokeWidth={1}
        />
        {["intern", "backend engineer", "sde ii"].map((label, i) => {
          const x = x0 + (gridW / 2) * i;
          return (
            <g key={label}>
              <circle cx={x} cy={body.bottom - (mobile ? 18 : 34)} r={3.5} fill={i === 1 ? colors.active : colors.muted} />
              <Ann
                x={x}
                y={body.bottom - (mobile ? 28 : 46)}
                anchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}
                size={mobile ? 12 : 10.5}
              >
                {label}
              </Ann>
            </g>
          );
        })}
      </Phase>
    </Layer>
  );
}

/* ------------------------------------------ chapter 3: infrastructure work */

/**
 * Five states, sequenced so that only one occupies the body zone at a time:
 * divergence → plan → human review → parallel apply → SDK delivery.
 */
function InfrastructureLayer({ p, g }: Readonly<{ p: MotionValue<number>; g: Geo }>) {
  const t = useLocal(p, 2);
  const { cx, body, mobile } = g;
  const top = body.top + (mobile ? 8 : 20);

  return (
    <Layer p={p} index={2}>
      {/* ---- A: current and desired state diverge ---- */}
      <Phase p={t} a={0} b={0.06} c={0.2} d={0.26}>
        <DivergeState p={t} g={g} top={top} />
      </Phase>

      {/* ---- B: the plan, categories only, never counts ---- */}
      <Phase p={t} a={0.22} b={0.28} c={0.4} d={0.46}>
        <PlanState p={t} g={g} top={top} categories={infraCopy.planCategories} />
      </Phase>

      {/* ---- C: human review; approval follows scrolling, no click required ---- */}
      <Phase p={t} a={0.42} b={0.48} c={0.58} d={0.64}>
        <ReviewState p={t} g={g} top={top} />
      </Phase>

      {/* ---- D: serial operations fan into parallel lanes ---- */}
      <Phase p={t} a={0.6} b={0.66} c={0.8} d={0.86}>
        <ApplyState p={t} g={g} top={top} />
      </Phase>

      {/* ---- E: one API change publishes two SDKs ---- */}
      <Phase p={t} a={0.84} b={0.9}>
        <SdkState p={t} g={g} top={top} note={infraCopy.sdkNote} />
      </Phase>
    </Layer>
  );
}

function DivergeState({ p, g, top }: Readonly<{ p: MotionValue<number>; g: Geo; top: number }>) {
  const { cx, mobile } = g;
  const w = mobile ? 160 : 210;
  const h = mobile ? 34 : 48;
  const gap = mobile ? 10 : 40;
  const leftX = cx - w - gap / 2;
  const rightX = cx + gap / 2;
  const driftL = useSub(p, 0.04, 0.16, 0, mobile ? -6 : -18);
  const driftR = useSub(p, 0.04, 0.16, 0, mobile ? 6 : 18);

  return (
    <g>
      <motion.g style={{ x: driftL }}>
        <Plate x={leftX} y={top} w={w} h={h} label="current state" stroke={colors.line} labelFill={colors.muted} size={mobile ? 13 : 11.5} />
      </motion.g>
      <motion.g style={{ x: driftR }}>
        <Plate x={rightX} y={top} w={w} h={h} label="desired state" stroke={colors.active} labelFill={colors.text} size={mobile ? 13 : 11.5} />
      </motion.g>
      <Phase p={p} a={0.1} b={0.18}>
        <Mark x={cx - 46} y={top + h + 22} state="review" r={4.5} />
        <Ann x={cx - 34} y={top + h + 26} size={mobile ? 13 : 11} fill={colors.warning}>
          difference detected
        </Ann>
      </Phase>
      {/* generic resource shapes: no product or internal service names */}
      <Phase p={p} a={0.12} b={0.2}>
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={rightX + 10 + i * (mobile ? 46 : 62)}
            y={top + h + (mobile ? 34 : 44)}
            width={mobile ? 40 : 48}
            height={mobile ? 18 : 22}
            rx={3}
            fill="none"
            stroke={colors.active}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        ))}
      </Phase>
    </g>
  );
}

function PlanState({
  p,
  g,
  top,
  categories,
}: Readonly<{ p: MotionValue<number>; g: Geo; top: number; categories: string[] }>) {
  const { cx, mobile } = g;
  const w = mobile ? 260 : 300;
  const x = cx - w / 2;
  const rowH = mobile ? 26 : 32;

  return (
    <g>
      <Ann x={x} y={top - 6} size={mobile ? 13 : 11} fill={colors.muted}>
        plan
      </Ann>
      {categories.map((cat, i) => {
        const y = top + 6 + i * rowH;
        const risky = cat === "Permissions";
        const a = 0.24 + i * 0.025;
        return (
          <Phase key={cat} p={p} a={a} b={a + 0.08}>
            <Plate
              x={x}
              y={y}
              w={w}
              h={rowH - 6}
              stroke={risky ? colors.warning : colors.line}
              fill={colors.raised}
            />
            <Ann x={x + 12} y={y + (mobile ? 14 : 17)} size={mobile ? 13 : 11.5} fill={risky ? colors.warning : colors.muted}>
              {cat.toLowerCase()}
            </Ann>
            {risky && <Mark x={x + w - 18} y={y + (mobile ? 10 : 13)} state="review" r={4} />}
          </Phase>
        );
      })}
    </g>
  );
}

function ReviewState({ p, g, top }: Readonly<{ p: MotionValue<number>; g: Geo; top: number }>) {
  const { cx, mobile } = g;
  const w = mobile ? 300 : 360;
  const x = cx - w / 2;
  const h = mobile ? 92 : 120;

  return (
    <g>
      <Plate x={x} y={top + 10} w={w} h={h} stroke={colors.warning} fill={colors.raised} />
      <Mark x={x + 22} y={top + 36} state="review" r={5} />
      <Ann x={x + 38} y={top + 40} size={mobile ? 13 : 11.5} fill={colors.warning}>
        {infraCopy.reviewFlag.toLowerCase()}
      </Ann>
      <Phase p={p} a={0.44} b={0.5} c={0.52} d={0.56}>
        <Ann x={x + 38} y={top + (mobile ? 60 : 66)} size={mobile ? 13 : 11.5} fill={colors.muted}>
          {infraCopy.reviewRequired.toLowerCase()}
        </Ann>
      </Phase>
      <Phase p={p} a={0.54} b={0.6}>
        <Mark x={x + 22} y={top + (mobile ? 56 : 62)} state="healthy" r={4.5} />
        <Ann x={x + 38} y={top + (mobile ? 60 : 66)} size={mobile ? 13 : 11.5} fill={colors.healthy}>
          {infraCopy.reviewCleared.toLowerCase()}
        </Ann>
      </Phase>
      <Ann x={x + 22} y={top + (mobile ? 84 : 96)} size={mobile ? 12 : 10.5} fill={colors.muted}>
        {mobile ? "a person decides first" : "a person decides before anything is applied"}
      </Ann>
    </g>
  );
}

function ApplyState({ p, g, top }: Readonly<{ p: MotionValue<number>; g: Geo; top: number }>) {
  const { cx, mobile } = g;
  const n = 5;
  const w = mobile ? 56 : 84;
  const h = mobile ? 24 : 30;
  const serialY = top + (mobile ? 26 : 40);

  return (
    <g>
      <Ann x={cx - (mobile ? 150 : 200)} y={top + 6} size={mobile ? 13 : 11} fill={colors.muted}>
        apply
      </Ann>
      {Array.from({ length: n }, (_, i) => (
        <ApplyOp key={i} p={p} i={i} n={n} w={w} h={h} serialY={serialY} g={g} />
      ))}
      <Phase p={p} a={0.74} b={0.8}>
        <Mark x={cx - (mobile ? 146 : 194)} y={serialY + (mobile ? 100 : 142)} state="healthy" r={4.5} />
        <Ann x={cx - (mobile ? 134 : 182)} y={serialY + (mobile ? 104 : 146)} size={mobile ? 13 : 11} fill={colors.healthy}>
          converged to desired state
        </Ann>
      </Phase>
    </g>
  );
}

function ApplyOp({
  p,
  i,
  n,
  w,
  h,
  serialY,
  g,
}: Readonly<{ p: MotionValue<number>; i: number; n: number; w: number; h: number; serialY: number; g: Geo }>) {
  const { cx, mobile } = g;
  const gap = mobile ? 5 : 10;
  const serialW = n * w + (n - 1) * gap;
  const serialX = cx - serialW / 2 + i * (w + gap);

  // three lanes on desktop, two on mobile. No durations, no timestamps.
  const lanes = mobile ? 2 : 3;
  const lane = i % lanes;
  const slot = Math.floor(i / lanes);
  const laneW = Math.ceil(n / lanes) * (w + gap) - gap;
  const parX = cx - laneW / 2 + slot * (w + gap);
  const parY = serialY + (mobile ? 30 : 44) + lane * (mobile ? 26 : 34);

  const x = useSub(p, 0.66, 0.74, serialX, parX);
  const y = useSub(p, 0.66, 0.74, serialY, parY);
  const stroke = useTransform(p, [0.7, 0.78], [colors.active, colors.healthy]);

  return (
    <motion.g style={{ x, y }}>
      <motion.rect width={w} height={h} rx={3} fill={colors.raised} strokeWidth={1} style={{ stroke }} />
      <Ann x={w / 2} y={h / 2 + 4} anchor="middle" size={mobile ? 12 : 10.5} fill={colors.muted}>
        {`res ${i + 1}`}
      </Ann>
    </motion.g>
  );
}

function SdkState({
  p,
  g,
  top,
  note,
}: Readonly<{ p: MotionValue<number>; g: Geo; top: number; note: string }>) {
  const { cx, mobile } = g;
  const stages = ["build", "package", "publish"];
  const stepW = mobile ? 78 : 104;
  const stepH = mobile ? 22 : 28;
  const specW = mobile ? 160 : 200;
  const rowY = [top + (mobile ? 44 : 70), top + (mobile ? 80 : 128)];
  const rowX = cx - (3 * stepW + 2 * 8) / 2;

  return (
    <g>
      <Plate x={cx - specW / 2} y={top + 4} w={specW} h={stepH} label="api spec change" stroke={colors.active} labelFill={colors.text} size={mobile ? 13 : 11} />
      {["python sdk", "java sdk"].map((branch, bi) => (
        <g key={branch}>
          <Draw
            d={`M${cx} ${top + 4 + stepH} L${cx} ${rowY[bi] - 10} L${rowX - 12} ${rowY[bi] - 10} L${rowX - 12} ${rowY[bi] + stepH / 2}`}
            p={p}
            len={400}
            a={0.86 + bi * 0.015}
            b={0.92 + bi * 0.015}
            stroke={colors.active}
            opacity={0.4}
          />
          <Ann x={rowX} y={rowY[bi] - 8} size={mobile ? 12 : 10.5} fill={colors.muted}>
            {branch}
          </Ann>
          {stages.map((st, si) => (
            <Phase key={st} p={p} a={0.76 + si * 0.025 + bi * 0.012} b={0.82 + si * 0.025 + bi * 0.012}>
              <Plate
                x={rowX + si * (stepW + 8)}
                y={rowY[bi]}
                w={stepW}
                h={stepH}
                label={st}
                stroke={si === 2 ? colors.healthy : colors.line}
                labelFill={si === 2 ? colors.healthy : colors.muted}
                size={mobile ? 12 : 10.5}
              />
            </Phase>
          ))}
        </g>
      ))}
      <Phase p={p} a={0.87} b={0.91}>
        <Mark x={mobile ? 10 : rowX + 6} y={rowY[1] + stepH + (mobile ? 16 : 24)} state="healthy" r={4.5} />
        <Ann
          x={mobile ? 22 : rowX + 18}
          y={rowY[1] + stepH + (mobile ? 20 : 28)}
          size={mobile ? 12 : 11}
          fill={colors.healthy}
        >
          {note.toLowerCase()}
        </Ann>
      </Phase>
    </g>
  );
}

/* ---------------------------------------------- chapter 4: event-driven */

/**
 * Write → stream → topic → two queues → two worker groups, with one worker
 * becoming unavailable, its message retained and retried, then both paths
 * acknowledged and complete. Every label is a real message state.
 */
function EventsLayer({ p, g }: Readonly<{ p: MotionValue<number>; g: Geo }>) {
  const t = useLocal(p, 3);
  const { cx, body, mobile } = g;
  const top = body.top + (mobile ? 6 : 22);

  const bw = mobile ? 100 : 124;
  const bh = mobile ? 24 : 30;

  // the producer chain runs across the top of the body zone
  const chainY = top;
  const chain = mobile
    ? [10, 130, 250]
    : [cx - 290, cx - 120, cx + 50];

  const laneY = [top + (mobile ? 62 : 104), top + (mobile ? 128 : 200)];
  const queueX = mobile ? 10 : cx - 250;
  const qw = mobile ? 150 : 190;
  const workerX = mobile ? 176 : cx + 20;

  return (
    <Layer p={p} index={3}>
      {/* write → stream → topic */}
      {["datastore", "stream", "topic"].map((label, i) => (
        <Phase key={label} p={t} a={0.02 + i * 0.06} b={0.1 + i * 0.06}>
          <Plate
            x={chain[i]}
            y={chainY}
            w={bw}
            h={bh}
            label={label}
            stroke={i === 0 ? colors.line : colors.active}
            labelFill={i === 0 ? colors.muted : colors.text}
            size={mobile ? 13 : 11}
          />
        </Phase>
      ))}
      <Envelope
        p={t}
        from={[chain[0] - 26, chainY + bh / 2]}
        to={[chain[0] + bw / 2, chainY + bh / 2]}
        a={0}
        b={0.1}
        size={mobile ? 8 : 10}
      />
      <Phase p={t} a={0.02} b={0.1}>
        <Ann x={chain[0]} y={chainY - 8} size={mobile ? 13 : 11} fill={colors.active}>
          write
        </Ann>
      </Phase>
      {[0, 1].map((i) => (
        <g key={i}>
          <Draw
            d={`M${chain[i] + bw} ${chainY + bh / 2} L${chain[i + 1]} ${chainY + bh / 2}`}
            p={t}
            len={Math.abs(chain[i + 1] - chain[i] - bw)}
            a={0.08 + i * 0.06}
            b={0.16 + i * 0.06}
            stroke={colors.active}
            opacity={0.5}
          />
          <Envelope
            p={t}
            from={[chain[i] + bw, chainY + bh / 2]}
            to={[chain[i + 1], chainY + bh / 2]}
            a={0.1 + i * 0.06}
            b={0.18 + i * 0.06}
            size={mobile ? 8 : 9}
          />
        </g>
      ))}
      <Phase p={t} a={0.16} b={0.24}>
        <Ann x={chain[2]} y={chainY - 8} size={mobile ? 13 : 11} fill={colors.muted}>
          fan-out
        </Ann>
      </Phase>

      {/* the topic fans out into two independent queues */}
      {[0, 1].map((i) => {
        const from: [number, number] = [chain[2] + bw / 2, chainY + bh];
        const to: [number, number] = [queueX + qw / 2, laneY[i] - bh / 2];
        return (
          <g key={i}>
            <Draw
              d={`M${from[0]} ${from[1]} C ${from[0]} ${from[1] + 30}, ${to[0]} ${to[1] - 40}, ${to[0]} ${to[1]}`}
              p={t}
              len={320}
              a={0.24 + i * 0.03}
              b={0.36 + i * 0.03}
              stroke={colors.active}
              opacity={0.45}
            />
            <Envelope p={t} from={from} to={to} a={0.28 + i * 0.03} b={0.4 + i * 0.03} size={mobile ? 8 : 9} />
          </g>
        );
      })}

      {[0, 1].map((i) => (
        <EventLane
          key={i}
          p={t}
          g={g}
          lane={i}
          y={laneY[i]}
          queueX={queueX}
          qw={qw}
          workerX={workerX}
          bh={bh}
        />
      ))}
    </Layer>
  );
}

function EventLane({
  p,
  g,
  lane,
  y,
  queueX,
  qw,
  workerX,
  bh,
}: Readonly<{
  p: MotionValue<number>;
  g: Geo;
  lane: number;
  y: number;
  queueX: number;
  qw: number;
  workerX: number;
  bh: number;
}>) {
  const { mobile } = g;
  const slow = lane === 1;
  const ww = mobile ? 174 : 150;
  const slots = mobile ? 3 : 4;
  const slotW = mobile ? 38 : 32;

  return (
    <g>
      {/* queue: depth is a shape, never a number */}
      <Phase p={p} a={0.32 + lane * 0.02} b={0.42 + lane * 0.02}>
        <Plate x={queueX} y={y - bh / 2} w={qw} h={bh} stroke={slow ? colors.warning : colors.line} fill={colors.raised} />
        <Ann x={queueX} y={y - bh / 2 - 6} size={mobile ? 12 : 10.5} fill={colors.muted}>
          {`queue ${lane + 1}`}
        </Ann>
      </Phase>
      {Array.from({ length: slots }, (_, i) => (
        <QueueSlot
          key={i}
          p={p}
          x={queueX + 10 + i * (slotW + 4)}
          y={y - 7}
          w={slotW}
          fillA={0.38 + i * 0.02}
          drainA={slow ? 0.84 + i * 0.02 : 0.54 + i * 0.02}
          color={slow ? colors.warning : colors.active}
        />
      ))}
      <Phase p={p} a={0.4} b={0.48} c={slow ? 0.6 : 0.54} d={slow ? 0.66 : 0.6}>
        <Ann x={queueX} y={y + bh / 2 + (mobile ? 18 : 16)} size={mobile ? 12 : 10.5} fill={slow ? colors.warning : colors.active}>
          queued
        </Ann>
      </Phase>

      {/* worker group */}
      <Phase p={p} a={0.44} b={0.52}>
        <Plate x={workerX} y={y - bh / 2} w={ww} h={bh} label={`workers ${lane + 1}`} stroke={colors.line} labelFill={colors.muted} size={mobile ? 12 : 10.5} />
      </Phase>
      <Draw
        d={`M${queueX + qw} ${y} L${workerX} ${y}`}
        p={p}
        len={Math.abs(workerX - queueX - qw)}
        a={0.46}
        b={0.54}
        stroke={colors.active}
        opacity={0.4}
      />

      {slow ? (
        <>
          <Phase p={p} a={0.56} b={0.62} c={0.74} d={0.8}>
            <Mark x={mobile ? workerX + 4 : workerX + ww + 14} y={mobile ? y + bh / 2 + 14 : y} state="failed" r={4.5} />
            <Ann x={mobile ? workerX + 16 : workerX + ww + 26} y={mobile ? y + bh / 2 + 18 : y + 4} size={mobile ? 12 : 10.5} fill={colors.failure}>
              unavailable
            </Ann>
          </Phase>
          <Phase p={p} a={0.62} b={0.68} c={0.78} d={0.84}>
            <Ann x={queueX} y={y + bh / 2 + (mobile ? 18 : 16)} size={mobile ? 12 : 10.5} fill={colors.failure}>
              retrying · message retained
            </Ann>
          </Phase>
          <Phase p={p} a={0.78} b={0.83} c={0.85} d={0.89}>
            <Mark x={mobile ? workerX + 4 : workerX + ww + 14} y={mobile ? y + bh / 2 + 14 : y} state="active" r={4} />
            <Ann x={mobile ? workerX + 16 : workerX + ww + 26} y={mobile ? y + bh / 2 + 18 : y + 4} size={mobile ? 12 : 10.5} fill={colors.active}>
              processing
            </Ann>
          </Phase>
        </>
      ) : (
        <Phase p={p} a={0.54} b={0.6} c={0.7} d={0.76}>
          <Mark x={mobile ? workerX + 4 : workerX + ww + 14} y={mobile ? y + bh / 2 + 14 : y} state="active" r={4} />
          <Ann x={mobile ? workerX + 16 : workerX + ww + 26} y={mobile ? y + bh / 2 + 18 : y + 4} size={mobile ? 12 : 10.5} fill={colors.active}>
            processing
          </Ann>
        </Phase>
      )}

      <Phase p={p} a={slow ? 0.86 : 0.74} b={slow ? 0.9 : 0.8}>
        <Mark x={mobile ? workerX + 4 : workerX + ww + 14} y={mobile ? y + bh / 2 + 14 : y} state="healthy" r={4.5} />
        <Ann x={mobile ? workerX + 16 : workerX + ww + 26} y={mobile ? y + bh / 2 + 18 : y + 4} size={mobile ? 12 : 10.5} fill={colors.healthy}>
          acknowledged
        </Ann>
      </Phase>
      <Phase p={p} a={0.88} b={0.92}>
        <Ann x={queueX} y={y + bh / 2 + (mobile ? 18 : 16)} size={mobile ? 12 : 10.5} fill={colors.healthy}>
          complete
        </Ann>
      </Phase>
    </g>
  );
}

function QueueSlot({
  p,
  x,
  y,
  w,
  fillA,
  drainA,
  color,
}: Readonly<{
  p: MotionValue<number>;
  x: number;
  y: number;
  w: number;
  fillA: number;
  drainA: number;
  color: string;
}>) {
  const fill = useTransform(p, [fillA, fillA + 0.03, drainA, drainA + 0.03], [0, 0.85, 0.85, 0], {
    clamp: true,
  });
  return (
    <g>
      <rect x={x} y={y} width={w} height={14} rx={2} fill="none" stroke={color} strokeWidth={0.8} strokeOpacity={0.3} />
      <motion.rect x={x} y={y} width={w} height={14} rx={2} fill={color} style={{ fillOpacity: fill }} />
    </g>
  );
}

/* --------------------------------------------- chapter 5: reliability */

function ReliabilityLayer({ p, g }: Readonly<{ p: MotionValue<number>; g: Geo }>) {
  const t = useLocal(p, 4);
  const { body, mobile } = g;
  const top = body.top + (mobile ? 6 : 24);

  return (
    <Layer p={p} index={4}>
      {/* performance: find the bottleneck, remove it */}
      <Phase p={t} a={0} b={0.06} c={0.32} d={0.38}>
        <TraceState p={t} g={g} top={top} />
      </Phase>

      {/* the four-step reliability loop, not four fabricated incident records */}
      <Phase p={t} a={0.36} b={0.42} c={0.58} d={0.64}>
        <LoopState p={t} g={g} top={top} loop={reliabilityCopy.loop} />
      </Phase>

      {/* staged authentication migration */}
      <Phase p={t} a={0.62} b={0.68}>
        <MigrationState p={t} g={g} top={top} />
      </Phase>
    </Layer>
  );
}

function TraceState({ p, g, top }: Readonly<{ p: MotionValue<number>; g: Geo; top: number }>) {
  const { cx, mobile } = g;
  const labelW = mobile ? 74 : 78;
  const full = mobile ? 250 : 380;
  const x = mobile ? 96 : cx - full / 2 + labelW / 2;
  const rowH = mobile ? 16 : 20;
  const gap = mobile ? 22 : 32;

  const spans = [
    { label: "api", from: 0.12, to: 0.12 },
    { label: "service", from: 0.2, to: 0.2 },
    { label: "database", from: 0.62, to: 0.24, hot: true },
  ];

  return (
    <g>
      <Ann x={mobile ? 10 : x} y={top - 8} size={mobile ? 12 : 11} fill={colors.muted}>
        {mobile ? "trace · relative span width" : "request trace · relative span width"}
      </Ann>
      {spans.map((sp, i) => (
        <TraceSpan key={sp.label} p={p} span={sp} i={i} spans={spans} x={x} y={top + i * gap} full={full} h={rowH} mobile={mobile} />
      ))}
      <Phase p={p} a={0.08} b={0.14} c={0.2} d={0.26}>
        <Mark x={mobile ? 16 : x} y={top + 3 * gap + 10} state="review" r={4.5} />
        <Ann x={(mobile ? 16 : x) + 14} y={top + 3 * gap + 14} size={mobile ? 12 : 11} fill={colors.warning}>
          bottleneck: data layer
        </Ann>
      </Phase>
      <Phase p={p} a={0.24} b={0.3}>
        <Mark x={mobile ? 16 : x} y={top + 3 * gap + 10} state="healthy" r={4.5} />
        <Ann x={(mobile ? 16 : x) + 14} y={top + 3 * gap + 14} size={mobile ? 12 : 11} fill={colors.healthy}>
          {mobile ? "fixed · page load −40%" : "path shortened · page load −40%"}
        </Ann>
      </Phase>
    </g>
  );
}

function TraceSpan({
  p,
  span,
  i,
  spans,
  x,
  y,
  full,
  h,
  mobile,
}: Readonly<{
  p: MotionValue<number>;
  span: { label: string; from: number; to: number; hot?: boolean };
  i: number;
  spans: { label: string; from: number; to: number; hot?: boolean }[];
  x: number;
  y: number;
  full: number;
  h: number;
  mobile: boolean;
}>) {
  const startFrom = spans.slice(0, i).reduce((a, s) => a + s.from, 0);
  const startTo = spans.slice(0, i).reduce((a, s) => a + s.to, 0);
  const sx = useSub(p, 0.14, 0.26, x + startFrom * full, x + startTo * full);
  const w = useSub(p, 0.14, 0.26, span.from * full, span.to * full);
  // the span only turns healthy after the amber warning has cleared, so the
  // diagram never shows "degraded" and "fixed" at the same time
  const fixed = useSub(p, 0.22, 0.3, 0, 1);

  return (
    <g>
      <Ann x={x - 10} y={y + h / 2 + 4} anchor="end" size={mobile ? 13 : 11} fill={colors.muted}>
        {span.label}
      </Ann>
      <rect x={x} y={y} width={full} height={h} rx={2} fill={colors.raised} />
      <motion.rect y={y} height={h} rx={2} fill={span.hot ? colors.warning : colors.active} style={{ x: sx, width: w }} />
      {span.hot && <motion.rect y={y} height={h} rx={2} fill={colors.healthy} style={{ x: sx, width: w, opacity: fixed }} />}
    </g>
  );
}

function LoopState({
  p,
  g,
  top,
  loop,
}: Readonly<{ p: MotionValue<number>; g: Geo; top: number; loop: string[] }>) {
  const { cx, mobile } = g;
  const w = mobile ? 168 : 150;
  const h = mobile ? 28 : 36;
  const gapX = mobile ? 10 : 30;
  const gapY = mobile ? 10 : 26;
  const x0 = cx - (2 * w + gapX) / 2;

  return (
    <g>
      {loop.map((step, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = x0 + col * (w + gapX);
        const y = top + 10 + row * (h + gapY);
        const a = 0.38 + i * 0.04;
        return (
          <Phase key={step} p={p} a={a} b={a + 0.08}>
            <Plate x={x} y={y} w={w} h={h} label={step.toLowerCase()} stroke={colors.active} labelFill={colors.text} size={mobile ? 13 : 11.5} />
            <Ann x={x + 8} y={y - 6} size={mobile ? 12 : 10} fill={colors.muted}>
              {`0${i + 1}`}
            </Ann>
          </Phase>
        );
      })}
      <Phase p={p} a={0.52} b={0.58}>
        <Ann x={x0} y={top + 10 + 2 * (h + gapY) + 18} size={mobile ? 13 : 11} fill={colors.muted}>
          recurrence prevented, not just recovered
        </Ann>
      </Phase>
    </g>
  );
}

function MigrationState({ p, g, top }: Readonly<{ p: MotionValue<number>; g: Geo; top: number }>) {
  const { cx, mobile } = g;
  const boxW = mobile ? 336 : 400;
  const boxX = cx - boxW / 2;
  const boxH = mobile ? 28 : 38;
  const oldY = top + (mobile ? 2 : 10);
  const newY = oldY + (mobile ? 92 : 150);

  return (
    <g>
      <Plate x={boxX} y={oldY} w={boxW} h={boxH} label="previous identity provider" stroke={colors.line} labelFill={colors.muted} size={mobile ? 13 : 11} />
      <Plate x={boxX} y={newY} w={boxW} h={boxH} label="new identity provider" stroke={colors.healthy} labelFill={colors.healthy} size={mobile ? 13 : 11} />
      {Array.from({ length: 7 }, (_, i) => (
        <MigratingNode key={i} p={p} i={i} boxX={boxX} boxW={boxW} oldY={oldY + boxH + (mobile ? 6 : 12)} newY={newY - (mobile ? 24 : 34)} mobile={mobile} />
      ))}
      <Phase p={p} a={0.89} b={0.93}>
        <Mark x={boxX + 6} y={newY + boxH + (mobile ? 16 : 22)} state="healthy" r={4.5} />
        <Ann x={boxX + 18} y={newY + boxH + (mobile ? 20 : 26)} size={mobile ? 12 : 11} fill={colors.healthy}>
          {mobile ? "7 of 7 · zero production impact" : "7 of 7 migrated · zero production impact"}
        </Ann>
      </Phase>
    </g>
  );
}

function MigratingNode({
  p,
  i,
  boxX,
  boxW,
  oldY,
  newY,
  mobile,
}: Readonly<{
  p: MotionValue<number>;
  i: number;
  boxX: number;
  boxW: number;
  oldY: number;
  newY: number;
  mobile: boolean;
}>) {
  const size = mobile ? 34 : 40;
  const h = mobile ? 20 : 26;
  const step = (boxW - 16) / 7;
  const x = boxX + 8 + i * step + (step - size) / 2;
  const a = 0.66 + i * 0.026;
  const y = useSub(p, a, a + 0.022, oldY, newY);
  const done = useSub(p, a + 0.016, a + 0.03);
  const stroke = useTransform(p, [a + 0.01, a + 0.03], [colors.active, colors.healthy]);

  return (
    <motion.g style={{ y }}>
      <motion.rect x={x} width={size} height={h} rx={3} fill={colors.surface} strokeWidth={1} style={{ stroke }} />
      <motion.g style={{ opacity: done }}>
        <Mark x={x + size / 2 - 3} y={h / 2} state="healthy" r={3.6} />
      </motion.g>
    </motion.g>
  );
}

/* ------------------------------------------------ chapter 6: projects */

function ProjectsLayer({ p, g }: Readonly<{ p: MotionValue<number>; g: Geo }>) {
  const t = useLocal(p, 5);
  const { body, mobile } = g;
  const top = body.top + (mobile ? 8 : 26);

  return (
    <Layer p={p} index={5}>
      {/* Cloud-Hack: containers under an orchestrator */}
      <Phase p={t} a={0} b={0.06} c={0.42} d={0.5}>
        <ContainerTopology p={t} g={g} top={top} />
      </Phase>
      {/* at the halfway point the topology morphs into a transaction pipeline */}
      <Phase p={t} a={0.5} b={0.58}>
        <TransactionPipeline p={t} g={g} top={top} />
      </Phase>
    </Layer>
  );
}

function ContainerTopology({ p, g, top }: Readonly<{ p: MotionValue<number>; g: Geo; top: number }>) {
  const { cx, mobile } = g;
  const w = mobile ? 164 : 170;
  const h = mobile ? 30 : 40;
  const gap = mobile ? 10 : 40;
  const leftX = cx - w - gap / 2;
  const rightX = cx + gap / 2;
  const orchW = mobile ? 338 : 380;

  return (
    <g>
      <Plate x={cx - orchW / 2} y={top} w={orchW} h={mobile ? 28 : 32} label="kubernetes manifests" stroke={colors.line} labelFill={colors.muted} size={mobile ? 13 : 11} />
      <Phase p={p} a={0.08} b={0.16}>
        <Plate x={leftX} y={top + (mobile ? 44 : 76)} w={w} h={h} label="flask app" stroke={colors.active} labelFill={colors.text} size={mobile ? 13 : 11.5} />
      </Phase>
      <Phase p={p} a={0.14} b={0.22}>
        <Plate x={rightX} y={top + (mobile ? 44 : 76)} w={w} h={h} label="mongodb" stroke={colors.active} labelFill={colors.text} size={mobile ? 13 : 11.5} />
      </Phase>
      <Draw
        d={`M${leftX + w} ${top + (mobile ? 59 : 96)} L${rightX} ${top + (mobile ? 59 : 96)}`}
        p={p}
        len={gap}
        a={0.2}
        b={0.28}
        stroke={colors.active}
        opacity={0.5}
      />
      <Phase p={p} a={0.26} b={0.34}>
        <Plate x={rightX} y={top + (mobile ? 92 : 152)} w={w} h={mobile ? 26 : 30} label="secret" stroke={colors.warning} labelFill={colors.warning} size={mobile ? 13 : 11} />
        <Draw
          d={`M${rightX + w / 2} ${top + (mobile ? 74 : 116)} L${rightX + w / 2} ${top + (mobile ? 92 : 152)}`}
          p={p}
          len={40}
          a={0.28}
          b={0.36}
          stroke={colors.warning}
          opacity={0.6}
        />
      </Phase>
      <Phase p={p} a={0.34} b={0.42}>
        <Ann x={cx - orchW / 2} y={top + (mobile ? 138 : 210)} size={mobile ? 12 : 11} fill={colors.muted}>
          {mobile
            ? "containerized · secret-backed"
            : "containerized · orchestrated · credentials from a secret"}
        </Ann>
      </Phase>
    </g>
  );
}

function TransactionPipeline({ p, g, top }: Readonly<{ p: MotionValue<number>; g: Geo; top: number }>) {
  const { cx, mobile } = g;
  const stages = ["transaction", "sha-256", "sign", "test network"];
  const w = mobile ? 164 : 180;
  const h = mobile ? 30 : 36;
  const gapX = mobile ? 10 : 32;
  const gapY = mobile ? 12 : 30;
  const x0 = cx - (2 * w + gapX) / 2;

  return (
    <g>
      {stages.map((st, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = x0 + col * (w + gapX);
        const y = top + row * (h + gapY);
        const last = i === stages.length - 1;
        const a = 0.56 + i * 0.06;
        return (
          <Phase key={st} p={p} a={a} b={a + 0.08}>
            <Plate
              x={x}
              y={y}
              w={w}
              h={h}
              label={st}
              stroke={last ? colors.healthy : colors.active}
              labelFill={last ? colors.healthy : colors.text}
              size={mobile ? 13 : 11.5}
            />
          </Phase>
        );
      })}
      <Phase p={p} a={0.86} b={0.94}>
        <Ann x={x0} y={top + 2 * (h + gapY) + 14} size={mobile ? 13 : 11} fill={colors.muted}>
          zero dependencies · signed and broadcast on the test network
        </Ann>
      </Phase>
    </g>
  );
}

/* ------------------------------------------------ chapter 7: converged */

function ContactLayer({ p, g }: Readonly<{ p: MotionValue<number>; g: Geo }>) {
  const t = useLocal(p, 6);
  const { cx, body, mobile } = g;
  const nodes = mobile
    ? ["compute", "data", "queue", "identity", "delivery", "observe"]
    : ["compute", "data", "messaging", "identity", "delivery", "observability"];
  const cols = 3;
  const nw = mobile ? 112 : 190;
  const nh = mobile ? 30 : 38;
  const gapX = mobile ? 8 : 26;
  const gapY = mobile ? 12 : 28;
  const gridW = cols * nw + (cols - 1) * gapX;
  const x0 = cx - gridW / 2;
  const y0 = body.top + (mobile ? 24 : 56);

  return (
    <Layer p={p} index={6}>
      {/* the same six nodes from the hero, now all healthy and quiet */}
      {nodes.map((n, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = x0 + col * (nw + gapX);
        const y = y0 + row * (nh + gapY);
        const a = 0.04 + i * 0.06;
        return (
          <Phase key={n} p={t} a={a} b={a + 0.14}>
            <Plate x={x} y={y} w={nw} h={nh} label={n} stroke={colors.healthy} labelFill={colors.text} size={mobile ? 13 : 11} />
            <Mark x={x + nw - 14} y={y + nh / 2} state="healthy" r={3.6} />
          </Phase>
        );
      })}
      <Phase p={t} a={0.6} b={0.75}>
        <Mark x={x0} y={y0 + 2 * (nh + gapY) + (mobile ? 12 : 24)} state="healthy" r={4.5} />
        <Ann x={x0 + 14} y={y0 + 2 * (nh + gapY) + (mobile ? 16 : 28)} size={mobile ? 12 : 11} fill={colors.healthy}>
          {mobile ? "current = desired · nothing in flight" : "current state = desired state · nothing in flight"}
        </Ann>
      </Phase>
    </Layer>
  );
}

/* ------------------------------------------------------------------ export */

export interface ControlPlaneVisualProps {
  /** Story progress across the whole page, 0→1. */
  progress: MotionValue<number>;
  /** Simplified vertical topology for narrow viewports. */
  mobile?: boolean;
  /** id of an external element describing the diagram (reduced motion). */
  describedBy?: string;
}

export function ControlPlaneVisual({
  progress,
  mobile = false,
  describedBy,
}: Readonly<ControlPlaneVisualProps>) {
  const g = geometry(mobile);
  const uid = mobile ? "m" : "d";
  const titleId = `bk-cp-title-${uid}`;
  const descId = describedBy ?? `bk-cp-desc-${uid}`;

  return (
    <svg
      viewBox={`0 0 ${g.s.w} ${g.s.h}`}
      // Mobile fits to the strip's HEIGHT: sizing by width made the diagram
      // taller than its container on wide-but-short viewports (768px), where it
      // drew straight over the copy.
      className={mobile ? "h-full max-w-full" : "h-auto w-full"}
      preserveAspectRatio={mobile ? "xMidYMax meet" : "xMidYMid meet"}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
    >
      <title id={titleId}>
        A control plane reconciling a declared desired state: request, plan, human review, parallel
        apply, event fan-out, observation, and a converged healthy state.
      </title>
      {!describedBy && (
        <desc id={descId}>
          A conceptual diagram. Every result, date and contribution it accompanies is written out in
          the adjacent text, so no information is available only here. {eventsCopy.textEquivalent}
        </desc>
      )}

      <defs>
        <filter id="bk-soft" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation={mobile ? 30 : 46} />
        </filter>
      </defs>

      <Core p={progress} g={g} />
      <HeroLayer p={progress} g={g} />
      <ExperienceLayer p={progress} g={g} />
      <InfrastructureLayer p={progress} g={g} />
      <EventsLayer p={progress} g={g} />
      <ReliabilityLayer p={progress} g={g} />
      <ProjectsLayer p={progress} g={g} />
      <ContactLayer p={progress} g={g} />
    </svg>
  );
}
