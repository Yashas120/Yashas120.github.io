"use client";

import { useCallback, useEffect, useState } from "react";
import type { DemoId } from "@/data/demos";

export function useLabRouteState(validIds: readonly string[], validDemoIds: readonly DemoId[]) {
  const [appId, setAppId] = useState<string>();
  const [demoId, setDemoId] = useState<DemoId>();
  const [invalidApp, setInvalidApp] = useState<string>();

  const readLocation = useCallback(() => {
    const url = new URL(window.location.href);
    const requested = url.searchParams.get("app") ?? undefined;
    const requestedDemo = url.searchParams.get("demo") ?? undefined;
    const validDemo = validDemoIds.includes(requestedDemo as DemoId) ? requestedDemo as DemoId : undefined;
    if (validDemo) {
      setInvalidApp(undefined);
      setDemoId(validDemo);
      setAppId("demo-lab");
      return;
    }
    if (!requested || validIds.includes(requested)) {
      setInvalidApp(undefined);
      setDemoId(undefined);
      setAppId(requested);
      return;
    }
    setInvalidApp(requested);
    setDemoId(undefined);
    setAppId(undefined);
  }, [validDemoIds, validIds]);

  useEffect(() => {
    readLocation();
    window.addEventListener("popstate", readLocation);
    return () => window.removeEventListener("popstate", readLocation);
  }, [readLocation]);

  const writeApp = useCallback((next?: string) => {
    if (next && !validIds.includes(next)) return;
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("app", next);
    else url.searchParams.delete("app");
    if (next !== "demo-lab") url.searchParams.delete("demo");
    const target = `${url.pathname}${url.search}${url.hash}`;
    window.history.pushState({ app: next ?? null }, "", target);
    setInvalidApp(undefined);
    setAppId(next);
  }, [validIds]);

  const writeDemo = useCallback((next: DemoId) => {
    if (!validDemoIds.includes(next)) return;
    const url = new URL(window.location.href);
    url.searchParams.set("app", "demo-lab");
    url.searchParams.set("demo", next);
    const target = `${url.pathname}${url.search}${url.hash}`;
    window.history.pushState({ app: "demo-lab", demo: next }, "", target);
    setInvalidApp(undefined);
    setAppId("demo-lab");
    setDemoId(next);
  }, [validDemoIds]);

  return { appId, demoId, invalidApp, openApp: (id: string) => writeApp(id), openDemo: writeDemo, closeApp: () => writeApp() };
}
