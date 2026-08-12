"use client";

import { fdeChrome } from "@/data/fdeDossier";

const link = "inline-flex min-h-11 items-center font-mono text-[10px] uppercase tracking-[0.13em] opacity-70 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:text-[11px] md:tracking-[0.16em]";

export function DossierHeader() {
  return (
    <header className="fde-header pointer-events-none fixed inset-x-0 top-0 z-50 flex h-[var(--fde-header)] items-center justify-between gap-3 px-5 md:px-10" style={{ color: "inherit" }}>
      <div className="pointer-events-auto min-w-0">
        <p className="truncate text-[13px] font-semibold tracking-[-0.01em] md:text-[14px]">{fdeChrome.name}</p>
        <p className="truncate font-mono text-[8px] uppercase tracking-[0.1em] opacity-55 md:text-[10px] md:tracking-[0.2em]">{fdeChrome.descriptor}</p>
      </div>
      <nav className="pointer-events-auto flex shrink-0 items-center gap-3 md:gap-7" aria-label="Dossier navigation">
        <a href="#evidence-index" className={link}>Index</a>
        <a href={fdeChrome.github} target="_blank" rel="noreferrer noopener" className={`${link} hidden md:inline-flex`} aria-label="Yashas Kadambi on GitHub (opens in a new tab)">GitHub</a>
        <a href={fdeChrome.linkedin} target="_blank" rel="noreferrer noopener" className={`${link} hidden md:inline-flex`} aria-label="Yashas Kadambi on LinkedIn (opens in a new tab)">LinkedIn</a>
        <a href={`mailto:${fdeChrome.email}`} className={link} aria-label={`Email Yashas Kadambi at ${fdeChrome.email}`}>Email</a>
        {fdeChrome.resumeUrl ? <a href={fdeChrome.resumeUrl} target="_blank" rel="noreferrer noopener" className={`${link} hidden md:inline-flex`}>Resume</a> : null}
      </nav>
    </header>
  );
}
