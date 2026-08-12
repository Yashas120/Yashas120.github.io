/** The factual ledger behind /devtools. */

import type { DisclosureState } from "./disclosure";

export type Ownership =
  | "professional"
  | "original"
  | "collaborative"
  | "coursework"
  | "research"
  | "public-fork"
  | "teaching"
  | "concept"
  | "in-development";

export type Status =
  | "shipped"
  | "active"
  | "archived"
  | "completed-coursework"
  | "published"
  | "prototype"
  | "in-development"
  | "concept"
  | "unknown";

export type EvidenceClass =
  | "production"
  | "public-project"
  | "coursework"
  | "team-project"
  | "public-fork"
  | "research"
  | "teaching"
  | "credential"
  | "illustration";

export const classLabel: Record<EvidenceClass, string> = {
  production: "Production work",
  "public-project": "Public project",
  coursework: "Coursework",
  "team-project": "Team project",
  "public-fork": "Public fork",
  research: "Research",
  teaching: "Teaching",
  credential: "Credential",
  illustration: "Architectural illustration",
};

export interface EvidenceFact {
  id: string;
  claim: string;
  sourceLabel: string;
  sourceHref?: string;
  ownership: Ownership;
  status?: Status;
  disclosure: DisclosureState;
  technologies: string[];
  destinations: string[];
  capability: string;
  shortClaim: string;
  problem: string;
  contribution: string;
  outcome: string;
  classification: EvidenceClass;
  links?: { label: string; href: string }[];
}

const professional = (
  fact: Omit<EvidenceFact, "ownership" | "classification" | "disclosure" | "sourceLabel" | "destinations"> &
    Partial<Pick<EvidenceFact, "ownership" | "classification" | "disclosure" | "sourceLabel" | "destinations">>,
): EvidenceFact => ({
  ownership: "professional",
  classification: "production",
  disclosure: "public",
  sourceLabel: "Master CV · public-safe professional summary",
  destinations: ["/devtools"],
  ...fact,
});

