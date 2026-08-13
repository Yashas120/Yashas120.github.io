"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { cardProps } from "@/data/demos";
import { LiveDemo } from "./LiveDemo";
import { usePrefersReducedMotion } from "./bitcoin/parts";

const ACCENT = "#a3e635";
const TASK_COLORS = ["#38bdf8", "#f59e0b", "#f472b6", "#a78bfa", "#34d399"] as const;

type PolicyId = "cfs" | "fifo" | "ghost" | "shinjuku";
type LoadId = "bursty" | "sustained";
type TaskKind = "latency" | "background";

type SimTask = {
  id: string;
  label: string;
  kind: TaskKind;
  arrival: number;
  service: number;
  remaining: number;
  vruntime: number;
  color: string;
};

type TraceStep = {
  tick: number;
  selectedId: string | null;
  selectedLabel: string;
  tasks: SimTask[];
  decision: string;
  path: string[];
};

const POLICIES: readonly {
  id: PolicyId;
  label: string;
  location: "kernel" | "user space";
  rule: string;
}[] = [
  {
    id: "cfs",
    label: "Linux CFS",
    location: "kernel",
    rule: "Teaching model: choose the runnable task with the smallest virtual runtime.",
  },
  {
    id: "fifo",
    label: "Linux FIFO",
    location: "kernel",
    rule: "Teaching model: keep the oldest runnable task until it completes.",
  },
  {
    id: "ghost",
    label: "ghOSt policy",
    location: "user space",
    rule: "Example user-space rule: serve latency work while reserving periodic turns for background work.",
  },
  {
    id: "shinjuku",
    label: "Shinjuku-style",
    location: "user space",
    rule: "Teaching model: favor the shortest latency-sensitive request, then the shortest remaining task.",
  },
] as const;

function taskFixture(load: LoadId): SimTask[] {
  const arrivals = load === "bursty" ? [0, 0, 1, 1, 4] : [0, 2, 4, 6, 8];
  const source = [
    ["get-01", "GET 01", "latency", 2, 1],
    ["compact", "compaction", "background", 6, 0],
    ["get-02", "GET 02", "latency", 1, 3],
    ["flush", "memtable flush", "background", 4, 2],
    ["get-03", "GET 03", "latency", 2, 4],
  ] as const;

  return source.map(([id, label, kind, service, vruntime], index) => ({
    id,
    label,
    kind,
    arrival: arrivals[index],
    service,
    remaining: service,
    vruntime,
    color: TASK_COLORS[index],
  }));
}

function cloneTasks(tasks: SimTask[]): SimTask[] {
  return tasks.map((task) => ({ ...task }));
}

function selectTask(policy: PolicyId, ready: SimTask[], runningId: string | null, tick: number): SimTask {
  const byArrival = (a: SimTask, b: SimTask) => a.arrival - b.arrival || a.id.localeCompare(b.id);
  if (policy === "fifo") {
    return ready.find((task) => task.id === runningId) ?? [...ready].sort(byArrival)[0];
  }
  if (policy === "cfs") {
    return [...ready].sort((a, b) => a.vruntime - b.vruntime || byArrival(a, b))[0];
  }
  if (policy === "shinjuku") {
    return [...ready].sort((a, b) => {
      const classOrder = Number(a.kind === "background") - Number(b.kind === "background");
      return classOrder || a.remaining - b.remaining || byArrival(a, b);
    })[0];
  }

  const background = ready.filter((task) => task.kind === "background").sort(byArrival);
  const latency = ready.filter((task) => task.kind === "latency").sort(byArrival);
  if (tick > 0 && tick % 4 === 0 && background.length > 0) return background[0];
  return latency[0] ?? background[0] ?? [...ready].sort(byArrival)[0];
}

