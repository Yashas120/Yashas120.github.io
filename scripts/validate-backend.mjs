import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const exportRoot = resolve(process.cwd(), process.env.EXPORT_DIR || "out");
const pagePath = resolve(exportRoot, "backend/index.html");
const errors = [];

if (!existsSync(pagePath)) {
  console.error(`Missing static export: ${pagePath}`);
  process.exit(1);
}

const html = readFileSync(pagePath, "utf8");
const text = html
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/<[^>]+>/g, " ")
  .replaceAll("&amp;", "&")
  .replaceAll("&#x27;", "'")
  .replaceAll("&mdash;", "—")
  .replace(/\s+/g, " ");
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const idSet = new Set();

for (const id of ids) {
  if (idSet.has(id)) errors.push(`duplicate id: ${id}`);
  idSet.add(id);
}

for (const match of html.matchAll(/\shref="#([^"]+)"/g)) {
  if (!idSet.has(match[1])) errors.push(`unresolved route anchor: #${match[1]}`);
}

const requiredScenes = [
  "overview", "experience", "infrastructure", "events", "reliability", "systems",
  "automation", "projects", "research-teaching", "work-index", "contact",
];
for (const id of requiredScenes) if (!idSet.has(id)) errors.push(`missing required scene: #${id}`);

if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) errors.push("the route must export exactly one h1");

const requiredText = [
  "50% faster deployments",
  "40% faster page loads",
  "roughly 4 hours of manual release work",
  "approximately 500 GB AWS Glue data pipeline as a PROOF OF CONCEPT",
  "onboarded four engineers",
  "This is my complete engineering portfolio, ordered through a backend and platform lens.",
  "15 of 15 work records shown",
  "COURSEWORK TEAM COMPLETED Cloud-Hack — Containerized Blogging Microservices",
  "ORIGINAL EDUCATIONAL COMPLETED Bitcoin Transactions from Scratch in Java",
  "ORIGINAL COMPUTER VISION COMPLETED Multiview 3D Reconstruction from 2D Images",
  "RESEARCH COLLABORATIVE PUBLISHED SWIFT — Lightweight Image Super-Resolution",
  "656 learners",
  "Prof. C. N. R. Rao Merit Scholarship",
  "Evidence notes and exclusion register",
  "SunSET / UCSD Academic-History Utility",
  "OOAD-Project-Blockchain",
  "ykadambi@ucsd.edu",
];
for (const phrase of requiredText) if (!text.includes(phrase)) errors.push(`missing rendered contract text: ${phrase}`);

for (const anchor of ["bitcoin", "chocollvm", "swift", "multiview", "cifar", "parallel", "cloud", "yelp", "petra"]) {
  if (!html.includes(`/demos#${anchor}`)) errors.push(`missing demo destination: /demos#${anchor}`);
}

const resumePath = resolve(exportRoot, "resume/Yashas-Kadambi-Resume.pdf");
if (!html.includes('/resume/Yashas-Kadambi-Resume.pdf')) errors.push("approved résumé link is absent");
if (!existsSync(resumePath)) errors.push("approved résumé PDF is absent from export");
else if (!readFileSync(resumePath).subarray(0, 4).equals(Buffer.from("%PDF"))) errors.push("résumé asset is not a PDF");

for (const phrase of ["7 products", "$2B", "Retrying", "Solo project", "dispatch intent", "loop closed", "gated faster deployments"]) {
  if (text.includes(phrase)) errors.push(`forbidden exported phrase: ${phrase}`);
}

if (errors.length) {
  console.error(`Backend export validation failed (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`Backend export validation passed: ${ids.length} unique IDs, ${requiredScenes.length} scenes, and 9 demo destinations.`);
