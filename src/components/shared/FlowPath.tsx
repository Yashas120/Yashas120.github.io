"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { hexToRgba } from "@/lib/utils";

export interface FlowNode {
  id: string;
  label: string;
  icon: LucideIcon;
  detail: string;
}

export interface FlowPathProps {
  nodes: FlowNode[];
  accent: string;
  /** Colour of the packets travelling the rail. */
  pulse: string;
  header: { left: string; right: string };
  footer?: React.ReactNode;
  /** Horizontal room the rail needs before it starts scrolling. */
  minWidth?: number;
  pulses?: number;
}

/**
 * A hop-by-hop path you can walk: every node is a button, and selecting one
 * explains that hop underneath. Used for the event mesh on /backend and for
 * the delivery and cross-region paths on /fde.
 */
export function FlowPath({ nodes, accent, pulse, header, footer, minWidth = 680, pulses = 3 }: FlowPathProps) {
  const [selected, setSelected] = useState(0);
  const active = nodes[selected];

  return (
    <div className="rounded-xl border border-line/10 bg-ink-800 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
        <span className="text-zinc-400">{header.left}</span>
        <span className="text-zinc-600">{header.right}</span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="relative flex items-start justify-between gap-2" style={{ minWidth }}>
          <div className="absolute left-6 right-6 top-6 h-px" style={{ background: hexToRgba(accent, 0.25) }} />

          {Array.from({ length: pulses }, (_, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute top-6 h-2 w-2 -translate-y-1/2 rounded-full"
              style={{ background: pulse, boxShadow: `0 0 10px ${hexToRgba(pulse, 0.9)}` }}
              initial={{ left: "3%" }}
              animate={{ left: ["3%", "96%"] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "linear", delay: i * 1.4 }}
            />
          ))}

          {nodes.map((n, i) => {
            const Icon = n.icon;
            const on = i === selected;
            return (
              <button
                key={n.id}
                onClick={() => setSelected(i)}
                onMouseEnter={() => setSelected(i)}
                aria-pressed={on}
                className="relative flex flex-1 flex-col items-center gap-2 rounded-lg text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ outlineColor: accent }}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
                    on ? "" : "text-zinc-500"
                  }`}
                  style={{
                    borderColor: on ? accent : "rgb(var(--line) / 0.15)",
                    background: on ? hexToRgba(accent, 0.15) : "rgb(var(--ink-900) / 1)",
                    color: on ? accent : undefined,
                  }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className={`font-mono text-[10px] ${on ? "" : "text-zinc-400"}`} style={{ color: on ? accent : undefined }}>
                  {n.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="mt-3 rounded-lg border px-4 py-3"
        style={{ borderColor: hexToRgba(accent, 0.2), background: hexToRgba(accent, 0.05) }}
      >
        <p className="font-mono text-[11px]" style={{ color: accent }}>
          {active.label}
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">{active.detail}</p>
      </div>

      {footer && <div className="mt-3 text-[11px] leading-relaxed text-zinc-500">{footer}</div>}
    </div>
  );
}
