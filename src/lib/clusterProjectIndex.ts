export type WorkContext = "professional" | "coursework" | "research" | "personal";

export type ContributionModel =
  | "independent"
  | "collaborative"
  | "equal-team"
  | "scoped-team"
  | "attribution-not-public";

export type RepositoryProvenance = "original" | "fork" | "none";

export type ArtifactKind =
  | "production-mechanism"
  | "implementation"
  | "publication"
  | "prototype"
  | "poc"
  | "internal-tool"
  | "internal-test-infrastructure"
  | "study";

export type EvidenceLifecycle =
  | "delivered"
  | "active"
  | "published"
  | "completed"
  | "in-development"
  | "evidence-pending";

export type EvidenceType =
  | "public-repository"
  | "publication"
  | "public-report"
  | "professional-experience"
  | "no-public-artifact";

export type ProjectEvidenceLink = {
  kind: "repository" | "publication" | "experience" | "report";
  label: string;
  href: string;
};

export type ProjectEvidenceGroupId =
  | "professional-systems"
  | "systems"
  | "research"
  | "product"
  | "professional-tools"
  | "repository-context"
  | "evidence-pending";

export type ProjectEvidenceItem = {
  id: string;
  group: ProjectEvidenceGroupId;
  title: string;
  description: string;
  contribution: string;
  boundary?: string;
  context: WorkContext;
  contributionModel: ContributionModel;
  repositoryProvenance: RepositoryProvenance;
  artifactKind: ArtifactKind;
  lifecycle: EvidenceLifecycle;
  domains: string[];
  evidenceTypes: EvidenceType[];
  links: ProjectEvidenceLink[];
  evidenceNote?: string;
  featuredAnchor?: string;
  compact?: boolean;
};

export type ProjectEvidenceGroup = {
  id: ProjectEvidenceGroupId;
  title: string;
  introduction: string;
  items: ProjectEvidenceItem[];
  subordinate?: boolean;
};

export const projectIndexIntro = {
  eyebrow: "Project and evidence index",
  heading: "Every project has a provenance. Every claim states its boundary.",
  body: "This is the complete substantive project record, with selected production mechanisms cross-linked from Experience. Each entry leads with the engineering problem and keeps contribution, lifecycle, provenance, and evidence visible. When a public source documents shared work rather than individual modules, I leave that boundary intact.",
  legend: [
    { term: "Independent", definition: "Personally built." },
    { term: "Collaborative", definition: "Shared implementation." },
    { term: "Public fork", definition: "Repository provenance, not the absence of contribution." },
  ],
} as const;

export const projectEvidenceLabels = {
  context: {
    professional: "Professional",
    coursework: "Coursework",
    research: "Research",
    personal: "Personal",
  },
  contribution: {
    independent: "Independent",
    collaborative: "Collaborative",
    "equal-team": "Equal team contribution",
    "scoped-team": "Scoped team contribution",
    "attribution-not-public": "Attribution not public",
  },
  provenance: {
    original: "Original repository",
    fork: "Public fork",
    none: "No repository",
  },
  artifact: {
    "production-mechanism": "Production mechanism",
    implementation: "Implementation",
    publication: "Publication",
    prototype: "Prototype",
    poc: "PoC",
    "internal-tool": "Internal tool",
    "internal-test-infrastructure": "Internal test infrastructure",
    study: "Study",
  },
  lifecycle: {
    delivered: "Delivered",
    active: "Active",
    published: "Published",
    completed: "Completed",
    "in-development": "In development",
    "evidence-pending": "Evidence pending",
  },
  evidence: {
    "public-repository": "Public repository",
    publication: "Publication",
    "public-report": "Public report",
    "professional-experience": "Professional experience",
    "no-public-artifact": "No public artifact",
  },
} as const;

const experience = (href: string): ProjectEvidenceLink => ({ kind: "experience", label: "Experience", href });
const repository = (href: string): ProjectEvidenceLink => ({ kind: "repository", label: "Repository", href });
const publication = (href: string): ProjectEvidenceLink => ({ kind: "publication", label: "Publication", href });

