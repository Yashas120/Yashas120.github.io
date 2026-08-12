/**
 * Skills for /devtools, grouped and linked to evidence.
 *
 * Deliberately not a tag cloud and deliberately without proficiency percentages:
 * a self-assigned number is not evidence. Each group instead points at the
 * records that support it, which the "Show supporting evidence" control opens.
 */

export interface SkillGroup {
  id: string;
  title: string;
  items: string[];
  /** Evidence record ids this group is backed by. */
  evidenceIds: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    id: "infrastructure",
    title: "Infrastructure",
    items: [
      "AWS: EC2, ECS, Lambda, RDS, DynamoDB, SQS, SNS, IAM, Glue",
      "Terraform",
      "Docker",
      "Kubernetes",
    ],
    evidenceIds: ["iac", "events", "containers"],
  },
  {
    id: "delivery",
    title: "Delivery and operations",
    items: [
      "CI/CD",
      "GitHub Actions",
      "Infrastructure as code",
      "Deployment sequencing",
      "Incident investigation",
      "Performance tuning",
      "Log analysis",
      "Technical runbooks",
    ],
    evidenceIds: ["deploy-time", "sdk-ci", "incident"],
  },
  {
    id: "backend",
    title: "Backend and data",
    items: [
      "Python",
      "Java",
      "C/C++",
      "TypeScript",
      "SQL",
      "PostgreSQL",
      "MongoDB",
      "Cassandra/DataStax",
      "OpenSearch",
      "REST",
      "Protobuf",
    ],
    evidenceIds: ["page-load", "cloud-rdbms"],
  },
  {
    id: "systems",
    title: "Systems and quality",
    items: [
      "Linux",
      "CMocka",
      "Unit/integration/regression testing",
      "Static analysis",
      "Sanitizers",
      "Profiling",
      "Hardware/software integration",
    ],
    evidenceIds: ["test-loop"],
  },
];
