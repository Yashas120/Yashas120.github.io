"use client";

import { hexToRgba } from "@/lib/utils";

export interface BlueprintBackgroundProps {
  accent: string;
  secondary: string;
  /** Top strip: an origin label, the loop it runs through, and a destination label. */
  strip: { left: string; center: string; right: string };
  /** Declarative source, pinned left. Hidden below xl. */
  left?: string[];
  /** Run trace, pinned right. Hidden below xl. */
  right?: string[];
  /** Animated rails along the bottom — work moving with nobody pushing it. */
  rails?: number;
}

/**
 * Ambient blueprint canvas: a grid, two accent glows, a pair of pinned text
 * columns and flowing rails. /backend and /fde both sit on it with their own
 * palette and their own text.
 */
export function BlueprintBackground({
  accent,
  secondary,
  strip,
  left,
  right,
  rails = 3,
}: BlueprintBackgroundProps) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-ink-900">
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${hexToRgba(accent, 0.08)}, transparent 45%, ${hexToRgba(secondary, 0.05)})` }}
      />

      {/* blueprint grid — the system drawn before it is built */}
      <div className="grid-bg absolute inset-0 opacity-70" />

      <div
        className="absolute -left-24 top-1/4 h-[440px] w-[440px] rounded-full blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${hexToRgba(accent, 0.18)}, transparent)` }}
      />
      <div
        className="absolute -right-24 top-2/3 h-[460px] w-[460px] rounded-full blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${hexToRgba(secondary, 0.12)}, transparent)` }}
      />

      <div
        className="absolute inset-x-0 top-0 flex justify-between px-6 py-1 font-mono text-[9px]"
        style={{ color: hexToRgba(accent, 0.32) }}
      >
        <span>{strip.left}</span>
        <span className="hidden sm:inline">{strip.center}</span>
        <span>{strip.right}</span>
      </div>

      {left && (
        <pre
          className="absolute left-5 top-16 hidden font-mono text-[10px] leading-5 xl:block"
          style={{ color: hexToRgba(accent, 0.22) }}
        >
          {left.join("\n")}
        </pre>
      )}

      {right && (
        <pre
          className="absolute bottom-40 right-5 hidden text-right font-mono text-[10px] leading-5 xl:block"
          style={{ color: hexToRgba(secondary, 0.2) }}
        >
          {right.join("\n")}
        </pre>
      )}

      {Array.from({ length: rails }, (_, i) => (
        <div key={i} className="absolute inset-x-0 overflow-hidden" style={{ bottom: 44 + i * 22 }}>
          <div className="h-px w-full" style={{ background: hexToRgba(accent, 0.1) }} />
          <div
            className="animate-flow -mt-px h-px w-1/4"
            style={{
              background: `linear-gradient(90deg, transparent, ${hexToRgba(i === 1 ? secondary : accent, 0.55)}, transparent)`,
              animationDelay: `${i * 2.4}s`,
            }}
          />
        </div>
      ))}

      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgb(var(--ink-900) / 0.5) 100%)" }}
      />
    </div>
  );
}
