/**
 * Reliability: the investigation trace, then the performance comparison.
 */

"use client";

import { PanelShell } from "./PanelShell";
import { IncidentTrace } from "../visuals/IncidentTrace";
import { NormalizedComparison } from "../visuals/NormalizedComparison";
import { DV } from "../tokens";

export function ReliabilityPanel({ live }: Readonly<{ live?: boolean }>) {
  return (
    <PanelShell
      title="Investigation trace"
      summary="Detection to prevention, with the signal each phase was read from."
      legendKeys={["verified", "normalized"]}
      evidenceIds={["incident", "page-load"]}
      caption="No timestamps, incident identifiers, severity levels or uptime figures appear here; none are verified for this work."
    >
      <IncidentTrace live={live} />

      <h4 className="mb-1 mt-4 text-[14px] font-semibold" style={{ color: DV.text }}>
        Performance: move filtering closer to the data
      </h4>
      <NormalizedComparison
        measure="page load"
        before={100}
        after={60}
        caption="Normalized representation of a verified 40% page-load improvement."
        accent={DV.green}
      />
    </PanelShell>
  );
}
