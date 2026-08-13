/**
 * Canonical public evidence for recruiter-facing routes.
 *
 * Relationship, lifecycle, ownership, disclosure, and placement answer separate
 * questions and must never be collapsed into one credibility label. Public copy
 * is intentionally safe to render without access to the private source archive.
 */

export type EvidenceRelationship =
  | "Professional"
  | "Original"
  | "Collaborative"
  | "Coursework"
  | "Research"
  | "Fork"
  | "Teaching"
  | "Concept"
  | "Planned / in development";

export type EvidenceStatus =
  | "Shipped"
  | "Active"
  | "Published"
  | "Completed"
  | "Archived"
  | "Prototype"
  | "In development"
  | "Concept"
  | "Status unverified";

export type EvidenceHref = {
  label: string;
  href: string;
  kind: "repo" | "paper" | "demo" | "credential";
};

export type EvidenceRecord = {
  id: string;
  title: string;
  sourceIds: string[];
  relationship: EvidenceRelationship[];
  status?: EvidenceStatus;
  ownership?: "Completely owned" | "Co-owned" | "Contribution unverified";
  publicCopy: string;
  lensCopy?: Record<string, string>;
  hrefs?: EvidenceHref[];
  disclosure: "public" | "review" | "private";
  verificationNote?: string;
  destinations: string[];
  category:
    | "experience"
    | "project"
    | "publication"
    | "teaching"
    | "education"
    | "recognition"
    | "leadership";
  dates?: string;
  location?: string;
  contribution?: string;
  details?: string[];
  stack?: string[];
  domain?: string;
};

export const destinationAnchors = [
  "top",
  "story",
  "optical-experience",
  "experience",
  "featured-systems",
  "work-index",
  "research",
  "teaching",
  "education",
  "recognition",
  "leadership",
  "scope",
  "contact",
] as const;

