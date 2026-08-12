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
 *  2. No internal identifiers: no codenames, daemon names, private module names,
 *     source paths, function names,
 *     customer identifiers, internal URLs, credentials or log contents.
 *  3. Ownership is stated, never blurred. "Completely owned" and "co-owned"
 *     are separate fields and are rendered as separate groups.
 */

import { evidenceById } from "@/data/evidence";
import { profile } from "@/data/profile";

/* ------------------------------------------------- disclosure review gate */

/** Public source contains only the generalized platform name. */
export const PLATFORM = "the new line-card platform";

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
  email: profile.email,
  github: profile.github,
  githubUser: profile.githubUser,
  linkedin: profile.linkedin,
  demos: "/demos/",
  resume: profile.resume,
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
    "My work extends from C drivers, PetaLinux, hardware abstraction, and white-box testing to Terraform, API and database migrations, observability, production recovery, research, and technical teaching.",
  roleLensDisclosure:
    "This is my complete engineering portfolio, ordered through a dataplane and systems-software lens.",
  proofPoints: [
    `${P} bring-up on Cisco NCS 1014`,
    "100G · 400G · 800G feature paths",
    "Mark-and-Sweep warm-reload state reconciliation · completely owned",
    "Production C tested without physical hardware",
    "Hardware-independent feedback reduced from tens of minutes to seconds",
  ],
  /** Current context — deliberately not the primary identity. */
  context: "Incoming UC San Diego MSCS · starts Sep 2026 · expected 2027",
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
    body: `The new line-card platform retained a largely shared software base while changing the boundaries that mattered: revised CDR hardware, secure-boot behavior, lambda-split provisioning, and card-specific resource mappings. I made a substantial contribution to the platform-specific work required for release readiness.`,
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
    outcome: "Hardware availability no longer had to be the first moment the changed software path was exercised.",
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
    body: "The revised CDR required different programming and tuning behavior across a heavily shared C codebase. I replaced hardcoded tuning with table-driven selection and migrated the relevant programming path.",
    points: [
      "C implementation",
      "Driver and HAL changes",
      "Hardware-context integration",
      "Stable traffic validation",
      "FEC and error-counter checks",
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
      "Real production C source paths",
      "External SDK and hardware boundaries stubbed",
      "Typed strong stubs plus generated fallbacks",
      "Generated weak fallback stubs",
      "Per-test linker wrappers",
      "Card-specific behavior without rebuilding the common production archive",
      "gcc and clang support, coverage, ASan and UBSan, static analysis",
      "Error injection, behavior capture, and a trace-to-test replay path",
    ],
    outcome:
      "Hardware-independent feedback moved from tens of minutes to seconds, and the framework became part of the validation path for newly added code.",
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
      "A large automated campaign across more than 20,000 principal combinations",
      "Slice and bundle modes exercised as separate validation spaces",
      "Defect classes isolated and reproduced during development",
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
      "Board-revision and broader platform qualification",
    ],
  },
} as const;

/** Canonical role records used by the textual sections on this route. */
export const canonicalOpticalRole = evidenceById("role-cisco-optical");
