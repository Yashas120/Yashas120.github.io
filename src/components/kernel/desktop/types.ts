import type { LucideIcon } from "lucide-react";

export interface AppDef {
  id: string;
  /** Window title bar text, e.g. "yashas@kernel: ~/htop". */
  title: string;
  /** Short label for the dock and desktop icon. */
  short: string;
  icon: LucideIcon;
  /** Terminal-family apps get the phosphor/CRT surface instead of a graphite one. */
  terminal?: boolean;
  /** Pinned to the desktop as a launchable icon. */
  onDesktop?: boolean;
  size: { w: number; h: number };
  pos: { x: number; y: number };
  render: () => React.ReactNode;
}

export interface WinState {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minimized: boolean;
  maximized: boolean;
}

export const PHOSPHOR = "#4ade80";
