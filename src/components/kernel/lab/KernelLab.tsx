"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { DEMOS } from "@/data/demos";
import { BootSequence } from "../BootSequence";
import { BootShell } from "../BootShell";
import { apps } from "../apps/registry";
import { Desktop } from "../desktop/Desktop";
import { useLabRouteState } from "./useLabRouteState";

type LabMode = "desktop" | "boot" | "shell";

export function KernelLab() {
  const [mode, setMode] = useState<LabMode>("desktop");
  const validIds = useMemo(() => apps.map((app) => app.id), []);
  const validDemoIds = useMemo(() => DEMOS.map((demo) => demo.id), []);
  const route = useLabRouteState(validIds, validDemoIds);

  const finishBoot = (appId?: string) => {
    setMode("desktop");
    if (appId && validIds.includes(appId)) route.openApp(appId);
  };

  return (
    <main className="relative h-[100dvh] overflow-hidden bg-ink-900 text-zinc-300">
      <Desktop
        apps={apps}
        initialOpen={["man"]}
        active={mode === "desktop"}
        routeAppId={route.appId}
        routeDemoId={route.demoId}
        onAppOpen={route.openApp}
        onDemoOpen={route.openDemo}
        onRoutedAppClose={route.closeApp}
        onReplayBoot={() => setMode("boot")}
        returnHref="/kernel"
      />

      {route.invalidApp ? (
        <div role="status" className="pointer-events-none fixed bottom-24 left-1/2 z-[55] flex -translate-x-1/2 items-center gap-2 rounded-lg border border-amber-300/30 bg-ink-800/95 px-4 py-3 font-mono text-xs text-amber-200 shadow-xl">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          Unknown app “{route.invalidApp}”; opened the yashOS desktop safely.
        </div>
      ) : null}

      <AnimatePresence>
        {mode === "boot" ? (
          <BootSequence key="boot" onDone={() => finishBoot()} onReadTerminal={() => setMode("shell")} />
        ) : null}
        {mode === "shell" ? <BootShell key="shell" onBoot={finishBoot} /> : null}
      </AnimatePresence>
    </main>
  );
}
