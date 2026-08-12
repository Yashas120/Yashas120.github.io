"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ChevronDown, HelpCircle, Moon, RotateCcw, Sun, Terminal } from "lucide-react";
import { hexToRgba } from "@/lib/utils";
import { useTheme } from "@/lib/useTheme";
import { PHOSPHOR, type AppDef } from "./types";
import { formatUptime } from "./uptime";

export function MenuBar({
  apps,
  activeTitle,
  onLaunch,
  onHelp,
  onReplayBoot,
  returnHref,
}: Readonly<{
  apps: AppDef[];
  activeTitle?: string;
  onLaunch: (id: string) => void;
  onHelp: () => void;
  onReplayBoot: () => void;
  returnHref: string;
}>) {
  const [now, setNow] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { light, toggle } = useTheme();

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const clock = now
    ? new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  return (
    <header
      className="relative z-[50] flex h-12 flex-shrink-0 items-center justify-between border-b px-2 backdrop-blur sm:h-9 sm:px-3"
      style={{ borderColor: "rgb(var(--line) / 0.1)", background: "rgb(var(--ink-900) / 0.82)" }}
    >
      {/* Applications menu */}
      <div ref={menuRef} className="relative flex min-w-0 items-center gap-1">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="flex min-h-11 items-center gap-1.5 rounded px-2 py-1 font-mono text-[11px] transition-colors hover:bg-line/10 sm:min-h-0"
          style={{ color: PHOSPHOR }}
        >
          <Terminal className="h-3.5 w-3.5" />
          <span className="font-semibold">yashOS</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: reducedMotion ? 0 : 0.12 }}
              className="absolute left-0 top-12 w-64 overflow-hidden rounded-lg border win-shadow sm:top-9"
              style={{ borderColor: "rgb(var(--line) / 0.12)", background: "rgb(var(--ink-800))" }}
            >
              <p className="border-b px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>
                Applications
              </p>
              <ul className="p-1">
                {apps.filter((a) => !a.hiddenLauncher).map((a) => {
                  const Icon = a.icon;
                  return (
                    <li key={a.id}>
                      <button
                        role="menuitem"
                        onClick={() => {
                          onLaunch(a.id);
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-left transition-colors hover:bg-line/10"
                      >
                        <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: PHOSPHOR }} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline gap-1.5">
                            <span className="truncate text-[12px] text-zinc-100">{a.friendly}</span>
                            <span className="font-mono text-[9px] text-zinc-500">{a.short}</span>
                          </span>
                          {a.blurb && <span className="block truncate text-[10px] text-zinc-500">{a.blurb}</span>}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t p-1" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>
                <button
                  role="menuitem"
                  onClick={() => {
                    onReplayBoot();
                    setMenuOpen(false);
                  }}
                  className="flex min-h-11 w-full items-center gap-2.5 rounded px-2.5 py-2 text-left text-[12px] text-zinc-300 transition-colors hover:bg-line/10"
                >
                  <RotateCcw className="h-3.5 w-3.5" style={{ color: PHOSPHOR }} />
                  Replay boot sequence
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Link
          href={returnHref}
          className="flex min-h-11 items-center gap-1.5 rounded px-2 font-mono text-[10px] text-zinc-300 transition-colors hover:bg-line/10 hover:text-zinc-50 sm:min-h-9 sm:text-[11px]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Return to Portfolio Overview</span>
          <span className="sm:hidden">Overview</span>
        </Link>
      </div>

      {activeTitle && (
        <span className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 truncate font-mono text-[11px] text-zinc-500 lg:block">
          {activeTitle}
        </span>
      )}

      <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500 sm:gap-3">
        <span className="hidden md:inline">up {now ? formatUptime(now) : "--"}</span>
        <button
          onClick={onHelp}
          aria-label="Show the guided tour"
          className="flex h-11 w-11 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-line/10 hover:text-zinc-100 sm:h-8 sm:w-8"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={toggle}
          aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
          className="flex h-11 w-11 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-line/10 hover:text-zinc-100 sm:h-8 sm:w-8"
        >
          {light ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        </button>
        <span
          className="rounded px-1.5 py-0.5"
          style={{ background: hexToRgba(PHOSPHOR, 0.1), color: PHOSPHOR }}
        >
          {clock}
        </span>
      </div>
    </header>
  );
}
