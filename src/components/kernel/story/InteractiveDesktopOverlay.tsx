"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import type { DemoId } from "@/data/demos";
import { BootSequence } from "../BootSequence";
import { BootShell } from "../BootShell";
import { apps } from "../apps/registry";
import { Desktop } from "../desktop/Desktop";

type DesktopMode = "desktop" | "boot" | "shell";

export default function InteractiveDesktopOverlay({
  appId,
  demoId,
  invalidApp,
  onClose,
  onAppOpen,
  onDemoOpen,
  onAppClose,
}: Readonly<{
  appId?: string;
  demoId?: DemoId;
  invalidApp?: string;
  onClose: () => void;
  onAppOpen: (id: string) => void;
  onDemoOpen: (id: DemoId) => void;
  onAppClose: () => void;
}>) {
  const [mode, setMode] = useState<DesktopMode>("desktop");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const focusable = () => [...overlay.querySelectorAll<HTMLElement>(
      "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
    )].filter((element) => !element.closest("[inert]"));
    window.requestAnimationFrame(() => focusable()[0]?.focus());

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const nestedDialog = [...overlay.querySelectorAll('[role="dialog"]')]
          .some((dialog) => dialog !== overlay);
        const menuOpen = Boolean(overlay.querySelector('[role="menu"]'));
        if (!nestedDialog && !menuOpen) onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items.at(-1) ?? first;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const finishBoot = (nextApp?: string) => {
    setMode("desktop");
    if (nextApp && apps.some((app) => app.id === nextApp)) onAppOpen(nextApp);
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Interactive yashOS desktop"
      className="fixed inset-0 z-[300] bg-ink-900 text-zinc-300"
    >
      <Desktop
        apps={apps}
        initialOpen={appId ? [] : ["man"]}
        active={mode === "desktop"}
        routeAppId={appId}
        routeDemoId={demoId}
        onAppOpen={onAppOpen}
        onDemoOpen={onDemoOpen}
        onRoutedAppClose={onAppClose}
        onReplayBoot={() => setMode("boot")}
        onReturn={onClose}
      />

      {invalidApp ? (
        <div role="status" className="pointer-events-none fixed bottom-24 left-1/2 z-[355] flex -translate-x-1/2 items-center gap-2 rounded-lg border border-amber-300/30 bg-ink-800/95 px-4 py-3 font-mono text-xs text-amber-200 shadow-xl">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          Unknown app “{invalidApp}”; opened the yashOS desktop safely.
        </div>
      ) : null}

      <AnimatePresence>
        {mode === "boot" ? (
          <BootSequence key="boot" onDone={() => finishBoot()} onReadTerminal={() => setMode("shell")} />
        ) : null}
        {mode === "shell" ? <BootShell key="shell" onBoot={finishBoot} /> : null}
      </AnimatePresence>
    </div>
  );
}
