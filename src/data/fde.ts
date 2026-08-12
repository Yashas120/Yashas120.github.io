/**
 * Content model for /fde — the forward deployed engineering endpoint.
 *
 * Every factual claim on that page is stated here, once, so the animation
 * components stay free of copy and the attribution stays reviewable in one
 * place. Ownership verbs are deliberate: `individual` means Yashas owned it end
 * to end, `collaborative` means shared delivery, `supporting` means he
 * contributed to work someone else owned.
 *
 * Employer-scale figures are stored with BOTH the exact version and a truthful
 * generalization, behind the repository-wide review flag in
 * `src/lib/disclosure.ts`. Nothing here is silently swapped for an invented
 * alternative: while a figure is unapproved the weaker true statement renders
 * and the exact one is never sent to the browser.
 */

import type { DisclosedFacts, Disclosure as DisclosureReview } from "@/lib/disclosure";

export type { DisclosedFacts, DisclosureReview };

export type Ownership = "individual" | "collaborative" | "supporting";

export type DeliveryStatus = "production" | "deployed-internal" | "proof-of-concept" | "coursework";

export type Disclosure = "public-safe" | "review-required";

export interface EvidenceLink {
  label: string;
  href: string;
}

export interface FDECaseStudy {
  id: string;
  title: string;
  role: string;
  period: string;
  /** Who had the problem. */
  users: string;
  /** What the real workflow was before any software existed. */
  problem: string;
  /** What made it hard. */
  constraints: string[];
  /** How the real requirement was found. */
  discovery: string;
  /** What Yashas personally built or changed. */
  contribution: string[];
  /** The shape of the thing that shipped. */
  architecture?: string[];
  /** How it reached its users. */
  deployment: string;
  /** Who actually used it. */
  adoption: string;
  /** What measurably changed. */
  outcome: string;
  /** What became reusable afterwards. */
  reusableLeverage?: string[];
  ownership: Ownership;
  status: DeliveryStatus;
  disclosure: Disclosure;
  evidenceLinks?: EvidenceLink[];
}

/* ------------------------------------------------------------------ metadata */

export const fdeMeta = {
  title: "Yashas Kadambi — Forward Deployed Engineer",
  description:
    "Engineer with production experience turning ambiguous operational problems into deployed software across backend systems, cloud infrastructure, enterprise integrations, applied AI, developer tooling, and reliability.",
  ogTitle: "Yashas Kadambi — Forward Deployed Engineering",
  ogDescription:
    "From problem discovery and technical scoping to implementation, deployment, adoption, and reusable tooling.",
  url: "https://yashas120.github.io/fde",
};

/* ---------------------------------------------------------------------- hero */

export const hero = {
  eyebrow: "FORWARD DEPLOYED ENGINEERING · DELIVERY · ADOPTION",
  name: "Yashas Kadambi",
  statement: "I turn ambiguous operational problems into deployed software.",
  supporting:
    "I work across users, domain experts, product teams, infrastructure, and code—from problem discovery and technical scoping to implementation, rollout, debugging, adoption, and reusable tooling.",
  context:
    "Software engineer with roughly three years of production experience at Cisco. Incoming UC San Diego M.S. Computer Science student.",
  evidence: [
    { value: "2 days → 2 hours", note: "switchgear test scoping, after the tool shipped" },
    { value: "safe parallel stages", note: "independent work separated from prerequisite-bound work" },
    { value: "API change → published SDKs", note: "client SDKs regenerate on contract change" },
    { value: "deployed workflow", note: "still in use after the internship ended" },
  ],
  primaryAction: { label: "See how I deliver", href: "#workflow-first" },
};

