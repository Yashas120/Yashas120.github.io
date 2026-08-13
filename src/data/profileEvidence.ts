/**
 * Canonical, public-safe evidence used by the Forward Deployed Engineering
 * dossier. Employer-private scale, codenames, customer details, and unverified
 * claims do not belong in this file (or anywhere else in the public build).
 */

export type EvidenceKind =
  | "Professional"
  | "Original"
  | "Collaborative"
  | "Coursework"
  | "Research"
  | "Fork"
  | "Teaching"
  | "Concept"
  | "Planned";

export type EvidenceOwnership = "Owned" | "Co-owned" | "Supporting" | "Unknown-requires-verification";
export type EvidenceStatus =
  | "Production"
  | "Deployed internally"
  | "Shipped"
  | "Active"
  | "Archived"
  | "Published"
  | "Published prototype"
  | "Proof of concept"
  | "Prototype"
  | "Completed"
  | "In development"
  | "Concept"
  | "Unknown";

export interface EvidenceLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface ProfileEvidenceRecord {
  id: string;
  title: string;
  organization?: string;
  period?: string;
  kind: EvidenceKind[];
  ownership: EvidenceOwnership;
  status: EvidenceStatus;
  publicCopy: string;
  roleRelevance: string;
  sourceRefs: string[];
  evidenceLinks: EvidenceLink[];
  disclosure: "public-safe";
  destinationIds: string[];
  details?: string[];
  domain?: string;
  stack?: string[];
}

export const contact = {
  name: "Yashas Kadambi",
  email: "ykadambi@ucsd.edu",
  github: "https://github.com/Yashas120",
  linkedin: "https://www.linkedin.com/in/yashas120",
  portfolioRepo: "https://github.com/Yashas120/Yashas120.github.io",
  // The bundled 2025 PDF predates the current UCSD context, so /fde omits a
  // Resume action until a verified current document replaces it.
  resumeUrl: null as string | null,
} as const;

