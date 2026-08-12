"use client";

import { FileText, Github, Linkedin, Mail, PanelsTopLeft } from "lucide-react";
import { DataPlaneHeader } from "@/components/data-plane/DataPlaneHeader";
import { ResearchLabsSection } from "@/components/data-plane/ResearchLabsSection";
import { DataPlaneFilm } from "@/components/data-plane/DataPlaneFilm";
import { OpticalExperience } from "@/components/data-plane/OpticalExperience";
import { BeyondSection } from "@/components/data-plane/BeyondSection";
import {
  EducationRecognitionSection,
  EngineeringScopeSection,
  FeaturedSystemsSection,
  ResearchPublicationsSection,
  TeachingSection,
  WorkIndexSection,
} from "@/components/data-plane/PortfolioSections";
import { dpContact, dpHero } from "@/data/dataPlane";
import { CANVAS, FAINT, MUTED, RULE, SIGNAL, SURFACE, TEXT, VERIFIED } from "@/components/data-plane/palette";

const ACTION =
  "inline-flex min-h-[44px] items-center gap-2 rounded-md border px-3.5 text-[0.85rem] transition-colors hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export default function DataPlanePage() {
  return (
    <div className="dp-root" style={{ background: CANVAS, color: TEXT }}>
      <a href="#optical-experience" className="skip-link m-2 rounded-md border px-3 py-2 text-sm font-medium" style={{ background: SURFACE, borderColor: SIGNAL, color: TEXT }}>
        Skip to professional experience
      </a>
      <DataPlaneHeader />

      <main id="top">
        <section className="relative overflow-hidden px-5 pb-16 pt-14 sm:px-8 md:px-10 md:pb-24 md:pt-20" aria-labelledby="data-plane-title">
          <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative mx-auto max-w-5xl">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] sm:text-[11px]" style={{ color: SIGNAL }}>{dpHero.eyebrow}</p>
            <h1 id="data-plane-title" className="mt-5 max-w-[26ch] font-semibold tracking-[-0.03em]" style={{ color: TEXT, fontSize: "clamp(1.85rem, 4.6vw, 3.9rem)", lineHeight: 1.03 }}>{dpHero.headline}</h1>
            <p className="mt-5 max-w-[52ch] text-[1rem] font-medium leading-[1.5] md:text-[1.15rem]" style={{ color: SIGNAL }}>{dpHero.thesis}</p>
            <p className="mt-5 max-w-[78ch] text-[0.92rem] leading-[1.68] md:text-[1.02rem]" style={{ color: MUTED }}>{dpHero.profile}</p>
            <p className="mt-4 max-w-[74ch] text-[0.88rem] leading-[1.62] md:text-[0.95rem]" style={{ color: MUTED }}>{dpHero.supporting}</p>
            <p className="mt-5 max-w-[75ch] border-l pl-4 text-[0.9rem] font-medium leading-[1.62]" style={{ borderColor: SIGNAL, color: TEXT }}>{dpHero.roleLensDisclosure}</p>

            <ul className="mt-8 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {dpHero.proofPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 font-mono text-[0.77rem] leading-[1.5] md:text-[0.82rem]" style={{ color: TEXT }}>
                  <span aria-hidden className="mt-[0.55em] block h-px w-3 shrink-0" style={{ background: VERIFIED }} />{point}
                </li>
              ))}
            </ul>

            <p className="mt-8 font-mono text-[11px]" style={{ color: FAINT }}>{dpHero.context}</p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <a href="#story" className={ACTION} style={{ background: SIGNAL, borderColor: SIGNAL, color: CANVAS }}>Explore the line-card bring-up</a>
              <a href="#optical-experience" className={ACTION} style={{ borderColor: RULE, color: TEXT }}>View complete experience</a>
              <a href={dpContact.resume.href} target="_blank" rel="noreferrer noopener" className={ACTION} style={{ borderColor: RULE, color: TEXT }}><FileText className="h-4 w-4" aria-hidden /> Résumé<span className="sr-only"> (PDF, 2 pages; opens in a new tab)</span></a>
              <a href={dpContact.github} target="_blank" rel="noreferrer noopener" className={ACTION} style={{ borderColor: RULE, color: TEXT }}><Github className="h-4 w-4" aria-hidden /> GitHub<span className="sr-only"> (opens in a new tab)</span></a>
              <a href={dpContact.demos} className={ACTION} style={{ borderColor: RULE, color: TEXT }}><PanelsTopLeft className="h-4 w-4" aria-hidden /> Project demos</a>
              <a href={`mailto:${dpContact.email}`} className={ACTION} style={{ borderColor: RULE, color: TEXT }}><Mail className="h-4 w-4" aria-hidden /> Email</a>
            </div>
          </div>
        </section>

        <section id="story" className="scroll-mt-16">
          <h2 className="sr-only">Flagship case study: optical line-card platform bring-up</h2>
          <DataPlaneFilm />
        </section>

        <OpticalExperience />
        <BeyondSection />
        <ResearchLabsSection />
        <FeaturedSystemsSection />
        <WorkIndexSection />
        <ResearchPublicationsSection />
        <TeachingSection />
        <EducationRecognitionSection />
        <EngineeringScopeSection />
      </main>

      <footer id="contact" className="scroll-mt-20 px-5 py-16 sm:px-8 md:px-10 md:py-20" style={{ background: SURFACE }}>
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2.5"><span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: VERIFIED }} /><p className="font-mono text-[11px]" style={{ color: VERIFIED }}>traffic stable</p></div>
          <h2 className="mt-3 text-[clamp(1.4rem,2.4vw,2.1rem)] font-semibold tracking-[-0.02em]" style={{ color: TEXT }}>Get in touch</h2>
          <p className="mt-3 max-w-[66ch] text-[0.95rem] leading-[1.65]" style={{ color: MUTED }}>Open to dataplane, embedded, networking, and systems-software roles. Incoming UC San Diego MSCS in Sep 2026.</p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <a href={dpContact.resume.href} target="_blank" rel="noreferrer noopener" className={ACTION} style={{ borderColor: RULE, color: TEXT }}><FileText className="h-4 w-4" aria-hidden /> Résumé (PDF, 2 pages)<span className="sr-only"> (opens in a new tab)</span></a>
            <a href={`mailto:${dpContact.email}`} className={ACTION} style={{ borderColor: RULE, color: TEXT }}><Mail className="h-4 w-4" aria-hidden /> {dpContact.email}</a>
            <a href={dpContact.github} target="_blank" rel="noreferrer noopener" className={ACTION} style={{ borderColor: RULE, color: TEXT }}><Github className="h-4 w-4" aria-hidden /> @{dpContact.githubUser}<span className="sr-only"> (opens in a new tab)</span></a>
            <a href={dpContact.linkedin} target="_blank" rel="noreferrer noopener" className={ACTION} style={{ borderColor: RULE, color: TEXT }}><Linkedin className="h-4 w-4" aria-hidden /> LinkedIn<span className="sr-only"> (opens in a new tab)</span></a>
            <a href={dpContact.demos} className={ACTION} style={{ borderColor: RULE, color: TEXT }}><PanelsTopLeft className="h-4 w-4" aria-hidden /> Project demos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
