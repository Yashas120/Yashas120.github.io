/**
 * The delivery graph: a directed acyclic graph, not a progress bar.
 *
 * The point of the drawing is the branch. One side runs concurrently because
 * nothing depends on it; the other waits behind a gate because a prerequisite has
 * to be healthy first. Per-node durations are deliberately absent — only the
 * overall ratio is measured, and it is shown separately as a normalized bar.
 */

"use client";

import { DV } from "../tokens";
import { DiagramFrame, Edge, GLabel, GNode } from "./parts";

const MID = 180;
const L = 88;
const R = 272;

export interface DependencyGraphProps {
  live?: boolean;
}

export function DependencyGraph({ live }: Readonly<DependencyGraphProps>) {
  return (
    <DiagramFrame
      title="Dependency-aware delivery graph"
      desc="A change is detected, inputs are validated, and infrastructure is planned. The graph then splits: independent resources are created concurrently, while dependent services wait behind a dependency gate until their prerequisites are healthy. Both branches converge on a human approval step, then deploy, health verification, and observation."
      height={472}
    >
      {/* trunk */}
      <GNode x={110} y={6} w={140} h={32} lines={["Change detected"]} accent={DV.amber} />
      <Edge d={`M ${MID} 38 V 56`} accent={DV.amber} flow={live} head={{ x: MID, y: 56, dir: "down" }} />
      <GNode x={110} y={56} w={140} h={32} lines={["Validate inputs"]} accent={DV.amber} />
      <Edge d={`M ${MID} 88 V 106`} accent={DV.amber} flow={live} head={{ x: MID, y: 106, dir: "down" }} />
      <GNode x={100} y={106} w={160} h={32} lines={["Plan infrastructure"]} accent={DV.cyan} />

      {/* split */}
      <Edge d={`M ${MID} 138 V 150 H ${L} V 162`} accent={DV.green} flow={live} head={{ x: L, y: 162, dir: "down" }} />
      <Edge
        d={`M ${MID} 138 V 150 H ${R} V 162`}
        accent={DV.muted}
        flow={live}
        delay={700}
        head={{ x: R, y: 162, dir: "down" }}
      />

      <GNode x={6} y={162} w={164} h={44} lines={["Independent", "resources"]} accent={DV.green} tag="concurrent" />
      <GNode x={190} y={162} w={164} h={32} lines={["Dependency gate"]} accent={DV.amber} />
      <Edge d={`M ${R} 194 V 214`} accent={DV.muted} flow={live} delay={700} head={{ x: R, y: 214, dir: "down" }} />
      <GNode x={190} y={214} w={164} h={32} lines={["Dependent services"]} accent={DV.muted} waiting tag="waits" />

      {/* converge */}
      {/* starts below the "concurrent" tag baseline so the label stays legible */}
      <Edge d={`M ${L} 226 V 258 H ${MID} V 272`} accent={DV.green} flow={live} />
      <Edge
        d={`M ${R} 246 V 258 H ${MID} V 272`}
        accent={DV.muted}
        flow={live}
        delay={700}
        head={{ x: MID, y: 272, dir: "down" }}
      />

      <GNode x={88} y={272} w={184} h={32} lines={["Human approval"]} accent={DV.violet} tag="human decision" />
      <Edge d={`M ${MID} 304 V 336` } accent={DV.violet} flow={live} head={{ x: MID, y: 336, dir: "down" }} />
      <GNode x={110} y={336} w={140} h={32} lines={["Deploy"]} accent={DV.amber} />
      <Edge d={`M ${MID} 368 V 386`} accent={DV.amber} flow={live} head={{ x: MID, y: 386, dir: "down" }} />
      <GNode x={96} y={386} w={168} h={32} lines={["Health verification"]} accent={DV.green} />
      <Edge d={`M ${MID} 418 V 436`} accent={DV.green} flow={live} head={{ x: MID, y: 436, dir: "down" }} />
      <GNode x={125} y={436} w={110} h={32} lines={["Observe"]} accent={DV.green} />

      <GLabel x={6} y={152} text="independent" accent={DV.green} />
      <GLabel x={354} y={152} text="prerequisite" accent={DV.amber} anchor="end" />
    </DiagramFrame>
  );
}
