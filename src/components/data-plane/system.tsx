"use client";

/**
 * The persistent line-card system.
 *
 * This is the one topology the whole flagship story happens on: shared platform
 * software down through feature and provisioning logic, the hardware abstraction
 * layer, the C driver path, the CDR/firmware boundary and the optical hardware,
 * with client and trunk interfaces below it, configuration descending on the left
 * rail, telemetry and counters ascending on the right, and the traffic path held
 * along the bottom for the entire narrative.
 *
 * It is never unmounted between chapters. Chapters draw their own mechanism into
 * the panel region of the same coordinate space, and modulate this base through
 * `phase` — a continuous chapter-index value (0→8) derived from scroll. Because
 * every state is a pure function of `phase`, scrolling upward reverses exactly.
 *
 * The schematic explains real engineering relationships. It does not claim that
 * anyone's career is a device boot sequence.
 */

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Ann } from "./kit";
import { AMBER, CANVAS, CSTAGE, FAINT, FAULT, GRID, MUTED, RAISED, SIGNAL, STAGE, SURFACE, TEXT, VERIFIED } from "./palette";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Geo {
  box: { w: number; h: number };
  shared: Rect;
  feature: Rect;
  hal: Rect;
  driver: Rect;
  cdr: Rect;
  optical: Rect;
  client: Rect;
  trunk: Rect;
  rails: { configX: number; telemetryX: number; top: number; bottom: number };
  traffic: { x1: number; x2: number; y: number; amp: number };
  /** Where chapter mechanisms draw. */
  panel: Rect;
  f: { label: number; mono: number; tiny: number };
  compact: boolean;
}

const WIDE: Geo = {
  box: STAGE,
  shared: { x: 34, y: 26, w: 268, h: 44 },
  feature: { x: 34, y: 76, w: 268, h: 40 },
  hal: { x: 34, y: 122, w: 268, h: 36 },
  driver: { x: 34, y: 164, w: 268, h: 36 },
  cdr: { x: 34, y: 206, w: 268, h: 36 },
  optical: { x: 34, y: 248, w: 268, h: 72 },
  client: { x: 34, y: 332, w: 128, h: 32 },
  trunk: { x: 174, y: 332, w: 128, h: 32 },
  rails: { configX: 22, telemetryX: 314, top: 30, bottom: 324 },
  traffic: { x1: 34, x2: 686, y: 478, amp: 14 },
  panel: { x: 336, y: 26, w: 350, h: 400 },
  f: { label: 11, mono: 10, tiny: 9 },
  compact: false,
};

const COMPACT: Geo = {
  box: CSTAGE,
  shared: { x: 18, y: 6, w: 196, h: 28 },
  feature: { x: 18, y: 38, w: 196, h: 26 },
  hal: { x: 18, y: 68, w: 196, h: 24 },
  driver: { x: 18, y: 96, w: 196, h: 24 },
  cdr: { x: 18, y: 124, w: 196, h: 24 },
  optical: { x: 18, y: 152, w: 196, h: 42 },
  client: { x: 18, y: 200, w: 94, h: 24 },
  trunk: { x: 120, y: 200, w: 94, h: 24 },
  rails: { configX: 9, telemetryX: 222, top: 10, bottom: 196 },
  traffic: { x1: 14, x2: 346, y: 264, amp: 10 },
  panel: { x: 12, y: 296, w: 336, h: 236 },
  f: { label: 10, mono: 9.5, tiny: 8.6 },
  compact: true,
};

export function geoFor(compact: boolean): Geo {
  return compact ? COMPACT : WIDE;
}

/* ------------------------------------------------------------ base elements */

