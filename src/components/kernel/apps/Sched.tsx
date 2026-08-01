"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { hexToRgba } from "@/lib/utils";
import { PHOSPHOR } from "../desktop/types";
import { AppHeader } from "./ui";

interface Policy {
  id: string;
  label: string;
  note: string;
  tick: number;
  p99: string;
  tput: string;
}

const POLICIES: Policy[] = [
  { id: "ghost", label: "ghOSt", note: "user-space policy drives kernel scheduling", tick: 1000, p99: "0.9 ms", tput: "high" },
  { id: "cfs", label: "CFS", note: "completely fair — weighted vruntime", tick: 1000, p99: "3.4 ms", tput: "medium" },
  { id: "fifo", label: "FIFO", note: "first in, first out, no preemption", tick: 1400, p99: "11.2 ms", tput: "low" },
  { id: "shinjuku", label: "Shinjuku", note: "centralized single queue, low tail latency", tick: 700, p99: "0.6 ms", tput: "high" },
];

const TASKS = ["dataplane", "terraform", "spark-job", "sfm-recon", "rag-index", "compiler", "grader"];

export function Sched() {
  const [policyId, setPolicyId] = useState("ghost");
  const [running, setRunning] = useState(0);
  const [queue, setQueue] = useState(TASKS);

  const policy = POLICIES.find((p) => p.id === policyId) ?? POLICIES[0];

  useEffect(() => {
    const iv = setInterval(() => {
      setRunning((r) => (r + 1) % TASKS.length);
      setQueue((q) => {
        const [head, ...rest] = q;
        return [...rest, head];
      });
    }, policy.tick);
    return () => clearInterval(iv);
  }, [policy.tick]);

  return (
    <div className="min-h-full">
      <AppHeader
        command="cat /sys/kernel/sched_class"
        hint="from “Performance Analysis of the ghOSt Scheduler”"
      />

      <div className="space-y-4 p-4">
        <p className="font-sans text-[12px] leading-relaxed text-zinc-400">
          I rebuilt the Linux kernel around Google&apos;s ghOSt framework so user-space processes
          could drive scheduling policy, then benchmarked CFS, FIFO, and Shinjuku with and without
          ghOSt on RocksDB and a backend server — across burst and prolonged load, 16 and 32 threads,
          and 16 and 32 GB of RAM. Pick a policy to see it schedule.
        </p>

        <div className="flex flex-wrap gap-2">
          {POLICIES.map((p) => {
            const active = p.id === policyId;
            return (
              <button
                key={p.id}
                onClick={() => setPolicyId(p.id)}
                className="rounded-md border px-3 py-1.5 font-mono text-[11px] transition-colors"
                style={{
                  borderColor: active ? PHOSPHOR : "rgb(var(--line) / 0.12)",
                  color: active ? PHOSPHOR : "rgb(var(--zinc-400))",
                  background: active ? hexToRgba(PHOSPHOR, 0.08) : "transparent",
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px]">
          <span className="text-zinc-500">
            policy: <span className="text-zinc-300">{policy.note}</span>
          </span>
          <span className="text-zinc-500">
            p99: <span style={{ color: PHOSPHOR }}>{policy.p99}</span>
          </span>
          <span className="text-zinc-500">
            throughput: <span className="text-zinc-300">{policy.tput}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-zinc-500">CPU0</span>
          <div
            className="crt relative h-12 flex-1 overflow-hidden rounded-md border"
            style={{ borderColor: hexToRgba(PHOSPHOR, 0.3) }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={TASKS[running]}
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center font-mono text-sm"
                style={{ color: PHOSPHOR }}
              >
                ▸ executing: {TASKS[running]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="flex-shrink-0 font-mono text-[11px] text-zinc-500">runqueue</span>
          {queue.slice(0, 6).map((t, i) => (
            <motion.span
              layout
              key={t}
              className="whitespace-nowrap rounded border px-2 py-1 font-mono text-[10px] text-zinc-400"
              style={{ borderColor: "rgb(var(--line) / 0.1)", opacity: 1 - i * 0.12 }}
            >
              {t}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}
