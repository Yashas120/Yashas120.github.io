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
    metaphor: "MapReduce + Raft",
    tagline: "Roles run as MapReduce jobs; projects commit to a Raft replicated log.",
    accent: "#22d3ee",
    prompt: "mapreduce",
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
    domain: "web",
    label: "Web Development",
    metaphor: "DevTools",
    tagline: "Inspect the DOM, watch the network waterfall, run the console.",
    accent: "#f59e0b",
    prompt: "> devtools",
  },
  {
    id: "data-plane",
    path: "/data-plane",
    domain: "os",
    label: "Optical Systems",
    metaphor: "Data Plane",
    tagline: "Bring up a line-card, lock the laser, and push the BER to zero.",
    accent: "#a78bfa",
    prompt: "optical@ncs1014",
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
