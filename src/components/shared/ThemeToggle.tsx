"use client";

import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/useTheme";

export function ThemeToggle() {
  const { light, toggle } = useTheme();
  // Normalised so the checks below hold whether or not the export adds a
  // trailing slash to the route.
  const pathname = usePathname()?.replace(/(.)\/+$/, "$1");

  // The kernel desktop carries its own tray toggle in the menu bar; a floating
  // pill would sit on top of the mobile dock. /cluster, /backend and /data-plane
  // are fixed editorial canvases with their own palettes, so the toggle has
  // nothing to switch there. /fde is not in this list: it ships a complete ivory
  // theme and a complete midnight theme and this toggle is how you pick one.
  const FIXED_PALETTE = ["/kernel", "/cluster", "/backend", "/data-plane"];
  if (pathname && FIXED_PALETTE.includes(pathname)) return null;

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