export const professionalRecords = [
  {
    id: "PE-01",
    title: "Optical Software Development Engineer II",
    organization: "Cisco",
    period: "2025–2026",
    kind: ["Professional"],
    ownership: "Co-owned",
    status: "Production",
    publicCopy:
      "Built optical line-card software at the hardware/software boundary across platform bring-up, clock-and-data-recovery integration, QPSK and high-speed Ethernet modes, generalized resource reconciliation, secure-boot-aware recovery, performance-monitoring tooling, and C validation infrastructure.",
    roleRelevance:
      "Systems depth below the service boundary: explicit state, cross-layer diagnosis, constrained recovery, and faster verification.",
    sourceRefs: ["CV-2026-08-11", "experience.ts"],
    evidenceLinks: [],
    disclosure: "public-safe",
    destinationIds: ["scene-10", "professional-record", "scope"],
    details: [
      "Owned generalized state-reconciliation work designed to support later modes without changes to its core algorithm.",
      "Kept ownership explicit across mode delivery: QPSK and 2×100G owned; 800GE modes co-owned.",
      "Co-authored the CMocka framework and personally built its third-iteration stubbing architecture, moving hardware-independent feedback from tens of minutes to seconds.",
      "Built or prototyped performance-monitoring, log-analysis, build, deploy, and recovery paths for faster diagnosis and setup.",
    ],
    domain: "Optical platform software",
    stack: ["C", "CMocka", "Linux", "hardware/software integration", "secure boot", "optical PM"],
  },
  {
    id: "PE-08",
    title: "Software Engineer, Backend & Cloud Platforms",
    organization: "Cisco",
    period: "Aug 2023–Jan 2025",
    kind: ["Professional"],
    ownership: "Co-owned",
    status: "Production",
    publicCopy:
      "Built and operated backend and cloud-platform systems across Terraform and AWS, event-driven workflows, authentication and API migration, database performance, incident diagnosis, constrained-environment remediation, and reusable developer tooling.",
    roleRelevance:
      "Primary production evidence for dependency discovery, safe rollout, operational debugging, constrained deployment, and adoption.",
    sourceRefs: ["CV-2026-08-11", "fde.ts", "experience.ts"],
    evidenceLinks: [],
    disclosure: "public-safe",
    destinationIds: ["scene-04", "scene-05", "scene-06", "scene-07", "scene-08", "scene-09", "professional-record", "scope"],
    details: [
      "Used production traffic evidence to identify active consumers and coordinate staged endpoint changes without customer impact.",
      "Separated parallel-safe deployment work from prerequisite-bound stages and maintained reusable Terraform components.",
      "Worked on an asynchronous regional event path and a database replacement/cutover using transaction-log continuity.",
      "Traced user and rollout failures across application, authentication, dependency, load-balancer, deployment, and data layers.",
      "Moved filtering and query work into databases where appropriate, and supported PostgreSQL, MongoDB, and Cassandra performance work.",
      "Built local tooling, human-approved operations automation, setup paths for legacy and Apple Silicon environments, documentation, and bounded prototypes.",
    ],
    domain: "Backend and cloud platforms",
    stack: ["Java", "Python", "Terraform", "AWS", "PostgreSQL", "MongoDB", "Cassandra", "DynamoDB", "SNS", "SQS"],
  },
  {
    id: "PE-17",
    title: "Software Development / Technical Intern, PX Cloud",
    organization: "Cisco",
    period: "2023",
    kind: ["Professional"],
    ownership: "Owned",
    status: "Shipped",
    publicCopy:
      "Built a GitHub Actions pipeline that generated and published Python and Java SDKs when the API specification changed, replacing a repeated manual release workflow. Also contributed a Glue data-pipeline proof of concept, Java backend APIs and filtering work, and a Colima-based local container setup.",
    roleRelevance: "Early evidence that a repeated integration task can become durable delivery infrastructure.",
    sourceRefs: ["CV-2026-08-11", "experience.ts"],
    evidenceLinks: [{ label: "Public Java SDK", href: "https://github.com/CiscoDevNet/px-cloud-java-sdk", external: true }],
    disclosure: "public-safe",
    destinationIds: ["scene-07", "scene-08", "professional-record", "scope"],
    details: [
      "Owned SDK generation and publication; a separate team owned production deployment.",
      "Kept the human versioning decision explicit while removing repeated generation and publication work.",
    ],
    domain: "CI, APIs, and developer environments",
    stack: ["GitHub Actions", "Python", "Java", "AWS Glue", "Colima"],
  },
  {
    id: "PE-21",
    title: "Summer Intern, Software Engineering",
    organization: "Schneider Electric",
    period: "Summer 2022",
    kind: ["Professional"],
    ownership: "Owned",
    status: "Deployed internally",
    publicCopy:
      "Embedded as the sole software engineer in a mechanical switchgear team, interviewed domain experts, modeled component-to-test-to-failure relationships, and built a Python/Tkinter Windows tool with an Excel-backed store and generated test plan.",
    roleRelevance: "Flagship end-to-end proof: discovery, domain translation, implementation, deployment, adoption, and handoff.",
    sourceRefs: ["CV-2026-08-11", "fde.ts", "experience.ts"],
    evidenceLinks: [],
    disclosure: "public-safe",
    destinationIds: ["scene-02", "scene-03", "professional-record", "scope"],
    details: [
      "Owned requirements, architecture, implementation, functional verification, security review, local deployment, documentation, and knowledge transfer.",
      "Reduced the workflow from roughly two days to roughly two hours—more than 90%—and the tool remained in use after the internship.",
    ],
    domain: "Engineering workflow software",
    stack: ["Python", "Tkinter", "Excel", "Windows", "SSO", "requirements engineering"],
  },
  {
    id: "PE-22",
    title: "Teaching Assistant",
    organization: "PES University",
    period: "Jul 2022–May 2023",
    kind: ["Teaching"],
    ownership: "Supporting",
    status: "Completed",
    publicCopy:
      "Supported Image Processing & Computer Vision, Data Analytics, and graduate Deep Learning for 656 learners. Designed assignments, labs, answer keys, solution notebooks, videos, office-hour workflows, autograders, and a public competition.",
    roleRelevance: "Technical explanation, fast feedback, workflow design, and reusable enablement material.",
    sourceRefs: ["CV-2026-08-11", "teaching.ts"],
    evidenceLinks: [],
    disclosure: "public-safe",
    destinationIds: ["professional-record", "teaching", "scope"],
    domain: "Teaching and technical enablement",
    stack: ["MATLAB", "Python", "TensorFlow", "autograding", "technical communication"],
  },
] satisfies readonly ProfileEvidenceRecord[];

