export type KernelScene =
  | "identity"
  | "production-testing"
  | "hardware-integration"
  | "ghost-scheduling"
  | "experience"
  | "systems-projects"
  | "live-demos"
  | "complete-profile"
  | "capabilities"
  | "contact";

export type KernelStageStep =
  | KernelScene
  | "profile-backend"
  | "profile-infrastructure"
  | "profile-ml"
  | "profile-research";

export type StageNodeKind = "application" | "kernel" | "boundary" | "device" | "evidence" | "service";

export interface StageNode {
  label: string;
  detail: string;
  kind: StageNodeKind;
  x: number;
  y: number;
  w: number;
}

export interface StageFrame {
  scene: KernelScene;
  title: string;
  alias: string;
  kicker: string;
  status: string;
  annotation: string;
  nodes: readonly StageNode[];
}

const node = (label: string, detail: string, kind: StageNodeKind, x: number, y: number, w = 26): StageNode => ({
  label,
  detail,
  kind,
  x,
  y,
  w,
});

export const stageStepOrder: readonly KernelStageStep[] = [
  "identity",
  "production-testing",
  "hardware-integration",
  "ghost-scheduling",
  "experience",
  "systems-projects",
  "live-demos",
  "complete-profile",
  "profile-backend",
  "profile-infrastructure",
  "profile-ml",
  "profile-research",
  "capabilities",
  "contact",
];

