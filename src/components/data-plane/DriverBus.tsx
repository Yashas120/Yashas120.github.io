"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, ArrowUpRight, Cable, Gauge, Power, Radio, Server, ShieldCheck, Waves, type LucideIcon } from "lucide-react";
import { projects } from "@/data/projects";
import { useSlideStepper } from "@/components/data-plane/Deck";
import { HardwareGlyph, type HardwareKind } from "@/components/data-plane/HardwareGlyph";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#a78bfa";

interface Slot {
  kind: HardwareKind;
  cls: string;
  port: string;
  icon: LucideIcon;
}

// Every project is fronted by a real piece of line-card hardware. The stage
// icons are carried over from the bringup sequence so the two slides rhyme.
const slots: Record<string, Slot> = {
  "ghost-scheduler": { kind: "rp", cls: "RP HW", port: "route processor", icon: Server },
  "spark-cifar10": { kind: "osfp", cls: "trunk driver", port: "OSFP · OTU4 400G", icon: Waves },
  "multiview-3d": { kind: "cwdm", cls: "CWDM mux", port: "8λ passive mux", icon: Radio },
  swift: { kind: "cdr", cls: "CDR / DSP", port: "coherent DSP", icon: Gauge },
  "bitcoin-java": { kind: "tam", cls: "TAm", port: "secure boot chip", icon: ShieldCheck },
  "voice-assistant": { kind: "qsfp", cls: "client driver", port: "QSFP28 · 100G", icon: Activity },
  "cloud-hack": { kind: "psu", cls: "chassis PSU", port: "2 kW · dual feed", icon: Power },
  petra: { kind: "lc", cls: "LC HW", port: "LC duplex faceplate", icon: Cable },
};

const fallback: Slot = { kind: "qsfp", cls: "client driver", port: "pluggable", icon: Activity };

function sym(id: string) {
  return id.replaceAll("-", "_");
}

export function DriverBus() {
  const [focus, setFocus] = useSlideStepper(projects.length);
  const current = projects[focus];
  const currentSlot = slots[current.id] ?? fallback;
  const currentBound = current.status !== "archived";

  return (
    <div>
      {/* the bus everything binds to */}
      <div
        className="flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-[11px]"
        style={{ borderColor: hexToRgba(ACCENT, 0.35), background: hexToRgba(ACCENT, 0.08), color: ACCENT }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT, boxShadow: `0 0 8px ${hexToRgba(ACCENT, 0.9)}` }} />
        <span>linecard_bringup</span>
        <span className="hidden truncate text-zinc-500 sm:inline">— chassis front panel · drivers probe &amp; bind here</span>
        <span className="ml-auto shrink-0 text-zinc-500">
          slot {String(focus + 1).padStart(2, "0")}/{String(projects.length).padStart(2, "0")}
        </span>
      </div>

      {/* the slots */}
      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {projects.map((p, i) => {
          const slot = slots[p.id] ?? fallback;
          const open = i === focus;
          const bound = p.status !== "archived";
          const Icon = slot.icon;
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => setFocus(i)}
              aria-label={`${sym(p.id)}_drv — ${slot.cls}`}
              aria-pressed={open}
              animate={{ scale: open ? 1.03 : 1 }}
              transition={{ duration: 0.18 }}
              className="rounded-lg border p-2 text-left transition-colors"
              style={{
                borderColor: open ? hexToRgba(ACCENT, 0.55) : "rgb(var(--line) / 0.1)",
                background: open ? hexToRgba(ACCENT, 0.08) : "rgb(var(--ink-800))",
                boxShadow: open ? `0 0 18px ${hexToRgba(ACCENT, 0.18)}` : "none",
              }}
            >
              <span className="flex items-center justify-between">
                <Icon className="h-3 w-3" style={{ color: open ? ACCENT : "#52525b" }} />
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: bound ? "#4ade80" : "#3f3f46",
                    boxShadow: bound ? "0 0 6px rgba(74,222,128,0.8)" : "none",
                  }}
                />
              </span>

              {/* the focused module is powered; the rest sit dark in their slots */}
              <HardwareGlyph
                kind={slot.kind}
                className="mt-1.5 h-7 w-full transition-colors"
                style={{ color: open ? ACCENT : "#3f3f46" }}
              />

              <span className="mt-1.5 block truncate font-mono text-[9px]" style={{ color: open ? ACCENT : "#a1a1aa" }}>
                {slot.cls}
              </span>
              <span className="block truncate font-mono text-[8.5px] text-zinc-600">{sym(p.id)}_drv</span>
            </motion.button>
          );
        })}
      </div>

      {/* focused module, expanded */}
      <div className="mt-2 min-h-[148px] rounded-lg border" style={{ borderColor: hexToRgba(ACCENT, 0.25), background: "rgb(var(--ink-900))" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex gap-3 p-3"
          >
            <div className="hidden w-24 shrink-0 flex-col items-center gap-1 sm:flex">
              <HardwareGlyph kind={currentSlot.kind} className="h-12 w-full" style={{ color: ACCENT }} />
              <span className="text-center font-mono text-[8.5px] text-zinc-600">{currentSlot.port}</span>
            </div>

            <div className="min-w-0 flex-1 font-mono text-[10px] leading-snug">
              <div className="flex flex-wrap items-center gap-2">
                <span style={{ color: ACCENT }}>{sym(current.id)}_drv</span>
                <span className="text-zinc-600">· {currentSlot.cls}</span>
                <span
                  className="ml-auto shrink-0 rounded px-1 py-0.5 text-[8px]"
                  style={{
                    background: currentBound ? "rgba(74,222,128,0.12)" : "rgb(var(--line) / 0.15)",
                    color: currentBound ? "#4ade80" : "#a1a1aa",
                  }}
                >
                  {currentBound ? "bound" : "unbound"}
                </span>
              </div>

              <p className="mt-1 truncate text-zinc-300">{current.title}</p>
              <p className="mt-1 text-zinc-600">
                .probe = {sym(current.id)}_probe, <span className="text-zinc-500">{"// "}{current.blurb}</span>
              </p>
              <p className="mt-1 text-zinc-400">{current.detail}</p>

              <div className="mt-1.5 flex flex-wrap items-center gap-1">
                {current.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded border px-1 py-0.5 text-[8.5px] text-zinc-300"
                    style={{ borderColor: hexToRgba(ACCENT, 0.25), background: hexToRgba(ACCENT, 0.06) }}
                  >
                    {t}
                  </span>
                ))}
                {current.repoUrl && (
                  <a
                    href={current.repoUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="ml-auto inline-flex items-center gap-0.5 text-zinc-500 transition-colors hover:text-zinc-200"
                  >
                    repo <ArrowUpRight className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
