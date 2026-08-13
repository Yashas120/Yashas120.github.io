/**
 * Canonical, serializable project-to-demo evidence.
 *
 * Route components must resolve demos through `projectDemoEvidence()` or
 * `demoEvidence()` instead of restating ownership, contribution, or fidelity.
 * The original project, Yashas's contribution, and this portfolio's browser
 * implementation intentionally remain separate fields.
 */

export type DemoId =
  | "ghost"
  | "bitcoin"
  | "chocollvm"
  | "swift"
  | "multiview"
  | "cifar"
  | "parallel"
  | "cloud"
  | "yelp"
  | "petra";

export type DemoFidelity =
  | "live-computation"
  | "browser-port"
  | "synthetic-live-computation"
  | "in-memory-simulation"
  | "interactive-explainer"
  | "precomputed-model-output";

export type DemoOwnership =
  | "original"
  | "collaborative"
  | "coursework"
  | "fork"
  | "research";

export type ProjectDemoEvidence = {
  projectId: string;
  demoId?: DemoId;
  ownership: DemoOwnership;
  status: "completed" | "active" | "archived";
  fidelity?: DemoFidelity;
  contribution: string;
  projectSourceHref?: string;
  upstreamHref?: string;
  browserImplementationHref?: string;
  warning?: string;
};

export type ProjectDemoRecord = ProjectDemoEvidence & {
  demoId: DemoId;
  anchorId: string;
  projectTitle: string;
  browserRuns: string;
  simplification: string;
};

const browserSource = (file: string) =>
  `https://github.com/Yashas120/Yashas120.github.io/blob/main/src/components/demos/${file}`;

