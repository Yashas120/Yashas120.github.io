/**
 * The SDK delivery path.
 *
 * The generation and publication steps are automated; "Choose version" is drawn in
 * violet with a "human decision" tag and is the one node the flow visibly stops
 * at, because that decision was deliberately left with a person. Claiming a fully
 * automatic release would overstate what was built.
 */

"use client";

import { devex } from "@/data/devops/profile";
import { DV } from "../tokens";
import { DiagramFrame, Edge, GNode } from "./parts";

const MID = 180;

export interface SdkPipelineProps {
  live?: boolean;
}

export function SdkPipeline({ live }: Readonly<SdkPipelineProps>) {
  return (
    <DiagramFrame
      title="SDK delivery pipeline"
      desc="An OpenAPI contract change triggers a GitHub Actions workflow. The workflow generates the Python and the Java client concurrently, then stops at an explicit human decision on the release version, and finally publishes the SDK artifacts and documentation."
      height={306}
    >
      <GNode x={100} y={6} w={160} h={32} lines={[devex.sdk.stages[0].label]} accent={DV.amber} />
      <Edge d={`M ${MID} 38 V 56`} accent={DV.amber} flow={live} head={{ x: MID, y: 56, dir: "down" }} />
      <GNode x={88} y={56} w={184} h={32} lines={["GitHub Actions trigger"]} accent={DV.amber} />

      <Edge d={`M ${MID} 88 V 106 H 88 V 124`} accent={DV.cyan} flow={live} head={{ x: 88, y: 124, dir: "down" }} />
      <Edge
        d={`M ${MID} 88 V 106 H 272 V 124`}
        accent={DV.cyan}
        flow={live}
        delay={140}
        head={{ x: 272, y: 124, dir: "down" }}
      />
      <GNode x={6} y={124} w={164} h={32} lines={["Generate Python"]} accent={DV.cyan} />
      <GNode x={190} y={124} w={164} h={32} lines={["Generate Java"]} accent={DV.cyan} />

      <Edge d={`M 88 156 V 178 H ${MID} V 192`} accent={DV.violet} flow={live} />
      <Edge
        d={`M 272 156 V 178 H ${MID} V 192`}
        accent={DV.violet}
        flow={live}
        delay={140}
        head={{ x: MID, y: 192, dir: "down" }}
      />
      <GNode x={90} y={192} w={180} h={32} lines={["Choose version"]} accent={DV.violet} tag="human decision" />

      {/* The retained decision is the one place the path pauses, so this edge is
          never animated and it starts below the "human decision" tag baseline. */}
      <Edge d={`M ${MID} 242 V 260`} accent={DV.green} head={{ x: MID, y: 260, dir: "down" }} />
      <GNode x={80} y={260} w={200} h={32} lines={["Publish SDK + docs"]} accent={DV.green} />
    </DiagramFrame>
  );
}
