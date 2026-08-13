"use client";

import { cardProps } from "@/data/demos";
import { LiveDemo } from "./LiveDemo";

const ACCENT = "#a3e635";

function rgba(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  return `rgba(${parseInt(value.slice(0, 2), 16)}, ${parseInt(value.slice(2, 4), 16)}, ${parseInt(value.slice(4, 6), 16)}, ${alpha})`;
}

const IMPLEMENTATION_STEPS = [
  {
    number: "01",
    title: "Build the scheduling substrate",
    body: "Rebuilt and configured Linux with ghOSt support, then prepared the matching user-space components needed to communicate with the ghOSt scheduling class.",
  },
  {
    number: "02",
    title: "Prepare both sides of the comparison",
    body: "Kept Linux CFS and FIFO as kernel-policy baselines, then configured ghOSt policies—including the Shinjuku-style path—where scheduling decisions are delegated to a user-space agent.",
  },
  {
    number: "03",
    title: "Drive every policy with RocksDB",
    body: "Used the same RocksDB workload definition while varying load pattern, client concurrency, and available memory so the scheduler path was a controlled experimental factor.",
  },
  {
    number: "04",
    title: "Profile and compare like for like",
    body: "Collected latency and throughput for each configuration, then compared tradeoffs across equivalent matrix cells instead of treating one isolated run as a result.",
  },
] as const;

const TEST_MATRIX = [
  ["Scheduler path", "Linux CFS · Linux FIFO · ghOSt policies · Shinjuku-style", "Kernel policy versus delegated user-space policy"],
  ["Load pattern", "Bursty · sustained", "Response to changing and continuous demand"],
  ["Concurrency", "16 · 32 threads", "Behavior as runnable work increases"],
  ["Memory", "16 GB · 32 GB", "Sensitivity to resource pressure"],
  ["Workload", "RocksDB", "One consistent storage workload across the matrix"],
] as const;

