import { profile } from "@/data/profile";

/**
 * Publication-safe source of truth for /cluster.
 *
 * Keep relationship and status separate. This module deliberately contains no
 * disclosure switches, private-source notes, employer measurements, or draft
 * verification markers: anything imported here is safe to render and bundle.
 */

export type Relationship =
  | "Professional"
  | "Original"
  | "Collaborative"
  | "Coursework"
  | "Research"
  | "Exploration"
  | "Teaching"
  | "Concept"
  | "Planned/In development";

export type EvidenceStatus =
  | "Shipped"
  | "Active"
  | "Archived"
  | "In development"
  | "Concept"
  | "Unknown/requires verification";

export interface PublicLink {
  label: string;
  href: string;
  external?: boolean;
  detail?: string;
}

export const links = {
  github: { label: "GitHub", href: profile.github, external: true } satisfies PublicLink,
  linkedin: { label: "LinkedIn", href: profile.linkedin, external: true } satisfies PublicLink,
  email: { label: "Email", href: "mailto:ykadambi@ucsd.edu" } satisfies PublicLink,
  resume: {
    label: "Résumé",
    href: profile.resume.href,
    external: true,
    detail: "PDF, 2 pages",
  } satisfies PublicLink,
  demos: { label: "Demos", href: "/demos" } satisfies PublicLink,
} as const;

export const proofLinks = [links.resume, links.github, links.linkedin, links.email];

export const hero = {
  eyebrow: "Production systems · Infrastructure · Reliability",
  heading: "I make coordinated systems safer to change.",
  proof:
    "About three years at Cisco across multi-region cloud services and optical line-card software.",
  body:
    "I build, migrate, and debug infrastructure, event flows, databases, deployments, and hardware/software state—then verify that the system converges under real operating constraints.",
  context: "Incoming M.S. Computer Science, UC San Diego · September 2026",
  disclosure: "This is my complete engineering portfolio, ordered through a distributed-systems lens.",
} as const;

export interface StoryScene {
  id: string;
  span: number;
  eyebrow: string;
  heading: string;
  body: string;
  support?: string;
  transcript: string[];
  tone: "paper" | "night";
  visual: "events" | "change" | "reconcile" | "evidence" | "handoff";
}

