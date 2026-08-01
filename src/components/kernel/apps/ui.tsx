"use client";

import { hexToRgba } from "@/lib/utils";
import { PHOSPHOR } from "../desktop/types";

export function Chip({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <span
      className="rounded border px-1.5 py-0.5 font-mono text-[10px]"
      style={{ borderColor: hexToRgba(PHOSPHOR, 0.25), color: PHOSPHOR }}
    >
      {children}
    </span>
  );
}

/** A `user@host:~$ command` line, used as an in-app section header. */
export function Prompt({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <p className="font-mono text-[11px] text-zinc-500">
      <span style={{ color: PHOSPHOR }}>yashas@kernel</span>:~$ {children}
    </p>
  );
}

export function AppHeader({
  command,
  hint,
}: Readonly<{ command: string; hint?: string }>) {
  return (
    <div
      className="sticky top-0 z-10 border-b px-4 py-2.5 backdrop-blur"
      style={{ borderColor: "rgb(var(--line) / 0.08)", background: "rgb(var(--ink-800) / 0.92)" }}
    >
      <Prompt>{command}</Prompt>
      {hint && <p className="mt-0.5 font-mono text-[10px] text-zinc-600">{hint}</p>}
    </div>
  );
}
