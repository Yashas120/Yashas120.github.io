"use client";

import { motion, useTransform } from "framer-motion";
import { useTokens } from "../theme";
import { Box, Caption, Conn, Tag, useStep, type DiagramProps } from "./primitives";

export function ReconciliationDiagram({ p, vertical, tone }: Readonly<DiagramProps>) {
  const t = useTokens(tone);
  const desired = useStep(p, 0.05, 0.3);
  const interrupted = useStep(p, 0.3, 0.55);
  const compare = useStep(p, 0.54, 0.78);
  const correct = useStep(p, 0.76, 0.94);
  const verified = useStep(p, 0.93, 1);
  const breakOpacity = useTransform(p, [0.28, 0.38, 0.72, 0.86], [0, 1, 1, 0]);

  const rows = [
    { label: "desired state", y: vertical ? 92 : 112 },
    { label: "software-observed", y: vertical ? 228 : 224 },
    { label: "programmed hardware", y: vertical ? 364 : 336 },
  ];
  const x1 = vertical ? 42 : 208;
  const x2 = vertical ? 338 : 694;

  return (
    <svg viewBox={vertical ? "0 0 380 540" : "0 0 760 460"} className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {rows.map((row, index) => (
        <g key={row.label}>
          <Caption x={x1} y={row.y - 22} text={row.label} step={desired} anchor="start" tone={tone} />
          <Conn d={`M ${x1} ${row.y} L ${x2} ${row.y}`} step={index === 1 ? compare : desired} color={index === 2 ? t.green : t.blue} width={2} tone={tone} />
          <Box x={x2 - 92} y={row.y - 22} w={92} h={44} label={index === 2 ? "line card" : "state"} step={index === 1 ? compare : desired} tone={tone} />
        </g>
      ))}
      <motion.g style={{ opacity: breakOpacity }}>
        <rect x={vertical ? 174 : 426} y={vertical ? 202 : 198} width={vertical ? 32 : 44} height={52} fill={t.canvas} />
        <path d={vertical ? "M174 228 L206 228" : "M426 224 L470 224"} stroke={t.coral} strokeWidth={3} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        <Caption x={vertical ? 190 : 448} y={vertical ? 284 : 278} text="warm-restart interruption" step={interrupted} tone={tone} />
      </motion.g>
      <Conn
        d={vertical ? "M 190 250 L 190 330" : "M 448 248 L 448 310"}
        step={correct}
        color={t.green}
        dashed
        tone={tone}
      />
      <Caption x={vertical ? 190 : 448} y={vertical ? 326 : 304} text="compare · correct mismatch" step={correct} tone={tone} />
      <Tag x={vertical ? 190 : 448} y={vertical ? 496 : 424} text="verified convergence" step={verified} color={t.green} tone={tone} />
    </svg>
  );
}
