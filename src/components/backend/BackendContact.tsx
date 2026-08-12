"use client";

/**
 * The final chapter's actions and the compact technology line.
 *
 * Technologies are one plain sentence — not proficiency bars and not dozens of
 * badges — because a list of tools carries no evidence on its own.
 */

import { ArrowUpRight, FileText, Github, Linkedin, Mail } from "lucide-react";
import { contact, contactLinks, resumeLink } from "@/data/backend";
import { colors } from "./tokens";

const ACTION =
  "inline-flex min-h-[44px] items-center gap-2 rounded-md border px-4 text-[15px] transition-colors";

export function BackendContact({
  active,
  mobile,
}: Readonly<{ active: boolean; mobile?: boolean }>) {
  const tab = active ? undefined : -1;

  return (
    <div>
      <p style={{ color: colors.muted, fontSize: mobile ? 16 : 18, lineHeight: 1.65 }}>{contact.body}</p>

      <p className="mt-5 font-mono text-[12px]" style={{ color: colors.healthy }}>
        {contact.currentContext}
      </p>

      <div className="mt-7 flex flex-wrap gap-2.5">
        <a
          href={contactLinks.emailHref}
          aria-label={`Email Yashas at ${contactLinks.email}`}
          tabIndex={tab}
          className={ACTION}
          style={{ borderColor: colors.active, color: colors.text, background: colors.raised }}
        >
          <Mail className="h-4 w-4" aria-hidden /> Email Yashas
        </a>
        <a
          href={resumeLink.href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={resumeLink.ariaLabel}
          tabIndex={tab}
          className={ACTION}
          style={{ borderColor: colors.line, color: colors.text }}
        >
          <FileText className="h-4 w-4" aria-hidden /> View résumé
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </a>
        <a
          href={contactLinks.github}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="GitHub — Yashas120 (opens in a new tab)"
          tabIndex={tab}
          className={ACTION}
          style={{ borderColor: colors.line, color: colors.text }}
        >
          <Github className="h-4 w-4" aria-hidden /> GitHub
        </a>
        <a
          href={contactLinks.linkedin}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="LinkedIn — Yashas Kadambi (opens in a new tab)"
          tabIndex={tab}
          className={ACTION}
          style={{ borderColor: colors.line, color: colors.text }}
        >
          <Linkedin className="h-4 w-4" aria-hidden /> LinkedIn
        </a>
      </div>

      {/* the address itself, as selectable text — a recruiter should not have to
          hover a button to read it */}
      <p className="mt-5 font-mono text-[13px]" style={{ color: colors.text }}>
        {contactLinks.email}
      </p>

      <p className="mt-6 font-mono text-[12px] leading-[1.7]" style={{ color: colors.muted }}>
        {contact.technologies}
      </p>
    </div>
  );
}
