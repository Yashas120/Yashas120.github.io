/**
 * Selected systems for /devtools.
 *
 * Two projects get full cards because they support the DevOps story; everything
 * else stays compact so public projects never compete visually with production
 * work. Labels are drawn from the route's fixed classification vocabulary.
 */

import type { EvidenceClass } from "./evidence";

export interface DevOpsProject {
  id: string;
  /** Classification line shown above the title. */
  label: string;
  classification: EvidenceClass;
  title: string;
  summary: string;
  demonstrates: string[];
  link?: { label: string; href: string };
  /** Evidence record this card resolves to. */
  evidenceId: string;
}

export const projects: DevOpsProject[] = [
  {
    id: "cloud-hack",
    label: "Cloud-native coursework · public repository",
    classification: "coursework",
    title: "Containerized service deployment with explicit configuration boundaries",
    summary:
      "Packaged a Flask and MongoDB application with Docker and Kubernetes, separating application configuration, credentials, service discovery, and administrative access.",
    demonstrates: [
      "Docker image construction",
      "Kubernetes Deployments and Services",
      "ConfigMaps and Secrets",
      "Environment-based configuration",
      "MongoDB service operation",
      "Small-scale cloud-native deployment reasoning",
    ],
    link: { label: "Inspect repository", href: "https://github.com/Yashas120/Cloud-Hack" },
    evidenceId: "containers",
  },
  {
    id: "cloud-rdbms",
    label: "Team database/cloud project · public fork · contribution boundary to confirm",
    classification: "team-project",
    title: "Enforcing infrastructure constraints through a relational control model",
    summary:
      "Built a database-backed system for allocating cloud hardware and modeling projects, zones, quotas, cost, inventory, and virtual-machine lifecycle operations.",
    demonstrates: [
      "PostgreSQL and PL/pgSQL",
      "Quota and availability constraints",
      "Transaction-sensitive lifecycle operations",
      "Node.js backend structure",
      "React interface",
      "Triggers, roles, and access control",
    ],
    link: {
      label: "Inspect repository",
      href: "https://github.com/Yashas120/Cloud-Provisioning-using-RDBMS",
    },
    evidenceId: "cloud-rdbms",
  },
];

/**
 * Kept deliberately compact: it demonstrates benchmarking discipline and
 * performance reasoning, and it is not presented as DevOps production work. No
 * repository is published for it, so it carries no link.
 */
export const supportingProject = {
  title: "Performance Analysis of the Google ghOSt Scheduler",
  label: "Systems performance project",
  summary:
    "Built a repeatable environment for comparing kernel and user-space scheduling policies across RocksDB and backend-server workloads under different load, concurrency, and memory conditions.",
} as const;
