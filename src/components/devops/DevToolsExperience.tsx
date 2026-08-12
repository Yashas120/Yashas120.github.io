"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { ProjectDemoPresentation } from "@/components/demos/ProjectDemoPresentation";
import { DEMOS, type DemoId } from "@/data/demos";
import { BrowserShell } from "./BrowserShell";
import { InspectorDock } from "./InspectorDock";
import { MobileInspectorSheet } from "./MobileInspectorSheet";
import { PortfolioDocument } from "./PortfolioDocument";
import { PortfolioHeader } from "./PortfolioHeader";
import { ProjectInspectorProvider } from "./ProjectInspectorContext";
import { TabletPanelBar } from "./TabletPanelBar";
import { DV } from "./tokens";

const inspectorTheme = {
  accent: DV.amber,
  surface: DV.inspector,
  border: DV.border,
  text: DV.text,
  muted: DV.muted,
  label: "Elements · project evidence",
};

const exactProjects: readonly { id: DemoId; label: string; surface: string }[] = [
  { id: "bitcoin", label: "Bitcoin", surface: "Network" },
  { id: "cifar", label: "CIFAR streaming", surface: "Sources · stream.py" },
  { id: "multiview", label: "Multiview", surface: "Network" },
  { id: "swift", label: "SWIFT", surface: "Elements" },
  { id: "petra", label: "Petra", surface: "Network" },
  { id: "chocollvm", label: "ChocoLLVM", surface: "Console" },
  { id: "parallel", label: "Parallel", surface: "Console" },
  { id: "cloud", label: "Cloud provisioning", surface: "Network" },
];

const isDemoId = (value: string | null): value is DemoId =>
  !!value && DEMOS.some((demo) => demo.id === value);

export function DevToolsExperience() {
  const [selectedProject, setSelectedProject] = useState<DemoId | null>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const readHash = useCallback(() => {
    const match = window.location.hash.match(/^#inspect-(.+)$/);
    setSelectedProject(isDemoId(match?.[1] ?? null) ? match![1] as DemoId : null);
  }, []);

  useEffect(() => {
    readHash();
    window.addEventListener("popstate", readHash);
    window.addEventListener("hashchange", readHash);
    return () => {
      window.removeEventListener("popstate", readHash);
      window.removeEventListener("hashchange", readHash);
    };
  }, [readHash]);

  const onInspectProject = useCallback((demoId: DemoId) => {
    setSelectedProject(demoId);
    window.history.pushState({ demoId }, "", `${window.location.pathname}${window.location.search}#inspect-${demoId}`);
  }, []);

  const closeProject = useCallback(() => {
    setSelectedProject(null);
    window.history.pushState({ demoId: null }, "", `${window.location.pathname}${window.location.search}`);
  }, []);

  const api = useMemo(() => ({ selectedProject, onInspectProject, closeProject }), [closeProject, onInspectProject, selectedProject]);

  return (
    <ProjectInspectorProvider value={api}>
      <div className="devops min-h-screen">
        <a href="#main-content" className="skip-link m-2 rounded-md px-3 py-2 text-[14px]" style={{ background: DV.amber, color: DV.canvas }}>Skip to portfolio</a>
        <PortfolioHeader />
        <TabletPanelBar />

        <BrowserShell>
          <div className="grid grid-cols-1 dock:grid-cols-[58fr_42fr]">
            <PortfolioDocument />
            <InspectorDock />
          </div>
        </BrowserShell>

        <section className="mx-auto mt-3 w-full px-3 sm:px-6" style={{ maxWidth: 1536 }} aria-labelledby="project-console-title">
          <div className="rounded-lg border p-3" style={{ borderColor: DV.border, background: DV.inspector }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: DV.amber }}>Console · projects()</p>
                <h2 id="project-console-title" className="mt-1 text-base font-semibold" style={{ color: DV.text }}>Inspect a live implementation</h2>
              </div>
              <p className="font-mono text-[11px]" style={{ color: DV.muted }}>Network status, sizes, and timing are not fabricated.</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Projects available for live inspection">
              {exactProjects.map((project) => (
                <button key={project.id} type="button" aria-pressed={selectedProject === project.id} onClick={() => onInspectProject(project.id)} className="min-h-11 rounded border px-3 text-left font-mono text-[11px] focus-visible:outline-none focus-visible:ring-2" style={{ borderColor: selectedProject === project.id ? DV.amber : DV.border, color: selectedProject === project.id ? DV.amber : DV.text }}>
                  <span className="block">{project.label}</span><span className="block text-[9px]" style={{ color: DV.muted }}>{project.surface}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {selectedProject && (
          <section ref={drawerRef} tabIndex={-1} className="mx-auto mt-4 w-full scroll-mt-20 px-3 pb-12 outline-none sm:px-6" style={{ maxWidth: 1536 }} aria-label="Live project implementation drawer">
            <div className="mb-2 flex items-center justify-between rounded-t-lg border px-3 py-2 font-mono text-[11px]" style={{ borderColor: DV.border, background: DV.browser, color: DV.muted }}>
              <span>Network request complete · live implementation ready</span>
              <button type="button" onClick={closeProject} className="flex h-11 w-11 items-center justify-center rounded hover:bg-white/5" aria-label="Close live implementation drawer"><X className="h-4 w-4" aria-hidden="true" /></button>
            </div>
            <ProjectDemoPresentation demoId={selectedProject} theme={inspectorTheme} autoOpen eyebrow="Inspect live implementation" />
          </section>
        )}

        <div className="h-20 md:h-0" aria-hidden />
        <MobileInspectorSheet />
      </div>
    </ProjectInspectorProvider>
  );
}
