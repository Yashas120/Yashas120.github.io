"use client";

import { ArrowUpRight } from "lucide-react";
import type { DemoId } from "@/data/demos";
import { selectedProjects } from "@/data/devops/projects";
import { DefaultProjectPreview } from "./DefaultProjectPreview";
import { EvidenceDrawer } from "./EvidenceDrawer";
import { useProjectInspector } from "./ProjectInspectorContext";
import { DV } from "./tokens";

const demoByProjectId: Partial<Record<string, DemoId>> = { "cloud-rdbms": "cloud", "ghost-scheduler": "ghost" };
const featuredOrder = ["cloud-rdbms", "ghost-scheduler", "technical-portfolio", "cloud-hack"];

export function SelectedSystems() {
  const { onInspectProject } = useProjectInspector();
  const orderedProjects = [...selectedProjects].sort(
    (a, b) => featuredOrder.indexOf(a.id) - featuredOrder.indexOf(b.id),
  );
  return (
    <div className="mt-6 max-w-[74ch]">
      {orderedProjects.map((project, index) => (
        <article
          key={project.id}
          className="border-t py-7 first:border-t-0 first:pt-0"
          style={{ borderColor: DV.border }}
          aria-labelledby={`${project.id}-title`}
        >
          <p className="m-0 font-mono text-[12px]" style={{ color: DV.cyan }}>
            SYSTEM {String(index + 1).padStart(2, "0")} · {project.ownership} · {project.status}
          </p>
          <h3 id={`${project.id}-title`} className="mb-0 mt-2 text-[20px] font-semibold leading-snug" style={{ color: DV.text }}>
            {project.title}
          </h3>
          <dl className="m-0 mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[12px] uppercase tracking-[0.08em]" style={{ color: DV.muted }}>Problem</dt>
              <dd className="m-0 mt-1 text-[15px] leading-relaxed" style={{ color: DV.text }}>{project.problem}</dd>
            </div>
            <div>
              <dt className="font-mono text-[12px] uppercase tracking-[0.08em]" style={{ color: DV.muted }}>System</dt>
              <dd className="m-0 mt-1 text-[15px] leading-relaxed" style={{ color: DV.text }}>{project.system}</dd>
            </div>
            <div>
              <dt className="font-mono text-[12px] uppercase tracking-[0.08em]" style={{ color: DV.muted }}>Verified contribution</dt>
              <dd className="m-0 mt-1 text-[15px] leading-relaxed" style={{ color: DV.text }}>{project.contribution}</dd>
            </div>
            <div>
              <dt className="font-mono text-[12px] uppercase tracking-[0.08em]" style={{ color: DV.muted }}>Outcome / status</dt>
              <dd className="m-0 mt-1 text-[15px] leading-relaxed" style={{ color: DV.text }}>{project.outcome}</dd>
            </div>
          </dl>
          <p className="m-0 mt-4 text-[15px] leading-relaxed" style={{ color: DV.amber }}>
            Why it matters here: {project.whyItMatters}
          </p>
          <ul className="m-0 mt-3 flex list-none flex-wrap gap-1.5 p-0">
            {[...project.constraints, ...project.stack].map((item) => (
              <li key={item}><span className="dv-chip">{item}</span></li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-x-4">
            {project.links.map((link) => {
              const demoId = link.kind === "demo" ? demoByProjectId[project.id] : undefined;
              return demoId ? (
                <button key={link.href} type="button" onClick={() => onInspectProject(demoId)} className="inline-flex min-h-[44px] items-center gap-1 text-[14px]" style={{ color: DV.cyan }}>Jump to open preview</button>
              ) : (
                <a key={link.href} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noreferrer noopener" : undefined} className="inline-flex min-h-[44px] items-center gap-1 text-[14px]" style={{ color: DV.cyan }}>
                  {link.label}{link.href.startsWith("http") && <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />}
                </a>
              );
            })}
          </div>
          {project.evidenceId && <EvidenceDrawer ids={[project.evidenceId]} label="Inspect source classification" />}
          {demoByProjectId[project.id] && <DefaultProjectPreview demoId={demoByProjectId[project.id]!} />}
        </article>
      ))}
    </div>
  );
}
