/**
 * Identity, links and chapter copy for /devtools — the DevOps & platform endpoint.
 *
 * Every factual sentence on the route lives in this directory as plain prose. No
 * claim, number or label is stored inside an SVG, a panel or an animation state,
 * so a visual can never drift away from the fact it illustrates.
 */

import { cmockaCleared } from "./disclosure";

/* ---------------------------------------------------------------- identity */

/**
 * Résumé destination — deliberate interim state, matching /backend and /fde.
 *
 * No résumé PDF is servable from this repository: the PDFs live in the *private*
 * `source-documents` submodule, and publishing one from `public/` would cross
 * that boundary. The action therefore points at the verified LinkedIn profile and
 * names that destination in its accessible label rather than implying a download.
 *
 * To switch to a real download: commit the PDF under `public/` and change only
 * the three fields below — every résumé link on the route reads from here.
 */
export const resumeLink = {
  href: "https://www.linkedin.com/in/yashas120",
  ariaLabel: "Résumé — Yashas Kadambi on LinkedIn (opens in a new tab)",
  isPdf: false,
} as const;

export const identity = {
  name: "Yashas Kadambi",
  role: "DevOps & Platform Engineer",
  email: "ykadambi@ucsd.edu",
  emailHref: "mailto:ykadambi@ucsd.edu",
  github: "https://github.com/Yashas120",
  githubUser: "Yashas120",
  linkedin: "https://www.linkedin.com/in/yashas120",
} as const;

export const meta = {
  title: "Yashas Kadambi — DevOps & Platform Engineer",
  description:
    "Production engineer working across AWS, Terraform, CI/CD, platform reliability, backend systems, observability, and developer tooling. M.S. Computer Science student at UC San Diego.",
  ogTitle: "Yashas Kadambi — DevOps, Platform & Reliability",
  ogDescription:
    "Inspect the delivery systems behind production infrastructure, deployment automation, reliability work, and developer tooling.",
  url: "https://yashas120.github.io/devtools/",
} as const;

/* -------------------------------------------------------------------- hero */

/**
 * UCSD is described as study that begins in September 2026 rather than study in
 * progress, because it has not started yet. Once enrolment begins, change these
 * two strings (and `education.ucsd.status` below) to the present tense — nothing
 * else on the route states the enrolment state.
 */
export const hero = {
  eyebrow: "DEVOPS · PLATFORM · RELIABILITY",
  heading:
    "I turn infrastructure, delivery, and operational knowledge into repeatable systems.",
  body: "I’m Yashas Kadambi, a production software engineer with approximately three years of experience across cloud infrastructure, CI/CD, backend platforms, observability, and developer tooling. I begin an M.S. in Computer Science at UC San Diego in September 2026.",
  availability:
    "Relocating to San Diego for graduate study · Open to DevOps, platform, infrastructure, and SRE opportunities",
  proof: {
    label: "DEPLOYMENT PIPELINE",
    value: "50% faster deployments",
    detail:
      "Parallelized independent infrastructure while preserving dependency order for services that required staged bring-up.",
  },
  /** Secondary proof strip. Each item maps to an evidence record by id. */
  strip: [
    {
      evidenceId: "sdk-ci",
      value: "4 hours → 0",
      detail: "routine manual effort removed — SDK generation and publication",
    },
    {
      evidenceId: "page-load",
      value: "40% faster",
      detail: "application page-load performance",
    },
    cmockaCleared
      ? {
          evidenceId: "test-loop",
          value: "30 minutes → ~10 seconds",
          detail: "hardware-independent unit-test build cycle",
        }
      : {
          evidenceId: "sdk-ci",
          value: "Python + Java",
          detail: "automated SDK delivery from API contract changes",
        },
  ],
} as const;

/* ------------------------------------------------------- chapter long copy */

export const delivery = {
  intro:
    "Infrastructure rarely fails because a tool is missing. It fails when hidden dependencies, environment differences, and manual knowledge are allowed to control the release path. My work has focused on making those constraints explicit and repeatable.",
  caseStudy: {
    title: "Dependency-aware infrastructure delivery",
    context:
      "A cloud-platform migration was rebuilding manually configured AWS environments as infrastructure as code. Many services were deployed serially even when they were independent, while other components genuinely required ordered bring-up.",
    contribution:
      "I worked across reusable Terraform components, networking, IAM, cross-region communication, and service dependency ordering. I separated independent work from true prerequisites so infrastructure could run concurrently without treating the entire deployment graph as safely parallel.",
    outcome:
      "The resulting plan reduced overall deployment time by approximately 50% while preserving staged controls for dependent services.",
    badges: [
      "Production work",
      "AWS",
      "Terraform",
      "Infrastructure as code",
      "Dependency graph",
      "Stage gates",
    ],
  },
  support: [
    "Built and extended reusable Terraform paths across EC2, ECS, Lambda, RDS, DynamoDB, SQS, SNS, IAM, networking, and shared infrastructure.",
    "Helped turn environment bring-up from manually remembered operations into versioned, reusable components that multiple teams could consume.",
  ],
} as const;

