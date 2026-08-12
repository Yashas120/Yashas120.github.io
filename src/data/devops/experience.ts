export interface ProfessionalExperience {
  id: string;
  organization: string;
  role: string;
  dates: string;
  location: string;
  summary: string;
  layers: string[];
  evidenceIds: string[];
  verificationNotes?: string[];
}

export const professionalExperience: ProfessionalExperience[] = [
  {
    id: "cisco-optical",
    organization: "Cisco",
    role: "Optical Software Development Engineer II",
    dates: "Jan 2025–2026",
    location: "Bengaluru, India",
    summary:
      "Contributed across new optical line-card bring-up, CDR hardware integration, secure-boot-aware software, QPSK and high-speed mode enablement, automated validation, performance-monitoring analysis, developer tooling, and hardware/firmware failure diagnosis. Paired feature delivery with reusable test paths and documentation that shortened later debugging and handoff work.",
    layers: ["OS/process", "Driver/interface", "Hardware/firmware", "Signal/telemetry"],
    evidenceIds: ["optical-platform", "test-loop", "firmware-rca"],
    verificationNotes: ["[VERIFY BEFORE PUBLICATION: final employment month in 2026]"],
  },
  {
    id: "cisco-backend",
    organization: "Cisco",
    role: "Software Engineer, Backend and Cloud Platforms",
    dates: "Aug 2023–Jan 2025",
    location: "Bengaluru, India",
    summary:
      "Built reusable AWS and Terraform infrastructure, event-driven service paths, backend and database improvements, authentication and API migrations, incident-recovery methods, local-development environments, operational documentation, and developer-enablement tools across cloud and legacy systems.",
    layers: ["Service", "Deployment", "OS/process", "Signal/telemetry"],
    evidenceIds: ["iac", "deploy-time", "events", "incident", "page-load", "auth-api"],
  },
  {
    id: "cisco-intern",
    organization: "Cisco",
    role: "Software Development / Technical Intern",
    dates: "Jan–Jul 2023",
    location: "Bengaluru, India",
    summary:
      "Automated Python and Java SDK generation and publication from API-contract changes, improved OpenAPI documentation, contributed to an AWS Glue-backed data path and backend/web features, and automated a team-approved Docker Desktop alternative.",
    layers: ["Service", "Deployment", "OS/process"],
    evidenceIds: ["sdk-ci", "dev-environments"],
  },
  {
    id: "schneider",
    organization: "Schneider Electric",
    role: "Software Engineering Intern",
    dates: "Jun–Aug 2022",
    location: "Bengaluru, India",
    summary:
      "Independently translated an unfamiliar switchgear-test discussion process into a software workflow, owning requirements, architecture, implementation, and delivery. The target discussion cycle fell from approximately two days to approximately two hours.",
    layers: ["Service", "Deployment"],
    evidenceIds: ["schneider-workflow"],
  },
];

export const boundaryLayers = [
  "Service",
  "Deployment",
  "OS/process",
  "Driver/interface",
  "Hardware/firmware",
  "Signal/telemetry",
] as const;
