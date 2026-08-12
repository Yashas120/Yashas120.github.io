"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DARK, LIGHT, type Palette, type Tokens, type Tone } from "@/lib/clusterTheme";

export type ClusterMode = "light" | "dark";

const STORAGE_KEY = "cluster-theme";

interface Ctx {
  mode: ClusterMode;
  toggle: () => void;
  palette: Palette;
}

const ClusterThemeCtx = createContext<Ctx>({ mode: "dark", toggle: () => {}, palette: DARK });

export function ClusterThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // Defaults to dark; the stored preference is applied after mount so the server
  // and first client render agree.
  const [mode, setMode] = useState<ClusterMode>("dark");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") setMode(saved);
    } catch {
      /* storage unavailable — keep the default */
    }
  }, []);

  // Paint the document itself with the cluster canvas so the site-wide theme can
  // never show through (overscroll, or any area the film doesn't cover).
  useEffect(() => {
    const canvas = (mode === "dark" ? DARK : LIGHT).base.canvas;
    let el = document.querySelector<HTMLStyleElement>("style[data-cluster-canvas]");
    if (!el) {
      el = document.createElement("style");
      el.setAttribute("data-cluster-canvas", "");
      document.head.appendChild(el);
    }
    el.textContent = `html,body{background-color:${canvas};}`;
    return () => {
      document.querySelector("style[data-cluster-canvas]")?.remove();
    };
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((m) => {
      const next: ClusterMode = m === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(() => ({ mode, toggle, palette: mode === "dark" ? DARK : LIGHT }), [mode, toggle]);

  return <ClusterThemeCtx.Provider value={value}>{children}</ClusterThemeCtx.Provider>;
}

export function useClusterTheme(): Ctx {
  return useContext(ClusterThemeCtx);
}

/** Token set for a scene's tone in the active mode. */
export function useTokens(tone: Tone = "base"): Tokens {
  const { palette } = useClusterTheme();
  return tone === "inverted" ? palette.inverted : palette.base;
}