export interface FeaturedSystem extends ProfileEvidenceRecord {
  problem: string;
  constraints: string[];
  system: string;
  outcome: string;
}

export const featuredSystems = [
  {
    id: "PR-09",
    title: "Cloud Provisioning Using an RDBMS",
    kind: ["Coursework", "Collaborative", "Fork"],
    ownership: "Unknown-requires-verification",
    status: "Completed",
    publicCopy:
      "A collaborative relational cloud-allocation system that turns quotas, hardware availability, lifecycle rules, and access policy into executable database constraints.",
    roleRelevance: "Makes operational constraints executable instead of leaving them in policy prose.",
    sourceRefs: ["CV-2026-08-11", "public-repository", "demo-cloud"],
    evidenceLinks: [
      { label: "Repository", href: "https://github.com/Yashas120/Cloud-Provisioning-using-RDBMS", external: true },
    ],
    disclosure: "public-safe",
    destinationIds: ["featured-systems", "work-index", "scope"],
    domain: "Databases and cloud allocation",
    stack: ["PostgreSQL", "PL/pgSQL", "Node.js", "React", "transactions", "triggers", "roles"],
    problem: "Allocate and track cloud hardware across projects, users, zones, quotas, costs, and VM lifecycle operations.",
    constraints: ["Quota enforcement", "Hardware availability", "Lifecycle consistency", "Concurrency-sensitive operations", "Access control"],
    system: "PostgreSQL schema with PL/pgSQL checks and procedures, transactions, triggers, roles, a Node.js backend, and a React interface.",
    outcome: "Completed coursework system; individual module ownership is intentionally not assigned.",
  },
  {
    id: "PR-03",
    title: "Multiview 3D Reconstruction",
    kind: ["Original"],
    ownership: "Owned",
    status: "Shipped",
    publicCopy:
      "An original incremental Structure-from-Motion implementation with robust pose recovery, triangulation, reprojection filtering, bundle adjustment, and PLY output.",
    roleRelevance: "Converts uncertain observations into a validated system through explicit geometry and inspectable output.",
    sourceRefs: ["CV-2026-08-11", "public-repository", "demo-multiview", "github-profile-2026-08-12"],
    evidenceLinks: [
      { label: "Repository", href: "https://github.com/Yashas120/Multiview-3D-Reconstruction", external: true },
    ],
    disclosure: "public-safe",
    destinationIds: ["featured-systems", "work-index", "scope"],
    domain: "Computer vision",
    stack: ["Python", "OpenCV", "NumPy", "SciPy", "SfM", "bundle adjustment"],
    problem: "Reconstruct a sparse 3D point cloud from ordered overlapping 2D images and camera intrinsics.",
    constraints: ["Noisy correspondences", "Pose ambiguity", "Outliers", "Reprojection error", "Sparse output"],
    system: "SIFT matching, fundamental and essential geometry, PnP/RANSAC, triangulation, reprojection filtering, and bundle adjustment.",
    outcome: "Original public implementation with 140+ stars and 25+ forks, checked August 2026.",
  },
  {
    id: "PR-06",
    title: "Bitcoin Transactions from Scratch in Java",
    kind: ["Original"],
    ownership: "Owned",
    status: "Shipped",
    publicCopy:
      "An independent implementation of cryptographic primitives, key and address generation, P2PKH transaction construction, signing, serialization, and testnet broadcast.",
    roleRelevance: "First-principles protocol reasoning, trust boundaries, and intermediate verification.",
    sourceRefs: ["CV-2026-08-11", "public-repository", "demo-bitcoin"],
    evidenceLinks: [
      { label: "Repository", href: "https://github.com/Yashas120/Bitcoin-Transactions-in-java", external: true },
    ],
    disclosure: "public-safe",
    destinationIds: ["featured-systems", "work-index", "scope"],
    domain: "Low-level systems and security",
    stack: ["Java", "Maven", "SHA-256", "RIPEMD-160", "secp256k1", "ECDSA", "P2PKH"],
    problem: "Understand and implement the transaction path below wallet abstractions.",
    constraints: ["Byte-level correctness", "Finite-field operations", "Hashing and signatures", "Script and serialization", "Testnet acceptance"],
    system: "Hash functions, elliptic-curve point math, key/address derivation, ECDSA, P2PKH, UTXO references, fee/change logic, serialization, and broadcast.",
    outcome: "Original shipped educational system; core primitives were built without external cryptography libraries.",
  },
  {
    id: "PR-02",
    title: "SWIFT lightweight image super-resolution",
    kind: ["Research", "Collaborative"],
    ownership: "Co-owned",
    status: "Published",
    publicCopy:
      "Co-developed a lightweight single-image super-resolution model combining SwinV2 attention with Fourier-domain processing, with reproducible evaluation and packaged inference paths.",
    roleRelevance: "Rigorous evaluation plus reproducible packaging beyond a notebook.",
    sourceRefs: ["CV-2026-08-11", "publication-doi", "official-implementation", "demo-swift"],
    evidenceLinks: [
      { label: "DOI", href: "https://doi.org/10.47852/bonviewAIA42021930", external: true },
      { label: "Official implementation", href: "https://github.com/iVishalr/SWIFT", external: true },
    ],
    disclosure: "public-safe",
    destinationIds: ["featured-systems", "work-index", "research", "scope"],
    domain: "ML and computer-vision research",
    stack: ["Python", "PyTorch", "SwinV2", "Fast Fourier Convolution", "DIV2K", "PSNR/SSIM", "Docker", "TorchServe"],
    problem: "Improve lightweight single-image super-resolution without the cost of a larger Transformer baseline.",
    constraints: ["Parameter count", "Inference time", "Reconstruction quality", "Multiple scale factors", "Reproducibility"],
    system: "SwinV2 attention plus Fourier-domain blocks across feature extraction and reconstruction, trained for ×2, ×3, and ×4 paths.",
    outcome: "Peer-reviewed collaborative research reporting about 34% fewer parameters and up to 60% faster inference than the compared lightweight SwinIR baseline.",
  },
] satisfies readonly FeaturedSystem[];

