"use client";

/**
 * /fde — "THE DEPLOYMENT DOSSIER".
 *
 * A standalone field document that evolves as it is scrolled: ambiguous inputs,
 * understood constraints, a working prototype, production topology, safe
 * deployment, operational handoff. The scroll behaviour lives in DossierStage;
 * this file is only the page shell and its chrome.
 */

import { DossierHeader } from "@/components/fde/dossier/DossierHeader";
import { DossierStage } from "@/components/fde/dossier/DossierStage";
import { BG, COBALT, INK, RULE } from "@/components/fde/dossier/kit";
import { handoff } from "@/data/fdeDossier";

export default function FdePage() {
  return (
    <div
      className="fde-root relative min-h-[100svh]"
      style={{ background: BG, color: INK }}
    >
      <a
        href="#handoff"
        className="sr-only font-mono text-[11px] uppercase tracking-[0.16em] focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:px-4 focus:py-2"
        style={{ background: COBALT, color: BG }}
      >
        Skip to contact details
      </a>

      <DossierHeader />

      <main>
        <DossierStage />

        {/* Reached by the skip link and by keyboard users: the essential details
            never depend on scroll position or animation progress. */}
        <section
          id="handoff"
          className="border-t px-6 py-14 md:px-10"
          style={{ background: BG, color: INK, borderColor: RULE }}
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-8">
            <div>
              <h2 className="text-[1.35rem] font-semibold tracking-[-0.02em] md:text-[1.6rem]">
                {handoff.name}
              </h2>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] opacity-60">
                {handoff.education}
              </p>
              <p className="mt-4 max-w-[54ch] text-[0.95rem] leading-[1.55] opacity-75">{handoff.body}</p>
            </div>

            <ul className="flex flex-wrap items-center gap-x-7 gap-y-3 font-mono text-[11px] uppercase tracking-[0.16em]">
              <li>
                <a
                  className="border-b border-current/40 pb-0.5 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                  href={`mailto:${handoff.email}`}
                  aria-label={`Email Yashas Kadambi at ${handoff.email}`}
                >
                  {handoff.email}
                </a>
              </li>
              <li>
                <a
                  className="border-b border-current/40 pb-0.5 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                  href="https://www.linkedin.com/in/yashas120"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Resume — Yashas Kadambi on LinkedIn (opens in a new tab)"
                >
                  Resume
                </a>
              </li>
              <li>
                <a
                  className="border-b border-current/40 pb-0.5 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                  href="https://github.com/Yashas120"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Yashas Kadambi on GitHub (opens in a new tab)"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
