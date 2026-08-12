/**
 * All literal content for /backend.
 *
 * Two rules hold in this file, and they are the reason it exists separately from
 * the animation components:
 *
 *  1. Every résumé claim lives here as plain prose. No fact is stored inside an
 *     SVG, a chapter visual or an animation state.
 *  2. Only verified values appear. The allowed figures are the deployment-time
 *     reduction, the eliminated four-hour manual SDK update, the page-load
 *     reduction, the four outages root-caused, and the seven-product
 *     authentication migration with zero production impact. Absolute latencies,
 *     resource counts, environment counts, costs, queue depths, request volumes,
 *     uptime and revenue context are deliberately absent — nothing verifies them.
 */

/* ----------------------------------------------------------------- contact */

/**
 * Résumé destination — deliberate temporary state, approved by the site owner.
 *
 * No résumé PDF is servable from this repository. The backend résumé exists only
 * at `source-documents/resumes/Yashas-Kadambi-Backend-Resume.pdf`, inside the
 * *private* `personal-site-reference` submodule, and `reference/` holds a TA CV
 * rather than this one. Publishing either from `public/` would expose private
 * material, so the résumé action points at the verified LinkedIn profile instead
 * (the same interim `/fde` uses) and names that destination in its accessible
 * label rather than implying a PDF download.
 *
 * To switch to a real PDF: commit the file under `public/` and change only the
 * three fields below — every résumé link on the route reads from here.
 */
export const resumeLink = {
  href: "https://www.linkedin.com/in/yashas120",
  /** Clarifies the real destination for screen-reader and keyboard users. */
  ariaLabel: "Résumé — Yashas Kadambi on LinkedIn (opens in a new tab)",
  isPdf: false,
};

export const contactLinks = {
  email: "ykadambi@ucsd.edu",
  emailHref: "mailto:ykadambi@ucsd.edu",
  github: "https://github.com/Yashas120",
  linkedin: "https://www.linkedin.com/in/yashas120",
};

/* -------------------------------------------------------------------- meta */

export const backendMeta = {
  title: "Yashas Kadambi — Backend & Platform Engineer",
  description:
    "Backend and platform engineering portfolio of Yashas Kadambi: cloud infrastructure, event-driven systems, delivery automation, and production reliability.",
  ogDescription:
    "Production engineering across cloud infrastructure, event-driven systems, automation, and reliability.",
  url: "/backend",
};

/* ------------------------------------------------------------------ header */

export const header = {
  name: "Yashas Kadambi",
  role: "Backend & Platform Engineer",
};

/**
 * Graduate status, isolated in one field so it can be flipped to
 * "MSCS student at UC San Diego." once the program begins, without touching copy
 * anywhere else.
 */
export const gradStatus = {
  sentence: "I begin an MSCS at UC San Diego in September 2026.",
  short: "Incoming MSCS student at UC San Diego · September 2026",
};

/* ------------------------------------------------------------------- hero */

export const hero = {
  eyebrow: "BACKEND · PLATFORM · RELIABILITY",
  heading: "I build backend systems that replace repeated work with reliable infrastructure.",
  body: `I'm Yashas Kadambi, a former Cisco Software Development Engineer II with roughly three years of production engineering experience. I build cloud infrastructure, event-driven workflows, delivery automation, and reliability improvements. ${gradStatus.sentence}`,
  proofLabel: "VERIFIED PRODUCTION RESULT",
  proofValue: "50% faster deployments",
  proofExplanation:
    "Reduced deployment time by parallelizing independent infrastructure resources.",
};

/* ------------------------------------------------------------- experience */

