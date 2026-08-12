/**
 * Panel id → component. One map so the dock, the inline tablet copies and the
 * mobile sheet can never render different panels for the same id.
 */

"use client";

import type { PanelId } from "@/data/devops/chapters";
import { DevExPanel } from "./DevExPanel";
import { EvidencePanel } from "./EvidencePanel";
import { InfrastructurePanel } from "./InfrastructurePanel";
import { OverviewPanel } from "./OverviewPanel";
import { PipelinePanel } from "./PipelinePanel";
import { ReliabilityPanel } from "./ReliabilityPanel";

export interface PanelProps {
  /** Ambient motion runs only in the docked inspector. */
  live?: boolean;
}

export const PANELS: Record<PanelId, (props: PanelProps) => React.JSX.Element> = {
  overview: OverviewPanel,
  pipeline: PipelinePanel,
  infrastructure: InfrastructurePanel,
  reliability: ReliabilityPanel,
  devex: DevExPanel,
  evidence: EvidencePanel,
};

export function Panel({ id, live }: Readonly<{ id: PanelId; live?: boolean }>) {
  const Component = PANELS[id];
  return <Component live={live} />;
}
