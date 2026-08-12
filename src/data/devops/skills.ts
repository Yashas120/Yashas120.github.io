export interface SkillGroup {
  id: string;
  title: string;
  items: string[];
  evidenceIds: string[];
  evidenceDestinations: string[];
}

/** Capability is grouped by supporting work, never self-rated. */
export const skillGroups: SkillGroup[] = [
  {
    id: "infrastructure",
    title: "Infrastructure",
    items: ["AWS EC2/ECS/Lambda/RDS/DynamoDB/SQS/SNS/IAM/Glue", "Terraform", "Docker", "Kubernetes"],
    evidenceIds: ["iac", "events", "containers"],
    evidenceDestinations: ["#delivery", "#infrastructure", "#systems"],
  },
  {
    id: "delivery",
    title: "Delivery and operations",
    items: ["CI/CD", "GitHub Actions", "Infrastructure as code", "Deployment sequencing", "Incident investigation", "Performance tuning", "Log analysis", "Runbooks"],
    evidenceIds: ["deploy-time", "sdk-ci", "incident", "page-load"],
    evidenceDestinations: ["#delivery", "#reliability", "#devex"],
  },
  {
    id: "backend",
    title: "Backend and data",
    items: ["Python", "Java", "TypeScript/JavaScript", "SQL", "PostgreSQL", "MongoDB", "Cassandra/DataStax", "OpenSearch", "REST", "Protobuf", "Node.js", "Flask"],
    evidenceIds: ["page-load", "cloud-rdbms", "sdk-ci"],
    evidenceDestinations: ["#reliability", "#systems", "#experience"],
  },
  {
    id: "systems",
    title: "Systems and quality",
    items: ["Linux", "C/C++", "CMocka", "Scheduling", "Concurrency", "Profiling", "Sanitizers/static analysis", "Hardware/software integration", "Secure boot"],
    evidenceIds: ["test-loop", "optical-platform", "ghost", "firmware-rca"],
    evidenceDestinations: ["#devex", "#experience", "#systems"],
  },
  {
    id: "research",
    title: "Research and ML",
    items: ["PyTorch", "TensorFlow/Keras", "Spark/PySpark", "Kafka", "OpenCV", "NumPy/SciPy", "RAG", "Computer vision", "Super-resolution"],
    evidenceIds: ["swift-research", "underwater-research", "teaching-scale"],
    evidenceDestinations: ["#complete-work", "#enablement"],
  },
  {
    id: "enablement",
    title: "Enablement",
    items: ["Documentation", "Mentoring", "Onboarding", "Assignment/lab design", "Autograding", "Technical communication"],
    evidenceIds: ["teaching-scale", "leadership", "dev-environments"],
    evidenceDestinations: ["#enablement", "#devex"],
  },
];
