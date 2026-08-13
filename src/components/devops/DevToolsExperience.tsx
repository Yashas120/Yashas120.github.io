"use client";

import { useCallback, useMemo, useRef } from "react";
import type { DemoId } from "@/data/demos";
import { MobileInspectorSheet } from "./MobileInspectorSheet";
import { PortfolioDocument } from "./PortfolioDocument";
import { PortfolioHeader } from "./PortfolioHeader";
import { ProjectInspectorProvider } from "./ProjectInspectorContext";
import { ScrollInspectorStage } from "./ScrollInspectorStage";
import { DV } from "./tokens";
import { useScrollNarrative } from "./useScrollNarrative";

export function DevToolsExperience() {
  const narrativeRef = useRef<HTMLDivElement>(null);
  const { progress, reduceMotion } = useScrollNarrative(narrativeRef);

  const onInspectProject = useCallback((demoId: DemoId) => {
    const preview = document.getElementById(`inspect-${demoId}`);
    if (!preview) return;
    window.history.pushState({ demoId }, "", `${window.location.pathname}${window.location.search}#inspect-${demoId}`);
    preview.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    preview.focus({ preventScroll: true });
  }, [reduceMotion]);

  const api = useMemo(() => ({ onInspectProject }), [onInspectProject]);

  return (
    <ProjectInspectorProvider value={api}>
      <div className="devops min-h-screen">
        <a href="#main-content" className="skip-link m-2 rounded-md px-3 py-2 text-[14px]" style={{ background: DV.amber, color: DV.canvas }}>Skip to portfolio</a>
        <PortfolioHeader />

        <div ref={narrativeRef} className="dv-scroll-narrative" data-motion-ready="false">
          <div className="dv-stage-rail">
            <ScrollInspectorStage progress={progress} reduced={reduceMotion} />
          </div>
          <div className="dv-copy-rail">
            <PortfolioDocument />
          </div>
        </div>

        <div className="h-20 md:h-0" aria-hidden />
        <MobileInspectorSheet />
      </div>
    </ProjectInspectorProvider>
  );
}