export const stageFrames: Record<KernelStageStep, StageFrame> = {
  identity: {
    scene: "identity",
    title: "Portfolio Overview",
    alias: "man yashas",
    kicker: "SYSTEM THESIS",
    status: "Profile online · evidence attached",
    annotation: "Software crosses real boundaries",
    nodes: [
      node("Application", "plain-English intent", "application", 33, 7, 34),
      node("Production C", "real execution path", "application", 9, 31, 30),
      node("Linux kernel", "mechanism", "kernel", 57, 31, 30),
      node("Device API", "software boundary", "boundary", 12, 57, 28),
      node("FPGA / FPD", "programmable device", "device", 58, 57, 28),
      node("Optical hardware", "physical system", "device", 15, 80, 31),
      node("Performance", "measured behavior", "evidence", 55, 80, 31),
    ],
  },
  "production-testing": {
    scene: "production-testing",
    title: "Production C validation",
    alias: "test-boundary",
    kicker: "REAL SOURCE · MODELED DEPENDENCIES",
    status: "Required new-code validation gate",
    annotation: "Production code remains real",
    nodes: [
      node("CMocka tests", "controlled inputs", "application", 5, 10, 28),
      node("122 C files", "production source", "kernel", 37, 10, 30),
      node("Validation gate", "GCC · Clang", "evidence", 70, 10, 25),
      node("Real modules", "executed directly", "kernel", 37, 40, 30),
      node("~430 interactions", "modeled SDK surface", "boundary", 5, 70, 29),
      node("Hardware boundary", "controlled substitute", "boundary", 37, 70, 30),
      node("~10 seconds", "typical local cycle", "evidence", 70, 70, 25),
    ],
  },
  "hardware-integration": {
    scene: "hardware-integration",
    title: "Hardware integration",
    alias: "device-path",
    kicker: "PLATFORM → PHYSICAL SYSTEM",
    status: "Integrated · validated · diagnosed",
    annotation: "One event, five engineering layers",
    nodes: [
      node("Platform software", "production C", "application", 4, 36, 25),
      node("Device API", "interface", "boundary", 31, 36, 20),
      node("FPGA / FPD", "firmware path", "device", 53, 36, 20),
      node("CDR", "clock recovery", "device", 75, 36, 18),
      node("Secure boot", "verification chain", "evidence", 17, 70, 24),
      node("Upgrade flow", "validated path", "service", 44, 70, 24),
      node("Optical hardware", "line-card system", "device", 71, 70, 24),
    ],
  },
  "ghost-scheduling": {
    scene: "ghost-scheduling",
    title: "Linux scheduling experiments",
    alias: "sched",
    kicker: "POLICY ACROSS USER / KERNEL SPACE",
    status: "Conceptual architecture · not measured output",
    annotation: "Mechanism stays in Linux; policy can move",
    nodes: [
      node("Runnable work", "RocksDB · backend", "application", 5, 8, 28),
      node("CFS", "kernel baseline", "kernel", 5, 39, 23),
      node("FIFO", "kernel baseline", "kernel", 30, 39, 23),
      node("ghOSt agent", "user-space policy", "boundary", 57, 39, 36),
      node("Kernel dispatch", "low-level mechanism", "kernel", 30, 70, 31),
      node("Latency", "collected", "evidence", 64, 70, 14),
      node("Throughput", "collected", "evidence", 80, 70, 15),
    ],
  },
  experience: {
    scene: "experience",
    title: "Work experience",
    alias: "systemd",
    kicker: "PROFESSIONAL SERVICE DEPENDENCIES",
    status: "Approximately three years in production engineering",
    annotation: "Roles connect to shipped evidence",
    nodes: [
      node("Cisco optical", "Engineer II", "service", 34, 7, 32),
      node("Validation", "production C", "evidence", 4, 38, 25),
      node("Integration", "line-card path", "device", 31, 38, 25),
      node("Secure boot", "verified flows", "boundary", 58, 38, 25),
      node("Diagnosis", "cross-layer", "evidence", 31, 69, 25),
      node("Cisco cloud", "backend platform", "service", 4, 78, 25),
      node("Schneider", "workflow tool", "service", 67, 78, 25),
    ],
  },
  "systems-projects": {
    scene: "systems-projects",
    title: "Selected systems projects",
    alias: "processes",
    kicker: "PROJECT EVIDENCE INDEX",
    status: "Context · ownership · status · evidence",
    annotation: "Evidence replaces process telemetry",
    nodes: [
      node("Bitcoin primitives", "independent · primary", "evidence", 4, 8, 42),
      node("Compiler / LLVM", "coursework · fork", "evidence", 50, 8, 45),
      node("Parallel systems", "coursework · team", "evidence", 4, 37, 42),
      node("ghOSt analysis", "coursework · evaluator", "evidence", 50, 37, 45),
      node("Source", "verified repositories", "service", 4, 69, 27),
      node("Demo", "verified routes", "service", 35, 69, 27),
      node("Attribution", "always attached", "boundary", 66, 69, 29),
    ],
  },
  "live-demos": {
    scene: "live-demos",
    title: "Live demo lab",
    alias: "demo-lab",
    kicker: "INTERACTIVE PROJECT EVIDENCE",
    status: "10 browser experiences ready",
    annotation: "Launch each demo inside yashOS",
    nodes: [
      node("Demo lab", "10 experiences", "kernel", 34, 7, 32),
      node("Protocols", "Bitcoin · compiler", "application", 4, 39, 28),
      node("Systems", "scheduling · parallel", "application", 35, 39, 27),
      node("ML / vision", "SWIFT · SfM · CIFAR", "application", 65, 39, 28),
      node("Cloud / data", "RDBMS · Yelp", "service", 4, 72, 28),
      node("Full stack", "Petra", "service", 35, 72, 27),
      node("Evidence labels", "fidelity attached", "evidence", 65, 72, 28),
    ],
  },
  "complete-profile": {
    scene: "complete-profile",
    title: "Complete portfolio",
    alias: "workspace --systems",
    kicker: "SYSTEMS AND PROTOCOLS",
    status: "Focus is not exclusion",
    annotation: "Every domain shares one evidence model",
    nodes: [
      node("Systems", "active workspace", "kernel", 34, 7, 32),
      node("Protocols", "Bitcoin", "evidence", 4, 39, 25),
      node("Compilers", "LLVM IR", "evidence", 31, 39, 25),
      node("Scheduling", "ghOSt", "evidence", 58, 39, 25),
      node("Parallelism", "threads · locality", "evidence", 17, 72, 28),
      node("Source", "linked", "service", 49, 72, 20),
      node("Demos", "linked", "service", 72, 72, 20),
    ],
  },
  "profile-backend": {
    scene: "complete-profile",
    title: "Complete portfolio",
    alias: "workspace --backend",
    kicker: "DISTRIBUTED SYSTEMS AND BACKEND",
    status: "Production and coursework contexts separated",
    annotation: "Data, control and event paths reconnect",
    nodes: [
      node("Backend", "active workspace", "kernel", 34, 7, 32),
      node("Cloud services", "Cisco production", "service", 4, 39, 28),
      node("Event systems", "SQS · SNS", "service", 35, 39, 27),
      node("Databases", "SQL · NoSQL", "evidence", 65, 39, 27),
      node("Spark stream", "distributed ML", "application", 4, 72, 28),
      node("Cloud allocator", "PostgreSQL", "application", 35, 72, 27),
      node("APIs", "compatibility", "boundary", 65, 72, 27),
    ],
  },
  "profile-infrastructure": {
    scene: "complete-profile",
    title: "Complete portfolio",
    alias: "workspace --infrastructure",
    kicker: "DEVOPS AND INFRASTRUCTURE",
    status: "Delivery paths backed by shipped work",
    annotation: "Dependencies become an infrastructure graph",
    nodes: [
      node("Infrastructure", "active workspace", "kernel", 32, 7, 36),
      node("Terraform", "AWS resources", "service", 4, 39, 25),
      node("CI / SDK", "release automation", "service", 31, 39, 25),
      node("Containers", "Docker · Kubernetes", "service", 58, 39, 34),
      node("Rollout", "flags · stages", "boundary", 4, 72, 25),
      node("Reliability", "failure diagnosis", "evidence", 31, 72, 27),
      node("Observability", "device logs", "evidence", 61, 72, 31),
    ],
  },
  "profile-ml": {
    scene: "complete-profile",
    title: "Complete portfolio",
    alias: "workspace --ml-vision",
    kicker: "MACHINE LEARNING AND VISION",
    status: "Research, coursework and independent work labeled",
    annotation: "Models remain connected to context",
    nodes: [
      node("ML / vision", "active workspace", "kernel", 34, 7, 32),
      node("SWIFT", "peer-reviewed", "evidence", 4, 39, 25),
      node("3D reconstruction", "independent", "application", 31, 39, 30),
      node("Yelp analysis", "coursework", "application", 64, 39, 28),
      node("Voice + RAG", "CPU prototype", "application", 4, 72, 28),
      node("Spark / CIFAR", "team project", "application", 35, 72, 27),
      node("Evidence", "papers · demos", "service", 65, 72, 27),
    ],
  },
  "profile-research": {
    scene: "complete-profile",
    title: "Complete portfolio",
    alias: "workspace --research",
    kicker: "RESEARCH, TEACHING AND EDUCATION",
    status: "2 publications · 3 courses · 656 learners",
    annotation: "Academic work is distinct from employment",
    nodes: [
      node("Research", "active workspace", "kernel", 34, 7, 32),
      node("SWIFT paper", "AIA · 2025", "evidence", 4, 39, 25),
      node("Underwater DC", "IEEE · 2021", "evidence", 31, 39, 29),
      node("Teaching", "3 CSE courses", "service", 63, 39, 29),
      node("PES University", "B.Tech CSE", "application", 4, 72, 28),
      node("UC San Diego", "incoming MSCS", "application", 35, 72, 28),
      node("656 learners", "teaching reach", "evidence", 66, 72, 27),
    ],
  },
  capabilities: {
    scene: "capabilities",
    title: "Capabilities backed by work",
    alias: "/proc/capabilities",
    kicker: "EVIDENCE-BACKED CAPABILITY TREE",
    status: "No percentages · every branch resolves to work",
    annotation: "Claims are edges, not floating keywords",
    nodes: [
      node("/proc/capabilities", "evidence root", "kernel", 31, 6, 38),
      node("Linux systems", "ghOSt · parallel", "evidence", 4, 39, 27),
      node("Production C/C++", "validation", "evidence", 34, 39, 29),
      node("Hardware-facing", "line-card path", "device", 66, 39, 29),
      node("Compilers", "LLVM IR", "application", 10, 72, 24),
      node("Protocols", "Bitcoin", "application", 38, 72, 24),
      node("Cloud / data", "production backend", "service", 66, 72, 27),
    ],
  },
  contact: {
    scene: "contact",
    title: "Contact",
    alias: "mail",
    kicker: "COMPLETE SYSTEM MAP",
    status: "Résumé · email · source · profile ready",
    annotation: "The narrative settles into a working desktop",
    nodes: [
      node("Portfolio", "plain-English layer", "application", 34, 6, 32),
      node("Linux / systems", "engineering focus", "kernel", 4, 38, 28),
      node("Production work", "Cisco · Schneider", "evidence", 36, 38, 28),
      node("Complete profile", "all domains", "service", 68, 38, 27),
      node("Résumé", "PDF ready", "service", 4, 72, 23),
      node("Email", "service ready", "service", 31, 72, 23),
      node("Interactive desktop", "all apps", "boundary", 58, 72, 37),
    ],
  },
};

export const storyDock = [
  { scene: "identity", step: "identity", id: "identity", label: "About", alias: "man" },
  { scene: "production-testing", step: "production-testing", id: "production-testing", label: "Validation", alias: "test-boundary" },
  { scene: "hardware-integration", step: "hardware-integration", id: "hardware-integration", label: "Hardware", alias: "device-path" },
  { scene: "ghost-scheduling", step: "ghost-scheduling", id: "ghost-scheduling", label: "Scheduling", alias: "sched" },
  { scene: "experience", step: "experience", id: "experience", label: "Experience", alias: "systemd" },
  { scene: "systems-projects", step: "systems-projects", id: "systems-projects", label: "Projects", alias: "processes" },
  { scene: "live-demos", step: "live-demos", id: "live-demos", label: "Demos", alias: "demo-lab" },
  { scene: "capabilities", step: "capabilities", id: "capabilities", label: "Capabilities", alias: "/proc" },
  { scene: "contact", step: "contact", id: "contact", label: "Contact", alias: "mail" },
] as const satisfies readonly { scene: KernelScene; step: KernelStageStep; id: string; label: string; alias: string }[];