export const storyScenes: StoryScene[] = [
  {
    id: "identity",
    span: 100,
    eyebrow: hero.eyebrow,
    heading: hero.heading,
    body: hero.body,
    support: hero.proof,
    transcript: [
      "A source service emits an event through managed AWS messaging.",
      "Regional services consume the event and apply corresponding SQL changes.",
      "The topology is illustrative and does not represent employer scale.",
    ],
    tone: "paper",
    visual: "events",
  },
  {
    id: "regional-consequences",
    span: 130,
    eyebrow: "Production · multi-region integration",
    heading: "One event. Regional consequences.",
    body: "Regional services consumed the event and applied corresponding changes to their SQL stores.",
    support:
      "AWS supplied the messaging primitives; my work connected the infrastructure and service boundaries and made the deployment path safer.",
    transcript: [
      "A source service emits a change event.",
      "AWS-managed messaging carries the event across the service boundary.",
      "Regional services consume the event.",
      "Each service applies the corresponding change to its SQL store.",
    ],
    tone: "paper",
    visual: "events",
  },
  {
    id: "change-safely",
    span: 250,
    eyebrow: "Production · safe change",
    heading: "Safe change starts with the dependency graph.",
    body:
      "A deployment plan became safer as infrastructure order, active consumers, database boundaries, and hidden coupling became explicit.",
    support:
      "The recovery changed the procedure: smaller stages, stronger health checks, retained capacity, and verification across the complete dependency path.",
    transcript: [
      "Make order explicit: independent Terraform modules can proceed while dependent work waits for prerequisites.",
      "Discover consumers and owners: observability evidence replaces an assumed dependency map.",
      "Move the database boundary in stages: old and new endpoints coexist while services transition deliberately.",
      "Treat recovery as a design input: a hidden dependency interrupts rollout, diagnosis expands health-check coverage, and the service returns to a verified state.",
    ],
    tone: "paper",
    visual: "change",
  },
  {
    id: "reconcile-state",
    span: 140,
    eyebrow: "Production · platform software",
    heading: "Recovery is complete when state converges.",
    body:
      "Across warm restart, I made desired, observed, and programmed hardware state explicit, then verified that software and the line card returned to agreement.",
    support:
      "Platform bring-up, table-driven programming, secure-boot-aware deployment, validation, test infrastructure, and upgrade diagnosis made that loop operable.",
    transcript: [
      "Before restart, desired, software-observed, and programmed-hardware state agree.",
      "An interruption breaks the software-observed state.",
      "Restart reconstructs state and compares it with desired and programmed state.",
      "Only mismatched state receives corrective programming; the result is explicitly verified.",
    ],
    tone: "night",
    visual: "reconcile",
  },
  {
    id: "public-systems-evidence",
    span: 160,
    eyebrow: "Systems evidence",
    heading: "Public work, with the boundary left intact.",
    body: "Coursework and open code support the lens. They do not become production claims.",
    transcript: [
      "Spark Streaming for Machine Learning: TCP input becomes micro-batch RDD work and incremental classifier updates.",
      "Cloud Provisioning using RDBMS: PostgreSQL models quota- and rack-aware state transitions.",
      "Bitcoin Transactions in Java: keys and signing lead to an educational transaction, with no consensus implementation.",
      "SSP: pthread, perf, and memory-layout coursework; race and cache views are illustrative models.",
    ],
    tone: "paper",
    visual: "evidence",
  },
  {
    id: "story-handoff",
    span: 120,
    eyebrow: "Complete profile",
    heading: "The systems lens is the opening, not the whole record.",
    body:
      "The story above follows the production moments where dependencies, state, and change had to be made explicit. The record below is the complete profile: every professional role, the strongest systems evidence, work beyond this lens, research, teaching, education, recognition, and direct proof.",
    transcript: ["Experience", "Systems", "Beyond", "Research", "Teaching", "Education", "Leadership"],
    tone: "paper",
    visual: "handoff",
  },
];

export const totalStorySpan = storyScenes.reduce((sum, scene) => sum + scene.span, 0);

export interface ExperienceRole {
  id: string;
  org: string;
  role: string;
  dates: string;
  labels: string[];
  summary: string;
  responsibilities: string[];
  note?: string;
}

