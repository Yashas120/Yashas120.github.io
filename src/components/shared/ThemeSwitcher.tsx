"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Command, X } from "lucide-react";
import { themes } from "@/lib/themes";
import { hexToRgba } from "@/lib/utils";

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  // The switcher is the only cross-interface navigation, so it lives ONLY on the
  // private index (/hidden). Individually shared role pages stay standalone.
  const enabled = pathname === "/hidden";

  const go = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router]
  );

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => (c + 1) % themes.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => (c - 1 + themes.length) % themes.length);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        go(themes[cursor].path);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, cursor, go, enabled]);

  const active = themes.find((t) => t.path === pathname);

  if (!enabled) return null;

  return (
    <>
      {/* Floating trigger */}
      <button
        aria-label="Switch interface (Cmd+K)"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs backdrop-blur transition-colors"
        style={{
          background: "rgb(var(--ink-800) / 0.85)",
          borderColor: active ? hexToRgba(active.accent, 0.4) : "rgb(var(--line) / 0.12)",
          color: active?.accent ?? "#d4d4d8",
        }}
      >
        <Command className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">switch interface</span>
        <kbd className="rounded bg-line/10 px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="w-full max-w-lg overflow-hidden rounded-xl border shadow-2xl"
              style={{ background: "#0b0d12", borderColor: "rgb(var(--line) / 0.1)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>
                <span className="font-mono text-xs text-zinc-400">Choose an interface</span>
                <button aria-label="Close" onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-200">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="p-2">
                {themes.map((t, i) => {
                  const isActive = t.path === pathname;
                  const isCursor = i === cursor;
                  return (
                    <li key={t.id}>
                      <button
                        onMouseEnter={() => setCursor(i)}
                        onClick={() => go(t.path)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors"
                        style={{ background: isCursor ? hexToRgba(t.accent, 0.1) : "transparent" }}
                      >
                        <span
                          className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                          style={{ background: t.accent, boxShadow: `0 0 10px ${hexToRgba(t.accent, 0.8)}` }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="font-medium text-zinc-100">{t.metaphor}</span>
                            <span className="font-mono text-[10px] text-zinc-500">{t.label}</span>
                            {isActive && (
                              <span className="rounded bg-line/10 px-1.5 py-0.5 font-mono text-[9px] text-zinc-300">current</span>
                            )}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-zinc-500">{t.tagline}</span>
                        </span>
                        <span className="font-mono text-[10px]" style={{ color: t.accent }}>{t.prompt}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t px-4 py-2 font-mono text-[10px] text-zinc-600" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>
                ↑↓ navigate · ↵ open · esc close
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
