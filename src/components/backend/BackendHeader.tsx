"use client";

import { useState } from "react";
import { FileText, Github, Linkedin, Mail, Menu, X } from "lucide-react";
import { contactLinks, resumeState, sceneRanges } from "@/data/backend";

interface BackendHeaderProps {
  activeId: string;
}

const primaryIds = new Set(["overview", "experience", "systems", "projects", "research-teaching", "work-index", "contact"]);

export function BackendHeader({ activeId }: Readonly<BackendHeaderProps>) {
  const [open, setOpen] = useState(false);
  const links = sceneRanges.filter((scene) => primaryIds.has(scene.id));

  return (
    <header className="bk-header">
      <div className="bk-header__inner">
        <a className="bk-brand" href="#overview" onClick={() => setOpen(false)}>
          <span>Yashas Kadambi</span>
          <small>Backend &amp; Platform Engineer</small>
        </a>

        <nav className="bk-desktop-nav" aria-label="Backend portfolio">
          {links.map((link) => (
            <a key={link.id} href={`#${link.id}`} aria-current={activeId === link.id ? "location" : undefined}>
              {link.nav}
            </a>
          ))}
        </nav>

        <div className="bk-header__actions">
          <a href={resumeState.publicHref} target="_blank" rel="noreferrer" aria-label="View or download Yashas Kadambi’s résumé PDF (opens in a new tab)">
            <FileText aria-hidden />
          </a>
          <a href={contactLinks.github} target="_blank" rel="noreferrer" aria-label="Yashas Kadambi on GitHub (opens in a new tab)">
            <Github aria-hidden />
          </a>
          <a className="bk-header-linkedin" href={contactLinks.linkedin} target="_blank" rel="noreferrer" aria-label="Yashas Kadambi on LinkedIn (opens in a new tab)">
            <Linkedin aria-hidden />
          </a>
          <a href={contactLinks.emailHref} aria-label={`Email ${contactLinks.email}`}>
            <Mail aria-hidden />
          </a>
          <button
            className="bk-menu-button"
            type="button"
            aria-expanded={open}
            aria-controls="bk-mobile-menu"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden /> : <Menu aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="bk-mobile-menu" className="bk-mobile-nav" aria-label="Mobile backend portfolio">
          {links.map((link) => (
            <a key={link.id} href={`#${link.id}`} aria-current={activeId === link.id ? "location" : undefined} onClick={() => setOpen(false)}>
              {link.nav}
            </a>
          ))}
          <a href={resumeState.publicHref} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>Résumé PDF <span aria-hidden>↗</span></a>
          <a href={contactLinks.linkedin} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>LinkedIn <span aria-hidden>↗</span></a>
          <a href={contactLinks.emailHref} onClick={() => setOpen(false)}>Email</a>
        </nav>
      )}
    </header>
  );
}
