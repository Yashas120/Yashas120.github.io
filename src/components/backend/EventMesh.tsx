"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Braces, CheckCircle2, Database, Inbox, Radio, Zap } from "lucide-react";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#60a5fa";
const GREEN = "#4ade80";

const nodes = [
  {
    id: "write",
    label: "api.write",
    icon: Braces,
    detail: "A service commits a change. That write is the event — nothing is scheduled and nothing polls for it.",
  },
  {
    id: "stream",
    label: "dynamodb.stream",
    icon: Database,
    detail: "DynamoDB streams the change out of the table the moment it lands, in order.",
  },
  {
    id: "topic",
    label: "sns.topic",
    icon: Radio,
    detail: "One publish, many subscribers. Adding a consumer never means touching the producer.",
  },
  {
    id: "queue",
    label: "sqs.queue",
    icon: Inbox,
    detail: "Buffered and retried, so a slow or restarting consumer never silently drops work.",
  },
  {
    id: "worker",
    label: "lambda.worker",
    icon: Zap,
    detail: "Stateless workers run the step that used to be a ticket assigned to a person.",
  },
  {
    id: "converged",
    label: "service.converged",
    icon: CheckCircle2,
    detail: "The dependent service is up to date. No dashboard was watched and nobody was paged.",
  },
];

export function EventMesh() {
  const [selected, setSelected] = useState(0);
  const active = nodes[selected];

  return (
    <div className="rounded-xl border border-line/10 bg-ink-800 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
        <span className="text-zinc-400">event path · click a hop</span>
        <span className="text-zinc-600">replaced: a cron job and someone watching a dashboard</span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="relative flex min-w-[680px] items-start justify-between gap-2">
          <div className="absolute left-6 right-6 top-6 h-px" style={{ background: hexToRgba(ACCENT, 0.25) }} />

          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute top-6 h-2 w-2 -translate-y-1/2 rounded-full"
              style={{ background: GREEN, boxShadow: `0 0 10px ${hexToRgba(GREEN, 0.9)}` }}
              initial={{ left: "3%" }}
              animate={{ left: ["3%", "96%"] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "linear", delay: i * 1.4 }}
            />
          ))}

          {nodes.map((n, i) => {
            const Icon = n.icon;
            const on = i === selected;
            return (
              <button
                key={n.id}
                onClick={() => setSelected(i)}
                onMouseEnter={() => setSelected(i)}
                className="relative flex flex-1 flex-col items-center gap-2 text-center"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
                    on ? "" : "text-zinc-500"
                  }`}
                  style={{
                    borderColor: on ? ACCENT : "rgb(var(--line) / 0.15)",
                    background: on ? hexToRgba(ACCENT, 0.15) : "rgb(var(--ink-900) / 1)",
                    color: on ? ACCENT : undefined,
                  }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className={`font-mono text-[10px] ${on ? "" : "text-zinc-400"}`}
                  style={{ color: on ? ACCENT : undefined }}
                >
                  {n.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="mt-3 rounded-lg border px-4 py-3"
        style={{ borderColor: hexToRgba(ACCENT, 0.2), background: hexToRgba(ACCENT, 0.05) }}
      >
        <p className="font-mono text-[11px]" style={{ color: ACCENT }}>
          {active.label}
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">{active.detail}</p>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
        Configured DynamoDB, SQS and SNS triggers so workflows fire across interdependent services on their own
        <span className="text-zinc-600"> — PX Cloud, Cisco</span>
      </p>
    </div>
  );
}