const work = (
  record: Omit<ProfileEvidenceRecord, "sourceRefs" | "disclosure" | "destinationIds" | "roleRelevance"> & {
    roleRelevance?: string;
  }
): ProfileEvidenceRecord => ({
  ...record,
  roleRelevance: record.roleRelevance ?? "Supporting breadth with ownership and delivery status kept explicit.",
  sourceRefs: ["CV-2026-08-11", "repository-audit-2026-08-12"],
  disclosure: "public-safe",
  destinationIds: ["work-index", "scope"],
});

export const workIndex = [
  work({ id: "PR-01", title: "Performance Analysis of the ghOSt Scheduler", kind: ["Coursework"], ownership: "Owned", status: "Completed", publicCopy: "Rebuilt and configured Linux for ghOSt; compared kernel-only and user-space CFS, FIFO, and Shinjuku-style scheduling configurations on RocksDB across varying load, threads, and memory; interpreted latency and throughput tradeoffs.", evidenceLinks: [], domain: "Kernel/systems performance", stack: ["Linux", "ghOSt", "RocksDB", "profiling"] }),
  featuredSystems[3],
  featuredSystems[1],
  work({ id: "PR-04", title: "ChocoLLVM", kind: ["Coursework", "Collaborative", "Fork"], ownership: "Unknown-requires-verification", status: "Completed", publicCopy: "Public coursework fork of a compiler front end spanning parsing, AST and type checking, Python emission, LLVM-oriented output, CLI modes, and tests. The visible fork history does not substantiate an individual code contribution.", evidenceLinks: [{ label: "Repository", href: "https://github.com/Yashas120/chocollvm", external: true }], domain: "Compilers" }),
  work({ id: "PR-05", title: "Spark Streaming for ML on CIFAR-10", kind: ["Coursework", "Collaborative", "Fork"], ownership: "Unknown-requires-verification", status: "Completed", publicCopy: "Collaborative streaming-ML system using Spark/PySpark, Kafka/Python, and TensorFlow-era tooling; examined batch-size effects on model behavior.", evidenceLinks: [{ label: "Repository", href: "https://github.com/Yashas120/SSML-spark-streaming-for-machine-learning", external: true }], domain: "Distributed ML" }),
  featuredSystems[2],
  work({ id: "PR-07", title: "Restaurant Closure-Risk Analysis with Yelp Data", kind: ["Coursework", "Collaborative", "Fork"], ownership: "Unknown-requires-verification", status: "Completed", publicCopy: "Collaborative analysis of check-in, review, and amenity signals with exploratory analysis, classification, and LDA topic modeling; the exact personal analysis boundary remains conservative.", evidenceLinks: [{ label: "Repository", href: "https://github.com/Yashas120/Restaurant-analysis-using-YELP-dataset", external: true }], domain: "Data science" }),
  work({ id: "PR-08", title: "Systems and Parallel Programming Experiments", kind: ["Coursework"], ownership: "Owned", status: "Completed", publicCopy: "Focused C and Python experiments for thread correctness, work splitting, parallel computation, cache and memory locality, loop structure, and profiling.", evidenceLinks: [{ label: "Repository", href: "https://github.com/Yashas120/SSP", external: true }], domain: "Parallel/low-level systems" }),
  featuredSystems[0],
  work({ id: "PR-10", title: "Cloud-Hack", kind: ["Coursework"], ownership: "Supporting", status: "Completed", publicCopy: "Small Flask and MongoDB blogging system packaged with Docker and Kubernetes using Deployments, Services, ConfigMaps, Secrets, and Mongo Express; no production-scale claim.", evidenceLinks: [{ label: "Repository", href: "https://github.com/Yashas120/Cloud-Hack", external: true }], domain: "Cloud-native" }),
  work({ id: "PR-11", title: "PeTra", kind: ["Collaborative", "Fork"], ownership: "Co-owned", status: "Archived", publicCopy: "React booking interface for hotel and pet-sitter discovery, built in a three-person team and integrated with a separately maintained backend.", evidenceLinks: [{ label: "Repository", href: "https://github.com/Yashas120/Petra", external: true }], domain: "Product/frontend" }),
  work({ id: "PR-12", title: "Multilingual RAG Voice Assistant for Farmers", kind: ["Collaborative"], ownership: "Co-owned", status: "Prototype", publicCopy: "Collaborative CPU-only voice and retrieval prototype for government subsidy and relief information in multiple languages; production concerns include latency, freshness, retrieval quality, and attribution.", evidenceLinks: [], domain: "Applied AI" }),
  work({ id: "PR-13", title: "Underwater Data Center Monitoring and Alert Prototype", kind: ["Research", "Collaborative"], ownership: "Co-owned", status: "Published prototype", publicCopy: "Arduino-class monitoring and alert concept for inaccessible infrastructure, with early detection, redundancy, and continuity considerations documented in a peer-reviewed paper.", evidenceLinks: [{ label: "IEEE record", href: "https://doi.org/10.1109/CSITSS54238.2021.9683449", external: true }], domain: "Embedded/IoT/reliability" }),
  work({ id: "PR-14", title: "Technical Portfolio", kind: ["Original"], ownership: "Owned", status: "Active", publicCopy: "Original data-driven Next.js and TypeScript portfolio that interprets one evidence universe through multiple role-specific interfaces with static deployment.", evidenceLinks: [{ label: "Repository", href: "https://github.com/Yashas120/Yashas120.github.io", external: true }], domain: "Product/web/systems communication" }),
] satisfies readonly ProfileEvidenceRecord[];

