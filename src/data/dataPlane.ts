/**
 * Literal content for /data-plane.
 *
 * Every public claim on this endpoint is written here in plain language so the
 * animation components never own a fact. Rules that hold for this file:
 *
 *  1. No illustrative numbers. Every figure below is supplied by the owner or
 *     already present in the approved résumé data. Nothing is rounded up,
 *     invented, or extrapolated. In particular there are no reach, OSNR, BER,
 *     latency, temperature or voltage figures anywhere on the route, and no
 *     measured before/after claim for the PM tooling, because none is verified.
 *  2. No internal identifiers beyond the single reviewed codename below: no
 *     daemon names, private module names, source paths, function names,
 *     customer identifiers, internal URLs, credentials or log contents.
 *  3. Ownership is stated, never blurred. "Completely owned" and "co-owned"
 *     are separate fields and are rendered as separate groups.
 */

/* ------------------------------------------------- disclosure review gate */

/**
 * The one internal platform codename on this route.
 *
 * The owner explicitly asked for it to appear in the hero and the flagship
 * narrative, so `approved` is true and the term renders. It is centralised here
 * so a reviewer can neutralise it everywhere by flipping one flag: set
 * `approved: false` and every headline, body and label falls back to
 * `publicSafe` ("a new optical line-card platform") with no other edits.
 *
 * FLAGGED FOR FINAL PUBLIC-DISCLOSURE REVIEW BEFORE DEPLOYMENT.
 */
export const codename = {
  term: "Aquila",
  publicSafe: "the new line-card platform",
  approved: true,
  note: "Internal Cisco platform codename. Owner-requested for this route; confirm it is publicly disclosable before deploy.",
} as const;

/** The platform name as rendered. Use this, never a hardcoded literal. */
export const PLATFORM = codename.approved ? codename.term : codename.publicSafe;

/** Possessive / sentence-initial variants so copy stays grammatical either way. */
const P = PLATFORM;

/* ------------------------------------------------------------------- meta */

export const dpMeta = {
  title: "Yashas Kadambi — Optical Dataplane & Systems Software Engineer",
  description: `Systems software engineer with experience in ${P} optical line-card bring-up, CDR integration, high-speed Ethernet modes, warm-boot recovery, validation infrastructure, cloud platforms, and production reliability.`,
  url: "https://yashas120.github.io/data-plane",
} as const;

/* ---------------------------------------------------------------- contact */

export const dpContact = {
  email: "ykadambi@ucsd.edu",
  github: "https://github.com/Yashas120",
  githubUser: "Yashas120",
  linkedin: "https://www.linkedin.com/in/yashas120",
  /**
   * No PDF is committed under `public/`, so the résumé action points at the
   * LinkedIn profile — the same destination /backend and /fde use. Swap this
   * for a hosted PDF path once the file actually ships.
   */
  resumeHref: "https://www.linkedin.com/in/yashas120",
  resumeLabel: "Résumé",
} as const;

/* ------------------------------------------------------------------- hero */

export const dpHero = {
  name: "Yashas Kadambi",
  role: "Dataplane & Systems Software",
  eyebrow: "YASHAS KADAMBI · DATAPLANE & SYSTEMS SOFTWARE",
  thesis: "Software where signals become systems.",
  positioning:
    "Optical dataplane and systems software engineer building reliable software across hardware, firmware, Linux, networking, testing, telemetry, and production infrastructure.",
  headline: "I build production software where hardware state, software intent, and live traffic have to agree.",
  profile: `Systems software engineer with 3+ years of experience across optical line-card dataplanes, embedded hardware integration, cloud platforms, backend reliability, and developer tooling. At Cisco, I helped bring up ${P} for the NCS 1014 line-card platform—spanning revised CDR integration, secure-boot-aware workflows, high-speed Ethernet modes, warm-boot state recovery, validation infrastructure, and firmware/FPGA diagnosis.`,
  supporting:
    "From C drivers and PetaLinux to test automation, telemetry, cloud infrastructure, and production recovery.",
  proofPoints: [
    `${P} platform bring-up`,
    "100G · 400G · 800G feature paths",
    "122 production C files tested without physical hardware",
    "~30-minute test build reduced to ~10 seconds",
  ],
  /** Current context — deliberately not the primary identity. */
  context: "Incoming UC San Diego MSCS",
} as const;

