"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Github, Linkedin, Mail, Menu, X } from "lucide-react";
import { dpContact, dpHero } from "@/data/dataPlane";
import { CANVAS, MUTED, RULE, SIGNAL, SURFACE, TEXT } from "./palette";

const ACTION =
  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border px-2 text-[0.82rem] transition-colors hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const anchors = [
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#featured-systems" },
  { label: "Research", href: "#research" },
  { label: "Contact", href: "#contact" },
] as const;

export function DataPlaneHeader() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) close();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur" style={{ borderColor: RULE, background: "rgba(7, 11, 16, 0.9)" }}>
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-1.5 sm:px-6 lg:px-8">
        <a href="#top" className="flex min-h-[44px] min-w-0 flex-1 flex-col justify-center leading-tight">
          <span className="truncate text-[0.84rem] font-semibold sm:text-[0.92rem]" style={{ color: TEXT }}>
            {dpHero.name}
          </span>
          <span className="hidden truncate font-mono text-[10.5px] tracking-[0.08em] sm:block" style={{ color: SIGNAL }}>
            {dpHero.role}
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {anchors.map((anchor) => (
            <a key={anchor.href} href={anchor.href} className={`${ACTION} min-w-0 px-3`} style={{ borderColor: "transparent", color: MUTED }}>
              {anchor.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <a href={dpContact.resume.href} target="_blank" rel="noreferrer noopener" className={ACTION} style={{ borderColor: RULE, color: MUTED }} aria-label="Résumé, PDF, 2 pages (opens in a new tab)">
            <FileText className="h-4 w-4" aria-hidden />
          </a>
          <a href={dpContact.github} target="_blank" rel="noreferrer noopener" className={ACTION} style={{ borderColor: RULE, color: MUTED }} aria-label="GitHub (opens in a new tab)">
            <Github className="h-4 w-4" aria-hidden />
          </a>
          <a href={`mailto:${dpContact.email}`} className={ACTION} style={{ borderColor: RULE, color: MUTED }} aria-label="Email Yashas">
            <Mail className="h-4 w-4" aria-hidden />
          </a>
          <button
            ref={triggerRef}
            type="button"
            className={`${ACTION} lg:hidden`}
            style={{ borderColor: RULE, color: MUTED }}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="data-plane-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
          </button>
        </div>

        {open && (
          <div
            ref={menuRef}
            id="data-plane-menu"
            className="absolute right-3 top-[calc(100%+8px)] w-[min(18rem,calc(100vw-24px))] rounded-lg border p-2 shadow-2xl lg:hidden"
            style={{ borderColor: RULE, background: SURFACE, color: TEXT }}
          >
            <nav aria-label="In-page navigation">
              <ul>
                {anchors.map((anchor) => (
                  <li key={anchor.href}>
                    <a href={anchor.href} onClick={() => close()} className="flex min-h-[44px] items-center rounded-md px-3 text-sm hover:brightness-125">
                      {anchor.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-2 grid grid-cols-2 gap-2 border-t pt-2" style={{ borderColor: RULE }}>
              <a href={dpContact.resume.href} target="_blank" rel="noreferrer noopener" className={`${ACTION} gap-2`} style={{ borderColor: RULE, color: MUTED }}>
                <FileText className="h-4 w-4" aria-hidden /> Résumé<span className="sr-only"> (PDF, 2 pages; opens in a new tab)</span>
              </a>
              <a href={dpContact.linkedin} target="_blank" rel="noreferrer noopener" className={`${ACTION} gap-2`} style={{ borderColor: RULE, color: MUTED }}>
                <Linkedin className="h-4 w-4" aria-hidden /> LinkedIn<span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a href={dpContact.demos} className={`${ACTION} gap-2`} style={{ borderColor: RULE, color: MUTED }}>
                Demos
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