/** The loop the whole page is organised around. */
export const loopStages = [
  { id: "discover", label: "Discover", note: "find the real operational problem" },
  { id: "model", label: "Model", note: "turn domain knowledge into a technical model" },
  { id: "build", label: "Build", note: "implement across app, data and infrastructure" },
  { id: "deploy", label: "Deploy", note: "get it into the environment as it actually is" },
  { id: "learn", label: "Learn", note: "measure adoption and what still breaks" },
  { id: "codify", label: "Codify", note: "make the next delivery cheaper than this one" },
];

/**
 * The hero visual's field-delivery loop. Labels stay plain on purpose — an
 * incomplete brief enters, real-world signals resolve it into a scoped model,
 * the model is built and deployed, and what comes back becomes reusable.
 */
export const heroLoop = [
  { id: "brief", label: "incomplete brief", note: "\"the current process takes too long\"", stage: "discover" },
  { id: "workflow", label: "workflow", note: "what people do today, step by step", stage: "discover" },
  { id: "users", label: "users", note: "who is blocked, and how often", stage: "discover" },
  { id: "constraints", label: "constraints", note: "environment, access, approvals, time", stage: "discover" },
  { id: "data", label: "data", note: "the records and systems that already exist", stage: "model" },
  { id: "prototype", label: "prototype", note: "the smallest thing that settles the question", stage: "build" },
  { id: "deployment", label: "deployment", note: "onto the machines the work happens on", stage: "deploy" },
  { id: "feedback", label: "feedback", note: "usage, complaints, the parts nobody touches", stage: "learn" },
  { id: "pattern", label: "reusable pattern", note: "module, script, guide, playbook", stage: "codify" },
];

/* -------------------------------------------------------- chapter 1: flagship */

export const flagship: FDECaseStudy = {
  id: "schneider",
  title: "Start with the workflow, not the stack",
  role: "Schneider Electric · Summer Intern, Software Engineering",
  period: "Jun–Aug 2022",
  users:
    "A switchgear engineering team of mechanical specialists, plus the engineers who had to scope testing every time a feature changed a product component.",
  problem:
    "A switchgear engineering team repeatedly spent approximately two days determining which tests should run after a feature changed one or more product components. The required knowledge was distributed across mechanical specialists and reconstructed through several meetings for each feature.",
  constraints: [
    "The only software engineer in a predominantly mechanical-engineering team",
    "Requirements existed as domain expertise, not as a written software specification",
    "Users worked on managed Windows workstations, not a web platform",
    "Access had to go through the company's existing single sign-on",
    "One internship to get from first conversation to a tool people trusted",
  ],
  discovery:
    "As the only software engineer in a predominantly mechanical-engineering team, I elicited the relationships between changed components, affected behavior, required tests, and expected failure modes.",
  contribution: [
    "Converted the elicited domain knowledge into a maintained part-to-test model",
    "Built an SSO-protected Python/Tkinter Windows application around that model",
    "Implemented affected-test calculation from the engineer's component selection",
    "Generated an Excel test plan for the engineer to verify before running anything",
    "Owned requirements elicitation, architecture, implementation, SSO integration, functional verification, deployment, demonstration, documentation, and knowledge transfer",
  ],
  architecture: [
    "Domain discussion",
    "maintained component/test mapping",
    "changed-component selection",
    "affected-test calculation",
    "generated Excel plan",
    "engineer verification",
  ],
  deployment:
    "Deployed to the team's own machines, demonstrated to the engineers who would use it, then documented and handed over so it could outlive the internship.",
  adoption:
    "The engineering team used the deployed application and continued using it after the internship.",
  outcome:
    "The workflow reduced actual engineering effort from approximately two days to approximately two hours—more than 90%.",
  reusableLeverage: [
    "A part-to-test model the team maintains instead of rebuilding in meetings",
    "Setup and usage documentation plus a knowledge-transfer session",
  ],
  ownership: "individual",
  status: "deployed-internal",
  disclosure: "public-safe",
};

export const flagshipNotes = {
  deliverySpeed: "Complete implementation and deployment in approximately two months.",
  architectureCaption:
    "A deliberately simple local architecture, chosen because it fit the environment the engineers actually worked in.",
  whyItLeads:
    "One software engineer, a domain nobody had written down, and a workflow that had to keep working after he left.",
};

