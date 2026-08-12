import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const exportRoot = resolve(root, process.argv[2] ?? ".next-devtools-verify");
const pagePath = resolve(exportRoot, "devtools/index.html");
const demosPath = resolve(exportRoot, "demos/index.html");
const errors = [];

if (!existsSync(pagePath)) {
  console.error(`Missing static /devtools export: ${pagePath}`);
  process.exit(1);
}

const html = readFileSync(pagePath, "utf8");
const demosHtml = existsSync(demosPath) ? readFileSync(demosPath, "utf8") : "";
const sourceFiles = [
  "src/app/devtools/page.tsx",
  "src/app/devtools/layout.tsx",
  "src/app/globals.css",
  "src/components/devops/InspectorTabs.tsx",
  "src/components/devops/MobileInspectorSheet.tsx",
  "src/components/devops/useInspectorState.ts",
];
const source = sourceFiles.map((file) => readFileSync(resolve(root, file), "utf8")).join("\n");

const requiredText = [
  "approximately three years",
  "50% faster deployments",
  "Cisco",
  "Schneider Electric",
  "SWIFT",
  "Multiview 3D Reconstruction",
  "Bitcoin Transactions from Scratch in Java",
  "Chocollvm",
  "SSML Spark Streaming",
  "Restaurant Closure-Risk",
  "Systems and Parallel Programming",
  "PeTra",
  "Multilingual RAG Voice Assistant",
  "Underwater Data Center",
  "656 learners",
  "Image Processing and Computer Vision",
  "Data Analytics",
  "Deep Learning Theory and Practices",
  "University of California San Diego",
  "PES University",
  "AWS Certified Developer",
  "Prof. C. N. R. Rao",
  "READY FOR REVIEW",
];

for (const text of requiredText) if (!html.includes(text)) errors.push(`missing required rendered text: ${text}`);

const chapterIds = ["overview", "delivery", "infrastructure", "reliability", "devex", "experience", "systems", "complete-work", "enablement", "contact"];
for (const id of chapterIds) if (!html.includes(`<section id="${id}"`)) errors.push(`missing chapter #${id}`);

const forbidden = [
  /all 200 OK/i,
  /yashas\.dev/i,
  /contact\(\)/,
  /96\s*\/\s*94\s*\/\s*92\s*\/\s*88/,
  /\[VERIFY BEFORE PUBLICATION/i,
  /fake (?:request|log|telemetry)/i,
];
for (const pattern of forbidden) if (pattern.test(html)) errors.push(`forbidden rendered content: ${pattern}`);

const h1Count = (html.match(/<h1(?:\s|>)/g) ?? []).length;
if (h1Count !== 1) errors.push(`expected one h1, found ${h1Count}`);
if (!html.includes('rel="canonical" href="https://yashas120.github.io/devtools/"')) errors.push("missing canonical metadata");
if (!html.includes('property="og:image" content="https://yashas120.github.io/devtools-og.png"')) errors.push("missing route social image");
if (!html.includes('type="application/ld+json"')) errors.push("missing Person JSON-LD");

for (const behavior of ["history.pushState", "history.replaceState", 'addEventListener("popstate"', 'e.key === "Escape"', 'key === "ArrowRight"', 'key === "Home"', "prefers-reduced-motion"]) {
  if (!source.includes(behavior)) errors.push(`missing interaction/reduced-motion contract: ${behavior}`);
}
for (const forbiddenBehavior of ["onWheel", "onTouchMove", "scroll-snap-type"]) {
  if (source.includes(forbiddenBehavior)) errors.push(`forbidden scroll behavior: ${forbiddenBehavior}`);
}

const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1].replaceAll("&amp;", "&"));
for (const href of new Set(hrefs)) {
  if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/_next/")) continue;
  const [rawPathname, anchor] = href.split("#");
  const pathname = rawPathname.split("?")[0];
  const trimmed = pathname.replace(/^\//, "").replace(/\/$/, "");
  const relative = pathname === "/" ? "index.html" : /\.[a-z0-9]+$/i.test(trimmed) ? trimmed : `${trimmed}/index.html`;
  if (!existsSync(resolve(exportRoot, relative))) errors.push(`broken internal link: ${href}`);
  if (pathname === "/demos" && anchor && !demosHtml.includes(`id="${anchor}"`)) errors.push(`missing demo anchor: ${href}`);
}

if (!existsSync(resolve(exportRoot, "resume/Yashas-Kadambi-Resume.pdf"))) errors.push("public résumé PDF missing from export");

if (errors.length) {
  console.error(`DevTools validation failed (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`DevTools validation passed: ${chapterIds.length} chapters, ${requiredText.length} coverage assertions, ${new Set(hrefs).size} unique links.`);
