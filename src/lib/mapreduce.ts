import { experience } from "@/data/experience";
import { ExperienceItem } from "@/types";

export const EXECUTORS = 4;

// Priority heuristic: quantified impact and ownership/leadership verbs rank higher,
// so the map() value reflects how impactful each bullet is.
const QUANT = /(\d|%|→|->|\$|\bx\b)/i;
const VERBS = /\b(led|owned|delivered|built|designed|drove|root-caused|automated|migrated|cut|reduced|improved|saved|overhauled|configured|parallelized|mentored|onboarded|fixed|shipped|wrote)\b/i;

export function scorePoint(text: string): number {
  let s = 1;
  if (QUANT.test(text)) s += 3;
  if (VERBS.test(text)) s += 2;
  return s;
}

// map() emits (theme, score) for each bullet. Themes are matched by keyword; the
// first matching theme wins, falling back to "delivery".
export interface Theme {
  key: string;
  label: string;
  color: string;
  re: RegExp;
}

export const THEMES: Theme[] = [
  {
    key: "reliability",
    label: "reliability",
    color: "#f87171",
    re: /\b(outage|root-?cause|secure boot|resilient|resilience|redundanc|availab|zero production|recover|debug|monitor)\b/i,
  },
  {
    key: "performance",
    label: "performance",
    color: "#22d3ee",
    re: /(\b(cut|reduced|faster|speed|latency|parallelized|performance|throughput|optimi[sz])\b|%|→|->)/i,
  },
  {
    key: "infrastructure",
    label: "infra",
    color: "#a78bfa",
    re: /\b(terraform|iac|aws|ec2|ecs|lambda|docker|kubernetes|ci\/cd|ci pipeline|deploy|serverless|cloud|build)\b/i,
  },
  {
    key: "data",
    label: "data",
    color: "#4ade80",
    re: /\b(dynamodb|sqs|sns|postgres|mongo|cassandra|glue|database|db|data pipeline|sdk|api)\b/i,
  },
  {
    key: "ml",
    label: "ml/research",
    color: "#fbbf24",
    re: /\b(rag|openai|llm|model|ml|super-?resolution|gan|autoencoder|classif|vision|deep learning|research)\b/i,
  },
  {
    key: "leadership",
    label: "leadership",
    color: "#fb7185",
    re: /\b(led|owned|mentored|onboarded|drove|managed|kt session|code-quality|standards)\b/i,
  },
  {
    key: "hardware",
    label: "dataplane",
    color: "#60a5fa",
    re: /\b(line-?card|dataplane|cdr|qpsk|modulation|router|ncs|hardware|clock)\b/i,
  },
];

const FALLBACK: Theme = { key: "delivery", label: "delivery", color: "#94a3b8", re: /.*/ };

export function themeOf(text: string): Theme {
  return THEMES.find((t) => t.re.test(text)) ?? FALLBACK;
}

export interface MRPoint {
  text: string;
  key: string;
  label: string;
  color: string;
  value: number;
}

export interface MRGroup {
  key: string;
  label: string;
  color: string;
  items: MRPoint[];
  count: number;
  sum: number;
  top: string; // highest-score bullet text in the group
}

export interface MRJob {
  id: string;
  role: string;
  org: string;
  dates: string;
  location?: string;
  tags: string[];
  inputs: string[];
  mapped: MRPoint[];
  groups: MRGroup[];
}

// Cap how many input bullets we illustrate per job so the diagram stays legible.
export const MAX_INPUTS = 6;

function buildJob(e: ExperienceItem): MRJob {
  const inputs = e.points.slice(0, MAX_INPUTS);
  const mapped: MRPoint[] = inputs.map((text) => {
    const t = themeOf(text);
    return { text, key: t.key, label: t.label, color: t.color, value: scorePoint(text) };
  });

  const byKey = new Map<string, MRPoint[]>();
  for (const p of mapped) {
    const arr = byKey.get(p.key);
    if (arr) arr.push(p);
    else byKey.set(p.key, [p]);
  }

  const groups: MRGroup[] = Array.from(byKey.entries()).map(([key, items]) => {
    const sorted = [...items].sort((a, b) => b.value - a.value);
    const sum = sorted.reduce((acc, p) => acc + p.value, 0);
    return {
      key,
      label: sorted[0].label,
      color: sorted[0].color,
      items: sorted,
      count: sorted.length,
      sum,
      top: sorted[0].text,
    };
  });
  // shuffle/sort: highest aggregate impact first
  groups.sort((a, b) => b.sum - a.sum || b.count - a.count);

  return {
    id: e.id,
    role: e.role,
    org: e.org,
    dates: `${e.start} – ${e.end}`,
    location: e.location,
    tags: e.tags,
    inputs,
    mapped,
    groups,
  };
}

export const MRJOBS: MRJob[] = experience.map(buildJob);