/* -------------------------------------------------- flagship story: chapters */

export interface DpChapter {
  /** Two-digit rail label. */
  id: string;
  /** Short mono stage annotation. */
  stage: string;
  eyebrow: string;
  heading: string;
  body: string;
  /** Supporting evidence bullets. */
  points?: readonly string[];
  /** Single emphasised outcome. */
  outcome?: string;
  /** Caveat or scope note, rendered in the faintest tone. */
  note?: string;
  /** Accessible description of this chapter's diagram. */
  diagram: { title: string; desc: string };
  /** Sub-blocks, used by the multi-feature chapter. */
  branches?: readonly {
    label: string;
    ownership: "complete" | "co-owned";
    body: string;
  }[];
}

export const dpChapters: readonly DpChapter[] = [
  {
    id: "01",
    stage: "platform scope",
    eyebrow: "A PLATFORM, NOT A SINGLE FEATURE",
    heading: `${P} was a platform bring-up, not an isolated feature.`,
    body: `The new line-card platform retained a largely shared software base while changing the boundaries that mattered: revised CDR hardware, secure-boot behavior, lambda-split provisioning, and card-specific resource mappings. I contributed more than half of the platform-specific software work required to take that shared base to release readiness.`,
    note: "The shared base was built by many engineers over years. The contribution stated here is scoped to the platform-specific work, not to the platform as a whole.",
    diagram: {
      title: "Shared line-card software base with the platform-specific region highlighted",
      desc: "A schematic of the line-card software stack. Most of the architecture is shared and shown dimmed; a smaller region covering the revised CDR, secure boot, lambda-split provisioning and card-specific resource mappings is highlighted as the platform-specific work.",
    },
  },
  {
    id: "02",
    stage: "early bring-up",
    eyebrow: "BRING-UP BEFORE FINAL HARDWARE",
    heading: `We started ${P} bring-up before the final board arrived.`,
    body: `I co-owned the ${P} and revised-CDR bring-up, using precursor hardware to prove the new behavior and implementing the changed lambda-split provisioning path before complete ${P} hardware was available.`,
    outcome: "Schedule risk moved off the critical path of hardware availability.",
    note: "Co-owned. No estimate of days saved is claimed, because none was measured.",
    diagram: {
      title: "Precursor hardware proving new behavior before the final board exists",
      desc: "A translucent precursor board carries the revised CDR and the changed provisioning path. The final line card then materialises around an already-working software path.",
    },
  },
  {
    id: "03",
    stage: "cdr integration",
    eyebrow: "INTEGRATE THE REVISED CDR",
    heading: "Program new hardware without regressing the shared platform.",
    body: "The revised CDR required different programming and tuning behavior across a heavily shared C codebase. I replaced hardcoded tuning with table-driven selection and migrated the programming path across hundreds of relevant use sites.",
    points: [
      "C implementation",
      "Driver and HAL changes",
      "Hardware-context integration",
      "Stable traffic validation",
      "Clean FEC and error counters",
      "Warm-restart continuity",
      "Regression protection for existing card behavior",
    ],
    diagram: {
      title: "Duplicated tuning constants collapsing into one table-driven source",
      desc: "Many hardcoded tuning values collapse into a single configuration table. The selected row is carried through the hardware abstraction layer and the C driver path into the CDR.",
    },
  },
  {
    id: "04",
    stage: "feature paths",
    eyebrow: "HIGH-SPEED DATAPLANE MODES",
    heading: "Built feature paths across 100G, 400G, and 800G modes.",
    body: "Three feature paths on the same platform, with different scopes of ownership. Modulation and slice behavior are shown as architecture, not as performance claims.",
    branches: [
      {
        label: "400G QPSK",
        ownership: "complete",
        body: "Completely owned the 400G QPSK software implementation, including trunk programming, consistent modulation reporting, upgrade behavior, and regression protection for unrelated traffic.",
      },
      {
        label: "800GE slice and bundle modes",
        ownership: "co-owned",
        body: "Co-developed 800GE slice and bundle paths, including 400G-to-800G transitions, port-exclusion rules, resource provisioning, and an 8x100G distribution mode involving GCC and encryption behavior.",
      },
      {
        label: "2x100G",
        ownership: "complete",
        body: "Completely owned the 2x100G feature implementation and automated nearly all associated validation using the existing platform test environment.",
      },
    ],
    note: "QPSK carries fewer bits per symbol than higher-order modulation and is correspondingly more tolerant of impairment. The diagram shows that trade-off structurally; no reach or OSNR figures are published here.",
    diagram: {
      title: "Three feature paths: 400G QPSK, 800GE slice and bundle, and 2x100G",
      desc: "A constellation comparison contrasts QPSK's fewer symbols and higher tolerance with higher-order modulation's greater density. An 800G trunk separates into logical subchannels, including an eight-way 100G distribution. A 2x100G client path is shown alongside.",
    },
  },
  {
    id: "05",
    stage: "state reconciliation",
    eyebrow: "PRESERVE STATE THROUGH WARM RELOADS",
    heading: "Keep valid hardware programmed while software restarts.",
    body: "I completely owned and generalized the Mark-and-Sweep state-reconciliation architecture. It compares desired software state with resources already programmed in hardware, preserves matches, and corrects only mismatches.",
    outcome:
      "The generalized core later supported 2x100G, 800GE, 8x100GE, and 2x400GE modes through focused changes to feature data rather than repeated modification of the high-risk reconciliation algorithm.",
    diagram: {
      title: "Reconciling desired software state against state already programmed in hardware",
      desc: "Software state disappears during a warm reload and is reconstructed. Desired state is drawn as an outline and actual hardware state as solid resources. Matching resources merge and are marked preserved; mismatches are marked and corrected. The traffic waveform stays continuous throughout.",
    },
  },
  {
    id: "06",
    stage: "validation scale",
    eyebrow: "VALIDATE ENORMOUS STATE SPACES",
    heading: "Turned configuration scale into a repeatable engineering process.",
    body: "Two separate validation campaigns, each built to make a state space too large to test by hand into something a machine could sweep repeatably.",
    diagram: {
      title: "Configuration space sampled as a lattice, with isolated defects illuminated",
      desc: "The line-card resource map becomes a configuration lattice. Scale is represented by density and sampling rather than by drawing every state. A sweep passes across representative configurations and a small number of isolated defects are highlighted.",
    },
  },
  {
    id: "07",
    stage: "white-box testing",
    eyebrow: "TEST PRODUCTION C WITHOUT THE LAB",
    heading: "Cut the dependency graph at the hardware boundary.",
    body: "I co-designed a standalone CMocka white-box framework and completely implemented the successful third-generation stubbing approach. It compiles the real production path for x86_64 while replacing physical hardware and external SDK boundaries.",
    points: [
      "122 production C source files",
      "Approximately 430 external SDK functions stubbed",
      "Approximately 415 typed strong stubs",
      "Generated weak fallback stubs",
      "Per-test linker wrappers",
      "Card-specific behavior without rebuilding the common production archive",
      "gcc and clang support, coverage, ASan and UBSan, static analysis",
      "Error injection, behavior capture, and a trace-to-test replay path",
    ],
    outcome:
      "Build cycle reduced from approximately 30 minutes to approximately 10 seconds, and adopted as a mandatory quality gate for newly added code.",
    note: "This compiles the real production sources. It is not a reimplementation or a simplified model of the production system.",
    diagram: {
      title: "The real production path compiled with hardware and SDK boundaries replaced by test doubles",
      desc: "The application, hardware abstraction layer and driver layers stay solid because they are the real production code. Only the physical hardware and external SDK boundaries fade out and are replaced with typed stubs and generated fallbacks. The feedback loop contracts from about thirty minutes to about ten seconds.",
    },
  },
  {
    id: "08",
    stage: "secure development",
    eyebrow: "MAKE SECURE DEVELOPMENT SAFER",
    heading: "Made secure-boot hardware safer to develop on.",
    body: "Secure boot changed how datapath images could be deployed and recovered. I built and expanded a deployment workflow that standardized the safe boot sequence, node selection, authentication, image installation, and log collection.",
    points: [
      "Reduced risky manual deployment steps",
      "Centralized changing development credentials",
      "Made active test nodes visible",
      "Simplified node addressing",
      "Supported daily engineering workflows",
      "Expanded adoption beyond the immediate team",
    ],
    note: "Described by function only. No tool name, host, address, credential store or infrastructure detail is published, and no incident-prevention figure is claimed.",
    diagram: {
      title: "A standardized deployment sequence replacing ad-hoc manual steps",
      desc: "Five stages — safe boot sequence, node selection, authentication, image installation and log collection — are shown as one guarded workflow. Risky manual steps are shown collapsing into the standardized path.",
    },
  },
  {
    id: "09",
    stage: "cross-layer diagnosis",
    eyebrow: "OBSERVE AND DIAGNOSE ACROSS LAYERS",
    heading: "Follow failures beyond the component my team owned.",
    body: "I resolved a release-blocking skipped-version upgrade failure by tracing logs and controlled experiments across unfamiliar components. The investigation isolated an FPGA change that required a cold boot while the existing upgrade path performed a warm boot.",
    points: [
      "Prototyped a Performance Monitoring Analyzer that extracted PM data from router logs and turned large diagnostic records into a more focused counter-analysis workflow.",
      "Built development utilities that automated routine binary builds and deployments while streaming device logs back to local development machines for faster card-level debugging.",
    ],
    note: "No measured before-and-after improvement is claimed for the PM tooling, because no verified measurement exists.",
    diagram: {
      title: "Tracing a symptom down through software, firmware and FPGA boundaries",
      desc: "A symptom observed in the software upgrade path is traced downward through the firmware image to an FPGA change. The FPGA boundary is identified as the cause, a cold boot is performed instead of the warm-boot path, and the healthy traffic path returns.",
    },
  },
] as const;

