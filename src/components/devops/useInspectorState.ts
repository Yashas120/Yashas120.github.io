/**
 * Which inspector panel is showing, and why.
 *
 * Two inputs, in priority order:
 *  1. An explicit selection — a tab press, or an `?inspect=` parameter on load.
 *     These use pushState, so browser back and forward restore them.
 *  2. Scroll position. A chapter becomes active when it crosses a line at 45% of
 *     the viewport, detected with an IntersectionObserver rather than a scroll
 *     handler. This never touches browser history, so an ordinary read does not
 *     leave dozens of entries behind, and scrolling back up simply restores the
 *     previous chapter's panel.
 *
 * Scrolling into a new chapter releases an explicit selection and drops the query
 * parameter with replaceState, so the URL never claims a panel that is not showing.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { chapters, isPanelId, type ChapterId, type PanelId } from "@/data/devops/chapters";

const PARAM = "inspect";

export interface InspectorState {
  /** Panel to render. */
  panel: PanelId;
  /** Chapter the reader is in, used for the context bar. */
  chapter: ChapterId;
  /** True when the panel came from an explicit selection. */
  pinned: boolean;
  select: (panel: PanelId) => void;
}

export function useInspectorState(): InspectorState {
  const [chapter, setChapter] = useState<ChapterId>("hero");
  const [pinned, setPinned] = useState<PanelId | null>(null);
  const chapterRef = useRef<ChapterId>("hero");

  // Explicit selection from the URL, on load and on back/forward.
  useEffect(() => {
    const read = () => {
      const value = new URLSearchParams(window.location.search).get(PARAM);
      setPinned(isPanelId(value) ? value : null);
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  // Chapter activation at the 45% line.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        const id = hit?.target.getAttribute("data-chapter") as ChapterId | null;
        if (!id || id === chapterRef.current) return;
        chapterRef.current = id;
        setChapter(id);
        // Moving to a new chapter releases the pin, and the URL follows without
        // adding a history entry.
        setPinned((current) => {
          if (current) {
            const url = new URL(window.location.href);
            url.searchParams.delete(PARAM);
            window.history.replaceState(null, "", url);
          }
          return null;
        });
      },
      { rootMargin: "-45% 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const select = useCallback((panel: PanelId) => {
    setPinned(panel);
    const url = new URL(window.location.href);
    url.searchParams.set(PARAM, panel);
    window.history.pushState(null, "", url);
  }, []);

  const scrolled = chapters.find((c) => c.id === chapter) ?? chapters[0];
  return { panel: pinned ?? scrolled.inspectorPanel, chapter, pinned: pinned !== null, select };
}
