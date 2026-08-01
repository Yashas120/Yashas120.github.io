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
