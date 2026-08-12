"use client";

import { motion, useTransform } from "framer-motion";
import type { Tone } from "@/lib/clusterTheme";
import { useTokens } from "../theme";
import { Box, Caption, Conn, Dot, Tag, useStep, type DiagramProps, type Step } from "./primitives";

const SVG = "h-full w-full";

/* ============ ghOSt: scheduling policies over the same workload ============ */

function TaskBlock({
  index,
  x,
  y,
  parent,
  accent,
  vertical,
}: Readonly<{ index: number; x: number; y: number; parent: Step; accent: string; vertical?: boolean }>) {
  const s = useStep(parent, index * 0.2, 0.62 + index * 0.2);
  const w = vertical ? 26 : 44;
  const scaleX = useTransform(s, [0, 1], [0.1, 1]);
  const opacity = useTransform(s, [0, 0.3], [0, 1]);
  return (
    <motion.rect
      x={x}
      y={y}
      width={w}
      height={20}
      rx={3}
      fill={accent}
      fillOpacity={0.8}
      style={{ opacity, scaleX, transformOrigin: `${x}px ${y}px` }}
    />
  );
}

function SchedulerLane({
  index,
  name,
  y,
  x0,
  x1,
  parent,
  vertical,
  tone,
}: Readonly<{ index: number; name: string; y: number; x0: number; x1: number; parent: Step; vertical?: boolean; tone?: Tone }>) {
  const t = useTokens(tone);
  const s = useStep(parent, index * 0.1, 0.72 + index * 0.1);
  const spans = [
    [0.18, 0.42, 0.68], // CFS: interleaved
    [0.1, 0.52, 0.76], // FIFO: head-of-line
    [0.12, 0.3, 0.48], // ghOSt / Shinjuku: tighter dispatch
  ][index];
  const width = x1 - x0;

  return (
    <g>
      <text x={x0} y={y - 12} fontSize={12} fontFamily="var(--font-jetbrains), ui-monospace, monospace" fill={t.muted}>
        {name}
      </text>
      <line x1={x0} y1={y + 14} x2={x1} y2={y + 14} stroke={t.line} strokeWidth={1} />
      {spans.map((frac, j) => (
        <TaskBlock key={`${name}-${frac}`} index={j} x={x0 + width * frac} y={y} parent={s} accent={index === 2 ? t.blue : t.line} vertical={vertical} />
      ))}
    </g>
  );
}

export function SchedulingDiagram({ p, vertical, tone }: Readonly<DiagramProps>) {
  const t = useTokens(tone);
  const arrive = useStep(p, 0, 0.18);
  const lanes = useStep(p, 0.16, 0.86);
  const note = useStep(p, 0.86, 1);

  const x0 = vertical ? 26 : 120;
  const x1 = vertical ? 354 : 660;
  const rows = vertical ? [110, 220, 330] : [110, 210, 310];

  return (
    <svg viewBox={vertical ? "0 0 380 470" : "0 0 720 420"} className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Caption
        x={vertical ? 190 : 120}
        y={vertical ? 34 : 48}
        text="same workload enters each policy"
        step={arrive}
        anchor={vertical ? "middle" : "start"}
        tone={tone}
      />
      <Box x={vertical ? 130 : 120} y={vertical ? 46 : 58} w={vertical ? 120 : 150} h={34} label="workload" step={arrive} mono accent={t.blue} tone={tone} />
      {["CFS", "FIFO", "ghOSt / Shinjuku"].map((n, i) => (
        <SchedulerLane key={n} index={i} name={n} y={rows[i]} x0={x0} x1={x1} parent={lanes} vertical={vertical} tone={tone} />
      ))}
      <Caption x={vertical ? 190 : 390} y={vertical ? 420 : 386} text="queueing, dispatch and completion differ by policy" step={note} tone={tone} />
    </svg>
  );
}

/* ============ provisioning: constrained allocation ============ */

