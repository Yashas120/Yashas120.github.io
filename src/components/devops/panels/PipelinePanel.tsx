/**
 * Pipeline: the dependency graph and its explicit prerequisite gates.
 */

"use client";

import { PanelShell } from "./PanelShell";
import { DependencyGraph } from "../visuals/DependencyGraph";

export function PipelinePanel({ live }: Readonly<{ live?: boolean }>) {
  return (
    <PanelShell
      title="Delivery graph"
      summary="Independent resources run concurrently; dependent services wait behind a gate."
      legendKeys={["verified"]}
      evidenceIds={["deploy-time", "iac"]}
      caption="Independent work is drawn solid, waiting work dashed. No per-node duration is shown, because none is measured."
    >
      <DependencyGraph live={live} />
    </PanelShell>
  );
}