/* ------------------------------------------------- chapter 2: real system */

export const discovery: FDECaseStudy = {
  id: "traffic-discovery",
  title: "The dependency map was in the traffic",
  role: "Cisco Systems · Software Engineer, Backend & Cloud Platforms",
  period: "2023–2025",
  users:
    "The teams whose integrations would break at cutover — most of whom did not appear in any configuration record.",
  problem:
    "During an authentication and API-gateway modernization effort, configuration records were not sufficient to identify every active consumer. I used Splunk traffic analysis to determine which systems were actually calling the affected APIs and connected those integrations to their owning teams before production cutover.",
  constraints: [
    "Configuration records were incomplete, so the consumer list could not be trusted",
    "Consumers belonged to teams outside the project",
    "The change had to reach production without breaking downstream users",
    "Staging had to be treated as evidence, not as a formality",
  ],
  discovery:
    "Rather than assuming the documented consumer list was complete, I read production traffic and let it name the real dependencies.",
  contribution: [
    "Used Splunk traffic analysis to identify systems actively calling the affected APIs",
    "Connected each observed integration back to its owning team",
    "Coordinated the affected teams ahead of the cutover",
    "Supported staged validation and deployment-controlled feature flags",
    "Helped migrate consumers through environment-by-environment rollout",
  ],
  deployment:
    "Rollout was sequenced by environment, with feature flags controlled at deploy time so a staging failure stopped a change before it reached anyone.",
  adoption: "Downstream teams moved with the change instead of discovering it during an incident.",
  outcome: "The production cutover completed without customer impact.",
  reusableLeverage: ["A traffic-derived dependency map the team could re-run rather than re-guess"],
  ownership: "supporting",
  status: "production",
  disclosure: "public-safe",
};

/** Public source stores only the safe fallback; private review values live elsewhere. */
export const discoveryScale: DisclosureReview = {
  approved: false,
  note: "Cisco traffic/integration figures — hold until cleared for public disclosure.",
  exact: [],
  fallback:
    "The analysis identified active integrations across multiple services and teams. I then supported staged validation and deployment-controlled feature flags so the production cutover could complete without customer impact.",
};

export const discoveryFacts: DisclosedFacts = {
  approved: false,
  note: "Cisco estate/traffic counts — hold until cleared for public disclosure.",
  exact: [],
};

export const discoverySignals = [
  "Discovering undocumented stakeholders",
  "Using production evidence instead of assumptions",
  "Translating traffic into a dependency map",
  "Coordinating changes across teams",
  "Sequencing rollout by environment",
  "Treating staging failures as useful feedback",
  "Protecting downstream users during change",
];

/* ---------------------------------------------- chapter 3: scope and sequence */

export const sequencing: FDECaseStudy = {
  id: "delivery-sequencing",
  title: "Turn the architecture into an executable plan",
  role: "Cisco Systems · Software Engineer, Backend & Cloud Platforms",
  period: "2023–2025",
  users: "The engineers waiting on every deployment across a multi-account, multi-region estate.",
  problem:
    "Some resources and services were independent and could safely deploy together. Others could not start until their prerequisites were healthy. Treating everything as serial was slow; treating everything as parallel was unsafe.",
  constraints: [
    "Prerequisite-bound services could not start before their dependencies were healthy",
    "Shared infrastructure was consumed by teams outside the immediate project",
    "Changes spanned multiple AWS accounts and geographic regions",
  ],
  discovery:
    "The deployment order encoded real dependencies in some places and habit in others; separating the two was the actual problem.",
  contribution: [
    "Built and maintained reusable Terraform components across EC2, ECS, Lambda, RDS, DynamoDB, SQS, SNS, and IAM",
    "Separated independent work from prerequisite-bound work so safe infrastructure and services ran concurrently while dependent stages remained gated",
    "Became a technical contact for shared infrastructure, networking, cross-region communication, and dependency ordering",
  ],
  deployment: "Independent stages run concurrently; dependent stages stay gated behind a healthy prerequisite.",
  adoption: "Used across the shared deployment path rather than as a one-off script.",
  outcome:
    "Shortened the deployment path by running independent work concurrently while retaining prerequisite and health gates.",
  reusableLeverage: [
    "Reusable Terraform components other teams could adopt instead of rebuilding equivalent deployment logic",
  ],
  ownership: "collaborative",
  status: "production",
  disclosure: "public-safe",
};

