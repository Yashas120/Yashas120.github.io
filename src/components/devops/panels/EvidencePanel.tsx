/**
 * Evidence: the ledger.
 *
 * This is where a DevTools pastiche would put a Lighthouse gauge. A self-assigned
 * score would be meaningless here — nobody audits a portfolio's own claims — so the
 * panel shows capability, evidence and classification instead, and every row
 * expands to problem, contribution, outcome, technology, ownership and disclosure
 * state. There are no numerical personal scores anywhere on this route.
 */

"use client";

import { classLabel, publicEvidence } from "@/data/devops/evidence";
import { PanelShell } from "./PanelShell";
import { DV } from "../tokens";

const CLASS_ACCENT: Record<string, string> = {
  production: DV.green,
  coursework: DV.cyan,
  "team-project": DV.cyan,
  "public-project": DV.cyan,
  "public-fork": DV.cyan,
  credential: DV.violet,
  illustration: DV.violet,
  research: DV.violet,
  teaching: DV.cyan,
};

export function EvidencePanel(_props: Readonly<{ live?: boolean }>) {
  return (
    <PanelShell
      title="Evidence ledger"
      summary="Each capability, the evidence for it, and what kind of evidence it is."
      legendKeys={["verified", "project", "illustration"]}
      // The complete ledger is already visible in the table. Detailed drawers
      // live beside the corresponding document evidence, avoiding three large
      // duplicate copies in the dock, tablet panel, and mobile sheet.
      evidenceIds={[]}
      caption="No self-scored gauges: every row resolves to a claim that can be discussed in an interview."
    >
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Capability, supporting evidence, and classification for each claim on this page.
        </caption>
        <thead>
          <tr>
            {["Capability", "Evidence", "Classification"].map((h) => (
              <th
                key={h}
                scope="col"
                className="border-b pb-1.5 font-mono text-[12px] font-normal"
                style={{ borderColor: DV.border, color: DV.muted }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {publicEvidence.map((e) => (
            <tr key={e.id} className="border-b align-top" style={{ borderColor: DV.border }}>
              <th scope="row" className="py-2 pr-2 text-[14px] font-medium leading-snug" style={{ color: DV.text }}>
                {e.capability}
              </th>
              <td className="py-2 pr-2 text-[14px] leading-snug" style={{ color: DV.muted }}>
                {e.shortClaim}
              </td>
              <td className="py-2 font-mono text-[12px] leading-snug" style={{ color: CLASS_ACCENT[e.classification] }}>
                {classLabel[e.classification]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PanelShell>
  );
}