/** A layer plate whose stroke and fill are motion-driven. */
function Layer({
  r,
  geo,
  label,
  sub,
  stroke,
  fill,
  dash,
  opacity,
}: Readonly<{
  r: Rect;
  geo: Geo;
  label: string;
  sub?: string;
  stroke: MotionValue<string> | string;
  fill?: MotionValue<string> | string;
  dash?: MotionValue<string>;
  opacity?: MotionValue<number>;
}>) {
  const showSub = Boolean(sub) && !geo.compact;
  return (
    <motion.g style={{ opacity }}>
      <motion.rect
        x={r.x}
        y={r.y}
        width={r.w}
        height={r.h}
        rx={5}
        strokeWidth={1.2}
        style={{ stroke, fill: fill ?? RAISED, strokeDasharray: dash }}
      />
      <Ann x={r.x + 10} y={r.y + (showSub ? r.h / 2 - 2 : r.h / 2 + 3.5)} size={geo.f.label} color={TEXT}>
        {label}
      </Ann>
      {showSub && (
        <Ann x={r.x + 10} y={r.y + r.h / 2 + 11} size={geo.f.tiny} color={MUTED}>
          {sub}
        </Ann>
      )}
    </motion.g>
  );
}

/** A payload cycling along a rail. Its position is a function of scroll only. */
function RailDot({
  x,
  from,
  to,
  phase,
  color,
}: Readonly<{ x: number; from: number; to: number; phase: MotionValue<number>; color: string }>) {
  const t = useTransform(phase, (v) => {
    const f = ((v * 2.5) % 1 + 1) % 1;
    return f;
  });
  const cy = useTransform(t, (v) => from + (to - from) * v);
  const opacity = useTransform(t, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);
  return <motion.circle cx={x} r={2.8} fill={color} style={{ cy, opacity }} />;
}

function Rail({
  x,
  top,
  bottom,
  label,
  phase,
  color,
  up,
  geo,
  opacity,
}: Readonly<{
  x: number;
  top: number;
  bottom: number;
  label: string;
  phase: MotionValue<number>;
  color: string;
  up?: boolean;
  geo: Geo;
  opacity: MotionValue<number>;
}>) {
  const mid = (top + bottom) / 2;
  return (
    <motion.g style={{ opacity }}>
      <line x1={x} y1={top} x2={x} y2={bottom} stroke={GRID} strokeWidth={1} strokeDasharray="3 5" />
      <path
        d={up ? `M ${x - 3.5} ${top + 5} L ${x} ${top} L ${x + 3.5} ${top + 5}` : `M ${x - 3.5} ${bottom - 5} L ${x} ${bottom} L ${x + 3.5} ${bottom - 5}`}
        fill="none"
        stroke={color}
        strokeWidth={1.1}
        opacity={0.7}
      />
      <RailDot x={x} from={up ? bottom : top} to={up ? top : bottom} phase={phase} color={color} />
      <g transform={`rotate(${up ? 90 : -90} ${x} ${mid})`}>
        <Ann x={x} y={geo.compact ? x - 3 : x - 4} size={geo.f.tiny} color={FAINT} anchor="middle">
          {label}
        </Ann>
      </g>
    </motion.g>
  );
}

/** The traffic path: always present. Only continuity and colour change. */
function Traffic({ geo, phase, health, glowId }: Readonly<{ geo: Geo; phase: MotionValue<number>; health: MotionValue<number>; glowId: string }>) {
  const { x1, x2, y, amp } = geo.traffic;
  const span = x2 - x1;
  const periods = geo.compact ? 6 : 11;
  const seg = span / (periods * 2);
  let d = `M ${x1} ${y}`;
  for (let i = 0; i < periods * 2; i++) {
    d += ` Q ${x1 + seg * (i + 0.5)} ${y + (i % 2 === 0 ? -amp * 2 : amp * 2)} ${x1 + seg * (i + 1)} ${y}`;
  }
  const stroke = useTransform(health, [0, 0.5, 1], [FAULT, AMBER, SIGNAL]);
  const dash = useTransform(health, (v) => (v > 0.98 ? "0 0" : `${5 + 34 * v} ${9 * (1 - v)}`));
  const offset = useTransform(phase, (v) => -v * 46);
  const labelColor = useTransform(health, [0, 0.99, 1], [AMBER, AMBER, FAINT]);
  const label = useTransform(health, (v): string => (v > 0.98 ? "TRAFFIC PATH · CONTINUOUS" : "TRAFFIC PATH · DEGRADED"));

  return (
    <g>
      <motion.text
        x={x1}
        y={y - amp * 2 - 10}
        fontSize={geo.f.tiny}
        style={{ fontFamily: "var(--font-jetbrains), ui-monospace, monospace", letterSpacing: "0.1em", fill: labelColor }}
      >
        {label}
      </motion.text>
      <motion.path d={d} fill="none" strokeWidth={5} strokeOpacity={0.13} filter={`url(#${glowId})`} style={{ stroke }} />
      <motion.path
        d={d}
        fill="none"
        strokeWidth={1.7}
        strokeLinecap="round"
        style={{ stroke, strokeDasharray: dash, strokeDashoffset: offset }}
      />
    </g>
  );
}

