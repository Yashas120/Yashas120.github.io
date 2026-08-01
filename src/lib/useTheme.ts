"use client";

import { useEffect, useState } from "react";

/** Reads and flips the `html.light` class that drives every theme token. */
export function useTheme(): { light: boolean; toggle: () => void } {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {
      /* ignore storage errors */
    }
  };

  return { light, toggle };
}
