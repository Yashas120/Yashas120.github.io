"use client";

/**
 * The `prefers-reduced-motion` presentation.
 *
 * This is the complete alternative, not a degraded one: all seven chapters, every
 * result, every link and the same content, rendered as an ordinary semantic
 * document. There is no 760svh sticky sequence, no fade, no translate, no
 * envelopes in motion, no count-ups, no requestAnimationFrame and no timers.
 *
 * Each chapter is accompanied by a static diagram. Those diagrams are produced by
 * passing a constant progress value to the same visual used by the story, pinned
 * at that chapter's resolved end state — so the picture matches the prose and no
 * animation frames are ever scheduled.
 */

import { useMotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
  CHAPTERS,
  MAX_WIDTH,
  colors,
} from "./tokens";
import {
  contact,
  contactLinks,
  events,
  experience,
  hero,
  infrastructure,
  projects,
  projectsChapter,
  reliability,
  resumeLink,
} from "@/data/backend";
import { BackendHeader } from "./BackendHeader";
import { ControlPlaneVisual } from "./ControlPlaneVisual";

/** Static progress values: each chapter's resolved state. */
const RESOLVED = CHAPTERS.map((c) => c.start + (c.end - c.start) * 0.95);

function Section({
  id,
  eyebrow,
  heading,
  as = "h2",
  progressValue,
  descId,
  children,
}: Readonly<{
  id?: string;
  eyebrow: string;
  heading: string
  as?: "h1" | "h2";
  progressValue: number;
  descId?: string;
  children: React.ReactNode;
}>) {
  const p = useMotionValue(progressValue);
  const Heading = as;
  return (
    <section id={id} className="border-b px-5 py-14 md:px-8 md:py-20" style={{ borderColor: colors.line }}>
      <div className="mx-auto grid gap-10 lg:grid-cols-[46%_54%] lg:items-center" style={{ maxWidth: MAX_WIDTH }}>
        <div style={{ maxWidth: 560 }}>
          <p className="font-mono text-[12px] tracking-[0.2em]" style={{ color: colors.active }}>
            {eyebrow}
          </p>
          <Heading
            className="mt-4 font-semibold tracking-[-0.02em]"
            style={{
              color: colors.text,
              fontSize: as === "h1" ? "clamp(38px, 5vw, 5.25rem)" : "clamp(28px, 3.4vw, 3.75rem)",
              lineHeight: as === "h1" ? 1.05 : 1.12,
            }}
          >
            {heading}
          </Heading>
          <div className="mt-6">{children}</div>
        </div>
        <div className="w-full">
          <ControlPlaneVisual progress={p} describedBy={descId} />
        </div>
      </div>
    </section>
  );
}

function P({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <p className="mt-4 first:mt-0" style={{ color: colors.muted, fontSize: 18, lineHeight: 1.65 }}>
      {children}
    </p>
  );
}

function List({ items }: Readonly<{ items: string[] }>) {
  return (
    <ul className="mt-5 space-y-2.5">
      {items.map((i) => (
        <li key={i} className="flex items-start gap-3" style={{ color: colors.muted, fontSize: 18, lineHeight: 1.55 }}>
          <span aria-hidden className="mt-[0.62em] block h-[1px] w-3 shrink-0" style={{ background: colors.active }} />
          {i}
        </li>
      ))}
    </ul>
  );
}

