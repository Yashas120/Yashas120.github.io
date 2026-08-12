"use client";

/**
 * Persistent page chrome for /fde. Deliberately restrained: identity on the left,
 * three ways to reach Yashas on the right, and no interface switcher — this URL is
 * meant to stand on its own when it is shared directly.
 */

import { fdeChrome } from "@/data/fdeDossier";

const link =
  "font-mono text-[11px] uppercase tracking-[0.16em] opacity-70 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";

export function DossierHeader() {
  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex h-[var(--fde-header)] items-center justify-between gap-4 px-6 md:px-10"
      style={{ color: "inherit" }}
    >
      <div className="pointer-events-auto">
        <p className="text-[13px] font-semibold tracking-[-0.01em] md:text-[14px]">{fdeChrome.name}</p>
        <p className="whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.12em] opacity-55 md:text-[10px] md:tracking-[0.2em]">
          {fdeChrome.descriptor}
        </p>
      </div>

      <nav className="pointer-events-auto flex items-center gap-4 md:gap-7" aria-label="Contact">
        <a
          href={fdeChrome.links.resume.href}
          target="_blank"
          rel="noreferrer noopener"
          className={link}
          aria-label="Resume — Yashas Kadambi on LinkedIn (opens in a new tab)"
        >
          Resume
        </a>
        <a
          href={fdeChrome.github}
          target="_blank"
          rel="noreferrer noopener"
          className={link}
          aria-label="Yashas Kadambi on GitHub (opens in a new tab)"
        >
          GitHub
        </a>
        <a
          href={`mailto:${fdeChrome.email}`}
          className={link}
          aria-label={`Email Yashas Kadambi at ${fdeChrome.email}`}
        >
          Email
        </a>
      </nav>
    </header>
  );
}