/* ------------------------------------------- validation campaigns (chapter 06) */

export const validationCampaigns = [
  {
    id: "reconciliation",
    title: "State reconciliation",
    facts: [
      "Approximately 24,000 essential configurations",
      "Up to approximately 10 million exhaustive states",
      "Five corner cases found during development",
      "Approximately two minutes per warm-reload case",
      "Roughly 800 sequential hours for one 24,000-case pass if run manually",
    ],
  },
  {
    id: "slice-bundle",
    title: "800GE slice and bundle validation",
    facts: [
      "More than 20,000 principal configuration combinations",
      "Approximately 80,000 executions across three testers",
      "Five slice-mode defects found",
      "Three bundle-mode defects found",
    ],
  },
] as const;

/* -------------------------------------------------------------- ownership */

export const ownership = {
  complete: {
    label: "Completely owned",
    items: [
      "Mark-and-Sweep implementation and generalization",
      "400G QPSK implementation",
      "2x100G implementation",
      "Successful third-generation hardware-stubbing approach",
    ],
  },
  coOwned: {
    label: "Co-owned",
    items: [
      `${P} bring-up`,
      "Revised CDR integration",
      "800GE slice mode",
      "800GE bundle mode",
      "RevC and broader platform qualification",
    ],
  },
} as const;

