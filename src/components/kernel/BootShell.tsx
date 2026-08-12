"use client";

import { useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Power } from "lucide-react";
import { Terminal } from "./apps/Terminal";
import { DesktopProvider } from "./desktop/DesktopContext";
import { PHOSPHOR } from "./desktop/types";

/**
 * A pre-boot shell that stays on the boot (CRT) screen instead of entering the
 * OS. It hosts the real interactive Terminal so a visitor can poke around
 * (`help`, `whoami`, `ps`, ...) before deciding to boot. Pressing F5 — or the
 * button — boots the desktop. Commands that would open a window instead boot
 * the OS and open that app there, so nothing is a dead end.
 */
export function BootShell({ onBoot }: Readonly<{ onBoot: (appId?: string) => void }>) {
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F5") {
        e.preventDefault();
        onBoot();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBoot]);

  // Give the embedded Terminal a desktop context. There's no desktop yet, so
  // anything that wants a window boots the OS and opens it there instead.
  const api = useMemo(
    () => ({
      open: (id: string) => onBoot(id),
      close: () => {},
      isOpen: () => false,
      panic: () => onBoot(),
    }),
    [onBoot]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.25 }}
      className="crt fixed inset-0 z-[70] flex flex-col"
    >
      <div
        className="flex flex-shrink-0 items-center justify-between gap-2 border-b px-4 py-2"
        style={{ borderColor: "rgba(74,222,128,0.2)" }}
      >
        <span className="min-w-0 flex-1 truncate font-mono text-[11px]" style={{ color: "rgb(var(--term-dim))" }}>
          <span style={{ color: PHOSPHOR }}>yashas@kernel</span>: pre-boot shell — type{" "}
          <span style={{ color: PHOSPHOR }}>help</span>, or boot the desktop →
        </span>
        <button
          onClick={() => onBoot()}
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors"
          style={{ borderColor: "rgba(74,222,128,0.4)", color: PHOSPHOR, background: "rgba(74,222,128,0.08)" }}
        >
          <Power className="h-3 w-3" /> F5 · boot OS
        </button>
      </div>

      <DesktopProvider value={api}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Terminal autoFocus />
        </div>
      </DesktopProvider>
    </motion.div>
  );
}