export const infrastructure = {
  body: "I have worked on AWS infrastructure that connected data changes, regional queues, backend consumers, and database updates. The useful abstraction was not a list of services; it was a reusable event path with explicit ownership and deployment dependencies.",
  architectureCaption:
    "Public-safe reference architecture derived from verified experience. It illustrates the mechanism, not an employer’s production topology.",
  /** Rendered as prose and as the diagram's accessible description. */
  flow: [
    "Data change",
    "DynamoDB",
    "SNS fan-out",
    "Regional SQS queues",
    "Service consumers",
    "Database updates",
  ],
  contribution:
    "Worked on the Terraform and integration boundaries connecting the data source, fan-out layer, regional consumers, and database dependencies.",
  constraints: [
    "Cross-region dependencies must be explicit.",
    "Independent resources should not wait behind unrelated work.",
    "Dependent services should not start before prerequisites become healthy.",
    "Production mutations should retain human approval where risk warrants it.",
    "Retry, idempotency, ordering, and dead-letter behavior must be documented before claiming production resilience.",
  ],
  /**
   * The constraint list is a set of design principles. The last item in
   * particular is a requirement I place on a design, not a claim that every one
   * of those mechanisms existed in the employer implementation — hence this
   * heading, which the panel also uses.
   */
  designQuestionsHeading: "Questions I would require the design to answer",
  designQuestions: [
    "Are retries bounded, and is every consumer idempotent?",
    "Where does an unprocessable message go, and who reads that queue?",
    "Does any consumer depend on message ordering it cannot guarantee?",
  ],
} as const;

export const reliability = {
  intro:
    "Production incidents often cross application code, deployment configuration, service discovery, load balancing, databases, and undocumented operating assumptions. I approach them as system traces rather than isolated errors.",
  incident: {
    title: "Making a hidden deployment dependency visible",
    situation:
      "A service deployment exposed a non-obvious dependency in an authentication path. The system appeared modular, but global routing and load-balancing behavior meant the components were not operationally independent.",
    investigation:
      "I traced deployment configuration, global service references, load-balancing behavior, and differences between previous and current deployment logs to locate where the environment diverged.",
    prevention:
      "The operating method was changed to validate smaller increments, keep previous instances available until replacements were stable, add health checks, verify the full dependency stack, and introduce safer timing margins.",
  },
  phases: ["Detect", "Scope", "Trace", "Stabilize", "Verify", "Prevent"],
  signals: [
    "Deployment configuration",
    "Service references",
    "Load-balancing behavior",
    "Previous/current logs",
    "Health checks",
    "Replacement stability",
  ],
  performance: {
    title: "Move filtering closer to the data",
    body: "Using application-performance traces, I identified backend and database operations that fetched large datasets before filtering them in application memory. Moving filtering closer to the database and correcting query behavior reduced page-load time by 40% and lowered unnecessary memory work.",
  },
  /**
   * The résumé's cleared wording for the authentication migration is kept, but
   * the product count and the no-impact claim are withheld here because that
   * exact phrasing has not been re-cleared for this route.
   */
  authMigration:
    "Led or contributed to authentication and gateway modernization using traffic-based dependency discovery, staged validation, deployment-controlled rollout, and production-safe cutover.",
} as const;

export const devex = {
  sdk: {
    title: "API contract to SDK, automatically",
    context:
      "Changes to Swagger/OpenAPI contracts required Python and Java client SDKs to be regenerated and published. The recurring workflow previously required approximately four hours of manual work per SDK.",
    contribution:
      "I built the complete GitHub Actions workflow that detected relevant contract changes, generated the language-specific clients, allowed an explicit release-version decision, and published the resulting SDK artifacts and documentation.",
    outcome:
      "Routine generation and publication effort dropped from approximately four hours per SDK to zero manual work, while the release version remained a human decision.",
    /** Stages of the pipeline visual. `human` marks the retained decision. */
    stages: [
      { label: "OpenAPI change", human: false },
      { label: "GitHub Actions trigger", human: false },
      { label: "Generate Python", human: false },
      { label: "Generate Java", human: false },
      { label: "Choose version", human: true },
      { label: "Publish SDK + docs", human: false },
    ],
  },
  testing: {
    title: "Shorter feedback loops for hardware-adjacent software",
    body: cmockaCleared
      ? "Co-designed a CMocka-based framework that compiled 122 production C source files against approximately 430 stubbed external boundaries. It reduced the test-build cycle from roughly 30 minutes to approximately 10 seconds and became a required path for newly added code."
      : "Co-designed a hardware-independent C/C++ unit-testing path that isolated external boundaries, enabled repeatable local testing, and made fast feedback practical for production code that otherwise depended on specialized hardware.",
    loop: [
      "Production source",
      "Isolated boundaries",
      "Local build",
      "Tests",
      "Diagnostics",
    ],
  },
  environments: {
    title: "Development environments as platform products",
    body: "Built repeatable local-development paths for legacy and cloud-connected systems, including container tooling, dependency setup, database substitutes, repository setup, and operational documentation. The goal was consistent: replace machine-specific knowledge with a workflow another engineer could run and understand.",
  },
} as const;

/* ------------------------------------------------- education & credentials */

export const education = {
  certification: {
    name: "AWS Certified Developer – Associate",
    /**
     * Held back until the official credential record is retrieved — see
     * `awsCredentialRecordVerified` in ./disclosure.
     */
    note: "Credential date and verification link pending retrieval of the official record.",
  },
  ucsd: {
    school: "University of California San Diego",
    degree: "M.S. Computer Science",
    status: "September 2026 – expected 2027",
    focus: "Focus: distributed systems, operating systems, and applied machine learning",
  },
  pes: {
    school: "PES University",
    degree: "B.Tech, Computer Science and Engineering",
    status: "2019 – 2023",
    gpa: "U.S.-equivalent GPA: 3.78/4.00, credential evaluated.",
  },
} as const;

export const contact = {
  heading: "Let’s make the operating path easier to trust.",
  body: "I’m interested in DevOps, platform engineering, infrastructure, SRE, and developer-productivity roles where software design and operational behavior are treated as one system.",
  status: { path: "portfolio.delivery/status", value: "READY FOR REVIEW" },
} as const;
