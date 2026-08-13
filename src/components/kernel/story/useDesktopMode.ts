"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DemoId } from "@/data/demos";

interface DesktopLocation {
  open: boolean;
  appId?: string;
  demoId?: DemoId;
  invalidApp?: string;
}

function readDesktopLocation(validIds: readonly string[], validDemoIds: readonly DemoId[]): DesktopLocation {
  if (typeof window === "undefined") return { open: false };
  const url = new URL(window.location.href);
  if (url.searchParams.get("view") !== "desktop") return { open: false };
  const requested = url.searchParams.get("app") ?? undefined;
  const requestedDemo = url.searchParams.get("demo") ?? undefined;
  const demoId = validDemoIds.includes(requestedDemo as DemoId) ? requestedDemo as DemoId : undefined;
  if (demoId) return { open: true, appId: "demo-lab", demoId };
  if (!requested || validIds.includes(requested)) return { open: true, appId: requested };
  return { open: true, invalidApp: requested };
}

export function useDesktopMode(validIds: readonly string[], validDemoIds: readonly DemoId[]) {
  const [location, setLocation] = useState<DesktopLocation>({ open: false });
  const scrollRef = useRef(0);
  const openerRef = useRef<HTMLElement | null>(null);
  const openedHereRef = useRef(false);

  const sync = useCallback(() => setLocation(readDesktopLocation(validIds, validDemoIds)), [validDemoIds, validIds]);

  useEffect(() => {
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [sync]);

  useEffect(() => {
    if (!location.open) return;
    const previous = document.body.style.overflow;
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.scrollTo(0, scrollRef.current);
          openerRef.current?.focus({ preventScroll: true });
          window.history.scrollRestoration = previousRestoration;
        });
      });
    };
  }, [location.open]);

  const openDesktop = useCallback((appId?: string) => {
    scrollRef.current = window.scrollY;
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const url = new URL(window.location.href);
    url.searchParams.set("view", "desktop");
    if (appId && validIds.includes(appId)) url.searchParams.set("app", appId);
    else url.searchParams.delete("app");
    url.searchParams.delete("demo");
    openedHereRef.current = true;
    window.history.pushState({ kernelDesktop: true, scrollY: scrollRef.current }, "", `${url.pathname}${url.search}${url.hash}`);
    sync();
  }, [sync, validIds]);

  const closeDesktop = useCallback(() => {
    if (openedHereRef.current && window.history.state?.kernelDesktop) {
      openedHereRef.current = false;
      window.history.back();
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("view");
    url.searchParams.delete("app");
    url.searchParams.delete("demo");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    sync();
  }, [sync]);

  const openApp = useCallback((appId: string) => {
    if (!validIds.includes(appId)) return;
    const url = new URL(window.location.href);
    url.searchParams.set("view", "desktop");
    url.searchParams.set("app", appId);
    if (appId !== "demo-lab") url.searchParams.delete("demo");
    window.history.pushState({ kernelDesktop: true, app: appId }, "", `${url.pathname}${url.search}${url.hash}`);
    sync();
  }, [sync, validIds]);

  const openDemo = useCallback((demoId: DemoId) => {
    if (!validDemoIds.includes(demoId)) return;
    if (!location.open) {
      scrollRef.current = window.scrollY;
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      openedHereRef.current = true;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("view", "desktop");
    url.searchParams.set("app", "demo-lab");
    url.searchParams.set("demo", demoId);
    window.history.pushState({ kernelDesktop: true, app: "demo-lab", demo: demoId, scrollY: scrollRef.current }, "", `${url.pathname}${url.search}${url.hash}`);
    sync();
  }, [location.open, sync, validDemoIds]);

  const closeApp = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("app");
    url.searchParams.delete("demo");
    window.history.pushState({ kernelDesktop: true }, "", `${url.pathname}${url.search}${url.hash}`);
    sync();
  }, [sync]);

  return useMemo(() => ({
    ...location,
    openDesktop,
    closeDesktop,
    openApp,
    openDemo,
    closeApp,
  }), [closeApp, closeDesktop, location, openApp, openDemo, openDesktop]);
}