/** Public source intentionally contains no held employer counts. */
export const sequencingFacts: DisclosedFacts = {
  approved: false,
  note: "Cisco estate figures — hold until cleared for public disclosure.",
  exact: [],
};

/** Public-safe replacement shown while the counts above are held. */
export const sequencingScope =
  "A multi-service, multi-account, multi-region AWS estate, with shared modules used well beyond the immediate project.";

export const crossRegion = {
  copy: "Worked on the Terraform and integration for an asynchronous cross-region workflow in which a DynamoDB insert published through SNS to regional SQS queues; region-specific services consumed the event and synchronized related SQL databases.",
  chain: ["DynamoDB", "SNS", "regional SQS", "services", "SQL databases"],
  caution: "Described only as far as it was built — no ordering, retry, or delivery guarantees are claimed here.",
};

/* --------------------------------------------------- chapter 4: debugging */

export const debugging: FDECaseStudy = {
  id: "authorization-trace",
  title: "When the visible bug crosses four codebases",
  role: "Cisco Systems · Software Engineer, Backend & Cloud Platforms",
  period: "2023–2025",
  users: "A production user who could not do something another user could.",
  problem:
    "A production user could not see an authorization-dependent action that appeared correctly for another user. The behavior was not explained by a simple frontend condition.",
  constraints: [
    "The effective authorization path spanned four repositories",
    "Two dependencies had no available source",
    "Production was not a safe place to experiment",
    "The intended access rule lived with product and support, not in code",
  ],
  discovery:
    "I traced the behavior across four repositories and decompiled two source-unavailable Java archives to reconstruct the effective authorization path. I compared the role combinations that produced the working and failing behavior without experimenting recklessly in production.",
  contribution: [
    "Reconstructed the effective authorization path across frontend, backend, and compiled dependencies",
    "Decompiled two source-unavailable Java archives to read the logic that was actually running",
    "Compared working and failing role combinations instead of mutating production state",
    "Confirmed the intended access with product management and support stakeholders",
    "Recommended the least-risk production correction",
  ],
  deployment:
    "After identifying the required effective authorization state, I coordinated with product management and support stakeholders to confirm the intended access before recommending the least-risk production correction.",
  adoption: "The user's workflow was restored against the access rule the business actually intended.",
  outcome: "The operational problem was resolved, not just the code observation that explained it.",
  ownership: "individual",
  status: "production",
  disclosure: "public-safe",
};

export const debuggingLayers = [
  { id: "ui", label: "frontend", note: "the symptom: an action one user sees and another does not" },
  { id: "service", label: "backend service", note: "the condition is not a simple frontend check" },
  { id: "jar", label: "compiled dependency", note: "two archives with no available source" },
  { id: "authz", label: "authorization", note: "the effective state that decides the outcome" },
];

export const debuggingSignals = [
  "Working from the user-visible symptom",
  "Crossing frontend, backend, compiled dependencies, and authorization",
  "Reverse engineering incomplete systems",
  "Avoiding unsafe production experimentation",
  "Translating technical findings for product and support stakeholders",
  "Resolving the operational problem rather than stopping at a code observation",
];

