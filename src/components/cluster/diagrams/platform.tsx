"use client";

import { motion, useTransform } from "framer-motion";
import type { Tone } from "@/lib/clusterTheme";
import { useTokens } from "../theme";
import { Box, Caption, Conn, Dot, Tag, useStep, type DiagramProps, type Step } from "./primitives";

const SVG = "h-full w-full";

/* ============ consumer discovery + staged migration ============ */

function DiscoveredNode({
  index,
  label,
  x,
  y,
  w,
  parent,
  from,
  vertical,
  accent,
  tone,
}: Readonly<{
  index: number;
  label: string;
  x: number;
  y: number;
  w: number;
  parent: Step;
  from: [number, number];
  vertical?: boolean;
  accent?: string;
  tone?: Tone;
}>) {
  const s = useStep(parent, index * 0.22, 0.66 + index * 0.22);
  const d = vertical
    ? `M ${from[0]} ${from[1]} L ${from[0]} ${y - 14} L ${x + w / 2} ${y - 14} L ${x + w / 2} ${y}`
    : `M ${from[0]} ${from[1]} L ${from[0] + 24} ${from[1]} L ${from[0] + 24} ${y + 17} L ${x} ${y + 17}`;
  return (
    <g>
      <Conn d={d} step={s} tone={tone} />
      <Box x={x} y={y} w={w} h={34} label={label} step={s} mono accent={accent} tone={tone} />
    </g>
  );
}

