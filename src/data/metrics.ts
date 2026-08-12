import { Metric } from "@/types";

export const metrics: Metric[] = [
  {
    label: "Deployment time",
    value: "Gated",
    context: "Separated parallel-safe stages from prerequisite-bound deployment work.",
    domains: ["devops"],
  },
  {
    label: "Line-card test feedback",
    value: "Local",
    context: "Hardware-independent CMocka architecture for production line-card code; disclosure-sensitive timings are withheld.",
    domains: ["os", "devops"],
  },
  {
    label: "Page-load time",
    value: "Query-led",
    context: "Moved filtering and query work closer to Postgres, Mongo, and Cassandra.",
    domains: ["devops", "web"],
  },
  {
    label: "Production failures diagnosed",
    value: "Cross-layer",
    context: "Root-caused with operations and infrastructure partners; drove prevention work.",
    domains: ["devops"],
  },
  {
    label: "SDK update time",
    value: "Manual -> CI",
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