export const reliabilityInset = {
  title: "Supporting reliability case",
  copy: "Diagnosed a production failure caused by hidden global URL, load-balancer, and deployment-order dependencies between services. Traced configuration YAML and deployment logs, then helped move the rollout toward incremental changes, retaining old pods until replacements stabilized, adding health checks, and verifying the full dependency stack.",
  ownership: "collaborative" as Ownership,
};

/* ---------------------------------------- chapter 5: constrained environments */

export interface ConstrainedCase {
  id: string;
  title: string;
  environment: string;
  copy: string;
  weight: "primary" | "supporting";
  ownership: Ownership;
}

export const constrainedCases: ConstrainedCase[] = [
  {
    id: "air-gapped",
    title: "Air-gapped modernization",
    environment: "no internet, no ordinary build path, no downtime window",
    copy: "Worked on modernizing air-gapped legacy environments from end-of-life logging software to a patched release. Difficult environments required deeper dependency remediation because source and ordinary internet-based build paths were unavailable. The rollout completed without downtime.",
    weight: "primary",
    ownership: "collaborative",
  },
  {
    id: "apple-silicon",
    title: "Apple Silicon compatibility",
    environment: "a legacy compatibility blocker on the machines the team actually had",
    copy: "Unblocked developers facing a legacy database compatibility issue on Apple Silicon by establishing compatible Java execution paths and packaging the environment into a reusable setup script.",
    weight: "supporting",
    ownership: "individual",
  },
  {
    id: "colima",
    title: "Enterprise container workflow",
    environment: "corporate certificates, authentication, and a licensing constraint",
    copy: "Engineered a manager-approved Colima development environment integrating corporate certificates, authentication, container storage, and Apple Silicon compatibility.",
    weight: "supporting",
    ownership: "individual",
  },
];

export const constrainedTheme =
  "I can adapt a deployment to the constraints of the environment and leave users with a repeatable path.";

/* --------------------------------------------------- chapter 6: prototypes */

export interface PrototypeCase {
  id: string;
  title: string;
  label: string;
  copy: string;
  demonstrated?: string[];
  limits?: string;
  extra?: DisclosureReview;
  ownership: Ownership;
  status: DeliveryStatus;
}

export const prototypes: PrototypeCase[] = [
  {
    id: "rag-assistant",
    title: "Group-aware engineering RAG",
    label: "Proof of concept · demonstrated internally",
    copy: "Built and demonstrated a retrieval-augmented assistant over approved engineering conversations. The proof of concept used vector retrieval, scheduled corpus updates, an approved model, and source-group membership checks.",
    demonstrated: [
      "User problem discovery: knowledge existed but was difficult to retrieve.",
      "Continuous ingestion through scheduled updates.",
      "Retrieval-grounded answers.",
      "Group-aware access control.",
      "Evaluation through direct feedback, successful-answer rate, and confidence.",
      "A working demonstration, not a production service.",
    ],
    ownership: "individual",
    status: "proof-of-concept",
  },
  {
    id: "engineering-analytics",
    title: "Engineering analytics",
    label: "Python backend · Angular frontend built by others",
    copy: "Built the Python backend for a leadership-recognized engineering analytics platform combining Jira, SonarQube, and defect-tracking data. The system supported persisted analytics and optional live refresh so managers could examine defect ownership, code-quality trends, component and team comparisons, and MTTR.",
    // Organizational scale is not stored in this public repository.
    extra: {
      approved: false,
      note: "Cisco organizational scale — hold until cleared for public disclosure.",
      exact: [],
      fallback: "The data covered a large engineering organization.",
    },
    ownership: "collaborative",
    status: "deployed-internal",
  },
  {
    id: "voice-assistant",
    title: "Multilingual voice assistant",
    label: "Applied AI prototype · no verified public repository",
    copy: "Built a CPU-only multilingual voice and retrieval prototype intended to help farmers navigate government subsidies and relief programs. The prototype grounded answers in a selected policy corpus and recorded an approximate end-to-end latency of 20 seconds per query.",
    limits:
      "Identified latency, retrieval quality, policy freshness, and source attribution as the main production-hardening problems.",
    ownership: "collaborative",
    status: "proof-of-concept",
  },
];