function ConstraintRow({
  index,
  label,
  value,
  x,
  y,
  w,
  parent,
  tone,
}: Readonly<{ index: number; label: string; value: string; x: number; y: number; w: number; parent: Step; tone?: Tone }>) {
  const s = useStep(parent, index * 0.24, 0.64 + index * 0.24);
  return <Box x={x} y={y} w={w} h={42} label={label} sub={value} step={s} mono tone={tone} />;
}

export function AllocationDiagram({ p, vertical, tone }: Readonly<DiagramProps>) {
  const t = useTokens(tone);
  const req = useStep(p, 0, 0.16);
  const checks = useStep(p, 0.14, 0.56);
  const accept = useStep(p, 0.56, 0.78);
  const reject = useStep(p, 0.78, 1);

  const rows = ["hardware inventory", "zone capacity", "project quota"];
  const vals = ["available", "within limit", "2 of 4 used"];

  if (vertical) {
    return (
      <svg viewBox="0 0 380 560" className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <Box x={100} y={30} w={180} h={44} label="VM request" step={req} mono accent={t.blue} tone={tone} />
        <Conn d="M 190 74 L 190 108" step={checks} color={t.blue} tone={tone} />
        {rows.map((r, i) => (
          <ConstraintRow key={r} index={i} label={r} value={vals[i]} x={70} y={108 + i * 62} w={240} parent={checks} tone={tone} />
        ))}
        <Conn d="M 190 294 L 190 330" step={accept} color={t.green} tone={tone} />
        <Box x={90} y={330} w={200} h={46} label="allocation committed" step={accept} accent={t.green} mono tone={tone} />
        <Conn d="M 190 376 L 190 424" step={reject} color={t.coral} dashed tone={tone} />
        <Box x={70} y={424} w={240} h={46} label="second request" sub="quota exhausted" step={reject} accent={t.coral} mono tone={tone} />
        <Tag x={190} y={504} text="rejected — constraint failed" step={reject} color={t.coral} tone={tone} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 720 420" className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Box x={40} y={186} w={140} h={46} label="VM request" step={req} mono accent={t.blue} tone={tone} />
      <Conn d="M 180 209 L 214 209" step={checks} color={t.blue} tone={tone} />
      {rows.map((r, i) => (
        <ConstraintRow key={r} index={i} label={r} value={vals[i]} x={214} y={122 + i * 62} w={210} parent={checks} tone={tone} />
      ))}
      <Conn d="M 424 209 L 470 209 L 470 150 L 500 150" step={accept} color={t.green} tone={tone} />
      <Box x={500} y={128} w={180} h={46} label="allocation committed" step={accept} accent={t.green} mono tone={tone} />
      <Conn d="M 424 209 L 470 209 L 470 280 L 500 280" step={reject} color={t.coral} dashed tone={tone} />
      <Box x={500} y={258} w={180} h={46} label="request rejected" sub="quota exhausted" step={reject} accent={t.coral} mono tone={tone} />
      <Dot from={[186, 209]} to={[420, 209]} step={checks} r={4} tone={tone} />
      <Caption x={360} y={384} text="committed only when every constraint holds" step={reject} tone={tone} />
    </svg>
  );
}

/* ============ event-triggered data processing (proof of concept) ============ */

function PipelineStage({
  index,
  label,
  x,
  y,
  w,
  h,
  parent,
  from,
  vertical,
  tone,
}: Readonly<{
  index: number;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  parent: Step;
  from: [number, number];
  vertical?: boolean;
  tone?: Tone;
}>) {
  const s = useStep(parent, index * 0.16, 0.5 + index * 0.16);
  const d = vertical ? `M ${from[0]} ${from[1]} L ${x + w / 2} ${y}` : `M ${from[0]} ${from[1]} L ${x} ${y + h / 2}`;
  return (
    <g>
      <Conn d={d} step={s} tone={tone} />
      <Box x={x} y={y} w={w} h={h} label={label} step={s} mono tone={tone} />
    </g>
  );
}

export function DataPipelineDiagram({ p, vertical, tone }: Readonly<DiagramProps>) {
  const t = useTokens(tone);
  const source = useStep(p, 0, 0.18);
  const chain = useStep(p, 0.16, 0.78);
  const load = useStep(p, 0.78, 1);

  if (vertical) {
    const ys = [140, 218, 296];
    return (
      <svg viewBox="0 0 380 560" className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <Caption x={190} y={30} text="object arrives" step={source} tone={tone} />
        <Box x={100} y={44} w={180} h={44} label="data lake" step={source} mono tone={tone} />
        {["S3 event", "AWS Glue (Python)", "filter + enrich"].map((l, i) => (
          <PipelineStage
            key={l}
            index={i}
            label={l}
            x={90}
            y={ys[i]}
            w={200}
            h={44}
            parent={chain}
            from={[190, i === 0 ? 88 : ys[i - 1] + 44]}
            vertical
            tone={tone}
          />
        ))}
        <Conn d="M 190 340 L 190 396" step={load} color={t.green} tone={tone} />
        <Box x={100} y={396} w={180} h={46} label="DynamoDB" step={load} mono accent={t.green} tone={tone} />
        <Tag x={190} y={476} text="proof of concept" step={load} color={t.muted} tone={tone} />
      </svg>
    );
  }

  const xs = [206, 358, 528];
  return (
    <svg viewBox="0 0 720 420" className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Caption x={40} y={168} text="object arrives" step={source} anchor="start" tone={tone} />
      <Box x={40} y={180} w={130} h={46} label="data lake" step={source} mono tone={tone} />
      {["S3 event", "AWS Glue", "filter + enrich"].map((l, i) => (
        <PipelineStage
          key={l}
          index={i}
          label={l}
          x={xs[i]}
          y={180}
          w={i === 2 ? 150 : 122}
          h={46}
          parent={chain}
          from={i === 0 ? [170, 203] : [xs[i - 1] + (i === 1 ? 122 : 122), 203]}
          tone={tone}
        />
      ))}
      <Conn d="M 678 226 L 678 292 L 400 292 L 400 316" step={load} color={t.green} tone={tone} />
      <Box x={300} y={316} w={200} h={46} label="DynamoDB" step={load} mono accent={t.green} tone={tone} />
      <Tag x={360} y={394} text="proof of concept" step={load} color={t.muted} tone={tone} />
    </svg>
  );
}

/* ============ streaming machine learning (team project) ============ */

function ExecutorLane({
  index,
  y,
  parent,
  vertical,
  tone,
}: Readonly<{ index: number; y: number; parent: Step; vertical?: boolean; tone?: Tone }>) {
  const t = useTokens(tone);
  const s = useStep(parent, index * 0.18, 0.66 + index * 0.18);
  if (vertical) {
    const x = 16 + index * 122;
    return (
      <g>
        <Conn d={`M 190 216 L 190 246 L ${x + 52} 246 L ${x + 52} 272`} step={s} color={t.blue} tone={tone} />
        <Box x={x} y={272} w={104} h={44} label="executor" step={s} mono tone={tone} />
        <Conn d={`M ${x + 52} 316 L ${x + 52} 356 L 190 356 L 190 386`} step={s} color={t.line} tone={tone} />
      </g>
    );
  }
  return (
    <g>
      <Conn d={`M 330 210 L 356 210 L 356 ${y + 22} L 386 ${y + 22}`} step={s} color={t.blue} tone={tone} />
      <Box x={386} y={y} w={150} h={44} label="Spark executor" step={s} mono tone={tone} />
      <Conn d={`M 536 ${y + 22} L 566 ${y + 22} L 566 210 L 590 210`} step={s} color={t.line} tone={tone} />
    </g>
  );
}

export function StreamingDiagram({ p, vertical, tone }: Readonly<DiagramProps>) {
  const t = useTokens(tone);
  const batches = useStep(p, 0, 0.2);
  const topic = useStep(p, 0.18, 0.36);
  const exec = useStep(p, 0.34, 0.74);
  const train = useStep(p, 0.74, 1);

  if (vertical) {
    return (
      <svg viewBox="0 0 380 560" className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <Caption x={190} y={30} text="CIFAR-10 image batches" step={batches} tone={tone} />
        <Box x={100} y={44} w={180} h={44} label="batch stream" step={batches} mono tone={tone} />
        <Conn d="M 190 88 L 190 128" step={topic} color={t.blue} tone={tone} />
        <Box x={100} y={128} w={180} h={44} label="Kafka topic" step={topic} mono accent={t.blue} tone={tone} />
        {[0, 1, 2].map((i) => (
          <ExecutorLane key={i} index={i} y={0} parent={exec} vertical tone={tone} />
        ))}
        <Box x={100} y={386} w={180} h={46} label="TensorFlow / Keras" step={train} mono accent={t.green} tone={tone} />
        <Caption x={190} y={470} text="batch size as an experimental variable" step={train} tone={tone} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 720 420" className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Caption x={40} y={176} text="CIFAR-10 batches" step={batches} anchor="start" tone={tone} />
      <Box x={40} y={188} w={130} h={44} label="batch stream" step={batches} mono tone={tone} />
      <Conn d="M 170 210 L 200 210" step={topic} color={t.blue} tone={tone} />
      <Box x={200} y={188} w={130} h={44} label="Kafka topic" step={topic} mono accent={t.blue} tone={tone} />
      {[0, 1, 2].map((i) => (
        <ExecutorLane key={i} index={i} y={[110, 188, 266][i]} parent={exec} tone={tone} />
      ))}
      <Box x={590} y={188} w={110} h={44} label="training" step={train} mono accent={t.green} tone={tone} />
      <Caption x={360} y={390} text="Spark as the distributed processing layer · batch size as a variable" step={train} tone={tone} />
    </svg>
  );
}

/* ============ closing: current context ============ */

export function ContextDiagram({ p, vertical, tone }: Readonly<DiagramProps>) {
  const t = useTokens(tone);
  const past = useStep(p, 0, 0.34);
  const move = useStep(p, 0.3, 0.66);
  const now = useStep(p, 0.62, 0.9);
  const note = useStep(p, 0.9, 1);

  if (vertical) {
    return (
      <svg viewBox="0 0 380 430" className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <Box x={70} y={50} w={240} h={54} label="Cisco" sub="production systems · 3 years" step={past} tone={tone} />
        <Conn d="M 190 104 L 190 190" step={move} color={t.blue} tone={tone} />
        <Dot from={[190, 110]} to={[190, 184]} step={move} tone={tone} />
        <Box x={70} y={190} w={240} h={56} label="UC San Diego" sub="M.S. Computer Science" step={now} accent={t.blue} tone={tone} />
        <Caption x={190} y={300} text="distributed systems · operating systems · applied ML" step={note} tone={tone} />
        <line x1={70} y1={324} x2={310} y2={324} stroke={t.line} strokeWidth={1} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 720 420" className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Box x={60} y={168} w={240} h={64} label="Cisco" sub="production systems · 3 years" step={past} tone={tone} />
      <Conn d="M 300 200 L 420 200" step={move} color={t.blue} tone={tone} />
      <Dot from={[308, 200]} to={[412, 200]} step={move} tone={tone} />
      <Box x={420} y={162} w={240} h={76} label="UC San Diego" sub="M.S. Computer Science" step={now} accent={t.blue} tone={tone} />
      <Caption x={360} y={312} text="distributed systems · operating systems · applied ML" step={note} tone={tone} />
      <line x1={160} y1={336} x2={560} y2={336} stroke={t.line} strokeWidth={1} />
    </svg>
  );
}