function buildTrace(initial: SimTask[], policy: PolicyId): TraceStep[] {
  const tasks = cloneTasks(initial);
  const trace: TraceStep[] = [];
  let runningId: string | null = null;
  const maxTicks = tasks.reduce((sum, task) => sum + task.service, 0) + Math.max(...tasks.map((task) => task.arrival)) + 1;

  for (let tick = 0; tick < maxTicks && tasks.some((task) => task.remaining > 0); tick += 1) {
    const ready = tasks.filter((task) => task.arrival <= tick && task.remaining > 0);
    if (ready.length === 0) {
      trace.push({
        tick,
        selectedId: null,
        selectedLabel: "idle",
        tasks: cloneTasks(tasks),
        decision: "No runnable task has arrived, so the CPU remains idle.",
        path: ["arrival check", "idle"],
      });
      runningId = null;
      continue;
    }

    const selected = selectTask(policy, ready, runningId, tick);
    const before = selected.remaining;
    selected.remaining -= 1;
    selected.vruntime += 1;
    runningId = policy === "fifo" && selected.remaining > 0 ? selected.id : null;
    const location = policy === "cfs" || policy === "fifo" ? "kernel" : "user-space agent";
    const decision = `${location} selected ${selected.label}; modeled service decreases ${before} → ${selected.remaining}.`;
    const path = policy === "cfs" || policy === "fifo"
      ? ["runnable queue", "kernel policy", `dispatch ${selected.label}`]
      : ["kernel status", "ghOSt message", "user-space policy", "commit", `dispatch ${selected.label}`];

    trace.push({
      tick,
      selectedId: selected.id,
      selectedLabel: selected.label,
      tasks: cloneTasks(tasks),
      decision,
      path,
    });
  }
  return trace;
}

function rgba(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  return `rgba(${parseInt(value.slice(0, 2), 16)}, ${parseInt(value.slice(2, 4), 16)}, ${parseInt(value.slice(4, 6), 16)}, ${alpha})`;
}

