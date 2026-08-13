import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root = process.cwd();
const manifest = readFileSync(join(root, "src/data/profileEvidence.ts"), "utf8");
const dossier = readFileSync(join(root, "src/data/fdeDossier.ts"), "utf8");
const annex = readFileSync(join(root, "src/components/fde/dossier/DossierAnnex.tsx"), "utf8");
const range = (prefix, end) => Array.from({ length: end }, (_, index) => `${prefix}-${String(index + 1).padStart(2, "0")}`);
const expected = [...range("PE", 22), ...range("PR", 18), ...range("RS", 2), ...range("TE", 3), ...range("ED", 2), ...range("AW", 6), ...range("CP", 10), ...range("LK", 6)];

const compiled = ts.transpileModule(manifest, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  fileName: "profileEvidence.ts",
}).outputText;
const evidenceModule = { exports: {} };
vm.runInNewContext(compiled, { module: evidenceModule, exports: evidenceModule.exports, console }, { filename: "profileEvidence.ts" });
const { contact, exclusionRecords, publicCoverage, workIndex } = evidenceModule.exports;

const missing = expected.filter((id) => !manifest.includes(`"${id}"`));
if (missing.length) throw new Error(`Missing canonical evidence IDs: ${missing.join(", ")}`);

const publicById = new Map(publicCoverage.map((record) => [record.id, record]));
const excludedById = new Map(exclusionRecords.map((record) => [record.id, record]));
for (const id of expected) {
  if (publicById.has(id) === excludedById.has(id)) throw new Error(`${id} must have exactly one public destination or exclusion record.`);
}
for (const record of publicCoverage) if (!record.destinations?.length) throw new Error(`${record.id} has no rendered destination.`);
for (const record of exclusionRecords) if (!record.reason?.trim()) throw new Error(`${record.id} has no exclusion reason.`);
if (workIndex.length !== 14) throw new Error(`Expected 14 unconditional public projects; found ${workIndex.length}.`);
for (const record of workIndex) {
  for (const field of ["ownership", "status", "domain", "publicCopy", "evidenceLinks"]) {
    if (!(field in record) || record[field] === "") throw new Error(`${record.id} is missing ${field}.`);
  }
  if (!Array.isArray(record.evidenceLinks)) throw new Error(`${record.id} has no explicit evidence-link decision.`);
}

if (!manifest.includes("122 + 494 + 40")) throw new Error("Teaching total must be derived from 122 + 494 + 40.");
if ((dossier.match(/id: "\d{2}"/g) ?? []).length !== 11) throw new Error("The FDE film must contain exactly 11 registry scenes.");
for (const anchor of ["evidence-index", "professional-record", "featured-systems", "work-index", "research", "teaching", "education", "recognition", "scope", "contact"]) {
  if (!annex.includes(`id="${anchor}"`)) throw new Error(`Missing annex anchor #${anchor}.`);
}
for (const id of range("PR", 14)) if (!publicById.has(id)) throw new Error(`Missing public project ${id}.`);

const files = [];
const walk = (directory) => {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(?:ts|tsx|js|mjs)$/.test(name)) files.push(path);
  }
};
walk(join(root, "src"));
const fdeFiles = files.filter((file) => /(?:\/fde\/|\/components\/fde\/|\/data\/(?:fde|fdeDossier|profileEvidence)\.ts$)/.test(file));
const source = fdeFiles.map((file) => readFileSync(file, "utf8")).join("\n");
for (const token of ["[VERIFY BEFORE PUBLICATION", "500,000 API calls", "30 integrations", "96 endpoints", "122 production C source files", "Approximately 430 SDK stubs", "Aquila", "Dione", "Pulsar", "$2B"]) {
  if (source.includes(token)) throw new Error(`Public source contains held or placeholder text: ${token}`);
}

if (contact.resumeUrl) {
  const resumePath = join(root, "public", contact.resumeUrl.replace(/^\//, ""));
  if (!existsSync(resumePath)) throw new Error(`Configured résumé does not exist: ${contact.resumeUrl}`);
}
const header = readFileSync(join(root, "src/components/fde/dossier/DossierHeader.tsx"), "utf8");
if (!annex.includes("...(contact.resumeUrl ?") || !header.includes("fdeChrome.resumeUrl ?")) {
  throw new Error("Résumé controls must remain conditional on a verified URL.");
}
if (!dossier.includes("linkedin: contact.linkedin")) throw new Error("LinkedIn must remain honestly labeled and mapped.");

const dossierFiles = readdirSync(join(root, "src/components/fde/dossier"), { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".tsx"))
  .map((entry) => readFileSync(join(root, "src/components/fde/dossier", entry.name), "utf8"))
  .join("\n");
for (const pattern of [/preventDefault\s*\(/, /addEventListener\s*\(\s*["'](?:wheel|touchmove)/]) {
  if (pattern.test(dossierFiles)) throw new Error(`FDE stage intercepts native scroll: ${pattern}`);
}

console.log(`FDE evidence validation passed: ${expected.length} canonical IDs, 14 public projects, 11 scenes.`);
