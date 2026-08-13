"use client";

import { Component, useEffect, useRef, useState, type ComponentType, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, FlaskConical, LoaderCircle, RotateCcw } from "lucide-react";
import { demoEvidence, type DemoId } from "@/data/demos";
import { DEFAULT_DEMO_THEME, type ProjectDemoTheme } from "./ProjectEvidenceHeader";

type DemoLoader = () => Promise<ComponentType>;

// Keep these factories explicit: every lab remains a distinct webpack chunk and
// no role route statically imports the ten implementations.
export const demoLoaders: Record<DemoId, DemoLoader> = {
  ghost: () => import("./GhostDemo").then((module) => module.GhostLab),
  bitcoin: () => import("./BitcoinDemo").then((module) => module.BitcoinLab),
  chocollvm: () => import("./ChocoLLVMDemo").then((module) => module.ChocoLLVMLab),
  swift: () => import("./SwiftDemo").then((module) => module.SwiftLab),
  multiview: () => import("./MultiviewDemo").then((module) => module.MultiviewLab),
  cifar: () => import("./CifarSparkDemo").then((module) => module.CifarSparkLab),
  parallel: () => import("./ParallelDemo").then((module) => module.ParallelLab),
  cloud: () => import("./CloudDemo").then((module) => module.CloudLab),
  yelp: () => import("./YelpDemo").then((module) => module.YelpLab),
  petra: () => import("./PetraDemo").then((module) => module.PetraLab),
};

type LoadState = "idle" | "loading" | "ready" | "error";
type HeadingLevel = 2 | 3 | 4;

/**
 * The single shared loader for embedded project labs. Both /demos handoffs and
 * role-specific portfolio stages mount the exact same lab component through
 * this boundary; no route owns a second implementation of demo behaviour.
 */
export function SharedProjectLab({
  demoId,
  load,
  className = "",
}: Readonly<{
  demoId: DemoId;
  load: boolean;
  className?: string;
}>) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<LoadState>("idle");
  const [Lab, setLab] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (!load || Lab) return;
    let current = true;
    setState("loading");
    demoLoaders[demoId]()
      .then((component) => {
        if (!current) return;
        setLab(() => component);
        setState("ready");
      })
      .catch(() => {
        if (current) setState("error");
      });
    return () => {
      current = false;
    };
  }, [Lab, attempt, demoId, load]);

  const retry = () => {
    setLab(null);
    setState("idle");
    setAttempt((value) => value + 1);
  };

  return (
    <div className={className} data-shared-project-lab={demoId}>
      {!load && <div className="min-h-[240px]" aria-hidden="true" />}
      {load && state === "loading" && (
        <div className="flex min-h-[240px] items-center justify-center gap-2 font-mono text-[12px] text-zinc-400" role="status" aria-live="polite">
          <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Loading interactive lab…
        </div>
      )}
      {load && state === "error" && (
        <div className="flex min-h-[240px] flex-col items-start justify-center" role="alert">
          <AlertTriangle className="h-5 w-5 text-amber-300" aria-hidden="true" />
          <p className="mt-2 text-sm">The lab bundle could not be loaded.</p>
          <button type="button" onClick={retry} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-zinc-700 px-4 text-sm"><RotateCcw className="h-4 w-4" aria-hidden="true" /> Retry</button>
        </div>
      )}
      {load && state === "ready" && Lab && (
        <>
          <span className="sr-only" role="status" aria-live="polite">{demoEvidence(demoId).projectTitle} lab ready.</span>
          <LabErrorBoundary key={attempt} onRetry={retry}>
            <Lab />
          </LabErrorBoundary>
        </>
      )}
    </div>
  );
}

export function ProjectDemoHandoff({
  demoId,
  theme = DEFAULT_DEMO_THEME,
  variant = "embedded",
  autoOpen = false,
  headingLevel = 3,
  onOpen,
  standaloneHref,
}: Readonly<{
  demoId: DemoId;
  theme?: ProjectDemoTheme;
  variant?: "embedded" | "preview";
  autoOpen?: boolean;
  headingLevel?: HeadingLevel;
  onOpen?: (demoId: DemoId) => void;
  standaloneHref?: string | null;
}>) {
  const project = demoEvidence(demoId);
  const rootRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [opened, setOpened] = useState(autoOpen);
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) {
      setNearViewport(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "420px 0px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // Auto-open controls presentation, while proximity controls the expensive
  // dynamic import. This keeps every default preview visibly expanded in the
  // server-rendered document without pulling every lab into the initial load.
  const shouldLoad = opened && (!autoOpen || nearViewport);
  const resolvedStandaloneHref = standaloneHref === undefined ? `/demos/#${demoId}` : standaloneHref;

  const open = () => {
    setOpened(true);
    onOpen?.(demoId);
  };

  return (
    <div ref={rootRef} className="rounded-b-xl border border-t-0" style={{ borderColor: theme.border, background: theme.surface, color: theme.text }} data-demo-handoff={demoId}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6" style={{ borderColor: theme.border }}>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: theme.accent }}>Resolved state → inspect it yourself</p>
          <Heading className="mt-1 text-base font-semibold">Live browser lab</Heading>
        </div>
        <div className="flex flex-wrap gap-1.5 font-mono text-[10px] uppercase tracking-[0.07em]" style={{ color: theme.muted }}>
          <span>{project.ownership}</span><span aria-hidden="true">·</span><span>{project.fidelity}</span>
        </div>
      </div>

      {!opened ? (
        <div className={`flex flex-col items-start justify-center px-4 sm:px-6 ${variant === "preview" ? "min-h-[180px]" : "min-h-[240px]"}`}>
          <FlaskConical className="h-6 w-6" style={{ color: theme.accent }} aria-hidden="true" />
          <p className="mt-3 max-w-[68ch] text-[14px] leading-relaxed" style={{ color: theme.muted }}>
            The lab is kept out of the initial bundle and will retain its state after it opens.
          </p>
          <button type="button" onClick={open} className="mt-4 inline-flex min-h-11 items-center rounded-md border px-4 text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2" style={{ borderColor: theme.accent, color: theme.text }}>
            Open live lab
          </button>
        </div>
      ) : (
        <div className="min-h-[260px] p-3 sm:p-5" data-demo-lab-root>
          <SharedProjectLab demoId={demoId} load={shouldLoad} />
        </div>
      )}

      <noscript>
        <p className="px-4 py-4 text-sm sm:px-6" style={{ color: theme.muted }}>
          JavaScript is required for the embedded lab.
          {resolvedStandaloneHref ? <> <a className="underline" href={resolvedStandaloneHref}>Open the standalone demo page.</a></> : null}
        </p>
      </noscript>
    </div>
  );
}

class LabErrorBoundary extends Component<{ children: ReactNode; onRetry: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // The visible error state below is the recovery surface; avoid leaking demo
    // internals into the route or replacing the rest of the portfolio.
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex min-h-[240px] flex-col items-start justify-center" role="alert">
        <p className="text-sm text-zinc-300">The interactive lab stopped unexpectedly.</p>
        <button type="button" onClick={this.props.onRetry} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-zinc-700 px-4 text-sm text-zinc-200"><RotateCcw className="h-4 w-4" aria-hidden="true" /> Restart lab</button>
      </div>
    );
  }
}
