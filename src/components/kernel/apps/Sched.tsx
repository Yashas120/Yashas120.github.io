"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import { hexToRgba } from "@/lib/utils";
import { PHOSPHOR } from "../desktop/types";
import { AppHeader } from "./ui";

const POLICIES = [
  { id: "cfs", label: "Linux CFS", kind: "Kernel baseline", note: "Linux fair-scheduling baseline" },
  { id: "fifo", label: "Linux FIFO", kind: "Kernel baseline", note: "Linux real-time FIFO baseline" },
  { id: "ghost", label: "ghOSt policy", kind: "User-space policy", note: "Scheduling decisions made by a user-space agent" },
  { id: "shinjuku", label: "Shinjuku-style", kind: "ghOSt user-space policy", note: "Verified Shinjuku-style experimental configuration" },
] as const;

const TASKS = ["request-1", "request-2", "compaction", "request-3", "background-work"];

export function Sched() {
  const [policyId, setPolicyId] = useState<(typeof POLICIES)[number]["id"]>("ghost");
  const [workload, setWorkload] = useState("RocksDB");
  const [load, setLoad] = useState("Bursty");
  const [threads, setThreads] = useState("16");
  const [memory, setMemory] = useState("16 GB");
  const [running, setRunning] = useState(0);
  const policy = POLICIES.find((item) => item.id === policyId) ?? POLICIES[0];

  return (
    <div className="min-h-full">
      <AppHeader command="sched — experiment architecture" hint="configuration, not benchmark output" />
      <div className="space-y-4 p-4">
        <div className="rounded-md border border-amber-300/30 bg-amber-300/5 px-3 py-2 font-sans text-[12px] leading-relaxed text-amber-200">
          Conceptual visualization of the experiment architecture—not measured output.
        </div>
        <p className="font-sans text-[12px] leading-relaxed text-zinc-400">
          Built and instrumented a ghOSt-compatible Linux environment to compare user-space scheduling
          policies with Linux CFS and FIFO baselines. Repeatable runs varied workload, load pattern,
          concurrency, and memory configuration. No unsupported latency or throughput results are shown.
        </p>

        <fieldset>
          <legend className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Scheduler configuration</legend>
          <div className="flex flex-wrap gap-2">
            {POLICIES.map((item) => {
              const selected = item.id === policyId;
              return (
                <button
                  key={item.id}
                  onClick={() => setPolicyId(item.id)}
                  aria-pressed={selected}
                  className="min-h-11 rounded-md border px-3 py-1.5 text-left font-mono text-[11px] transition-colors"
                  style={{ borderColor: selected ? PHOSPHOR : "rgb(var(--line) / 0.12)", color: selected ? PHOSPHOR : "rgb(var(--zinc-400))", background: selected ? hexToRgba(PHOSPHOR, 0.08) : "transparent" }}
                >
                  <span className="block">{item.label}</span>
                  <span className="block text-[9px] text-zinc-600">{item.kind}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <ConfigSelect label="Workload" value={workload} onChange={setWorkload} options={["RocksDB", "Backend server"]} />
          <ConfigSelect label="Load" value={load} onChange={setLoad} options={["Bursty", "Sustained"]} />
          <ConfigSelect label="Threads" value={threads} onChange={setThreads} options={["16", "32"]} />
          <ConfigSelect label="Memory" value={memory} onChange={setMemory} options={["16 GB", "32 GB"]} />
        </div>

        <dl className="grid gap-2 rounded-md border p-3 font-mono text-[10px] sm:grid-cols-2" style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
          <div><dt className="text-zinc-600">Selected approach</dt><dd className="mt-0.5 text-zinc-300">{policy.note}</dd></div>
          <div><dt className="text-zinc-600">Run configuration</dt><dd className="mt-0.5 text-zinc-300">{workload} · {load} · {threads} threads · {memory}</dd></div>
        </dl>

        <div className="rounded-md border p-3" style={{ borderColor: hexToRgba(PHOSPHOR, 0.25) }}>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-zinc-500">
            <span className="rounded border px-2 py-1" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>workload creates runnable tasks</span>
            <span style={{ color: PHOSPHOR }}>→</span>
            <span className="rounded border px-2 py-1" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>kernel mechanism</span>
            {policy.kind !== "Kernel baseline" ? <><span className="text-amber-300">⇄</span><span className="rounded border border-amber-300/30 px-2 py-1 text-amber-200">user-space policy</span></> : null}
            <span style={{ color: PHOSPHOR }}>→</span>
            <span className="rounded border px-2 py-1" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>dispatch + observe</span>
          </div>
          <div className="mt-3 flex min-h-12 items-center justify-between gap-3 rounded bg-black/20 px-3 font-mono text-[11px]">
            <span className="text-zinc-500">illustrated dispatch:</span>
            <span style={{ color: PHOSPHOR }}>▸ {TASKS[running]}</span>
            <button onClick={() => setRunning((index) => (index + 1) % TASKS.length)} className="inline-flex min-h-11 items-center gap-1.5 rounded px-2 text-zinc-300 hover:bg-line/10">
              <RotateCw className="h-3.5 w-3.5" /> Dispatch next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigSelect({ label, value, onChange, options }: Readonly<{ label: string; value: string; onChange: (value: string) => void; options: string[] }>) {
  return (
    <label className="font-mono text-[9px] uppercase tracking-wide text-zinc-600">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-11 w-full rounded border bg-ink-900 px-2 text-[10px] normal-case text-zinc-300" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
