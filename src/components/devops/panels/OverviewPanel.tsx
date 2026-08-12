/**
 * Overview: the delivery loop, and what each stage on this page is evidenced by.
 */

"use client";

import { PanelShell } from "./PanelShell";
import { DeliveryLoop } from "../visuals/DeliveryLoop";
import { DV } from "../tokens";
import { deliveryLoop } from "@/data/devops/profile";

const STAGE_EVIDENCE = deliveryLoop.stages.map((stage, index) => ({
  stage,
  evidence: deliveryLoop.evidence[index],
}));

export function OverviewPanel({ live }: Readonly<{ live?: boolean }>) {
  return (
    <PanelShell
      title="The delivery loop"
      summary="Every claim on this page belongs to one of five stages."
      legendKeys={["verified"]}
      evidenceIds={["deploy-time", "sdk-ci", "page-load"]}
    >
      <DeliveryLoop live={live} />
      <dl className="m-0 mt-3 divide-y" style={{ borderColor: DV.border }}>
        {STAGE_EVIDENCE.map((s) => (
          <div key={s.stage} className="grid grid-cols-[88px_1fr] gap-2 py-1.5">
            <dt className="font-mono text-[12px]" style={{ color: DV.cyan }}>
              {s.stage}
            </dt>
            <dd className="m-0 text-[14px] leading-snug" style={{ color: DV.text }}>
              {s.evidence}
            </dd>
          </div>
        ))}
      </dl>
    </PanelShell>
  );
}
