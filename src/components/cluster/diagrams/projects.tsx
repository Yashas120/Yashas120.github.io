"use client";

import { useTokens } from "../theme";
import { Box, Caption, Conn, Tag, useStep, type DiagramProps } from "./primitives";

const stops = [
  { title: "Spark Streaming", boundary: "team · fork" },
  { title: "RDBMS allocation", boundary: "team · fork" },
  { title: "Bitcoin Java", boundary: "no consensus" },
  { title: "SSP", boundary: "illustrative models" },
];

export function EvidenceSpineDiagram({ p, vertical, tone }: Readonly<DiagramProps>) {
  const t = useTokens(tone);
  const spine = useStep(p, 0, 0.16);
  const item0 = useStep(p, 0, 0.35);
  const item1 = useStep(p, 0.2, 0.55);
  const item2 = useStep(p, 0.4, 0.75);
  const item3 = useStep(p, 0.6, 0.95);
  const items = [item0, item1, item2, item3];
  const x = vertical ? 38 : 110;
  const y0 = vertical ? 70 : 66;
  const gap = vertical ? 112 : 96;
  const w = vertical ? 294 : 520;

  return (
    <svg viewBox={vertical ? "0 0 380 540" : "0 0 760 460"} className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Conn d={`M ${x} ${y0 - 28} L ${x} ${y0 + gap * 3 + 26}`} step={spine} color={t.line} width={2} tone={tone} />
      {stops.map((stop, index) => {
        const y = y0 + index * gap;
        return (
          <g key={stop.title}>
            <circle cx={x} cy={y} r={6} fill={index === 2 ? t.coral : t.blue} />
            <Box x={x + 26} y={y - 26} w={w} h={52} label={stop.title} sub={stop.boundary} step={items[index]} accent={index === 2 ? t.coral : t.blue} tone={tone} />
          </g>
        );
      })}
      <Caption x={vertical ? 190 : 380} y={vertical ? 516 : 446} text="provenance and limits stay visible" step={item3} tone={tone} />
      <Tag x={vertical ? 190 : 690} y={vertical ? 32 : 44} text="public evidence" step={spine} color={t.muted} tone={tone} />
    </svg>
  );
}

export function HandoffDiagram({ p, vertical, tone }: Readonly<DiagramProps>) {
  const t = useTokens(tone);
  const line = useStep(p, 0, 0.5);
  const label0 = useStep(p, 0.08, 0.35);
  const label1 = useStep(p, 0.16, 0.43);
  const label2 = useStep(p, 0.24, 0.51);
  const label3 = useStep(p, 0.32, 0.59);
  const label4 = useStep(p, 0.4, 0.67);
  const label5 = useStep(p, 0.48, 0.75);
  const label6 = useStep(p, 0.56, 0.83);
  const itemSteps = [label0, label1, label2, label3, label4, label5, label6];
  const labels = ["Experience", "Systems", "Beyond", "Research", "Teaching", "Education", "Leadership"];
  const x = vertical ? 38 : 130;
  const gap = vertical ? 52 : 48;
  return (
    <svg viewBox={vertical ? "0 0 380 430" : "0 0 760 430"} className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Conn d={`M ${x} 34 L ${x} ${34 + gap * 6}`} step={line} color={t.line} width={2} tone={tone} />
      {labels.map((label, index) => {
        const y = 34 + index * gap;
        return (
          <g key={label}>
            <circle cx={x} cy={y} r={4} fill={t.blue} />
            <Caption x={x + 24} y={y + 4} text={label} step={itemSteps[index]} anchor="start" size={14} tone={tone} />
          </g>
        );
      })}
    </svg>
  );
}