export const experience = {
  eyebrow: "PROFESSIONAL EXPERIENCE",
  heading: "Backend and cloud infrastructure at Cisco.",
  intro:
    "From August 2023 to January 2025, I worked as a Software Development Engineer on backend platforms and cloud infrastructure at Cisco. I built repeatable infrastructure, automated cross-service workflows, improved delivery speed, and worked with operations and infrastructure teams on production reliability.",
  /**
   * Narrow-viewport variant. The full sentence does not fit a 360×800 chapter
   * without clipping the bullets, so this keeps every essential fact — employer,
   * title, exact dates and scope — and drops only the elaboration, which the
   * bullets state more specifically anyway. Desktop and reduced motion always
   * render the full `intro`.
   */
  introMobile:
    "From August 2023 to January 2025, I was a Software Development Engineer on backend platforms and cloud infrastructure at Cisco.",
  bullets: [
    "Wrote Terraform for EC2, ECS, Lambda, RDS, DynamoDB, SQS, SNS, and IAM, and owned common modules used across the platform.",
    "Configured event-driven workflows across interdependent services.",
    "Improved database performance across PostgreSQL, MongoDB, and Cassandra.",
    "Mentored an intern and helped onboard four engineers through knowledge-transfer sessions and code-quality guidance.",
  ],
  previousRole: "Technical Intern, Cisco · January–July 2023",
  internshipSummary:
    "Built delivery and data tooling, including a CI pipeline that regenerated and published Python and Java SDKs whenever an API changed.",
  progressionNote:
    "I later moved into a Software Development Engineer II role building production software closer to hardware, extending the same reliability mindset across system layers.",
  /** Timeline markers for the visual. Titles and dates stay in the copy above. */
  timeline: ["Intern", "Backend Engineer", "SDE II"],
};

/* --------------------------------------------------------- infrastructure */

export const infrastructure = {
  eyebrow: "INFRASTRUCTURE AUTOMATION",
  heading: "Infrastructure became reviewable, repeatable, and faster to ship.",
  paragraphs: [
    "I wrote Terraform for EC2, ECS, Lambda, RDS, DynamoDB, SQS, SNS, and IAM, then owned common modules used across the platform's infrastructure-as-code migration.",
    "I parallelized independent resources in the deployment plan, reducing deployment time by 50%.",
    "During my Cisco internship, I built a CI pipeline that regenerated and published Python and Java SDKs whenever an API changed, eliminating a four-hour manual update.",
  ],
  results: [
    { label: "Deployment time", value: "−50%" },
    { label: "SDK update", value: "4 hours → automated" },
  ],
  /** Plan categories only. Resource counts are never shown. */
  planCategories: ["Compute", "Data", "Messaging", "Identity", "Permissions"],
  reviewFlag: "Production-impacting change",
  reviewRequired: "Human review required",
  reviewCleared: "Scope reviewed",
  sdkNote: "Four-hour manual update eliminated",
};

/* ---------------------------------------------------------------- events */

export const events = {
  eyebrow: "EVENT-DRIVEN SYSTEMS",
  heading: "Services reacted to changes instead of waiting for manual handoffs.",
  body: "I configured DynamoDB, SQS, and SNS event triggers to automate workflows across interdependent services. Writes emitted events, messaging components separated producers from consumers, and queues allowed downstream work to proceed independently.",
  supporting:
    "The result was less polling, fewer manual transitions, and clearer service boundaries.",
  /** Rendered visibly next to the diagram, not buried in a tooltip. */
  disclaimer: "Conceptual event-flow visualization — not a production topology.",
  /** Every label the animation uses corresponds to a real message state. */
  stateLabels: [
    "Write",
    "Stream",
    "Fan-out",
    "Queued",
    "Processing",
    "Retrying",
    "Acknowledged",
    "Complete",
  ],
  /** Text equivalent of the animation, for reduced motion and screen readers. */
  textEquivalent:
    "A write reaches the datastore and a stream emits an event. A topic fans the event out to two queues, each buffering its own copy, and two worker groups consume independently. When one worker becomes unavailable its queue retains the message and the message enters a retrying state; once the worker returns, the message is processed and acknowledged, and both downstream paths reach a complete state.",
};

/* ----------------------------------------------------------- reliability */

export const reliability = {
  eyebrow: "RELIABILITY & PERFORMANCE",
  heading: "Measure the bottleneck, remove it, and prevent it from returning.",
  paragraphs: [
    "I fixed performance issues across PostgreSQL, MongoDB, and Cassandra, reducing page-load time by 40%.",
    "I worked with operations and infrastructure teams to root-cause four production outages and drove plans to prevent recurrence rather than stopping at immediate recovery.",
    "I also led an authentication migration across seven products with zero production impact by moving through controlled stages instead of treating it as one large cutover.",
  ],
  results: [
    { label: "Page-load time", value: "−40%" },
    { label: "Production outages root-caused", value: "4" },
    { label: "Authentication migration", value: "7 products" },
    { label: "Production impact during migration", value: "0" },
  ],
  /** The reliability loop shown in the visual. */
  loop: ["Detect", "Isolate", "Correct", "Prevent"],
};

