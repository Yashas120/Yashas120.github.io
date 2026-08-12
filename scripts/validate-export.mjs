import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const exportRoot = resolve(root, process.env.EXPORT_DIR || "out");
const pagePath = resolve(exportRoot, "data-plane/index.html");
const errors = [];

if (!existsSync(pagePath)) {
  console.error(`Missing static export: ${pagePath}`);
  process.exit(1);
}

const html = readFileSync(pagePath, "utf8");
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const idSet = new Set();
for (const id of ids) {
  if (idSet.has(id)) errors.push(`duplicate id: ${id}`);
  idSet.add(id);
}

for (const match of html.matchAll(/\shref="#([^"]+)"/g)) {
  if (!idSet.has(match[1])) errors.push(`unresolved route anchor: #${match[1]}`);
}

const requiredAnchors = ["top", "story", "optical-experience", "experience", "featured-systems", "work-index", "research", "teaching", "education", "recognition", "leadership", "scope", "contact"];
for (const anchor of requiredAnchors) if (!idSet.has(anchor)) errors.push(`missing required anchor: #${anchor}`);

const forbidden = ["[VERIFY BEFORE PUBLICATION", "Aquila", "post-FEC BER 0", "20-48ms", "20–48ms"];
for (const phrase of forbidden) if (html.includes(phrase)) errors.push(`forbidden exported phrase: ${phrase}`);

const resumePath = resolve(exportRoot, "resume/Yashas-Kadambi-Resume.pdf");
if (!html.includes('/resume/Yashas-Kadambi-Resume.pdf')) errors.push("approved résumé link is absent");
if (!existsSync(resumePath)) errors.push("approved résumé PDF is absent from export");
else if (!readFileSync(resumePath).subarray(0, 4).equals(Buffer.from("%PDF"))) errors.push("résumé asset is not a PDF");

for (const text of [
  "Skip to professional experience",
  "This is my complete engineering portfolio, ordered through a dataplane and systems-software lens.",
  "Complete verified-work index",
  "Teaching complex systems at scale",
  "Engineering scope, proven in the work above",
]) {
  if (!html.includes(text)) errors.push(`missing rendered contract text: ${text}`);
}

if (errors.length) {
  console.error(`Export validation failed (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`Export validation passed: ${ids.length} unique IDs and ${requiredAnchors.length} required anchors.`);
