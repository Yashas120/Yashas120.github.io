"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { BootSequence } from "@/components/kernel/BootSequence";
import { BootShell } from "@/components/kernel/BootShell";
import { Desktop } from "@/components/kernel/desktop/Desktop";
import { apps, initialOpen } from "@/components/kernel/apps/registry";

type Mode = "boot" | "shell" | "desktop";

export default function KernelPage() {
  // Starts at "boot" so the server-rendered markup matches the first client
  // render. The boot menu either boots straight into the desktop, or drops into
  // a pre-boot shell that waits for an explicit F5 before booting the OS.
  const [mode, setMode] = useState<Mode>("boot");
  const [openOnEnter, setOpenOnEnter] = useState<string | undefined>();
  const [fromShell, setFromShell] = useState(false);

  const boot = (appId?: string) => {
    setFromShell(true);
    setOpenOnEnter(appId);
    setMode("desktop");
  };

  return (
    <main className="h-[100dvh] overflow-hidden bg-ink-900 text-zinc-300">
      <Desktop
        apps={apps}
        initialOpen={initialOpen}
        active={mode === "desktop"}
        openOnEnter={openOnEnter}
        suppressTour={fromShell}
      />
      <AnimatePresence>
        {mode === "boot" && (
          <BootSequence
            key="boot"
            onDone={() => setMode("desktop")}
            onReadTerminal={() => setMode("shell")}
          />
        )}
        {mode === "shell" && <BootShell key="shell" onBoot={boot} />}
      </AnimatePresence>
    </main>
  );
}
