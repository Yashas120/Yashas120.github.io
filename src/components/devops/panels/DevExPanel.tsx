/**
 * DevEx: the SDK delivery path, the effort it removed, and the local feedback loop.
 *
 * The comparison shows repeated manual work becoming automated while version
 * selection remains an intentional human decision.
 */

"use client";

import { devex } from "@/data/devops/profile";
import { PanelShell } from "./PanelShell";
import { SdkPipeline } from "../visuals/SdkPipeline";
import { DV } from "../tokens";

export function DevExPanel({ live }: Readonly<{ live?: boolean }>) {
  return (
    <PanelShell
      title="Automation paths"
      summary="Automate the routine work; keep the release decision human."
      legendKeys={["verified"]}
      evidenceIds={["sdk-ci", "test-loop"]}
    >
      <SdkPipeline live={live} />

      <dl className="m-0 mt-3 divide-y" style={{ borderColor: DV.border }}>
        <div className="flex items-baseline justify-between gap-3 py-1.5">
          <dt className="font-mono text-[12px]" style={{ color: DV.muted }}>
            manual generation/publication
          </dt>
          <dd className="m-0 font-mono text-[14px]" style={{ color: DV.text }}>
            repeated manual work
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 py-1.5">
          <dt className="font-mono text-[12px]" style={{ color: DV.muted }}>
            routine manual effort after automation
          </dt>
          <dd className="m-0 font-mono text-[14px]" style={{ color: DV.green }}>
            automated
          </dd>
        </div>
      </dl>

      <h4 className="mb-1 mt-4 text-[14px] font-semibold" style={{ color: DV.text }}>
        Local feedback loop
      </h4>
      <p className="m-0 font-mono text-[12px] leading-relaxed" style={{ color: DV.muted }}>
        {devex.testing.loop.join(" → ")}
      </p>
      <p className="mt-1 text-[14px] leading-snug" style={{ color: DV.text }}>
        {devex.testing.body}
      </p>
    </PanelShell>
  );
}
