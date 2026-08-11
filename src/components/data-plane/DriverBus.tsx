"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Activity, ArrowUpRight, Cable, Gauge, Power, Radio, Server, ShieldCheck, Waves, type LucideIcon } from "lucide-react";
import type { Project } from "@/types";
import { projects } from "@/data/projects";
import { useSlideStepper } from "@/components/data-plane/Deck";
import { HardwareGlyph, type HardwareKind } from "@/components/data-plane/HardwareGlyph";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#a78bfa";
const GREEN = "#4ade80";
const RED = "#f87171";
const AMBER = "#fbbf24";
const DIM = "#3f3f46";

type Path = "W" | "P";

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

function slotFor(id: string) {
  return slots[id] ?? fallback;
}

function sym(id: string) {
  return id.replaceAll("-", "_");
}

// Diagram geometry (viewBox 0 0 300 104): in -> coupler -> W/P -> selector -> out.
const WORK = "56,52 96,28 210,28 248,52";
const PROT = "56,52 96,76 210,76 248,52";
const FEED = "8,52 56,52";
const TAIL = "248,52 300,52";

type SegState = "live" | "restoring" | "los" | "standby";

function segStateFor(path: Path, active: Path, switching: boolean): SegState {
  if (path === active) return switching ? "restoring" : "live";
  return switching ? "los" : "standby";
}

function segColor(state: SegState) {
  if (state === "live" || state === "restoring") return GREEN;
  if (state === "los") return RED;
  return DIM;
}

function Seg({ points, state, reduce }: Readonly<{ points: string; state: SegState; reduce: boolean }>) {
  const color = segColor(state);
  const flowing = (state === "live" || state === "restoring") && !reduce;
  return (
    <>
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
      {flowing && (
        <motion.polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="5 9"
          animate={{ strokeDashoffset: [0, -28] }}
          transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
        />
      )}
    </>
  );
}

function PsmDiagram({ active, switching, reduce, slot, bound }: Readonly<{ active: Path; switching: boolean; reduce: boolean; slot: Slot; bound: boolean }>) {
  const workState = segStateFor("W", active, switching);
  const protState = segStateFor("P", active, switching);
  const feedState: SegState = switching ? "restoring" : "live";

  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 300 104" className="h-24 flex-1" fill="none" style={{ fontFamily: "ui-monospace, monospace" }} aria-hidden>
        <text x="8" y="44" fontSize="8" fill="#71717a">in</text>
        <text x="150" y="18" fontSize="8" fill={active === "W" ? GREEN : "#71717a"} textAnchor="middle">WORKING</text>
        <text x="150" y="99" fontSize="8" fill={active === "P" ? GREEN : "#71717a"} textAnchor="middle">PROTECT</text>

        <Seg points={FEED} state={feedState} reduce={reduce} />
        <Seg points={WORK} state={workState} reduce={reduce} />
        <Seg points={PROT} state={protState} reduce={reduce} />
        <Seg points={TAIL} state={feedState} reduce={reduce} />

        {/* coupler splits the feed onto both paths */}
        <circle cx="56" cy="52" r="4" fill="rgb(var(--ink-900))" stroke={ACCENT} strokeWidth="1.5" />

        {/* selector arm swings to the active branch */}
        <motion.line
          x1="248"
          y1="52"
          x2="224"
          animate={{ y2: active === "W" ? 28 : 76 }}
          transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          stroke={GREEN}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="248" cy="52" r="5" fill="rgb(var(--ink-900))" stroke={GREEN} strokeWidth="1.5" />
      </svg>

      {/* the payload riding the line */}
      <div className="w-[104px] shrink-0">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[8px] text-zinc-600">line out</span>
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: bound ? GREEN : DIM, boxShadow: bound ? `0 0 6px ${hexToRgba(GREEN, 0.8)}` : "none" }}
          />
        </div>
        <HardwareGlyph kind={slot.kind} className="mt-1 h-10 w-full" style={{ color: ACCENT }} />
        <p className="mt-1 truncate text-center font-mono text-[8.5px]" style={{ color: ACCENT }}>{slot.cls}</p>
        <p className="truncate text-center font-mono text-[8px] text-zinc-600">{slot.port}</p>
      </div>
    </div>
  );
}

function JumpDots({ focus, onPick }: Readonly<{ focus: number; onPick: (i: number) => void }>) {
  return (
    <div className="mt-1 flex items-center justify-center gap-1.5">
      {projects.map((p, i) => {
        const on = i === focus;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onPick(i)}
            aria-label={`${sym(p.id)}_drv`}
            aria-current={on ? "true" : undefined}
            className="rounded-full transition-all"
            style={{
              height: on ? 8 : 5,
              width: on ? 8 : 5,
              background: on ? ACCENT : "rgb(var(--line) / 0.4)",
              boxShadow: on ? `0 0 8px ${hexToRgba(ACCENT, 0.9)}` : "none",
            }}
          />
        );
      })}
    </div>
  );
}

