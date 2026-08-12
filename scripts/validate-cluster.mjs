import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceFiles = [
  "src/lib/clusterContent.ts",
  "src/components/cluster/ClusterStaticStory.tsx",
  "src/components/cluster/ClusterFilm.tsx",
  "src/components/cluster/CompleteProfileIndex.tsx",
  "src/components/cluster/diagrams/work.tsx",
  "src/components/cluster/diagrams/platform.tsx",
  "src/components/cluster/diagrams/projects.tsx",
];
const source = sourceFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");

const required = [
  "I make coordinated systems safer to change.",
  "About three years at Cisco",
  "Software Engineer II, Optical Systems",
  "Software Engineer, Backend & Cloud",
  "Technical Intern, PX Cloud",
  "Schneider Electric",
  "Summer Intern",
  "Spark Streaming for Machine Learning",
  "Cloud Provisioning using RDBMS",
  "Bitcoin Transactions in Java",
  "SSP",
  "Toward Faster and Efficient Lightweight Image Super-Resolution",
  "Monitoring and Alert Systems for Underwater Data Centers",
  "Image Processing & Computer Vision",
  "Data Analytics",
  "Graduate Deep Learning",
  "University of California San Diego",
  "PES University",
  "Every substantive project, with provenance.",
  "Let's talk about systems that have to change safely.",
];

const forbidden = [
  /\bRaft\b/i,
  /\bPaxos\b/i,
  /\bquorum\b/i,
  /\breplicas?\b/i,
  /leader election/i,
  /exactly[- ]once/i,
  /distributed SGD/i,
  /gradient reduction/i,
  /custom operator/i,
  /custom broker/i,
  /committed log/i,
  /consistent hash/i,
  /chaos lab/i,
  /synchronized related SQL/i,
  /\bexact\s*:/i,
  /\bapproved\s*:/i,
  /\[VERIFY BEFORE PUBLICATION:/i,
];

const failures = [];
for (const text of required) {
  if (!source.includes(text)) failures.push(`missing required content: ${text}`);
}
for (const pattern of forbidden) {
  if (pattern.test(source)) failures.push(`forbidden public-source pattern: ${pattern}`);
}

const spans = [...source.matchAll(/span:\s*(\d+)/g)].map((match) => Number(match[1]));
if (spans.length !== 6 || spans.reduce((sum, span) => sum + span, 0) !== 900) {
  failures.push(`scene spans must be six chapters totaling 900svh; saw ${spans.join(", ")}`);
}

const htmlPath = path.join(root, "out/cluster/index.html");
if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, "utf8");
  const renderedText = html
    .replace(/<!--.*?-->/gs, "")
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&#x27;", "'")
    .replace(/\s+/g, " ");
  const h1Count = (html.match(/<h1\b/g) ?? []).length;
  if (h1Count !== 1) failures.push(`rendered /cluster must have one H1; saw ${h1Count}`);
  for (const text of required) {
    if (!renderedText.includes(text)) {
      failures.push(`rendered /cluster missing: ${text}`);
    }
  }
  if (html.includes("[VERIFY BEFORE PUBLICATION:")) failures.push("rendered /cluster contains a verification marker");
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("/cluster content boundary, coverage, six-scene span, and rendered H1 checks passed.");
