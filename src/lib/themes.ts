import { Domain } from "@/types";

export interface ThemeMeta {
  id: string;
  path: string;
  domain: Domain;
  label: string;
  metaphor: string;
  tagline: string;
  accent: string;
  prompt: string; // shell-style prompt / label snippet
}

export const themes: ThemeMeta[] = [
  {
    id: "cluster",
    path: "/cluster",
    domain: "distributed",
    label: "Distributed Systems",
    metaphor: "Cluster",
    tagline: "A cinematic, scroll-driven tour of distributed-systems and infrastructure work.",
    accent: "#22d3ee",
    prompt: "cluster",
  },
  {
    id: "kernel",
    path: "/kernel",
    domain: "os",
    label: "Operating Systems",
    metaphor: "Boot to Desktop",
    tagline: "Cold-boot the machine, then read the resume as apps in a windowed OS.",
    accent: "#4ade80",
    prompt: "root@kernel:~#",
  },
  {
    id: "devtools",
    path: "/devtools",
    domain: "devops",
    label: "DevOps & Platform",
    metaphor: "Delivery Inspector",
    tagline: "Read the portfolio, then inspect the delivery system behind the work.",
    accent: "#FFB454",
    prompt: "portfolio://delivery",
  },
  {
    id: "data-plane",
    path: "/data-plane",
    domain: "os",
    label: "Optical Dataplane",
    metaphor: "Stateful Dataplane",
    tagline: "From software intent to stable traffic: driver/HAL, CDR, and warm-boot state reconciliation.",
    accent: "#65E5FF",
    prompt: "software intent → stable traffic",
  },
  {
    id: "backend",
    path: "/backend",
    domain: "devops",
    label: "Backend Engineering",
    metaphor: "Agent Control Plane",
    tagline: "Dispatch an intent, review the plan, let the pipeline do the rest.",
    accent: "#60a5fa",
    prompt: "agent@px-cloud:~$",
  },
  {
    id: "fde",
    path: "/fde",
    domain: "devops",
    label: "Forward Deployed Engineering",
    metaphor: "Field Delivery Workbench",
    tagline: "Walk an ambiguous operational problem through to a deployed, adopted, reusable system.",
    accent: "#fb923c",
    prompt: "discover → codify",
  },
  {
    id: "notebook",
    path: "/notebook",
    domain: "ta",
    label: "Teaching Assistant",
    metaphor: "Jupyter Notebook",
    tagline: "Runnable cells that teach a concept, then reveal the artifact.",
    accent: "#fb7185",
    prompt: "In [ ]:",
  },
];

export function themeByPath(path: string): ThemeMeta | undefined {
  return themes.find((t) => t.path === path);
}
