/** Semantic chapters and the inspector state each chapter activates. */

export type PanelId =
  | "overview"
  | "pipeline"
  | "infrastructure"
  | "reliability"
  | "devex"
  | "evidence";

export type ChapterId =
  // The opening section, above the first numbered chapter. It has no entry in
  // `chapters` and no inspector panel of its own; it is the initial state
  // before the reader reaches a chapter.
  | "hero"
  | "overview"
  | "delivery"
  | "infrastructure"
  | "reliability"
  | "devex"
  | "experience"
  | "systems"
  | "complete-work"
  | "enablement"
  | "contact";

export interface DevOpsChapter {
  id: ChapterId;
  path: string;
  eyebrow: string;
  title: string;
  summary: string;
  inspectorPanel: PanelId;
  evidenceIds: string[];
}

export const chapters: DevOpsChapter[] = [
  {
    id: "overview",
    path: "portfolio://overview",
    eyebrow: "DEVOPS · PLATFORM · RELIABILITY",
    title: "Inspect the delivery system.",
    summary: "The loop every piece of evidence on this page belongs to.",
    inspectorPanel: "overview",
    evidenceIds: ["deploy-time", "sdk-ci", "page-load"],
  },
  {
    id: "delivery",
    path: "portfolio://delivery/pipeline",
    eyebrow: "01 / DELIVERY SYSTEMS",
    title: "Faster delivery without ignoring dependencies.",
    summary: "Where concurrency is safe, and where a gate has to stay.",
    inspectorPanel: "pipeline",
    evidenceIds: ["deploy-time", "iac"],
  },
  {
    id: "infrastructure",
    path: "portfolio://infrastructure/events",
    eyebrow: "02 / INFRASTRUCTURE",
    title: "Reusable boundaries for event-driven platforms.",
    summary: "A reusable event path with explicit ownership.",
    inspectorPanel: "infrastructure",
    evidenceIds: ["events", "iac"],
  },
  {
    id: "reliability",
    path: "portfolio://reliability/trace",
    eyebrow: "03 / RELIABILITY",
    title: "Trace the failure across layers, then improve the operating method.",
    summary: "Detection to prevention, with evidence instead of fake telemetry.",
    inspectorPanel: "reliability",
    evidenceIds: ["incident", "page-load", "auth-api", "constrained-security", "firmware-rca"],
  },
  {
    id: "devex",
    path: "portfolio://devex/automation",
    eyebrow: "04 / DEVELOPER EXPERIENCE",
    title: "Remove repeated work from the critical path.",
    summary: "Automate the routine; keep the decision human.",
    inspectorPanel: "devex",
    evidenceIds: ["sdk-ci", "test-loop", "dev-environments"],
  },
  {
    id: "experience",
    path: "portfolio://experience/boundaries",
    eyebrow: "05 / SYSTEM BOUNDARIES",
    title: "The same reliability discipline continues below the service layer.",
    summary: "Four production appointments across services, software, firmware, and hardware boundaries.",
    inspectorPanel: "reliability",
    evidenceIds: ["optical-platform", "iac", "sdk-ci", "schneider-workflow"],
  },
  {
    id: "systems",
    path: "portfolio://systems/selected",
    eyebrow: "06 / SELECTED SYSTEMS",
    title: "Public work that makes the mechanisms inspectable.",
    summary: "Role-relevant public work with ownership and status attached.",
    inspectorPanel: "evidence",
    evidenceIds: ["containers", "cloud-rdbms", "ghost", "portfolio-system"],
  },
  {
    id: "complete-work",
    path: "portfolio://evidence/complete-work",
    eyebrow: "07 / COMPLETE EVIDENCE",
    title: "The DevOps lens changes the order, not the evidence universe.",
    summary: "The complete verified-work and research ledger.",
    inspectorPanel: "evidence",
    evidenceIds: ["swift-research", "underwater-research"],
  },
  {
    id: "enablement",
    path: "portfolio://enablement/scope",
    eyebrow: "08 / ENABLEMENT",
    title: "Reliable systems include the people who operate and learn them.",
    summary: "Teaching, education, recognition, leadership, and evidence-backed scope.",
    inspectorPanel: "evidence",
    evidenceIds: ["teaching-scale", "leadership", "aws-cert"],
  },
  {
    id: "contact",
    path: "portfolio://contact/ready",
    eyebrow: "09 / CONTACT & PROOF",
    title: "Let’s make the operating path easier to trust.",
    summary: "Direct contact and public proof paths.",
    inspectorPanel: "evidence",
    evidenceIds: ["portfolio-system"],
  },
];

export const PANEL_IDS: PanelId[] = [
  "overview",
  "pipeline",
  "infrastructure",
  "reliability",
  "devex",
  "evidence",
];

export const panelLabel: Record<PanelId, string> = {
  overview: "Overview",
  pipeline: "Pipeline",
  infrastructure: "Infrastructure",
  reliability: "Reliability",
  devex: "DevEx",
  evidence: "Evidence",
};

export const isPanelId = (value: string | null | undefined): value is PanelId =>
  !!value && (PANEL_IDS as string[]).includes(value);

export const chapterForPanel = (panel: PanelId): DevOpsChapter =>
  chapters.find((chapter) => chapter.inspectorPanel === panel) ?? chapters[0];
