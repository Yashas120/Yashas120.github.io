"use client";

import { useEffect, useState, type CSSProperties } from "react";
import {
  Activity,
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  CheckCircle2,
  CircuitBoard,
  Cpu,
  Download,
  Github,
  Mail,
  MonitorUp,
  Network,
  Play,
  Terminal,
} from "lucide-react";
import { profile } from "@/data/profile";
import styles from "./kernel-story.module.css";
import { stageFrames, stageStepOrder, storyDock, type KernelScene, type KernelStageStep } from "./stageModel";

type NodeStyle = CSSProperties & Record<`--${string}`, string | number>;

const dockIcons = {
  identity: BookOpen,
  "production-testing": CheckCircle2,
  "hardware-integration": CircuitBoard,
  "ghost-scheduling": Cpu,
  experience: BriefcaseBusiness,
  "systems-projects": Activity,
  "live-demos": Play,
  "complete-profile": Boxes,
  capabilities: Network,
  contact: Mail,
} satisfies Record<KernelScene, typeof BookOpen>;

export function KernelStage({
  activeStep,
  onOpenDesktop,
}: Readonly<{
  activeStep: KernelStageStep;
  onOpenDesktop: (appId?: string) => void;
}>) {
  const [displayedStep, setDisplayedStep] = useState(activeStep);
  const [isFading, setIsFading] = useState(false);
  const frame = stageFrames[displayedStep];
  const index = stageStepOrder.indexOf(displayedStep);

  useEffect(() => {
    if (activeStep === displayedStep) return;

    setIsFading(true);
    const timeout = window.setTimeout(() => {
      setDisplayedStep(activeStep);
      setIsFading(false);
    }, 160);

    return () => window.clearTimeout(timeout);
  }, [activeStep, displayedStep]);

  return (
    <div className={styles.stage} data-scene={frame.scene} data-step={displayedStep} data-transition={isFading ? "out" : "in"}>
      <header className={styles.systemBar}>
        <a href="#identity" className={styles.brand} aria-label="yashOS portfolio story home">
          <Terminal aria-hidden="true" />
          <strong>yashOS</strong>
          <code>/kernel</code>
        </a>
        <div className={styles.systemCenter} aria-live="polite">
          <span>{frame.title}</span>
          <code>{frame.alias}</code>
        </div>
        <div className={styles.systemActions}>
          <span className={styles.online}><i aria-hidden="true" /> RUNNING</span>
          <button type="button" aria-label="Enter interactive desktop" onClick={() => onOpenDesktop()}>
            <MonitorUp aria-hidden="true" />
            <span>Interactive desktop</span>
          </button>
        </div>
      </header>

      <div className={styles.desktopSurface}>
        <div className={styles.powerLine} aria-hidden="true" />
        <div className={styles.desktopIcon} aria-hidden="true">
          <span><BookOpen /></span>
          <small>Portfolio</small>
        </div>

        <div className={styles.storyWindow}>
          <header className={styles.windowBar}>
            <span className={styles.windowIdentity}>
              <Boxes aria-hidden="true" />
              <strong>{frame.title}</strong>
              <code>{frame.alias}</code>
            </span>
            <span className={styles.windowControls} aria-hidden="true"><i /><i /><i /></span>
          </header>
          <div className={styles.windowBody} data-story-viewport>
            <div className={styles.modelPane} aria-hidden="true">
              <header>
                <span>{frame.kicker}</span>
                <span>SCENE {String(index + 1).padStart(2, "0")}</span>
              </header>
              <div className={styles.modelCanvas}>
                <svg className={styles.edgeField} viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M50 12 L50 25 M23 25 L77 25 M23 25 L23 78 M50 25 L50 78 M77 25 L77 78 M23 58 L77 58" />
                  <path className={styles.activeSignal} d="M8 50 H92" />
                </svg>
                {frame.nodes.map((current, nodeIndex) => {
                  const style: NodeStyle = {
                    "--node-x": `${current.x}%`,
                    "--node-y": `${current.y}%`,
                    "--node-w": `${current.w}%`,
                  };
                  return (
                    <div className={styles.modelNode} data-kind={current.kind} style={style} key={nodeIndex}>
                      <span>{current.label}</span>
                      <small>{current.detail}</small>
                    </div>
                  );
                })}
                <div className={styles.signalPacket} />
              </div>
              <footer>
                <span><CheckCircle2 /> {frame.status}</span>
                <strong>{frame.annotation}</strong>
              </footer>
            </div>
            <div className={styles.copyPane} aria-hidden="true">
              <span>ACTIVE DOCUMENT</span>
              <strong>Plain-English portfolio content</strong>
              <p>Scroll controls this running application. The readable chapter occupies this pane in the document layer.</p>
            </div>
          </div>
          <footer className={styles.windowStatus}>
            <span><i aria-hidden="true" /> verified profile data</span>
            <div>
              <a href={profile.resume.href}><Download /> résumé</a>
              <a href={profile.github} target="_blank" rel="noreferrer noopener"><Github /> source</a>
              <a href={`mailto:${profile.email}`}><Mail /> contact</a>
            </div>
          </footer>
        </div>

        <nav className={styles.dock} aria-label="Portfolio scenes">
          {storyDock.map((item) => {
            const Icon = dockIcons[item.scene];
            const active = frame.scene === item.scene;
            return (
              <a key={item.id} href={`#${item.id}`} aria-current={active ? "location" : undefined}>
                <span><Icon aria-hidden="true" /></span>
                <strong>{item.label}</strong>
                <code>{item.alias}</code>
                {active ? <i aria-hidden="true" /> : null}
              </a>
            );
          })}
          <button type="button" onClick={() => onOpenDesktop()}>
            <span><MonitorUp aria-hidden="true" /></span>
            <strong>Desktop</strong>
            <code>enter</code>
          </button>
        </nav>
      </div>
    </div>
  );
}