/* --------------------------------------------- complete optical experience */

export const opticalRole = {
  org: "Cisco Systems",
  title: "Optical Software Development Engineer II",
  dates: "Jan 2025 – Jan 2026",
  location: "Bengaluru, India",
  scope: `Dataplane software for optical line cards on the NCS 1014 platform, centred on ${P} bring-up: hardware and firmware boundaries, high-speed Ethernet feature paths, warm-boot state recovery, and the validation infrastructure that made the work releasable.`,
  areas: [
    `${P} platform bring-up`,
    "Revised CDR hardware integration",
    "Lambda-split provisioning",
    "Driver, HAL, and hardware-context work in C",
    "Secure-boot-aware deployment",
    "400G QPSK",
    "800GE slice mode",
    "800GE bundle and 8x100G distribution",
    "2x100G",
    "Warm-boot state reconciliation",
    "Platform qualification across board and firmware revisions",
    "Large-scale configuration automation",
    "White-box CMocka infrastructure",
    "PM and logging tools",
    "Firmware/FPGA upgrade diagnosis",
  ],
} as const;

export const skillGroups = [
  { label: "Languages", items: ["C", "Python", "Java", "C++", "TypeScript", "SQL"] },
  { label: "Systems", items: ["Linux", "PetaLinux", "Drivers & HAL", "Firmware boundaries", "Secure boot", "CDR integration"] },
  { label: "Networking", items: ["Optical dataplane", "100G / 400G / 800G Ethernet modes", "FEC and error counters", "Telemetry & PM"] },
  { label: "Verification", items: ["CMocka", "SDK stubbing", "ASan / UBSan", "Static analysis", "Coverage", "Trace replay"] },
  { label: "Cloud & platform", items: ["AWS", "Terraform", "Docker", "CI/CD", "PostgreSQL", "DynamoDB"] },
] as const;

