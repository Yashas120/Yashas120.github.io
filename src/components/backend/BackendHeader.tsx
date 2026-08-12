"use client";

/**
 * The persistent header. Ordinary labels only — no fake hostname, no fake
 * environment, no fake production status. It carries the identity and the primary
 * actions independently of the story, so they are reachable at any scroll
 * position.
 *
 * It becomes slightly more opaque once the reader leaves the hero.
 */

import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { FileText, Github, Mail } from "lucide-react";
import { contactLinks, header, resumeLink } from "@/data/backend";
import { colors, HEADER_DESKTOP, HEADER_MOBILE, MAX_WIDTH } from "./tokens";

/** 44px minimum target, applied to every action in the header. */
const ACTION =
  "inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-2.5 text-[14px] transition-colors";

export interface BackendHeaderProps {
  /** Story progress; only used to firm up the background after the hero. */
  progress?: MotionValue<number>;
  /** Static (reduced-motion) rendering with no scroll dependency. */
  stat?: boolean;
}

export function BackendHeader({ progress, stat = false }: Readonly<BackendHeaderProps>) {
  // Hooks must run unconditionally, so a local fallback stands in when the header
  // is rendered without a story (the reduced-motion document).
  const fallback = useMotionValue(1);
  const bg = useTransform(progress ?? fallback, [0, 0.12], [0.72, 0.94]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur"
      style={{
        borderColor: colors.line,
        height: `var(--bk-header)`,
        background: stat ? colors.canvas : undefined,
      }}
    >
      {!stat && (
        <motion.div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{ background: colors.canvas, opacity: bg }}
        />
      )}
      <div
        className="mx-auto flex h-full items-center justify-between gap-4 px-4 md:px-8"
        style={{ maxWidth: MAX_WIDTH }}
      >
        <a href="#main-content" className="flex min-h-[44px] flex-col justify-center leading-tight">
          <span className="text-[15px] font-semibold" style={{ color: colors.text }}>
            {header.name}
          </span>
          {/* the role is supporting information on mobile, so it is desktop-only */}
          <span className="hidden text-[12px] sm:block" style={{ color: colors.active }}>
            {header.role}
          </span>
        </a>

        <nav aria-label="Primary" className="flex items-center gap-0.5 sm:gap-1.5">
          {/* desktop-only in-page navigation */}
          <a href="#experience" className={`${ACTION} hidden lg:inline-flex`} style={{ color: colors.muted }}>
            Experience
          </a>
          <a href="#projects" className={`${ACTION} hidden lg:inline-flex`} style={{ color: colors.muted }}>
            Projects
          </a>
          <a
            href={resumeLink.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={resumeLink.ariaLabel}
            className={ACTION}
            style={{ color: colors.text }}
          >
            <FileText className="h-4 w-4" aria-hidden /> Résumé
          </a>
          <a
            href={contactLinks.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub — Yashas120 (opens in a new tab)"
            className={`${ACTION} hidden sm:inline-flex`}
            style={{ color: colors.muted }}
          >
            <Github className="h-4 w-4" aria-hidden /> GitHub
          </a>
          <a
            href={contactLinks.emailHref}
            aria-label={`Email ${contactLinks.email}`}
            className={ACTION}
            style={{ color: colors.muted }}
          >
            <Mail className="h-4 w-4" aria-hidden /> Email
          </a>
        </nav>
      </div>
    </header>
  );
}

export { HEADER_DESKTOP, HEADER_MOBILE };
