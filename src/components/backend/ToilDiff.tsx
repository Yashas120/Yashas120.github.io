"use client";

import { motion } from "framer-motion";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#60a5fa";
const GREEN = "#4ade80";
const RED = "#f87171";

interface DiffEntry {
  id: string;
  title: string;
  before: string[];
  after: string[];
  delta: string;
}

const diffs: DiffEntry[] = [
  {
    id: "provisioning",
    title: "provisioning infrastructure",
    before: [
      "open the AWS console; click through EC2, ECS, Lambda, RDS, IAM",
      "repeat it for dev, stage and prod, from memory",
      "discover the drift during the next incident",
    ],
    after: [
      'module "px_cloud" { source = "./modules/common" }',
      "one reviewed PR provisions every environment identically",
      "drift shows up in a plan, not in a postmortem",
    ],
    delta: "9 services · 3 envs · 0 console clicks",
  },
  {
    id: "deploys",
    title: "shipping the deploy",
    before: ["apply the plan serially and babysit it", "refresh the console, wait, hope"],
    after: [
      "dependency graph parallelized across independent resources",
      "CI applies it; the engineer reviews the diff, not the keystrokes",
    ],
    delta: "-50% deploy time",
  },
  {
    id: "sdks",
    title: "keeping client SDKs current",
    before: [
      "an API changes, so hand-edit the Python SDK",
      "hand-edit the Java SDK, bump versions, publish both",
      "about four hours, every single time, easy to get wrong",
    ],
    after: [
      "pipeline regenerates both SDKs from the spec on merge",
      "publishes them versioned, with no human in the path",
    ],
    delta: "4h → 0",
  },
  {
    id: "workflows",
    title: "cross-service workflows",
    before: ["a cron job polls for changes every few minutes", "a person watches a dashboard and kicks off the next job"],
    after: [
      "DynamoDB streams → SNS fan-out → SQS → Lambda",
      "services react to events; nobody is the message bus",
    ],
    delta: "polling → event-driven",
  },
  {
    id: "questions",
    title: "answering the same question again",
    before: ["interrupt an engineer on the CI/CD channel", "scroll months of history for an answer someone already gave"],
    after: [
      "RAG bot indexed on the channel, answering with citations",
      "it escalates to a human when the index does not cover it",
    ],
    delta: "async · cited · always on",
  },
  {
    id: "auth",
    title: "migrating authentication",
    before: ["big-bang cutover across products over a weekend", "roll everything back if one product breaks"],
    after: ["Ping → Okta, product by product, behind checks", "7 products migrated with zero production impact"],
    delta: "0 incidents",
  },
  {
    id: "tooling",
    title: "local dev tooling",
    before: ["buy a Docker Desktop seat for every engineer"],
    after: ["scripted an equivalent runtime rollout across the team's machines"],
    delta: "$1,500/yr back",
  },
];

function Line({ sign, text }: { sign: "-" | "+"; text: string }) {
  const color = sign === "-" ? RED : GREEN;
  return (
    <p
      className={`flex gap-2 px-3 py-1 font-mono text-[11px] leading-relaxed ${
        sign === "-" ? "text-zinc-500" : "text-zinc-200"
      }`}
      style={{ background: hexToRgba(color, 0.06) }}
    >
      <span style={{ color }}>{sign}</span>
      <span>{text}</span>
    </p>
  );
}

export function ToilDiff() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {diffs.map((d, i) => (
        <motion.div
          key={d.id}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className="overflow-hidden rounded-xl border border-line/10 bg-ink-800"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/10 px-4 py-2.5">
            <span className="font-mono text-[11px] text-zinc-300">{d.title}</span>
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[10px]"
              style={{ background: hexToRgba(ACCENT, 0.12), color: ACCENT }}
            >
              {d.delta}
            </span>
          </div>

          <div className="px-4 pt-2 font-mono text-[10px] text-zinc-600">--- the manual way</div>
          <div className="mt-1 space-y-px px-1">
            {d.before.map((b) => (
              <Line key={b} sign="-" text={b} />
            ))}
          </div>

          <div className="px-4 pt-2.5 font-mono text-[10px] text-zinc-600">+++ what shipped instead</div>
          <div className="mb-3 mt-1 space-y-px px-1">
            {d.after.map((a) => (
              <Line key={a} sign="+" text={a} />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
