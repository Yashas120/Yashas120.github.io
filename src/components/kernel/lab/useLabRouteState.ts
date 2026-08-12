"use client";

import { useCallback, useEffect, useState } from "react";

export function useLabRouteState(validIds: readonly string[]) {
  const [appId, setAppId] = useState<string>();
  const [invalidApp, setInvalidApp] = useState<string>();

  const readLocation = useCallback(() => {
    const url = new URL(window.location.href);
    const requested = url.searchParams.get("app") ?? undefined;
    if (!requested || validIds.includes(requested)) {
      setInvalidApp(undefined);
      setAppId(requested);
      return;
    }
    setInvalidApp(requested);
    setAppId(undefined);
  }, [validIds]);

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
    const target = `${url.pathname}${url.search}${url.hash}`;
    window.history.pushState({ app: next ?? null }, "", target);
    setInvalidApp(undefined);
    setAppId(next);
  }, [validIds]);

  return { appId, invalidApp, openApp: (id: string) => writeApp(id), closeApp: () => writeApp() };
}
