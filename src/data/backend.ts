/**
 * Canonical, public-safe evidence for /backend.
 *
 * Route components reference IDs from this file; they never own career facts.
 * Unresolved facts remain typed verification flags and are paired with a safe
 * public fallback. Private employer detail is intentionally not represented.
 */

export type Ownership =
  | "PROFESSIONAL"
  | "ORIGINAL"
  | "COLLABORATIVE"
  | "COURSEWORK"
  | "RESEARCH"
  | "PUBLIC FORK"
  | "TEACHING"
  | "PROTOTYPE"
  | "CONCEPT";

export type WorkStatus =
  | "SHIPPED"
  | "ACTIVE"
  | "COMPLETED"
  | "PUBLISHED"
  | "ARCHIVED"
  | "PROOF OF CONCEPT"
  | "IN DEVELOPMENT"
  | "CONCEPT"
  | "REQUIRES VERIFICATION";

export type WorkDescriptor = "TEAM" | "EDUCATIONAL" | "COMPUTER VISION";
export type WorkDisplayLabel = Ownership | WorkStatus | WorkDescriptor;

export type VerificationState = "verified" | "verify-before-publication" | "private";

export interface EvidenceSource {
  id: string;
  label: string;
  kind: "master-cv" | "shared-data" | "repository" | "paper" | "demo" | "owner-confirmation";
  href?: string;
  checkedOn?: string;
}

export interface VerificationFlag {
  id: string;
  field: string;
  state: VerificationState;
  note: string;
  safeFallback?: string;
}

export interface RoleEvidence {
  id: string;
  organization: string;
  title: string;
  start: string;
  end: string;
  summary: string;
  mechanism: string;
  evidence: readonly string[];
  sourceIds: readonly string[];
  verification?: readonly VerificationFlag[];
}

export interface WorkLink {
  label: "Repository" | "Paper" | "Interactive demo" | "Website";
  href: string;
}

export interface WorkEvidence {
  id: string;
  title: string;
  summary: string;
  contribution: string;
  limitation?: string;
  ownership: readonly Ownership[];
  descriptors?: readonly WorkDescriptor[];
  status: readonly WorkStatus[];
  featuredLabels?: readonly WorkDisplayLabel[];
  technologies: readonly string[];
  sourceIds: readonly string[];
  links: readonly WorkLink[];
  routeRelevance: readonly string[];
  verification?: readonly VerificationFlag[];
}

export interface OutcomeEvidence {
  id: string;
  value: string;
  unit: string;
  context: string;
  approximate: boolean;
  verification: VerificationState;
  sourceIds: readonly string[];
}

export const contactLinks = {
  email: "ykadambi@ucsd.edu",
  emailHref: "mailto:ykadambi@ucsd.edu",
  github: "https://github.com/Yashas120",
  linkedin: "https://www.linkedin.com/in/yashas120/",
} as const;

/** Public résumé shipped under /public; every visible résumé action resolves here. */
export const resumeState = {
  available: true,
  publicHref: "/resume/Yashas-Kadambi-Resume.pdf",
  releaseBlocker: undefined,
} as const;

export const backendMeta = {
  title: "Yashas Kadambi — Backend & Platform Engineer",
  description:
    "Backend and platform engineering portfolio of Yashas Kadambi: infrastructure automation, event-driven systems, reliability, cross-layer systems work, research, and teaching.",
  url: "/backend",
} as const;

