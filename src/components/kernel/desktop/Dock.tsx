"use client";

import { hexToRgba } from "@/lib/utils";
import { PHOSPHOR, type AppDef } from "./types";

export function Dock({
  apps,
  openIds,
  activeId,
  mobile,
  onLaunch,
}: Readonly<{
  apps: AppDef[];
  openIds: string[];
  activeId: string | null;
  mobile: boolean;
  onLaunch: (id: string) => void;
}>) {
  if (mobile) {
    return (
      <nav
        aria-label="Applications"
        className="no-scrollbar z-[50] flex flex-shrink-0 items-center gap-1 overflow-x-auto border-t px-2 py-1.5 backdrop-blur"
        style={{ borderColor: "rgb(var(--line) / 0.1)", background: "rgb(var(--ink-900) / 0.92)" }}
      >
        {apps.map((a) => {
          const Icon = a.icon;
          const active = activeId === a.id;
          return (
            <button
              key={a.id}
              onClick={() => onLaunch(a.id)}
              aria-current={active ? "page" : undefined}
              title={a.friendly}
              className="flex min-w-[68px] max-w-[76px] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 transition-colors"
              style={{ background: active ? hexToRgba(PHOSPHOR, 0.12) : "transparent" }}
            >
              <Icon
                className="h-4 w-4 flex-shrink-0"
                style={{ color: active ? PHOSPHOR : "rgb(var(--zinc-500))" }}
              />
              <span
                className="w-full truncate text-center text-[9px] leading-tight"
                style={{ color: active ? PHOSPHOR : "rgb(var(--zinc-400))" }}
              >
                {a.friendly}
              </span>
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Applications"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[45] flex justify-center pb-3"
    >
      <div
        className="pointer-events-auto flex items-start gap-1 rounded-2xl border px-2 py-2 backdrop-blur win-shadow"
        style={{ borderColor: "rgb(var(--line) / 0.12)", background: "rgb(var(--ink-800) / 0.8)" }}
      >
        {apps.map((a) => {
          const Icon = a.icon;
          const isOpen = openIds.includes(a.id);
          const active = activeId === a.id;
          const lit = active || isOpen;
          return (
            <button
              key={a.id}
              onClick={() => onLaunch(a.id)}
              title={a.blurb ?? a.friendly}
              className="group relative flex w-[74px] flex-col items-center gap-1 rounded-xl px-1 py-1 transition-transform hover:-translate-y-0.5"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors"
                style={{
                  borderColor: active ? hexToRgba(PHOSPHOR, 0.4) : "rgb(var(--line) / 0.1)",
                  background: active ? hexToRgba(PHOSPHOR, 0.12) : "rgb(var(--ink-700))",
                }}
              >
                <Icon
                  className="h-4 w-4 transition-colors"
                  style={{ color: lit ? PHOSPHOR : "rgb(var(--zinc-400))" }}
                />
              </span>
              {/* Persistent label mirrors the yashOS menu's friendly names. */}
              <span
                className="w-full truncate text-center text-[9px] leading-tight"
                style={{ color: lit ? PHOSPHOR : "rgb(var(--zinc-400))" }}
              >
                {a.friendly}
              </span>
              {a.blurb && (
                <span
                  className="pointer-events-none absolute -top-9 z-10 whitespace-nowrap rounded-md border px-2.5 py-1 text-[10px] opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    borderColor: "rgb(var(--line) / 0.12)",
                    background: "rgb(var(--ink-900))",
                    color: "rgb(var(--zinc-300))",
                  }}
                >
                  {a.blurb}
                </span>
              )}
              {isOpen && (
                <span
                  className="absolute right-3 top-1 h-1 w-1 rounded-full"
                  style={{ background: PHOSPHOR }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
