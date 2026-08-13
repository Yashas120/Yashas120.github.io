"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Github, Play } from "lucide-react";
import type { DemoId } from "@/data/demos";
import { chapters, type PanelId } from "@/data/devops/chapters";
import { scrollScenes, type SceneDefinition, type SceneProgress } from "@/data/devops/scrollScenes";
import { identity } from "@/data/devops/profile";
import { InspectorTabs } from "./InspectorTabs";
import { useProjectInspector } from "./ProjectInspectorContext";
import { DV } from "./tokens";

type NodeState = "idle" | "active" | "waiting" | "stable" | "failed" | "human";
type StageNode = { id: string; label: string; detail?: string; x: number; y: number; state: NodeState; visible: number };
type StageEdge = { id: string; from: number; to: number; progress: number; state?: NodeState };
type StageModel = {
  title: string;
  lead: string;
  nodes: StageNode[];
  edges: StageEdge[];
  trace: string[];
  metric?: { before: string; after: string; value: number; visible?: number; caption: string };
  source?: { file: string; lines: string[] };
  notice?: string;
  project?: { label: string; detail: string; demoId?: DemoId; href?: string; ready: boolean };
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const phase = (value: number, start: number, end = start + 0.12) => clamp((value - start) / Math.max(0.001, end - start));
const stateAt = (p: number, start: number, stable = start + 0.18): NodeState =>
  p < start ? "waiting" : p < stable ? "active" : "stable";

const positions = {
  horizontal: [
    [10, 46], [25, 46], [40, 28], [40, 66], [59, 46], [76, 46], [91, 46],
  ],
  trace: [
    [9, 22], [24, 36], [39, 50], [54, 64], [70, 50], [85, 36], [91, 72],
  ],
  layers: [
    [10, 18], [23, 31], [36, 44], [49, 57], [62, 70], [76, 57], [90, 44],
  ],
} as const;

const makeNodes = (
  labels: readonly (string | readonly [string, string])[],
  coords: readonly (readonly [number, number])[],
  p: number,
  starts: readonly number[],
  states?: readonly (NodeState | undefined)[],
): StageNode[] => labels.map((entry, index) => {
  const [label, detail] = Array.isArray(entry) ? entry : [entry, undefined];
  return {
    id: `node-${index}`,
    label,
    detail,
    x: coords[index]?.[0] ?? 50,
    y: coords[index]?.[1] ?? 50,
    state: states?.[index] ?? stateAt(p, starts[index] ?? 0),
    visible: phase(p, starts[index] ?? 0, (starts[index] ?? 0) + 0.08),
  };
});

const sequentialEdges = (count: number, p: number, starts: readonly number[], failedAt = -1): StageEdge[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `edge-${index}`,
    from: index,
    to: index + 1,
    progress: phase(p, starts[index] ?? 0, (starts[index] ?? 0) + 0.13),
    state: index === failedAt ? "failed" : undefined,
  }));