export const publications = [
  {
    id: "RS-01",
    title: "Toward Faster and Efficient Lightweight Image Super-Resolution Using Transformers and Fourier Convolutions",
    citation:
      "Vishal Ramesha, Yashas Kadambi, Abhishek Aditya B. S., T. Vijay Prashant, and Shylaja S. S. Artificial Intelligence and Applications 3(2), 168–178. Online January 16, 2024; final issue 2025.",
    label: "Research · Collaborative · Peer reviewed",
    copy:
      "Co-developed SWIFT, combining SwinV2 attention with Fourier-domain processing. The work trained ×2, ×3, and ×4 models on DIV2K, evaluated five standard datasets with PSNR/SSIM, and supplied checkpoints plus CPU/GPU Docker and TorchServe-oriented inference paths. It reports about 34% fewer parameters and up to 60% faster inference than the compared lightweight SwinIR baseline.",
    links: [
      { label: "DOI", href: "https://doi.org/10.47852/bonviewAIA42021930", external: true },
      { label: "Official implementation", href: "https://github.com/iVishalr/SWIFT", external: true },
    ],
  },
  {
    id: "RS-02",
    title: "Monitoring and Alert Systems for Underwater Data Centers using Arduino",
    citation:
      "Y. Kadambi, R. Vishal, and R. Ravish. IEEE CSITSS, 2021, pp. 1–6. DOI 10.1109/CSITSS54238.2021.9683449.",
    label: "Research · Collaborative · Published prototype",
    copy:
      "Developed an Arduino-based monitoring and alert concept for sealed underwater data-center assets, where physical access is expensive and early failure detection, alerts, redundancy, and continuity matter.",
    links: [{ label: "IEEE record", href: "https://doi.org/10.1109/CSITSS54238.2021.9683449", external: true }],
  },
] as const;