function Results({ results }: Readonly<{ results: { label: string; value: string }[] }>) {
  return (
    <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
      {results.map((r) => (
        <div key={r.label}>
          <dt className="font-mono text-[11px] tracking-[0.14em]" style={{ color: colors.muted }}>
            {r.label}
          </dt>
          <dd className="mt-1 font-semibold" style={{ color: colors.healthy, fontSize: 20 }}>
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

const LINK =
  "inline-flex min-h-[44px] items-center gap-2 rounded-md border px-4 text-[15px]";

export function ReducedMotionBackend({ mobile }: Readonly<{ mobile: boolean }>) {
  return (
    <>
      <BackendHeader stat />
      <div style={{ paddingTop: "var(--bk-header)" }}>
        <Section eyebrow={hero.eyebrow} heading={hero.heading} as="h1" progressValue={RESOLVED[0]}>
          <P>{hero.body}</P>
          <div className="mt-6 border-l pl-4" style={{ borderColor: colors.healthy }}>
            <p className="font-mono text-[11px] tracking-[0.18em]" style={{ color: colors.muted }}>
              {hero.proofLabel}
            </p>
            <p className="mt-1.5 font-semibold" style={{ color: colors.healthy, fontSize: 28 }}>
              {hero.proofValue}
            </p>
            <p className="mt-1.5" style={{ color: colors.muted, fontSize: 16, lineHeight: 1.6 }}>
              {hero.proofExplanation}
            </p>
          </div>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <a href="#experience" className={LINK} style={{ borderColor: colors.active, color: colors.text, background: colors.raised }}>
              View experience
            </a>
            <a
              href={resumeLink.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={resumeLink.ariaLabel}
              className={LINK}
              style={{ borderColor: colors.line, color: colors.text }}
            >
              Résumé
            </a>
            <a
              href={contactLinks.github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub — Yashas120 (opens in a new tab)"
              className={LINK}
              style={{ borderColor: colors.line, color: colors.text }}
            >
              GitHub
            </a>
            <a href={contactLinks.emailHref} aria-label={`Email ${contactLinks.email}`} className={LINK} style={{ borderColor: colors.line, color: colors.text }}>
              Email
            </a>
          </div>
        </Section>

        <Section id="experience" eyebrow={experience.eyebrow} heading={experience.heading} progressValue={RESOLVED[1]}>
          <P>{experience.intro}</P>
          <List items={experience.bullets} />
          <p className="mt-6 font-semibold" style={{ color: colors.text, fontSize: 16 }}>
            {experience.previousRole}
          </p>
          <P>{experience.internshipSummary}</P>
          <P>{experience.progressionNote}</P>
        </Section>

        <Section eyebrow={infrastructure.eyebrow} heading={infrastructure.heading} progressValue={RESOLVED[2]}>
          {infrastructure.paragraphs.map((t) => (
            <P key={t}>{t}</P>
          ))}
          <Results results={infrastructure.results} />
        </Section>

        <Section
          eyebrow={events.eyebrow}
          heading={events.heading}
          progressValue={RESOLVED[3]}
          descId="bk-events-text-equivalent"
        >
          <P>{events.body}</P>
          <P>{events.supporting}</P>
          {/* the diagram's text equivalent, and the SVG's accessible description */}
          <p
            id="bk-events-text-equivalent"
            className="mt-6 border-l pl-4"
            style={{ color: colors.muted, borderColor: colors.line, fontSize: 16, lineHeight: 1.6 }}
          >
            {events.textEquivalent}
          </p>
          <p className="mt-4 font-mono text-[12px]" style={{ color: colors.muted }}>
            {events.disclaimer}
          </p>
        </Section>

        <Section eyebrow={reliability.eyebrow} heading={reliability.heading} progressValue={RESOLVED[4]}>
          {reliability.paragraphs.map((t) => (
            <P key={t}>{t}</P>
          ))}
          <Results results={reliability.results} />
          <p className="mt-6 font-mono text-[12px]" style={{ color: colors.muted }}>
            {reliability.loop.join(" → ")}
          </p>
        </Section>

        <Section id="projects" eyebrow={projectsChapter.eyebrow} heading={projectsChapter.heading} progressValue={RESOLVED[5]}>
          <ol className="space-y-10">
            {projects.map((proj) => (
              <li key={proj.id}>
                <p className="font-mono text-[11px] tracking-[0.18em]" style={{ color: colors.warning }}>
                  {proj.ownership}
                </p>
                <h3 className="mt-2.5 font-semibold" style={{ color: colors.text, fontSize: 22 }}>
                  {proj.title}
                </h3>
                <P>{proj.problem}</P>
                <P>{proj.contribution}</P>
                {proj.system && <P>{proj.system}</P>}
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {proj.stack.map((s) => (
                    <li key={s} className="rounded border px-2 py-0.5 font-mono text-[11px]" style={{ borderColor: colors.line, color: colors.muted }}>
                      {s}
                    </li>
                  ))}
                </ul>
                <a
                  href={proj.repo}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${proj.title} repository on GitHub (opens in a new tab)`}
                  className={`${LINK} mt-4`}
                  style={{ borderColor: colors.line, color: colors.active }}
                >
                  Repository <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              </li>
            ))}
          </ol>
        </Section>

        <Section eyebrow={contact.eyebrow} heading={contact.heading} progressValue={RESOLVED[6]}>
          <P>{contact.body}</P>
          <p className="mt-5 font-mono text-[12px]" style={{ color: colors.healthy }}>
            {contact.currentContext}
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <a href={contactLinks.emailHref} aria-label={`Email Yashas at ${contactLinks.email}`} className={LINK} style={{ borderColor: colors.active, color: colors.text, background: colors.raised }}>
              Email Yashas
            </a>
            <a href={resumeLink.href} target="_blank" rel="noreferrer noopener" aria-label={resumeLink.ariaLabel} className={LINK} style={{ borderColor: colors.line, color: colors.text }}>
              View résumé
            </a>
            <a href={contactLinks.github} target="_blank" rel="noreferrer noopener" aria-label="GitHub — Yashas120 (opens in a new tab)" className={LINK} style={{ borderColor: colors.line, color: colors.text }}>
              GitHub
            </a>
            <a href={contactLinks.linkedin} target="_blank" rel="noreferrer noopener" aria-label="LinkedIn — Yashas Kadambi (opens in a new tab)" className={LINK} style={{ borderColor: colors.line, color: colors.text }}>
              LinkedIn
            </a>
          </div>
          <p className="mt-5 font-mono text-[13px]" style={{ color: colors.text }}>
            {contactLinks.email}
          </p>
          <p className="mt-6 font-mono text-[12px] leading-[1.7]" style={{ color: colors.muted }}>
            {contact.technologies}
          </p>
          <p className="mt-6 font-mono text-[12px]" style={{ color: colors.healthy }}>
            {contact.finalStatus.join(" · ")}
          </p>
        </Section>
      </div>
      {mobile ? null : null}
    </>
  );
}