function modelFor(scene: SceneDefinition, raw: number, reduced: boolean): StageModel {
  const p = reduced ? 1 : raw;

  if (scene.id === "hero") {
    const starts = [0.04, 0.18, 0.38, 0.58, 0.72, 0.84, 0.9];
    const nodes = makeNodes(
      ["main#portfolio", "Yashas Kadambi", "DevOps & Platform Engineer", ["Dependency-aware", "deployment proof"], ["experience", "≈ 3 years"], ["UCSD MSCS", "begins Sep 2026"], "change packet"],
      positions.trace,
      p,
      starts,
    );
    nodes[Math.min(3, Math.floor(p * 5))].state = "active";
    return {
      title: "Semantic portfolio inspection",
      lead: "An amber selection walks the readable document and dispatches a verified proof into the delivery system.",
      nodes,
      edges: sequentialEdges(6, p, starts.slice(1)),
      trace: ["Elements", "main#portfolio", "data-lens=DevOps / Platform / SRE"],
      source: { file: "Elements · computed properties", lines: ["name = Yashas Kadambi", "context = UCSD MSCS · Sep 2026", "experience ≈ 3 years", "lens = DevOps / Platform / SRE"] },
    };
  }

  if (scene.id === "delivery") {
    const starts = [0.02, 0.12, 0.24, 0.24, 0.44, 0.62, 0.78];
    const coords = [[8, 46], [23, 46], [39, 27], [39, 66], [57, 66], [73, 46], [90, 46]] as const;
    const approved = p >= scene.thresholds.approval;
    const nodes = makeNodes(
      ["Change detected", "Plan", ["Independent A", "parallel lane"], ["Independent B", "parallel lane"], ["Prerequisite", p < 0.46 ? "WAITING" : "READY"], [approved ? "APPROVED" : "REVIEW REQUIRED", "human gate"], ["OBSERVED", "STABLE"]],
      coords,
      p,
      starts,
      [undefined, undefined, undefined, undefined, p < 0.46 ? "waiting" : "stable", approved ? "stable" : "human", p > 0.88 ? "stable" : "waiting"],
    );
    const edgeStarts = [0.1, 0.22, 0.22, 0.4, 0.6, 0.76];
    return {
      title: "Dependency-aware deployment",
      lead: "Independent infrastructure separates into parallel lanes; dependent work waits for evidence and a retained human decision.",
      nodes,
      edges: sequentialEdges(6, p, edgeStarts),
      trace: ["Stage", "State", "Dependency", "Evidence"],
      metric: { before: "100", after: "50", value: phase(p, 0.78, 0.94), visible: phase(p, 0.68, 0.74), caption: "Normalized representation of the verified approximate 50% overall deployment-time reduction — not minutes." },
    };
  }

  if (scene.id === "infrastructure") {
    const starts = [0.02, 0.14, 0.27, 0.34, 0.5, 0.62, 0.86];
    const warning = p >= 0.86;
    const coords = [[7, 46], [21, 46], [36, 46], [55, 28], [55, 66], [75, 46], [91, 46]] as const;
    const nodes = makeNodes(
      ["Data change", "DynamoDB", ["SNS", "notify both regions"], ["SQS · region A", "buffering"], ["SQS · region B", "buffering"], ["Consumers", "different drain rates"], [warning ? "warning event" : "Database", warning ? "open trace" : "update"]],
      coords,
      p,
      starts,
      [undefined, undefined, undefined, undefined, undefined, undefined, warning ? "failed" : "stable"],
    );
    const edges: StageEdge[] = [
      { id: "change-to-dynamo", from: 0, to: 1, progress: phase(p, 0.1, 0.22) },
      { id: "dynamo-to-sns", from: 1, to: 2, progress: phase(p, 0.2, 0.32) },
      { id: "sns-to-region-a", from: 2, to: 3, progress: phase(p, 0.3, 0.44) },
      { id: "sns-to-region-b", from: 2, to: 4, progress: phase(p, 0.3, 0.44) },
      { id: "region-a-to-consumer", from: 3, to: 5, progress: phase(p, 0.48, 0.64) },
      { id: "region-b-to-consumer", from: 4, to: 5, progress: phase(p, 0.56, 0.74) },
      { id: "consumer-to-database", from: 5, to: 6, progress: phase(p, 0.7, 0.86), state: warning ? "failed" : undefined },
    ];
    return {
      title: "Event-driven infrastructure",
      lead: "SNS sends the data-change notification to both regional SQS queues; each queue buffers independently before its consumer drains it.",
      nodes,
      edges,
      trace: ["ordering?", "bounded retries?", "idempotency?", "dead-letter owner?"],
      notice: "Public-safe architectural illustration — not production topology.",
    };
  }

  if (scene.id === "reliability") {
    const starts = [0.02, 0.16, 0.28, 0.4, 0.52, 0.64, 0.76];
    const preventing = p >= 0.82;
    const nodes = makeNodes(
      ["Application", "Deployment config", "Service reference", "Load balancing", "Database", "Environment", preventing ? "PREVENT" : "user symptom"],
      positions.trace,
      p,
      starts,
      [undefined, undefined, undefined, p > 0.5 && p < 0.68 ? "failed" : undefined, undefined, undefined, preventing ? "stable" : "failed"],
    );
    return {
      title: p < 0.84 ? "Failure, trace, recovery" : "Move filtering to the data boundary",
      lead: p < 0.84 ? "The suspect path stays visible while the highlight walks backward through configuration and service dependencies." : "The heavy in-memory path contracts as filtering moves into the query layer.",
      nodes,
      edges: sequentialEdges(6, p, [0.08, 0.2, 0.32, 0.44, 0.56, 0.68], p > 0.36 && p < 0.7 ? 3 : -1),
      trace: p < 0.82 ? ["DETECT", "SCOPE", "TRACE", "COMPARE", "ISOLATE", "STABILIZE", "VERIFY"] : ["PREVENT", "smaller increments", "retain prior path", "full-stack health checks"],
      metric: { before: "100", after: "60", value: phase(p, 0.84, 0.98), visible: phase(p, 0.8, 0.86), caption: "Normalized comparison of the verified 40% page-load improvement — not measured timing telemetry." },
    };
  }

  if (scene.id === "devex") {
    const starts = [0.02, 0.16, 0.29, 0.29, 0.5, 0.62, 0.75];
    const selected = p >= 0.62;
    const feedback = p >= 0.82;
    const nodes = makeNodes(
      feedback ? ["Production source", "Boundary A", "Boundary B", "Local build", "Tests", "Diagnostics", "repeatable loop"] : ["OpenAPI", "CI event", "Generate Python", "Generate Java", "Artifact shelf", [selected ? "VERSION CHOSEN" : "CHOOSE VERSION", "human decision"], "SDK + docs"],
      positions.horizontal,
      p,
      starts,
      [undefined, undefined, undefined, undefined, undefined, selected ? "stable" : "human", p > 0.74 ? "stable" : "waiting"],
    );
    return {
      title: feedback ? "Hardware-independent local feedback" : "API contract to SDK",
      lead: feedback ? "External hardware and SDK boundaries peel away behind stubs so production source can build, test, and diagnose locally." : "One contract change branches into Python and Java generation, then stops at a visible human version decision before publication.",
      nodes,
      edges: sequentialEdges(6, p, [0.1, 0.24, 0.24, 0.42, 0.58, 0.7]),
      trace: feedback ? ["Sources", "isolated boundaries", "local build", "tests", "diagnostics"] : ["Sources", "openapi.yaml", "+ changed contract line", "artifact publication"],
      metric: { before: "~4h / SDK", after: "0 routine", value: phase(p, 0.68, 0.82), visible: phase(p, 0.62, 0.7) * (1 - phase(p, 0.8, 0.84)), caption: "Manual generation/publication removed; the release-version decision remains human." },
      source: !feedback ? { file: "Sources · openapi.yaml", lines: ["paths:", "  /contract:", "+   generated clients: Python, Java", "releaseVersion: HUMAN_DECISION"] } : undefined,
    };
  }

  if (scene.id === "experience") {
    const role = p < 0.28 ? "Cisco · Backend/Cloud" : p < 0.5 ? "Cisco · Technical Internship" : p < 0.72 ? "Cisco · Optical" : "Schneider Electric";
    const starts = [0.02, 0.12, 0.24, 0.36, 0.5, 0.64, 0.78];
    const labels = ["User/service", "API/backend", "Infrastructure", "OS/process", "Driver/interface", "Hardware/firmware", "Signal/telemetry"];
    const roleStates: NodeState[] = labels.map((label) => {
      const active = role.includes("Backend") ? ["API/backend", "Infrastructure", "OS/process"] : role.includes("Internship") ? ["API/backend", "Infrastructure"] : role.includes("Optical") ? ["OS/process", "Driver/interface", "Hardware/firmware", "Signal/telemetry"] : ["User/service", "API/backend"];
      return active.includes(label) ? "active" : "idle";
    });
    return {
      title: role,
      lead: "Each appointment lights only the layers its literal copy supports; adjacent reliability practices are connected without turning optical work into cloud ownership.",
      nodes: makeNodes(labels, positions.layers, p, starts, roleStates),
      edges: sequentialEdges(6, p, starts.slice(1)),
      trace: ["Transferable reliability practice", "explicit state", "validation", "failure isolation", "repeatable environments", "operational evidence"],
    };
  }

  if (scene.id === "projects") {
    const project = p < 0.25
      ? { label: "Cloud Provisioning using RDBMS", detail: "quota → inventory lock → allocation → lifecycle commit", demoId: "cloud" as DemoId }
      : p < 0.5
        ? { label: "ghOSt scheduler", detail: "workload → policy choice → queue / CPU placement → comparison", demoId: "ghost" as DemoId }
        : p < 0.75
          ? { label: "Technical Portfolio", detail: "typed evidence → multiple interfaces → static delivery", href: identity.portfolioSource }
          : { label: "Cloud-Hack", detail: "container → configuration → service discovery → database", href: "https://github.com/Yashas120/Cloud-Hack" };
    const step = clamp((p % 0.25) * 4);
    const labels = project.detail.split(" → ");
    const starts = [0.02, 0.22, 0.46, 0.7, 0.86, 0.92, 0.96];
    return {
      title: project.label,
      lead: "The project mechanism resolves before its implementation or verified source becomes available.",
      nodes: makeNodes(labels, positions.horizontal, reduced ? 1 : step, starts),
      edges: sequentialEdges(Math.max(0, labels.length - 1), reduced ? 1 : step, starts.slice(1)),
      trace: ["Sources", "ownership preserved", "status preserved", "mechanism before demo"],
      project: { ...project, ready: reduced || step > 0.82 },
    };
  }

  if (scene.id === "evidence") {
    const starts = [0.02, 0.14, 0.28, 0.42, 0.56, 0.7, 0.84];
    return {
      title: "Evidence universe",
      lead: "The file tree changes focus while each record retains source, ownership, status, repository, demo, and paper paths in semantic HTML.",
      nodes: makeNodes(["Production", "Systems", "Cloud", "Research", "Teaching", "DOI records", "Audit tree"], positions.layers, p, starts),
      edges: sequentialEdges(6, p, starts.slice(1)),
      trace: ["Sources / Network", "Repo", "Demo", "Paper", "Ownership", "Status"],
      source: { file: p > 0.58 ? "research/publications" : "evidence/verified-work", lines: ["production/", "systems/", "cloud/", "research/ · DOI + date", "teaching/ · 656 learners"] },
    };
  }

  if (scene.id === "enablement") {
    const starts = [0.02, 0.16, 0.3, 0.44, 0.58, 0.72, 0.86];
    return {
      title: "Evidence dependency audit",
      lead: "Capability rows resolve only when a visible supporting item is connected; there is no self-assigned score or circular gauge.",
      nodes: makeNodes(["Professional work", "Projects", "BUILD", "OPERATE", "EXPLAIN", "IMPROVE", "VERIFIED"], positions.layers, p, starts),
      edges: sequentialEdges(6, p, starts.slice(1)),
      trace: ["Lighthouse · binary audit", "education", "certification", "scholarship", "publications", "security recognition"],
      notice: p > 0.9 ? "VERIFIED — every resolved row has a visible source record." : "Resolving capability dependencies…",
    };
  }

  const starts = [0.02, 0.16, 0.3, 0.44, 0.58, 0.72, 0.88];
  return {
    title: p >= 0.88 ? "READY FOR REVIEW" : "Delivery loop convergence",
    lead: "Evidence accumulated across the inspection returns to one stable operating loop and leaves every contact path available.",
    nodes: makeNodes(["Define", "Provision", "Deliver", "Observe", "Improve", "Evidence", "READY"], positions.layers, p, starts),
    edges: sequentialEdges(6, p, starts.slice(1)),
    trace: ["portfolio.delivery/status", p >= 0.88 ? "READY FOR REVIEW" : "converging…", "résumé", "email", "GitHub", "LinkedIn"],
    notice: p >= 0.88 ? "READY FOR REVIEW" : undefined,
  };
}