/** Questions the RAG proof of concept was built to answer, with its access rule visible. */
export const ragDemo = {
  header: { left: "retrieval · engineering groups", right: "grounded · scoped to the groups you are in" },
  footer: "a demonstrated proof of concept — not a production service, and shown here as one",
  placeholder: "ask an engineering question…",
  inputLabel: "ask the engineering retrieval demo",
  entries: [
    {
      q: "How is the corpus kept current?",
      keys: ["current", "update", "fresh", "ingest", "corpus", "index"],
      chunks: ["group/ci-cd", "group/platform"],
      lines: [
        "A scheduled update re-ingests the topic groups, so an answer reflects the discussion as of the last run rather than a one-time snapshot.",
        "Approved topic-specific engineering conversations sit behind it.",
      ],
    },
    {
      q: "What stops it answering from a group I am not in?",
      keys: ["group", "access", "permission", "member", "private", "stops"],
      chunks: ["group/ci-cd"],
      withheld: "sources outside your group membership were not retrieved",
      lines: [
        "Retrieval respects source-group membership: passages from groups the asker is not part of are never candidates for the answer.",
        "Access is enforced at retrieval, so the model is never handed text the asker could not read themselves.",
      ],
    },
    {
      q: "How did you know whether it was any good?",
      keys: ["good", "eval", "accura", "measur", "quality", "confiden"],
      chunks: ["feedback/direct", "eval/answer-rate"],
      lines: [
        "Evaluated through direct feedback from engineers, the rate of successfully answered questions, and answer confidence.",
        "It was demonstrated on that evidence. It was not promoted to a production service, and this page does not claim it was.",
      ],
    },
  ],
  fallback: {
    chunks: [],
    lines: [
      "Not in this demonstration. Inventing an answer is the failure mode retrieval is supposed to prevent.",
      "Try one of the questions above — they cover ingestion, access control, and evaluation.",
    ],
  },
};

/* ------------------------------------------------------ chapter 7: leverage */

export interface LeverageItem {
  id: string;
  title: string;
  copy: string;
  note?: string;
  link?: EvidenceLink;
  ownership: Ownership;
}

export const leverage: LeverageItem[] = [
  {
    id: "sdk-pipeline",
    title: "SDK delivery pipeline",
    copy: "Built the complete GitHub Actions pipeline that regenerated and published Python and Java client SDKs whenever downstream Swagger/OpenAPI contracts changed, replacing repeated manual release work.",
    note: "The pipeline remained active more than three years after the internship.",
    link: { label: "Public Java SDK artifact", href: "https://github.com/CiscoDevNet/px-cloud-java-sdk" },
    ownership: "individual",
  },
  {
    id: "repo-onboarding",
    title: "Repository onboarding automation",
    copy: "Automated multi-repository onboarding, replacing repository-by-repository cloning with a reusable triggered workflow.",
    ownership: "individual",
  },
  {
    id: "documentation",
    title: "Documentation",
    copy: "Authored and maintained setup guides, database guides, runbooks, SOPs, and architecture documents, then conducted knowledge-transfer sessions so difficult setup and operational knowledge could be reused.",
    ownership: "individual",
  },
  {
    id: "mentorship",
    title: "Mentorship and adoption",
    copy: "Mentored an intern and a non-CS apprentice through hands-on delivery and helped onboard engineers using reusable setup and architecture guidance.",
    ownership: "individual",
  },
  {
    id: "shared-infra",
    title: "Shared infrastructure",
    copy: "Built reusable Terraform components and helped two additional teams adopt shared infrastructure patterns rather than rebuilding equivalent deployment logic independently.",
    ownership: "collaborative",
  },
  {
    id: "white-box-testing",
    title: "White-box testing framework",
    copy: "Co-authored a CMocka-based white-box framework and personally built its third-iteration stubbing architecture, reducing hardware-independent feedback from tens of minutes to seconds.",
    ownership: "collaborative",
  },
];