export const PROJECT_DEMO_EVIDENCE: readonly ProjectDemoRecord[] = [
  {
    projectId: "ghost-scheduler",
    demoId: "ghost",
    anchorId: "project-ghost-scheduler",
    projectTitle: "Performance Analysis of the ghOSt Scheduler",
    ownership: "coursework",
    status: "completed",
    fidelity: "interactive-explainer",
    contribution: "Rebuilt and configured Linux for ghOSt, prepared kernel-only and user-space scheduling configurations, ran controlled RocksDB experiments, and analyzed scheduler performance.",
    browserRuns: "An architecture and methodology explainer covering the kernel/user-space control loop, implementation sequence, scheduler matrix, and RocksDB testing procedure.",
    simplification: "Linux, ghOSt, RocksDB, and the original benchmarks do not run in the browser. This page documents the implementation and test design without simulating output or publishing unverified measurements.",
    upstreamHref: "https://github.com/google/ghost-userspace",
    browserImplementationHref: browserSource("GhostDemo.tsx"),
  },
  {
    projectId: "bitcoin-java",
    demoId: "bitcoin",
    anchorId: "project-bitcoin",
    projectTitle: "Bitcoin Transactions in Java",
    ownership: "original",
    status: "completed",
    fidelity: "browser-port",
    contribution: "Implemented the original Java cryptographic and transaction pipeline from primitives through signed educational transactions.",
    browserRuns: "A TypeScript browser reimplementation of the Java project with real educational SHA-256, secp256k1, ECDSA, serialization, and proof-of-work computation.",
    simplification: "This is an educational protocol implementation, not wallet software or a connection to Bitcoin consensus or mainnet.",
    projectSourceHref: "https://github.com/Yashas120/Bitcoin-Transactions-in-java",
    browserImplementationHref: browserSource("BitcoinDemo.tsx"),
    warning: "Educational keys only. Never fund, import or reuse a key displayed by this demo.",
  },
  {
    projectId: "chocollvm",
    demoId: "chocollvm",
    anchorId: "project-chocollvm",
    projectTitle: "ChocoLLVM",
    ownership: "fork",
    status: "completed",
    fidelity: "browser-port",
    contribution: "The public repository is a coursework fork. Its visible fork history does not substantiate an individual module contribution, so none is claimed here.",
    browserRuns: "A TypeScript browser compiler pipeline for the demo's supported ChocoPy subset, including lexing, parsing, validation, and LLVM IR generation.",
    simplification: "The browser port supports a documented subset and does not run the original Python/llvmlite compiler or LLVM lli runtime.",
    projectSourceHref: "https://github.com/Yashas120/chocollvm",
    upstreamHref: "https://github.com/anihm136/chocollvm",
    browserImplementationHref: browserSource("ChocoLLVMDemo.tsx"),
  },
  {
    projectId: "swift",
    demoId: "swift",
    anchorId: "project-swift",
    projectTitle: "SWIFT — Lightweight Image Super-Resolution",
    ownership: "research",
    status: "completed",
    fidelity: "precomputed-model-output",
    contribution: "Co-authored the research and contributed to the architecture, implementation, and evaluation represented by the official public repository.",
    browserRuns: "An interactive architecture explainer with illustrative and precomputed model-output comparisons.",
    simplification: "The trained PyTorch SWIFT model is not running in the browser; the browser does not claim live neural-network inference.",
    projectSourceHref: "https://github.com/Yashas120/SWIFT",
    upstreamHref: "https://github.com/iVishalr/SWIFT",
    browserImplementationHref: browserSource("SwiftDemo.tsx"),
  },
  {
    projectId: "multiview-3d",
    demoId: "multiview",
    anchorId: "project-multiview",
    projectTitle: "Multiview 3D Reconstruction",
    ownership: "original",
    status: "completed",
    fidelity: "synthetic-live-computation",
    contribution: "Implemented the public incremental Structure-from-Motion pipeline using traditional computer-vision geometry.",
    browserRuns: "Synthetic two-view geometry, correspondence, epipolar constraints, and triangulation computed live in the browser.",
    simplification: "The repository implements a broader real-image SfM pipeline with feature extraction, PnP/RANSAC, and bundle adjustment; this lab uses a controlled synthetic scene.",
    projectSourceHref: "https://github.com/Yashas120/Multiview-3D-Reconstruction",
    browserImplementationHref: browserSource("MultiviewDemo.tsx"),
  },
  {
    projectId: "spark-cifar10",
    demoId: "cifar",
    anchorId: "project-cifar",
    projectTitle: "Spark Streaming CIFAR-10",
    ownership: "fork",
    status: "completed",
    fidelity: "synthetic-live-computation",
    contribution: "Named member of the four-person course team; worked on the streaming, training, and batch-size analysis workflow.",
    browserRuns: "A browser re-enactment that streams bundled CIFAR samples and trains a local softmax classifier in-browser.",
    simplification: "Apache Spark, its executors, and the original distributed training stack are not running in the browser; the distributed topology is modeled.",
    projectSourceHref: "https://github.com/Yashas120/SSML-spark-streaming-for-machine-learning",
    upstreamHref: "https://github.com/iVishalr/SSML-spark-streaming-for-machine-learning",
    browserImplementationHref: browserSource("CifarSparkDemo.tsx"),
  },
  {
    projectId: "parallel-systems",
    demoId: "parallel",
    anchorId: "project-parallel",
    projectTitle: "Systems and Parallel Programming",
    ownership: "coursework",
    status: "completed",
    fidelity: "interactive-explainer",
    contribution: "Implemented and analyzed the published systems-performance exercises covering threading, races, loop variants, and memory layout.",
    browserRuns: "An interactive explanation of the repository's C code, threading behavior, races, and cache-sensitive memory layout.",
    simplification: "The page does not compile or execute native C or pthreads; timings and thread behavior are explanatory models rather than hardware counters.",
    projectSourceHref: "https://github.com/Yashas120/SSP",
    browserImplementationHref: browserSource("ParallelDemo.tsx"),
  },
  {
    projectId: "cloud-provisioning",
    demoId: "cloud",
    anchorId: "project-cloud",
    projectTitle: "Cloud Provisioning using RDBMS",
    ownership: "fork",
    status: "completed",
    fidelity: "in-memory-simulation",
    contribution: "Contributed to the collaborative course project; the public fork does not establish a narrower commit-level ownership boundary.",
    browserRuns: "An in-memory TypeScript trace of the PL/pgSQL allocation, quota, bin-packing, commit, and reject logic.",
    simplification: "No PostgreSQL server is running. Transactions, stored-procedure calls, inventory, and quotas are modeled in browser memory.",
    projectSourceHref: "https://github.com/Yashas120/Cloud-Provisioning-using-RDBMS",
    upstreamHref: "https://github.com/tvijayprashant/Database-for-Cloud-Services",
    browserImplementationHref: browserSource("CloudDemo.tsx"),
  },
  {
    projectId: "yelp-analysis",
    demoId: "yelp",
    anchorId: "project-yelp",
    projectTitle: "Restaurant Analysis using Yelp",
    ownership: "fork",
    status: "completed",
    fidelity: "synthetic-live-computation",
    contribution: "Contributed to the collaborative course analysis; the public fork does not substantiate a narrower individual module boundary.",
    browserRuns: "A local logistic-regression and topic-analysis explainer trained on fictionalized, seeded educational records.",
    simplification: "The data is synthetic and the map is illustrative; the lab does not load the Yelp dataset or make claims about any real business.",
    projectSourceHref: "https://github.com/Yashas120/Restaurant-analysis-using-YELP-dataset",
    upstreamHref: "https://github.com/tvijayprashant/Data-Analytics-Project",
    browserImplementationHref: browserSource("YelpDemo.tsx"),
    warning: "Synthetic educational scenario. These are not real closure predictions and must not be interpreted as claims about any business.",
  },
  {
    projectId: "petra",
    demoId: "petra",
    anchorId: "project-petra",
    projectTitle: "Petra",
    ownership: "fork",
    status: "archived",
    fidelity: "interactive-explainer",
    contribution: "Equal contributor in the three-person course team, focused on the React booking workflow and frontend integration.",
    browserRuns: "A request-path explainer for the archived React booking workflow using deterministic stubbed responses.",
    simplification: "No live Express or MongoDB backend is contacted, and the browser trace does not reproduce the separately maintained backend.",
    projectSourceHref: "https://github.com/Yashas120/Petra",
    upstreamHref: "https://github.com/iVishalr/petra",
    browserImplementationHref: browserSource("PetraDemo.tsx"),
  },
] as const;

