/**
 * The persistent header for /devtools.
 *
 * A server component with no client JavaScript: the narrow-viewport overflow menu
 * is a native <details>, so the navigation works before hydration and with
 * scripting disabled. Résumé and Email stay visible at every width because they
 * are the two actions a recruiter came for.
 */

import { FileText, Github, Mail, Menu } from "lucide-react";
import { identity, resumeLink } from "@/data/devops/profile";
import { ACTION, DV, HEADER_H, MAX_WIDTH } from "./tokens";

const LINKS = [
  { label: "Experience", href: "#delivery" },
  { label: "Systems", href: "#systems" },
];

export function PortfolioHeader() {
  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{ height: HEADER_H, borderColor: DV.border, background: DV.canvas }}
    >
      <div
        className="mx-auto flex h-full items-center justify-between gap-3 px-4 sm:px-6"
        style={{ maxWidth: MAX_WIDTH }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate text-[15px] font-semibold" style={{ color: DV.text }}>
            {identity.name}
          </span>
          <span className="dv-chip hidden sm:inline-flex" style={{ color: DV.amber }}>
            {identity.role}
          </span>
        </div>

        <nav aria-label="Primary" className="flex items-center gap-0.5 sm:gap-1">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={`${ACTION} hidden sm:inline-flex`} style={{ color: DV.muted }}>
              {l.label}
            </a>
          ))}
          <a
            href={resumeLink.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={resumeLink.ariaLabel}
            className={ACTION}
            style={{ color: DV.text }}
          >
            <FileText className="h-4 w-4" aria-hidden /> Résumé
          </a>
          <a
            href={identity.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`GitHub — ${identity.githubUser} (opens in a new tab)`}
            className={`${ACTION} hidden sm:inline-flex`}
            style={{ color: DV.muted }}
          >
            <Github className="h-4 w-4" aria-hidden /> GitHub
          </a>
          <a
            href={identity.emailHref}
            aria-label={`Email ${identity.email}`}
            className={ACTION}
            style={{ color: DV.muted }}
          >
            <Mail className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Email</span>
          </a>

          {/* Narrow viewports: the remaining links, in an ordinary labelled menu. */}
          <details className="relative sm:hidden">
            <summary
              className={`${ACTION} list-none [&::-webkit-details-marker]:hidden`}
              style={{ color: DV.muted }}
              aria-label="More navigation"
            >
              <Menu className="h-4 w-4" aria-hidden />
            </summary>
            <div
              className="absolute right-0 top-[46px] z-50 flex w-48 flex-col gap-1 rounded-lg border p-2 shadow-xl"
              style={{ borderColor: DV.border, background: DV.raised }}
            >
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} className={ACTION} style={{ color: DV.text }}>
                  {l.label}
                </a>
              ))}
              <a
                href={identity.github}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`GitHub — ${identity.githubUser} (opens in a new tab)`}
                className={ACTION}
                style={{ color: DV.text }}
              >
                <Github className="h-4 w-4" aria-hidden /> GitHub
              </a>
              <a
                href={identity.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="LinkedIn — yashas120 (opens in a new tab)"
                className={ACTION}
                style={{ color: DV.text }}
              >
                LinkedIn
              </a>
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}
