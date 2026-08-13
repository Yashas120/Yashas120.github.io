"use client";

import { useEffect, useState, type ComponentType, type CSSProperties } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  ServerCog,
  TerminalSquare,
} from "lucide-react";
import { cardProps } from "@/data/demos";
import { LiveDemo } from "./LiveDemo";
import { usePrefersReducedMotion } from "./bitcoin/parts";
import styles from "./GhostDemo.module.css";

const ACCENT = "#a3e635";

type Phase = {
  short: string;
  title: string;
  detail: string;
  tags: readonly string[];
  Icon: ComponentType<{ className?: string }>;
};

const PHASES: readonly Phase[] = [
  {
    short: "Build",
    title: "Rebuilt Linux for ghOSt",
    detail: "Compiled, configured, and booted the kernel path required by the ghOSt userspace stack.",
    tags: ["kernel config", "kernel build", "boot + verify"],
    Icon: TerminalSquare,
  },
  {
    short: "Configure",
    title: "Prepared four scheduler paths",
    detail: "Kept CFS and FIFO as kernel baselines; configured ghOSt and Shinjuku-style userspace policies.",
    tags: ["CFS", "FIFO", "ghOSt", "Shinjuku-style"],
    Icon: ServerCog,
  },
  {
    short: "Run",
    title: "Drove each path with RocksDB",
    detail: "Ran the same storage workload across controlled load, thread, and memory configurations.",
    tags: ["bursty / sustained", "16 / 32 threads", "16 / 32 GB"],
    Icon: Database,
  },
  {
    short: "Analyze",
    title: "Compared like for like",
    detail: "Profiled matching matrix cells and examined latency–throughput tradeoffs across schedulers.",
    tags: ["latency", "throughput", "controlled comparison"],
    Icon: BarChart3,
  },
] as const;

const ARCHITECTURE = [
  { layer: "user", title: "RocksDB", note: "worker threads", Icon: Database },
  { layer: "kernel", title: "ghOSt class", note: "state + events", Icon: Boxes },
  { layer: "user", title: "Policy agent", note: "chooses task + CPU", Icon: ServerCog },
  { layer: "kernel", title: "Commit", note: "validate action", Icon: Gauge },
  { layer: "hardware", title: "CPU", note: "dispatch thread", Icon: Cpu },
] as const;

const CONNECTORS = ["enroll", "events", "transaction", "dispatch"] as const;

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

