"use client";

import { useEffect, useState } from "react";

// Tracks whether the light theme is active (html.light), updating live when the
// ThemeToggle flips it. Lets canvas/SVG widgets (which draw colors in JS) pick
// theme-appropriate colors and redraw.
export function useIsLight(): boolean {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    const update = () => setLight(el.classList.contains("light"));
    update();
    const mo = new MutationObserver(update);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  return light;
}
