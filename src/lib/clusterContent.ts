import { profile } from "@/data/profile";

// Typed content for /cluster. The animation carries abstract distributed-systems
// mechanisms; this copy stays first-person, literal and evidence-bound.
//
// Accuracy boundaries observed throughout: no consensus/Raft/Paxos, no leader
// election, no replication protocol or database engine, no sharding, no
// exactly-once processing, no Kubernetes operator, no custom broker, no
// production Spark platform or cloud provider.

export const links = {
  github: profile.github,
  email: `mailto:${profile.email}`,
  emailPlain: profile.email,
  linkedin: profile.linkedin,
};

/* ---------------- disclosure review ---------------- */

/**
 * Sensitive employer scale figures are held behind an explicit review flag.
 * Until `approved` is flipped to true, the public-safe `fallback` is rendered.
 * `exact` is never displayed while `approved` is false.
 */
export interface Disclosure {
  approved: boolean;
  exact: string[];
  fallback: string;
  /** Internal reviewer note. Never rendered. */
  note?: string;
}

export function disclose(d: Disclosure): string[] {
  return d.approved ? d.exact : [d.fallback];
}

/* ---------------- hero ---------------- */

export const hero = {
  eyebrow: "Distributed systems · Infrastructure · Reliability",
  name: profile.shortName,
  statement: "I build and debug systems where correctness depends on coordination.",
  body:
    "My production work spans multi-region AWS infrastructure, asynchronous event flows, dependency-aware deployments, live database migration, consumer discovery, and hardware/software state reconciliation. I am entering UC San Diego's M.S. in Computer Science to deepen that foundation in distributed systems and operating systems.",
  evidence: [
    "Cross-region event propagation",
    "Dependency-aware deployment",
    "Live-system migration",
    "State reconciliation",
    "Linux performance",
  ],
};

/* ---------------- cinematic scenes ---------------- */

export interface SceneCopy {
  id: string;
  /** Role label, or project category. */
  kicker: string;
  heading: string;
  /** Primary copy. */
  body: string;
  /** Secondary paragraph. */
  support?: string;
  /** Literal architecture path, rendered in mono. */
  arch?: string;
  /** At most three contribution details. */
  highlights: string[];
  /** Sensitive figures behind disclosure review. */
  scale?: Disclosure;
  /** Visible ownership label (projects, proofs of concept). */
  ownership?: string;
  repo?: string;
  stack?: string;
  /** "inverted" flips the canvas for one high-impact chapter. */
  tone?: "base" | "inverted";
}

const BACKEND_ROLE = "Cisco Systems · Software Engineer, Backend & Cloud Platforms · 2023–2025";
const OPTICAL_ROLE = "Cisco Systems · Optical Software Development Engineer II · 2025–2026";
const INTERN_ROLE = "Cisco Systems · Software Development / Technical Intern · Jan–Jul 2023";

