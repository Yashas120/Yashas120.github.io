import type { DemoId } from "@/data/demos";

export type Domain =
  | "distributed"
  | "os"
  | "web"
  | "devops"
  | "ta"
  | "research";

export type WorkContext =
  | "production"
  | "independent"
  | "coursework"
  | "research"
  | "open-source";

export type Ownership = "primary" | "contributor" | "team" | "evaluator";

export type WorkStatus =
  | "shipped"
  | "completed"
  | "ongoing"
  | "archived"
  | "in-development";

export interface Evidence {
  id?: string;
  label: string;
  value?: string;
  qualifier?: string;
  sourceUrl?: string;
}

export interface PortfolioCaseStudy {
  id: string;
  context: string;
  heading: string;
  title: string;
  body: string;
  impactLabel: string;
  impact: string;
  evidence?: string[];
  matrix?: [string, string][];
}

export interface Project {
  id: string;
  title: string;
  repoUrl?: string;
  blurb: string;
  detail: string;
  tech: string[];
  domains: Domain[];
  context: WorkContext;
  ownership: Ownership;
  status: WorkStatus;
  contribution: string;
  outcome: string;
  evidence: Evidence[];
  caseStudyUrl?: string;
  demoUrl?: string;
  demoId?: DemoId;
  caseStudy?: PortfolioCaseStudy;
}

export interface ExperienceItem {
  id: string;
  org: string;
  role: string;
  start: string; // e.g. "Jan 2025"
  end: string; // e.g. "Present"
  location?: string;
  points: string[];
  tags: Domain[];
  kind: "professional" | "teaching" | "education";
  scope: string;
  ownership: Ownership;
  technologies: string[];
  related?: { label: string; href: string }[];
  caseStudies?: PortfolioCaseStudy[];
}

export interface Publication {
  id: string;
  title: string;
  venue: string;
  year: number;
  doi: string;
  points: string[];
  publishedOnline?: string;
  issueYear?: number;
  citation?: string;
  authors?: string[];
  contribution?: string;
  paperUrl?: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface Highlight {
  id: string;
  label: string;
  detail: string;
}

export interface Metric {
  label: string;
  value: string;
  context: string;
  domains: Domain[];
}