export function GhostDemo({ embedded = false }: Readonly<{ embedded?: boolean }> = {}) {
  const reducedMotion = usePrefersReducedMotion();
  const light = useIsLight();
  const accent = light ? "#3f6212" : ACCENT;
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => setPhase((current) => (current + 1) % PHASES.length), 3200);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const selected = PHASES[phase];

  return (
    <LiveDemo
      {...cardProps("ghost")}
      title="ghOSt × RocksDB"
      subtitle="Rebuilt Linux. Compared kernel and userspace schedulers on RocksDB."
      accent={accent}
      kind="explainer"
      embedded={embedded}
      role={undefined}
      result={undefined}
      tech={[]}
      showEvidenceDetails={false}
    >
      <div className={styles.root} style={{ "--ghost-accent": accent } as CSSProperties}>
      <section className={styles.intro} aria-labelledby="ghost-intro-title">
        <div>
          <p className={styles.eyebrow}>Why ghOSt?</p>
          <h3 id="ghost-intro-title">Keep CPU control in Linux. Move scheduling policy to userspace.</h3>
          <p>That separation makes workload-specific schedulers easier to build and replace.</p>
        </div>
        <div className={styles.proofStrip} aria-label="Project summary">
          <Proof value="Linux" label="rebuilt" />
          <Proof value="4 paths" label="configured" />
          <Proof value="RocksDB" label="profiled" />
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="ghost-architecture-title">
        <SectionTitle kicker="Architecture" title="One decision crosses the boundary twice" id="ghost-architecture-title" />
        <figure className={styles.architecture}>
          <div className={styles.flow}>
            {ARCHITECTURE.map(({ layer, title, note, Icon }, index) => (
              <div className="contents" key={title}>
                <div className={`${styles.archNode} ${layer === "user" ? styles.userNode : styles.kernelNode}`}>
                  <span className={styles.layer}>{layer}</span>
                  <Icon className={styles.nodeIcon} aria-hidden="true" />
                  <strong>{title}</strong>
                  <small>{note}</small>
                </div>
                {index < CONNECTORS.length && (
                  <div className={styles.connector} aria-label={CONNECTORS[index]}>
                    <span className={styles.connectorLabel}>{CONNECTORS[index]}</span>
                    <span className={styles.signal} style={{ "--signal-delay": `${index * 0.72}s` } as CSSProperties} aria-hidden="true" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <figcaption>
            <span><Activity aria-hidden="true" /> events rise to the agent</span>
            <span><ArrowRight aria-hidden="true" /> decisions return as validated transactions</span>
          </figcaption>
        </figure>
      </section>

      <section className={styles.panel} aria-labelledby="ghost-work-title">
        <SectionTitle kicker="What I did" title="From kernel build to performance analysis" id="ghost-work-title" />
        <div className={styles.phaseRail} role="tablist" aria-label="Project phases">
          {PHASES.map((item, index) => {
            const active = index === phase;
            return (
              <button
                key={item.short}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="ghost-phase-detail"
                onClick={() => setPhase(index)}
                className={active ? styles.activePhase : undefined}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.short}</strong>
              </button>
            );
          })}
          <span className={styles.phaseProgress} style={{ "--phase": phase } as CSSProperties} aria-hidden="true" />
        </div>

        <div id="ghost-phase-detail" className={styles.phaseDetail} role="tabpanel" aria-live="polite">
          <div className={styles.phaseVisual}>
            <selected.Icon aria-hidden="true" />
            <span className={styles.orbit} aria-hidden="true" />
          </div>
          <div>
            <p className={styles.phaseCount}>0{phase + 1} / 04</p>
            <h4>{selected.title}</h4>
            <p>{selected.detail}</p>
            <div className={styles.tags}>{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </div>
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="ghost-test-title">
        <SectionTitle kicker="How I tested" title="Same RocksDB workload. Controlled variables." id="ghost-test-title" />
        <div className={styles.matrix}>
          <div className={styles.matrixCore}>
            <Database aria-hidden="true" />
            <strong>RocksDB</strong>
            <span>held constant</span>
          </div>
          <MatrixCell Icon={ServerCog} label="Schedulers" values="CFS · FIFO · ghOSt · Shinjuku" />
          <MatrixCell Icon={Activity} label="Load" values="bursty · sustained" />
          <MatrixCell Icon={Cpu} label="Threads" values="16 · 32" />
          <MatrixCell Icon={HardDrive} label="Memory" values="16 GB · 32 GB" />
          <span className={styles.matrixScan} aria-hidden="true" />
        </div>
        <div className={styles.measurement}>
          <Gauge aria-hidden="true" />
          <span>boot</span><ArrowRight aria-hidden="true" />
          <span>run</span><ArrowRight aria-hidden="true" />
          <span>profile</span><ArrowRight aria-hidden="true" />
          <strong>compare latency + throughput</strong>
        </div>
      </section>

      <footer className={styles.footerNote}>
        <span>Method shown; no fabricated benchmark values.</span>
        <a href="https://github.com/google/ghost-userspace" target="_blank" rel="noreferrer noopener"><BookOpen aria-hidden="true" /> ghOSt source</a>
        <a href="https://doi.org/10.1145/3477132.3483542" target="_blank" rel="noreferrer noopener">SOSP ’21 paper</a>
      </footer>
      </div>
    </LiveDemo>
  );
}

function SectionTitle({ kicker, title, id }: Readonly<{ kicker: string; title: string; id: string }>) {
  return <div className={styles.sectionTitle}><p>{kicker}</p><h3 id={id}>{title}</h3></div>;
}

function Proof({ value, label }: Readonly<{ value: string; label: string }>) {
  return <div><strong>{value}</strong><span>{label}</span></div>;
}

function MatrixCell({ Icon, label, values }: Readonly<{ Icon: ComponentType<{ className?: string }>; label: string; values: string }>) {
  return <div className={styles.matrixCell}><Icon aria-hidden="true" /><span>{label}</span><strong>{values}</strong></div>;
}

export const GhostLab = () => <GhostDemo embedded />;