export const demoEvidence = (demoId: DemoId): ProjectDemoRecord => {
  const record = PROJECT_DEMO_EVIDENCE.find((item) => item.demoId === demoId);
  if (!record) throw new Error(`Missing project demo evidence for ${demoId}`);
  return record;
};

export const projectDemoEvidence = (projectId: string): ProjectDemoRecord | undefined =>
  PROJECT_DEMO_EVIDENCE.find((item) => item.projectId === projectId);

export interface DemoMeta {
  id: DemoId;
  title: string;
  blurb: string;
  accent: string;
  kind: "interactive" | "explainer";
  tech: string[];
}

export const DEMOS: DemoMeta[] = [
  { id: "ghost", title: "ghOSt + RocksDB scheduling", blurb: "Inspect the ghOSt architecture, kernel build, scheduler configurations, and controlled RocksDB test matrix.", accent: "#a3e635", kind: "explainer", tech: ["Linux kernel rebuild", "ghOSt", "RocksDB", "CFS", "FIFO"] },
  { id: "bitcoin", title: "Bitcoin, end to end", blurb: "Generate educational keys, sign a transaction, and mine a block with real browser computation.", accent: "#f7931a", kind: "interactive", tech: ["Java", "TypeScript port", "SHA-256", "ECDSA", "Proof-of-work"] },
  { id: "chocollvm", title: "ChocoLLVM compiler", blurb: "Compile the supported ChocoPy subset through a browser pipeline to LLVM IR.", accent: "#8b5cf6", kind: "interactive", tech: ["Lexer", "Parser", "AST", "LLVM IR", "Codegen"] },
  { id: "swift", title: "SWIFT super-resolution", blurb: "Inspect the co-authored SwinV2 and Fourier-convolution architecture.", accent: "#22d3ee", kind: "explainer", tech: ["PyTorch", "SwinV2", "Fourier Conv", "Super-resolution"] },
  { id: "multiview", title: "Multiview 3D reconstruction", blurb: "Compute synthetic two-view geometry and recover a point cloud in-browser.", accent: "#34d399", kind: "interactive", tech: ["Python project", "Browser geometry", "Epipolar geometry", "Triangulation"] },
  { id: "cifar", title: "Spark Streaming CIFAR-10", blurb: "Re-enact a micro-batch pipeline while a local softmax model trains in-browser.", accent: "#e25a1c", kind: "interactive", tech: ["Apache Spark project", "Browser re-enactment", "SGD", "CIFAR-10"] },
  { id: "parallel", title: "Parallel computing playground", blurb: "Inspect C, threading, races, and cache layout without claiming native pthread execution.", accent: "#818cf8", kind: "explainer", tech: ["C", "pthreads", "False sharing", "Cache locality"] },
  { id: "cloud", title: "Cloud provisioning (RDBMS)", blurb: "Trace PL/pgSQL allocation logic through an in-memory browser simulation.", accent: "#22d3ee", kind: "interactive", tech: ["PostgreSQL project", "PL/pgSQL", "In-memory trace", "Bin-packing"] },
  { id: "yelp", title: "Restaurant analysis", blurb: "Explore a fictionalized educational closure-risk scenario with synthetic records.", accent: "#f43f5e", kind: "interactive", tech: ["Logistic Regression", "LDA topics", "Synthetic data", "Illustrative map"] },
  { id: "petra", title: "Petra booking interface", blurb: "Trace the archived React booking flow through deterministic stubbed responses.", accent: "#14b8a6", kind: "explainer", tech: ["React", "Product workflow", "Stubbed request trace"] },
];

export const demoMeta = (id: DemoId): DemoMeta => {
  const meta = DEMOS.find((item) => item.id === id);
  if (!meta) throw new Error(`Missing demo metadata for ${id}`);
  return meta;
};

// Backwards-compatible props for the standalone /demos shells. Credibility
// strings are derived from the canonical evidence record above.
export const cardProps = (id: DemoId) => {
  const meta = demoMeta(id);
  const evidence = demoEvidence(id);
  return {
    id: meta.id,
    kind: meta.kind,
    tech: meta.tech,
    role: `${evidence.ownership} · ${evidence.status}`,
    result: evidence.browserRuns,
  };
};
