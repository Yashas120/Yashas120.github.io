export type Domain =
  | "distributed"
  | "os"
  | "web"
  | "devops"
  | "ta"
  | "research";

export interface Project {
  id: string;
  title: string;
  repoUrl?: string;
  blurb: string;
  detail: string;
  tech: string[];
  domains: Domain[];
  stars?: number;
  status: "active" | "completed" | "archived";
  // OS/kernel theme fields
  pid: number;
  cpu: number; // %CPU for ps aux table
  mem: number; // %MEM for ps aux table
  state: "R" | "S" | "Z" | "D"; // process state
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
}

export interface Publication {
  id: string;
  title: string;
  venue: string;
  year: number;
  doi: string;
  points: string[];
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