export const evidenceSources: readonly EvidenceSource[] = [
  { id: "master-cv", label: "Yashas Kadambi Master CV · 11 Aug 2026", kind: "master-cv", checkedOn: "2026-08-12" },
  { id: "ta-cv", label: "Yashas Kadambi UCSD TA CV", kind: "shared-data", checkedOn: "2026-08-12" },
  { id: "repo-cloud-hack", label: "Cloud-Hack repository", kind: "repository", href: "https://github.com/Yashas120/Cloud-Hack" },
  { id: "repo-bitcoin", label: "Bitcoin Transactions in Java repository", kind: "repository", href: "https://github.com/Yashas120/Bitcoin-Transactions-in-java" },
  { id: "repo-multiview", label: "Multiview 3D Reconstruction repository", kind: "repository", href: "https://github.com/Yashas120/Multiview-3D-Reconstruction" },
  { id: "repo-swift", label: "SWIFT repository", kind: "repository", href: "https://github.com/Yashas120/SWIFT" },
  { id: "paper-swift", label: "SWIFT paper", kind: "paper", href: "https://doi.org/10.47852/bonviewAIA42021930" },
  { id: "paper-underwater", label: "Underwater data-center monitoring paper", kind: "paper", href: "https://doi.org/10.1109/CSITSS54238.2021.9683449" },
  { id: "demo-registry", label: "Portfolio demo registry", kind: "demo", href: "/demos" },
] as const;

export const roleEvidence: readonly RoleEvidence[] = [
  {
    id: "cisco-optical",
    organization: "Cisco",
    title: "Optical Software Development Engineer II",
    start: "Jan 2025",
    end: "2026",
    summary: "Production C and tooling for a new optical line-card platform across software, programmable hardware, and secure delivery boundaries.",
    mechanism: "Desired/current hardware-state reconciliation, hardware-independent tests, platform bring-up, and cross-component diagnosis.",
    evidence: ["New line-card platform", "Mark-and-Sweep warm reload", "CMocka boundary design", "Build, deploy, monitoring, and log tooling"],
    sourceIds: ["master-cv", "ta-cv"],
    verification: [{
      id: "optical-end-month",
      field: "end",
      state: "verify-before-publication",
      note: "Confirm the exact final month in 2026.",
      safeFallback: "2026",
    }],
  },
  {
    id: "cisco-backend",
    organization: "Cisco",
    title: "Software Engineer, Backend & Cloud Platforms",
    start: "Aug 2023",
    end: "Jan 2025",
    summary: "Backend, infrastructure, delivery, performance, migration, and production-reliability ownership across a mature cloud platform.",
    mechanism: "Reusable Terraform modules, dependency-aware deployment, event fan-out, evidence-led migration, database work, and recurrence prevention.",
    evidence: ["Dependency-aware deployments", "Database-led performance work", "Production failure diagnosis", "DynamoDB → SNS → regional SQS"],
    sourceIds: ["master-cv"],
    verification: [{
      id: "auth-scope",
      field: "authentication modernization scale",
      state: "verify-before-publication",
      note: "Reconcile conflicting product, service, integration, and endpoint counts before publishing a scale.",
      safeFallback: "Authentication and API-gateway modernization across a mature service estate",
    }],
  },
  {
    id: "cisco-intern",
    organization: "Cisco",
    title: "Technical Intern",
    start: "Jan 2023",
    end: "Jul 2023",
    summary: "API contracts, SDK delivery automation, backend features, data-pipeline evaluation, and reproducible local development.",
    mechanism: "OpenAPI changes generated and published Python and Java SDKs while release versioning remained an intentional human decision.",
    evidence: ["Repeated manual SDK work automated", "OpenAPI and generated documentation", "AWS Glue proof of concept", "Java API and filtering work"],
    sourceIds: ["master-cv", "ta-cv"],
  },
  {
    id: "schneider",
    organization: "Schneider Electric",
    title: "Summer Intern",
    start: "Jun 2022",
    end: "Aug 2022",
    summary: "End-to-end ownership of an internal engineering decision tool while embedded as the sole software engineer with a mechanical team.",
    mechanism: "Translated an Excel-backed engineering knowledge base into a guided Python/Tkinter workflow, from discovery through internal delivery.",
    evidence: ["About two days → two hours", "More than 90% shorter representative workflow", "Requirements through deployment"],
    sourceIds: ["master-cv", "ta-cv"],
  },
  {
    id: "pes-ta",
    organization: "PES University",
    title: "Teaching Assistant",
    start: "Jul 2022",
    end: "May 2023",
    summary: "Teaching, assessment, office hours, grading automation, and autograder design across three computing courses and 656 learners.",
    mechanism: "Built feedback paths that made image processing, analytics, and graduate deep-learning work easier to learn and debug.",
    evidence: ["122 IPCV learners", "494 Data Analytics learners", "Approximately 40 graduate Deep Learning learners"],
    sourceIds: ["master-cv", "ta-cv"],
  },
] as const;

