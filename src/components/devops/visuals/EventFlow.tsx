/**
 * Public-safe reference architecture for the event path.
 *
 * This is an architectural illustration: it shows the mechanism (change → fan-out
 * → regional queues → consumers → database updates) and nothing about an
 * employer's real topology. Retry, dead-letter, ordering and idempotency states
 * are not animated here, because animating them would assert that each mechanism
 * existed as drawn. They appear in the panel as questions instead.
 */

"use client";

import { DV } from "../tokens";
import { DiagramFrame, Edge, GLabel, GNode } from "./parts";

const MID = 180;

export interface EventFlowProps {
  live?: boolean;
}

export function EventFlow({ live }: Readonly<EventFlowProps>) {
  return (
    <DiagramFrame
      title="Event path reference architecture"
      desc="A data change is written to DynamoDB. DynamoDB notifies an SNS fan-out, which delivers to one SQS queue per region. Regional service consumers read their queue and apply database updates. This is an illustration of the mechanism, not a production topology."
      height={344}
    >
      <GNode x={110} y={6} w={140} h={32} lines={["Data change"]} accent={DV.muted} />
      <Edge d={`M ${MID} 38 V 56`} accent={DV.cyan} flow={live} head={{ x: MID, y: 56, dir: "down" }} />
      <GNode x={110} y={56} w={140} h={32} lines={["DynamoDB"]} accent={DV.cyan} />
      <Edge d={`M ${MID} 88 V 106`} accent={DV.cyan} flow={live} head={{ x: MID, y: 106, dir: "down" }} />
      <GNode x={100} y={106} w={160} h={32} lines={["SNS fan-out"]} accent={DV.cyan} tag="one → many" />

      <Edge d={`M ${MID} 138 V 158 H 88 V 176`} accent={DV.cyan} flow={live} head={{ x: 88, y: 176, dir: "down" }} />
      <Edge
        d={`M ${MID} 138 V 158 H 272 V 176`}
        accent={DV.cyan}
        flow={live}
        delay={200}
        head={{ x: 272, y: 176, dir: "down" }}
      />
      <GNode x={6} y={176} w={164} h={32} lines={["SQS · region A"]} accent={DV.cyan} />
      <GNode x={190} y={176} w={164} h={32} lines={["SQS · region B"]} accent={DV.cyan} />

      <Edge d={`M 88 208 V 232 H ${MID} V 246`} accent={DV.green} flow={live} />
      <Edge
        d={`M 272 208 V 232 H ${MID} V 246`}
        accent={DV.green}
        flow={live}
        delay={200}
        head={{ x: MID, y: 246, dir: "down" }}
      />
      <GNode x={60} y={246} w={240} h={32} lines={["Service consumers"]} accent={DV.green} />
      <Edge d={`M ${MID} 278 V 296`} accent={DV.green} flow={live} head={{ x: MID, y: 296, dir: "down" }} />
      <GNode x={80} y={296} w={200} h={32} lines={["Database updates"]} accent={DV.green} />

      <GLabel x={6} y={168} text="per-region queue" accent={DV.muted} />
      <GLabel x={354} y={168} text="explicit dependency" accent={DV.muted} anchor="end" />
    </DiagramFrame>
  );
}