export const scenes: SceneCopy[] = [
  {
    id: "events",
    tone: "inverted",
    kicker: BACKEND_ROLE,
    heading: "One change, propagated across regions",
    body:
      "I worked on the Terraform and service integration for an asynchronous cross-region workflow: a DynamoDB insert published an SNS notification, SNS fanned the event out to regional SQS queues, and region-specific services consumed the event and synchronized related SQL databases.",
    support:
      "The workflow let one source event drive downstream regional updates without encoding the system as one long synchronous service chain.",
    arch: "DynamoDB → SNS → regional SQS queues → regional services → SQL databases",
    highlights: [
      "Connected infrastructure and service dependencies across DynamoDB, SNS, SQS, regional consumers, and databases.",
      "Worked through cross-region networking, IAM, service dependencies, and bring-up order.",
      "Integrated event-triggered backend paths across independently deployed components.",
    ],
  },
  {
    id: "backend",
    kicker: BACKEND_ROLE,
    heading: "Parallelize what is independent. Gate what is not.",
    body:
      "I built and maintained reusable Terraform components across EC2, ECS, Lambda, RDS, DynamoDB, SQS, SNS, and IAM, while serving as a technical contact for shared infrastructure, cross-region communication, networking, and dependency ordering.",
    support:
      "I separated independent resources and services from prerequisite-bound stages so safe work could execute concurrently, preserving deployment order while reducing overall deployment time.",
    highlights: [
      "Deployment time reduced by approximately 50%.",
      "Parallel database bring-up across three regions saved approximately four hours in applicable deployments.",
      "Technical contact for shared modules, cross-region communication, and dependency ordering.",
    ],
    scale: {
      approved: false,
      note: "Cisco estate figures — hold until cleared for public disclosure.",
      exact: [
        "Approximately 50 backend services, 35 Lambda functions and four databases.",
        "Three AWS accounts across three geographic regions.",
        "Approximately 40 engineers supported through shared modules, guidance, or migration coordination.",
      ],
      fallback: "A multi-service, multi-account, multi-region AWS estate.",
    },
  },
  {
    id: "discovery",
    kicker: BACKEND_ROLE,
    heading: "The dependency map was in the traffic",
    body:
      "I used Splunk traffic analysis to identify the systems actually consuming affected APIs, instead of relying only on incomplete ownership and configuration records.",
    support:
      "The analysis connected active integrations to their owning teams before authentication and API-gateway changes reached production.",
    highlights: [
      "Used production traffic analysis rather than trusting configuration records alone.",
      "Supported deployment-controlled feature flags and staged validation.",
      "Helped migrate consumers ahead of the production cutover.",
    ],
    scale: {
      approved: false,
      note: "Cisco traffic/integration figures — hold until cleared for public disclosure.",
      exact: [
        "Approximately 30 integrations across 12 teams, in a service estate handling approximately 500,000 API calls per day.",
        "96 staging and production endpoint deployments.",
        "Production cutover completed without customer impact.",
      ],
      fallback:
        "Used production traffic analysis to discover undocumented consumers across dozens of services and integrations, then supported staged, deployment-controlled migration without customer impact.",
    },
  },
  {
    id: "cutover",
    kicker: BACKEND_ROLE,
    heading: "Move the state before moving the traffic",
    body:
      "I contributed the analysis and migration approach for replacing a database without taking the existing system offline. The old database stayed available while the replacement was created, transaction logs synchronized the new state, services moved through a coordinated cutover, and the old database was removed only after traffic had shifted.",
    support: "The correction completed without customer-visible downtime.",
    highlights: [
      "Kept the existing database serving while its replacement was built.",
      "Used transaction logs to synchronize state before any traffic moved.",
      "Removed the old database only after the cutover had settled.",
    ],
  },
  {
    id: "rollout",
    kicker: BACKEND_ROLE,
    heading: "“Microservice” did not mean independent",
    body:
      "I diagnosed a production failure caused by a non-obvious deployment order and hidden dependencies in global URLs and load-balancer behavior. I traced deployment YAML, service routing, and previous-versus-current logs to find where the environment diverged.",
    support:
      "The resulting rollout process introduced smaller staged changes, retained old pods until replacements became stable, added health-check APIs, verified the complete dependency stack, and used safer timeout margins.",
    highlights: [
      "Traced hidden load-balancer and deployment-order coupling between services.",
      "Retained old pods until replacements passed health checks.",
      "Verified the full dependency stack before shifting traffic.",
    ],
  },
  {
    id: "reconcile",
    kicker: OPTICAL_ROLE,
    heading: "Desired state versus programmed state",
    body:
      "I designed the core state-reconciliation logic used during optical line-card warm reloads. The software compared desired state in its database with resources already programmed in hardware, preserved matching resources to avoid unnecessary teardown, and triggered corrective programming when the states diverged.",
    support:
      "I generalized the data model so later feature modes could supply their own state representation without repeatedly modifying the highest-risk reconciliation algorithm.",
    highlights: [
      "Preserved matching resources instead of tearing down and reprogramming.",
      "Triggered corrective programming only where the two states diverged.",
      "Co-authored a CMocka white-box framework (122 source files against ~430 stubbed SDK boundaries) that cut the hardware-independent build cycle from ~30 minutes to ~10 seconds.",
    ],
    scale: {
      approved: false,
      note: "Cisco validation-scale figures — hold until cleared for public disclosure.",
      exact: [
        "Approximately 10 million exhaustive configurations, with approximately 24,000 essential regression configurations.",
        "Approximately two minutes per manual warm reload — roughly 800 hours of sequential execution for one complete manual pass.",
        "Five corner cases found during development.",
      ],
      fallback:
        "Validated across millions of configurations with a representative regression set in the tens of thousands; automation found five corner cases during development.",
    },
  },
  {
    id: "pipeline",
    kicker: INTERN_ROLE,
    ownership: "Proof of concept",
    heading: "From object arrival to queryable state",
    body:
      "I developed a Python AWS Glue proof of concept in which an S3/data-lake event triggered filtering and enrichment before the processed data was loaded into DynamoDB for a new backend data path.",
    arch: "Data lake → S3 event → Python/AWS Glue → filtering and enrichment → DynamoDB",
    highlights: [
      "Event-triggered filtering and enrichment ahead of the load step.",
      "Built the complete GitHub Actions workflow that regenerated and published Python and Java client SDKs when Swagger/OpenAPI contracts changed, replacing roughly four hours of manual work per SDK.",
    ],
    scale: {
      approved: false,
      note: "Cisco data-volume figure — hold until cleared for public disclosure.",
      exact: ["Processed approximately 500 GB at an expected weekly cadence."],
      fallback: "Ran at an expected weekly cadence over a large data-lake object set.",
    },
  },
  {
    id: "ghost",
    kicker: "Systems-performance project",
    ownership: "Individual project",
    heading: "Performance analysis of the Google ghOSt scheduler",
    body:
      "I built and instrumented a Linux environment around Google's ghOSt framework to compare user-space scheduling policies with conventional kernel schedulers under representative storage and backend workloads.",
    highlights: [
      "Built a custom kernel and ghOSt-compatible environment.",
      "Compared CFS and FIFO with ghOSt policies including Shinjuku, on RocksDB and a backend-server workload.",
      "Varied 16/32-thread and 16/32-GB configurations under bursty and sustained load.",
    ],
    stack: "Linux kernel · ghOSt · C/C++ · RocksDB · scheduling · benchmarking",
  },
  {
    id: "streaming",
    kicker: "Big-data project",
    ownership: "Team project · public fork",
    repo: "https://github.com/Yashas120/SSML-spark-streaming-for-machine-learning",
    heading: "Streaming machine learning with Apache Spark",
    body:
      "I worked on a distributed streaming machine-learning pipeline that moved CIFAR-10 image batches through Kafka/Python components, used Spark/PySpark as the distributed processing layer, and connected the data path to TensorFlow/Keras training.",
    highlights: [
      "Structured the system around streaming, orchestration, data loading, and training components.",
      "Worked with TensorFlowOnSpark, SparkDL, and TensorFrames.",
      "Examined batch size as an experimental variable affecting precision and accuracy.",
    ],
    stack: "Spark · PySpark · Kafka · Hadoop · TensorFlow · Keras",
  },
  {
    id: "provisioning",
    kicker: "Transactional systems project",
    ownership: "Team project · public fork",
    repo: "https://github.com/Yashas120/Cloud-Provisioning-using-RDBMS",
    heading: "Cloud provisioning using an RDBMS",
    body:
      "I worked on a database-backed cloud-allocation system that represented hardware inventory, zones, projects, users, quotas, costs, and virtual-machine lifecycle state.",
    highlights: [
      "Used PostgreSQL and PL/pgSQL for hardware-availability checks and quota enforcement.",
      "Modeled concurrency-sensitive VM create and delete operations.",
      "Used transactions, triggers, roles, and access controls to maintain lifecycle consistency.",
    ],
    stack: "PostgreSQL · PL/pgSQL · transactions · triggers · Node.js · React",
  },
  {
    id: "now",
    kicker: "Now",
    heading: "University of California San Diego · M.S. Computer Science",
    body:
      "Incoming September 2026. Planned focus: distributed systems, operating systems, and applied machine learning — building on the systems coursework I completed at PES University.",
    highlights: [
      "Distributed Systems (A−) · Cloud Computing (A−) · Operating Systems (A−)",
      "Software and Systems Performance (A) · Computer Architecture (A)",
      "Computer Networks (A−) · Database Management Systems (A−)",
    ],
  },
];