/* ---------------------------------------------------------------- the base */

/**
 * `phase` is a continuous chapter index (0 → SLOTS-1). Base state is derived
 * from it so the persistent system responds to the story without any chapter
 * having to reach in and mutate it.
 */
export function LineCardBase({ geo, phase, idPrefix }: Readonly<{ geo: Geo; phase: MotionValue<number>; idPrefix: string }>) {
  const glowId = `${idPrefix}-glow`;
  const pcbId = `${idPrefix}-pcb`;
  const build = useTransform(phase, [0, 0.3], [0.25, 1], { clamp: true });

  // ch01: the platform-specific region is what changed on this platform
  const specific = useTransform(phase, [-0.2, 0.25, 0.95, 1.25], [0, 1, 1, 0], { clamp: true });
  // ch02: the final board materialises around an already-working software path
  const materialise = useTransform(phase, [1.05, 1.85], [0, 1], { clamp: true });
  // ch07 (phase 6→7): only the hardware and external SDK boundaries become test
  // doubles, and only for that chapter — ch08 is back on real hardware.
  const stub = useTransform(phase, [5.95, 6.3, 6.8, 7.1], [0, 1, 1, 0], { clamp: true });
  // ch09 (phase 8→9): a real failure, traced and then resolved
  const fault = useTransform(phase, [8.05, 8.3, 8.55, 8.8], [0, 1, 1, 0], { clamp: true });

  const health = useTransform(phase, [8.1, 8.3, 8.5, 8.75], [1, 0.34, 0.34, 1], { clamp: true });

  const specificStroke = useTransform(specific, [0, 1], [GRID, SIGNAL]);
  const sharedStroke = useTransform(specific, [0, 1], [GRID, "#1B2836"]);
  const sharedLabelOpacity = useTransform(specific, [0, 1], [1, 0.55]);

  const opticalStroke = useTransform([materialise, stub, fault] as MotionValue<number>[], ([m, s, fl]: number[]): string => {
    if (fl > 0.5) return FAULT;
    if (s > 0.5) return SIGNAL;
    return m > 0.5 ? VERIFIED : SIGNAL;
  });
  const opticalDash = useTransform(
    [materialise, stub] as MotionValue<number>[],
    ([m, s]: number[]): string => (s > 0.4 ? "5 5" : `${4 + 10 * m} ${6 * (1 - m)}`),
  );
  const opticalFill = useTransform(stub, (v): string => (v > 0.4 ? "rgba(18, 28, 38, 0.25)" : RAISED));
  const hardwareOpacity = useTransform(stub, [0, 1], [1, 0.45]);

  const cdrStroke = useTransform([stub, fault] as MotionValue<number>[], ([s, fl]: number[]): string => {
    if (fl > 0.5) return AMBER;
    return s > 0.5 ? SIGNAL : GRID;
  });
  const cdrDash = useTransform(stub, (v): string => (v > 0.4 ? "5 5" : "4 4"));

  const stubTag = useTransform(stub, [0.4, 0.8], [0, 1], { clamp: true });

  return (
    <g>
      <defs>
        <filter id={glowId} x="-20%" y="-140%" width="140%" height="380%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <pattern id={pcbId} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke={GRID} strokeOpacity={0.3} strokeWidth={0.6} />
        </pattern>
      </defs>

      <motion.rect x={0} y={0} width={geo.box.w} height={geo.box.h} fill={`url(#${pcbId})`} style={{ opacity: build }} />

      <motion.g style={{ opacity: build }}>
        <Rail
          x={geo.rails.configX}
          top={geo.rails.top}
          bottom={geo.rails.bottom}
          label="CONFIG"
          phase={phase}
          color={SIGNAL}
          geo={geo}
          opacity={build}
        />
        <Rail
          x={geo.rails.telemetryX}
          top={geo.rails.top}
          bottom={geo.rails.bottom}
          label="TELEMETRY"
          phase={phase}
          color={VERIFIED}
          up
          geo={geo}
          opacity={build}
        />
      </motion.g>

      {/* shared platform software — most of the architecture, built by many */}
      <motion.g style={{ opacity: sharedLabelOpacity }}>
        <Layer r={geo.shared} geo={geo} label="SHARED PLATFORM SW" sub="common base across cards" stroke={sharedStroke} />
        <Layer r={geo.hal} geo={geo} label="HAL" stroke={sharedStroke} />
      </motion.g>

      {/* the platform-specific region: what actually changed */}
      <Layer r={geo.feature} geo={geo} label="FEATURE / PROVISIONING" sub="lambda-split, resource maps" stroke={specificStroke} />
      <Layer r={geo.driver} geo={geo} label="C DRIVER PATH" stroke={specificStroke} />
      <Layer r={geo.cdr} geo={geo} label="CDR / FIRMWARE" sub="hardware boundary" stroke={cdrStroke} dash={cdrDash} />

      <Layer
        r={geo.optical}
        geo={geo}
        label="PLUGGABLES / OPTICAL"
        sub="line-card hardware"
        stroke={opticalStroke}
        fill={opticalFill}
        dash={opticalDash}
      />
      {/* optical ports, seated below the plate's label rather than under it */}
      {!geo.compact && (
        <motion.g style={{ opacity: hardwareOpacity }}>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={geo.optical.x + 12 + i * ((geo.optical.w - 24) / 4)}
              y={geo.optical.y + geo.optical.h - 15}
              width={(geo.optical.w - 24) / 4 - 10}
              height={10}
              rx={2}
              fill={SIGNAL}
              fillOpacity={0.08}
              stroke={GRID}
            />
          ))}
        </motion.g>
      )}
      <motion.g style={{ opacity: stubTag }}>
        <Ann x={geo.optical.x + geo.optical.w - 8} y={geo.optical.y + 13} size={geo.f.tiny} color={SIGNAL} anchor="end">
          test double
        </Ann>
      </motion.g>

      {/* client and trunk interfaces */}
      <motion.g style={{ opacity: build }}>
        <Layer r={geo.client} geo={geo} label="CLIENT" stroke={GRID} />
        <Layer r={geo.trunk} geo={geo} label="TRUNK" stroke={GRID} />
      </motion.g>

      <Traffic geo={geo} phase={phase} health={health} glowId={glowId} />

      {/* panel surface: chapters draw their mechanism inside this region */}
      <motion.rect
        x={geo.panel.x}
        y={geo.panel.y}
        width={geo.panel.w}
        height={geo.panel.h}
        rx={7}
        fill={SURFACE}
        fillOpacity={0.85}
        stroke={GRID}
        strokeWidth={1}
        style={{ opacity: build }}
      />
      <motion.rect
        x={geo.panel.x}
        y={geo.panel.y}
        width={geo.panel.w}
        height={geo.panel.h}
        rx={7}
        fill={CANVAS}
        fillOpacity={0.35}
        stroke="none"
        style={{ opacity: build }}
      />
    </g>
  );
}

/**
 * The phase that best represents chapter `i` at rest.
 *
 * The flow and static documents render one chapter per section with no scroll
 * range driving the base system, so they need a fixed phase. Mid-chapter is
 * right for most; two are tuned because their base state resolves late:
 * chapter 02's board has to have finished materialising, and chapter 09 must end
 * healthy rather than frozen mid-failure.
 */
export function restingPhase(index: number): number {
  if (index === 1) return 1.9;
  if (index === 8) return 8.9;
  return index + 0.5;
}

/** Panel-local helpers so chapters never hardcode the panel origin. */
export function panelBox(geo: Geo) {
  const { x, y, w, h } = geo.panel;
  return {
    x,
    y,
    w,
    h,
    left: x + (geo.compact ? 12 : 16),
    right: x + w - (geo.compact ? 12 : 16),
    top: y + (geo.compact ? 18 : 22),
    bottom: y + h - (geo.compact ? 12 : 16),
    cx: x + w / 2,
  };
}
