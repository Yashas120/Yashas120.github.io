/**
 * Reliability: the investigation trace, then the performance comparison.
 */

"use client";

import { PanelShell } from "./PanelShell";
import { IncidentTrace } from "../visuals/IncidentTrace";
import { DV } from "../tokens";
import { LayerBoundaryMap } from "../visuals/LayerBoundaryMap";
import type { ChapterId } from "@/data/devops/chapters";

export function ReliabilityPanel({ live, chapter }: Readonly<{ live?: boolean; chapter?: ChapterId }>) {
  if (chapter === "experience") {
    return (
      <PanelShell
        title="System-boundary map"
        summary="Different roles touched different layers; the reliability method carries across them."
        legendKeys={["verified"]}
        evidenceIds={["optical-platform", "iac", "sdk-ci", "schneider-workflow"]}
        caption="Optical work is not labelled as distributed-systems ownership. The map shows boundary depth and transferable practice."
      >
        <LayerBoundaryMap live={live} />
        <p className="m-0 mt-3 text-[14px] leading-snug" style={{ color: DV.muted }}>
          Service → deployment → OS/process → driver/interface → hardware/firmware → signal/telemetry
        </p>
      </PanelShell>
    );
  }

  return (
    <PanelShell
      title="Investigation trace"
      summary="Detection to prevention, with the signal each phase was read from."
      legendKeys={["verified"]}
      evidenceIds={["incident", "page-load", "auth-api", "constrained-security", "firmware-rca", "optical-platform"]}
      caption="No timestamps, incident identifiers, severity levels or uptime figures appear here; none are verified for this work."
    >
      <IncidentTrace live={live} />

      <h4 className="mb-1 mt-4 text-[14px] font-semibold" style={{ color: DV.text }}>
        Performance: move filtering closer to the data
      </h4>
      <p className="m-0 mt-2 text-[14px] leading-snug" style={{ color: DV.muted }}>
        Application traces showed large fetches followed by in-memory filtering; moving the work closer to the data corrected the query path.
      </p>

    </PanelShell>
  );
}