export const outcomes: readonly OutcomeEvidence[] = [
  { id: "deployment-time", value: "50", unit: "% faster", context: "Reusable infrastructure modules and dependency-aware execution removed avoidable serialization from a production deployment path.", approximate: false, verification: "verified", sourceIds: ["master-cv"] },
  { id: "sdk-manual-work", value: "4", unit: "hours removed", context: "Manual SDK generation and publication per release", approximate: true, verification: "verified", sourceIds: ["master-cv"] },
  { id: "page-load", value: "40", unit: "% faster", context: "Backend and database page-load path", approximate: false, verification: "verified", sourceIds: ["master-cv"] },
  { id: "outages", value: "4", unit: "outages root-caused", context: "Aggregate production reliability work", approximate: false, verification: "verified", sourceIds: ["master-cv"] },
  { id: "schneider-workflow", value: ">90", unit: "% shorter", context: "Representative switchgear workflow: about two days to two hours", approximate: false, verification: "verified", sourceIds: ["master-cv"] },
] as const;

export const outcomeById = Object.fromEntries(outcomes.map((outcome) => [outcome.id, outcome])) as Record<string, OutcomeEvidence>;

const verifyContribution = (id: string): readonly VerificationFlag[] => [{
  id: `${id}-contribution`,
  field: "contribution",
  state: "verify-before-publication",
  note: "Confirm the exact personal module or commit boundary.",
  safeFallback: "Contribution requires verification; no more specific authorship claim is currently supported.",
}];

