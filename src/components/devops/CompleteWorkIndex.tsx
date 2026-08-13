"use client";

import { ArrowUpRight } from "lucide-react";
import type { DemoId } from "@/data/demos";
import { completeWork } from "@/data/devops/projects";
import { DefaultProjectPreview } from "./DefaultProjectPreview";
import { useProjectInspector } from "./ProjectInspectorContext";
import { DV } from "./tokens";

const demoByProjectId: Record<string, DemoId> = {
  swift: "swift",
  multiview: "multiview",
  bitcoin: "bitcoin",
  chocollvm: "chocollvm",
  "spark-cifar": "cifar",
  yelp: "yelp",
  parallel: "parallel",
  petra: "petra",
};

export function CompleteWorkIndex() {
  const { onInspectProject } = useProjectInspector();
  return (
    <div className="mt-6 max-w-[78ch] border-y" style={{ borderColor: DV.border }}>
      <div
        className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_minmax(0,1fr)] gap-4 border-b px-3 py-2 font-mono text-[12px] sm:grid"
        style={{ borderColor: DV.border, color: DV.muted, background: DV.inspector }}
        aria-hidden
      >
        <span>Work / ownership</span>
        <span>Verified contribution / status</span>
        <span>Evidence paths</span>
      </div>
      <ol className="m-0 list-none p-0">
        {completeWork.map((work) => (
          <li key={work.id} className="border-b p-3 last:border-b-0" style={{ borderColor: DV.border }}>
            <article className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_minmax(0,1fr)] sm:gap-4">
              <div>
                <h3 className="m-0 text-[16px] font-semibold leading-snug" style={{ color: DV.text }}>
                  {work.title}
                </h3>
                <p className="m-0 mt-1 font-mono text-[12px] leading-relaxed" style={{ color: DV.cyan }}>
                  {work.ownership} · {work.status}
                </p>
                <p className="m-0 mt-1 text-[13px] leading-relaxed" style={{ color: DV.muted }}>
                  {work.domain.join(" · ")}
                </p>
              </div>
              <div>
                <p className="m-0 text-[15px] leading-relaxed" style={{ color: DV.text }}>
                  {work.contribution}
                </p>
                <p className="m-0 mt-1.5 text-[14px] leading-relaxed" style={{ color: DV.muted }}>
                  {work.outcome}
                </p>
              </div>
              <div className="flex flex-wrap content-start gap-x-3 gap-y-1">
                {work.links.length > 0 ? (
                  work.links.map((link) => {
                    const demoId = link.kind === "demo" ? demoByProjectId[work.id] : undefined;
                    return demoId ? (
                      <button key={`${work.id}-${link.href}`} type="button" onClick={() => onInspectProject(demoId)} className="inline-flex min-h-[44px] items-center gap-1 text-[14px]" style={{ color: DV.cyan }} aria-label={`Jump to open preview — ${work.title}`}>Open preview</button>
                    ) : (
                      <a key={`${work.id}-${link.href}`} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noreferrer noopener" : undefined} className="inline-flex min-h-[44px] items-center gap-1 text-[14px]" style={{ color: DV.cyan }} aria-label={`${link.label} — ${work.title}${link.href.startsWith("http") ? " (opens in a new tab)" : ""}`}>
                        {link.label}{link.href.startsWith("http") && <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />}
                      </a>
                    );
                  })
                ) : (
                  <span className="py-3 font-mono text-[12px]" style={{ color: DV.muted }}>
                    No public link verified
                  </span>
                )}
              </div>
            </article>
            {demoByProjectId[work.id] && <DefaultProjectPreview demoId={demoByProjectId[work.id]} />}
          </li>
        ))}
      </ol>
    </div>
  );
}