/* -------------------------------------------------------------- projects */

export interface BackendProject {
  id: string;
  ownership: string;
  title: string;
  repo: string;
  problem: string;
  contribution: string;
  system?: string;
  stack: string[];
}

/**
 * Exactly two featured projects. Ownership labels are factual: the Cloud-Hack
 * repository names four team members and assigns Yashas sections 1.1–1.3, so it
 * is labelled coursework and team work, and neither project is called deployed.
 */
export const projects: BackendProject[] = [
  {
    id: "cloud-hack",
    ownership: "COURSEWORK · TEAM PROJECT",
    title: "Containerized Microservices Deployment",
    repo: "https://github.com/Yashas120/Cloud-Hack",
    problem:
      "Make a Flask and MongoDB blogging application portable and deployable as a small microservices system.",
    contribution:
      "Configured the MongoDB portion of the Kubernetes deployment, including container settings, the Deployment resource, and Secret-backed credentials.",
    system:
      "Flask application, MongoDB, and supporting services packaged with Docker and orchestrated through Kubernetes manifests.",
    stack: ["Docker", "Kubernetes", "Flask", "MongoDB", "Kubernetes Secrets"],
  },
  {
    id: "bitcoin-java",
    ownership: "ORIGINAL · EDUCATIONAL · COMPLETED",
    title: "Bitcoin from Scratch in Java",
    repo: "https://github.com/Yashas120/Bitcoin-Transactions-in-java",
    problem: "Understand Bitcoin below wallet and library abstractions.",
    contribution:
      "Implemented core Bitcoin primitives in zero-dependency Java, including SHA-256, RIPEMD-160, finite-field elliptic-curve operations, wallet and address creation, and test-network transaction signing and broadcast.",
    stack: ["Java", "SHA-256", "RIPEMD-160", "Elliptic-curve cryptography", "Bitcoin protocol"],
  },
];

export const projectsChapter = {
  eyebrow: "SELECTED PROJECTS",
  heading: "Two systems, described accurately.",
};

/* --------------------------------------------------------------- contact */

export const contact = {
  eyebrow: "CONTACT",
  heading: "Let's build reliable systems.",
  body: "I'm interested in backend, platform, infrastructure, and systems engineering opportunities where software must remain understandable, observable, and dependable in production.",
  currentContext: gradStatus.short,
  technologies:
    "Terraform · AWS · PostgreSQL · MongoDB · Cassandra · Python · Java · Docker · Kubernetes · CI/CD",
  finalStatus: ["healthy", "desired state reached"],
};

/* ------------------------------------------------- verification provenance */

/**
 * Provenance for every figure published on this page. Kept beside the copy so a
 * reviewer can trace a claim without reading the components, and so anything
 * unverified is visibly absent rather than quietly invented.
 */
export const verificationNotes: { claim: string; source: string }[] = [
  {
    claim: "50% faster deployments",
    source: "Cisco backend role — parallelized independent resources in the deployment plan.",
  },
  {
    claim: "Four-hour manual SDK update eliminated",
    source:
      "Cisco internship — CI pipeline regenerating and publishing the Python and Java SDKs on API change.",
  },
  {
    claim: "40% page-load reduction",
    source: "Cisco backend role — PostgreSQL, MongoDB and Cassandra performance work.",
  },
  {
    claim: "Four production outages root-caused",
    source:
      "Cisco backend role — with the operations and infrastructure teams, including recurrence-prevention work.",
  },
  {
    claim: "Seven-product authentication migration, zero production impact",
    source: "Cisco backend role — staged migration rather than a single cutover.",
  },
  {
    claim: "Cloud-Hack contribution scope",
    source:
      "Repository documents four team members; Yashas is assigned sections 1.1–1.3 (MongoDB deployment, container settings, Secret-backed credentials).",
  },
];