export function GhostDemo({ embedded = false }: Readonly<{ embedded?: boolean }> = {}) {
  const accent = ACCENT;

  return (
    <LiveDemo
      {...cardProps("ghost")}
      title="ghOSt kernel rebuild and RocksDB scheduler analysis"
      subtitle="How the ghOSt-enabled Linux environment was built, how the scheduler boundary works, and how the RocksDB comparison was structured."
      accent={accent}
      kind="explainer"
      embedded={embedded}
    >
      <section className="mb-4 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]" aria-labelledby="ghost-explainer-title">
        <div className="rounded-lg border p-4" style={{ borderColor: rgba(accent, 0.28), background: rgba(accent, 0.045) }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: accent }}>The niche, in plain English</p>
          <h3 id="ghost-explainer-title" className="mt-2 text-base font-semibold text-zinc-100">What ghOSt changes</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
            A conventional Linux scheduler keeps the mechanism that switches threads and the policy that chooses the next thread inside the kernel. ghOSt separates those responsibilities: Linux retains the safe, low-level mechanism, while a user-space agent can implement the scheduling policy.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
            That makes specialized policies easier to develop and replace. The agent can optimize for a workload such as a latency-sensitive storage service without moving context switching, state validation, or hardware control out of the kernel.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px]">
            <a className="min-h-11 py-3 text-zinc-400 hover:text-zinc-100" href="https://github.com/google/ghost-userspace" target="_blank" rel="noreferrer noopener">Upstream ghOSt source</a>
            <a className="min-h-11 py-3 text-zinc-400 hover:text-zinc-100" href="https://doi.org/10.1145/3477132.3483542" target="_blank" rel="noreferrer noopener">SOSP ’21 paper</a>
          </div>
        </div>

        <div className="rounded-lg border p-4" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Project scope</p>
          <dl className="mt-3 space-y-3 text-[12px] leading-relaxed">
            <ScopeFact label="Built" value="A ghOSt-enabled Linux kernel environment and its user-space scheduling path" accent={accent} />
            <ScopeFact label="Compared" value="Kernel CFS/FIFO baselines against policies delegated through ghOSt" accent={accent} />
            <ScopeFact label="Exercised with" value="Controlled RocksDB runs across load, concurrency, and memory settings" accent={accent} />
            <ScopeFact label="Evaluated by" value="Latency and throughput tradeoffs; no unsupported benchmark winner is published" accent={accent} />
          </dl>
        </div>
      </section>

      <ArchitectureDiagram accent={accent} />

      <section className="mb-4 rounded-lg border p-4" style={{ borderColor: "rgb(var(--line) / 0.12)" }} aria-labelledby="ghost-implementation-title">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: accent }}>Implementation</p>
          <h3 id="ghost-implementation-title" className="mt-1 text-base font-semibold text-zinc-100">How the experiment was built</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">The work was systems integration and evaluation: build the modified kernel path, configure comparable policies, then place RocksDB behind a repeatable experiment harness.</p>
        </div>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {IMPLEMENTATION_STEPS.map((step) => (
            <li key={step.number} className="grid grid-cols-[32px_1fr] gap-2 rounded-md border p-3" style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
              <span className="font-mono text-[10px]" style={{ color: accent }}>{step.number}</span>
              <div>
                <p className="text-[13px] font-semibold text-zinc-200">{step.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-4 rounded-lg border p-4" style={{ borderColor: "rgb(var(--line) / 0.12)" }} aria-labelledby="ghost-testing-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: accent }}>Testing methodology</p>
            <h3 id="ghost-testing-title" className="mt-1 text-base font-semibold text-zinc-100">A controlled scheduler × workload matrix</h3>
          </div>
          <p className="max-w-md text-[11px] leading-relaxed text-zinc-500">Each scheduler was tested under matching RocksDB conditions; only then were latency and throughput compared.</p>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border" style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
          <table className="w-full min-w-[620px] border-collapse text-left text-[11px]">
            <thead style={{ background: rgba(accent, 0.07) }}>
              <tr className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-400">
                <th className="px-3 py-2.5 font-medium">Factor</th>
                <th className="px-3 py-2.5 font-medium">Values tested</th>
                <th className="px-3 py-2.5 font-medium">What it isolates</th>
              </tr>
            </thead>
            <tbody>
              {TEST_MATRIX.map(([factor, values, purpose]) => (
                <tr key={factor} className="border-t" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>
                  <th scope="row" className="whitespace-nowrap px-3 py-2.5 font-semibold text-zinc-300">{factor}</th>
                  <td className="px-3 py-2.5 text-zinc-400">{values}</td>
                  <td className="px-3 py-2.5 text-zinc-500">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TestLoop accent={accent} />
      </section>

      <section className="grid gap-3 sm:grid-cols-2" aria-labelledby="ghost-interpretation-title">
        <div className="rounded-lg border p-4" style={{ borderColor: rgba(accent, 0.25), background: rgba(accent, 0.045) }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: accent }}>What the comparison answers</p>
          <h3 id="ghost-interpretation-title" className="mt-1 text-sm font-semibold text-zinc-200">Does policy placement change RocksDB behavior?</h3>
          <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">The analysis looks for workload-dependent latency/throughput tradeoffs when moving from general-purpose or fixed kernel policies to a configurable user-space scheduler.</p>
        </div>
        <div className="rounded-lg border p-4" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Evidence boundary</p>
          <h3 className="mt-1 text-sm font-semibold text-zinc-200">Method documented; numbers withheld</h3>
          <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">This page explains the implementation and test design. It does not simulate scheduler output, rerun Linux or RocksDB in the browser, or publish unverified measurements.</p>
        </div>
      </section>
    </LiveDemo>
  );
}

function ArchitectureDiagram({ accent }: Readonly<{ accent: string }>) {
  return (
    <section className="mb-4 rounded-lg border p-4" style={{ borderColor: "rgb(var(--line) / 0.12)" }} aria-labelledby="ghost-architecture-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: accent }}>Architecture</p>
          <h3 id="ghost-architecture-title" className="mt-1 text-base font-semibold text-zinc-100">The scheduling control loop</h3>
        </div>
        <p className="max-w-md text-[11px] leading-relaxed text-zinc-500">Events move up to the policy; decisions move down to kernel mechanism.</p>
      </div>

      <figure className="mt-4" aria-labelledby="ghost-architecture-caption">
        <div className="overflow-hidden rounded-lg border" style={{ borderColor: rgba(accent, 0.24), background: rgba(accent, 0.025) }}>
          <div className="border-b p-3" style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
            <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">User space</p>
            <div className="grid items-stretch gap-2 md:grid-cols-[1fr_auto_1fr]">
              <ArchitectureNode eyebrow="application" title="RocksDB threads" body="Foreground requests plus flush and compaction work become runnable tasks." />
              <ArchitectureArrow label="workload hints" />
              <ArchitectureNode eyebrow="scheduling policy" title="ghOSt agent" body="Orders runnable work and chooses a task-to-CPU placement." accent={accent} />
            </div>
          </div>

          <div className="grid gap-2 border-b px-3 py-3 md:grid-cols-2" style={{ borderColor: "rgb(var(--line) / 0.1)", background: rgba(accent, 0.055) }}>
            <ArchitectureChannel arrow="↑" title="Kernel → agent" body="Task events and shared CPU/task state flow through the ghOSt interface." accent={accent} />
            <ArchitectureChannel arrow="↓" title="Agent → kernel" body="A scheduling transaction requests a specific task-to-CPU action." accent={accent} />
          </div>

          <div className="p-3">
            <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">ghOSt-enabled Linux kernel</p>
            <div className="grid items-stretch gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
              <ArchitectureNode eyebrow="state + events" title="ghOSt scheduling class" body="Tracks enrolled threads and reports lifecycle changes." />
              <ArchitectureArrow label="transaction" />
              <ArchitectureNode eyebrow="kernel mechanism" title="Validate + commit" body="Checks current state and atomically applies valid actions." accent={accent} />
              <ArchitectureArrow label="dispatch" />
              <ArchitectureNode eyebrow="execution" title="CPU cores" body="Linux performs the context switch and runs the selected RocksDB thread." />
            </div>
          </div>

          <div className="border-t px-3 py-2.5" style={{ borderColor: rgba(accent, 0.2), background: rgba(accent, 0.075) }}>
            <p className="text-[11px] leading-relaxed text-zinc-400"><span className="font-mono text-[9px] uppercase tracking-wide" style={{ color: accent }}>Enclave</span><span aria-hidden="true"> · </span>Groups the CPUs, agents, and ghOSt-scheduled threads controlled by one policy. Disjoint enclaves can isolate different policies or tenants.</p>
          </div>
        </div>
        <figcaption id="ghost-architecture-caption" className="mt-3 grid gap-2 text-[11px] leading-relaxed text-zinc-500 sm:grid-cols-3">
          <p><span className="font-semibold text-zinc-300">1. Observe.</span> Linux reports runnable-state changes.</p>
          <p><span className="font-semibold text-zinc-300">2. Decide.</span> The user-space agent applies its policy.</p>
          <p><span className="font-semibold text-zinc-300">3. Actuate.</span> Linux validates and dispatches the task.</p>
        </figcaption>
      </figure>
    </section>
  );
}

function TestLoop({ accent }: Readonly<{ accent: string }>) {
  const steps = ["Boot configured environment", "Select scheduler path", "Run matching RocksDB case", "Collect latency + throughput", "Repeat and compare"];
  return (
    <div className="mt-4 rounded-lg border p-3" style={{ borderColor: rgba(accent, 0.2), background: rgba(accent, 0.035) }}>
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">Per-configuration test loop</p>
      <ol className="mt-2 grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]">
        {steps.map((step, index) => (
          <li key={step} className="contents">
            <div className="rounded-md border px-2.5 py-2 text-[10px] leading-relaxed text-zinc-400" style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
              <span className="mr-1 font-mono" style={{ color: accent }}>{index + 1}.</span>{step}
            </div>
            {index < steps.length - 1 && <span className="self-center text-center text-zinc-600" aria-hidden="true">→</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ScopeFact({ label, value, accent }: Readonly<{ label: string; value: string; accent: string }>) {
  return (
    <div className="grid grid-cols-[92px_1fr] gap-2">
      <dt className="font-mono text-[9px] uppercase tracking-wide" style={{ color: accent }}>{label}</dt>
      <dd className="text-zinc-400">{value}</dd>
    </div>
  );
}

function ArchitectureNode({ eyebrow, title, body, accent }: Readonly<{ eyebrow: string; title: string; body: string; accent?: string }>) {
  return (
    <div className="min-w-0 rounded-md border p-3" style={{ borderColor: accent ? rgba(accent, 0.46) : "rgb(var(--line) / 0.12)", background: accent ? rgba(accent, 0.08) : "rgb(var(--line) / 0.025)" }}>
      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">{eyebrow}</p>
      <p className="mt-1 text-[13px] font-semibold text-zinc-200">{title}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{body}</p>
    </div>
  );
}

function ArchitectureArrow({ label }: Readonly<{ label: string }>) {
  return (
    <div className="flex min-h-8 items-center justify-center gap-1.5 px-1 font-mono text-[9px] text-zinc-500 md:flex-col md:gap-0" aria-label={`${label}, right`}>
      <span className="md:hidden">{label}</span>
      <span className="text-base text-zinc-600" aria-hidden="true">→</span>
      <span className="hidden max-w-20 text-center leading-tight md:block">{label}</span>
    </div>
  );
}

function ArchitectureChannel({ arrow, title, body, accent }: Readonly<{ arrow: "↑" | "↓"; title: string; body: string; accent: string }>) {
  return (
    <div className="grid grid-cols-[28px_1fr] gap-2 rounded-md border px-3 py-2.5" style={{ borderColor: rgba(accent, 0.22), background: "rgb(var(--ink-950) / 0.22)" }}>
      <span className="font-mono text-lg" style={{ color: accent }} aria-hidden="true">{arrow}</span>
      <div>
        <p className="text-[12px] font-semibold text-zinc-300">{title}</p>
        <p className="mt-0.5 text-[10px] leading-relaxed text-zinc-500">{body}</p>
      </div>
    </div>
  );
}

export const GhostLab = () => <GhostDemo embedded />;