export function ConsumerDiscoveryDiagram({ p, vertical, tone }: Readonly<DiagramProps>) {
  const t = useTokens(tone);
  const change = useStep(p, 0, 0.2);
  const found = useStep(p, 0.2, 0.52);
  const owners = useStep(p, 0.5, 0.78);
  const staged = useStep(p, 0.78, 1);

  const consumers = ["consumer 1", "consumer 2", "consumer 3"];
  const teams = ["team A", "team B", "team C"];

  if (vertical) {
    return (
      <svg viewBox="0 0 380 560" className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <Caption x={190} y={24} text="API / auth change" step={change} tone={tone} />
        <Box x={110} y={36} w={160} h={44} label="API change" step={change} mono accent={t.coral} tone={tone} />
        {consumers.map((l, i) => (
          <DiscoveredNode key={l} index={i} label={l} x={16 + i * 122} y={150} w={104} parent={found} from={[190, 80]} vertical tone={tone} />
        ))}
        <Caption x={190} y={206} text="discovered in production traffic" step={found} tone={tone} />
        {teams.map((l, i) => (
          <DiscoveredNode key={l} index={i} label={l} x={16 + i * 122} y={252} w={104} parent={owners} from={[190, 184]} vertical accent={t.blue} tone={tone} />
        ))}
        <Caption x={190} y={308} text="owning teams" step={owners} tone={tone} />
        <Conn d="M 190 320 L 190 372" step={staged} color={t.green} tone={tone} />
        <Box x={90} y={372} w={200} h={48} label="staged cutover" step={staged} mono accent={t.green} tone={tone} />
        <Tag x={190} y={452} text="no customer impact" step={staged} color={t.green} tone={tone} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 720 420" className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Caption x={40} y={168} text="API / auth change" step={change} anchor="start" tone={tone} />
      <Box x={40} y={180} w={140} h={46} label="API change" step={change} mono accent={t.coral} tone={tone} />
      {consumers.map((l, i) => (
        <DiscoveredNode key={l} index={i} label={l} x={244} y={104 + i * 74} w={124} parent={found} from={[180, 203]} tone={tone} />
      ))}
      <Caption x={306} y={90} text="discovered in production traffic" step={found} tone={tone} />
      {teams.map((l, i) => (
        <DiscoveredNode key={l} index={i} label={l} x={430} y={104 + i * 74} w={124} parent={owners} from={[368, 203]} accent={t.blue} tone={tone} />
      ))}
      <Caption x={492} y={90} text="owning teams" step={owners} tone={tone} />
      <Conn d="M 554 203 L 588 203" step={staged} color={t.green} tone={tone} />
      <Box x={588} y={178} w={112} h={50} label="staged cutover" step={staged} mono accent={t.green} tone={tone} />
      <Tag x={360} y={386} text="no customer impact" step={staged} color={t.green} tone={tone} />
    </svg>
  );
}

/* ============ live database cutover ============ */

export function CutoverDiagram({ p, vertical, tone }: Readonly<DiagramProps>) {
  const t = useTokens(tone);
  const live = useStep(p, 0, 0.18);
  const created = useStep(p, 0.18, 0.4);
  const sync = useStep(p, 0.38, 0.62);
  const cut = useStep(p, 0.62, 0.84);
  const removed = useStep(p, 0.84, 1);

  const oldLink = useTransform(cut, [0, 1], [1, 0.12]);
  const oldFade = useTransform(removed, [0, 1], [1, 0.35]);

  if (vertical) {
    return (
      <svg viewBox="0 0 380 560" className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <Box x={110} y={30} w={160} h={44} label="clients" step={live} mono accent={t.blue} tone={tone} />
        <motion.g style={{ opacity: oldLink }}>
          <Conn d="M 190 74 L 190 132" step={live} color={t.blue} tone={tone} />
        </motion.g>
        <motion.g style={{ opacity: oldFade }}>
          <Box x={60} y={132} w={260} h={52} label="existing database" step={live} mono tone={tone} />
        </motion.g>
        <Conn d="M 190 184 L 190 250" step={sync} color={t.line} dashed tone={tone} />
        <Caption x={190} y={222} text="transaction-log sync" step={sync} tone={tone} />
        <Box x={60} y={250} w={260} h={52} label="replacement" step={created} mono accent={t.green} tone={tone} />
        <Conn d="M 300 52 L 348 52 L 348 276 L 320 276" step={cut} color={t.blue} tone={tone} />
        <Caption x={190} y={330} text="coordinated cutover" step={cut} tone={tone} />
        <Tag x={190} y={372} text="old database removed after traffic shifted" step={removed} color={t.green} tone={tone} />
        <Tag x={190} y={404} text="no customer-visible downtime" step={removed} color={t.green} tone={tone} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 720 420" className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Box x={40} y={182} w={130} h={48} label="clients" step={live} mono accent={t.blue} tone={tone} />
      <motion.g style={{ opacity: oldLink }}>
        <Conn d="M 170 206 L 250 206 L 250 124" step={live} color={t.blue} tone={tone} />
      </motion.g>
      <motion.g style={{ opacity: oldFade }}>
        <Box x={250} y={96} w={200} h={56} label="existing database" step={live} mono tone={tone} />
      </motion.g>
      <Conn d="M 350 152 L 350 262" step={sync} color={t.line} dashed tone={tone} />
      <Caption x={396} y={212} text="transaction-log sync" step={sync} anchor="start" tone={tone} />
      <Box x={250} y={262} w={200} h={56} label="replacement" step={created} mono accent={t.green} tone={tone} />
      <Conn d="M 170 206 L 210 206 L 210 290 L 250 290" step={cut} color={t.blue} tone={tone} />
      <Dot from={[178, 206]} to={[244, 290]} step={cut} r={4} tone={tone} />
      <Caption x={560} y={140} text="old database removed only after traffic shifted" step={removed} anchor="middle" tone={tone} />
      <Tag x={360} y={382} text="cutover completed with no customer-visible downtime" step={removed} color={t.green} tone={tone} />
    </svg>
  );
}

/* ============ deployment order, hidden dependencies, staged rollout ============ */

export function RolloutDiagram({ p, vertical, tone }: Readonly<DiagramProps>) {
  const t = useTokens(tone);
  const serving = useStep(p, 0, 0.18);
  const staged = useStep(p, 0.18, 0.38);
  const hidden = useStep(p, 0.36, 0.58);
  const health = useStep(p, 0.58, 0.8);
  const shift = useStep(p, 0.8, 1);

  const failMark = useTransform(hidden, [0.4, 1], [0, 1]);
  const healed = useTransform(health, [0, 1], [0, 1]);

  if (vertical) {
    return (
      <svg viewBox="0 0 380 560" className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <Box x={110} y={26} w={160} h={44} label="load balancer" step={serving} mono accent={t.blue} tone={tone} />
        <Conn d="M 190 70 L 190 104 L 96 104 L 96 138" step={serving} color={t.blue} tone={tone} />
        <Box x={22} y={138} w={148} h={50} label="v1 pods" sub="retained" step={serving} mono tone={tone} />
        <Conn d="M 190 70 L 190 104 L 284 104 L 284 138" step={staged} color={t.line} dashed tone={tone} />
        <Box x={210} y={138} w={148} h={50} label="v2 pods" sub="staged" step={staged} mono tone={tone} />
        <Conn d="M 284 188 L 284 250" step={hidden} color={t.coral} dashed tone={tone} />
        <Box x={210} y={250} w={148} h={46} label="global URL" step={hidden} mono accent={t.coral} tone={tone} />
        <motion.text x={284} y={318} textAnchor="middle" fontSize={16} fontWeight={700} fill={t.coral} style={{ opacity: failMark }}>
          ×
        </motion.text>
        <Caption x={190} y={348} text="hidden deployment-order dependency" step={hidden} tone={tone} />
        <Conn d="M 96 188 L 96 392 L 190 392" step={health} color={t.green} tone={tone} />
        <Box x={110} y={392} w={160} h={46} label="health check" step={health} mono accent={t.green} tone={tone} />
        <motion.g style={{ opacity: healed }}>
          <Conn d="M 270 415 L 330 415" step={health} color={t.green} tone={tone} />
        </motion.g>
        <Tag x={190} y={486} text="traffic shifts only after checks pass" step={shift} color={t.green} tone={tone} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 720 420" className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Box x={290} y={34} w={150} h={46} label="load balancer" step={serving} mono accent={t.blue} tone={tone} />
      <Conn d="M 365 80 L 365 122 L 205 122 L 205 160" step={serving} color={t.blue} tone={tone} />
      <Box x={130} y={160} w={150} h={54} label="v1 pods" sub="retained" step={serving} mono tone={tone} />
      <Conn d="M 365 80 L 365 122 L 525 122 L 525 160" step={staged} color={t.line} dashed tone={tone} />
      <Box x={450} y={160} w={150} h={54} label="v2 pods" sub="staged" step={staged} mono tone={tone} />

      <Conn d="M 525 214 L 525 286" step={hidden} color={t.coral} dashed tone={tone} />
      <Box x={450} y={286} w={150} h={46} label="global URL" step={hidden} mono accent={t.coral} tone={tone} />
      <motion.text x={620} y={315} fontSize={17} fontWeight={700} fill={t.coral} style={{ opacity: failMark }}>
        ×
      </motion.text>
      <Caption x={525} y={358} text="hidden deployment-order dependency" step={hidden} tone={tone} />

      <Conn d="M 205 214 L 205 286" step={health} color={t.green} tone={tone} />
      <Box x={130} y={286} w={150} h={46} label="health check" step={health} mono accent={t.green} tone={tone} />
      <motion.g style={{ opacity: healed }}>
        <Conn d="M 280 309 L 450 309" step={health} color={t.green} tone={tone} />
      </motion.g>
      <Dot from={[365, 88]} to={[525, 158]} step={shift} r={4} tone={tone} />
      <Tag x={360} y={398} text="staged rollout · old pods retained until replacements are stable" step={shift} color={t.green} tone={tone} />
    </svg>
  );
}

/* ============ desired vs programmed state reconciliation ============ */

function RecRow({
  index,
  y,
  lx,
  rx,
  w,
  parent,
  diverges,
  fix,
  tone,
}: Readonly<{ index: number; y: number; lx: number; rx: number; w: number; parent: Step; diverges: boolean; fix: Step; tone?: Tone }>) {
  const t = useTokens(tone);
  const s = useStep(parent, index * 0.16, 0.56 + index * 0.16);
  const mid = (lx + w + rx) / 2;
  const ok = !diverges;
  const markColor = ok ? t.green : t.coral;
  const fixed = useTransform(fix, [0.4, 1], [0, 1]);
  const markOpacity = useTransform(s, [0.7, 1], [0, 1]);
  return (
    <g>
      <Box x={lx} y={y} w={w} h={36} label={`resource ${index + 1}`} step={s} mono tone={tone} />
      <Box x={rx} y={y} w={w} h={36} label={ok ? "match" : "diverged"} step={s} mono accent={ok ? undefined : t.coral} tone={tone} />
      <Conn d={`M ${lx + w} ${y + 18} L ${rx} ${y + 18}`} step={s} color={ok ? t.line : t.coral} dashed={!ok} tone={tone} />
      <motion.text
        x={mid}
        y={y + 12}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill={markColor}
        style={{ opacity: markOpacity }}
      >
        {ok ? "=" : "≠"}
      </motion.text>
      {diverges && (
        <motion.g style={{ opacity: fixed }}>
          <Caption x={mid} y={y + 52} text="reprogrammed" step={fix} tone={tone} />
        </motion.g>
      )}
    </g>
  );
}

export function ReconciliationDiagram({ p, vertical, tone }: Readonly<DiagramProps>) {
  const t = useTokens(tone);
  const desired = useStep(p, 0, 0.22);
  const compare = useStep(p, 0.2, 0.66);
  const fix = useStep(p, 0.66, 0.88);
  const done = useStep(p, 0.88, 1);

  const lx = vertical ? 16 : 90;
  const rx = vertical ? 210 : 430;
  const w = vertical ? 154 : 200;
  const top = vertical ? 90 : 92;
  const gap = vertical ? 66 : 62;

  return (
    <svg viewBox={vertical ? "0 0 380 470" : "0 0 720 420"} className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Caption x={lx} y={top - 22} text="desired state (database)" step={desired} anchor="start" tone={tone} />
      <Caption x={rx} y={top - 22} text="programmed state (hardware)" step={desired} anchor="start" tone={tone} />
      {[0, 1, 2, 3].map((i) => (
        <RecRow key={i} index={i} y={top + i * gap} lx={lx} rx={rx} w={w} parent={compare} diverges={i === 3} fix={fix} tone={tone} />
      ))}
      <Tag
        x={vertical ? 190 : 360}
        y={vertical ? 430 : 386}
        text="warm reload · matching resources preserved"
        step={done}
        color={t.green}
        tone={tone}
      />
    </svg>
  );
}