export const teachingRecords = [
  {
    id: "TE-01",
    title: "Image Processing & Computer Vision",
    period: "Dec 2022–May 2023",
    learners: "122 learners",
    copy:
      "Designed two MATLAB labs and supporting materials, including WWII aerial-imagery analysis and LSB steganography; handled submissions, questions, office hours, and a reusable grading workflow that cut evaluation time by about half.",
    links: [] as EvidenceLink[],
  },
  {
    id: "TE-02",
    title: "Data Analytics",
    period: "Aug–Dec 2022",
    learners: "494 learners",
    copy:
      "Authored connected assignments and solution material across probability and statistics, supported office hours and forums, and designed and administered a Kaggle-style time-series competition with automated evaluation.",
    links: [],
  },
  {
    id: "TE-03",
    title: "Graduate Deep Learning Theory & Practices",
    period: "Jul–Dec 2022",
    learners: "~40 learners",
    copy:
      "Selected as an undergraduate TA; authored three assignments and labs on autoencoders and GANs and built a web submission and autograding workflow for immediate validation.",
    links: [] as EvidenceLink[],
  },
] as const;

export const educationRecords = [
  {
    id: "ED-01",
    school: "UC San Diego",
    degree: "MS in Computer Science",
    period: "starting Sep 2026 · expected 2027",
    copy:
      "Incoming graduate student with planned focus in distributed systems, operating systems, and applied machine learning, following roughly three years of production engineering at Cisco.",
  },
  {
    id: "ED-02",
    school: "PES University",
    degree: "BTech in Computer Science and Engineering",
    period: "Aug 2019–May 2023",
    copy:
      "Foundation across operating systems, distributed systems, networks, compilers, databases, cloud computing, algorithms, and software engineering; two peer-reviewed publications and teaching across three courses.",
  },
] as const;