/* ------------------------------------ production systems beyond the line card */

export interface SupportingRole {
  id: string;
  org: string;
  title: string;
  dates: string;
  summary: string;
  points: readonly string[];
  note?: string;
}

export const supportingRoles: readonly SupportingRole[] = [
  {
    id: "cisco-backend",
    org: "Cisco Systems",
    title: "Software Development Engineer — Backend & Cloud Platforms",
    dates: "Aug 2023 – Jan 2025",
    summary:
      "Backend and infrastructure engineering for customer-facing cloud services: reusable infrastructure as code, deployment parallelization, database and request performance, and production recovery.",
    points: [
      "Reusable Terraform infrastructure across approximately 50 services and 35 Lambda functions",
      "Development, staging, and production accounts across global regions",
      "Dependency-aware deployment parallelization, cutting deployment time approximately 50%",
      "Up to approximately four hours saved during some multi-region database bring-ups",
      "Coordinated a no-downtime database cutover",
      "Approximately 40% page-load improvement through request and database analysis",
      "Root-cause work across production failures and hidden service dependencies",
      "Authentication and gateway modernization across approximately 50 services, 30 integrations, 12 teams, and 96 endpoint deployments, with zero customer impact during the coordinated production migration",
      "Modernization of approximately 50 air-gapped VMs from end-of-life logging software to a patched version without downtime",
    ],
  },
  {
    id: "cisco-intern",
    org: "Cisco Systems",
    title: "Technical Intern",
    dates: "Jan 2023 – Jun 2023",
    summary:
      "Developer tooling and data integration: removing repeated manual release work from the SDK pipeline and automating a licensing-constrained developer dependency.",
    points: [
      "Automated Python and Java SDK generation and publication",
      "Reduced approximately four hours of repetitive work per SDK release to zero routine generation and publication effort",
      "Connected API-change detection, generation, validation, and publishing in CI",
      "AWS data-integration work",
      "Automated an approved Docker Desktop alternative, avoiding approximately $1,500 in annual licensing cost",
    ],
  },
  {
    id: "schneider",
    org: "Schneider Electric",
    title: "Software Engineering Intern",
    dates: "May 2022 – Jul 2022",
    summary:
      "Sole software engineer inside a predominantly mechanical switchgear team, translating domain expertise into a working engineering tool end to end.",
    points: [
      "Requirements discovery with mechanical engineers",
      "Translation of domain knowledge into a software model",
      "Application architecture and implementation",
      "Test-selection and engineering-discussion workflow reduced from approximately two days to approximately two hours",
      "Deployment, documentation, demonstration, and knowledge transfer",
    ],
  },
] as const;

