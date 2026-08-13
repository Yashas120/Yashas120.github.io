"use client";

import { ProjectDemoPresentation } from "@/components/demos/ProjectDemoPresentation";
import type { DemoId } from "@/data/demos";
import { DV } from "./tokens";

const inspectorTheme = {
  accent: DV.amber,
  surface: DV.inspector,
  border: DV.border,
  text: DV.text,
  muted: DV.muted,
  label: "Sources · project evidence",
};

/**
 * Every verified /devtools preview is expanded in the document by default.
 * `autoOpen` still loads the expensive lab chunk only near the viewport.
 */
export function DefaultProjectPreview({ demoId }: Readonly<{ demoId: DemoId }>) {
  return (
    <section
      id={`inspect-${demoId}`}
      tabIndex={-1}
      className="mt-6 scroll-mt-[calc(52svh+72px)] outline-none dock:scroll-mt-20"
      aria-label={`Open ${demoId} project preview`}
    >
      <ProjectDemoPresentation
        demoId={demoId}
        theme={inspectorTheme}
        headingLevel={4}
        autoOpen
        eyebrow="Preview open · implementation ready to inspect"
      />
    </section>
  );
}