export const experience: ExperienceRole[] = [
  {
    id: "experience-cisco-optical",
    org: "Cisco",
    role: "Software Engineer II, Optical Systems",
    dates: "2025–2026",
    labels: ["Production · personal contribution", "Platform software"],
    summary:
      "Built and debugged software for a new optical line-card platform, where correctness crossed process, restart, deployment, test, and hardware-programming boundaries.",
    responsibilities: [
      "Supported platform bring-up and pre-hardware validation across optical and client-mode workflows.",
      "Implemented table-driven programming and CDR integration while keeping desired, observed, and programmed state explicit.",
      "Made state recovery safer across warm restart and verified that software and hardware converged after interruption.",
      "Built secure-boot-aware deployment, validation, logging, and test automation; diagnosed upgrade and FPGA/FPD failure paths.",
      "Developed CMocka-based test infrastructure, a PM-analysis prototype, and documentation that made repeatable diagnosis easier.",
    ],
    note: "Public product documentation establishes platform capability; this entry describes only my approved contribution.",
  },
  {
    id: "experience-cisco-backend-cloud",
    org: "Cisco",
    role: "Software Engineer, Backend & Cloud",
    dates: "2023–2025",
    labels: ["Production · personal contribution", "Multi-region cloud"],
    summary:
      "Engineered infrastructure and service changes across regions, accounts, managed messaging, SQL stores, deployment dependencies, and operational ownership.",
    responsibilities: [
      "Built reusable Terraform modules and made resource dependencies explicit so deployments followed a safer order.",
      "Integrated managed AWS event paths across regional services. Regional services consumed the event and applied corresponding changes to their SQL stores.",
      "Used observability data to discover consumers and owners before migration, replacing an assumed dependency graph with an evidenced one.",
      "Supported a staged database cutover that kept old and new stores available during an evidence-driven endpoint transition.",
      "Investigated application/database performance, diagnosed hidden coupling during rollout, and strengthened health checks and release procedure before recovery.",
      "Contributed to entitlement operations, authentication modernization, gateway and legacy-environment migration, authorization/security response, cross-repository logging, dependency/lifecycle compatibility, and cross-platform developer fixes.",
      "Built internal prototypes and engineering tooling, documented operational paths, and mentored and onboarded teammates.",
    ],
    note: "AWS supplied the messaging primitives; my work connected the infrastructure and service boundaries and made the deployment path safer.",
  },
  {
    id: "experience-cisco-px-cloud",
    org: "Cisco",
    role: "Technical Intern, PX Cloud",
    dates: "Jan–Jul 2023",
    labels: ["Professional internship", "Automation + backend"],
    summary:
      "Automated contract-driven SDK delivery and contributed to cloud-platform API, data-pipeline, documentation, and developer-environment work.",
    responsibilities: [
      "Connected API-contract changes to CI generation and publication of an SDK.",
      "Improved OpenAPI documentation and Java API/filtering behavior, including a production-defect correction.",
      "Built an AWS Glue data-path proof of concept and improved local development with Colima.",
    ],
    note: "The Glue work was a PoC, not a claimed production pipeline.",
  },
  {
    id: "experience-schneider",
    org: "Schneider Electric",
    role: "Summer Intern",
    dates: "Jun–Aug 2022",
    labels: ["Internal tool · deployed", "Independent ownership"],
    summary:
      "Independently built and deployed a Python/Tkinter decision-support tool that converted Excel-backed dependencies into repeatable test-plan guidance.",
    responsibilities: [
      "Owned the workflow from requirements and data model through interface, test-plan generation, deployment, and handoff.",
      "Reduced a multi-step manual planning workflow without publishing employer-specific timing claims.",
    ],
  },
];

export interface EvidenceItem {
  name: string;
  relationship: Relationship;
  status: EvidenceStatus;
  labels: string[];
  description: string;
  boundary?: string;
  contribution: string;
  domain: string;
  links: PublicLink[];
}