/* ------------------------------------------- selected systems and research */

export type DpOwnership = "original" | "collaborative" | "coursework" | "research" | "fork" | "concept";

export const OWNERSHIP_LABEL: Record<DpOwnership, string> = {
  original: "Original work",
  collaborative: "Collaborative",
  coursework: "Coursework",
  research: "Peer-reviewed research",
  fork: "Fork",
  concept: "Concept",
};

export interface DpProject {
  id: string;
  title: string;
  ownership: DpOwnership;
  /** Visual weight: 1 leads the section, 2 is secondary, 3 is a compact line. */
  weight: 1 | 2 | 3;
  body: string;
  stack: readonly string[];
  href?: string;
  meta?: string;
}

export const dpProjects: readonly DpProject[] = [
  {
    id: "bitcoin",
    title: "Bitcoin Transactions in Java",
    ownership: "original",
    weight: 1,
    body: "A from-scratch implementation of the protocol and its cryptographic primitives with no external dependencies: hashing, elliptic-curve arithmetic over finite fields, transaction serialization, and script evaluation.",
    stack: ["Java", "SHA-256", "RIPEMD-160", "Elliptic-curve crypto"],
    href: "https://github.com/Yashas120/Bitcoin-Transactions-in-java",
  },
  {
    id: "underwater",
    title: "Underwater Data-Center Monitoring",
    ownership: "research",
    weight: 1,
    body: "Hardware monitoring and sensing for submerged infrastructure, built with redundancy and availability in mind because physical maintenance access is expensive and slow.",
    stack: ["Arduino", "Sensing", "Redundancy", "Systems integration"],
    meta: "IEEE CSITSS · 2021 · doi 10.1109/CSITSS54238.2021.9683449",
  },
  {
    id: "multiview",
    title: "Multiview 3D Reconstruction",
    ownership: "original",
    weight: 2,
    body: "Incremental structure-from-motion producing 3D point clouds from 2D images — feature matching, triangulation and reconstruction geometry, with no deep-learning dependency.",
    stack: ["Python", "OpenCV", "Structure from Motion"],
    href: "https://github.com/Yashas120/Multiview-3D-Reconstruction",
  },
  {
    id: "swift",
    title: "SWIFT — lightweight image super-resolution",
    ownership: "research",
    weight: 2,
    body: "A hybrid transformer and fast-Fourier-convolution model for image super-resolution, using a dual frequency-spatial block to draw on both spatial and frequency-domain features.",
    stack: ["PyTorch", "Transformers", "FFC"],
    meta: "Approximately 34% fewer parameters and up to 60% faster inference than the stated comparison baseline.",
  },
] as const;

export const teaching = {
  title: "Teaching Assistant — PES University",
  dates: "Jul 2022 – May 2023",
  summary:
    "Supported 656 learners across computer vision, data analytics, and deep learning: created assignments, labs, grading tools, competition infrastructure, and technical explanations.",
  courses: ["Image Processing & Computer Vision", "Data Analytics", "Deep Learning"],
} as const;

/* -------------------------------------------------------------- education */

export const education = [
  {
    org: "University of California San Diego",
    detail: "M.S. Computer Science",
    dates: "Incoming September 2026 · Expected 2027",
  },
  {
    org: "PES University",
    detail: "B.Tech. Computer Science and Engineering",
    dates: "2019 – 2023",
  },
] as const;