export const workEvidence: readonly WorkEvidence[] = [
  {
    id: "ghost-scheduler",
    title: "Performance Analysis of the Google ghOSt Scheduler",
    summary: "Repeatable CFS, FIFO, and ghOSt policy comparisons across RocksDB and backend workloads.",
    contribution: "Built and evaluated controlled scheduling experiments across load, concurrency, and memory configurations.",
    ownership: ["COURSEWORK", "RESEARCH"], status: ["COMPLETED"],
    technologies: ["Linux", "C/C++", "ghOSt", "RocksDB", "Benchmarking"], sourceIds: ["master-cv"], links: [], routeRelevance: ["Systems", "Performance"],
  },
  {
    id: "swift",
    title: "SWIFT — Lightweight Image Super-Resolution",
    summary: "A co-developed transformer/Fourier-convolution architecture and reproducible implementation for lightweight image super-resolution.",
    contribution: "Contributed to the research implementation and evaluation; against the reported SwinIR lightweight baseline, SWIFT used approximately 34% fewer parameters and reached up to 60% faster inference.",
    limitation: "Collaborative research and a public fork—not solo work.",
    ownership: ["RESEARCH", "COLLABORATIVE", "PUBLIC FORK"], status: ["PUBLISHED"],
    featuredLabels: ["RESEARCH", "COLLABORATIVE", "PUBLISHED"],
    technologies: ["Python", "PyTorch", "Swin Transformer V2", "Fast Fourier Convolution", "Docker", "TorchServe"], sourceIds: ["master-cv", "repo-swift", "paper-swift"],
    links: [{ label: "Repository", href: "https://github.com/Yashas120/SWIFT" }, { label: "Paper", href: "https://doi.org/10.47852/bonviewAIA42021930" }, { label: "Interactive demo", href: "/demos#swift" }], routeRelevance: ["Research", "Reproducibility"],
  },
  {
    id: "multiview",
    title: "Multiview 3D Reconstruction from 2D Images",
    summary: "An end-to-end sparse reconstruction pipeline for algorithmic debugging, numerical reasoning, and reproducible implementation.",
    contribution: "Implemented feature matching, epipolar geometry, pose recovery, triangulation, PnP/RANSAC, bundle-adjustment flow, and PLY output.",
    limitation: "Sparse reconstruction—not a dense reconstruction system.",
    ownership: ["ORIGINAL"], descriptors: ["COMPUTER VISION"], status: ["COMPLETED"],
    featuredLabels: ["ORIGINAL", "COMPUTER VISION", "COMPLETED"],
    technologies: ["Python", "OpenCV", "NumPy", "SciPy", "SIFT", "PnP/RANSAC", "Bundle adjustment"], sourceIds: ["master-cv", "repo-multiview"],
    links: [{ label: "Repository", href: "https://github.com/Yashas120/Multiview-3D-Reconstruction" }, { label: "Interactive demo", href: "/demos#multiview" }], routeRelevance: ["Computer vision", "Algorithmic systems"],
  },
  {
    id: "chocollvm",
    title: "ChocoLLVM Compiler Frontend",
    summary: "A ChocoPy-to-LLVM course compiler spanning parsing, type checking, IR generation, execution, and tests.",
    contribution: "Contribution requires verification; no more specific module-level authorship claim is currently supported.",
    ownership: ["COURSEWORK", "PUBLIC FORK"], descriptors: ["TEAM"], status: ["COMPLETED", "REQUIRES VERIFICATION"],
    technologies: ["Python", "LLVM IR", "llvmlite", "PyTest"], sourceIds: ["master-cv"],
    links: [{ label: "Repository", href: "https://github.com/Yashas120/chocollvm" }, { label: "Interactive demo", href: "/demos#chocollvm" }], routeRelevance: ["Systems", "Compilers"], verification: verifyContribution("chocollvm"),
  },
  {
    id: "ssml",
    title: "SSML Spark Streaming for CIFAR-10",
    summary: "A distributed micro-batch streaming and classification workflow for CIFAR-10 images.",
    contribution: "Contribution requires verification; no more specific authorship claim is currently supported.",
    ownership: ["COURSEWORK", "PUBLIC FORK"], descriptors: ["TEAM"], status: ["COMPLETED", "REQUIRES VERIFICATION"],
    technologies: ["Apache Spark", "Python", "Streaming ML", "CIFAR-10"], sourceIds: ["master-cv"],
    links: [{ label: "Repository", href: "https://github.com/Yashas120/SSML-spark-streaming-for-machine-learning" }, { label: "Interactive demo", href: "/demos#cifar" }], routeRelevance: ["Distributed systems", "ML"], verification: verifyContribution("ssml"),
  },
  {
    id: "bitcoin",
    title: "Bitcoin Transactions from Scratch in Java",
    summary: "A dependency-light implementation of transaction primitives below wallet abstractions.",
    contribution: "Implemented hashing and address primitives, secp256k1/ECDSA signing behavior, P2PKH scripts, serialization, and testnet-oriented transaction flow.",
    limitation: "Educational; not a production financial system or security-reviewed wallet.",
    ownership: ["ORIGINAL"], descriptors: ["EDUCATIONAL"], status: ["COMPLETED"],
    featuredLabels: ["ORIGINAL", "EDUCATIONAL", "COMPLETED"],
    technologies: ["Java", "Maven", "SHA-256", "RIPEMD-160", "secp256k1", "ECDSA", "P2PKH"], sourceIds: ["master-cv", "repo-bitcoin"],
    links: [{ label: "Repository", href: "https://github.com/Yashas120/Bitcoin-Transactions-in-java" }, { label: "Interactive demo", href: "/demos#bitcoin" }], routeRelevance: ["Systems depth", "Protocol implementation"],
  },
  {
    id: "yelp",
    title: "Restaurant Closure-Risk Analysis with Yelp Data",
    summary: "A team analysis of restaurant closure risk, feature importance, and review topics.",
    contribution: "Contribution requires verification; no more specific analysis ownership is currently supported.",
    ownership: ["COURSEWORK", "PUBLIC FORK"], descriptors: ["TEAM"], status: ["COMPLETED", "REQUIRES VERIFICATION"],
    technologies: ["Python", "Logistic regression", "LDA", "Yelp dataset"], sourceIds: ["master-cv"],
    links: [{ label: "Repository", href: "https://github.com/Yashas120/Restaurant-analysis-using-YELP-dataset" }, { label: "Interactive demo", href: "/demos#yelp" }], routeRelevance: ["Data", "Applied ML"], verification: verifyContribution("yelp"),
  },
  {
    id: "parallel",
    title: "Systems and Parallel Programming Experiments",
    summary: "Concurrency, profiling, cache behavior, and memory-layout experiments in C and Python.",
    contribution: "Implemented and analyzed systems-performance exercises and documented the mechanisms they exposed.",
    ownership: ["COURSEWORK"], status: ["COMPLETED"],
    technologies: ["C", "Python", "pthreads", "Profiling", "Cache locality"], sourceIds: ["master-cv"],
    links: [{ label: "Repository", href: "https://github.com/Yashas120/SSP" }, { label: "Interactive demo", href: "/demos#parallel" }], routeRelevance: ["Systems", "Concurrency"],
  },
  {
    id: "cloud-provisioning",
    title: "Cloud Provisioning Using an RDBMS",
    summary: "A PostgreSQL-backed cloud allocator with quota, transaction, and lifecycle behavior.",
    contribution: "Contribution requires verification; no more specific component ownership is currently supported.",
    ownership: ["COURSEWORK", "PUBLIC FORK"], descriptors: ["TEAM"], status: ["COMPLETED", "REQUIRES VERIFICATION"],
    technologies: ["PostgreSQL", "PL/pgSQL", "Node.js", "React"], sourceIds: ["master-cv"],
    links: [{ label: "Repository", href: "https://github.com/Yashas120/Cloud-Provisioning-using-RDBMS" }, { label: "Interactive demo", href: "/demos#cloud" }], routeRelevance: ["Backend", "Cloud control planes"], verification: verifyContribution("cloud-provisioning"),
  },
  {
    id: "cloud-hack",
    title: "Cloud-Hack — Containerized Blogging Microservices",
    summary: "Kubernetes deployment and configuration for a small Flask/MongoDB microservice system.",
    contribution: "The repository division of work assigns Yashas sections 1.1–1.3: the MongoDB deployment path, configuration, and Secret-backed credentials.",
    limitation: "Team coursework; no claim of sole ownership, production scale, or a current deployment. Repository evidence — no browser lab yet.",
    ownership: ["COURSEWORK"], descriptors: ["TEAM"], status: ["COMPLETED"],
    featuredLabels: ["COURSEWORK", "TEAM", "COMPLETED"],
    technologies: ["Python", "Flask", "MongoDB", "Docker", "Kubernetes", "ConfigMaps", "Secrets"], sourceIds: ["master-cv", "repo-cloud-hack"],
    links: [{ label: "Repository", href: "https://github.com/Yashas120/Cloud-Hack" }], routeRelevance: ["Backend", "Cloud"],
  },
  {
    id: "petra",
    title: "PeTra Booking Application",
    summary: "A completed three-person booking application with a React, Express, and MongoDB request path.",
    contribution: "Contribution requires verification; the equal-contribution record is candidate-supplied and commit scope remains unverified.",
    ownership: ["COURSEWORK", "PUBLIC FORK"], descriptors: ["TEAM"], status: ["ARCHIVED", "COMPLETED", "REQUIRES VERIFICATION"],
    technologies: ["React", "Express", "MongoDB"], sourceIds: ["master-cv"],
    links: [{ label: "Repository", href: "https://github.com/Yashas120/Petra" }, { label: "Interactive demo", href: "/demos#petra" }], routeRelevance: ["Product breadth", "Full stack"], verification: verifyContribution("petra"),
  },
  {
    id: "farmer-rag",
    title: "Multilingual RAG Voice Assistant for Farmers",
    summary: "A CPU-only multilingual voice and retrieval workflow built as an applied-AI prototype.",
    contribution: "Built the completed prototype; no public repository has been verified.",
    ownership: ["PROTOTYPE"], status: ["COMPLETED"],
    technologies: ["Python", "RAG", "Speech", "Multilingual interfaces"], sourceIds: ["master-cv"], links: [], routeRelevance: ["Applied AI", "Product thinking"],
  },
  {
    id: "underwater",
    title: "Underwater Data-Center Monitoring",
    summary: "Collaborative sensor and alerting research for hard-to-reach underwater infrastructure.",
    contribution: "Contributed to the published monitoring and alerting prototype.",
    limitation: "A research prototype—not production infrastructure.",
    ownership: ["RESEARCH", "COLLABORATIVE", "PROTOTYPE"], status: ["PUBLISHED"],
    technologies: ["Arduino", "Sensors", "Alerting", "Reliability"], sourceIds: ["master-cv", "paper-underwater"],
    links: [{ label: "Paper", href: "https://doi.org/10.1109/CSITSS54238.2021.9683449" }], routeRelevance: ["Research", "Reliability"],
  },
  {
    id: "portfolio",
    title: "Technical Portfolio — Six Systems Interfaces",
    summary: "A typed, data-driven, statically exported portfolio expressed through six role-specific system interfaces.",
    contribution: "Designed and built the active Next.js and TypeScript portfolio system.",
    ownership: ["ORIGINAL"], status: ["ACTIVE"],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Static export"], sourceIds: ["master-cv"],
    links: [{ label: "Website", href: "https://yashas120.github.io" }, { label: "Repository", href: "https://github.com/Yashas120/Yashas120.github.io" }], routeRelevance: ["Web platform", "Delivery"],
  },
  {
    id: "packet-photon",
    title: "Packet-to-Photon Lab",
    summary: "A roadmap concept for tracing a request across service, platform, and optical boundaries.",
    contribution: "Concept only; no working repository or outcome is claimed.",
    ownership: ["CONCEPT"], status: ["CONCEPT"],
    technologies: ["Systems visualization"], sourceIds: ["master-cv"], links: [], routeRelevance: ["Roadmap", "Cross-layer systems"],
  },
  {
    id: "sunset",
    title: "SunSET / UCSD Academic-History Utility Exploration",
    summary: "A public-fork exploration whose contribution boundary is not verified.",
    contribution: "Excluded from authored work until commits or accepted changes establish a contribution.",
    ownership: ["PUBLIC FORK"], status: ["REQUIRES VERIFICATION"],
    technologies: [], sourceIds: ["master-cv"], links: [{ label: "Repository", href: "https://github.com/Yashas120/ucsd" }], routeRelevance: ["Excluded"], verification: verifyContribution("sunset"),
  },
  {
    id: "ooad-blockchain",
    title: "OOAD-Project-Blockchain",
    summary: "Likely a duplicate or precursor of the Java Bitcoin implementation.",
    contribution: "Excluded as a separate project until distinct scope is verified.",
    ownership: ["COURSEWORK"], status: ["REQUIRES VERIFICATION"],
    technologies: [], sourceIds: ["master-cv"], links: [], routeRelevance: ["Excluded"], verification: verifyContribution("ooad-blockchain"),
  },
] as const;

