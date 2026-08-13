"use client";

import { useEffect, useState } from "react";
import type { MotionValue } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { demoEvidence, type DemoId } from "@/data/demos";
import { workById } from "@/data/backend";
import { SharedProjectLab } from "@/components/demos/ProjectDemoHandoff";
import { ControlPlaneSession } from "./ControlPlaneSession";

const projectIds: readonly DemoId[] = ["cloud", "bitcoin", "multiview", "swift"];
const workIds: Record<DemoId, string> = {
  cloud: "cloud-provisioning",
  bitcoin: "bitcoin",
  multiview: "multiview",
  swift: "swift",
  ghost: "ghost-scheduler",
  chocollvm: "chocollvm",
  cifar: "ssml",
  parallel: "parallel",
  yelp: "yelp",
  petra: "petra",
};

function ProjectDemoStage({ activeProject }: Readonly<{ activeProject: DemoId }>) {
  const [replay, setReplay] = useState(false);
  const evidence = demoEvidence(activeProject);
  const work = workById[workIds[activeProject]];

  useEffect(() => setReplay(false), [activeProject]);

  return (
    <div className="bk-project-demo" data-project-demo={activeProject}>
      <div className="bk-project-demo__head">
        <div>
          <p>PROJECT LAB · EXPLAIN → PROVE</p>
          <h3>{evidence.projectTitle}</h3>
        </div>
        <span>{projectIds.indexOf(activeProject) + 1} / {projectIds.length}</span>
      </div>

      <div className="bk-project-demo__actions">
        <button type="button" onClick={() => setReplay(true)}><RotateCcw aria-hidden /> Replay explanation</button>
        {evidence.projectSourceHref && <a href={evidence.projectSourceHref} target="_blank" rel="noreferrer">Repository</a>}
        {activeProject === "swift" && <a href="https://doi.org/10.47852/bonviewAIA42021930" target="_blank" rel="noreferrer">Paper</a>}
      </div>

      {replay ? (
        <div className="bk-project-demo__explain">
          <span>{work.featuredLabels?.join(" · ") ?? [...work.ownership, ...work.status].join(" · ")}</span>
          <h4>{work.technologies.slice(0, 4).join(" → ")}</h4>
          <p>{evidence.browserRuns}</p>
          <p>{evidence.simplification}</p>
          <button type="button" onClick={() => setReplay(false)}>Resolve into live demo</button>
        </div>
      ) : (
        <div className="bk-project-demo__viewport" data-demo-scroll-pass-through>
          <div className="bk-project-demo__scale">
            <SharedProjectLab key={activeProject} demoId={activeProject} load />
          </div>
        </div>
      )}
    </div>
  );
}

export function BackendStage({
  progress,
  activeProject,
  projectDemoVisible,
}: Readonly<{
  progress: MotionValue<number>;
  activeProject: DemoId;
  projectDemoVisible: boolean;
}>) {
  return (
    <aside className="bk-stage" aria-label="Live control-plane explanation">
      <div className="bk-stage__grid" aria-hidden="true" />
      <div className={`bk-stage__visual${projectDemoVisible ? " is-project" : ""}`} data-project-phase={projectDemoVisible ? "prove" : "explain"}>
        <ControlPlaneSession progress={progress} />
        {projectDemoVisible && <ProjectDemoStage activeProject={activeProject} />}
      </div>
    </aside>
  );
}
