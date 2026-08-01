import { Metric } from "@/types";

export const metrics: Metric[] = [
  {
    label: "Deployment time",
    value: "-50%",
    context: "Parallelized the deployment plan for PX Cloud services.",
    domains: ["devops"],
  },
  {
    label: "Unit-test time",
    value: "-90%",
    context: "Comprehensive UT framework for new line-card features on NCS 1014.",
    domains: ["os", "devops"],
  },
  {
    label: "Page-load time",
    value: "-40%",
    context: "DB performance work across Postgres, Mongo, and Cassandra on a $2B-revenue app.",
    domains: ["devops", "web"],
  },
  {
    label: "Production outages root-caused",
    value: "4",
    context: "Root-caused with ops/infra; drove a plan to prevent recurrence.",
    domains: ["devops"],
  },
  {
    label: "Auth migration",
    value: "7 products",
    context: "Ping -> Okta migration with zero production impact.",
    domains: ["devops"],
  },
  {
    label: "SDK update time",
    value: "4h -> 0",
    context: "CI pipeline auto-generates and publishes Python & Java SDKs on API change.",
    domains: ["devops", "web"],
  },
  {
    label: "Grading time (TA)",
    value: "-50%",
    context: "Custom Excel macro automating a laborious manual grading step.",
    domains: ["ta"],
  },
  {
    label: "Test-case discussion",
    value: "2d -> 2h",
    context: "Schneider Electric switchgear tool, built end to end.",
    domains: ["web"],
  },
  {
    label: "SWIFT params / speed",
    value: "-34% / +60%",
    context: "Fewer parameters, faster inference vs baseline for lightweight super-resolution.",
    domains: ["research"],
  },
];
