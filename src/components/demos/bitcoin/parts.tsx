"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { ArrowDown, Check, Copy } from "lucide-react";

export const BTC = "#f7931a";

export function rgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${a})`;
}

// A titled step card used to structure each stage of a section.
export function Stage({
  n,
  title,
  desc,
  children,
}: {
  n?: number | string;
  title: string;
  desc?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className="rounded-lg border bg-ink-900 p-4"
      style={{ borderColor: "rgb(var(--line) / 0.08)" }}
    >
      <div className="mb-1 flex items-center gap-2">
        {n !== undefined && (
          <span
            className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold text-black"
            style={{ background: BTC }}
          >
            {n}
          </span>
        )}
        <h4 className="text-sm font-semibold text-zinc-100">{title}</h4>
      </div>
      {desc && <p className="mb-3 text-xs leading-relaxed text-zinc-500">{desc}</p>}
      {children}
    </div>
  );
}

// A labelled monospace value (hex, number, script) with optional accent + copy.
export function Field({
  label,
  value,
  accent,
  mono = true,
  small = false,
}: {
  label: string;
  value: ReactNode;
  accent?: boolean;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className="rounded-md border px-3 py-2"
      style={{
        borderColor: accent ? rgba(BTC, 0.4) : "rgb(var(--line) / 0.07)",
        background: accent ? rgba(BTC, 0.06) : "rgb(var(--ink-800))",
      }}
    >
      <div className="mb-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div
        className={`${mono ? "font-mono" : ""} ${small ? "text-[11px]" : "text-xs"} break-all ${
          accent ? "" : "text-zinc-300"
        }`}
        style={accent ? { color: BTC } : undefined}
      >
        {value}
      </div>
    </div>
  );
}

export function DownArrow() {
  return (
    <div className="flex justify-center py-1 text-zinc-700">
      <ArrowDown className="h-4 w-4" />
    </div>
  );
}

export function Pill({ children, on }: { children: ReactNode; on?: boolean }) {
  return (
    <span
      className="rounded px-1.5 py-0.5 font-mono text-[10px]"
      style={{
        background: on ? rgba(BTC, 0.15) : "rgb(var(--line) / 0.08)",
        color: on ? BTC : "rgb(var(--zinc-400))",
      }}
    >
      {children}
    </span>
  );
}

// A horizontal progress stepper for the guided "story" walkthrough.
export function StoryRail({
  steps,
  activeIndex,
  maxReached,
  onSelect,
}: {
  steps: { short: string }[];
  activeIndex: number;
  maxReached: number;
  onSelect: (i: number) => void;
}) {
  const line = (done: boolean) =>
    ({ background: done ? BTC : "rgb(var(--line) / 0.12)" } as const);
  return (
    <div className="flex items-start">
      {steps.map((s, i) => {
        const on = i === activeIndex;
        const reached = i <= maxReached;
        const done = reached && !on;
        const first = i === 0;
        const last = i === steps.length - 1;
        return (
          <div
            key={i}
            className={`flex flex-col items-center ${last ? "" : "flex-1"}`}
          >
            <div className="flex w-full items-center">
              <div className="h-px flex-1" style={line(!first && i <= maxReached)} />
              <button
                onClick={() => onSelect(i)}
                aria-current={on ? "step" : undefined}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-bold transition-colors hover:opacity-90"
                style={{
                  borderColor: reached ? BTC : "rgb(var(--line) / 0.2)",
                  background: done ? BTC : on ? rgba(BTC, 0.15) : "transparent",
                  color: done ? "#000" : on ? BTC : "rgb(var(--zinc-500))",
                }}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </button>
              <div className="h-px flex-1" style={line(!last && i < maxReached)} />
            </div>
            <span
              className="mt-1.5 text-center font-mono text-[10px]"
              style={{ color: on ? BTC : reached ? "rgb(var(--zinc-400))" : "rgb(var(--zinc-600))" }}
            >
              {s.short}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visual primitives — turn bytes/hashes into pictures instead of text walls
// ---------------------------------------------------------------------------

// Deterministic color from a byte value. Value drives BOTH hue and lightness,
// so the fingerprint stays legible as a brightness ramp even for colorblind
// viewers who can't rely on hue alone.
export function byteColor(v: number): string {
  const t = v / 255;
  const hue = Math.round(t * 320 + 10);
  const light = Math.round(30 + t * 45); // 30%..75% luminance ramp
  return `hsl(${hue} 70% ${light}%)`;
}

// A hash / byte string rendered as a grid of colored cells (a visual fingerprint).
export function ByteGrid({
  hex,
  cols = 16,
  cell = 13,
  gap = 2,
  highlight,
  labelBytes = false,
}: {
  hex: string;
  cols?: number;
  cell?: number;
  gap?: number;
  highlight?: (i: number, v: number) => string | undefined;
  labelBytes?: boolean;
}) {
  const bytes = hex.match(/.{1,2}/g) ?? [];
  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap }}
    >
      {bytes.map((b, i) => {
        const v = parseInt(b, 16);
        const hl = highlight?.(i, v);
        return (
          <div
            key={i}
            title={`byte ${i}: 0x${b}`}
            className="flex items-center justify-center rounded-[2px]"
            style={{
              width: cell,
              height: cell,
              background: hl ?? byteColor(v),
              fontSize: cell > 16 ? 8 : 0,
              color: "rgba(0,0,0,0.55)",
              fontFamily: "monospace",
            }}
          >
            {labelBytes && cell > 16 ? b : ""}
          </div>
        );
      })}
    </div>
  );
}

// Detects the user's reduced-motion preference so animations can be skipped.
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// A value that must not be produced during render.
//
// randomBytes() and Date.now() return different results on the server and on
// the client, so calling them from a useState initialiser or a useMemo makes
// the hydrated text disagree with the server HTML, which React reports as
// "Text content does not match server-rendered HTML". Both the server render
// and the client's first render use `placeholder`; the real value is generated
// once, after mount, when only the client is rendering.
export function useDeferred<T>(placeholder: T, make: () => T): T {
  const [value, setValue] = useState<T>(placeholder);
  const makeRef = useRef(make);
  makeRef.current = make;
  useEffect(() => {
    setValue(makeRef.current());
  }, []);
  return value;
}

// True while `ref` is on (or near) the screen and the tab is visible.
//
// All nine demos mount eagerly on /demos, and several drive a continuous
// requestAnimationFrame canvas loop. Without this gate every one of those loops
// redraws at ~60fps for the whole page lifetime — burning CPU and battery on
// demos the visitor cannot even see. Defaults to `true` so a demo never fails to
// paint if the element or IntersectionObserver is unavailable.
export function useOnScreen(
  ref: React.RefObject<Element | null>,
  rootMargin = "250px",
): boolean {
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    let intersecting = true;
    const sync = () => setOnScreen(intersecting && !document.hidden);

    const obs = new IntersectionObserver(
      (entries) => {
        intersecting = entries[0]?.isIntersecting ?? true;
        sync();
      },
      { rootMargin },
    );
    obs.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      obs.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [ref, rootMargin]);
  return onScreen;
}

// compact hex chip: 0xABCD…1234 — click to copy the full value to the clipboard.
export function Chip({
  value,
  accent,
  label,
  copyable = true,
}: {
  value: string;
  accent?: boolean;
  label?: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const short = value.length > 18 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value;
  const canCopy = copyable && value.length > 1;
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };
  return (
    <span className="inline-flex items-center gap-1">
      {label && <span className="font-mono text-[10px] text-zinc-500">{label}</span>}
      <button
        type="button"
        onClick={canCopy ? onCopy : undefined}
        title={canCopy ? `${value}\n(click to copy)` : value}
        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] transition-colors"
        style={{
          background: accent ? rgba(BTC, 0.14) : "rgb(var(--line) / 0.08)",
          color: accent ? BTC : "rgb(var(--zinc-300))",
          cursor: canCopy ? "pointer" : "default",
        }}
      >
        {short}
        {canCopy &&
          (copied ? (
            <Check className="h-3 w-3" style={{ color: "#4ade80" }} />
          ) : (
            <Copy className="h-3 w-3 opacity-40" />
          ))}
      </button>
    </span>
  );
}

// A labelled node in a visual pipeline (icon + title + small value).
export function Node({
  icon,
  title,
  children,
  accent,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-xl border px-3 py-2.5 text-center"
      style={{
        borderColor: accent ? rgba(BTC, 0.5) : "rgb(var(--line) / 0.1)",
        background: accent ? rgba(BTC, 0.08) : "rgb(var(--ink-900))",
        minWidth: 96,
      }}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ background: accent ? BTC : "rgb(var(--line) / 0.1)", color: accent ? "#000" : BTC }}
      >
        {icon}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-wide text-zinc-400">{title}</div>
      {children}
    </div>
  );
}

// A coin/amount bar for the transaction flow.
export function Coin({ sats, label, color = BTC }: { sats: number; label: string; color?: string }) {
  return (
    <div
      className="rounded-lg border px-3 py-2"
      style={{ borderColor: rgba(color, 0.4), background: rgba(color, 0.07), minWidth: 130 }}
    >
      <div className="font-mono text-[10px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="font-mono text-sm font-semibold" style={{ color }}>
        {(sats / 1e8).toFixed(5)}
      </div>
      <div className="font-mono text-[9px] text-zinc-600">{sats.toLocaleString()} sats</div>
    </div>
  );
}

// Renders a long hex string, optionally highlighting a leading run (e.g. PoW zeros).
export function HexHighlight({ hex, leadZeros }: { hex: string; leadZeros: number }) {
  const zeros = hex.slice(0, leadZeros);
  const rest = hex.slice(leadZeros);
  return (
    <span className="break-all font-mono text-xs">
      <span style={{ color: BTC, fontWeight: 700 }}>{zeros}</span>
      <span className="text-zinc-400">{rest}</span>
    </span>
  );
}
