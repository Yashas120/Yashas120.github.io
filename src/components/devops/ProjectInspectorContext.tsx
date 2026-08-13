"use client";

import { createContext, useContext } from "react";
import type { DemoId } from "@/data/demos";

export interface ProjectInspectorApi {
  onInspectProject: (demoId: DemoId) => void;
}

const ProjectInspectorContext = createContext<ProjectInspectorApi>({
  onInspectProject: () => {},
});

export const ProjectInspectorProvider = ProjectInspectorContext.Provider;

export function useProjectInspector(): ProjectInspectorApi {
  return useContext(ProjectInspectorContext);
}