/** One-off delivery on the left, the reusable path on the right. */
export const leverageDiffs = [
  {
    id: "sdk",
    title: "keeping client SDKs current",
    before: [
      "a downstream contract changes, so hand-edit the Python SDK",
      "hand-edit the Java SDK across a broad API surface",
      "repeat generation and publication every time, easy to get wrong",
    ],
    after: [
      "GitHub Actions regenerates and publishes both SDKs on contract change",
      "still running more than three years after the internship that built it",
    ],
    delta: "manual release work → automated",
  },
  {
    id: "onboarding",
    title: "getting a new engineer set up",
    before: ["clone many repositories one at a time", "repeat the whole thing for every new joiner"],
    after: ["one triggered multi-repository workflow", "a reusable onboarding path"],
    delta: "many repositories · one trigger",
  },
  {
    id: "environment",
    title: "handing over a hard environment",
    before: ["walk each engineer through the setup in person", "a compatibility blocker stays unresolved"],
    after: ["a packaged setup script that reproduces the working environment", "repeatable and unattended"],
    delta: "developers unblocked",
  },
  {
    id: "knowledge",
    title: "operational knowledge",
    before: ["the person who built it explains it again", "it leaves when they do"],
    after: ["setup guides, runbooks, SOPs and architecture documents", "knowledge-transfer sessions so it survives handover"],
    delta: "reusable after handover",
  },
];

/* ------------------------------------------------------------------ projects */

export interface FDEProject {
  id: string;
  title: string;
  label: string;
  copy: string;
  evidence?: string[];
  links: EvidenceLink[];
  featured: boolean;
}

export const fdeProjects: FDEProject[] = [
  {
    id: "cloud-provisioning",
    title: "Cloud Provisioning Using an RDBMS",
    label: "Team project · public fork",
    copy: "Worked on a database-backed cloud-allocation system that modeled hardware inventory, projects, zones, users, quotas, costs, and virtual-machine lifecycle operations.",
    evidence: [
      "PostgreSQL and PL/pgSQL availability checks",
      "Project and zone quota enforcement",
      "Transactions, triggers, roles, and access control",
      "Concurrency-sensitive VM creation and deletion",
      "Node.js backend",
      "React interface",
    ],
    links: [{ label: "Repository", href: "https://github.com/Yashas120/Cloud-Provisioning-using-RDBMS" }],
    featured: true,
  },
  {
    id: "portfolio",
    title: "Role-specific technical portfolio",
    label: "Original personal project · public",
    copy: "Built a data-driven Next.js portfolio that renders one verified career evidence model into independent, role-specific technical experiences while preserving consistent facts, links, attribution, responsive behavior, accessibility, and static deployment.",
    evidence: [
      "Next.js App Router",
      "Strict TypeScript",
      "React",
      "Typed content model",
      "Role-specific information architecture",
      "Scroll-linked interaction",
      "Static export",
      "GitHub Pages deployment",
    ],
    links: [
      { label: "Website", href: "https://yashas120.github.io" },
      { label: "Repository", href: "https://github.com/Yashas120/Yashas120.github.io" },
    ],
    featured: true,
  },
  {
    id: "voice-assistant-project",
    title: "Multilingual RAG voice assistant",
    label: "Applied AI prototype · no verified public repository",
    copy: "A CPU-only multilingual voice and retrieval prototype for farmers navigating government subsidies — covered in full under applied AI above.",
    links: [],
    featured: true,
  },
  {
    id: "cloud-hack",
    title: "Cloud-Hack",
    label: "Cloud-native coursework",
    copy: "Deployed a Flask/MongoDB application through Docker and Kubernetes using Deployments, Services, ConfigMaps, Secrets, and explicit service discovery.",
    links: [{ label: "Repository", href: "https://github.com/Yashas120/Cloud-Hack" }],
    featured: false,
  },
  {
    id: "petra",
    title: "PeTra",
    label: "Three-person team project · equal-contribution record",
    copy: "Built a React booking interface for hotel and pet-sitter discovery, coordinating a multi-step user workflow with a separately maintained backend.",
    links: [{ label: "Repository", href: "https://github.com/Yashas120/Petra" }],
    featured: false,
  },
];

