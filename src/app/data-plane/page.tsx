"use client";

/**
 * /data-plane — a standalone endpoint for dataplane, embedded, networking and
 * systems-software roles.
 *
 * Five layers, in order: hero and professional profile; the flagship platform
 * bring-up film; the complete optical experience with its ownership split; the
 * production systems that are not optical; then research, teaching, education and
 * contact. A visitor never has to leave this route to understand the profile.
 *
 * The header carries the identity and all actions independently of the film, so
 * they are reachable at every scroll position.
 */

import { FileText, Github, Linkedin, Mail } from "lucide-react";
import { DataPlaneFilm } from "@/components/data-plane/DataPlaneFilm";
import { OpticalExperience } from "@/components/data-plane/OpticalExperience";
import { BeyondSection } from "@/components/data-plane/BeyondSection";
import { ResearchSection } from "@/components/data-plane/ResearchSection";
import { PLATFORM, dpContact, dpHero } from "@/data/dataPlane";
import { CANVAS, FAINT, MUTED, RULE, SIGNAL, SURFACE, TEXT, VERIFIED } from "@/components/data-plane/palette";

/** 44px minimum target on every interactive element. */
const ACTION =
  "inline-flex min-h-[44px] items-center gap-1.5 rounded-md border px-3.5 text-[0.85rem] transition-colors hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

/** Header actions: a 44x44 square below `sm`, a labelled button above it. */
const ICON_ACTION =
  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-md border px-2 text-[0.85rem] transition-colors hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:min-w-0 sm:px-3.5";