const nodeColors: Record<NodeState, string> = {
  idle: DV.border,
  active: DV.amber,
  waiting: DV.muted,
  stable: DV.green,
  failed: DV.red,
  human: DV.violet,
};

function StageGraph({ model, scene, local, reduced }: Readonly<{ model: StageModel; scene: SceneDefinition; local: number; reduced: boolean }>) {
  return (
    <div className="dv-stage-canvas" data-scene-canvas={scene.id}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {model.edges.map((edge) => {
          const from = model.nodes[edge.from];
          const to = model.nodes[edge.to];
          if (!from || !to) return null;
          const color = nodeColors[edge.state ?? (edge.progress > 0.92 ? "stable" : "active")];
          return (
            <motion.line
              key={edge.id}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              pathLength={1}
              stroke={color}
              strokeWidth="0.42"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="1 1"
              style={{ pathLength: edge.progress, opacity: Math.max(0.16, edge.progress) }}
            />
          );
        })}
      </svg>

      {model.nodes.map((node, index) => (
        <motion.div
          key={node.id}
          className="dv-stage-node"
          data-state={node.state}
          animate={{ left: `${node.x}%`, top: `${node.y}%`, opacity: reduced ? 1 : node.visible }}
          transition={{ duration: reduced ? 0 : 0.1, ease: "linear" }}
          style={{ borderColor: nodeColors[node.state] }}
        >
          <span className="dv-stage-node-index">{String(index + 1).padStart(2, "0")}</span>
          <span className="dv-stage-node-label">{node.label}</span>
          {node.detail && <span className="dv-stage-node-detail">{node.detail}</span>}
        </motion.div>
      ))}

      {!reduced && model.edges.map((edge, index) => {
        const from = model.nodes[edge.from];
        const to = model.nodes[edge.to];
        if (!from || !to || edge.progress < 0.06 || edge.progress > 0.97) return null;
        return (
          <span
            key={`packet-${edge.id}`}
            className="dv-stage-packet"
            style={{
              left: `${from.x + (to.x - from.x) * edge.progress}%`,
              top: `${from.y + (to.y - from.y) * edge.progress}%`,
              background: nodeColors[edge.state ?? "active"],
            }}
            aria-hidden="true"
          />
        );
      })}

      <div className="dv-stage-progress" aria-hidden="true">
        <span style={{ width: `${Math.max(2, local * 100)}%` }} />
      </div>
    </div>
  );
}

