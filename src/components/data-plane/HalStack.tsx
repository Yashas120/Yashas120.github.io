"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSlideStepper } from "@/components/data-plane/Deck";
import { profile } from "@/data/profile";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#a78bfa";
const OPTICAL = "optical_linecard.hal";

interface LayerRef {
  file: string;
  note: string;
}

interface Layer {
  code: string;
  name: string;
  fn: string;
  refs: LayerRef[];
}

// The embedded stack, top to bottom. Each layer lists the roles (as .hal files)
// and the real achievements that operated there. The optical role recurs from
// L3 down to L0 — that descent is the whole point of the slide.
const layers: Layer[] = [
  {
    code: "L4",
    name: "app / IOS-XR",
    fn: "control plane · cloud services · CLI",
    refs: [
      { file: "cloud_platform.hal", note: "PX Cloud Terraform IaC across 7 products; deploy time −50%" },
      { file: "sdk_pipeline.hal", note: "CI auto-generates & publishes Python/Java SDKs (4h → 0)" },
      { file: "switchgear_tool.hal", note: "switchgear test-case tool, 2 days → 2 hours" },
      { file: "grad_research.hal", note: "incoming MSCS @ UCSD — distributed systems & OS" },
      { file: OPTICAL, note: "PM-data extraction tool from customer router logs" },
    ],
  },
  {
    code: "L3",
    name: "HAL",
    fn: "hardware abstraction — the clean API",
    refs: [
      { file: OPTICAL, note: "end-to-end dataplane software on the Aquila line-card" },
      { file: OPTICAL, note: "comprehensive unit-test framework — UT time −90%" },
    ],
  },
  {
    code: "L2",
    name: "hwmap",
    fn: "register map — offsets, fields, bits",
    refs: [{ file: OPTICAL, note: "NCS 1014 line-card register programming for CDR & optics" }],
  },
  {
    code: "L1",
    name: "device driver",
    fn: "probes hardware & binds it — see drv/",
    refs: [
      { file: OPTICAL, note: "CDR (Clock & Data Recovery) hardware integration" },
      { file: OPTICAL, note: "near-real-time device-log streaming to local machines" },
    ],
  },
  {
    code: "L0",
    name: "optics / ASIC",
    fn: "photonics & silicon — the metal",
    refs: [
      { file: OPTICAL, note: "QPSK modulation on the line-card for long-haul reach" },
      { file: OPTICAL, note: "secure boot chain — hardware root of trust" },
    ],
  },
];

export function HalStack() {
  const [focus, setFocus] = useSlideStepper(layers.length);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 font-mono text-[10px] text-zinc-500">
        <span className="truncate">{profile.tagline}</span>
        <span className="shrink-0" style={{ color: hexToRgba(ACCENT, 0.8) }}>
          {layers[focus].code} · {String(focus + 1).padStart(2, "0")}/{String(layers.length).padStart(2, "0")} ↓
        </span>
      </div>

      {/* descend the stack, one layer at a time */}
      <ol className="relative ml-3 border-l" style={{ borderColor: hexToRgba(ACCENT, 0.25) }}>
        {layers.map((layer, i) => {
          const open = i === focus;
          return (
            <li key={layer.code} className="relative ml-4 mb-1">
              {/* depth node */}
              <span
                className="absolute left-[-21px] top-[13px] h-2.5 w-2.5 -translate-y-1/2 rounded-full border transition-all"
                style={{
                  background: open ? ACCENT : "rgb(var(--ink-900))",
                  borderColor: ACCENT,
                  opacity: open ? 1 : 0.5,
                  boxShadow: open ? `0 0 8px ${hexToRgba(ACCENT, 0.9)}` : "none",
                }}
              />

              <div
                className="overflow-hidden rounded-lg border transition-colors"
                style={{
                  borderColor: open ? hexToRgba(ACCENT, 0.4) : "rgb(var(--line) / 0.1)",
                  background: open ? hexToRgba(ACCENT, 0.06) : "rgb(var(--ink-800))",
                }}
              >
                <button
                  type="button"
                  onClick={() => setFocus(i)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left font-mono text-[11px]"
                >
                  <span
                    className="shrink-0 rounded px-1 py-0.5 text-[8px]"
                    style={{ background: hexToRgba(ACCENT, open ? 0.18 : 0.1), color: open ? ACCENT : "#a1a1aa" }}
                  >
                    {layer.code}
                  </span>
                  <span className="shrink-0" style={{ color: open ? ACCENT : "#d4d4d8" }}>{layer.name}</span>
                  <span className="min-w-0 flex-1 truncate text-zinc-500">{layer.fn}</span>
                  <span className="shrink-0 text-[9px] text-zinc-600">{layer.refs.length}×</span>
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 px-3 pb-2 pt-0.5 font-mono text-[9.5px] leading-snug">
                        {layer.refs.map((ref, j) => {
                          const optical = ref.file === OPTICAL;
                          return (
                            <div key={`${layer.code}-${j}`} className="flex flex-wrap items-baseline gap-1.5">
                              <span
                                className="shrink-0 rounded border px-1 py-0.5 text-[8.5px]"
                                style={{
                                  borderColor: optical ? hexToRgba(ACCENT, 0.4) : "rgb(var(--line) / 0.12)",
                                  background: optical ? hexToRgba(ACCENT, 0.1) : "transparent",
                                  color: optical ? ACCENT : "#a1a1aa",
                                }}
                              >
                                {ref.file}
                              </span>
                              <span className="min-w-0 flex-1 text-zinc-400">{ref.note}</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