function useIsLight(): boolean {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setLight(root.classList.contains("light"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return light;
}

function ConfigurationSelect({
  label,
  value,
  onChange,
  options,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}>) {
  return (
    <label className="flex min-w-[128px] flex-1 flex-col gap-1 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border bg-ink-900 px-2.5 text-xs normal-case tracking-normal text-zinc-200"
        style={{ borderColor: "rgb(var(--line) / 0.14)" }}
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

export function GhostDemo({ embedded = false }: Readonly<{ embedded?: boolean }> = {}) {
  const reducedMotion = usePrefersReducedMotion();
  const light = useIsLight();
  const accent = light ? "#3f6212" : ACCENT;
  const action = light ? "#84cc16" : ACCENT;
  const [policyId, setPolicyId] = useState<PolicyId>("ghost");
  const [load, setLoad] = useState<LoadId>("bursty");
  const [threads, setThreads] = useState("16");
  const [memory, setMemory] = useState("16 GB");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const initialTasks = useMemo(() => taskFixture(load), [load]);
  const trace = useMemo(() => buildTrace(initialTasks, policyId), [initialTasks, policyId]);
  const policy = POLICIES.find((item) => item.id === policyId) ?? POLICIES[0];
  const current = step > 0 ? trace[Math.min(step - 1, trace.length - 1)] : null;
  const visibleTasks = current?.tasks ?? initialTasks;

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [load, policyId]);

  useEffect(() => {
    if (!playing) return;
    if (reducedMotion) {
      setStep(trace.length);
      setPlaying(false);
      return;
    }
    if (step >= trace.length) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setStep((value) => Math.min(value + 1, trace.length)), 650);
    return () => window.clearTimeout(timer);
  }, [playing, reducedMotion, step, trace.length]);

  const reset = () => {
    setPlaying(false);
    setStep(0);
  };
  const play = () => {
    if (step >= trace.length) setStep(0);
    setPlaying((value) => !value);
  };
  const advance = () => {
    setPlaying(false);
    setStep((value) => Math.min(value + 1, trace.length));
  };

  return (
    <LiveDemo
      title="ghOSt kernel rebuild and RocksDB scheduler analysis"
      subtitle="Rebuilt Linux with ghOSt, then compared kernel-only and user-space scheduling configurations under controlled RocksDB runs."
      accent={accent}
      embedded={embedded}
      {...cardProps("ghost")}
    >
      <section className="mb-4 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]" aria-labelledby="ghost-explainer-title">
        <div className="rounded-lg border p-4" style={{ borderColor: rgba(accent, 0.28), background: rgba(accent, 0.045) }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: accent }}>The niche, in plain English</p>
          <h3 id="ghost-explainer-title" className="mt-2 text-base font-semibold text-zinc-100">What is ghOSt?</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
            A normal Linux scheduler keeps both the low-level CPU mechanism and the policy for choosing the next runnable thread in the kernel. ghOSt keeps the kernel mechanisms, but lets a user-space agent make scheduling-policy decisions and commit them back to the kernel for dispatch.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
            That separation is useful for specialized data-center workloads: a policy can target latency, throughput, or another workload-specific objective and can be developed or upgraded without putting all of its complexity into the kernel or rebooting the host for every policy change.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px]">
            <a className="min-h-11 py-3 text-zinc-400 hover:text-zinc-100" href="https://github.com/google/ghost-userspace" target="_blank" rel="noreferrer noopener">Upstream ghOSt source</a>
            <a className="min-h-11 py-3 text-zinc-400 hover:text-zinc-100" href="https://doi.org/10.1145/3477132.3483542" target="_blank" rel="noreferrer noopener">SOSP ’21 paper</a>
          </div>
        </div>

        <div className="rounded-lg border p-4" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">What the project did</p>
          <ol className="mt-3 space-y-3">
            <ProjectStep number="01" title="Rebuild the kernel" body="Built and configured the ghOSt-enabled Linux kernel and its user-space components." accent={accent} />
            <ProjectStep number="02" title="Create both comparison paths" body="Prepared kernel-only baselines and ghOSt configurations where policy decisions move into a user-space agent." accent={accent} />
            <ProjectStep number="03" title="Run and analyze RocksDB" body="Executed controlled RocksDB runs across the recorded load, thread, and memory configurations, then analyzed latency and throughput behavior." accent={accent} />
          </ol>
        </div>
      </section>

      <p className="mb-4 rounded-lg border px-3 py-2 text-[12px] leading-relaxed text-zinc-400" style={{ borderColor: rgba(accent, 0.28), background: rgba(accent, 0.06) }}>
        This deterministic teaching model does not run Linux, ghOSt, RocksDB, or the original experiments. It explains policy placement and dispatch flow without inventing latency, throughput, or a winning scheduler.
      </p>

      <div className="flex flex-wrap gap-1 pb-1" role="group" aria-label="Scheduling policy">
        {POLICIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPolicyId(item.id)}
            aria-pressed={policyId === item.id}
            className="whitespace-nowrap rounded-md border px-3 font-mono text-[11px]"
            style={{
              borderColor: policyId === item.id ? rgba(accent, 0.55) : "rgb(var(--line) / 0.12)",
              background: policyId === item.id ? rgba(accent, 0.12) : "transparent",
              color: policyId === item.id ? accent : "rgb(var(--zinc-400))",
            }}
          >
            <span className="block">{item.label}</span>
            <span className="mt-0.5 block text-[9px] uppercase tracking-wide">{item.location === "kernel" ? "kernel baseline" : "via user space"}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <ConfigurationSelect label="load" value={load} onChange={(value) => setLoad(value as LoadId)} options={[{ value: "bursty", label: "Bursty" }, { value: "sustained", label: "Sustained" }]} />
        <ConfigurationSelect label="threads" value={threads} onChange={setThreads} options={[{ value: "16", label: "16 threads" }, { value: "32", label: "32 threads" }]} />
        <ConfigurationSelect label="memory" value={memory} onChange={setMemory} options={[{ value: "16 GB", label: "16 GB" }, { value: "32 GB", label: "32 GB" }]} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.25fr]">
        <section className="rounded-lg border p-3" style={{ borderColor: "rgb(var(--line) / 0.12)" }} aria-labelledby="ghost-boundary-title">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-zinc-400">policy boundary</p>
              <h3 id="ghost-boundary-title" className="mt-1 text-sm font-semibold text-zinc-200">{policy.label} · {policy.location}</h3>
            </div>
            <span className="rounded-full px-2 py-1 font-mono text-[9px] uppercase" style={{ background: rgba(accent, 0.1), color: accent }}>{policy.location}</span>
          </div>
          <p className="mt-2 min-h-[42px] text-xs leading-relaxed text-zinc-400">{policy.rule}</p>

          <div className="mt-4 space-y-2 font-mono text-[11px]">
            <BoundaryNode label="Runnable work" active={!!current} />
            <ArrowDown />
            <BoundaryNode label="Linux kernel mechanisms" active={!!current} />
            {(policyId === "ghost" || policyId === "shinjuku") && (
              <>
                <div className="flex items-center gap-2 py-1 text-[10px] text-zinc-400"><span className="h-px flex-1" style={{ background: rgba(accent, 0.35) }} />status / decision messages<span className="h-px flex-1" style={{ background: rgba(accent, 0.35) }} /></div>
                <BoundaryNode label="User-space scheduling agent" active={!!current} accent />
                <ArrowDown />
                <BoundaryNode label="Commit dispatch decision" active={!!current} />
              </>
            )}
            <ArrowDown />
            <BoundaryNode label={current ? `CPU → ${current.selectedLabel}` : "CPU → awaiting first step"} active={!!current} accent />
          </div>
        </section>

        <section className="rounded-lg border p-3" style={{ borderColor: "rgb(var(--line) / 0.12)" }} aria-labelledby="ghost-trace-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-zinc-400">deterministic dispatch trace</p>
              <h3 id="ghost-trace-title" className="mt-1 text-sm font-semibold text-zinc-200">Tick {step} / {trace.length}</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={play} className="inline-flex items-center gap-1.5 rounded-md px-3 font-mono text-[11px] font-semibold" style={{ background: action, color: "#111827" }}>
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{playing ? "pause" : step >= trace.length ? "replay" : "run"}
              </button>
              <button type="button" onClick={advance} disabled={step >= trace.length} className="inline-flex items-center gap-1 rounded-md border px-2.5 font-mono text-[11px] text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40" style={{ borderColor: "rgb(var(--line) / 0.14)" }}>
                <SkipForward className="h-3.5 w-3.5" /> step
              </button>
              <button type="button" onClick={reset} aria-label="Reset dispatch trace" className="inline-flex items-center rounded-md border px-2 text-zinc-400" style={{ borderColor: "rgb(var(--line) / 0.14)" }}>
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {visibleTasks.map((task) => {
              const arrived = task.arrival <= (current?.tick ?? 0);
              const selected = current?.selectedId === task.id;
              const completed = task.remaining === 0;
              return (
                <div key={task.id} className="rounded-md border p-2" style={{ borderColor: selected ? task.color : "rgb(var(--line) / 0.1)", background: selected ? rgba(task.color, 0.09) : "transparent" }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-[11px] font-semibold text-zinc-300">{task.label}</span>
                    <span className="font-mono text-[9px] uppercase text-zinc-400">{completed ? "done" : arrived ? task.kind : `arrives t${task.arrival}`}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "rgb(var(--line) / 0.08)" }}>
                    <span className="block h-full rounded-full" style={{ width: `${((task.service - task.remaining) / task.service) * 100}%`, background: task.color }} />
                  </div>
                  <p className="mt-1 font-mono text-[9px] text-zinc-400">modeled service remaining {task.remaining}/{task.service}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-3 rounded-md px-3 py-2" style={{ background: "rgb(var(--line) / 0.05)" }}>
            <p className="font-mono text-[10px] uppercase tracking-wide text-zinc-400">decision log</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-300" aria-live="polite">{current?.decision ?? "Choose a policy, then run or step through the trace."}</p>
            {current && (
              <div className="mt-2 flex flex-wrap items-center gap-1 font-mono text-[9px] text-zinc-400">
                {current.path.map((node, index) => (
                  <span key={`${node}-${index}`} className="contents"><span>{node}</span>{index < current.path.length - 1 && <ArrowRight className="h-3 w-3" aria-hidden="true" />}</span>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MatrixFact label="Experiment selection" value={`RocksDB · ${load} load`} />
        <MatrixFact label="Machine configuration" value={`${threads} threads · ${memory}`} />
        <MatrixFact label="Interpretation boundary" value="No synthetic latency or throughput" />
      </div>
    </LiveDemo>
  );
}

function ProjectStep({ number, title, body, accent }: Readonly<{ number: string; title: string; body: string; accent: string }>) {
  return (
    <li className="grid grid-cols-[28px_1fr] gap-2">
      <span className="font-mono text-[10px]" style={{ color: accent }}>{number}</span>
      <div><p className="text-[13px] font-semibold text-zinc-200">{title}</p><p className="mt-0.5 text-[12px] leading-relaxed text-zinc-500">{body}</p></div>
    </li>
  );
}

function BoundaryNode({ label, active, accent = false }: Readonly<{ label: string; active: boolean; accent?: boolean }>) {
  return (
    <div className="rounded-md border px-3 py-2 text-zinc-300" style={{ borderColor: active ? rgba(ACCENT, accent ? 0.55 : 0.3) : "rgb(var(--line) / 0.1)", background: active && accent ? rgba(ACCENT, 0.09) : "transparent" }}>
      {label}
    </div>
  );
}

function ArrowDown() {
  return <div className="pl-4 text-zinc-600" aria-hidden="true">↓</div>;
}

function MatrixFact({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
      <p className="font-mono text-[9px] uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-300">{value}</p>
    </div>
  );
}

export const GhostLab = () => <GhostDemo embedded />;
