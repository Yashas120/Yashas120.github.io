/**
 * The five-stage delivery loop: Define → Provision → Deliver → Observe → Improve.
 *
 * The whole ring is drawn at rest; the only motion is a single signal travelling
 * the loop, which is what the loop claims — work returns to the definition rather
 * than ending at deployment.
 */

"use client";

import { DV } from "../tokens";
import { DiagramFrame, Edge, GNode, VW } from "./parts";
import { deliveryLoop } from "@/data/devops/profile";

const CX = VW / 2;
const CY = 150;
const R = 100;

/** Stage centres at -90°, -18°, 54°, 126°, 198° — evenly spaced around the ring. */
const STAGES = [
  { label: deliveryLoop.stages[0], x: 180, y: 50, accent: DV.cyan },
  { label: deliveryLoop.stages[1], x: 275, y: 119, accent: DV.cyan },
  { label: deliveryLoop.stages[2], x: 239, y: 231, accent: DV.amber },
  { label: deliveryLoop.stages[3], x: 121, y: 231, accent: DV.green },
  { label: deliveryLoop.stages[4], x: 85, y: 119, accent: DV.violet },
];

export interface DeliveryLoopProps {
  /** Docked panel: run the ambient signal. Inline copies stay still. */
  live?: boolean;
}

export function DeliveryLoop({ live }: Readonly<DeliveryLoopProps>) {
  return (
    <DiagramFrame
      title="The delivery loop"
      desc="A closed loop of five stages: Define, Provision, Deliver, Observe, and Improve. Improve returns to Define, so operational findings change the definition rather than ending at deployment."
      height={300}
    >
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={DV.border} strokeWidth={1} strokeDasharray="4 8" />

      {/* Direction of travel, marked once so the ring is not ambiguous. */}
      <Edge
        d={`M ${CX + 34} ${CY - 94} A ${R} ${R} 0 0 1 ${CX + 96} ${CY - 28}`}
        accent={DV.amber}
        flow={live}
        head={{ x: CX + 96, y: CY - 28, dir: "down" }}
      />

      {live && (
        <g className="dv-orbit" style={{ transformOrigin: `${CX}px ${CY}px` }}>
          <circle cx={CX} cy={CY - R} r={4.5} fill={DV.amber} />
        </g>
      )}

      {STAGES.map((s) => (
        <GNode key={s.label} x={s.x - 46} y={s.y - 16} w={92} h={32} lines={[s.label]} accent={s.accent} />
      ))}

      <text x={CX} y={CY - 4} textAnchor="middle" fontSize={13} fill={DV.muted} className="font-mono">
        {deliveryLoop.center[0]}
      </text>
      <text x={CX} y={CY + 14} textAnchor="middle" fontSize={12} fill={DV.muted} className="font-mono">
        {deliveryLoop.center[1]}
      </text>
    </DiagramFrame>
  );
}
