"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { kernelPortfolio, workLabels } from "@/data/kernelPortfolio";
import { kernelProjects as projects } from "@/data/projects";
import { hexToRgba } from "@/lib/utils";
import { PHOSPHOR } from "../desktop/types";
import { useDesktop } from "../desktop/DesktopContext";
import { Chip } from "./ui";

export function Htop() {
  const [open, setOpen] = useState<string | null>(projects[0]?.id ?? null);
  const reducedMotion = useReducedMotion();
  const { openDemo } = useDesktop();

  return (
    <div className="flex min-h-full flex-col font-mono text-[11px]">
      <div className="flex-shrink-0 border-b px-4 py-3" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>
        <p className="text-zinc-200">Project evidence index</p>
        <p className="mt-1 font-sans text-[12px] leading-relaxed text-zinc-500">
          Context, ownership and status are factual portfolio fields—not simulated process telemetry.
          Open a project for its contribution and outcome.
        </p>
      </div>

      <div className="flex-1 overflow-x-auto px-2 py-2">
        <table className="w-full min-w-[820px] text-left">
          <thead>
            <tr style={{ background: hexToRgba(PHOSPHOR, 0.14) }}>
              {["Project", "Context", "Ownership", "Status", "Evidence", "Demo", "Source"].map((heading) => (
                <th key={heading} className="whitespace-nowrap px-2 py-2 font-normal text-zinc-400">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const isOpen = open === project.id;
              return (
                <Fragment key={project.id}>
                  <tr style={{ background: isOpen ? hexToRgba(PHOSPHOR, 0.06) : undefined }}>
                    <td className="px-2 py-1">
                      <button
                        onClick={() => setOpen(isOpen ? null : project.id)}
                        aria-expanded={isOpen}
                        className="min-h-11 w-full text-left text-zinc-200 underline-offset-2 hover:underline"
                      >
                        {project.title}
                      </button>
                    </td>
                    <td className="px-2 py-1 text-zinc-400">{workLabels.context[project.context]}</td>
                    <td className="px-2 py-1 text-zinc-400">{workLabels.ownership[project.ownership]}</td>
                    <td className="px-2 py-1" style={{ color: PHOSPHOR }}>{workLabels.status[project.status]}</td>
                    <td className="px-2 py-1 text-zinc-400">{project.evidence.length ? `${project.evidence.length} linked fact${project.evidence.length === 1 ? "" : "s"}` : "Contribution record"}</td>
                    <td className="px-2 py-1">
                      {project.demoId ? <button type="button" onClick={() => openDemo(project.demoId!)} className="inline-flex min-h-11 items-center gap-1 text-zinc-300 hover:text-zinc-50">Run <ExternalLink className="h-3 w-3" /></button> : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-2 py-1">
                      {project.repoUrl ? <a href={project.repoUrl} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-11 items-center gap-1 text-zinc-300 hover:text-zinc-50">Source <Github className="h-3 w-3" /></a> : <span className="text-zinc-600">Not public</span>}
                    </td>
                  </tr>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <tr>
                        <td colSpan={7} className="px-2 pb-2">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: reducedMotion ? 0 : 0.18 }}
                            className="overflow-hidden"
                          >
                            <div className="rounded-lg border p-3" style={{ borderColor: "rgb(var(--line) / 0.08)", background: "rgb(var(--ink-900))" }}>
                              <p className="font-sans text-[12px] leading-relaxed text-zinc-300">{project.detail}</p>
                              <dl className="mt-3 grid gap-2 font-sans text-[12px] sm:grid-cols-2">
                                <div><dt className="text-zinc-500">Verified contribution</dt><dd className="mt-0.5 leading-relaxed text-zinc-300">{project.contribution}</dd></div>
                                <div><dt className="text-zinc-500">Outcome</dt><dd className="mt-0.5 leading-relaxed text-zinc-300">{project.outcome}</dd></div>
                              </dl>
                              <div className="mt-2.5 flex flex-wrap gap-1.5">{project.tech.map((tech) => <Chip key={tech}>{tech}</Chip>)}</div>
                              {project.demoId && (
                                <div className="mt-3 border-t pt-3" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>
                                  <p className="whitespace-pre-line font-mono text-[11px] leading-relaxed text-zinc-400" aria-live="polite">{`$ exec ./demo --project=${project.demoId}\n[browser process ready]`}</p>
                                  <button type="button" onClick={() => openDemo(project.demoId!)} className="mt-2 inline-flex min-h-11 items-center rounded border px-3 font-mono text-[11px]" style={{ borderColor: hexToRgba(PHOSPHOR, 0.4), color: PHOSPHOR }}>Run live demo</button>
                                </div>
                              )}
                              <Link href={`/kernel#${kernelPortfolio.featuredProjectIds.includes(project.id as never) ? "systems-projects" : "projects"}`} className="mt-3 inline-flex min-h-11 items-center text-[11px]" style={{ color: PHOSPHOR }}>
                                View in Portfolio Overview →
                              </Link>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    ) : null}
                  </AnimatePresence>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
