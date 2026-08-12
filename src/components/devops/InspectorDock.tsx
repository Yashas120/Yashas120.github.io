/**
 * The docked inspector (≥1180px) and the inline tablet inspector.
 *
 * The dock is sticky below the browser chrome and changes with the chapter the
 * reader is in; it never takes over scrolling, never locks input, and carries no
 * information that is missing from the document beside it. Panel changes are a
 * 180ms cross-fade — short enough that the reader is never waiting on it.
 *
 * Ambient motion is suspended while the tab is in the background: `data-idle`
 * pauses every animation inside the dock (see globals.css).
 */

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { chapterForPanel, panelLabel, type PanelId } from "@/data/devops/chapters";
import { InspectorTabs } from "./InspectorTabs";
import { Panel } from "./panels/registry";
import { useInspectorState } from "./useInspectorState";
import { CHROME_H, CONTEXT_H, DV, HEADER_H } from "./tokens";

function ContextBar({ panel, pinned }: Readonly<{ panel: PanelId; pinned: boolean }>) {
  return (
    <div
      className="flex items-center justify-between gap-2 border-b px-3 font-mono text-[12px]"
      style={{ height: CONTEXT_H, borderColor: DV.border, color: DV.muted, background: DV.inspector }}
    >
      <span className="truncate">{chapterForPanel(panel).path}</span>
      <span style={{ color: pinned ? DV.amber : DV.muted }}>{pinned ? "selected" : "following scroll"}</span>
    </div>
  );
}

export function InspectorDock() {
  const { panel, pinned, select } = useInspectorState();
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const sync = () => setIdle(document.visibilityState !== "visible");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return (
    <aside
      aria-label="Delivery system inspector"
      data-idle={idle}
      className="hidden border-l dock:block"
      style={{ borderColor: DV.border, background: DV.inspector }}
    >
      <div
        className="sticky flex flex-col"
        style={{
          top: HEADER_H + CHROME_H,
          maxHeight: `calc(100vh - ${HEADER_H + CHROME_H}px)`,
        }}
      >
        <InspectorTabs active={panel} onSelect={select} idPrefix="dock" />
        <ContextBar panel={panel} pinned={pinned} />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={panel}
              id={`dock-panel-${panel}`}
              role="tabpanel"
              aria-labelledby={`dock-tab-${panel}`}
              tabIndex={-1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Panel id={panel} live />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}

/**
 * Tablet (768–1179px): each chapter's inspector is rendered directly after it, so
 * the explanation stays next to the content it explains instead of floating in a
 * column that no longer fits. Pure layout — no scroll tracking, no second
 * scrollbar, and it renders in the static HTML.
 */
export function InlineInspector({ panel }: Readonly<{ panel: PanelId }>) {
  return (
    <section
      aria-label={`${panelLabel[panel]} inspector`}
      className="mt-6 hidden overflow-hidden rounded-lg border md:block dock:hidden"
      style={{ borderColor: DV.border, background: DV.inspector }}
      id={`inline-${panel}`}
    >
      <div
        className="flex items-center justify-between border-b px-3 py-1.5 font-mono text-[12px]"
        style={{ borderColor: DV.border, color: DV.muted }}
      >
        <span>{chapterForPanel(panel).path}</span>
        <span>{panelLabel[panel]}</span>
      </div>
      <Panel id={panel} />
    </section>
  );
}
