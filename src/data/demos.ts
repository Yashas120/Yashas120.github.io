// Metadata for the live project demos. Drives both the card headers
// (via LiveDemo) and the overview index grid at the top of /demos.
// NOTE: verify `role` / `result` strings — these are credibility-facing.

export interface DemoMeta {
  id: string;
  title: string; // short title for the index grid
  blurb: string; // one-line pitch for the index grid
  accent: string;
  kind: "interactive" | "explainer";
  tech: string[];
  role: string;
  result: string;
}

export const DEMOS: DemoMeta[] = [
  {
    id: "bitcoin",
    title: "Bitcoin, end to end",
    blurb: "Generate a key, sign a transaction, mine a block — real crypto, from scratch.",
    accent: "#f7931a",
    kind: "interactive",
    tech: ["Java", "SHA-256", "ECDSA", "Merkle tree", "Proof-of-work"],
    role: "Solo project",
    result: "Full key → address → sign → mine → verify pipeline with no crypto libraries",
  },
  {
    id: "chocollvm",
    title: "ChocoLLVM compiler",
    blurb: "Type ChocoPy, press run, watch it lower to real LLVM IR.",
    accent: "#8b5cf6",
    kind: "interactive",
    tech: ["Lexer", "Parser", "AST", "LLVM IR", "Codegen"],
    role: "Solo project",
    result: "Editable source compiles live to valid LLVM IR",
  },
  {
    id: "swift",
    title: "SWIFT super-resolution",
    blurb: "SwinV2 + Fourier convolutions for lightweight image upscaling.",
    accent: "#22d3ee",
    kind: "explainer",
    tech: ["PyTorch", "SwinV2", "Fourier Conv", "Super-resolution"],
    role: "Research project",
    result: "~34% fewer parameters than the baseline architecture",
  },
  {
    id: "multiview",
    title: "Multiview 3D reconstruction",
    blurb: "Two 2D views → a 3D point cloud via Structure from Motion.",
    accent: "#34d399",
    kind: "interactive",
    tech: ["Python", "OpenCV", "Epipolar geometry", "Triangulation"],
    role: "Solo project",
    result: "2-view SfM recovers a sparse 3D point cloud",
  },
  {
    id: "cifar",
    title: "Spark Streaming CIFAR-10",
    blurb: "A streaming ML system: socket producer → micro-batch RDDs → SGD.",
    accent: "#e25a1c",
    kind: "interactive",
    tech: ["Apache Spark", "Streaming", "SGD", "CIFAR-10"],
    role: "Course project",
    result: "Distributed micro-batch SGD classifier over a socket stream",
  },
  {
    id: "parallel",
    title: "Parallel computing playground",
    blurb: "Real C beside live animations of threads, races and cache layout.",
    accent: "#818cf8",
    kind: "explainer",
    tech: ["C", "pthreads", "False sharing", "Cache locality"],
    role: "Course project (SSP)",
    result: "Three performance lessons: work-splitting, races, memory layout",
  },
  {
    id: "cloud",
    title: "Cloud provisioning (RDBMS)",
    blurb: "VM provisioning as PL/pgSQL stored procedures — traced step by step.",
    accent: "#22d3ee",
    kind: "interactive",
    tech: ["PostgreSQL", "PL/pgSQL", "Stored procedures", "Bin-packing"],
    role: "Course project",
    result: "Quota-checked VM allocation entirely inside the database",
  },
  {
    id: "yelp",
    title: "Yelp closure predictor",
    blurb: "Live logistic regression + a real map of restaurant closure risk.",
    accent: "#f43f5e",
    kind: "interactive",
    tech: ["Logistic Regression", "LDA topics", "Yelp dataset", "OpenStreetMap"],
    role: "Data project",
    result: "Closure classifier, feature importance, and LDA review topics",
  },
  {
    id: "petra",
    title: "Petra MERN app",
    blurb: "Trace a request through a hand-built React → Express → MongoDB stack.",
    accent: "#14b8a6",
    kind: "explainer",
    tech: ["React", "Express", "MongoDB", "Google OAuth"],
    role: "Team project",
    result: "Full-stack pet-care booking app with auth, API and pricing",
  },
];

export const demoMeta = (id: string): DemoMeta =>
  DEMOS.find((d) => d.id === id) ?? DEMOS[0];

// Props to spread into a LiveDemo card (accent stays passed explicitly).
export const cardProps = (id: string) => {
  const m = demoMeta(id);
  return { id: m.id, kind: m.kind, tech: m.tech, role: m.role, result: m.result };
};
