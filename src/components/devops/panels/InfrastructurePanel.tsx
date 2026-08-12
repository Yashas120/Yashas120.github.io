/**
 * Infrastructure: the public-safe event path, its constraints, and the questions a
 * design has to answer before resilience can be claimed.
 */

"use client";

import { infrastructure } from "@/data/devops/profile";
import { PanelShell } from "./PanelShell";
import { EventFlow } from "../visuals/EventFlow";
import { DV } from "../tokens";

export function InfrastructurePanel({ live }: Readonly<{ live?: boolean }>) {
  return (
    <PanelShell
      title="Event path"
      summary="A reusable path with explicit ownership and explicit deployment dependencies."
      legendKeys={["illustration", "verified"]}
      evidenceIds={["events", "iac"]}
      caption={infrastructure.architectureCaption}
    >
      <EventFlow live={live} />

      <p className="mt-3 font-mono text-[12px] leading-relaxed" style={{ color: DV.muted }}>
        {infrastructure.flow.join(" → ")}
      </p>

      <h4 className="mb-1 mt-4 text-[14px] font-semibold" style={{ color: DV.text }}>
        {infrastructure.designQuestionsHeading}
      </h4>
      <ul className="m-0 list-none space-y-1 p-0">
        {infrastructure.designQuestions.map((q) => (
          <li key={q} className="flex gap-2 text-[14px] leading-snug" style={{ color: DV.muted }}>
            <span aria-hidden style={{ color: DV.violet }}>
              ?
            </span>
            {q}
          </li>
        ))}
      </ul>
    </PanelShell>
  );
}
