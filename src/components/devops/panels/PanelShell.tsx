/**
 * Shared frame for the six inspector panels.
 *
 * The same component serves all three renderings — the docked desktop inspector,
 * the inline tablet copies and the mobile bottom sheet — so a panel's content and
 * its labels cannot diverge between viewports.
 *
 * Two rules are enforced structurally here rather than left to each panel:
 *  - a legend is always present, naming which of the four kinds of evidence the
 *    panel is showing;
 *  - the prose equivalent sits next to the diagram, not inside it.
 */

"use client";

import { legend } from "@/data/devops/evidence";
import { EvidenceDrawer } from "../EvidenceDrawer";
import { DV } from "../tokens";

export type LegendKey = (typeof legend)[number]["key"];

const LEGEND_ACCENT: Record<string, string> = {
  verified: DV.green,
  normalized: DV.amber,
  project: DV.cyan,
  illustration: DV.violet,
};

export interface PanelShellProps {
  /** Panel heading, e.g. "Delivery graph". */
  title: string;
  /** One line on what the panel is for. */
  summary: string;
  /** Which legend entries apply to this panel. */
  legendKeys: LegendKey[];
  /** Evidence records the drawer should list. */
  evidenceIds: string[];
  /** Permanent caption, used where the visual must be labelled at all times. */
  caption?: string;
  children: React.ReactNode;
}

export function PanelShell({
  title,
  summary,
  legendKeys,
  evidenceIds,
  caption,
  children,
}: Readonly<PanelShellProps>) {
  const entries = legend.filter((l) => (legendKeys as string[]).includes(l.key));

  return (
    <div className="p-4">
      <h3 className="m-0 text-[16px] font-semibold" style={{ color: DV.text }}>
        {title}
      </h3>
      <p className="mb-3 mt-1 text-[14px] leading-snug" style={{ color: DV.muted }}>
        {summary}
      </p>

      {children}

      {caption && (
        <p className="mt-2 font-mono text-[12px] leading-snug" style={{ color: DV.muted }}>
          {caption}
        </p>
      )}

      <ul className="mt-3 mb-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
        {entries.map((l) => (
          <li key={l.key} className="flex items-baseline gap-1.5 font-mono text-[12px]" style={{ color: DV.muted }}>
            <span aria-hidden className="inline-block h-2 w-2 rounded-sm" style={{ background: LEGEND_ACCENT[l.key] }} />
            <span style={{ color: LEGEND_ACCENT[l.key] }}>{l.label}</span>
            <span>— {l.note}</span>
          </li>
        ))}
      </ul>

      <EvidenceDrawer ids={evidenceIds} />
    </div>
  );
}
