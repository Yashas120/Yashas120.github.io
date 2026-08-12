"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { sceneRanges } from "@/data/backend";

const visualStates = [
  { status: "request received", nodes: ["request", "desired state", "proof"] },
  { status: "scope mapped", nodes: ["intern", "backend", "optical"] },
  { status: "plan · review · apply", nodes: ["network", "compute", "data", "events", "identity"] },
  { status: "events in flight", nodes: ["DynamoDB", "SNS fan-out", "regional SQS", "consumers"] },
  { status: "observing", nodes: ["observe", "isolate", "change", "verify", "prevent"] },
  { status: "reconciling hardware", nodes: ["desired", "current", "preserved", "changed"] },
  { status: "automation lineage", nodes: ["contract", "SDK artifacts", "domain knowledge", "guided tool"] },
  { status: "evidence attached", nodes: ["ownership", "contribution", "status", "links"] },
  { status: "breadth resolved", nodes: ["research", "teaching", "education", "leadership"] },
  { status: "registry complete", nodes: ["featured", "indexed", "excluded", "verified"] },
  { status: "healthy · ready to connect", nodes: ["email", "GitHub", "LinkedIn"] },
] as const;

export function BackendStage({ progress, activeScene }: Readonly<{ progress: MotionValue<number>; activeScene: number }>) {
  const progressScale = useTransform(progress, [0, 1], [0, 1], { clamp: true });
  const state = visualStates[activeScene] ?? visualStates[0];
  const scene = sceneRanges[activeScene] ?? sceneRanges[0];

  return (
    <aside className="bk-stage" aria-hidden="true">
      <div className="bk-stage__grid" />
      <div className="bk-stage__panel">
        <div className="bk-stage__topline">
          <span>CONTROL PLANE</span>
          <span>{String(activeScene + 1).padStart(2, "0")} / {String(sceneRanges.length).padStart(2, "0")}</span>
        </div>

        <div className="bk-stage__core">
          <span className="bk-state-dot" />
          <span>{state.status}</span>
        </div>

        <div className="bk-stage__diagram" data-scene={scene.id}>
          <div className="bk-stage__spine" />
          {state.nodes.map((node, index) => (
            <motion.div
              key={`${scene.id}-${node}`}
              className={`bk-stage__node bk-stage__node--${index % 3}`}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.24, delay: index * 0.035 }}
            >
              <span>{node}</span>
              <i>{index === 0 ? "active" : index === state.nodes.length - 1 ? "verified" : "linked"}</i>
            </motion.div>
          ))}
        </div>

        <ol className="bk-stage__grammar">
          {["desired", "plan", "review", "apply", "events", "observe", "converge"].map((step, index) => {
            const threshold = index / 7;
            return <li key={step} className={scene.end >= threshold ? "is-resolved" : ""}>{step}</li>;
          })}
        </ol>
      </div>

      <div className="bk-progress" aria-hidden>
        <motion.div className="bk-progress__fill" style={{ scaleY: progressScale }} />
        {sceneRanges.map((item, index) => (
          <span key={item.id} className={index === activeScene ? "is-active" : ""} style={{ top: `${item.start * 100}%` }} />
        ))}
      </div>
    </aside>
  );
}
