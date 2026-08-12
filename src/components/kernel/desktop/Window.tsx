"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Minus, Square, X } from "lucide-react";
import { hexToRgba } from "@/lib/utils";
import { PHOSPHOR, type AppDef, type WinState } from "./types";

interface WindowProps {
  app: AppDef;
  state: WinState;
  focused: boolean;
  mobile: boolean;
  z: number;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMax: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (w: number, h: number) => void;
  children: React.ReactNode;
}

/** Follows a pointer until release, feeding deltas to `onDelta`. */
function trackPointer(e: React.PointerEvent, onDelta: (dx: number, dy: number) => void) {
  const startX = e.clientX;
  const startY = e.clientY;
  const move = (ev: PointerEvent) => onDelta(ev.clientX - startX, ev.clientY - startY);
  const up = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", up);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);
}

export function Window({
  app,
  state,
  focused,
  mobile,
  z,
  onFocus,
  onClose,
  onMinimize,
  onToggleMax,
  onMove,
  onResize,
  children,
}: Readonly<WindowProps>) {
  const Icon = app.icon;
  const reducedMotion = useReducedMotion();
  const filled = mobile || state.maximized;

  // Maximizing on desktop stops short of the floating dock; on mobile the dock is
  // a sibling below the surface, so the window can take the full height.
  const geometry = filled
    ? { top: 0, left: 0, width: "100%", height: mobile ? "100%" : "calc(100% - 68px)" }
    : { top: state.y, left: state.x, width: state.w, height: state.h };

  const startDrag = (e: React.PointerEvent) => {
    if (filled) return;
    onFocus();
    const ox = state.x;
    const oy = state.y;
    trackPointer(e, (dx, dy) => onMove(ox + dx, oy + dy));
  };

  const startResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    onFocus();
    const ow = state.w;
    const oh = state.h;
    trackPointer(e, (dx, dy) => onResize(ow + dx, oh + dy));
  };

  return (
    <motion.section
      aria-label={app.title}
      initial={{ opacity: 0, scale: 0.97, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 8 }}
      transition={{ duration: reducedMotion ? 0 : 0.16, ease: "easeOut" }}
      onPointerDown={onFocus}
      className={`absolute flex flex-col overflow-hidden border ${
        filled ? "" : "rounded-xl win-shadow"
      }`}
      style={{
        ...geometry,
        zIndex: z,
        borderColor: focused ? hexToRgba(PHOSPHOR, 0.35) : "rgb(var(--line) / 0.12)",
        background: "rgb(var(--ink-800))",
      }}
    >
      {/* Title bar */}
      <header
        onPointerDown={startDrag}
        onDoubleClick={() => !mobile && onToggleMax()}
        className={`flex flex-shrink-0 items-center gap-2 border-b px-3 py-2 ${
          filled ? "" : "cursor-grab active:cursor-grabbing"
        }`}
        style={{
          borderColor: "rgb(var(--line) / 0.1)",
          background: focused ? "rgb(var(--ink-700))" : "rgb(var(--ink-800))",
        }}
      >
        <Icon
          className="h-3.5 w-3.5 flex-shrink-0"
          style={{ color: focused ? PHOSPHOR : "rgb(var(--zinc-500))" }}
        />
        <span
          className="min-w-0 flex-1 truncate font-mono text-[11px]"
          style={{ color: focused ? "rgb(var(--zinc-200))" : "rgb(var(--zinc-500))" }}
        >
          {app.title}
        </span>

        <div className="flex flex-shrink-0 items-center gap-1">
          {!mobile && (
            <>
              <button
                aria-label={`Minimize ${app.short}`}
                onClick={onMinimize}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex h-11 w-11 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-line/10 hover:text-zinc-200 sm:h-8 sm:w-8"
              >
                <Minus className="h-3 w-3" />
              </button>
              <button
                aria-label={state.maximized ? `Restore ${app.short}` : `Maximize ${app.short}`}
                onClick={onToggleMax}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex h-11 w-11 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-line/10 hover:text-zinc-200 sm:h-8 sm:w-8"
              >
                <Square className="h-2.5 w-2.5" />
              </button>
            </>
          )}
          <button
            aria-label={`Close ${app.short}`}
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex h-11 w-11 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-red-500/20 hover:text-red-400 sm:h-8 sm:w-8"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </header>

      {/* Body */}
      <div
        className={`relative min-h-0 flex-1 overflow-y-auto ${app.terminal ? "crt" : ""}`}
        style={app.terminal ? undefined : { background: "rgb(var(--ink-800))" }}
      >
        {children}
      </div>

      {!filled && (
        <button
          aria-label={`Resize ${app.short}`}
          onPointerDown={startResize}
          className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
          style={{
            background: `linear-gradient(135deg, transparent 50%, ${hexToRgba(PHOSPHOR, 0.35)} 50%)`,
          }}
        />
      )}
    </motion.section>
  );
}
