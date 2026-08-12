"use client";

import { motion, useTransform } from "framer-motion";
import type { Tone } from "@/lib/clusterTheme";
import { useTokens } from "../theme";
import { Box, Caption, Conn, Dot, Tag, useStep, type DiagramProps, type Step } from "./primitives";

const SVG = "h-full w-full";

/* ============ hero: request replication ============ */

function Replica({
  index,
  x,
  y,
  w,
  h,
  cx,
  cy,
  write,
  ack,
  tone,
}: Readonly<{ index: number; x: number; y: number; w: number; h: number; cx: number; cy: number; write: Step; ack: Step; tone?: Tone }>) {
  const t = useTokens(tone);
  const s = useStep(write, index * 0.14, 0.62 + index * 0.14);
  const a = useStep(ack, index * 0.14, 0.62 + index * 0.14);
  const mid = x + w / 2;
  const recA = useTransform(s, [0.7, 1], [0, 0.55]);
  const recB = useTransform(a, [0.4, 1], [0, 0.8]);
  return (
    <g>
      <Conn d={`M ${cx} ${cy + 24} L ${cx} ${y - 36} L ${mid} ${y - 36} L ${mid} ${y}`} step={s} color={t.blue} tone={tone} />
      <Box x={x} y={y} w={w} h={h} label={`replica ${index + 1}`} step={s} mono tone={tone} />
      {/* written record, then its acknowledgement — kept clear of the label */}
      <motion.rect x={x + 14} y={y + h / 2 + 16} width={w - 28} height={9} rx={2} fill={t.blue} style={{ opacity: recA }} />
      <motion.rect x={x + 14} y={y + h / 2 + 34} width={w - 28} height={9} rx={2} fill={t.green} style={{ opacity: recB }} />
      <Dot from={[mid, y - 8]} to={[cx, cy + 26]} step={a} color={t.green} r={4} tone={tone} />
    </g>
  );
}

export function ReplicationDiagram({ p, vertical, tone }: Readonly<DiagramProps>) {
  const t = useTokens(tone);
  const req = useStep(p, 0, 0.2);
  const coord = useStep(p, 0.14, 0.32);
  const write = useStep(p, 0.3, 0.58);
  const ack = useStep(p, 0.56, 0.84);
  const done = useStep(p, 0.86, 1);

  const cx = vertical ? 190 : 360;
  const cy = vertical ? 66 : 76;
  const cw = vertical ? 170 : 160;
  const y = vertical ? 210 : 214;
  const h = vertical ? 132 : 140;
  const w = vertical ? 96 : 122;
  const xs = vertical ? [16, 142, 268] : [126, 299, 472];

  return (
    <svg viewBox={vertical ? "0 0 380 430" : "0 0 720 420"} className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Caption x={vertical ? 190 : 58} y={vertical ? 20 : 40} text="write request" step={req} anchor={vertical ? "middle" : "start"} tone={tone} />
      <Dot from={vertical ? [190, 28] : [56, 76]} to={[cx, cy]} step={req} tone={tone} />
      <Box x={cx - cw / 2} y={cy - 24} w={cw} h={48} label="Coordinator" step={coord} accent={t.blue} tone={tone} />
      {xs.map((x, i) => (
        <Replica key={x} index={i} x={x} y={y} w={w} h={h} cx={cx} cy={cy} write={write} ack={ack} tone={tone} />
      ))}
      <line x1={cx - 96} y1={y + h + 22} x2={cx + 96} y2={y + h + 22} stroke={t.line} strokeWidth={1} />
      <Tag x={cx} y={y + h + 46} text="committed" step={done} color={t.green} tone={tone} />
    </svg>
  );
}

/* ============ backend: dependency DAG ============ */

function DepStage({
  index,
  label,
  x,
  y,
  w,
  from,
  parent,
  vertical,
  tone,
}: Readonly<{ index: number; label: string; x: number; y: number; w: number; from: [number, number]; parent: Step; vertical?: boolean; tone?: Tone }>) {
  const t = useTokens(tone);
  const s = useStep(parent, index * 0.28, 0.72 + index * 0.28);
  const d = vertical
    ? `M ${from[0]} ${from[1]} L ${from[0]} ${y + 20} L ${x} ${y + 20}`
    : `M ${from[0]} ${from[1]} L ${from[0] + 26} ${from[1]} L ${from[0] + 26} ${y + 20} L ${x} ${y + 20}`;
  return (
    <g>
      <Conn d={d} step={s} tone={tone} />
      <Box x={x} y={y} w={w} h={40} label={label} step={s} mono accent={t.green} tone={tone} />
    </g>
  );
}

