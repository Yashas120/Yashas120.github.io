"use client";

import { createContext, useContext } from "react";
import type { DemoId } from "@/data/demos";

export interface ProjectInspectorApi {
  selectedProject: DemoId | null;
  onInspectProject: (demoId: DemoId) => void;
  closeProject: () => void;
}

const ProjectInspectorContext = createContext<ProjectInspectorApi>({
  selectedProject: null,
  onInspectProject: () => {},
  closeProject: () => {},
});

export const ProjectInspectorProvider = ProjectInspectorContext.Provider;

export function useProjectInspector(): ProjectInspectorApi {
  return useContext(ProjectInspectorContext);
}