export const featuredSystems: EvidenceItem[] = [
  {
    name: "Spark Streaming for Machine Learning",
    relationship: "Coursework",
    status: "Archived",
    labels: ["Coursework · team", "Collaborative contribution"],
    description:
      "A four-person course project that streamed CIFAR-10 batches from a TCP producer into Spark Streaming. DStreams were processed per RDD and used for incremental classifier updates, with MLP, SVM, K-means, and deep-feature variants in the repository.",
    boundary:
      "The inspected default is local and the MLP path collects columns to the driver before partial_fit. No multi-worker training claim is made.",
    contribution: "Four-person team; contributed to the streaming, training, and batch-size analysis workflow.",
    domain: "Distributed data / ML",
    links: [
      {
        label: "Source repository",
        href: "https://github.com/Yashas120/SSML-spark-streaming-for-machine-learning",
        external: true,
      },
    ],
  },
  {
    name: "Cloud Provisioning using RDBMS",
    relationship: "Coursework",
    status: "Archived",
    labels: ["Coursework · team", "Collaborative contribution"],
    description:
      "A course project modeling project, zone, rack, quota, and VM state transitions in PostgreSQL functions and procedures, with a Node and React application boundary.",
    boundary:
      "This course project modeled quota- and rack-aware resource allocation in PostgreSQL; it was not a production cloud provider.",
    contribution: "Contributed to the team project and its database-backed allocation workflow.",
    domain: "Databases / cloud",
    links: [
      {
        label: "Source repository",
        href: "https://github.com/Yashas120/Cloud-Provisioning-using-RDBMS",
        external: true,
      },
    ],
  },
  {
    name: "Bitcoin Transactions in Java",
    relationship: "Original",
    status: "Archived",
    labels: ["Public repository · original", "Protocol / crypto foundations"],
    description:
      "An educational Java implementation of core transaction primitives: SHA-256, RIPEMD-160, elliptic-curve operations, wallet/address generation, testnet transaction construction, and signing.",
    boundary:
      "This Java project implements transaction and cryptographic primitives; it does not implement Bitcoin consensus.",
    contribution: "Original public repository; solo status is not independently established.",
    domain: "Protocol / security",
    links: [
      {
        label: "Source repository",
        href: "https://github.com/Yashas120/Bitcoin-Transactions-in-java",
        external: true,
      },
    ],
  },
  {
    name: "SSP",
    relationship: "Coursework",
    status: "Archived",
    labels: ["Systems-performance coursework", "Public repository · original"],
    description:
      "Assignments exploring pthread creation, parallel work division, perf-based cache and branch observation, and multidimensional memory traversal.",
    boundary:
      "SSP remains the canonical repository name. The browser race is a what-if model, and cache outcomes are illustrative rather than guaranteed hardware misses.",
    contribution: "Original repository; individual/team status is unresolved.",
    domain: "Systems performance",
    links: [
      { label: "Source repository", href: "https://github.com/Yashas120/SSP", external: true },
    ],
  },
];

export const beyondLens: EvidenceItem[] = [
  {
    name: "SWIFT · efficient image super-resolution",
    relationship: "Research",
    status: "Archived",
    labels: ["Research · co-authored", "Collaborative contribution"],
    description:
      "Co-authored research combining SwinV2-style transformer blocks and frequency-domain components for lightweight single-image super-resolution. Comparisons are paper/team-reported, not personal production metrics.",
    contribution: "One of five co-authors; exact personal scope is unresolved.",
    domain: "ML / computer vision",
    links: [
      { label: "Publication DOI", href: "https://doi.org/10.47852/bonviewAIA42021930", external: true },
      { label: "Source repository", href: "https://github.com/Yashas120/SWIFT", external: true },
    ],
  },
  {
    name: "Multiview 3D Reconstruction",
    relationship: "Original",
    status: "Archived",
    labels: ["Public repository · original", "Collaboration unresolved"],
    description:
      "An incremental sparse structure-from-motion implementation using feature matching, epipolar geometry, triangulation, PnP, and bundle adjustment.",
    boundary: "Dense multiview reconstruction was future work; this is not labeled as a solo project.",
    contribution: "Original repository; collaboration is unresolved.",
    domain: "Computer vision",
    links: [
      {
        label: "Source repository",
        href: "https://github.com/Yashas120/Multiview-3D-Reconstruction",
        external: true,
      },
    ],
  },
  {
    name: "ChocoLLVM",
    relationship: "Coursework",
    status: "Archived",
    labels: ["Compiler-design coursework", "Contributed implementation"],
    description:
      "A compiler frontend lowering a ChocoPy subset to readable LLVM IR, with parse, typecheck, Python, LLVM, and test modes.",
    boundary: "The browser experience is a simplified derived explainer; the project is not labeled solo.",
    contribution: "Contributed to the compiler-design coursework implementation and its supported compiler pipeline.",
    domain: "Compilers",
    links: [
      { label: "Source repository", href: "https://github.com/Yashas120/chocollvm", external: true },
    ],
  },
  {
    name: "Yelp Restaurant Analysis",
    relationship: "Collaborative",
    status: "Archived",
    labels: ["Data coursework · team", "Collaborative contribution"],
    description:
      "A notebook-based analysis of check-ins, reviews, and amenities to identify restaurants at risk of closure and explore improvement signals.",
    boundary: "The browser demo's seeded logistic regression is separate from the original notebooks.",
    contribution: "Contributed to the collaborative course analysis; narrower personal scope is not documented here.",
    domain: "Data / ML",
    links: [
      {
        label: "Source repository",
        href: "https://github.com/Yashas120/Restaurant-analysis-using-YELP-dataset",
        external: true,
      },
    ],
  },
  {
    name: "Petra",
    relationship: "Coursework",
    status: "Archived",
    labels: ["Coursework · three-person team", "Equal contributor"],
    description:
      "A React and Express/MongoDB pet-care booking application with authentication boundaries. It is a historical project, not a current live deployment.",
    contribution: "Three-person team with equal contribution.",
    domain: "Web / backend",
    links: [
      { label: "Source repository", href: "https://github.com/Yashas120/Petra", external: true },
    ],
  },
];

