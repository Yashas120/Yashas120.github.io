"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { excludedWorkIds, indexWorkIds, workById, type WorkEvidence } from "@/data/backend";

const filters = ["All", "Backend", "Systems", "Cloud", "Research", "Coursework", "Prototype", "Needs verification"] as const;
type Filter = (typeof filters)[number];

function matches(work: WorkEvidence, filter: Filter) {
  if (filter === "All") return true;
  if (filter === "Needs verification") return work.status.includes("REQUIRES VERIFICATION");
  const haystack = [...work.routeRelevance, ...work.ownership, ...work.status].join(" ").toLowerCase();
  return haystack.includes(filter.toLowerCase());
}

function Labels({ work, featured = false }: Readonly<{ work: WorkEvidence; featured?: boolean }>) {
  const labels = featured && work.featuredLabels
    ? work.featuredLabels
    : [...work.ownership, ...(work.descriptors ?? []), ...work.status];
  return (
    <div className="bk-labels" aria-label="Ownership, classification, and status">
      {labels.map((label, index) => <span key={`${label}-${index}`} className={label === "REQUIRES VERIFICATION" ? "is-review" : ""}>{label}</span>)}
    </div>
  );
}

function EvidenceLinks({ work }: Readonly<{ work: WorkEvidence }>) {
  if (!work.links.length) return <span className="bk-no-action">No verified public action</span>;
  return (
    <div className="bk-evidence-links">
      {work.links.map((link) => {
        const external = link.href.startsWith("http");
        return (
          <a key={`${work.id}-${link.label}`} href={link.href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
            {link.label}{external && <ArrowUpRight aria-hidden />}
          </a>
        );
      })}
    </div>
  );
}

export function WorkLabels({ work, featured = false }: Readonly<{ work: WorkEvidence; featured?: boolean }>) {
  return <Labels work={work} featured={featured} />;
}

export function WorkEvidenceLinks({ work }: Readonly<{ work: WorkEvidence }>) {
  return <EvidenceLinks work={work} />;
}

export function WorkIndex() {
  const [filter, setFilter] = useState<Filter>("All");
  const rows = useMemo(() => indexWorkIds.map((id) => workById[id]).filter((work) => matches(work, filter)), [filter]);

  return (
    <div className="bk-index-shell">
      <div className="bk-filters" aria-label="Filter work index">
        {filters.map((item) => (
          <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>
      <p className="bk-result-count" aria-live="polite">{rows.length} of {indexWorkIds.length} work records shown</p>

      <ol className="bk-work-index">
        {rows.map((work) => (
          <li key={work.id}>
            <div className="bk-work-index__heading">
              <h3>{work.title}</h3>
              <Labels work={work} />
            </div>
            <p>{work.summary}</p>
            <p className="bk-contribution"><strong>Contribution.</strong> {work.contribution}</p>
            <div className="bk-work-index__footer">
              <span>{work.routeRelevance.join(" · ")}</span>
              <EvidenceLinks work={work} />
            </div>
          </li>
        ))}
      </ol>

      <details className="bk-evidence-notes">
        <summary>Evidence notes and exclusion register</summary>
        <p>Unresolved role dates, employer scale, credential status, and team contribution boundaries use public-safe copy and remain flagged in canonical editorial data.</p>
        <ul>
          {excludedWorkIds.map((id) => {
            const work = workById[id];
            return <li key={id}><strong>{work.title}.</strong> {work.contribution}</li>;
          })}
        </ul>
      </details>
    </div>
  );
}