export const evidence: EvidenceFact[] = [
  professional({
    id: "iac",
    capability: "Infrastructure as code",
    claim: "Built and extended reusable Terraform paths during a migration from manually configured AWS environments to infrastructure as code.",
    shortClaim: "Reusable Terraform paths and AWS migration work",
    problem: "Environment bring-up depended on manually held knowledge.",
    contribution: "Worked on shared Terraform components across compute, data, messaging, IAM, networking, and service dependencies.",
    outcome: "Bring-up became versioned and reusable across participating teams.",
    status: "shipped",
    technologies: ["Terraform", "AWS", "EC2", "ECS", "Lambda", "RDS", "IAM"],
  }),
  professional({
    id: "deploy-time",
    capability: "Dependency-aware delivery",
    claim: "Shortened the deployment path by parallelizing independent infrastructure while preserving ordered bring-up for dependent services.",
    shortClaim: "Dependency-aware deployment sequencing",
    problem: "Independent and dependent services were both moving through a serial plan.",
    contribution: "Separated safe concurrency from true prerequisites and retained stage gates and human approval.",
    outcome: "Independent work could run concurrently without bypassing prerequisite gates.",
    status: "shipped",
    technologies: ["Terraform", "AWS", "Dependency graph", "Stage gates"],
  }),
  professional({
    id: "sdk-ci",
    capability: "CI/CD automation",
    claim: "Built a GitHub Actions workflow that generated and published Python and Java SDKs from OpenAPI contract changes, replacing routine manual release work.",
    shortClaim: "Python and Java SDK generation and publication workflow",
    problem: "Contract changes required a repeated manual generation and publication cycle.",
    contribution: "Built change detection, parallel language generation, a human version decision, and artifact and documentation publication.",
    outcome: "Routine generation and publication became automated while version choice remained human-controlled.",
    status: "shipped",
    technologies: ["GitHub Actions", "OpenAPI", "Swagger", "Python", "Java"],
  }),
  professional({
    id: "incident",
    capability: "Operational diagnosis",
    claim: "Traced a production deployment failure across configuration, service references, load balancing, and logs, then changed the operating method to prevent recurrence.",
    shortClaim: "Cross-layer deployment diagnosis and prevention",
    problem: "A deployment exposed a hidden operational dependency.",
    contribution: "Compared configurations and previous/current logs, then added smaller validation increments, health checks, dependency-stack verification, and safer replacement timing.",
    outcome: "The dependency became explicit and the rollout method became safer.",
    status: "shipped",
    technologies: ["Load balancing", "Service discovery", "Health checks", "Log analysis"],
  }),
  professional({
    id: "page-load",
    capability: "Performance work",
    claim: "Improved application performance by moving filtering closer to the database and correcting query behavior.",
    shortClaim: "Database-led performance improvement",
    problem: "Large result sets were fetched before filtering in application memory.",
    contribution: "Used application-performance traces to locate the work and moved filtering into the query layer.",
    outcome: "Less unnecessary memory work and a shorter user-facing path.",
    status: "shipped",
    technologies: ["SQL", "PostgreSQL", "MongoDB", "Cassandra", "Application traces"],
  }),
  professional({
    id: "events",
    capability: "Event-driven systems",
    claim: "Worked on AWS infrastructure connecting data changes, fan-out, regional queues, service consumers, and database updates.",
    shortClaim: "DynamoDB, SNS, SQS, and regional consumer boundaries",
    problem: "Interdependent services had to respond to data changes across regions.",
    contribution: "Worked on the Terraform and integration boundaries between the data source, fan-out, queues, consumers, and database dependencies.",
    outcome: "A reusable event path with explicit ownership and deployment dependencies.",
    status: "shipped",
    technologies: ["DynamoDB", "SNS", "SQS", "Terraform"],
  }),
  professional({
    id: "auth-api",
    capability: "Authentication and API rollout",
    claim: "Coordinated or contributed across authentication and API endpoint changes with traffic- and log-based dependency discovery, staged validation, and deployment-controlled cutover.",
    shortClaim: "Dependency discovery and staged authentication/API rollout",
    problem: "Consumer dependencies were not fully represented by static ownership information.",
    contribution: "Used traffic and logs to discover consumers and coordinated validation and cutover across the dependency set.",
    outcome: "A rollout path grounded in observed dependencies rather than assumptions.",
    status: "shipped",
    technologies: ["Traffic analysis", "Log analysis", "API gateway", "Staged rollout"],
  }),
  professional({
    id: "constrained-security",
    capability: "Constrained security remediation",
    claim: "Modernized a vulnerable logging dependency in air-gapped legacy environments.",
    shortClaim: "Logging-dependency remediation in air-gapped systems",
    problem: "Normal package and deployment assumptions did not apply in disconnected legacy environments.",
    contribution: "Adapted the remediation and validation path to the constrained environment.",
    outcome: "The dependency could be modernized without publishing private package or estate details.",
    status: "shipped",
    technologies: ["Java", "Legacy systems", "Air-gapped deployment", "Security remediation"],
  }),
  professional({
    id: "firmware-rca",
    capability: "Cross-layer root-cause analysis",
    claim: "Traced a software-visible upgrade crash to a lower-layer FPGA or firmware change.",
    shortClaim: "Firmware and hardware upgrade failure diagnosis",
    problem: "The visible failure surfaced in software but crossed the firmware and hardware boundary.",
    contribution: "Followed the evidence across layers while keeping internal release identifiers private.",
    outcome: "The lower-layer source of the crash was identified.",
    status: "shipped",
    technologies: ["C", "FPGA", "Firmware", "Upgrade diagnostics"],
  }),
  professional({
    id: "test-loop",
    capability: "Developer feedback loops",
    claim: "Co-designed a hardware-independent C/C++ testing path that isolated external boundaries and enabled repeatable local validation.",
    shortClaim: "Hardware-independent C/C++ testing path",
    problem: "Production code depended on specialized hardware, making local testing slow.",
    contribution: "Isolated external boundaries behind stubs so production sources could compile and run locally.",
    outcome: "A repeatable local validation path and much faster feedback for newly added code.",
    status: "shipped",
    technologies: ["C", "C++", "CMocka", "Linux", "Stubs"],
  }),
  professional({
    id: "dev-environments",
    capability: "Development environments",
    claim: "Built repeatable local-development and debugging paths for legacy, cloud-connected, and hardware-adjacent systems.",
    shortClaim: "Reusable local build, deploy, logging, and documentation paths",
    problem: "Machine-specific setup and undocumented commands lengthened feedback loops.",
    contribution: "Created container alternatives, dependency setup, binary build/deploy automation, diagnostic streaming, and reusable guidance.",
    outcome: "Workflows another engineer could run and understand.",
    status: "shipped",
    technologies: ["Docker alternatives", "DataStax", "Apple Silicon", "Build automation", "Log streaming"],
  }),
  professional({
    id: "optical-platform",
    capability: "Optical platform bring-up",
    claim: "Contributed across new optical line-card bring-up, CDR integration, secure-boot-aware software, high-speed mode enablement, validation, performance-monitoring analysis, and developer tooling.",
    shortClaim: "Optical line-card and hardware/software boundary work",
    problem: "Production software had to be integrated and validated across software, firmware, hardware, and telemetry boundaries.",
    contribution: "Contributed features, table-driven hardware programming, validation paths, monitoring analysis, tooling, and documentation.",
    outcome: "Public-safe platform bring-up and reusable reliability practices without claiming cloud ownership.",
    status: "shipped",
    technologies: ["C", "C++", "CDR", "Secure boot", "QPSK", "Performance monitoring"],
  }),
  professional({
    id: "schneider-workflow",
    capability: "Workflow automation",
    claim: "Independently took a switchgear discussion workflow from requirements through architecture, implementation, and delivery, reducing the target cycle from approximately two days to approximately two hours.",
    shortClaim: "Requirements-to-delivery workflow automation",
    problem: "A specialist discussion process took approximately two days.",
    contribution: "Owned requirements discovery, architecture, implementation, delivery, and handoff.",
    outcome: "The target discussion cycle fell to approximately two hours.",
    status: "shipped",
    technologies: ["Requirements engineering", "Application architecture", "Workflow automation"],
  }),
  {
    id: "containers",
    capability: "Containers",
    claim: "Packaged a Flask and MongoDB application with Docker and Kubernetes using explicit configuration and credential boundaries.",
    shortClaim: "Docker and Kubernetes coursework deployment",
    problem: "A course application needed a repeatable orchestrated deployment.",
    contribution: "The public README assigns Yashas sections 1.1–1.3, including the MongoDB deployment configuration.",
    outcome: "A completed course-scale deployment; not production work.",
    classification: "coursework",
    disclosure: "public",
    ownership: "coursework",
    status: "completed-coursework",
    sourceLabel: "Public Cloud-Hack repository README",
    sourceHref: "https://github.com/Yashas120/Cloud-Hack",
    technologies: ["Docker", "Kubernetes", "Flask", "MongoDB"],
    destinations: ["/devtools#systems"],
    links: [{ label: "Repository", href: "https://github.com/Yashas120/Cloud-Hack" }],
  },
  {
    id: "cloud-rdbms",
    capability: "Cloud constraints",
    claim: "Modeled cloud projects, zones, quotas, inventory, cost, and virtual-machine lifecycle operations in PostgreSQL and PL/pgSQL.",
    shortClaim: "RDBMS-backed provisioning model",
    problem: "Finite cloud hardware required enforceable quota, availability, and lifecycle rules.",
    contribution: "Contributed to the database, Node.js, and React system; exact commit-level boundary remains to be verified.",
    outcome: "A completed collaborative course project and public fork.",
    classification: "public-fork",
    disclosure: "public",
    ownership: "collaborative",
    status: "completed-coursework",
    sourceLabel: "Public repository and project documentation",
    sourceHref: "https://github.com/Yashas120/Cloud-Provisioning-using-RDBMS",
    technologies: ["PostgreSQL", "PL/pgSQL", "Node.js", "React"],
    destinations: ["/devtools#systems", "/demos#cloud"],
    links: [{ label: "Repository", href: "https://github.com/Yashas120/Cloud-Provisioning-using-RDBMS" }],
  },
  {
    id: "ghost",
    capability: "Systems performance",
    claim: "Built a repeatable Linux and ghOSt environment to compare kernel and user-space scheduling policies across controlled workloads and configurations.",
    shortClaim: "Repeatable ghOSt scheduler experiment",
    problem: "Scheduler behavior had to be compared under controlled load, thread, and memory conditions.",
    contribution: "Built the experimental environment and analyzed CFS, FIFO, and user-space policies.",
    outcome: "A completed systems-performance project; repository link remains to be verified.",
    classification: "coursework",
    disclosure: "public",
    ownership: "coursework",
    status: "completed-coursework",
    sourceLabel: "Master CV · project record",
    technologies: ["Linux", "ghOSt", "CFS", "FIFO", "RocksDB"],
    destinations: ["/devtools#systems"],
  },
  {
    id: "portfolio-system",
    capability: "Portfolio architecture",
    claim: "Built one typed evidence model rendered through multiple role-native interfaces with Next.js, TypeScript, React, Tailwind, Framer Motion, and static export.",
    shortClaim: "Typed evidence model across six portfolio interfaces",
    problem: "Role-specific narratives needed to preserve one complete evidence universe.",
    contribution: "Designed and implemented the data model, interfaces, responsive behaviors, diagrams, and static deployment path.",
    outcome: "An active original static web application with public source.",
    classification: "public-project",
    disclosure: "public",
    ownership: "original",
    status: "active",
    sourceLabel: "Public portfolio repository",
    sourceHref: "https://github.com/Yashas120/Yashas120.github.io",
    technologies: ["Next.js 14", "TypeScript", "React", "Tailwind", "Framer Motion"],
    destinations: ["/devtools#systems", "/devtools#contact"],
    links: [{ label: "Source", href: "https://github.com/Yashas120/Yashas120.github.io" }],
  },
  {
    id: "swift-research",
    capability: "Efficient computer vision",
    claim: "Co-developed published image super-resolution research combining SwinV2 and Fourier-domain processing.",
    shortClaim: "SWIFT lightweight image super-resolution research",
    problem: "Image super-resolution models trade reconstruction quality against parameter and inference cost.",
    contribution: "Contributed to the model and associated public implementation.",
    outcome: "Published in 2025 (online 2024); comparison is qualified against its stated SwinIR lightweight baseline.",
    classification: "research",
    disclosure: "public",
    ownership: "research",
    status: "published",
    sourceLabel: "DOI record and public repository",
    sourceHref: "https://doi.org/10.47852/bonviewAIA42021930",
    technologies: ["PyTorch", "SwinV2", "Fourier processing"],
    destinations: ["/devtools#complete-work", "/demos#swift"],
  },
  {
    id: "underwater-research",
    capability: "Monitoring research",
    claim: "Contributed to a published Arduino and IoT monitoring-and-alert prototype for underwater data centers.",
    shortClaim: "Underwater data-center monitoring prototype",
    problem: "Submerged assets are expensive and slow to access for maintenance.",
    contribution: "Contributed to the monitoring, alert, and redundancy design.",
    outcome: "Peer-reviewed prototype published at IEEE CSITSS in 2021.",
    classification: "research",
    disclosure: "public",
    ownership: "research",
    status: "published",
    sourceLabel: "IEEE DOI record",
    sourceHref: "https://doi.org/10.1109/CSITSS54238.2021.9683449",
    technologies: ["Arduino", "IoT", "Monitoring", "Alerting"],
    destinations: ["/devtools#complete-work"],
  },
  {
    id: "teaching-scale",
    capability: "Teaching and enablement",
    claim: "Supported 656 learners across three distinct teaching-assistant appointments.",
    shortClaim: "Three courses and 656 learners supported",
    problem: "Assignments, feedback, and submission workflows had to operate at course scale.",
    contribution: "Designed labs and assignments, produced materials, ran support channels, and built grading, competition, and web-submission workflows.",
    outcome: "More repeatable feedback across image processing, data analytics, and graduate deep learning.",
    classification: "teaching",
    disclosure: "public",
    ownership: "teaching",
    status: "shipped",
    sourceLabel: "Master CV · teaching appointments",
    technologies: ["MATLAB", "Python", "TensorFlow/Keras", "Autograding", "Technical communication"],
    destinations: ["/devtools#enablement"],
  },
  {
    id: "leadership",
    capability: "Knowledge transfer",
    claim: "Mentored, onboarded, documented, and transferred operational knowledge across professional and teaching work.",
    shortClaim: "Mentoring, onboarding, documentation, and knowledge transfer",
    problem: "Operational knowledge loses value when it stays with one person.",
    contribution: "Created reusable guidance and supported engineers, learners, and community work.",
    outcome: "Knowledge moved through documented and repeatable paths.",
    classification: "production",
    disclosure: "public",
    ownership: "professional",
    status: "shipped",
    sourceLabel: "Master CV · leadership record",
    technologies: ["Documentation", "Mentoring", "Onboarding", "Teaching"],
    destinations: ["/devtools#enablement"],
  },
  {
    id: "aws-cert",
    capability: "AWS knowledge",
    claim: "AWS Certified Developer – Associate.",
    shortClaim: "AWS Certified Developer – Associate",
    problem: "—",
    contribution: "Credential held; no issue date or verification URL is published without the official record.",
    outcome: "Credential URL and dates remain pending verification.",
    classification: "credential",
    disclosure: "public",
    ownership: "professional",
    status: "unknown",
    sourceLabel: "Master CV · credential name only",
    technologies: ["AWS"],
    destinations: ["/devtools#overview", "/devtools#enablement"],
  },
];

export const evidenceById = (id: string): EvidenceFact | undefined => evidence.find((fact) => fact.id === id);

export const publicEvidence = evidence.filter((fact) => fact.disclosure === "public");

export const legend = [
  { key: "verified", label: "Verified fact", note: "Traced to a named evidence record." },
  { key: "normalized", label: "Normalized comparison", note: "A ratio drawn to scale, not a measured duration." },
  { key: "project", label: "Public project", note: "Ownership and status remain visible." },
  { key: "illustration", label: "Architectural illustration", note: "Mechanism only; not a production topology." },
] as const;