/* -------------------------------------------------------------- capabilities */

export interface CapabilityGroup {
  id: string;
  title: string;
  note: string;
  items: string[];
}

export const capabilities: CapabilityGroup[] = [
  {
    id: "discover",
    title: "Discover and scope",
    note: "Every item below is attached to something on this page.",
    items: [
      "Requirements elicitation",
      "Workflow mapping",
      "Domain modeling",
      "Dependency discovery",
      "Technical scoping",
      "Stakeholder coordination",
      "Documentation and knowledge transfer",
    ],
  },
  {
    id: "build",
    title: "Build",
    note: "Application, backend, and data layers.",
    items: [
      "Python",
      "Java",
      "TypeScript and JavaScript",
      "SQL and PL/pgSQL",
      "React and Next.js",
      "Node.js",
      "REST APIs",
      "OpenAPI and Swagger",
      "Data transformation",
      "RAG and vector retrieval",
    ],
  },
  {
    id: "deploy",
    title: "Deploy and integrate",
    note: "Getting it into the environment as it actually is.",
    items: [
      "AWS",
      "Terraform",
      "EC2",
      "ECS",
      "Lambda",
      "RDS",
      "DynamoDB",
      "SNS and SQS",
      "Docker",
      "Kubernetes",
      "GitHub Actions",
      "CI/CD",
      "Enterprise SSO and authentication integration",
    ],
  },
  {
    id: "operate",
    title: "Diagnose and operate",
    note: "What the work looks like after it ships.",
    items: [
      "Splunk",
      "AppDynamics",
      "Structured logs",
      "Database performance",
      "Health checks",
      "Staged rollout",
      "Legacy Java analysis",
      "Dependency tracing",
      "Root-cause analysis",
      "Air-gapped environments",
    ],
  },
];

/* ---------------------------------------------------------------- teaching */

export const communication = {
  teaching:
    "Supported 656 learners across Image Processing and Computer Vision, Data Analytics, and graduate Deep Learning through assignments, labs, office hours, grading, and technical teaching material.",
  writing:
    "Authored or maintained approximately 30 engineering guides, runbooks, and SOPs and conducted reusable knowledge-transfer sessions.",
};

/* --------------------------------------------------------------- education */

export const education = [
  {
    id: "ucsd",
    school: "University of California San Diego",
    line: "M.S. Computer Science · Incoming September 2026 · Expected 2027",
    detail: "Planned focus in distributed systems, operating systems, and applied machine learning.",
    facts: [],
  },
  {
    id: "pes",
    school: "PES University",
    line: "B.Tech. Computer Science and Engineering · 2019–2023",
    detail: "",
    facts: [
      "U.S.-equivalent GPA: 3.78/4.00, based on a credential evaluation",
      "Prof. C. N. R. Rao Merit Scholarship",
      "Two peer-reviewed publications",
    ],
  },
];

/* ------------------------------------------------------------------ closing */

export const closing = {
  heading: "I want to work where the problem is still being defined.",
  copy: "I am looking for forward deployed engineering, applied AI deployment, solutions engineering, and customer-facing platform roles where I can move from an ambiguous workflow to a working, adopted system.",
  primaryAction: "Start a conversation",
};

/**
 * Study-period contact. The repository's general profile address stays on the
 * other endpoints; this one is the address to use while he is at UC San Diego.
 */
export const fdeContact = {
  email: "ykadambi@ucsd.edu",
};