export const featuredWorkIds = ["cloud-hack", "bitcoin", "multiview", "swift"] as const;
export const indexWorkIds = [
  "ghost-scheduler", "swift", "multiview", "chocollvm", "ssml", "bitcoin", "yelp", "parallel",
  "cloud-provisioning", "cloud-hack", "petra", "farmer-rag", "underwater", "portfolio", "packet-photon",
] as const;
export const excludedWorkIds = ["sunset", "ooad-blockchain"] as const;

export const workById = Object.fromEntries(workEvidence.map((work) => [work.id, work])) as Record<string, WorkEvidence>;
export const roleById = Object.fromEntries(roleEvidence.map((role) => [role.id, role])) as Record<string, RoleEvidence>;
export const sourceById = Object.fromEntries(evidenceSources.map((source) => [source.id, source])) as Record<string, EvidenceSource>;

export const education = [
  { school: "University of California San Diego", degree: "M.S. Computer Science", dates: "Incoming September 2026 · Expected 2027", detail: "Graduate study begins in September 2026; no completed UCSD coursework is implied." },
  { school: "PES University", degree: "B.Tech Computer Science and Engineering", dates: "Aug 2019–May 2023", detail: "U.S.-equivalent GPA 3.78/4.0." },
] as const;

export const publications = [
  { title: "Towards Faster and Efficient Lightweight Image Super Resolution Using Transformers and Fourier Convolutions", venue: "Artificial Intelligence and Applications 3(2), 168–178 · 2025 (online 2024)", labels: ["COLLABORATIVE", "PEER REVIEWED"], href: "https://doi.org/10.47852/bonviewAIA42021930" },
  { title: "Monitoring and Alert Systems for Underwater Data Centers", venue: "2021 IEEE CSITSS", labels: ["COLLABORATIVE", "PEER REVIEWED", "PROTOTYPE"], href: "https://doi.org/10.1109/CSITSS54238.2021.9683449" },
] as const;

