import { demoEvidence, type DemoId } from "@/data/demos";
import { ProjectDemoHandoff } from "./ProjectDemoHandoff";
import { ProjectEvidenceHeader, type ProjectDemoTheme } from "./ProjectEvidenceHeader";

export function ProjectDemoPresentation({
  demoId,
  theme,
  headingLevel = 2,
  preview = false,
  autoOpen = false,
  eyebrow,
}: Readonly<{
  demoId: DemoId;
  theme?: ProjectDemoTheme;
  headingLevel?: 2 | 3 | 4;
  preview?: boolean;
  autoOpen?: boolean;
  eyebrow?: string;
}>) {
  const project = demoEvidence(demoId);
  const handoffHeading = Math.min(headingLevel + 1, 4) as 3 | 4;
  return (
    <article data-project-id={project.projectId}>
      <ProjectEvidenceHeader projectId={project.projectId} theme={theme} headingLevel={headingLevel} compact={preview} eyebrow={eyebrow} />
      <ProjectDemoHandoff demoId={demoId} theme={theme} headingLevel={handoffHeading} variant={preview ? "preview" : "embedded"} autoOpen={autoOpen} />
    </article>
  );
}