export const recognitionRecords = [
  {
    id: "AW-02",
    title: "Prof. C. N. R. Rao Merit Scholarship",
    copy: "Academic scholarship associated with placement in the top 20% of the PES Computer Science department.",
  },
  {
    id: "AW-05",
    title: "Mentorship and onboarding",
    copy:
      "Mentored an intern and a non-CS apprentice, and helped onboard engineers through environment setup, architecture, AWS, CI/CD, code quality, documentation, and hands-on knowledge transfer.",
  },
  {
    id: "AW-04",
    title: "Security education",
    copy:
      "Used the from-scratch Bitcoin implementation in a bootcamp on transaction flow and delivered a short talk on Model Context Protocol trust-boundary vulnerabilities.",
  },
  {
    id: "AW-06",
    title: "Technical and community leadership",
    copy:
      "Supported technical enablement, mock interviews and coaching, intern and engineering-community activities, and bounded applied-AI initiatives; these remain supporting signals beside the engineering record.",
  },
] as const;

export const scopeRecords = [
  { id: "CP-01", responsibility: "Discover the real problem", evidence: "Schneider interviews and workflow map; Cisco traffic, logs, and ownership discovery", surface: "domain interviews · traffic analysis · logs · dependency mapping" },
  { id: "CP-02", responsibility: "Build across service boundaries", evidence: "Cisco APIs and backends; Schneider tool; Cloud Provisioning", surface: "Java · Python · APIs · PostgreSQL · MongoDB · Cassandra · DynamoDB · React/Tkinter boundaries" },
  { id: "CP-03", responsibility: "Plan and deploy change", evidence: "Terraform sequencing; auth/API rollout; air-gapped migration; local environment automation", surface: "Terraform · AWS · CI/CD · Docker · Kubernetes · SQS/SNS · release gates" },
  { id: "CP-04", responsibility: "Diagnose and recover", evidence: "Layered access debugging; rollout/LB behavior; database performance; secure boot and firmware; PM/log tools", surface: "production debugging · health checks · query analysis · observability · recovery" },
  { id: "CP-05", responsibility: "Engineer below the service layer", evidence: "Line-card bring-up, CDR integration, QPSK and modes, resource reconciliation", surface: "C · hardware/software integration · state/resource ownership · secure boot · optical PM" },
  { id: "CP-06", responsibility: "Make feedback and setup repeatable", evidence: "CMocka framework, SDK CI, local setup paths, repository onboarding, grading automation", surface: "CMocka · GitHub Actions · scripts · runbooks · autograders" },
  { id: "CP-07", responsibility: "Reason about trust and protocols", evidence: "Auth migration, legacy logging remediation, secure boot, Bitcoin implementation, security education", surface: "access rules · dependency remediation · SHA-256 · RIPEMD-160 · secp256k1 · ECDSA" },
  { id: "CP-08", responsibility: "Evaluate ML/CV systems", evidence: "SWIFT benchmarks, Multiview geometry, Spark experiments, RAG evaluation", surface: "PyTorch · OpenCV · NumPy/SciPy · PSNR/SSIM · retrieval/evaluation · Docker/TorchServe" },
  { id: "CP-09", responsibility: "Explain, transfer, and support adoption", evidence: "Schneider handoff; Cisco knowledge transfer, documentation, and mentorship; 656-learner TA record", surface: "documentation · architecture notes · office hours · assignments · feedback systems" },
  { id: "CP-10", responsibility: "Integrate product workflows", evidence: "Schneider Windows UI, technical portfolio, PeTra frontend, Cloud Provisioning UI", surface: "TypeScript/React/Next.js · JavaScript · Tkinter · attribution boundaries" },
] as const;