export const projectEvidenceGroups: ProjectEvidenceGroup[] = [
  {
    id: "professional-systems",
    title: "Selected production mechanisms",
    introduction: "Production mechanisms already explained in the experience story, collected here as a compact evidence map rather than duplicated as project cards.",
    items: [
      {
        id: "dependency-aware-infrastructure",
        group: "professional-systems",
        title: "Dependency-aware infrastructure deployment",
        description: "Made infrastructure dependencies explicit so independent resources could progress in parallel while prerequisite-bound components retained safe ordering.",
        contribution: "Scoped contribution to production infrastructure and its deployment path.",
        context: "professional",
        contributionModel: "scoped-team",
        repositoryProvenance: "none",
        artifactKind: "production-mechanism",
        lifecycle: "delivered",
        domains: ["Terraform", "Deployment systems", "Reliability"],
        evidenceTypes: ["professional-experience"],
        links: [experience("#experience-cisco-backend-cloud")],
      },
      {
        id: "cross-region-event-integration",
        group: "professional-systems",
        title: "Cross-region event integration",
        description: "Connected a source write through managed AWS messaging to regional service consumers that applied corresponding changes to their SQL stores.",
        contribution: "Scoped contribution across infrastructure and service-integration boundaries.",
        boundary: "Public boundary: AWS supplied the messaging primitives; the contribution covered infrastructure and service integration rather than broker or database-replication implementation.",
        context: "professional",
        contributionModel: "scoped-team",
        repositoryProvenance: "none",
        artifactKind: "production-mechanism",
        lifecycle: "delivered",
        domains: ["Event flow", "Multi-region services", "Infrastructure"],
        evidenceTypes: ["professional-experience"],
        links: [experience("#experience-cisco-backend-cloud")],
      },
      {
        id: "staged-database-cutover",
        group: "professional-systems",
        title: "Staged database cutover and rollout recovery",
        description: "Supported old/new database coexistence and an evidence-driven endpoint transition, then used a separate rollout failure to turn hidden service coupling into stronger health checks and release procedure.",
        contribution: "Scoped team contribution to migration, diagnosis, and operational recovery.",
        boundary: "Public boundary: The evidenced scope covers old/new coexistence, endpoint transition, and a separate rollout-recovery lesson; it does not assert sole migration ownership or an undocumented rollback mechanism.",
        context: "professional",
        contributionModel: "scoped-team",
        repositoryProvenance: "none",
        artifactKind: "production-mechanism",
        lifecycle: "delivered",
        domains: ["Databases", "Migration", "Operational reliability"],
        evidenceTypes: ["professional-experience"],
        links: [experience("#experience-cisco-backend-cloud")],
      },
      {
        id: "hardware-state-reconciliation",
        group: "professional-systems",
        title: "Desired, observed, and programmed hardware state",
        description: "Made state boundaries explicit across warm restart and verified that software and line-card programming returned to agreement without unnecessarily disturbing matching hardware state.",
        contribution: "Independently implemented and verified the state-reconciliation path within the evidenced platform scope.",
        boundary: "Public boundary: State reconciliation across a software/hardware boundary, distinct from consensus, replication, or an orchestration operator.",
        context: "professional",
        contributionModel: "independent",
        repositoryProvenance: "none",
        artifactKind: "production-mechanism",
        lifecycle: "delivered",
        domains: ["Platform software", "State reconciliation", "Hardware integration"],
        evidenceTypes: ["professional-experience"],
        links: [experience("#experience-cisco-optical")],
      },
      {
        id: "hardware-independent-c-tests",
        group: "professional-systems",
        title: "Hardware-independent C test infrastructure",
        description: "Built a CMocka-based path that exercised production C behavior while replacing hardware and SDK boundaries with deterministic stubs, failure injection, sanitizer/static-analysis paths, and repeatable local execution.",
        contribution: "Scoped team contribution to test architecture and developer productivity.",
        boundary: "Public boundary: Internal names, exact coverage, file and function counts, adoption figures, and timings are intentionally omitted.",
        context: "professional",
        contributionModel: "scoped-team",
        repositoryProvenance: "none",
        artifactKind: "internal-test-infrastructure",
        lifecycle: "delivered",
        domains: ["C/C++", "Test architecture", "Developer productivity"],
        evidenceTypes: ["professional-experience"],
        links: [experience("#experience-cisco-optical")],
      },
    ],
  },
  {
    id: "systems",
    title: "Systems, infrastructure, and protocols",
    introduction: "Scheduling, streaming, resource allocation, cryptographic protocols, containers, and performance experiments—systems work where behavior emerges from constraints and boundaries.",
    items: [
      {
        id: "bitcoin-transactions-java",
        group: "systems",
        title: "Bitcoin Transactions in Java",
        description: "Implemented the path from cryptographic primitives to a signed Bitcoin testnet transaction in Java: SHA-256, RIPEMD-160, finite-field elliptic-curve operations, wallet and address generation, transaction serialization, and signing.",
        contribution: "Independent educational systems implementation built without external cryptography dependencies for the core primitives.",
        boundary: "Boundary: The project implements transaction and cryptographic primitives. It does not implement Bitcoin consensus, a network node, ledger replication, or network mining.",
        context: "personal",
        contributionModel: "independent",
        repositoryProvenance: "original",
        artifactKind: "implementation",
        lifecycle: "completed",
        domains: ["Protocols", "Applied cryptography", "Serialization"],
        evidenceTypes: ["public-repository"],
        links: [repository("https://github.com/Yashas120/Bitcoin-Transactions-in-java")],
        featuredAnchor: "#systems-evidence",
      },
      {
        id: "cloud-hack",
        group: "systems",
        title: "Cloud-Hack",
        description: "Deployed a small Flask and MongoDB application through Docker and Kubernetes, using deployments, services, configuration, and secrets to make application boundaries explicit.",
        contribution: "Four-person team project. Yashas’s documented scope covered the Mongo image and environment configuration, MongoDB Kubernetes Deployment, and Kubernetes Secret.",
        boundary: "Public boundary: Yashas’s documented scope is the Mongo image and configuration, Kubernetes Deployment, and Secret within a four-person implementation.",
        context: "coursework",
        contributionModel: "scoped-team",
        repositoryProvenance: "original",
        artifactKind: "implementation",
        lifecycle: "completed",
        domains: ["Containers", "Kubernetes", "Service configuration"],
        evidenceTypes: ["public-repository"],
        links: [repository("https://github.com/Yashas120/Cloud-Hack")],
      },
      {
        id: "spark-streaming-ml",
        group: "systems",
        title: "Spark Streaming for Machine Learning",
        description: "Explored streaming machine learning as an end-to-end data system: a TCP producer emitted CIFAR-10 batches, Spark Streaming converted the feed into DStreams, and each RDD became a training or inference update across MLP, SVM, K-means, and deep-feature variants.",
        contribution: "Four-person team project. The public repository documents the shared implementation, not individual module ownership.",
        boundary: "Public boundary: The inspected MLP path collects data to the driver for partial-fit. This is streaming coursework, not a production distributed-training system.",
        context: "coursework",
        contributionModel: "collaborative",
        repositoryProvenance: "fork",
        artifactKind: "implementation",
        lifecycle: "completed",
        domains: ["Streaming data", "Spark", "Applied ML"],
        evidenceTypes: ["public-repository"],
        links: [repository("https://github.com/Yashas120/SSML-spark-streaming-for-machine-learning")],
        featuredAnchor: "#systems-evidence",
      },
      {
        id: "cloud-provisioning-rdbms",
        group: "systems",
        title: "Cloud Provisioning using RDBMS",
        description: "Modeled cloud-style resource allocation as relational state transitions. PostgreSQL functions and procedures enforced project, zone, rack, quota, and virtual-machine constraints, with a Node and React application boundary around the database model.",
        contribution: "Team course project. The public repository does not attribute individual database, backend, or frontend modules.",
        boundary: "Public boundary: A relational model of provisioning and quota enforcement—not a production cloud provider, distributed scheduler, or personally built database engine.",
        context: "coursework",
        contributionModel: "collaborative",
        repositoryProvenance: "fork",
        artifactKind: "implementation",
        lifecycle: "completed",
        domains: ["Databases", "Resource allocation", "Cloud foundations"],
        evidenceTypes: ["public-repository"],
        links: [repository("https://github.com/Yashas120/Cloud-Provisioning-using-RDBMS")],
        featuredAnchor: "#systems-evidence",
      },
      {
        id: "ssp",
        group: "systems",
        title: "SSP",
        description: "Used pthreads, parallel work partitioning, perf-based observation, and multidimensional memory-layout experiments to study where concurrency helps—and where synchronization, cache behavior, and access patterns dominate the result.",
        contribution: "The public repository contains the coursework experiments; individual and team context is not documented. The canonical repository name remains SSP until an authoritative source supplies its expansion.",
        boundary: "Public boundary: The repository covers pthread, perf, and memory-layout experiments. Any race or cache teaching model outside that source is illustrative rather than a measured hardware result.",
        context: "coursework",
        contributionModel: "attribution-not-public",
        repositoryProvenance: "original",
        artifactKind: "implementation",
        lifecycle: "completed",
        domains: ["Concurrency", "Linux performance", "Memory behavior"],
        evidenceTypes: ["public-repository"],
        links: [repository("https://github.com/Yashas120/SSP")],
        featuredAnchor: "#systems-evidence",
      },
    ],
  },
  {
    id: "research",
    title: "Research, ML, and computer vision",
    introduction: "Published research and implementation-heavy computer-vision work, presented as collaborative research where appropriate—not converted into production claims.",
    items: [
      {
        id: "swift-super-resolution",
        group: "research",
        title: "SWIFT · Efficient Image Super-Resolution",
        description: "Co-developed a lightweight single-image super-resolution architecture combining SwinV2-style transformer blocks with frequency-domain processing. The work evaluated ×2, ×3, and ×4 reconstruction across standard benchmarks and included reproducible training and serving paths.",
        contribution: "One of five co-authors. Results are paper-reported team results, not personal production metrics.",
        boundary: "Verified result: The paper reports about 34% fewer parameters and up to 60% faster inference than the compared lightweight SwinIR baseline.",
        context: "research",
        contributionModel: "collaborative",
        repositoryProvenance: "fork",
        artifactKind: "publication",
        lifecycle: "published",
        domains: ["Computer vision", "Transformers", "Efficient inference"],
        evidenceTypes: ["publication", "public-repository"],
        links: [
          publication("https://doi.org/10.47852/bonviewAIA42021930"),
          repository("https://github.com/Yashas120/SWIFT"),
        ],
        featuredAnchor: "#beyond-the-lens",
      },
      {
        id: "multiview-reconstruction",
        group: "research",
        title: "Multiview 3D Reconstruction",
        description: "The public implementation builds an incremental sparse structure-from-motion pipeline that moves from feature correspondence and epipolar geometry through triangulation, PnP, and bundle adjustment to a reconstructed point cloud.",
        contribution: "The public implementation is in Yashas’s original repository; repository language indicates collaboration, so the public entry carries no solo label.",
        boundary: "Boundary: Dense reconstruction and MVS were future work, not shipped capabilities.",
        context: "personal",
        contributionModel: "attribution-not-public",
        repositoryProvenance: "original",
        artifactKind: "implementation",
        lifecycle: "completed",
        domains: ["Computer vision", "Geometry", "Optimization"],
        evidenceTypes: ["public-repository"],
        links: [repository("https://github.com/Yashas120/Multiview-3D-Reconstruction")],
        featuredAnchor: "#beyond-the-lens",
      },
      {
        id: "underwater-data-center-monitoring",
        group: "research",
        title: "Monitoring and Alert Systems for Underwater Data Centers",
        description: "Explored how an inaccessible infrastructure environment could be monitored through embedded sensing and alerting. The Arduino-based prototype connected environmental signals to a remote monitoring and alert path.",
        contribution: "Co-authored published research; the source does not itemize individual modules.",
        boundary: "Public boundary: An embedded monitoring and alerting prototype, not production data-center infrastructure.",
        context: "research",
        contributionModel: "collaborative",
        repositoryProvenance: "none",
        artifactKind: "publication",
        lifecycle: "published",
        domains: ["Embedded systems", "Monitoring", "Reliability"],
        evidenceTypes: ["publication"],
        links: [publication("https://doi.org/10.1109/CSITSS54238.2021.9683449")],
      },
    ],
  },
  {
    id: "product",
    title: "Compilers, data, and product systems",
    introduction: "Projects that extend the systems record into compiler construction, data analysis, and application boundaries.",
    items: [
      {
        id: "chocollvm",
        group: "product",
        title: "ChocoLLVM",
        description: "A compiler frontend for a ChocoPy subset connects parsing and type checking to readable LLVM IR, with stage-specific parse, Python, LLVM, and test modes.",
        contribution: "Forked compiler-design coursework with upstream-derived portions kept attributed.",
        context: "coursework",
        contributionModel: "attribution-not-public",
        repositoryProvenance: "fork",
        artifactKind: "implementation",
        lifecycle: "completed",
        domains: ["Compilers", "Type systems", "LLVM IR"],
        evidenceTypes: ["public-repository"],
        links: [repository("https://github.com/Yashas120/chocollvm")],
        featuredAnchor: "#beyond-the-lens",
      },
      {
        id: "yelp-restaurant-analysis",
        group: "product",
        title: "Yelp Restaurant Analysis",
        description: "Combined check-in, review, and amenity data to investigate restaurant closure risk and improvement signals, using exploratory analysis and topic-modeling workflows.",
        contribution: "Team and forked coursework. The public repository does not attribute individual notebooks or modeling stages.",
        context: "coursework",
        contributionModel: "collaborative",
        repositoryProvenance: "fork",
        artifactKind: "implementation",
        lifecycle: "completed",
        domains: ["Data analysis", "NLP", "Applied ML"],
        evidenceTypes: ["public-repository"],
        links: [repository("https://github.com/Yashas120/Restaurant-analysis-using-YELP-dataset")],
        featuredAnchor: "#beyond-the-lens",
      },
      {
        id: "petra",
        group: "product",
        title: "Petra",
        description: "Built a pet-care discovery and booking application across a React client and Express/MongoDB backend, including authentication and API boundaries.",
        contribution: "Three-person team with equal contribution.",
        boundary: "Lifecycle note: Historical project; the original deployment is not presented as currently live.",
        context: "coursework",
        contributionModel: "equal-team",
        repositoryProvenance: "fork",
        artifactKind: "implementation",
        lifecycle: "completed",
        domains: ["Web application", "Backend APIs", "Authentication"],
        evidenceTypes: ["public-repository"],
        links: [repository("https://github.com/Yashas120/Petra")],
        featuredAnchor: "#beyond-the-lens",
      },
    ],
  },
  {
    id: "professional-tools",
    title: "Professional prototypes and internal tools",
    introduction: "Smaller internal systems are included when they reveal a distinct engineering mechanism. They remain explicitly labeled as prototypes, PoCs, or delivered tools.",
    items: [
      {
        id: "schneider-decision-tool",
        group: "professional-tools",
        title: "Schneider Decision Tool",
        description: "Built and handed off a Python and Tkinter decision-support tool that turned Excel-backed component dependencies into repeatable test-plan guidance.",
        contribution: "Owned requirements, data model, interface, test-plan generation, deployment, and handoff.",
        context: "professional",
        contributionModel: "independent",
        repositoryProvenance: "none",
        artifactKind: "internal-tool",
        lifecycle: "delivered",
        domains: ["Workflow automation", "Dependency modeling", "Internal product"],
        evidenceTypes: ["professional-experience"],
        links: [experience("#experience-schneider")],
      },
      {
        id: "group-aware-rag",
        group: "professional-tools",
        title: "Group-aware RAG Assistant PoC",
        description: "Built a group-aware retrieval-augmented generation proof of concept over engineering discussions, with scheduled ingestion and retrieval-time access boundaries.",
        contribution: "Personally built and demonstrated the PoC.",
        boundary: "Public boundary: An internal proof of concept demonstrated with public architecture only; no production or customer-use claim.",
        context: "professional",
        contributionModel: "independent",
        repositoryProvenance: "none",
        artifactKind: "poc",
        lifecycle: "completed",
        domains: ["Applied AI", "Retrieval", "Access boundaries"],
        evidenceTypes: ["professional-experience", "no-public-artifact"],
        links: [experience("#experience-cisco-backend-cloud")],
      },
      {
        id: "engineering-analytics-dashboard",
        group: "professional-tools",
        title: "Engineering Analytics Dashboard",
        description: "Built the Python backend for an engineering analytics tool that combined issue, defect, and code-quality sources into persisted analysis with an optional live-refresh path.",
        contribution: "Owned the backend implementation.",
        boundary: "Public boundary: The verified contribution is the Python backend; frontend ownership and organization-wide adoption are not asserted.",
        context: "professional",
        contributionModel: "independent",
        repositoryProvenance: "none",
        artifactKind: "prototype",
        lifecycle: "completed",
        domains: ["Backend", "Analytics", "Data integration"],
        evidenceTypes: ["professional-experience", "no-public-artifact"],
        links: [experience("#experience-cisco-backend-cloud")],
      },
      {
        id: "aws-glue-data-path",
        group: "professional-tools",
        title: "AWS Glue Data Path",
        description: "Built an event-triggered AWS Glue proof of concept that filtered and enriched data from S3 before loading the transformed result into DynamoDB.",
        contribution: "Implemented during the PX Cloud internship.",
        boundary: "Public boundary: A bounded internship proof of concept; no production-scale or operating-ownership claim.",
        context: "professional",
        contributionModel: "independent",
        repositoryProvenance: "none",
        artifactKind: "poc",
        lifecycle: "completed",
        domains: ["Cloud data pipeline", "AWS", "Python"],
        evidenceTypes: ["professional-experience", "no-public-artifact"],
        links: [experience("#experience-cisco-px-cloud")],
      },
      {
        id: "performance-monitoring-log-analyzer",
        group: "professional-tools",
        title: "Performance-Monitoring Log Analyzer",
        description: "Prototyped structured extraction of performance-monitoring counters from router logs to make optical diagnosis faster to explore and easier to compare.",
        contribution: "Built the prototype.",
        boundary: "Public boundary: A diagnostic prototype described without customer log content or adoption claims.",
        context: "professional",
        contributionModel: "independent",
        repositoryProvenance: "none",
        artifactKind: "prototype",
        lifecycle: "completed",
        domains: ["Optical tooling", "Telemetry", "Diagnostic automation"],
        evidenceTypes: ["professional-experience", "no-public-artifact"],
        links: [experience("#experience-cisco-optical")],
      },
      {
        id: "cx-agent-side-panel",
        group: "professional-tools",
        title: "CX Agent Side Panel",
        description: "Tested whether an agent-style chat side panel could be embedded into an existing product interface without redesigning the host application.",
        contribution: "Independently built the UI feasibility proof of concept.",
        context: "professional",
        contributionModel: "independent",
        repositoryProvenance: "none",
        artifactKind: "poc",
        lifecycle: "completed",
        domains: ["Frontend integration", "Product prototyping"],
        evidenceTypes: ["professional-experience", "no-public-artifact"],
        links: [experience("#experience-cisco-backend-cloud")],
      },
    ],
  },
  {
    id: "repository-context",
    title: "Repository context",
    introduction: "This subordinate record completes provenance without giving unsupported repository activity the same weight as authored systems.",
    subordinate: true,
    items: [
      {
        id: "technical-portfolio",
        group: "repository-context",
        title: "Technical Portfolio",
        description: "Built a statically deployed Next.js and TypeScript portfolio that presents one engineering record through role-specific narratives, evidence-backed copy, and interactive systems visuals.",
        contribution: "Original implementation and active portfolio.",
        context: "personal",
        contributionModel: "independent",
        repositoryProvenance: "original",
        artifactKind: "implementation",
        lifecycle: "active",
        domains: ["Web systems", "Content architecture", "Technical communication"],
        evidenceTypes: ["public-repository"],
        links: [repository("https://github.com/Yashas120/Yashas120.github.io")],
      },
      {
        id: "sunset-ucsd",
        group: "repository-context",
        title: "SunSET / UCSD",
        description: "Public fork and repository exploration retained for provenance.",
        contribution: "No verified Yashas-specific implementation is currently documented.",
        context: "personal",
        contributionModel: "attribution-not-public",
        repositoryProvenance: "fork",
        artifactKind: "study",
        lifecycle: "completed",
        domains: ["Repository exploration"],
        evidenceTypes: ["public-repository"],
        links: [repository("https://github.com/Yashas120/ucsd")],
        compact: true,
      },
      {
        id: "us-stocks-tax-calculator",
        group: "repository-context",
        title: "US Stocks Tax Calculator",
        description: "Public fork retained to complete the repository record; it is not presented as systems evidence.",
        contribution: "No verified Yashas-specific implementation is currently documented.",
        context: "personal",
        contributionModel: "attribution-not-public",
        repositoryProvenance: "fork",
        artifactKind: "implementation",
        lifecycle: "completed",
        domains: ["Finance utility", "Repository context"],
        evidenceTypes: ["public-repository"],
        links: [repository("https://github.com/Yashas120/us-stocks-tax-calculator")],
        compact: true,
      },
    ],
  },
  {
    id: "evidence-pending",
    title: "Evidence pending",
    introduction: "This final group marks an evidence boundary. It stays readable, but it does not promote an unverified study into the authored project record.",
    subordinate: true,
    items: [
      {
        id: "ghost-scheduler-study",
        group: "evidence-pending",
        title: "Performance Analysis of the ghOSt Scheduler",
        description: "A scheduler-performance study centered on Google ghOSt.",
        contribution: "Authorship, experimental setup, workloads, measurements, and conclusions require the public report or equivalent project record before they enter portfolio copy.",
        context: "coursework",
        contributionModel: "attribution-not-public",
        repositoryProvenance: "none",
        artifactKind: "study",
        lifecycle: "evidence-pending",
        domains: ["Operating systems", "Scheduling", "Performance"],
        evidenceTypes: ["no-public-artifact"],
        links: [],
        evidenceNote: "No public report currently available.",
      },
    ],
  },
];

export const projectEvidenceItems = projectEvidenceGroups.flatMap((group) => group.items);
