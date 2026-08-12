import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root = process.cwd();
const sourcePath = resolve(root, "src/data/evidence.ts");
const source = readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  fileName: sourcePath,
}).outputText;

const module = { exports: {} };
vm.runInNewContext(compiled, { module, exports: module.exports, console }, { filename: sourcePath });
const { evidenceRecords, evidenceExclusions, destinationAnchors } = module.exports;
const errors = [];
const allowedRelationships = new Set([
  "Professional", "Original", "Collaborative", "Coursework", "Research", "Fork", "Teaching", "Concept", "Planned / in development",
]);
const allowedStatuses = new Set([
  "Shipped", "Active", "Published", "Completed", "Archived", "Prototype", "In development", "Concept", "Status unverified",
]);
const anchors = new Set(destinationAnchors);
const seen = new Set();

for (const item of [...evidenceRecords, ...evidenceExclusions]) {
  if (!item.id || seen.has(item.id)) errors.push(`duplicate or empty evidence id: ${item.id || "(empty)"}`);
  seen.add(item.id);
}

for (const record of evidenceRecords) {
  if (!record.sourceIds?.length) errors.push(`${record.id}: missing sourceIds`);
  if (!record.destinations?.length) errors.push(`${record.id}: no rendered destination`);
  for (const destination of record.destinations ?? []) {
    if (!anchors.has(destination)) errors.push(`${record.id}: unknown destination #${destination}`);
  }
  for (const relationship of record.relationship ?? []) {
    if (!allowedRelationships.has(relationship)) errors.push(`${record.id}: invalid relationship ${relationship}`);
  }
  if (record.status && !allowedStatuses.has(record.status)) errors.push(`${record.id}: invalid status ${record.status}`);
  if (record.relationship?.includes("Fork") && record.relationship.includes("Original")) {
    errors.push(`${record.id}: a fork cannot also be labeled Original`);
  }
  if (record.status === "Concept" && !record.relationship?.includes("Concept")) {
    errors.push(`${record.id}: Concept status requires Concept relationship`);
  }
  if (record.disclosure === "public" && JSON.stringify(record).includes("[VERIFY BEFORE PUBLICATION")) {
    errors.push(`${record.id}: unresolved publication marker in public evidence`);
  }
  for (const link of record.hrefs ?? []) {
    if (!link.href || link.href === "#") errors.push(`${record.id}: empty or placeholder href`);
    if (!/^(https:\/\/|\/)/.test(link.href)) errors.push(`${record.id}: unsupported href ${link.href}`);
  }
}

for (const excluded of evidenceExclusions) {
  if (!excluded.sourceIds?.length || !excluded.reason?.trim()) errors.push(`${excluded.id}: exclusion needs sourceIds and reason`);
}

const publicFiles = [
  "src/app/data-plane/page.tsx",
  "src/components/data-plane",
  "src/data/dataPlane.ts",
  "src/data/evidence.ts",
];
const forbidden = [
  /post-FEC BER 0/i,
  /20–48ms|20-48ms/i,
  /owned end-to-end dataplane software/i,
  /\$2B-revenue/i,
  /Ping\s*(?:→|->)\s*Okta/i,
  /document\.body\.style\.overflow/i,
  /preventDefault\s*\(/,
  /setInterval\s*\(/,
];

const files = [];
const collect = async (entry) => {
  const { stat, readdir } = await import("node:fs/promises");
  const absolute = resolve(root, entry);
  const info = await stat(absolute);
  if (info.isDirectory()) {
    for (const child of await readdir(absolute)) {
      const childPath = `${entry}/${child}`;
      const childInfo = await stat(resolve(root, childPath));
      if (childInfo.isDirectory() || /\.(ts|tsx)$/.test(child)) await collect(childPath);
    }
  } else {
    files.push(entry);
  }
};

for (const entry of publicFiles) await collect(entry);
for (const file of files) {
  const value = readFileSync(resolve(root, file), "utf8");
  if (value.includes("[VERIFY BEFORE PUBLICATION")) errors.push(`${file}: unresolved publication marker`);
  for (const pattern of forbidden) if (pattern.test(value)) errors.push(`${file}: forbidden pattern ${pattern}`);
}

if (errors.length) {
  console.error(`Evidence validation failed (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`Evidence validation passed: ${evidenceRecords.length} public records, ${evidenceExclusions.length} explicit exclusions, ${destinationAnchors.length} destinations.`);
