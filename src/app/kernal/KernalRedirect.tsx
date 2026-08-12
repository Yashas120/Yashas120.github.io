"use client";

import { useEffect } from "react";

export function KernalRedirect() {
  useEffect(() => {
    const target = `/kernel/${window.location.hash || ""}`;
    window.location.replace(target);
  }, []);

  return null;
}