function TabPeek({ panel }: Readonly<{ panel: PanelId | null }>) {
  if (!panel) return null;
  const chapter = chapters.find((item) => item.inspectorPanel === panel);
  return (
    <div className="dv-tab-peek" role="status">
      <span>MANUAL INSPECTOR SELECTION</span>
      <strong>{chapter?.title ?? panel}</strong>
      <span>{chapter?.summary}</span>
    </div>
  );
}

export function ScrollInspectorStage({ progress, reduced }: Readonly<{ progress: SceneProgress; reduced: boolean }>) {
  const scene = scrollScenes.find((item) => item.id === progress.scene) ?? scrollScenes[0];
  const model = useMemo(() => modelFor(scene, progress.local, reduced), [progress.local, reduced, scene]);
  const staticModel = useMemo(() => modelFor(scene, progress.local, true), [progress.local, scene]);
  const { onInspectProject } = useProjectInspector();
  const [manualPanel, setManualPanel] = useState<PanelId | null>(null);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const read = () => {
      const value = new URLSearchParams(window.location.search).get("inspect") as PanelId | null;
      setManualPanel(["overview", "pipeline", "infrastructure", "reliability", "devex", "evidence"].includes(value ?? "") ? value : null);
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  useEffect(() => {
    const sync = () => setIdle(document.visibilityState !== "visible");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const selectPanel = (panel: PanelId) => {
    setManualPanel(panel);
    const url = new URL(window.location.href);
    url.searchParams.set("inspect", panel);
    window.history.pushState(null, "", url);
  };

  const activePanel = manualPanel ?? scene.panel;

  return (
    <aside className="dv-scroll-stage" aria-label="Live DevTools career inspection" data-idle={idle} data-reduced-motion={reduced}>
      <div className="dv-stage-browserbar" aria-hidden="true">
        <span className="dv-window-dots"><i /><i /><i /></span>
        <span className="dv-stage-address">{scene.path}</span>
        <span>{String(scrollScenes.indexOf(scene) + 1).padStart(2, "0")}/{scrollScenes.length}</span>
      </div>

      <div className="dv-stage-viewport">
        <div className="dv-stage-document">
          <span>{scene.vocabulary} · {scene.action}</span>
          <strong>{model.title}</strong>
          <p>{model.lead}</p>
        </div>
        {model.source && (
          <div className="dv-stage-source" aria-label={model.source.file}>
            <span>{model.source.file}</span>
            {model.source.lines.map((line, index) => <code key={`${line}-${index}`}><b>{String(index + 1).padStart(2, "0")}</b>{line}</code>)}
          </div>
        )}
      </div>

      <div className="dv-stage-devtools">
        <InspectorTabs active={activePanel} onSelect={selectPanel} idPrefix="scroll-stage" />
        <div className="dv-stage-context">
          <span>{scene.vocabulary} · {scene.path}</span>
          <span style={{ color: manualPanel ? DV.violet : DV.amber }}>{manualPanel ? "selected" : scene.action}</span>
        </div>

        <div id="scroll-stage-panel" role="tabpanel" aria-labelledby={`scroll-stage-tab-${activePanel}`} className="dv-stage-main">
          <StageGraph model={model} scene={scene} local={progress.local} reduced={reduced} />
          <div className="dv-reduced-summary">
            <strong>{staticModel.title}</strong>
            <ol>
              {staticModel.edges.map((edge, index) => (
                <li key={`static-${edge.id}`}>
                  <span>{index + 1}</span>
                  {staticModel.nodes[edge.from]?.label}
                  <b aria-hidden="true">→</b>
                  {staticModel.nodes[edge.to]?.label}
                </li>
              ))}
            </ol>
            {staticModel.metric && <p>{staticModel.metric.before} → {staticModel.metric.after}. {staticModel.metric.caption}</p>}
            {staticModel.notice && <p>{staticModel.notice}</p>}
            {staticModel.project?.demoId && <button type="button" onClick={() => onInspectProject(staticModel.project!.demoId!)}><Play className="h-3.5 w-3.5" aria-hidden="true" /> Jump to open preview</button>}
            {staticModel.project?.href && <a href={staticModel.project.href} target="_blank" rel="noreferrer noopener"><Github className="h-3.5 w-3.5" aria-hidden="true" /> Inspect verified source</a>}
          </div>
          <TabPeek panel={manualPanel} />
        </div>

        <div className="dv-stage-console">
          {model.trace.map((item, index) => (
            <span key={`${item}-${index}`} className={index === 0 ? "active" : undefined}>
              {index === 0 ? ">" : "·"} {item}
            </span>
          ))}
        </div>

        {model.metric && (
          <div className="dv-stage-metric" style={{ opacity: model.metric.visible ?? 1 }}>
            <span>{model.metric.before}</span>
            <div><i style={{ width: `${100 - model.metric.value * 50}%` }} /></div>
            <strong>{model.metric.after}</strong>
            <small>{model.metric.caption}</small>
          </div>
        )}

        {model.notice && <div className="dv-stage-notice">{model.notice}</div>}

        {model.project && (
          <div className="dv-stage-project-action">
            <div>
              <span>{model.project.ready ? "IMPLEMENTATION READY TO INSPECT" : "RESOLVING PROJECT MECHANISM"}</span>
              <strong>{model.project.label}</strong>
            </div>
            {model.project.ready && model.project.demoId && (
              <button type="button" onClick={() => onInspectProject(model.project!.demoId!)}><Play className="h-3.5 w-3.5" aria-hidden="true" /> Jump to open preview</button>
            )}
            {model.project.ready && model.project.href && (
              <a href={model.project.href} target="_blank" rel="noreferrer noopener"><Github className="h-3.5 w-3.5" aria-hidden="true" /> Inspect verified source <ArrowUpRight className="h-3 w-3" aria-hidden="true" /></a>
            )}
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {model.title}. {model.lead} Scene progress {Math.round(progress.local * 100)} percent.
      </p>
      <noscript>
        <p>The interactive inspector requires JavaScript. The complete portfolio and every source link remain readable in the document.</p>
      </noscript>
    </aside>
  );
}
