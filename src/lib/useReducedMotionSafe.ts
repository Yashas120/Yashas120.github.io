"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Hydration-safe reduced-motion: returns false on the server and on the first
// client render (matching SSR), then the real preference after mount. This avoids
// hydration mismatches when the server renders the animated tree but the client
// prefers reduced motion (which would otherwise trigger a React hydration error).
export function useReducedMotionSafe(): boolean {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? Boolean(reduced) : false;
}