export const contact = {
  kicker: "Contact",
  heading: "Let's build reliable systems.",
  body: "Open to distributed systems, infrastructure, and systems engineering roles.",
};

/* ---------------- evidence index ---------------- */

export interface EvidenceRole {
  org: string;
  role: string;
  dates: string;
  location: string;
  points: string[];
}

export const evidenceExperience: EvidenceRole[] = [
  {
    org: "Cisco Systems",
    role: "Optical Software Development Engineer II",
    dates: "2025 – 2026",
    location: "Bengaluru, India",
    points: [
      "Designed the core state-reconciliation logic for optical line-card warm reloads, comparing desired state in the database against resources already programmed in hardware.",
      "Generalized the reconciliation data model so later feature modes could supply their own state representation without changing the highest-risk algorithm.",
      "Co-authored a CMocka-based white-box test framework compiling 122 production source files against approximately 430 stubbed SDK boundaries, reducing the hardware-independent build cycle from approximately 30 minutes to approximately 10 seconds (about 99.4%). The framework became mandatory for newly added code.",
      "Built software for the line cards on the Cisco NCS 1014 series.",
      "Validated across millions of configurations with a representative regression set in the tens of thousands; automation found five corner cases during development.",
    ],
  },
  {
    org: "Cisco Systems",
    role: "Software Engineer, Backend & Cloud Platforms",
    dates: "2023 – 2025",
    location: "Bengaluru, India",
    points: [
      "Worked on Terraform and service integration for an asynchronous cross-region workflow: DynamoDB → SNS → regional SQS queues → regional services → SQL databases.",
      "Built and maintained reusable Terraform components across EC2, ECS, Lambda, RDS, DynamoDB, SQS, SNS, and IAM.",
      "Separated independent resources from prerequisite-bound stages, reducing deployment time by approximately 50%; parallel database bring-up across three regions saved approximately four hours in applicable deployments.",
      "Used Splunk traffic analysis to discover the systems actually consuming affected APIs, then supported staged, deployment-controlled migration without customer impact.",
      "Contributed the analysis and migration approach for replacing a database without downtime, using transaction-log synchronization and a coordinated cutover.",
      "Diagnosed a production failure caused by deployment order and hidden global-URL and load-balancer dependencies; helped introduce staged rollout, health-check APIs, and safer timeout margins.",
      "Improved database performance across PostgreSQL, MongoDB, and Cassandra.",
      "Traffic analysis and production monitoring with Splunk and AppDynamics.",
      "Scope: a multi-service, multi-account, multi-region AWS estate.",
    ],
  },
  {
    org: "Cisco Systems",
    role: "Software Development / Technical Intern",
    dates: "Jan – Jul 2023",
    location: "Bengaluru, India",
    points: [
      "Developed a Python AWS Glue proof of concept where an S3/data-lake event triggered filtering and enrichment before loading into DynamoDB. It ran at an expected weekly cadence over a large data-lake object set.",
      "Built the complete GitHub Actions workflow that regenerated and published Python and Java client SDKs when Swagger/OpenAPI contracts changed, replacing approximately four hours of manual work per SDK across roughly 200 API operations.",
    ],
  },
];