export const evidenceRecords = [
  {
    id: "role-cisco-optical",
    title: "Cisco Systems · Optical Software Development Engineer II",
    sourceIds: ["S1", "S7"],
    relationship: ["Professional"],
    status: "Shipped",
    publicCopy:
      "Dataplane software for optical line cards on the public Cisco NCS 1014 platform: hardware and firmware integration, high-speed Ethernet paths, warm-reload state recovery, secure development workflows, large-scale validation, and release-blocking diagnosis.",
    details: [
      "System boundaries · revised CDR, lambda-split provisioning, C/HAL/driver context, secure boot, firmware/FPGA diagnosis, PM and telemetry",
      "Feature and state paths · 400G QPSK, 800GE slice, 800GE bundle/8×100G, 2×100G, Mark-and-Sweep, board-revision and platform qualification",
      "Verification and leverage · configuration sweeps, CMocka/stubbing, sanitizers, static analysis, error injection, trace replay, build/deploy/log utilities",
    ],
    disclosure: "public",
    destinations: ["top", "story", "optical-experience"],
    category: "experience",
    dates: "Jan 2025–2026",
    location: "Bengaluru, India",
    domain: "Optical dataplane and systems software",
  },
  {
    id: "role-cisco-backend",
    title: "Cisco Systems · Software Development Engineer — Backend & Cloud Platforms",
    sourceIds: ["S1"],
    relationship: ["Professional"],
    status: "Shipped",
    publicCopy:
      "Built and operated infrastructure and backend systems for customer-facing cloud services: infrastructure as code, dependency-aware deployments, event-driven workflows, database and authentication migrations, performance analysis, observability, production recovery, and developer enablement.",
    lensCopy: {
      dataplane:
        "This work demonstrates safe state transitions, dependency discovery, observability, automated rollout, and cross-service failure isolation—the same reliability discipline later applied at hardware/software boundaries.",
    },
    details: [
      "Built reusable Terraform modules across a multi-service, multi-account, multi-region AWS estate for shared use beyond the immediate project.",
      "Separated parallel-safe deployment work from prerequisite-bound stages while keeping health gates explicit.",
      "Built a DynamoDB→SNS→SQS cross-region event workflow and coordinated a no-downtime database replacement and transaction-log cutover.",
      "Analyzed request and database paths across PostgreSQL, MongoDB, and Cassandra, moving filtering and query work closer to the data.",
      "Modernized authentication across services and teams using traffic-derived dependency discovery, staged flags, and a coordinated migration without customer impact.",
      "Root-caused production failures involving hidden dependencies; traced one authentication mismatch across four codebases into two decompiled Java archives.",
      "Upgraded air-gapped legacy environments from end-of-life logging software to a patched version without downtime and audited logging across repositories.",
      "Built developer environments and automation spanning synthetic local data, Apple Silicon compatibility, infrastructure/search/Protobuf boundaries, and repository setup at scale.",
      "Built group-aware RAG and engineering-analytics proofs of concept with explicit access boundaries; mentored an intern, supported an apprentice, helped onboard engineers, and wrote reusable guidance.",
    ],
    disclosure: "public",
    destinations: ["experience", "leadership", "scope"],
    category: "experience",
    dates: "Aug 2023–Jan 2025",
    location: "Bengaluru, India",
    domain: "Backend, cloud platforms, reliability",
  },
  {
    id: "role-cisco-intern",
    title: "Cisco Systems · Technical / Software Development Intern",
    sourceIds: ["S1"],
    relationship: ["Professional"],
    status: "Shipped",
    publicCopy:
      "Automated API client delivery and built backend/data-integration tools, removing repeated release work while keeping the human versioning decision explicit.",
    lensCopy: {
      dataplane: "Interface generation, reproducible CI, data-flow automation, and developer environments all reduce integration variance.",
    },
    details: [
      "Built a GitHub Actions pipeline that detected API-spec changes and generated and published Python and Java SDKs, replacing routine generation and publication work while a human selected the release version.",
      "Standardized API-spec documentation with a principal engineer.",
      "Built an S3-triggered Python/AWS Glue proof of concept that filtered and enriched a recurring data flow before DynamoDB.",
      "Implemented four Java APIs, including a nested filtering path, and fixed a production defect caused by incompatible data types.",
      "Automated an approved Docker Desktop alternative for about 20 engineers, avoiding roughly $1,500 in annual licensing cost.",
    ],
    disclosure: "public",
    destinations: ["experience", "scope"],
    category: "experience",
    dates: "Jan–Jul 2023",
    location: "Bengaluru, India",
    domain: "CI, APIs, data integration, developer tooling",
  },
  {
    id: "role-schneider",
    title: "Schneider Electric · Software Engineering Intern",
    sourceIds: ["S1"],
    relationship: ["Professional"],
    status: "Shipped",
    publicCopy:
      "Served as the sole software engineer in a predominantly mechanical switchgear team and translated domain knowledge into a Windows engineering tool from requirements through deployment.",
    lensCopy: {
      dataplane:
        "Direct evidence of end-to-end ownership at a software/physical-engineering boundary, including requirements, modeling, delivery, and adoption.",
    },
    details: [
      "Interviewed mechanical engineers and encoded part, test, and expected-failure knowledge in a structured Excel-backed model.",
      "Built the local Python/Tkinter desktop application, integrated SSO, generated the required workbook, and handled deployment, documentation, demonstration, and knowledge transfer.",
      "Reduced an engineering discussion and test-selection workflow from about two days to about two hours across roughly 20 workflows.",
      "Delivered during the internship; the tool continued to be used after handoff, and domain experts validated the engineering logic.",
    ],
    disclosure: "public",
    destinations: ["experience", "scope"],
    category: "experience",
    dates: "Jun–Aug 2022",
    location: "Bengaluru, India",
    domain: "Hardware-adjacent workflow engineering",
  },
  {
    id: "project-ghost",
    title: "Performance Analysis of the ghOSt Scheduler",
    sourceIds: ["S1", "S4"],
    relationship: ["Coursework"],
    status: "Completed",
    publicCopy:
      "Rebuilt and configured Linux for ghOSt, then compared kernel-only and user-space scheduling approaches on RocksDB using CFS, FIFO, and Shinjuku-style configurations across burst/sustained load, 16/32 threads, and 16/32 GB.",
    contribution: "Kernel build/configuration, RocksDB experiment design and execution, profiling, and analysis; the project evaluates ghOSt rather than claiming invention of it.",
    hrefs: [
      { label: "Systems portfolio", href: "/kernel/#ghost-scheduling", kind: "demo" },
      { label: "Interactive lab", href: "/demos#ghost", kind: "demo" },
    ],
    disclosure: "public",
    destinations: ["featured-systems", "work-index", "scope"],
    category: "project",
    stack: ["Linux kernel", "ghOSt", "C/C++", "RocksDB", "scheduling", "profiling"],
    domain: "Kernel and user-space scheduling",
  },
  {
    id: "project-bitcoin",
    title: "Bitcoin Transactions in Java",
    sourceIds: ["S1", "S6", "S10"],
    relationship: ["Original"],
    status: "Completed",
    publicCopy:
      "Implemented SHA-256, RIPEMD-160, secp256k1 finite-field arithmetic, ECDSA, P2PKH scripts, transaction serialization, signing, and a testnet transaction path without external cryptography dependencies.",
    contribution: "Designed and implemented the educational key→address→transaction→sign→serialize/testnet path independently; no production-wallet security claim.",
    hrefs: [
      { label: "Repository", href: "https://github.com/Yashas120/Bitcoin-Transactions-in-java", kind: "repo" },
      { label: "Demo", href: "/demos#bitcoin", kind: "demo" },
    ],
    disclosure: "public",
    destinations: ["featured-systems", "work-index", "scope"],
    category: "project",
    stack: ["Java", "SHA-256", "RIPEMD-160", "secp256k1/ECDSA", "P2PKH"],
    domain: "Protocols and cryptographic primitives",
  },
  {
    id: "project-underwater",
    title: "Monitoring and Alert Systems for Underwater Data Centers using Arduino",
    sourceIds: ["S1", "S9"],
    relationship: ["Research", "Collaborative"],
    status: "Published",
    publicCopy:
      "Co-developed and co-authored an Arduino-based monitoring and alerting system for hard-to-access submerged infrastructure, with redundancy and availability as explicit design concerns.",
    contribution: "Co-authored and contributed to the monitoring system; exact individual hardware/software scope is not claimed.",
    hrefs: [{ label: "DOI", href: "https://doi.org/10.1109/CSITSS54238.2021.9683449", kind: "paper" }],
    disclosure: "public",
    destinations: ["featured-systems", "work-index", "research", "scope"],
    category: "project",
    stack: ["Arduino", "embedded sensing", "monitoring", "redundancy", "systems integration"],
    domain: "Embedded monitoring and reliability",
  },
  {
    id: "project-multiview",
    title: "Multiview 3D Reconstruction",
    sourceIds: ["S1", "S6", "S10"],
    relationship: ["Original"],
    status: "Completed",
    publicCopy:
      "Implemented a traditional incremental Structure-from-Motion pipeline using SIFT/matching, epipolar and two-view geometry, PnP/RANSAC, triangulation, bundle adjustment, and sparse 3D point clouds.",
    contribution: "Implemented and documented the reconstruction pipeline; dense reconstruction remains future work.",
    hrefs: [
      { label: "Repository", href: "https://github.com/Yashas120/Multiview-3D-Reconstruction", kind: "repo" },
      { label: "Demo", href: "/demos#multiview", kind: "demo" },
    ],
    disclosure: "public",
    destinations: ["featured-systems", "work-index", "scope"],
    category: "project",
    stack: ["Python", "OpenCV", "NumPy/SciPy", "epipolar geometry", "SfM"],
    domain: "Computer vision and geometric pipelines",
  },
  {
    id: "project-swift",
    title: "SWIFT — lightweight image super-resolution",
    sourceIds: ["S1", "S6", "S8"],
    relationship: ["Research", "Collaborative", "Fork"],
    status: "Published",
    publicCopy:
      "Co-developed and validated a SwinV2/Fourier-convolution model; publisher credits conceptualization, software, validation, investigation, data curation, and writing/review.",
    contribution:
      "The paper reports 34% fewer parameters and up to 60% faster inference than its stated lightweight SwinIR comparison; this is collaborative research, not a solo repository claim.",
    hrefs: [
      { label: "Publisher", href: "https://ojs.bonviewpress.com/index.php/AIA/article/view/1930", kind: "paper" },
      { label: "DOI", href: "https://doi.org/10.47852/bonviewAIA42021930", kind: "paper" },
      { label: "Yashas fork", href: "https://github.com/Yashas120/SWIFT", kind: "repo" },
      { label: "Demo", href: "/demos#swift", kind: "demo" },
    ],
    disclosure: "public",
    destinations: ["work-index", "research", "scope"],
    category: "project",
    stack: ["PyTorch", "SwinV2", "Fourier convolutions", "DIV2K", "AMP/JIT", "Docker/TorchServe"],
    domain: "Machine learning research and validation",
  },
  {
    id: "project-chocollvm",
    title: "ChocoLLVM",
    sourceIds: ["S1", "S6"],
    relationship: ["Collaborative", "Coursework", "Fork"],
    status: "Completed",
    ownership: "Contribution unverified",
    publicCopy: "Compiler coursework spanning ChocoPy parsing/typechecked AST and lowering toward Python and LLVM IR.",
    contribution: "The repository is a collaborative coursework fork; individual module ownership is not claimed.",
    hrefs: [
      { label: "Repository", href: "https://github.com/Yashas120/chocollvm", kind: "repo" },
      { label: "Demo", href: "/demos#chocollvm", kind: "demo" },
    ],
    disclosure: "public",
    destinations: ["work-index", "scope"],
    category: "project",
    stack: ["Python", "ChocoPy", "LLVM IR", "llvmlite", "tests"],
    domain: "Compilers and low-level systems",
  },
  {
    id: "project-spark-cifar",
    title: "Spark Streaming for Machine Learning · CIFAR-10",
    sourceIds: ["S1", "S4", "S6"],
    relationship: ["Collaborative", "Coursework", "Fork"],
    status: "Completed",
    ownership: "Contribution unverified",
    publicCopy: "Team streaming-ML pipeline using Spark/PySpark/Kafka/TensorFlow to study micro-batch and data-flow behavior.",
    contribution: "Relationship and system scope are verified; individual component ownership is not claimed.",
    hrefs: [
      { label: "Repository", href: "https://github.com/Yashas120/SSML-spark-streaming-for-machine-learning", kind: "repo" },
      { label: "Demo", href: "/demos#cifar", kind: "demo" },
    ],
    disclosure: "public",
    destinations: ["work-index", "scope"],
    category: "project",
    stack: ["Spark", "PySpark", "Kafka", "TensorFlow", "CIFAR-10"],
    domain: "Distributed streaming and ML",
  },
  {
    id: "project-ssp",
    title: "Systems and parallel-performance experiments",
    sourceIds: ["S1", "S4"],
    relationship: ["Coursework"],
    status: "Completed",
    publicCopy: "C/Python experiments on work splitting, pthread races, cache locality, false sharing, and profiling.",
    contribution: "Implemented and analyzed systems-performance exercises and documented the behavior they exposed.",
    hrefs: [
      { label: "Repository", href: "https://github.com/Yashas120/SSP", kind: "repo" },
      { label: "Demo", href: "/demos#parallel", kind: "demo" },
    ],
    disclosure: "public",
    destinations: ["work-index", "scope"],
    category: "project",
    stack: ["C", "Python", "pthreads", "profiling", "cache locality"],
    domain: "Concurrency and performance",
  },
  {
    id: "project-rdbms",
    title: "Cloud Provisioning using RDBMS",
    sourceIds: ["S1", "S6"],
    relationship: ["Collaborative", "Coursework", "Fork"],
    status: "Completed",
    ownership: "Contribution unverified",
    publicCopy: "Modeled quota-checked cloud-resource allocation with PostgreSQL/PL/pgSQL transactions and an application layer.",
    contribution: "Team/fork relationship is explicit; individual PL/pgSQL, Node, and React ownership remains unclaimed.",
    hrefs: [
      { label: "Repository", href: "https://github.com/Yashas120/Cloud-Provisioning-using-RDBMS", kind: "repo" },
      { label: "Demo", href: "/demos#cloud", kind: "demo" },
    ],
    disclosure: "public",
    destinations: ["work-index", "scope"],
    category: "project",
    stack: ["PostgreSQL", "PL/pgSQL", "transactions", "Node.js", "React"],
    domain: "Database-backed resource allocation",
  },
  {
    id: "project-cloud-hack",
    title: "Cloud-Hack",
    sourceIds: ["S1", "S4", "S6"],
    relationship: ["Collaborative", "Coursework"],
    status: "Completed",
    publicCopy: "Container/orchestration coursework using Docker, Kubernetes, Flask, MongoDB, ConfigMaps, and Secrets.",
    contribution: "Contributed the MongoDB deployment sections; this is course-scale work, not production microservices.",
    hrefs: [{ label: "Repository", href: "https://github.com/Yashas120/Cloud-Hack", kind: "repo" }],
    disclosure: "public",
    destinations: ["work-index", "scope"],
    category: "project",
    stack: ["Docker", "Kubernetes", "Flask", "MongoDB"],
    domain: "Containers and orchestration",
  },
  {
    id: "project-yelp",
    title: "Restaurant Analysis using Yelp",
    sourceIds: ["S1", "S6"],
    relationship: ["Collaborative", "Coursework", "Fork"],
    status: "Completed",
    ownership: "Contribution unverified",
    publicCopy: "Team data-science work on restaurant-closure risk and review-topic analysis.",
    contribution: "The browser demo is an illustrative recreation; it is not a production prediction claim.",
    hrefs: [
      { label: "Repository", href: "https://github.com/Yashas120/Restaurant-analysis-using-YELP-dataset", kind: "repo" },
      { label: "Demo", href: "/demos#yelp", kind: "demo" },
    ],
    disclosure: "public",
    destinations: ["work-index", "scope"],
    category: "project",
    stack: ["Python", "logistic regression", "LDA", "Yelp dataset"],
    domain: "Applied data analysis",
  },
  {
    id: "project-petra",
    title: "Petra",
    sourceIds: ["S1", "S4", "S6"],
    relationship: ["Collaborative", "Fork"],
    status: "Archived",
    publicCopy: "Three-person pet/hotel booking application connecting a React frontend to backend, authentication, and data flows.",
    contribution: "Equal-contribution early full-stack project, retained as an archived learning artifact.",
    hrefs: [
      { label: "Repository", href: "https://github.com/Yashas120/Petra", kind: "repo" },
      { label: "Demo", href: "/demos#petra", kind: "demo" },
    ],
    disclosure: "public",
    destinations: ["work-index"],
    category: "project",
    stack: ["React", "Node.js", "MongoDB", "authentication"],
    domain: "Full-stack systems",
  },
  {
    id: "project-rag-voice",
    title: "Multilingual RAG Voice Assistant",
    sourceIds: ["S1", "S4"],
    relationship: ["Collaborative"],
    status: "Prototype",
    ownership: "Contribution unverified",
    publicCopy: "CPU-only multilingual voice and retrieval prototype for accessing subsidy and relief information; the documented setup took about 20 seconds per query.",
    contribution: "Public artifact and exact individual scope are not currently linked, so neither is overstated.",
    disclosure: "public",
    destinations: ["work-index", "scope"],
    category: "project",
    stack: ["RAG", "speech", "Python", "CPU-only inference"],
    domain: "Applied AI",
  },
  {
    id: "project-portfolio",
    title: "Yashas Kadambi — Six Interfaces portfolio",
    sourceIds: ["S5"],
    relationship: ["Original"],
    status: "Active",
    publicCopy: "Data-driven Next.js portfolio rendering one evidence universe through six domain-native interfaces.",
    contribution: "Designed and built the static-exported interface system, responsive interactions, accessibility paths, and live project explainers.",
    hrefs: [
      { label: "Repository", href: "https://github.com/Yashas120/Yashas120.github.io", kind: "repo" },
      { label: "Demos", href: "/demos/", kind: "demo" },
    ],
    disclosure: "public",
    destinations: ["work-index", "scope"],
    category: "project",
    stack: ["Next.js", "TypeScript", "SVG", "Framer Motion", "static export"],
    domain: "Interface and evidence-system engineering",
  },
  {
    id: "project-packet-photon",
    title: "Packet-to-Photon Lab",
    sourceIds: ["S2"],
    relationship: ["Concept"],
    status: "Concept",
    publicCopy: "An exploration connecting software intent, packet processing, optical modulation, and telemetry.",
    contribution: "Shown as a concept only; no working implementation or shipped status is claimed.",
    disclosure: "public",
    destinations: ["work-index"],
    category: "project",
    stack: ["packet processing", "optical modulation", "telemetry"],
    domain: "Dataplane exploration",
  },
  {
    id: "publication-swift",
    title: "Toward Faster and Efficient Lightweight Image Super-Resolution Using Transformers and Fourier Convolutions",
    sourceIds: ["S8"],
    relationship: ["Research", "Collaborative"],
    status: "Published",
    publicCopy:
      "Vishal Ramesha, Yashas Kadambi, B. S. Abhishek Aditya, T. Vijay Prashant, and S. S. Shylaja. Artificial Intelligence and Applications, vol. 3, no. 2, pp. 168–178, 2025; published online 16 Jan 2024.",
    contribution: "Publisher-listed contribution: conceptualization, software, validation, investigation, data curation, and writing/review.",
    hrefs: [
      { label: "Paper", href: "https://ojs.bonviewpress.com/index.php/AIA/article/view/1930", kind: "paper" },
      { label: "DOI", href: "https://doi.org/10.47852/bonviewAIA42021930", kind: "paper" },
    ],
    disclosure: "public",
    destinations: ["research"],
    category: "publication",
    dates: "Online 2024 · issue 2025",
    domain: "Image super-resolution",
  },
  {
    id: "publication-underwater",
    title: "Monitoring and Alert Systems for Underwater Data Centers using Arduino",
    sourceIds: ["S1", "S9"],
    relationship: ["Research", "Collaborative"],
    status: "Published",
    publicCopy: "Y. Kadambi et al. IEEE CSITSS, 2021. DOI: 10.1109/CSITSS54238.2021.9683449.",
    contribution: "Co-developed and co-authored the embedded monitoring and alerting system; exact proceedings author order remains intentionally unexpanded here.",
    hrefs: [{ label: "DOI", href: "https://doi.org/10.1109/CSITSS54238.2021.9683449", kind: "paper" }],
    disclosure: "public",
    destinations: ["research"],
    category: "publication",
    dates: "2021",
    domain: "Embedded monitoring",
  },
  {
    id: "teaching-ipcv",
    title: "Image Processing & Computer Vision",
    sourceIds: ["S1"],
    relationship: ["Teaching"],
    status: "Completed",
    publicCopy:
      "Created two MATLAB labs and material spanning aerial-image enhancement, sampling and intensity transformations, and LSB steganography; graded ~250 submissions in one week, answered ~50 questions, and ran five two-hour office-hour sessions.",
    disclosure: "public",
    destinations: ["teaching", "scope"],
    category: "teaching",
    dates: "Dec 2022–May 2023 · 122 students",
    stack: ["MATLAB", "computer vision", "image processing"],
  },
  {
    id: "teaching-data-analytics",
    title: "Data Analytics",
    sourceIds: ["S1", "S4"],
    relationship: ["Teaching"],
    status: "Completed",
    publicCopy:
      "Designed a narrative assignment sequence covering Markov chains, absorbing/stationary states, A/B testing and confounding, stochastic processes, and Poisson reasoning; graded ~370 submissions, answered ~150 questions, and ran six two-hour office-hour sessions.",
    details: ["Designed and administered a course Kaggle competition for 494 participants across 178 teams; the unreconciled submission count is intentionally withheld."],
    hrefs: [{ label: "Kaggle competition", href: "https://www.kaggle.com/competitions/data-analytics-ue20cs312", kind: "demo" }],
    disclosure: "public",
    destinations: ["teaching", "scope"],
    category: "teaching",
    dates: "Aug–Dec 2022 · 494 students",
    stack: ["Python", "Markov chains", "experimentation", "evaluation pipelines"],
  },
  {
    id: "teaching-deep-learning",
    title: "Deep Learning Theory & Practices",
    sourceIds: ["S1"],
    relationship: ["Teaching"],
    status: "Completed",
    publicCopy:
      "Selected as an undergraduate TA for a graduate course; authored three assignments on autoencoders and GANs, including staged MNIST 784→64→784, and built a web submission/autograding workflow for all three assignments.",
    disclosure: "public",
    destinations: ["teaching", "scope"],
    category: "teaching",
    dates: "Jul–Dec 2022 · ~40 students",
    stack: ["TensorFlow", "autoencoders", "GANs", "autograding"],
  },
  {
    id: "education-ucsd",
    title: "University of California San Diego · M.S. Computer Science",
    sourceIds: ["S1"],
    relationship: ["Coursework"],
    status: "In development",
    publicCopy: "Incoming September 2026; expected 2027. Intended focus: distributed systems, operating systems, and applied ML.",
    disclosure: "public",
    destinations: ["top", "education"],
    category: "education",
    dates: "Incoming Sep 2026 · expected 2027",
    location: "La Jolla, California",
  },
  {
    id: "education-pes",
    title: "PES University · B.Tech, Computer Science and Engineering",
    sourceIds: ["S1"],
    relationship: ["Coursework"],
    status: "Completed",
    publicCopy: "Aug 2019–May 2023 · credential-evaluated GPA 3.78/4.0 · 124.5 semester credits.",
    disclosure: "public",
    destinations: ["education", "recognition"],
    category: "education",
    dates: "Aug 2019–May 2023",
    location: "Bengaluru, India",
  },
  {
    id: "recognition-mrd",
    title: "Prof. C. N. R. Rao Merit Scholarship",
    sourceIds: ["S1", "S4"],
    relationship: ["Coursework"],
    status: "Completed",
    publicCopy: "Awarded for placing in the top 20% of PES Computer Science and Engineering.",
    disclosure: "public",
    destinations: ["recognition"],
    category: "recognition",
  },
  {
    id: "recognition-publications",
    title: "Two peer-reviewed publications",
    sourceIds: ["S1", "S8", "S9"],
    relationship: ["Research", "Collaborative"],
    status: "Published",
    publicCopy: "Published research in image super-resolution and embedded monitoring systems.",
    disclosure: "public",
    destinations: ["top", "recognition", "research"],
    category: "recognition",
  },
  {
    id: "leadership-mentorship",
    title: "Mentorship and onboarding",
    sourceIds: ["S1"],
    relationship: ["Professional"],
    status: "Completed",
    publicCopy: "Mentored one intern end to end, supported a non-CS apprentice, helped onboard engineers, and created reusable onboarding guidance.",
    disclosure: "public",
    destinations: ["experience", "leadership"],
    category: "leadership",
  },
] satisfies readonly EvidenceRecord[];

