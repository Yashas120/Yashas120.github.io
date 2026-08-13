/** FDE-specific ordering and framing. Facts live in profileEvidence.ts. */

import { contact } from "@/data/profileEvidence";

export type DossierVisual =
  | "cover"
  | "workflow"
  | "tool"
  | "production"
  | "rollout"
  | "diagnosis"
  | "constraints"
  | "leverage"
  | "rag"
  | "optical"
  | "release";

export interface DossierScene {
  id: string;
  slug: string;
  eyebrow: string;
  headline: string;
  body: string;
  status: string;
  meaning: string;
  transition: string;
  notes?: string[];
  outcome?: string;
  panel: "base" | "deep";
  visual: DossierVisual;
  evidenceIds: string[];
}

export const fdeChrome = {
  name: contact.name,
  descriptor: "Forward Deployed Engineering",
  email: contact.email,
  github: contact.github,
  linkedin: contact.linkedin,
  resumeUrl: contact.resumeUrl,
} as const;

export const fdeMetaDossier = {
  title: "Yashas Kadambi — Forward Deployed Engineering",
  description:
    "A complete role-lens portfolio for a production software engineer spanning discovery, implementation, deployment, debugging, optical systems, research, projects, and teaching.",
  ogTitle: "Yashas Kadambi — Forward Deployed Engineering",
  ogDescription:
    "A complete engineering record ordered through discovery, implementation, safe deployment, operational debugging, and durable handoff.",
  url: "https://yashas120.github.io/fde/",
} as const;

