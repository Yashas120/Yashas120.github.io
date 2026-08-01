"use client";

import { createContext, useContext } from "react";

export interface DesktopApi {
  open: (appId: string) => void;
  close: (appId: string) => void;
  isOpen: (appId: string) => boolean;
  panic: () => void;
}

const noop = () => {};

const DesktopContext = createContext<DesktopApi>({
  open: noop,
  close: noop,
  isOpen: () => false,
  panic: noop,
});

export const DesktopProvider = DesktopContext.Provider;

export function useDesktop(): DesktopApi {
  return useContext(DesktopContext);
}
