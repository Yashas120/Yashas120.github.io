"use client";

import { GhostLab } from "@/components/demos/GhostDemo";
import { AppHeader } from "./ui";

export function Sched() {
  return (
    <div className="min-h-full">
      <AppHeader command="sched — ghOSt case study" hint="implementation · architecture · testing" />
      <div className="p-4">
        <GhostLab />
      </div>
    </div>
  );
}
