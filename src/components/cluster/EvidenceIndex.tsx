"use client";

import { useTokens } from "./theme";
import {
  additionalWork,
  education,
  evidenceExperience,
  links,
  skills,
  supportingProjects,
} from "@/lib/clusterContent";

// Conventional, readable supporting detail. Scrolls normally — no animated stage
// behind it — and carries the complete content path for accessibility.

function SectionHeading({ children }: Readonly<{ children: React.ReactNode }>) {
  const t = useTokens("base");
  return (
    <h3 className="text-[12px] font-medium uppercase tracking-[0.16em]" style={{ color: t.blue }}>
      {children}
    </h3>
  );
}

export function EvidenceIndex() {
  const t = useTokens("base");
  const link = "underline underline-offset-4 hover:opacity-70";
  return (
    <section id="evidence" aria-labelledby="evidence-h" className="relative z-10" style={{ background: t.canvas }}>
      <div className="mx-auto w-full max-w-[1080px] px-5 py-20 md:px-10 md:py-28">
        <header className="border-t pt-8" style={{ borderColor: t.line }}>
          <h2 id="evidence-h" className="text-[clamp(1.6rem,2.4vw,2.25rem)] font-semibold tracking-[-0.02em]" style={{ color: t.ink }}>
            Details
          </h2>
          <p className="mt-2 max-w-[62ch] text-[16px]" style={{ color: t.muted }}>
            Supporting evidence for the story above: full role detail in chronological order, smaller projects, education and
            coursework, skills, and other work.
          </p>
        </header>

        {/* experience — chronological */}
        <div className="mt-14">
          <SectionHeading>Experience</SectionHeading>
          <div className="mt-6 space-y-10">
            {evidenceExperience.map((r) => (
              <article key={`${r.org}-${r.role}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h4 className="text-[18px] font-medium" style={{ color: t.ink }}>
                    {r.role} <span style={{ color: t.muted }}>· {r.org}</span>
                  </h4>
                  <p className="font-mono text-[12.5px]" style={{ color: t.muted }}>
                    {r.dates} · {r.location}
                  </p>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {r.points.map((pt) => (
                    <li key={pt} className="flex gap-3 text-[15.5px] leading-relaxed" style={{ color: t.ink }}>
                      <span aria-hidden className="mt-[10px] h-[3px] w-3 shrink-0" style={{ background: t.line }} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        {/* supporting projects */}
        <div className="mt-16">
          <SectionHeading>Supporting projects</SectionHeading>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            {supportingProjects.map((p) => (
              <article key={p.title}>
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h4 className="text-[17px] font-medium" style={{ color: t.ink }}>
                    {p.title}
                  </h4>
                  <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: t.muted }}>
                    {p.ownership}
                  </span>
                </div>
                <p className="mt-2 text-[15.5px] leading-relaxed" style={{ color: t.muted }}>
                  {p.detail}
                </p>
                <p className="mt-2 font-mono text-[12px]" style={{ color: t.muted }}>
                  {p.tech.join(" · ")}
                </p>
                {p.href && (
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className={`mt-2 inline-block text-[14px] ${link}`} style={{ color: t.blue }}>
                    Repository
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* education */}
        <div className="mt-16">
          <SectionHeading>Education</SectionHeading>
          <div className="mt-6 space-y-2">
            <p className="text-[16px] font-medium" style={{ color: t.ink }}>
              {education.current}
            </p>
            <p className="text-[15.5px]" style={{ color: t.muted }}>
              {education.focus}
            </p>
            <p className="text-[15.5px]" style={{ color: t.muted }}>
              {education.prior}
            </p>
          </div>
          <p className="mt-5 text-[13px] font-medium uppercase tracking-wider" style={{ color: t.muted }}>
            Relevant completed coursework
          </p>
          <ul className="mt-2 grid gap-x-8 gap-y-1 sm:grid-cols-2">
            {education.coursework.map((c) => (
              <li key={c} className="font-mono text-[13.5px]" style={{ color: t.ink }}>
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* skills */}
        <div className="mt-16">
          <SectionHeading>Skills by mechanism</SectionHeading>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            {skills.map((g) => (
              <div key={g.label}>
                <dt className="text-[13px] font-medium uppercase tracking-wider" style={{ color: t.muted }}>
                  {g.label}
                </dt>
                <dd className="mt-1 text-[15.5px]" style={{ color: t.ink }}>
                  {g.items.join(" · ")}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* additional work */}
        <div className="mt-16">
          <SectionHeading>Additional work</SectionHeading>
          <ul className="mt-6 space-y-2">
            {additionalWork.map((w) => (
              <li key={w} className="flex gap-3 text-[15px] leading-relaxed" style={{ color: t.muted }}>
                <span aria-hidden className="mt-[10px] h-[3px] w-3 shrink-0" style={{ background: t.line }} />
                {w}
              </li>
            ))}
          </ul>
        </div>

        {/* links */}
        <div className="mt-16 border-t pt-8" style={{ borderColor: t.line }}>
          <SectionHeading>Links</SectionHeading>
          <div className="mt-4 flex flex-wrap gap-6 text-[15.5px]">
            <a href={links.email} className={link} style={{ color: t.blue }}>
              {links.emailPlain}
            </a>
            <a href={links.github} target="_blank" rel="noopener noreferrer" className={link} style={{ color: t.blue }}>
              GitHub
            </a>
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className={link} style={{ color: t.blue }}>
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