export const scenes = [
  {
    id: "01",
    slug: "role lens",
    eyebrow: "FORWARD DEPLOYED ENGINEERING · COMPLETE PROFILE",
    headline: "I turn ambiguous operational problems into systems people can actually use.",
    body:
      "I’m Yashas Kadambi, a software engineer with roughly three years of production experience across backend systems, cloud infrastructure, deployment tooling, optical platform software, and operational debugging. I’m preparing to begin an MS in Computer Science at UC San Diego in September 2026.",
    status: "Complete engineering record · forward-deployed role lens",
    meaning: "The lens is an operating method applied to a complete career, not a past job title.",
    transition: "The dossier opens into the raw discovery worksheet.",
    notes: [
      "Complete engineering record, ordered through a forward-deployed lens: discover, build, deploy, debug, and leave durable leverage.",
      "Schneider: discovered, built, deployed, and handed off a workflow tool used after the internship.",
    ],
    panel: "base",
    visual: "cover",
    evidenceIds: ["ED-01", "PE-01", "PE-08", "PE-21", "CP-01", "LK-01", "LK-02", "LK-03", "LK-05"],
  },
  {
    id: "02",
    slug: "discover the workflow",
    eyebrow: "FIELD NOTE 01 · DISCOVERY",
    headline: "Start with the workflow, not the feature request.",
    body:
      "At Schneider Electric, I was the sole software engineer inside a mechanical switchgear team. I interviewed domain experts and mapped how a component, its required tests, and its expected failure modes related before writing the application.",
    status: "Embedded discovery · requirements through handoff owned",
    meaning: "Requirements came from users and operational artifacts before software implementation began.",
    transition: "The ruled domain schema becomes the application knowledge store and generated plan.",
    notes: ["Users: switchgear engineers · Constraint: knowledge lived across people and spreadsheets · Ownership: requirements through handoff"],
    panel: "base",
    visual: "workflow",
    evidenceIds: ["PE-21", "CP-01"],
  },
  {
    id: "03",
    slug: "build and hand off",
    eyebrow: "FIELD NOTE 02 · SHIPPED TOOL",
    headline: "Ship the tool and the handoff.",
    body:
      "I built and deployed a Python/Tkinter Windows application with an Excel-backed knowledge store and generated Excel test plan. I owned requirements, architecture, implementation, functional verification, security review, local deployment, documentation, and knowledge transfer.",
    status: "Deployed internally · verified · handed off",
    meaning: "The useful delivery unit includes discovery, implementation, environment fit, verification, adoption, and handoff.",
    transition: "A trace leaves the generated plan and enters the production x-ray.",
    outcome: "roughly 2 days → roughly 2 hours",
    notes: ["More than 90% less engineering effort · continued in use after the internship · verified, deployed, and handed off"],
    panel: "base",
    visual: "tool",
    evidenceIds: ["PE-21", "CP-06", "CP-09", "CP-10"],
  },
  {
    id: "04",
    slug: "read production",
    eyebrow: "PRODUCTION X-RAY · DISCOVERY",
    headline: "Production traffic is the real dependency graph.",
    body:
      "During an authentication and API-endpoint migration at Cisco, documentation did not identify every active consumer. I used production traffic evidence to find integrations across services and teams, map ownership, and support staged validation and deployment-controlled changes. The cutover completed without customer impact.",
    status: "Production migration · co-owned",
    meaning: "Production evidence replaced assumptions and exposed the coordination problem before the change shipped.",
    transition: "Resolved dependencies align into prerequisite lanes and health gates.",
    notes: ["Observe actual calls · identify consumers and owners · sequence environments · stop on staging evidence · protect downstream users"],
    panel: "deep",
    visual: "production",
    evidenceIds: ["PE-08", "PE-12", "CP-01", "CP-02", "CP-04"],
  },
  {
    id: "05",
    slug: "sequence deployment",
    eyebrow: "DEPLOYMENT PLAN · ORDER MATTERS",
    headline: "Turn the architecture into an executable plan.",
    body:
      "I built and maintained reusable Terraform components across AWS infrastructure and separated work that could run concurrently from stages that had to wait for healthy prerequisites. Safe speed came from modeling dependencies, not from making everything concurrent.",
    status: "Production infrastructure · co-owned",
    meaning: "Safe speed came from modeling dependencies, not treating every stage as concurrent.",
    transition: "A blocked deployment path becomes the symptom entering the diagnostic stack.",
    notes: ["Also: an asynchronous DynamoDB → SNS → regional SQS → services → SQL path, and a database cutover using transaction-log continuity. No unverified ordering, retry, delivery, or replication guarantee is implied."],
    panel: "deep",
    visual: "rollout",
    evidenceIds: ["PE-09", "PE-10", "CP-03", "CP-04"],
  },
  {
    id: "06",
    slug: "isolate the failure",
    eyebrow: "INCIDENT TRACE · FIND THE RESPONSIBLE LAYER",
    headline: "Trace the symptom until the responsibility is clear.",
    body:
      "I have followed production failures across user behavior, APIs, authentication rules, application code, dependencies, load-balancer behavior, deployment order, database queries, and old pods retained during rollout. The goal is the least-risk correction at the layer that actually owns the failure—not a plausible patch near the symptom.",
    status: "Production diagnosis · co-owned",
    meaning: "Debugging is evidence-guided ownership discovery across system boundaries.",
    transition: "The corrected artifact enters three real-environment constraint envelopes.",
    notes: ["Separate cases: an access defect traced through compiled dependencies; a rollout failure exposing a hidden global URL and load-balancer dependency."],
    panel: "deep",
    visual: "diagnosis",
    evidenceIds: ["PE-11", "PE-13", "CP-02", "CP-04"],
  },
  {
    id: "07",
    slug: "fit the environment",
    eyebrow: "CONSTRAINT SHEET · THE ENVIRONMENT IS PART OF THE PRODUCT",
    headline: "A correct artifact still has to run where the work happens.",
    body:
      "I have adapted delivery paths for air-gapped legacy environments, Apple Silicon developer machines, and secure-boot-aware hardware recovery. The implementation changed with the constraint: bundle offline dependencies, reproduce a compatible runtime, or respect the platform’s trust boundary.",
    status: "Shipped and production constraints · ownership varies by artifact",
    meaning: "Deployment context is a first-class engineering input; portability and recovery require explicit work.",
    transition: "The resolved environment paths feed one reusable leverage rail.",
    notes: ["Air-gapped Log4j 1 → patched Log4j 2 migration · DataStax/Java compatibility on Apple Silicon · Colima container setup · secure-boot-aware recovery"],
    panel: "base",
    visual: "constraints",
    evidenceIds: ["PE-05", "PE-14", "PE-20", "CP-04", "CP-06"],
  },
  {
    id: "08",
    slug: "leave leverage",
    eyebrow: "LEVERAGE RAIL · THE NEXT TEAM SHOULD NOT START OVER",
    headline: "A fix becomes valuable when the next team can reuse it.",
    body:
      "Across roles, I turned repeated work into shared infrastructure: an API-change pipeline for Python and Java SDKs; hardware-independent C validation; repository onboarding and setup; a local legacy UI/database emulator; human-approved operations automation; and guides, runbooks, architecture notes, and knowledge transfer.",
    status: "Shipped and adopted artifacts · ownership stated per artifact",
    meaning: "Impact compounds when tooling and knowledge survive the immediate engagement.",
    transition: "The reusable pipeline trigger reaches an explicit human approval gate.",
    notes: ["Ownership and source remain explicit for every artifact."],
    panel: "base",
    visual: "leverage",
    evidenceIds: ["PE-06", "PE-16", "PE-18", "PE-20", "CP-06", "CP-09", "AW-05"],
  },
  {
    id: "09",
    slug: "bound the prototype",
    eyebrow: "APPLIED AI · PROOF OF CONCEPT",
    headline: "Prototype where a human can still verify the answer.",
    body:
      "I built a Webex RAG proof of concept that ingested approved group conversations, retrieved topic-relevant context, respected membership authorization, generated a draft answer with an approved model, and captured feedback for evaluation.",
    status: "Proof of concept / prototype · human controlled",
    meaning: "Applied AI is useful when scoped to a workflow, grounded in approved evidence, evaluated, and explicitly bounded.",
    transition: "The service trace crosses the hardware boundary and becomes an optical signal path.",
    notes: ["Engineering analytics: I built the Python backend; others built the Angular frontend.", "Multilingual voice assistant: collaborative CPU-only prototype for government subsidy and relief information."],
    panel: "base",
    visual: "rag",
    evidenceIds: ["PE-15", "AW-06", "PR-12", "CP-08"],
  },
  {
    id: "10",
    slug: "below services",
    eyebrow: "BEYOND THE PRIMARY LENS · OPTICAL PLATFORM SOFTWARE",
    headline: "The same systems discipline continues below the service boundary.",
    body:
      "As a Cisco Optical Software Development Engineer II, I built software at the optical line-card hardware/software boundary: pre-hardware enablement and platform bring-up, clock-and-data-recovery integration, warm-reload traffic continuity, QPSK and high-speed Ethernet modes, generalized resource reconciliation, secure-boot-aware recovery, performance-monitoring tooling, and C validation infrastructure.",
    status: "Production optical platform software · co-owned",
    meaning: "The breadth is connected by systems reasoning while each domain remains factually named.",
    transition: "The blueprint labels become the folio edges of the complete dossier.",
    notes: [
      "Not presented as forward-deployed work. The transfer is systems discipline: isolate boundary failures, model state, validate without full hardware, and make recovery safe.",
      "Validation: co-authored the CMocka framework and personally built its third-iteration stubbing architecture. Hardware-independent feedback moved from tens of minutes to seconds.",
    ],
    panel: "base",
    visual: "optical",
    evidenceIds: ["PE-01", "PE-02", "PE-03", "PE-04", "PE-05", "PE-06", "PE-07", "CP-05"],
  },
  {
    id: "11",
    slug: "release the record",
    eyebrow: "HANDOFF · COMPLETE RECORD",
    headline: "One operating pattern. A complete engineering record.",
    body:
      "Forward-deployed work leads the story because it is the role lens. The dossier continues below with every verified role, the complete project index, two publications, teaching across 656 learners, education, recognition, engineering scope, and direct evidence links.",
    status: "Verified record · complete",
    meaning: "Tailoring changes emphasis, not the evidence universe.",
    transition: "The sticky stage releases directly into the verified annex.",
    notes: ["Continue into the verified record."],
    panel: "base",
    visual: "release",
    evidenceIds: ["PE-01", "PE-08", "PE-17", "PE-21", "PE-22", "RS-01", "RS-02", "ED-01", "ED-02"],
  },
] satisfies readonly DossierScene[];

export const leverageItems = [
  { id: "sdk", label: "CI PIPELINE", line: "API specification change → generated and published Python and Java SDKs · individually built; production deployment owned elsewhere" },
  { id: "cmocka", label: "TEST HARNESS", line: "Hardware-coupled validation → feedback in seconds · framework co-authored; third-iteration stubbing architecture personally built" },
  { id: "setup", label: "SETUP PATH", line: "Repeated environment blockers → reusable repository, Apple Silicon, and local-emulator setup paths" },
  { id: "handoff", label: "RUNBOOK + KT", line: "Tacit operating knowledge → versioned guides, architecture notes, onboarding, and knowledge transfer" },
] as const;
