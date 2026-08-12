/**
 * Pipeline: the dependency graph plus the one measured ratio behind it.
 */

"use client";

import { PanelShell } from "./PanelShell";
import { DependencyGraph } from "../visuals/DependencyGraph";
import { NormalizedComparison } from "../visuals/NormalizedComparison";

export function PipelinePanel({ live }: Readonly<{ live?: boolean }>) {
  return (
    <PanelShell
      title="Delivery graph"
      summary="Independent resources run concurrently; dependent services wait behind a gate."
      legendKeys={["verified", "normalized"]}
      evidenceIds={["deploy-time", "iac"]}
      caption="Independent work is drawn solid, waiting work dashed. No per-node duration is shown, because none is measured."
    >
      <DependencyGraph live={live} />
      <div className="mt-4">
        <NormalizedComparison
          measure="deployment duration"
          before={100}
          after={50}
          caption="Normalized representation of an approximately 50% overall deployment-time reduction. It is not a measured duration in minutes."
        />
      </div>
    </PanelShell>
  );
}