export const teaching = [
  { title: "Image Processing & Computer Vision", count: 122, approx: false, mechanism: "Labs, steganography work, office hours, and a grading macro that cut grading time by 50%." },
  { title: "Data Analytics", count: 494, approx: false, mechanism: "Themed assignments, office hours, and a Kaggle competition for 178 teams." },
  { title: "Graduate Deep Learning", count: 40, approx: true, mechanism: "Three assignments and a web autograder while serving as an undergraduate TA for a graduate course." },
] as const;

export const recognition = [
  { title: "AWS Certified Developer – Associate", detail: "Credential URL and active/expiry state require verification before a credential action is published.", state: "REQUIRES VERIFICATION" },
  { title: "Prof. C. N. R. Rao Merit Scholarship", detail: "Top-20% academic recognition.", state: "VERIFIED" },
  { title: "Security, mentorship, and leadership", detail: "CTF participation, Cisco security education, a Bitcoin bootcamp, an MCP-vulnerability talk, mentorship, Executive Shadow participation, and student/community coaching. Exact event names and placements remain withheld pending verification.", state: "PUBLIC-SAFE SUMMARY" },
] as const;

export const skillLayers = [
  { title: "Cloud & delivery", evidenceId: "cisco-backend", items: "AWS, Terraform, GitHub Actions, Docker, Kubernetes, deployment dependency graphs, static delivery" },
  { title: "Backend & data", evidenceId: "cisco-backend", items: "Python, Java, TypeScript, SQL, PostgreSQL, MongoDB, Cassandra, DynamoDB, SNS/SQS, REST/OpenAPI, Protobuf, OpenSearch" },
  { title: "Systems & networking", evidenceId: "cisco-optical", items: "C/C++, Linux, scheduling, concurrency, optical line-card software, high-speed Ethernet, secure boot, FPGA/FPD diagnosis" },
  { title: "Testing & observability", evidenceId: "cisco-optical", items: "CMocka, test-boundary design, log analysis, performance profiling, incident RCA, staged rollout, reproducible benchmarking" },
  { title: "ML/CV & research", evidenceId: "swift", items: "PyTorch, OpenCV, transformers, Fourier convolution, multiview geometry, Spark, experimental evaluation" },
  { title: "Teaching & leadership", evidenceId: "pes-ta", items: "Assignment and autograder design, technical explanation, mentoring, onboarding, stakeholder discovery, documentation" },
] as const;