export type EvidenceExclusion = {
  id: string;
  title: string;
  sourceIds: string[];
  reason: string;
};

/** Review-only exclusions keep incomplete or private evidence out of public copy. */
export const evidenceExclusions = [
  { id: "fork-sunset", title: "UCSD SunSET fork", sourceIds: ["S1", "S6"], reason: "Public fork visible; substantive personal contribution not substantiated." },
  { id: "fork-tax-calculator", title: "US stocks tax calculator fork", sourceIds: ["S6"], reason: "Fork alone is not substantive portfolio evidence." },
  { id: "project-ooad-blockchain", title: "OOAD Project Blockchain", sourceIds: ["S1"], reason: "Possible duplicate or precursor of Bitcoin Transactions; relationship not confirmed." },
  { id: "recognition-aws", title: "AWS Certified Developer – Associate", sourceIds: ["S1", "S4"], reason: "Credential status, dates, and public credential URL require verification." },
  { id: "recognition-security", title: "Cybersecurity competition placements and community work", sourceIds: ["S1", "S4"], reason: "Event names, dates, denominators, placement wording, and public disclosure require verification." },
  { id: "leadership-executive-shadow", title: "Executive Shadow Program", sourceIds: ["S1"], reason: "Exact public-safe program name and description require verification." },
  { id: "innovation-internal", title: "GenAI dashboard, Sustainathon, and agent-workflow experiments", sourceIds: ["S1"], reason: "Contribution, lifecycle, outcome, and disclosure are not sufficiently verified for public copy." },
] satisfies readonly EvidenceExclusion[];

export const publicEvidence = evidenceRecords.filter((record) => record.disclosure === "public");

export function evidenceById(id: string): EvidenceRecord {
  const record = evidenceRecords.find((candidate) => candidate.id === id);
  if (!record) throw new Error(`Unknown evidence id: ${id}`);
  return record;
}

export function evidenceByCategory(category: EvidenceRecord["category"]): EvidenceRecord[] {
  return publicEvidence.filter((record) => record.category === category);
}
