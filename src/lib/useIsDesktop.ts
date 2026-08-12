"use client";

import { useEffect, useState } from "react";

// Hydration-safe desktop check: false on the server and first client render,
// then true after mount if the viewport is >= 1024px. Used to enable the pinned
// cinematic layout on desktop while keeping natural document scroll on mobile.
export function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}