export const sceneRanges = [
  { id: "overview", nav: "Overview", start: 0, end: 0.075, heading: "Backend and platform engineering, backed by operating evidence." },
  { id: "experience", nav: "Experience", start: 0.075, end: 0.155, heading: "One career, several system layers." },
  { id: "infrastructure", nav: "Infrastructure", start: 0.155, end: 0.275, heading: "Infrastructure became a dependency graph, not a checklist." },
  { id: "events", nav: "Events", start: 0.275, end: 0.385, heading: "One durable write became a regional delivery path." },
  { id: "reliability", nav: "Reliability", start: 0.385, end: 0.51, heading: "Reliability work starts where the diagram stops." },
  { id: "systems", nav: "Systems", start: 0.51, end: 0.625, heading: "The same reliability discipline continued down to the line card." },
  { id: "automation", nav: "Automation", start: 0.625, end: 0.7, heading: "Automation is a durable career pattern." },
  { id: "projects", nav: "Projects", start: 0.7, end: 0.805, heading: "Proof objects, with ownership made explicit." },
  { id: "research-teaching", nav: "Research & Teaching", start: 0.805, end: 0.885, heading: "Breadth that strengthens engineering judgment." },
  { id: "work-index", nav: "Work Index", start: 0.885, end: 0.96, heading: "The complete, auditable work index." },
  { id: "contact", nav: "Contact", start: 0.96, end: 1, heading: "Build the control plane with me." },
] as const;

