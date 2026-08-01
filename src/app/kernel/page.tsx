"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { BootSequence } from "@/components/kernel/BootSequence";
import { Desktop } from "@/components/kernel/desktop/Desktop";
import { apps, initialOpen } from "@/components/kernel/apps/registry";

export default function KernelPage() {
  const [booted, setBooted] = useState(false);

  return (
    <main className="h-[100dvh] overflow-hidden bg-ink-900 text-zinc-300">
      <Desktop apps={apps} initialOpen={initialOpen} />
      <AnimatePresence>
        {!booted && <BootSequence onDone={() => setBooted(true)} />}
      </AnimatePresence>
    </main>
  );
}
