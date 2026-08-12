/**
 * The collapsible evidence drawer under each inspector visual.
 *
 * Built on native <details>/<summary>, so it is keyboard operable, screen-reader
 * announced and functional with scripting disabled — none of which a custom
 * disclosure widget would give for free.
 *
 * Each record shows problem, contribution, outcome, technology, ownership,
 * classification, disclosure state and a public link when one exists. The
 * ownership verb is never inflated: "contributed" and "team" appear where they are
 * the truth.
 */

"use client";

import { ArrowUpRight } from "lucide-react";
import { classLabel, evidenceById } from "@/data/devops/evidence";
import { DV } from "./tokens";

const DISCLOSURE_NOTE: Record<string, string> = {
  public: "Public",
  "approval-required": "Detail withheld pending review",
  private: "Not published",
};

function Row({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="grid grid-cols-[92px_1fr] gap-2 py-1">
      <dt className="font-mono text-[12px]" style={{ color: DV.muted }}>
        {label}
      </dt>
      <dd className="m-0 text-[14px] leading-snug" style={{ color: DV.text }}>
        {value}
      </dd>
    </div>
  );
}

export interface EvidenceDrawerProps {
  ids: string[];
  /** Open by default where the drawer is the panel's primary content. */
  defaultOpen?: boolean;
  /** Summary text; defaults to "Evidence (n)". */
  label?: string;
}

export function EvidenceDrawer({ ids, defaultOpen = false, label }: Readonly<EvidenceDrawerProps>) {
  const facts = ids.map(evidenceById).filter((f) => f !== undefined);
  if (facts.length === 0) return null;

  return (
    <details className="mt-4 rounded-lg border" style={{ borderColor: DV.border }} open={defaultOpen}>
      <summary
        className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 px-3 font-mono text-[12px] [&::-webkit-details-marker]:hidden"
        style={{ color: DV.amber }}
      >
        <span>{label ?? `Evidence (${facts.length})`}</span>
        <span aria-hidden style={{ color: DV.muted }}>
          problem · contribution · outcome
        </span>
      </summary>
      <ul className="m-0 list-none space-y-3 border-t p-3" style={{ borderColor: DV.border }}>
        {facts.map((f) => (
          <li key={f.id} className="dv-card p-3">
            <p className="m-0 text-[15px] font-medium leading-snug" style={{ color: DV.text }}>
              {f.shortClaim}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="dv-chip" style={{ color: f.classification === "production" ? DV.green : DV.muted }}>
                {classLabel[f.classification]}
              </span>
              <span className="dv-chip">{f.ownership}</span>
              <span className="dv-chip" style={{ color: f.disclosure === "public" ? DV.muted : DV.amber }}>
                {DISCLOSURE_NOTE[f.disclosure]}
              </span>
            </div>
            <dl className="mt-2 mb-0 divide-y" style={{ borderColor: DV.border }}>
              <Row label="source" value={f.sourceLabel} />
              <Row label="problem" value={f.problem} />
              <Row label="contribution" value={f.contribution} />
              <Row label="outcome" value={f.outcome} />
              <Row label="technology" value={f.technologies.join(" · ")} />
            </dl>
            {f.links?.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${l.label} — ${f.shortClaim} (opens in a new tab)`}
                className="mt-2 inline-flex min-h-[44px] items-center gap-1 text-[14px]"
                style={{ color: DV.cyan }}
              >
                {l.label} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </a>
            ))}
            {f.sourceHref && !f.links?.some((link) => link.href === f.sourceHref) && (
              <a
                href={f.sourceHref}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Open source record — ${f.shortClaim} (opens in a new tab)`}
                className="mt-2 inline-flex min-h-[44px] items-center gap-1 text-[14px]"
                style={{ color: DV.cyan }}
              >
                Open source record <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </a>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}
