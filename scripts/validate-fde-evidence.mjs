import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const manifest = readFileSync(join(root, "src/data/profileEvidence.ts"), "utf8");
const dossier = readFileSync(join(root, "src/data/fdeDossier.ts"), "utf8");
const annex = readFileSync(join(root, "src/components/fde/dossier/DossierAnnex.tsx"), "utf8");
const range = (prefix, end) => Array.from({ length: end }, (_, index) => `${prefix}-${String(index + 1).padStart(2, "0")}`);
const expected = [...range("PE", 22), ...range("PR", 18), ...range("RS", 2), ...range("TE", 3), ...range("ED", 2), ...range("AW", 6), ...range("CP", 10), ...range("LK", 6)];

const missing = expected.filter((id) => !manifest.includes(`"${id}"`));
if (missing.length) throw new Error(`Missing canonical evidence IDs: ${missing.join(", ")}`);

const excluded = ["PR-15", "PR-16", "PR-17", "PR-18", "AW-01", "AW-03"];
for (const id of excluded) {
  if (!new RegExp(`id:\\s*"${id}"[\\s\\S]{0,240}?reason:\\s*"[^"]+"`).test(manifest)) throw new Error(`${id} must have an explicit exclusion reason.`);
}

if (!manifest.includes("122 + 494 + 40")) throw new Error("Teaching total must be derived from 122 + 494 + 40.");
if ((dossier.match(/id: "\d{2}"/g) ?? []).length !== 11) throw new Error("The FDE film must contain exactly 11 registry scenes.");
for (const anchor of ["evidence-index", "professional-record", "featured-systems", "work-index", "research", "teaching", "education", "recognition", "scope", "contact"]) {
  if (!annex.includes(`id="${anchor}"`)) throw new Error(`Missing annex anchor #${anchor}.`);
}
for (const id of range("PR", 14)) if (!manifest.includes(`id: "${id}"`)) throw new Error(`Missing public project ${id}.`);

const files = [];
const walk = (directory) => {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(?:ts|tsx|js|mjs)$/.test(name)) files.push(path);
  }
};
walk(join(root, "src"));
const source = files.map((file) => readFileSync(file, "utf8")).join("\n");
for (const token of ["[VERIFY BEFORE PUBLICATION", "500,000 API calls", "30 integrations", "96 endpoints", "122 production C source files", "Approximately 430 SDK stubs", "Aquila", "Dione", "Pulsar", "$2B"]) {
  if (source.includes(token)) throw new Error(`Public source contains held or placeholder text: ${token}`);
}

if (!manifest.includes('resumeUrl: "/resume/Yashas-Kadambi-Resume.pdf"')) throw new Error("Verified résumé URL is missing.");
if (!dossier.includes("linkedin: contact.linkedin")) throw new Error("LinkedIn must remain honestly labeled and mapped.");

console.log(`FDE evidence validation passed: ${expected.length} canonical IDs, 14 public projects, 11 scenes.`);