function DriverDetail({ project, slot, active }: Readonly<{ project: Project; slot: Slot; active: Path }>) {
  const bound = project.status !== "archived";
  return (
    <motion.div
      key={project.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="p-3 font-mono text-[10px] leading-snug"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span style={{ color: ACCENT }}>{sym(project.id)}_drv</span>
        <span className="text-zinc-600">· {slot.cls} · rides {active === "W" ? "working" : "protect"}</span>
        <span
          className="ml-auto shrink-0 rounded px-1 py-0.5 text-[8px]"
          style={{ background: bound ? "rgba(74,222,128,0.12)" : "rgb(var(--line) / 0.15)", color: bound ? GREEN : "#a1a1aa" }}
        >
          {bound ? "bound" : "unbound"}
        </span>
      </div>

      <p className="mt-1 truncate text-zinc-300">{project.title}</p>
      <p className="mt-1 text-zinc-600">
        .probe = {sym(project.id)}_probe, <span className="text-zinc-500">{"// "}{project.blurb}</span>
      </p>
      <p className="mt-1 text-zinc-400">{project.detail}</p>

      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        {project.tech.map((t) => (
          <span
            key={t}
            className="rounded border px-1 py-0.5 text-[8.5px] text-zinc-300"
            style={{ borderColor: hexToRgba(ACCENT, 0.25), background: hexToRgba(ACCENT, 0.06) }}
          >
            {t}
          </span>
        ))}
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="ml-auto inline-flex items-center gap-0.5 text-zinc-500 transition-colors hover:text-zinc-200"
          >
            repo <ArrowUpRight className="h-3 w-3" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

export function DriverBus() {
  const [focus, setFocus] = useSlideStepper(projects.length);
  const reduce = useReducedMotion() ?? false;

  const current = projects[focus];
  const currentSlot = slotFor(current.id);

  // Even slots ride WORKING, odd ride PROTECT, so every step visibly flips the line.
  const active: Path = focus % 2 === 0 ? "W" : "P";
  const activeLabel = active === "W" ? "working" : "protect";
  const [switching, setSwitching] = useState(false);
  const [switchMs, setSwitchMs] = useState<number | null>(null);
  const prevFocus = useRef(focus);

  useEffect(() => {
    if (prevFocus.current === focus) return;
    prevFocus.current = focus;
    setSwitchMs(20 + ((focus * 13) % 29)); // deterministic 20–48 ms
    setSwitching(true);
    const t = setTimeout(() => setSwitching(false), reduce ? 0 : 720);
    return () => clearTimeout(t);
  }, [focus, reduce]);

  return (
    <div>
      {/* the PSM the traffic rides */}
      <div
        className="flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-[11px]"
        style={{ borderColor: hexToRgba(ACCENT, 0.35), background: hexToRgba(ACCENT, 0.08), color: ACCENT }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT, boxShadow: `0 0 8px ${hexToRgba(ACCENT, 0.9)}` }} />
        <span>psm0</span>
        <span className="hidden truncate text-zinc-500 sm:inline">— 1+1 optical protection · step to switch the line</span>
        <span className="ml-auto shrink-0 text-zinc-500">
          slot {String(focus + 1).padStart(2, "0")}/{String(projects.length).padStart(2, "0")}
        </span>
      </div>

      {/* protection-switch schematic */}
      <div className="relative mt-2 rounded-lg border p-3" style={{ borderColor: hexToRgba(ACCENT, 0.25), background: "rgb(var(--ink-900))" }}>
        <div className="absolute right-3 top-2 z-10 flex items-center gap-2 font-mono text-[9px]">
          <AnimatePresence>
            {switching && switchMs != null && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded px-1.5 py-0.5"
                style={{ background: hexToRgba(AMBER, 0.15), color: AMBER }}
              >
                APS switchover {switchMs} ms
              </motion.span>
            )}
          </AnimatePresence>
          <span style={{ color: switching ? AMBER : GREEN }}>{switching ? "switching…" : `${activeLabel} active`}</span>
        </div>

        <PsmDiagram active={active} switching={switching} reduce={reduce} slot={currentSlot} bound={current.status !== "archived"} />
        <JumpDots focus={focus} onPick={setFocus} />
      </div>

      {/* focused driver, expanded */}
      <div className="mt-2 min-h-[132px] rounded-lg border" style={{ borderColor: hexToRgba(ACCENT, 0.25), background: "rgb(var(--ink-900))" }}>
        <AnimatePresence mode="wait">
          <DriverDetail project={current} slot={currentSlot} active={active} />
        </AnimatePresence>
      </div>
    </div>
  );
}
