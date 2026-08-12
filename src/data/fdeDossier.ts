/**
 * Content for /fde — "THE DEPLOYMENT DOSSIER".
 *
 * All copy for the sticky scroll film lives here so the scene components carry
 * geometry only. Every claim is scoped to what Yashas built or directly drove:
 * he has not held the title Forward Deployed Engineer, the Webex work is
 * labelled a proof of concept, and approximate figures stay approximate.
 *
 * Note on employer figures: the Cisco estate numbers in scene 04 are rendered
 * directly here (owner-authorised for this page) rather than routed through
 * src/lib/disclosure.ts, which still withholds them on the other endpoints.
 */

export interface DossierScene {
  /** Scene number shown in the progress rail, e.g. "01". */
  id: string;
  /** Short mono label for the rail and the sheet header. */
  slug: string;
  eyebrow?: string;
  headline: string;
  body?: string;
  /** Short supporting lines, rendered as annotations rather than cards. */
  notes?: string[];
  /** Single emphasised outcome, if the scene has one. */
  outcome?: string;
  /**
   * Which surface of the active theme the scene sits on. "deep" is a small step
   * inside the same theme (used by the production scenes), never a switch to the
   * other theme — see isDeepScene() in components/fde/dossier/kit.tsx.
   */
  panel: "base" | "deep";
}

export const fdeChrome = {
  name: "Yashas Kadambi",
  descriptor: "Forward Deployed Engineering",
  links: {
    // No FDE-specific PDF is published in this repository, so the résumé slot
    // points at the LinkedIn profile rather than a URL that would 404.
    resume: { label: "Resume", href: "https://www.linkedin.com/in/yashas120", external: true },
    github: { label: "GitHub", href: "https://github.com/Yashas120", external: true },
    email: { label: "Email", href: "mailto:ykadambi@ucsd.edu", external: false },
  },
  email: "ykadambi@ucsd.edu",
  github: "https://github.com/Yashas120",
  linkedin: "https://www.linkedin.com/in/yashas120",
} as const;

export const fdeMetaDossier = {
  title: "Yashas Kadambi — Deployment Dossier",
  description:
    "A field document: ambiguous operational problems turned into systems people use, across backend systems, deployment automation, developer tooling, and enterprise prototypes.",
  ogTitle: "Yashas Kadambi — Forward Deployed Engineering",
  ogDescription:
    "Understand the workflow, build something the domain can use, read production before changing it, deploy safely, hand it off.",
  url: "https://yashas120.github.io/fde/",
};

export const scenes: DossierScene[] = [
  {
    id: "01",
    slug: "translate ambiguity",
    eyebrow: "FORWARD DEPLOYED ENGINEERING",
    headline: "I turn ambiguous operational problems into systems people can actually use.",
    body:
      "Production engineer with ~3 years across backend systems, deployment automation, developer tooling, and enterprise prototypes. M.S. Computer Science at UC San Diego.",
    notes: ["Understand → model → build → deploy → hand\u00A0off"],
    panel: "base",
  },
  {
    id: "02",
    slug: "understand the workflow",
    headline: "The first system to debug is the problem itself.",
    body:
      "At Schneider Electric, I was the only software engineer embedded in a mechanical engineering team. I interviewed domain experts, mapped their calculations, and translated informal processes into a maintainable application.",
    panel: "base",
  },
  {
    id: "03",
    slug: "build for the domain",
    headline: "From twenty workflows to one deployed tool.",
    body:
      "I built a Python/Tkinter Windows application with an Excel-backed structured knowledge store and SSO, then handled deployment, documentation, and knowledge transfer.",
    outcome: "~2 days → ~2 hours",
    notes: [">90% faster · ~20 workflows · ~35 users · delivered in ~2 months"],
    panel: "base",
  },
  {
    id: "04",
    slug: "read production",
    headline: "Production systems reveal their real architecture through traffic.",
    body:
      "At Cisco, I mapped production consumers across approximately 50 services, 500,000 calls per day, 30 integrations, 12 teams, and 96 endpoints to support no-impact change planning.",
    notes: [
      "I also traced a production authentication defect across four repositories and decompiled two JARs to identify the least-risk fix.",
    ],
    panel: "deep",
  },
  {
    id: "05",
    slug: "deploy safely",
    headline: "A deployment is finished when the system is healthy—not when the command returns.",
    body:
      "I exposed hidden service, load-balancer, and deployment dependencies, then staged rollouts with health checks while keeping old pods available until replacements were stable.",
    notes: [
      "Reusable Terraform modules and cross-region dependencies reduced deployment time by approximately 50%.",
    ],
    panel: "deep",
  },
  {
    id: "06",
    slug: "repetition into leverage",
    headline: "The next deployment should be easier than the last.",
    panel: "base",
  },
  {
    id: "07",
    slug: "AI under constraints",
    headline: "Enterprise AI is also a deployment problem.",
    body:
      "I built a RAG proof of concept across 10 Webex groups and thousands of messages, with scheduled ingestion, vector retrieval, group-membership authorization, and approved GPT-4 access.",
    notes: ["Proof of concept"],
    panel: "base",
  },
];

/** Scene 06, revealed one at a time against the same automation rail. */
export const leverageItems = [
  {
    id: "sdk",
    label: "SDK CI",
    line: "SDK CI: approximately four hours of manual work per SDK → automated pipeline supporting roughly 200 API operations",
  },
  {
    id: "onboarding",
    label: "repo onboarding",
    line: "Repository onboarding automated across approximately 200 repositories and 13 GitHub accounts for a 20-person team",
  },
  {
    id: "cmocka",
    label: "CMocka",
    line: "CMocka infrastructure across 122 production sources and ~430 stubs: approximately 30 minutes → 10 seconds",
  },
  {
    id: "silicon",
    label: "Apple Silicon",
    line: "Apple Silicon DataStax setup: a three-month blocker replaced with an approximately 30-minute scripted path for ~20 developers",
  },
  {
    id: "log4j",
    label: "air-gapped",
    line: "Air-gapped Log4j modernization across ~50 VMs with no downtime",
  },
];

export const handoff = {
  slug: "handoff",
  headline: "Listen closely. Build concretely. Leave the system stronger.",
  body:
    "I am exploring Forward Deployed Engineer roles where technical depth, ambiguity, deployment, and user outcomes meet.",
  name: "Yashas Kadambi",
  education: "M.S. Computer Science · UC San Diego",
  email: "ykadambi@ucsd.edu",
  stamps: ["UNDERSTOOD", "SHIPPED", "VERIFIED", "HANDED OFF"],
  cta: "Start a conversation",
};
