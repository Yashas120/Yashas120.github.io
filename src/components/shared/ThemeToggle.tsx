"use client";

import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/useTheme";

export function ThemeToggle() {
  const { light, toggle } = useTheme();
  const pathname = usePathname();

  // The kernel desktop carries its own tray toggle in the menu bar; a floating
  // pill would sit on top of the mobile dock. /cluster is a fixed editorial
  // canvas with its own palette, so the toggle has nothing to switch there.
  if (pathname === "/kernel" || pathname === "/cluster") return null;

  return (
    <button
      onClick={toggle}
      aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
      className="fixed bottom-5 left-5 z-[70] flex items-center gap-2 rounded-full border border-line/25 bg-ink-700 px-4 py-2.5 text-xs font-medium text-zinc-100 shadow-lg shadow-black/30 ring-1 ring-line/10 backdrop-blur transition-colors hover:border-line/50"
    >
      {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      <span>{light ? "Dark mode" : "Light mode"}</span>
    </button>
  );
}