const repo = (label: string, href: string): PublicLink => ({ label, href, external: true });

export const publications = [
  {
    title: "Toward Faster and Efficient Lightweight Image Super-Resolution Using Transformers and Fourier Convolutions",
    meta: "Co-authored research · online 2024 / issue 2025",
    description:
      "A collaborative study of a lightweight super-resolution architecture. Any parameter or inference comparison is attributed to the paper and team.",
    link: repo("Publication DOI", "https://doi.org/10.47852/bonviewAIA42021930"),
  },
  {
    title: "Monitoring and Alert Systems for Underwater Data Centers using Arduino",
    meta: "Co-authored · IEEE, 2021",
    description:
      "An Arduino-based prototype and paper exploring environmental monitoring and alerting for underwater data-center concepts.",
    link: repo("Publication DOI", "https://doi.org/10.1109/CSITSS54238.2021.9683449"),
  },
];

export const teaching = [
  "Teaching Assistant · Image Processing & Computer Vision · 122 students · Dec 2022–May 2023",
  "Teaching Assistant · Data Analytics · 494 students and a 178-team Kaggle component · Aug–Dec 2022",
  "Teaching Assistant · Graduate Deep Learning · about 40 students · Jul–Dec 2022",
];

export const education = [
  {
    institution: "University of California San Diego",
    degree: "M.S. Computer Science · incoming September 2026 · expected 2027",
    detail: "Planned focus: distributed systems, operating systems, and applied machine learning.",
  },
  {
    institution: "PES University",
    degree: "B.Tech. Computer Science · 2019–2023",
    detail: "Completed undergraduate foundation in computer science and engineering.",
  },
];

export const leadership = [
  {
    title: "Mentorship and operational enablement",
    detail:
      "Mentored and onboarded teammates; improved documentation and repeatable development, validation, and operational paths.",
  },
];

export const scopeBands = [
  {
    title: "Cloud and backend systems",
    detail:
      "Terraform, AWS-managed messaging integration, Java services and APIs, SQL stores, deployment dependencies, cutovers, authentication and gateway work, and observability.",
  },
  {
    title: "Platform and hardware-facing software",
    detail:
      "C and C++, line-card bring-up, CDR and table-driven programming, desired/observed/programmed state, warm restart, secure-boot-aware deployment, validation, and test infrastructure.",
  },
  {
    title: "Systems foundations",
    detail:
      "Linux scheduling and performance study, pthread and perf coursework, Spark Streaming coursework, PostgreSQL allocation modeling, transaction cryptography, and compiler lowering.",
  },
  {
    title: "ML, computer vision, and technical communication",
    detail:
      "Super-resolution research, multiview reconstruction, analytics, three teaching appointments, publications, and mentorship.",
  },
];

export const contact = {
  heading: "Let's talk about systems that have to change safely.",
  body:
    "I'm interested in production systems, infrastructure, platform software, reliability, and the mechanisms that make complex change understandable.",
};
