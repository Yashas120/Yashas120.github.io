/**
 * Investigation trace: six phases, each paired with the signal it was read from.
 *
 * There are no timestamps, stack traces, incident numbers, severity levels, pager
 * alerts, MTTR figures or uptime percentages here. None of those are verified for
 * this work, and inventing them would be the cheapest and least honest way to make
 * this drawing look authentic.
 */

"use client";

import { reliability } from "@/data/devops/profile";
import { DV } from "../tokens";
import { DiagramFrame, VW } from "./parts";

const ROW_H = 48;
const RAIL_X = 22;

/** Phase accents: failure red only at detection, green once the system is safe. */
const ACCENTS = [DV.red, DV.amber, DV.cyan, DV.amber, DV.green, DV.green];
/** Distinct shapes so the phase is readable without colour. */
const SHAPE = ["ring", "dot", "dot", "dot", "check", "check"] as const;

export interface IncidentTraceProps {
  live?: boolean;
}

export function IncidentTrace({ live }: Readonly<IncidentTraceProps>) {
  const phases = reliability.phases;
  const height = phases.length * ROW_H + 12;

  return (
    <DiagramFrame
      title="Incident investigation trace"
      desc={phases
        .map((p, i) => `${p}: ${reliability.signals[i]}`)
        .join(". ")
        .concat(".")}
      height={height}
    >
      <line x1={RAIL_X} y1={16} x2={RAIL_X} y2={height - 26} stroke={DV.border} strokeWidth={1.5} />

      {phases.map((phase, i) => {
        const y = 22 + i * ROW_H;
        const accent = ACCENTS[i];
        return (
          <g key={phase}>
            {SHAPE[i] === "ring" && (
              <>
                <circle cx={RAIL_X} cy={y} r={7} fill="none" stroke={accent} strokeWidth={2} />
                {live && <circle cx={RAIL_X} cy={y} r={11} fill="none" stroke={accent} strokeWidth={1} className="dv-pulse" />}
              </>
            )}
            {SHAPE[i] === "dot" && <circle cx={RAIL_X} cy={y} r={5} fill={accent} />}
            {SHAPE[i] === "check" && (
              <path
                d={`M ${RAIL_X - 6} ${y} l 4 5 l 8 -10`}
                fill="none"
                stroke={accent}
                strokeWidth={2}
                strokeLinecap="round"
              />
            )}
            <text x={RAIL_X + 20} y={y - 2} fontSize={14} fill={DV.text} className="font-sans">
              {phase}
            </text>
            <text x={RAIL_X + 20} y={y + 15} fontSize={12} fill={DV.muted} className="font-mono">
              {reliability.signals[i]}
            </text>
            {i < phases.length - 1 && (
              <line
                x1={RAIL_X + 18}
                y1={y + 26}
                x2={VW - 8}
                y2={y + 26}
                stroke={DV.border}
                strokeWidth={1}
                strokeDasharray="2 6"
              />
            )}
          </g>
        );
      })}
    </DiagramFrame>
  );
}