export const backendLens = {
  route: "/backend" as const,
  featuredRoleIds: ["cisco-backend", "cisco-optical", "cisco-intern", "schneider", "pes-ta"] as const,
  featuredWorkIds,
  indexWorkIds,
  excludedWorkIds,
};

/** Build-time assertions: a factual omission or broken reference fails the route. */
function assertBackendEvidence() {
  const canonicalIds = new Set(workEvidence.map((work) => work.id));
  const accountedFor = new Set<string>([...featuredWorkIds, ...indexWorkIds, ...excludedWorkIds]);
  for (const id of canonicalIds) {
    if (!accountedFor.has(id)) throw new Error(`Unaccounted portfolio work: ${id}`);
  }
  if (featuredWorkIds.length !== 4 || new Set(featuredWorkIds).size !== 4) {
    throw new Error("The backend lens must feature exactly four unique projects.");
  }
  const expectedFeatured = ["cloud-hack", "bitcoin", "multiview", "swift"];
  if (featuredWorkIds.some((id, index) => id !== expectedFeatured[index])) {
    throw new Error("The backend featured-project contract changed.");
  }
  const sourceIds = new Set(evidenceSources.map((source) => source.id));
  for (const work of workEvidence) {
    if (!work.ownership.length || !work.status.length) throw new Error(`Missing ownership/status: ${work.id}`);
    for (const sourceId of work.sourceIds) if (!sourceIds.has(sourceId)) throw new Error(`Missing source ${sourceId} for ${work.id}`);
  }
  for (const role of roleEvidence) {
    for (const sourceId of role.sourceIds) if (!sourceIds.has(sourceId)) throw new Error(`Missing source ${sourceId} for ${role.id}`);
  }
  const demoIds = new Set(["bitcoin", "chocollvm", "swift", "multiview", "cifar", "parallel", "cloud", "yelp", "petra"]);
  for (const work of workEvidence) {
    for (const link of work.links) {
      if (link.label === "Interactive demo" && !demoIds.has(link.href.split("#")[1] ?? "")) {
        throw new Error(`Unknown demo anchor on ${work.id}: ${link.href}`);
      }
    }
  }
  const teachingTotal = teaching.reduce((sum, course) => sum + course.count, 0);
  if (teachingTotal !== 656) throw new Error(`Teaching total must equal 656; received ${teachingTotal}`);
  const resumeConfig: { available: boolean; publicHref?: string } = resumeState;
  if (resumeConfig.available && (!resumeConfig.publicHref || resumeConfig.publicHref.includes("linkedin.com"))) {
    throw new Error("A visible Résumé action must point to a public PDF, never LinkedIn.");
  }
}

assertBackendEvidence();