export interface EvidenceProject {
  title: string;
  ownership: string;
  detail: string;
  tech: string[];
  href?: string;
}

/** Smaller projects, kept out of the cinematic narrative. */
export const supportingProjects: EvidenceProject[] = [
  {
    title: "Cloud-Hack",
    ownership: "Cloud-native coursework",
    detail:
      "Deployed a Flask/MongoDB application through Docker and Kubernetes using Deployments, Services, ConfigMaps, Secrets, and explicit service discovery.",
    tech: ["Docker", "Kubernetes", "Flask", "MongoDB"],
    href: "https://github.com/Yashas120/Cloud-Hack",
  },
  {
    title: "Bitcoin transactions from scratch",
    ownership: "Independent protocol implementation",
    detail:
      "Implemented hashing, secp256k1 elliptic-curve operations, ECDSA signing, P2PKH scripts, transaction serialization, and testnet broadcast without external cryptography dependencies for the core primitives.",
    tech: ["Java", "secp256k1", "ECDSA"],
    href: "https://github.com/Yashas120/Bitcoin-Transactions-in-java",
  },
  {
    title: "Systems and parallel programming",
    ownership: "Coursework repository",
    detail:
      "Focused C and Python experiments around threads, shared state, parallel computation, profiling, cache behavior, and memory locality.",
    tech: ["C", "Python", "threads", "profiling"],
    href: "https://github.com/Yashas120/SSP",
  },
];

