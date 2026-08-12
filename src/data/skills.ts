import { SkillGroup } from "@/types";

export const skills: SkillGroup[] = [
  {
    category: "Languages",
    items: ["Python", "Java", "C", "C++", "TypeScript", "JavaScript", "SQL"],
  },
  {
    category: "Cloud & Infra",
    items: ["AWS", "Terraform", "Docker", "Kubernetes", "CI/CD", "Serverless"],
  },
  {
    category: "Backend & Data",
    items: ["PostgreSQL", "MongoDB", "Cassandra", "DynamoDB", "SQS", "SNS", "AWS Glue", "REST"],
  },
  {
    category: "Systems",
    items: ["Linux Kernel", "ghOSt", "LLVM IR", "Scheduling", "Dataplane / CDR", "Secure Boot"],
  },
  {
    category: "ML / Research",
    items: ["PyTorch", "Apache Spark", "OpenCV", "NumPy", "SciPy", "RAG", "OpenAI APIs"],
  },
];

export const systemsThemes = [
  {
    title: "Production validation",
    body: "Making hardware-dependent C code testable quickly and repeatably without requiring physical line-card hardware.",
    href: "#production-testing",
  },
  {
    title: "Hardware integration",
    body: "Bringing platform software, firmware, FPGA logic and optical devices together as one working system.",
    href: "#hardware-integration",
  },
  {
    title: "Performance experiments",
    body: "Building controlled Linux environments to compare scheduler behavior across workloads and machine configurations.",
    href: "#ghost-scheduling",
  },
] as const;

export const evidenceCapabilities = [
  {
    title: "Linux and systems",
    items: ["Linux kernel builds", "ghOSt", "Scheduling", "Concurrency", "Profiling", "Memory locality", "Performance diagnosis"],
    evidence: ["ghost-scheduler", "parallel-systems"],
  },
  {
    title: "Production C/C++",
    items: ["C", "C++", "CMocka", "GCC", "Clang", "ASan", "UBSan", "SDK stubbing", "Hardware-independent validation"],
    evidence: ["production-testing"],
  },
  {
    title: "Hardware-facing systems",
    items: ["Optical line cards", "Secure boot", "CDR integration", "FPGA/FPD diagnosis", "Device APIs", "PetaLinux"],
    evidence: ["hardware-integration"],
  },
  {
    title: "Compiler and protocol work",
    items: ["LLVM IR", "llvmlite", "SHA-256", "RIPEMD-160", "secp256k1", "ECDSA", "Transaction serialization"],
    evidence: ["chocollvm", "bitcoin-java"],
  },
] as const;
