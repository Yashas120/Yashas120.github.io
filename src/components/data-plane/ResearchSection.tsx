"use client";

/**
 * "Selected systems and research", plus teaching and education.
 *
 * Projects are deliberately not equal-weight cards: the two leading systems get
 * a full block, the secondary ones a compact row. Ownership is a stated label,
 * never implied, and research figures name the comparison baseline rather than
 * floating free.
 */

import { ArrowUpRight } from "lucide-react";
import { OWNERSHIP_LABEL, dpProjects, education, teaching, type DpProject } from "@/data/dataPlane";
import { CANVAS, FAINT, MUTED, RESEARCH, RULE, SIGNAL, SURFACE, TEXT } from "./palette";

function OwnershipChip({ project }: Readonly<{ project: DpProject }>) {
  const research = project.ownership === "research";
  const color = research ? RESEARCH : SIGNAL;
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-sm border px-1.5 py-[2px] font-mono text-[9.5px] uppercase tracking-[0.12em]"
      style={{ color, borderColor: RULE }}
    >
      {OWNERSHIP_LABEL[project.ownership]}
    </span>
  );
}

function ProjectLink({ href }: Readonly<{ href: string }>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex min-h-[44px] items-center gap-1 text-[0.85rem] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ color: SIGNAL, outlineColor: SIGNAL }}
    >
      Repository <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function ResearchSection() {
  const lead = dpProjects.filter((p) => p.weight === 1);
  const rest = dpProjects.filter((p) => p.weight !== 1);

  return (
    <section id="systems" className="scroll-mt-20 px-5 py-16 sm:px-8 md:px-10 md:py-24" style={{ background: CANVAS }}>
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: SIGNAL }}>
          Outside production
        </p>
        <h2 className="mt-3 text-[clamp(1.4rem,2.4vw,2.1rem)] font-semibold tracking-[-0.02em]" style={{ color: TEXT }}>
          Selected systems and research
        </h2>

        <div className="mt-9 grid gap-5 md:grid-cols-2">
          {lead.map((p) => (
            <article key={p.id} className="rounded-lg border p-5" style={{ borderColor: RULE, background: SURFACE }}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <h3 className="text-[1rem] font-semibold" style={{ color: TEXT }}>
                  {p.title}
                </h3>
                <OwnershipChip project={p} />
              </div>
              <p className="mt-3 text-[0.88rem] leading-[1.6]" style={{ color: MUTED }}>
                {p.body}
              </p>
              {p.meta && (
                <p className="mt-3 font-mono text-[10.5px] leading-[1.55]" style={{ color: FAINT }}>
                  {p.meta}
                </p>
              )}
              <p className="mt-3 font-mono text-[0.76rem]" style={{ color: FAINT }}>
                {p.stack.join(" · ")}
              </p>
              {p.href && <ProjectLink href={p.href} />}
            </article>
          ))}
        </div>

        <ul className="mt-6 divide-y" style={{ borderColor: RULE }}>
          {rest.map((p) => (
            <li key={p.id} className="border-t py-5" style={{ borderColor: RULE }}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <h3 className="text-[0.95rem] font-semibold" style={{ color: TEXT }}>
                  {p.title}
                </h3>
                <OwnershipChip project={p} />
              </div>
              <p className="mt-2 max-w-[74ch] text-[0.86rem] leading-[1.58]" style={{ color: MUTED }}>
                {p.body}
              </p>
              {p.meta && (
                <p className="mt-2 font-mono text-[10.5px] leading-[1.55]" style={{ color: FAINT }}>
                  {p.meta}
                </p>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-x-5">
                <p className="font-mono text-[0.74rem]" style={{ color: FAINT }}>
                  {p.stack.join(" · ")}
                </p>
                {p.href && <ProjectLink href={p.href} />}
              </div>
            </li>
          ))}
        </ul>

        {/* teaching */}
        <div className="mt-12 border-l pl-5" style={{ borderColor: RULE }}>
          <h3 className="text-[1rem] font-semibold" style={{ color: TEXT }}>
            {teaching.title}
          </h3>
          <p className="mt-1 font-mono text-[11px]" style={{ color: FAINT }}>
            {teaching.dates} · {teaching.courses.join(" · ")}
          </p>
          <p className="mt-3 max-w-[70ch] text-[0.9rem] leading-[1.6]" style={{ color: MUTED }}>
            {teaching.summary}
          </p>
        </div>

        {/* education */}
        <h3 className="mt-14 font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: SIGNAL }}>
          Education
        </h3>
        <ul className="mt-5 grid gap-5 sm:grid-cols-2">
          {education.map((e) => (
            <li key={e.org} className="rounded-lg border p-5" style={{ borderColor: RULE, background: SURFACE }}>
              <h4 className="text-[0.98rem] font-semibold" style={{ color: TEXT }}>
                {e.org}
              </h4>
              <p className="mt-1.5 text-[0.88rem]" style={{ color: MUTED }}>
                {e.detail}
              </p>
              <p className="mt-1.5 font-mono text-[11px]" style={{ color: FAINT }}>
                {e.dates}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