/** Deliberately de-emphasized on this endpoint. */
export const additionalWork = [
  "SWIFT — lightweight image super-resolution (Swin-Transformer + Fast Fourier Convolution). Artificial Intelligence and Applications, 2025, published online in 2024.",
  "Monitoring and alert systems for underwater data centers (IEEE CSITSS, 2021).",
  "Multiview 3D reconstruction — incremental structure-from-motion pipeline.",
  "Teaching assistant for three computer science courses at PES University.",
  "Schneider Electric — switchgear test-planning tool, summer internship, 2022.",
];

export const education = {
  current: "University of California San Diego · M.S. Computer Science · Incoming September 2026",
  focus: "Planned focus: distributed systems, operating systems, and applied machine learning.",
  prior: "B.Tech in Computer Science, PES University. U.S.-equivalent GPA: 3.78/4.00, based on a credential evaluation.",
  coursework: [
    "Distributed Systems — A−",
    "Cloud Computing — A−",
    "Software and Systems Performance — A",
    "Operating Systems — A−",
    "Computer Networks — A−",
    "Database Management Systems — A−",
    "Computer Architecture — A",
  ],
};

export const skills = [
  {
    label: "Distributed communication",
    items: ["SNS", "SQS", "Kafka", "asynchronous event flow", "fan-out", "cross-region service integration"],
  },
  {
    label: "Infrastructure and deployment",
    items: ["AWS", "Terraform", "EC2", "ECS", "Lambda", "RDS", "DynamoDB", "IAM", "Docker", "Kubernetes", "CI/CD", "dependency sequencing"],
  },
  {
    label: "State and data",
    items: ["PostgreSQL", "MongoDB", "Cassandra", "DynamoDB", "transaction logs", "PL/pgSQL", "transactions", "triggers", "state reconciliation"],
  },
  {
    label: "Runtime and performance",
    items: ["Linux", "ghOSt", "RocksDB", "C", "C++", "Java", "Python", "scheduling", "concurrency", "profiling"],
  },
  {
    label: "Reliability and observability",
    items: ["Splunk", "AppDynamics", "health checks", "staged rollout", "consumer discovery", "root-cause analysis", "deployment safety"],
  },
];