export function DependencyDagDiagram({ p, vertical, tone }: Readonly<DiagramProps>) {
  const t = useTokens(tone);
  const parallel = useStep(p, 0.06, 0.4);
  const gate = useStep(p, 0.4, 0.62);
  const dependent = useStep(p, 0.6, 0.86);
  const result = useStep(p, 0.88, 1);

  const indep = ["network", "iam", "artifacts"];
  const dep = ["compute", "services"];

  const ix = vertical ? 115 : 70;
  const iw = 150;
  const irows = vertical ? [40, 100, 160] : [60, 150, 240];
  const gx = vertical ? 110 : 280;
  const gy = vertical ? 232 : 148;
  const gw = vertical ? 160 : 118;
  const dx = vertical ? 115 : 520;
  const drows = vertical ? [318, 378] : [60, 180];
  const gateFrom: [number, number] = vertical ? [190, 276] : [gx + gw, gy + 22];

  return (
    <svg viewBox={vertical ? "0 0 380 470" : "0 0 720 420"} className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Caption
        x={vertical ? 190 : ix}
        y={irows[0] - 16}
        text="independent — apply in parallel"
        step={parallel}
        anchor={vertical ? "middle" : "start"}
        tone={tone}
      />
      {indep.map((label, i) => (
        <Box key={label} x={ix} y={irows[i]} w={iw} h={40} label={label} step={parallel} mono accent={t.blue} tone={tone} />
      ))}

      <Conn
        d={vertical ? `M 190 ${irows[2] + 40} L 190 ${gy}` : `M ${ix + iw} ${irows[1] + 20} L ${gx} ${irows[1] + 20}`}
        step={gate}
        color={t.blue}
        tone={tone}
      />
      <Box x={gx} y={gy} w={gw} h={44} label="depends on" step={gate} tone={tone} />

      {dep.map((label, i) => (
        <DepStage key={label} index={i} label={label} x={dx} y={drows[i]} w={iw} from={gateFrom} parent={dependent} vertical={vertical} tone={tone} />
      ))}

      <Caption x={vertical ? 190 : 595} y={vertical ? 300 : 340} text="gated — waits for prerequisites" step={dependent} tone={tone} />
      <Tag x={vertical ? 190 : 360} y={vertical ? 448 : 398} text="deployment time reduced by ~50%" step={result} color={t.green} tone={tone} />
    </svg>
  );
}

/* ============ event-driven fan-out (inverted interlude) ============ */

function RegionLane({
  index,
  region,
  vertical,
  fan,
  consume,
  acks,
  tone,
}: Readonly<{ index: number; region: string; vertical?: boolean; fan: Step; consume: Step; acks: Step; tone?: Tone }>) {
  const t = useTokens(tone);
  const s = useStep(fan, index * 0.18, 0.66 + index * 0.18);
  const c = useStep(consume, index * 0.18, 0.66 + index * 0.18);
  const a = useStep(acks, index * 0.18, 0.66 + index * 0.18);

  if (vertical) {
    const x = 16 + index * 122;
    const mid = x + 52;
    return (
      <g>
        <Conn d={`M 190 174 L 190 212 L ${mid} 212 L ${mid} 236`} step={s} color={t.blue} tone={tone} />
        <Box x={x} y={236} w={104} h={42} label="SQS" sub={region} step={s} tone={tone} mono />
        <Conn d={`M ${mid} 278 L ${mid} 360`} step={c} tone={tone} />
        <Box x={x} y={360} w={104} h={40} label="service" step={c} tone={tone} />
        <Conn d={`M ${mid} 400 L ${mid} 470`} step={a} color={t.green} tone={tone} />
        <Box x={x} y={470} w={104} h={38} label="db" step={a} tone={tone} accent={t.green} mono />
      </g>
    );
  }

  const y = [80, 190, 300][index];
  return (
    <g>
      <Conn d={`M 298 190 L 316 190 L 316 ${y} L 340 ${y}`} step={s} color={t.blue} tone={tone} />
      <Box x={340} y={y - 21} w={112} h={42} label="SQS" sub={region} step={s} tone={tone} mono />
      <Conn d={`M 452 ${y} L 480 ${y}`} step={c} tone={tone} />
      <Box x={480} y={y - 20} w={104} h={40} label="service" step={c} tone={tone} />
      <Conn d={`M 584 ${y} L 610 ${y}`} step={a} color={t.green} tone={tone} />
      <Box x={610} y={y - 19} w={74} h={38} label="db" step={a} tone={tone} accent={t.green} mono />
    </g>
  );
}

export function EventFanoutDiagram({ p, vertical, tone }: Readonly<DiagramProps>) {
  const t = useTokens(tone);
  const write = useStep(p, 0, 0.18);
  const topic = useStep(p, 0.16, 0.36);
  const fan = useStep(p, 0.34, 0.62);
  const consume = useStep(p, 0.6, 0.82);
  const acks = useStep(p, 0.8, 1);
  const regions = ["us-east", "eu-west", "ap-south"];

  return (
    <svg viewBox={vertical ? "0 0 380 560" : "0 0 720 420"} className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Box
        x={vertical ? 110 : 40}
        y={vertical ? 40 : 168}
        w={vertical ? 160 : 118}
        h={44}
        label="DynamoDB"
        step={write}
        tone={tone}
        accent={t.blue}
        mono
      />
      <Conn d={vertical ? "M 190 84 L 190 130" : "M 158 190 L 190 190"} step={topic} color={t.blue} tone={tone} />
      <Box x={vertical ? 110 : 190} y={vertical ? 130 : 168} w={vertical ? 160 : 108} h={44} label="SNS" step={topic} tone={tone} accent={t.blue} mono />
      {regions.map((r, i) => (
        <RegionLane key={r} index={i} region={r} vertical={vertical} fan={fan} consume={consume} acks={acks} tone={tone} />
      ))}
      <Caption x={vertical ? 190 : 360} y={vertical ? 540 : 394} text="one change event, fanned out per region" step={acks} tone={tone} />
    </svg>
  );
}