export const exclusionRecords = [
  { id: "PR-15", title: "SunSET", reason: "Public fork is visible, but substantive personal contribution is not verified." },
  { id: "PR-16", title: "OOAD-Project-Blockchain", reason: "May duplicate or precede the verified Bitcoin project; distinct contribution is not verified." },
  { id: "PR-17", title: "Packet-to-Photon Lab", reason: "Conditional concept is withheld until its continued portfolio status is confirmed." },
  { id: "PR-18", title: "US Stocks Tax Calculator", reason: "Public fork alone does not verify substantive contribution." },
  { id: "AW-01", title: "AWS Certified Developer – Associate", reason: "Credential title, status, date, and evidence link require verification." },
  { id: "AW-03", title: "CTF placements and team membership", reason: "Event names, dates, rank scope, participant counts, and public wording require verification." },
  { id: "LK-04", title: "Résumé", reason: "The bundled 2025 PDF predates the current UCSD context and is withheld from /fde until replaced by a verified current résumé." },
] as const;

export const supplementalCoverage = [
  { id: "PE-02", destinations: ["scene-10", "professional-record"] },
  { id: "PE-03", destinations: ["professional-record", "scope"] },
  { id: "PE-04", destinations: ["scene-10", "professional-record"] },
  { id: "PE-05", destinations: ["scene-07", "scene-10", "professional-record"] },
  { id: "PE-06", destinations: ["scene-08", "professional-record"] },
  { id: "PE-07", destinations: ["scene-10", "professional-record"] },
  { id: "PE-09", destinations: ["scene-05", "professional-record"] },
  { id: "PE-10", destinations: ["scene-05", "professional-record", "scope"] },
  { id: "PE-11", destinations: ["professional-record", "scope"] },
  { id: "PE-12", destinations: ["scene-04", "professional-record"] },
  { id: "PE-13", destinations: ["scene-06", "professional-record"] },
  { id: "PE-14", destinations: ["scene-07", "professional-record"] },
  { id: "PE-15", destinations: ["scene-09", "work-index"] },
  { id: "PE-16", destinations: ["scene-08", "professional-record", "recognition"] },
  { id: "PE-18", destinations: ["scene-08", "professional-record"] },
  { id: "PE-19", destinations: ["professional-record"] },
  { id: "PE-20", destinations: ["scene-07", "scene-08", "professional-record"] },
  { id: "LK-01", destinations: ["contact"] },
  { id: "LK-02", destinations: ["work-index", "contact"] },
  { id: "LK-03", destinations: ["contact"] },
  { id: "LK-05", destinations: ["work-index", "contact"] },
  { id: "LK-06", destinations: ["research"] },
] as const;

export const teachingTotal = 122 + 494 + 40;

export const publicCoverage = [
  ...professionalRecords.map(({ id, destinationIds }) => ({ id, destinations: destinationIds })),
  ...workIndex.map(({ id, destinationIds }) => ({ id, destinations: destinationIds })),
  ...publications.map(({ id }) => ({ id, destinations: ["research"] })),
  ...teachingRecords.map(({ id }) => ({ id, destinations: ["teaching", "scope"] })),
  ...educationRecords.map(({ id }) => ({ id, destinations: ["education"] })),
  ...recognitionRecords.map(({ id }) => ({ id, destinations: ["recognition"] })),
  ...scopeRecords.map(({ id }) => ({ id, destinations: ["scope"] })),
  ...supplementalCoverage,
] as const;
