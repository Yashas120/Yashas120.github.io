export type KernelScene =
  | "identity"
  | "test-boundary"
  | "secure-boot"
  | "hardware-integration"
  | "scheduler"
  | "projects"
  | "capabilities"
  | "contact";

export const kernelPortfolio = {
  eyebrow: "SYSTEMS SOFTWARE · LINUX · HARDWARE",
  introduction:
    "I build and validate software where Linux, production hardware, and performance meet—from optical line-card bring-up and secure boot to C/C++ test infrastructure and scheduler experiments.",
  broaderIntroduction:
    "My systems work is the focus of this page, not the limit of my experience. The complete portfolio below includes distributed systems, backend engineering, DevOps/SRE, machine learning, computer vision, research and teaching work.",
  proofOrder: ["production-files", "sdk-stubs", "validation-cycle", "scheduler-configs"],
  caseStudyOrder: ["production-testing", "hardware-integration", "ghost-scheduling"],
  featuredProjectIds: ["bitcoin-java", "chocollvm", "parallel-systems"],
  projectOrder: [
    "ghost-scheduler",
    "bitcoin-java",
    "chocollvm",
    "parallel-systems",
    "spark-cifar10",
    "cloud-provisioning",
    "cloud-hack",
    "multiview-3d",
    "swift",
    "yelp-analysis",
    "voice-assistant",
    "petra",
    "underwater-monitoring",
    "portfolio-platform",
    "sunset-fork",
  ],
  sections: [
    { id: "production-testing", label: "Production testing", alias: "test boundary", scene: "test-boundary" },
    { id: "hardware-integration", label: "Hardware integration", alias: "device path", scene: "hardware-integration" },
    { id: "ghost-scheduling", label: "Scheduling experiments", alias: "sched", scene: "scheduler" },
    { id: "systems-projects", label: "Systems projects", alias: "processes", scene: "projects" },
    { id: "experience", label: "Work experience", alias: "systemd", scene: "projects" },
    { id: "projects", label: "All projects", alias: "htop", scene: "projects" },
    { id: "research-teaching", label: "Research & teaching", alias: "papers", scene: "projects" },
    { id: "education", label: "Education", alias: "profile", scene: "identity" },
    { id: "capabilities", label: "Capabilities", alias: "/proc/skills", scene: "capabilities" },
    { id: "contact", label: "Contact", alias: "mail", scene: "contact" },
  ] satisfies { id: string; label: string; alias: string; scene: KernelScene }[],
  sceneBySection: {
    "kernel-hero": "identity",
    "production-testing": "test-boundary",
    "hardware-integration": "hardware-integration",
    "ghost-scheduling": "scheduler",
    "systems-projects": "projects",
    experience: "projects",
    projects: "projects",
    "research-teaching": "projects",
    education: "identity",
    capabilities: "capabilities",
    contact: "contact",
  } satisfies Record<string, KernelScene>,
  sceneVisuals: {
    identity: {
      kicker: "SYSTEM MAP",
      title: "Software across real boundaries",
      description: "Yashas works where Linux software, production hardware, validation, and performance meet.",
      nodes: ["Linux", "Production C", "Hardware", "Performance"],
      status: "Profile online",
    },
    "test-boundary": {
      kicker: "TEST BOUNDARY",
      title: "Real source, modeled dependencies",
      description: "Production C remains in the execution path while external SDK and physical-hardware boundaries are replaced by controlled test doubles.",
      nodes: ["Tests", "Production C", "SDK stubs", "Hardware boundary"],
      status: "Validation path healthy",
    },
    "secure-boot": {
      kicker: "VERIFICATION CHAIN",
      title: "Authenticate before execution",
      description: "Each secure-boot verification stage must pass before the next stage can execute.",
      nodes: ["Root of trust", "Firmware", "FPGA/FPD", "Application"],
      status: "Verification sequence passed",
    },
    "hardware-integration": {
      kicker: "DEVICE PATH",
      title: "One system, several layers",
      description: "Platform software reaches optical hardware through device APIs, FPGA/FPD logic, and clock-and-data-recovery hardware.",
      nodes: ["Platform software", "Device API", "FPGA / FPD", "CDR", "Optical hardware"],
      status: "Cross-layer path connected",
    },
    scheduler: {
      kicker: "POLICY BOUNDARY",
      title: "Decisions cross user/kernel space",
      description: "Runnable work reaches kernel mechanisms, a user-space policy selects a task, and the dispatch decision returns to the kernel.",
      nodes: ["Workload", "Kernel mechanism", "User-space policy", "Dispatch", "Observation"],
      status: "Conceptual architecture",
    },
    projects: {
      kicker: "EVIDENCE INDEX",
      title: "Context is part of the work",
      description: "Projects remain distinguishable by where the work happened, Yashas's role, current status, and linked evidence.",
      nodes: ["Context", "Ownership", "Status", "Evidence"],
      status: "Attribution attached",
    },
    capabilities: {
      kicker: "/PROC/SKILLS",
      title: "Capabilities resolve to evidence",
      description: "Systems capabilities are supported by visible production work, experiments, repositories, papers, and demos.",
      nodes: ["Capability", "Work record", "Evidence", "Source"],
      status: "No percentage scores",
    },
    contact: {
      kicker: "SERVICES",
      title: "Channels ready",
      description: "Résumé, email, source repositories, professional profile, and yashOS are available directly.",
      nodes: ["Résumé", "Email", "GitHub", "LinkedIn", "yashOS"],
      status: "Ready to connect",
    },
  } satisfies Record<KernelScene, { kicker: string; title: string; description: string; nodes: readonly string[]; status: string }>,
} as const;

export const workLabels = {
  context: {
    production: "Production",
    independent: "Independent",
    coursework: "Coursework",
    research: "Research",
    "open-source": "Open source",
  },
  ownership: {
    primary: "Primary implementation",
    contributor: "Contributor",
    team: "Team member",
    evaluator: "Evaluator",
  },
  status: {
    shipped: "Shipped",
    completed: "Completed",
    ongoing: "Ongoing",
    archived: "Archived",
    "in-development": "In development",
  },
} as const;
