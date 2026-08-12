"use client";

import { createContext, useContext } from "react";
import type { DemoId } from "@/data/demos";

export interface DesktopApi {
  open: (appId: string) => void;
  close: (appId: string) => void;
  isOpen: (appId: string) => boolean;
  panic: () => void;
  openDemo: (demoId: DemoId) => void;
  demoId: DemoId | null;
}

const noop = () => {};

const DesktopContext = createContext<DesktopApi>({
  open: noop,
  close: noop,
  isOpen: () => false,
  panic: noop,
  openDemo: noop,
  demoId: null,
});

export const DesktopProvider = DesktopContext.Provider;

export function useDesktop(): DesktopApi {
  return useContext(DesktopContext);
}
