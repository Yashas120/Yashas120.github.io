/**
 * Mobile inspector (<768px): a sticky trigger and an accessible bottom sheet.
 *
 * A separate, intentional composition rather than a squeezed dock. It is a modal
 * dialog: focus is trapped while it is open, Escape closes it, and focus returns
 * to the trigger — the reader never loses their place in the document, and the
 * page behind it is not scroll-locked into a new position.
 *
 * The sheet adds nothing that is missing from the document above it.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PanelBottomOpen, X } from "lucide-react";
import { chapterForPanel, chapters, panelLabel } from "@/data/devops/chapters";
import { InspectorTabs } from "./InspectorTabs";
import { Panel } from "./panels/registry";
import { useInspectorState } from "./useInspectorState";
import { DV } from "./tokens";

const FOCUSABLE = 'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

export function MobileInspectorSheet() {
  const { panel, chapter, select } = useInspectorState();
  const [open, setOpen] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    // The trigger is conditionally rendered, so restore focus after React has
    // committed the closed state and mounted it again.
    requestAnimationFrame(() => trigger.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;
    // Move focus into the sheet, but never into a text input.
    sheet.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !sheet.current) return;
      const items = Array.from(sheet.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === sheet.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  return (
    <div className="md:hidden">
      {!open && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t p-2" style={{ borderColor: DV.border, background: DV.canvas }}>
          <button
            ref={trigger}
            type="button"
            onClick={() => setOpen(true)}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md text-[15px] font-medium"
            style={{ background: DV.amber, color: DV.canvas }}
          >
            <PanelBottomOpen className="h-4 w-4" aria-hidden /> Inspect this section
          </button>
        </div>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={close} aria-hidden />
          <div
            ref={sheet}
            role="dialog"
            aria-modal="true"
            aria-label={`${panelLabel[panel]} inspector`}
            tabIndex={-1}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[82dvh] flex-col rounded-t-[14px] border-t shadow-2xl"
            style={{ borderColor: DV.border, background: DV.inspector }}
          >
            <div className="flex items-center justify-between gap-2 border-b px-3 py-2" style={{ borderColor: DV.border }}>
              <span className="font-mono text-[12px]" style={{ color: DV.muted }}>
                {chapters.find((item) => item.id === chapter)?.path ?? chapterForPanel(panel).path}
              </span>
              <button
                type="button"
                onClick={close}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 text-[14px]"
                style={{ color: DV.text }}
              >
                <X className="h-4 w-4" aria-hidden /> Close
              </button>
            </div>
            <InspectorTabs active={panel} onSelect={select} idPrefix="sheet" />
            <div
              id="sheet-panel"
              role="tabpanel"
              aria-labelledby={`sheet-tab-${panel}`}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              <Panel id={panel} chapter={chapter} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