export default function DataPlanePage() {
  return (
    <div className="dp-root" style={{ background: CANVAS, color: TEXT }}>
      <a
        href="#experience"
        className="skip-link m-2 rounded-md border px-3 py-2 text-sm font-medium"
        style={{ background: SURFACE, borderColor: SIGNAL, color: TEXT }}
      >
        Skip to experience
      </a>

      <header
        className="sticky top-0 z-40 border-b backdrop-blur"
        style={{ borderColor: RULE, background: "rgba(7, 11, 16, 0.85)" }}
      >
        {/* Single row at every width: below `sm` the actions collapse to
            44x44 icon targets so the sticky header never eats a third of a
            360px viewport. Labels stay available to assistive tech. */}
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-x-4 px-4 py-1.5 sm:px-8 md:px-10">
          <a href="#top" className="flex min-h-[44px] min-w-0 flex-col justify-center leading-tight">
            <span className="truncate text-[0.88rem] font-semibold sm:text-[0.92rem]" style={{ color: TEXT }}>
              {dpHero.name}
            </span>
            <span className="truncate font-mono text-[10px] tracking-[0.08em] sm:text-[10.5px]" style={{ color: SIGNAL }}>
              {dpHero.role}
            </span>
          </a>
          <nav aria-label="Primary" className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <a href="#experience" className={`hidden sm:inline-flex ${ACTION}`} style={{ borderColor: RULE, color: MUTED, outlineColor: SIGNAL }}>
              Experience
            </a>
            <a
              href={dpContact.resumeHref}
              target="_blank"
              rel="noreferrer noopener"
              className={ICON_ACTION}
              style={{ borderColor: RULE, color: MUTED, outlineColor: SIGNAL }}
            >
              <FileText className="h-4 w-4 shrink-0" aria-hidden />
              <span className="sr-only sm:not-sr-only">{dpContact.resumeLabel}</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a
              href={dpContact.github}
              target="_blank"
              rel="noreferrer noopener"
              className={ICON_ACTION}
              style={{ borderColor: RULE, color: MUTED, outlineColor: SIGNAL }}
            >
              <Github className="h-4 w-4 shrink-0" aria-hidden />
              <span className="sr-only sm:not-sr-only">GitHub</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href={`mailto:${dpContact.email}`} className={ICON_ACTION} style={{ borderColor: RULE, color: MUTED, outlineColor: SIGNAL }}>
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              <span className="sr-only sm:not-sr-only">Email</span>
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* ---------------------------- 1. hero and professional profile */}
        <section className="relative overflow-hidden px-5 pb-16 pt-14 sm:px-8 md:px-10 md:pb-24 md:pt-20">
          <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative mx-auto max-w-5xl">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] sm:text-[11px]" style={{ color: SIGNAL }}>
              {dpHero.eyebrow}
            </p>

            <h1
              className="mt-5 max-w-[26ch] font-semibold tracking-[-0.03em]"
              style={{ color: TEXT, fontSize: "clamp(1.85rem, 4.6vw, 3.9rem)", lineHeight: 1.03 }}
            >
              {dpHero.headline}
            </h1>

            <p className="mt-5 max-w-[52ch] text-[1rem] font-medium leading-[1.5] md:text-[1.15rem]" style={{ color: SIGNAL }}>
              {dpHero.thesis}
            </p>

            <p className="mt-5 max-w-[76ch] text-[0.92rem] leading-[1.68] md:text-[1.02rem]" style={{ color: MUTED }}>
              {dpHero.profile}
            </p>

            <p className="mt-4 max-w-[70ch] text-[0.88rem] leading-[1.6] md:text-[0.95rem]" style={{ color: MUTED }}>
              {dpHero.supporting}
            </p>

            <ul className="mt-8 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {dpHero.proofPoints.map((pt) => (
                <li key={pt} className="flex items-start gap-2.5 font-mono text-[0.79rem] leading-[1.5] md:text-[0.83rem]" style={{ color: TEXT }}>
                  <span aria-hidden className="mt-[0.55em] block h-[1px] w-3 shrink-0" style={{ background: VERIFIED }} />
                  {pt}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-2.5">
              <a
                href="#story"
                className={ACTION}
                style={{ background: SIGNAL, borderColor: SIGNAL, color: CANVAS, outlineColor: SIGNAL }}
              >
                Explore {PLATFORM} bring-up
              </a>
              <a href="#experience" className={ACTION} style={{ borderColor: RULE, color: TEXT, outlineColor: SIGNAL }}>
                View full experience
              </a>
              <a
                href={dpContact.resumeHref}
                target="_blank"
                rel="noreferrer noopener"
                className={ACTION}
                style={{ borderColor: RULE, color: TEXT, outlineColor: SIGNAL }}
              >
                <FileText className="h-4 w-4" aria-hidden /> {dpContact.resumeLabel}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a href={`mailto:${dpContact.email}`} className={ACTION} style={{ borderColor: RULE, color: TEXT, outlineColor: SIGNAL }}>
                <Mail className="h-4 w-4" aria-hidden /> Email me
              </a>
            </div>

            <p className="mt-8 font-mono text-[11px]" style={{ color: FAINT }}>
              {dpHero.context}
            </p>
          </div>
        </section>

        {/* ------------------------------- 2. flagship platform bring-up */}
        <section id="story" className="scroll-mt-16">
          <h2 className="sr-only">Flagship case study: platform bring-up</h2>
          <DataPlaneFilm />
        </section>

        {/* ------------------------- 3. complete optical/dataplane record */}
        <OpticalExperience />

        {/* -------------------------- 4. production systems beyond optics */}
        <BeyondSection />

        {/* ---------- 5. projects, research, teaching, education, contact */}
        <ResearchSection />
      </main>

      <footer id="contact" className="scroll-mt-20 px-5 py-16 sm:px-8 md:px-10 md:py-20" style={{ background: SURFACE }}>
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: VERIFIED }} />
            <p className="font-mono text-[11px]" style={{ color: VERIFIED }}>
              traffic stable
            </p>
          </div>
          <h2 className="mt-3 text-[clamp(1.4rem,2.4vw,2.1rem)] font-semibold tracking-[-0.02em]" style={{ color: TEXT }}>
            Get in touch
          </h2>
          <p className="mt-3 max-w-[60ch] text-[0.95rem] leading-[1.6]" style={{ color: MUTED }}>
            Open to dataplane, embedded, networking and systems-software roles. {dpHero.context}.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <a
              href={dpContact.resumeHref}
              target="_blank"
              rel="noreferrer noopener"
              className={ACTION}
              style={{ borderColor: RULE, color: TEXT, outlineColor: SIGNAL }}
            >
              <FileText className="h-4 w-4" aria-hidden /> {dpContact.resumeLabel}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href={`mailto:${dpContact.email}`} className={ACTION} style={{ borderColor: RULE, color: TEXT, outlineColor: SIGNAL }}>
              <Mail className="h-4 w-4" aria-hidden /> {dpContact.email}
            </a>
            <a
              href={dpContact.github}
              target="_blank"
              rel="noreferrer noopener"
              className={ACTION}
              style={{ borderColor: RULE, color: TEXT, outlineColor: SIGNAL }}
            >
              <Github className="h-4 w-4" aria-hidden /> @{dpContact.githubUser}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a
              href={dpContact.linkedin}
              target="_blank"
              rel="noreferrer noopener"
              className={ACTION}
              style={{ borderColor: RULE, color: TEXT, outlineColor: SIGNAL }}
            >
              <Linkedin className="h-4 w-4" aria-hidden /> LinkedIn
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
