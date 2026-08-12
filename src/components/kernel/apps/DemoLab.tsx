"use client";

import { FlaskConical } from "lucide-react";
import { ProjectDemoHandoff } from "@/components/demos/ProjectDemoHandoff";
import { ProjectEvidenceHeader } from "@/components/demos/ProjectEvidenceHeader";
import { demoEvidence } from "@/data/demos";
import { useDesktop } from "../desktop/DesktopContext";
import { PHOSPHOR } from "../desktop/types";

const kernelDemoTheme = {
  accent: PHOSPHOR,
  surface: "#10151c",
  border: "rgba(74, 222, 128, 0.25)",
  text: "#f4f4f5",
  muted: "#a1a1aa",
  label: "demo-lab process evidence",
};

export function DemoLab() {
  const { demoId } = useDesktop();
  if (!demoId) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center p-8 text-center">
        <FlaskConical className="h-7 w-7" style={{ color: PHOSPHOR }} aria-hidden="true" />
        <h2 className="mt-3 text-lg font-semibold text-zinc-100">No demo process selected</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">Open Projects (htop), expand a project with an exact match, and choose Run live demo.</p>
      </div>
    );
  }

  const project = demoEvidence(demoId);
  return (
    <div className="min-h-full p-3 sm:p-5" data-kernel-demo={demoId}>
      <p className="mb-3 font-mono text-[11px]" style={{ color: PHOSPHOR }}>$ exec ./demo --project={demoId}<br />[browser process ready]</p>
      <ProjectEvidenceHeader projectId={project.projectId} theme={kernelDemoTheme} headingLevel={2} />
      <ProjectDemoHandoff demoId={demoId} theme={kernelDemoTheme} headingLevel={3} autoOpen />
    </div>
  );
}
