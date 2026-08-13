/**
 * Deterministic scene model for the /devtools inspection narrative.
 *
 * The motion layer only consumes this model; facts and long-form copy continue
 * to live in the evidence/profile ledgers. Thresholds are deliberately named so
 * every visual state can be derived from scroll position and unwound in reverse.
 */

import type { ChapterId, PanelId } from "./chapters";

export type SceneId =
  | "hero"
  | "delivery"
  | "infrastructure"
  | "reliability"
  | "devex"
  | "experience"
  | "projects"
  | "evidence"
  | "enablement"
  | "contact";

export type SceneProgress = {
  scene: SceneId;
  local: number;
  global: number;
  direction: 1 | -1;
};

export type SceneDefinition = {
  id: SceneId;
  chapter: ChapterId;
  panel: PanelId;
  vocabulary: "Elements" | "Network" | "Console" | "Sources" | "Lighthouse";
  action: string;
  path: string;
  thresholds: Readonly<Record<string, number>>;
};

export const scrollScenes: readonly SceneDefinition[] = [
  {
    id: "hero",
    chapter: "overview",
    panel: "overview",
    vocabulary: "Elements",
    action: "INSPECTING SEMANTIC PROOF",
    path: "portfolio://yashas/delivery-system",
    thresholds: { chrome: 0.05, identity: 0.2, role: 0.42, proof: 0.64, dispatch: 0.82 },
  },
  {
    id: "delivery",
    chapter: "delivery",
    panel: "pipeline",
    vocabulary: "Network",
    action: "BUILDING DEPENDENCY PLAN",
    path: "portfolio://delivery/pipeline",
    thresholds: { planExpanded: 0.14, parallelStart: 0.28, prerequisites: 0.46, approval: 0.62, verify: 0.76, stable: 0.88 },
  },
  {
    id: "infrastructure",
    chapter: "infrastructure",
    panel: "infrastructure",
    vocabulary: "Network",
    action: "DISPATCHING DATA CHANGE",
    path: "portfolio://infrastructure/events",
    thresholds: { source: 0.12, regionalNotifications: 0.3, queued: 0.48, draining: 0.62, questions: 0.76, warning: 0.9 },
  },
  {
    id: "reliability",
    chapter: "reliability",
    panel: "reliability",
    vocabulary: "Console",
    action: "TRACING FAILURE ACROSS LAYERS",
    path: "portfolio://reliability/trace",
    thresholds: { detect: 0.06, scope: 0.16, trace: 0.28, compare: 0.42, isolate: 0.54, stabilize: 0.64, verify: 0.74, prevent: 0.84, query: 0.9 },
  },
  {
    id: "devex",
    chapter: "devex",
    panel: "devex",
    vocabulary: "Sources",
    action: "PUBLISHING CONTRACT ARTIFACTS",
    path: "portfolio://devex/openapi",
    thresholds: { changed: 0.08, ci: 0.2, branch: 0.32, generated: 0.48, version: 0.62, published: 0.74, isolate: 0.84, feedback: 0.94 },
  },
  {
    id: "experience",
    chapter: "experience",
    panel: "reliability",
    vocabulary: "Sources",
    action: "TRACING CAREER BOUNDARIES",
    path: "portfolio://experience/system-layers",
    thresholds: { backend: 0.12, internship: 0.34, optical: 0.56, schneider: 0.78, transfer: 0.9 },
  },
  {
    id: "projects",
    chapter: "systems",
    panel: "evidence",
    vocabulary: "Sources",
    action: "OPENING PROJECT MECHANISM",
    path: "portfolio://systems/selected",
    thresholds: { cloud: 0.08, ghost: 0.3, portfolio: 0.52, containers: 0.74, inspect: 0.9 },
  },
  {
    id: "evidence",
    chapter: "complete-work",
    panel: "evidence",
    vocabulary: "Sources",
    action: "RESOLVING VERIFIED RECORDS",
    path: "portfolio://evidence/universe",
    thresholds: { production: 0.06, systems: 0.24, cloud: 0.42, research: 0.6, teaching: 0.78, audit: 0.92 },
  },
  {
    id: "enablement",
    chapter: "enablement",
    panel: "evidence",
    vocabulary: "Lighthouse",
    action: "AUDITING EVIDENCE DEPENDENCIES",
    path: "portfolio://enablement/audit",
    thresholds: { build: 0.12, operate: 0.32, explain: 0.52, improve: 0.72, records: 0.86, verified: 0.95 },
  },
  {
    id: "contact",
    chapter: "contact",
    panel: "overview",
    vocabulary: "Elements",
    action: "COMMITTING READY STATE",
    path: "portfolio.delivery/status",
    thresholds: { define: 0.1, provision: 0.26, deliver: 0.42, observe: 0.58, improve: 0.74, ready: 0.9 },
  },
] as const;

export const sceneIndexByChapter = new Map<ChapterId, number>(
  scrollScenes.map((scene, index) => [scene.chapter, index]),
);

export const sceneForPanel = (panel: PanelId): SceneDefinition =>
  scrollScenes.find((scene) => scene.panel === panel) ?? scrollScenes[0];
