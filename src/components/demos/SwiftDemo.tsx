"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { LiveDemo } from "./LiveDemo";
import { useOnScreen, usePrefersReducedMotion } from "./bitcoin/parts";
import {
  applyRadialMask,
  conv3x3,
  fft2,
  KERNELS,
  LAYERS,
  magSpectrum,
  MODULES,
  normalize,
  reconstruct,
  SAMPLES,
  spectral,
  type Complex,
  type Layer,
  type ReconCrops,
  type ReconVariant,
  type SampleKind,
  type Viz,
} from "@/lib/demos/swift";
import { cardProps } from "@/data/demos";

const REPO = "https://github.com/Yashas120/SWIFT";
const SWIFT = "#22d3ee"; // cyan — the demo accent
const N = 64; // sample / DFT resolution

function rgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${a})`;
}

// Theme-aware accents so the demo is legible in both light and dark mode.
interface Palette {
  accent: string; // accent text
  domainSpatial: string;
  domainFreq: string;
  ok: string;
  hlFg: string;
}
function palette(light: boolean): Palette {
  return light
    ? { accent: "#0e7490", domainSpatial: "#7c3aed", domainFreq: "#be185d", ok: "#15803d", hlFg: "#18181b" }
    : { accent: "#22d3ee", domainSpatial: "#c4b5fd", domainFreq: "#f9a8d4", ok: "#4ade80", hlFg: "#ffffff" };
}

function useIsLight(): boolean {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const update = () => setLight(el.classList.contains("light"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return light;
}

// Loads a sample image and derives (a) the HTMLImageElement for colour previews
// and (b) an N×N grayscale field the signal-processing visualizations run on.
function useSampleImage(src: string, enabled: boolean, attempt: number): { img: HTMLImageElement | null; gray: Float32Array | null; error: string | null } {
  const [state, setState] = useState<{ img: HTMLImageElement | null; gray: Float32Array | null; error: string | null }>({
    img: null,
    gray: null,
    error: null,
  });
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setState({ img: null, gray: null, error: null });
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const cv = document.createElement("canvas");
      cv.width = N;
      cv.height = N;
      const ctx = cv.getContext("2d");
      if (!ctx) {
        setState({ img: null, gray: null, error: "The browser could not prepare the sample image." });
        return;
      }
      ctx.drawImage(img, 0, 0, N, N);
      const data = ctx.getImageData(0, 0, N, N).data;
      const gray = new Float32Array(N * N);
      for (let i = 0; i < N * N; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        gray[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      }
      setState({ img, gray, error: null });
    };
    img.onerror = () => {
      if (!cancelled) setState({ img: null, gray: null, error: "The SWIFT sample image could not be loaded." });
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [attempt, enabled, src]);
  return state;
}

export function SwiftDemo({ embedded = false }: Readonly<{ embedded?: boolean }> = {}) {
  const p = palette(useIsLight());
  const reduced = usePrefersReducedMotion();
  const [sample, setSample] = useState<SampleKind>("panda");
  const [active, setActive] = useState(0); // index into LAYERS
  const [playing, setPlaying] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const workGateRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(workGateRef);

  const current = SAMPLES.find((s) => s.id === sample) ?? SAMPLES[0];
  const { img, gray, error } = useSampleImage(current.src, onScreen, loadAttempt);
  // Forward spectrum computed once per sample; reused for the Fourier viz.
  const spectrum = useMemo<Complex | null>(
    () => (gray ? fft2(gray, new Float32Array(N * N), N, false) : null),
    [gray],
  );

  const layer = LAYERS[active];
  // The reconstruction step shows large paper crops, so let it use the full width.
  const wide = layer.viz === "recon" && !!current.recon;

  // autoplay: step through the layers
  useEffect(() => {
    if (!playing) return;
    if (reduced) {
      setActive(LAYERS.length - 1);
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => {
      setActive((i) => {
        if (i >= LAYERS.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 1600);
    return () => clearTimeout(t);
  }, [playing, active, reduced]);

  const run = () => {
    setActive(0);
    setPlaying(true);
  };
  const toggle = () => {
    if (active >= LAYERS.length - 1) return run();
    setPlaying((v) => !v);
  };

  return (
    <LiveDemo
      title="SWIFT — lightweight super-resolution"
      subtitle="A walkthrough of the SWIFT architecture: SwinV2+ transformers fused with Fast Fourier Convolutions to upscale images with ~34% fewer parameters. Step through each layer to see what it does."
      repoUrl={REPO}
      accent={SWIFT}
      embedded={embedded}
      {...cardProps("swift")}
    >
      {/* controls */}
      <div ref={workGateRef} className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={toggle}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-medium text-ink-900 transition-opacity hover:opacity-90"
          style={{ background: SWIFT }}
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? "pause" : active >= LAYERS.length - 1 ? "replay" : "play walkthrough"}
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setActive(0);
          }}
          aria-label="Restart the walkthrough at the first layer"
          title="restart"
          className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:text-zinc-200"
          style={{ borderColor: "rgb(var(--line) / 0.12)" }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <div className="ml-auto flex items-center gap-1">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-wide text-zinc-500">sample</span>
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSample(s.id)}
              aria-pressed={sample === s.id}
              className="rounded px-2 py-1 font-mono text-[10px]"
              style={{
                background: sample === s.id ? rgba(SWIFT, 0.15) : "transparent",
                color: sample === s.id ? p.accent : "rgb(var(--zinc-500))",
                border: `1px solid ${sample === s.id ? rgba(SWIFT, 0.4) : "rgb(var(--line) / 0.12)"}`,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* pipeline of modules / layers */}
      <ArchPipeline active={active} onPick={(i) => { setPlaying(false); setActive(i); }} p={p} />

      <div className={`mt-4 grid gap-4 ${wide ? "" : "lg:grid-cols-2"}`}>
        {/* explanation */}
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
            <span style={{ color: p.accent }}>{layer.module}</span>
            <ChevronRight className="h-3 w-3 text-zinc-600" />
            <span className="text-zinc-400">
              layer {active + 1}/{LAYERS.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-zinc-100">{layer.title}</h3>
            <DomainChip domain={layer.domain} p={p} />
          </div>
          <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-zinc-500">
            <span className="rounded px-1.5 py-0.5" style={{ background: rgba(SWIFT, 0.12), color: p.accent }}>
              {layer.op}
            </span>
            <span>
              {layer.shapeIn} <span className="text-zinc-600">→</span> {layer.shapeOut}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-300">{layer.summary}</p>
          <ul className="mt-3 space-y-1.5">
            {layer.what.map((w, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-zinc-400">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full" style={{ background: SWIFT }} />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* visualization */}
        <div className="flex flex-col">
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
            visualization
            <span className="ml-2 text-zinc-600">· computed live in your browser</span>
          </div>
          <div
            className="flex-1 rounded-lg border bg-ink-900 p-3"
            style={{ borderColor: "rgb(var(--line) / 0.12)", minHeight: 320 }}
          >
            {error ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center" role="alert">
                <p className="font-mono text-xs text-zinc-400">{error}</p>
                <button type="button" onClick={() => setLoadAttempt((value) => value + 1)} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 font-mono text-xs" style={{ borderColor: rgba(SWIFT, 0.4), color: p.accent }}>
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Retry sample
                </button>
              </div>
            ) : gray && spectrum && img ? (
              <LayerViz viz={layer.viz} gray={gray} spectrum={spectrum} img={img} recon={current.recon} p={p} />
            ) : (
              <div className="flex h-full items-center justify-center font-mono text-xs text-zinc-500">
                loading sample…
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 font-mono text-[10px] leading-relaxed text-zinc-600">
        Sample images ({current.note}) are taken from the SWIFT paper. This is an illustrative
        walkthrough of the architecture — the trained network is not run here. The visualizations are
        real, dependency-free signal processing (2D DFT, convolutions, pixel-shuffle) chosen to show each
        layer&apos;s role.
      </p>
    </LiveDemo>
  );
}

export function SwiftLab() {
  return <SwiftDemo embedded />;
}

// ------------------------------- pipeline -------------------------------

function ArchPipeline({
  active,
  onPick,
  p,
}: {
  active: number;
  onPick: (i: number) => void;
  p: Palette;
}) {
  const activeModule = LAYERS[active].module;
  return (
    <div className="overflow-x-auto">
      <style>{`@keyframes swiftflow{0%{left:0;opacity:0}20%{opacity:1}80%{opacity:1}100%{left:calc(100% - 4px);opacity:0}}`}</style>
      <div className="flex min-w-[520px] flex-col gap-2">
        {/* module band */}
        <div className="flex items-stretch gap-1">
          {MODULES.map((m, i) => {
            const on = m.id === activeModule;
            return (
              <div key={m.id} className="flex flex-1 items-center gap-1">
                <div
                  className="flex-1 rounded-lg border px-3 py-2"
                  style={{
                    background: on ? rgba(SWIFT, 0.12) : "transparent",
                    borderColor: on ? rgba(SWIFT, 0.5) : "rgb(var(--line) / 0.12)",
                  }}
                >
                  <div className="font-mono text-[11px] font-medium" style={{ color: on ? p.accent : "rgb(var(--zinc-400))" }}>
                    {m.label}
                  </div>
                  <div className="font-mono text-[9px] text-zinc-500">{m.note}</div>
                </div>
                {i < MODULES.length - 1 && (
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-zinc-600" />
                )}
              </div>
            );
          })}
        </div>

        {/* layer nodes */}
        <div className="flex items-center">
          {LAYERS.map((l, i) => {
            const on = i === active;
            const done = i < active;
            return (
              <div key={l.id} className="flex flex-1 items-center">
                <button
                  onClick={() => onPick(i)}
                  aria-pressed={on}
                  className="flex w-full flex-col items-center gap-0.5 rounded-md border px-1.5 py-1.5 transition-colors"
                  style={{
                    background: on ? rgba(SWIFT, 0.16) : "transparent",
                    borderColor: on ? rgba(SWIFT, 0.6) : done ? rgba(SWIFT, 0.25) : "rgb(var(--line) / 0.12)",
                    color: on ? p.accent : done ? p.accent : "rgb(var(--zinc-500))",
                  }}
                >
                  <span className="font-mono text-[10px] font-medium">{l.short}</span>
                </button>
                {i < LAYERS.length - 1 && (
                  <div
                    className="mx-0.5 h-[2px] w-4 flex-shrink-0"
                    style={{ background: i < active ? rgba(SWIFT, 0.5) : "rgb(var(--line) / 0.2)" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DomainChip({ domain, p }: { domain: Layer["domain"]; p: Palette }) {
  const label = domain === "spatial" ? "spatial domain" : domain === "frequency" ? "frequency domain" : "spatial + frequency";
  const color = domain === "spatial" ? p.domainSpatial : domain === "frequency" ? p.domainFreq : p.accent;
  return (
    <span
      className="rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide"
      style={{ background: rgba(color.startsWith("#") ? color : "#888888", 0.12), color }}
    >
      {label}
    </span>
  );
}

// ------------------------------- visualizations -------------------------------

function LayerViz({
  viz,
  gray,
  spectrum,
  img,
  recon,
  p,
}: {
  viz: Viz;
  gray: Float32Array;
  spectrum: Complex;
  img: HTMLImageElement;
  recon?: ReconCrops;
  p: Palette;
}) {
  switch (viz) {
    case "input":
      return <InputViz img={img} />;
    case "features":
      return <FeaturesViz gray={gray} />;
    case "attention":
      return <AttentionViz gray={gray} p={p} />;
    case "fourier":
      return <FourierViz gray={gray} spectrum={spectrum} p={p} />;
    case "residual":
      return <ResidualViz gray={gray} p={p} />;
    case "pixelshuffle":
      return <PixelShuffleViz p={p} />;
    case "recon":
      return <ReconViz img={img} recon={recon} p={p} />;
    default:
      return null;
  }
}

// Paints a grayscale (0..1) field into a canvas at native resolution.
function useGrayCanvas(ref: React.RefObject<HTMLCanvasElement | null>, field: Float32Array, n: number) {
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(n, n);
    for (let i = 0; i < n * n; i++) {
      const v = Math.round(Math.min(1, Math.max(0, field[i])) * 255);
      img.data[i * 4] = v;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [ref, field, n]);
}

function useSpectralCanvas(ref: React.RefObject<HTMLCanvasElement | null>, field: Float32Array, n: number) {
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(n, n);
    for (let i = 0; i < n * n; i++) {
      const [r, g, b] = spectral(field[i]);
      img.data[i * 4] = r;
      img.data[i * 4 + 1] = g;
      img.data[i * 4 + 2] = b;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [ref, field, n]);
}

function GrayTile({ field, n, label }: { field: Float32Array; n: number; label?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useGrayCanvas(ref, field, n);
  return (
    <figure className="flex flex-col items-center gap-1">
      <canvas
        ref={ref}
        width={n}
        height={n}
        className="w-full rounded border"
        style={{ imageRendering: "pixelated", borderColor: "rgb(var(--line) / 0.15)" }}
      />
      {label && <figcaption className="font-mono text-[9px] text-zinc-500">{label}</figcaption>}
    </figure>
  );
}

function SpectralTile({ field, n, label }: { field: Float32Array; n: number; label?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useSpectralCanvas(ref, field, n);
  return (
    <figure className="flex flex-col items-center gap-1">
      <canvas
        ref={ref}
        width={n}
        height={n}
        className="w-full rounded border"
        style={{ imageRendering: "pixelated", borderColor: "rgb(var(--line) / 0.15)" }}
      />
      {label && <figcaption className="font-mono text-[9px] text-zinc-500">{label}</figcaption>}
    </figure>
  );
}

// Draws an image (color) into a square canvas.
function ColorTile({ img, size, label, className }: { img: HTMLImageElement; size: number; label?: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
  }, [img, size]);
  return (
    <figure className="flex flex-col items-center gap-1">
      <canvas
        ref={ref}
        width={size}
        height={size}
        className={className ?? "w-full rounded border"}
        style={{ borderColor: "rgb(var(--line) / 0.15)" }}
      />
      {label && <figcaption className="font-mono text-[9px] text-zinc-500">{label}</figcaption>}
    </figure>
  );
}

function InputViz({ img }: { img: HTMLImageElement }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="w-40">
        <ColorTile img={img} size={128} label={`${N}×${N} low-resolution input`} />
      </div>
      <p className="max-w-xs text-center text-xs text-zinc-500">
        The starting point: a small image (the paper trains on 64×64 LR crops). The network never sees
        the high-res target — it must invent plausible high-frequency detail.
      </p>
    </div>
  );
}

function FeaturesViz({ gray }: { gray: Float32Array }) {
  const maps = useMemo(
    () => KERNELS.map((k) => ({ label: k.label, field: normalize(conv3x3(gray, N, k.k)) })),
    [gray],
  );
  return (
    <div className="flex h-full flex-col">
      <p className="mb-2 text-xs text-zinc-500">
        The 3×3 conv learns C filters. A few hand-picked kernels stand in for learned channels — each
        reacts to different structure (flat regions, edges, texture):
      </p>
      <div className="grid grid-cols-4 gap-2">
        {maps.map((m) => (
          <GrayTile key={m.label} field={m.field} n={N} label={m.label} />
        ))}
      </div>
    </div>
  );
}

function AttentionViz({ gray, p }: { gray: Float32Array; p: Palette }) {
  const [shifted, setShifted] = useState(false);
  const ref = useRef<HTMLCanvasElement>(null);
  useGrayCanvas(ref, gray, N);
  const win = 8; // window size in px (SWIFT uses 8×8 attention windows)
  const shift = shifted ? win / 2 : 0;
  const lines = [];
  for (let g = -win; g <= N; g += win) lines.push(g + shift);
  return (
    <div className="flex h-full flex-col">
      <p className="mb-2 text-xs text-zinc-500">
        Self-attention runs inside {win}×{win} windows (long-range within a window, cheap overall).
        Alternating layers <em>shift</em> the grid so features cross window borders:
      </p>
      <div className="relative mx-auto w-56">
        <canvas
          ref={ref}
          width={N}
          height={N}
          className="w-full rounded border"
          style={{ imageRendering: "pixelated", borderColor: "rgb(var(--line) / 0.15)" }}
        />
        {/* window grid overlay */}
        <svg viewBox={`0 0 ${N} ${N}`} className="pointer-events-none absolute inset-0 h-full w-full">
          {lines.map((x, i) => (
            <line key={`v${i}`} x1={x} y1={0} x2={x} y2={N} stroke={SWIFT} strokeWidth={0.4} opacity={0.7} />
          ))}
          {lines.map((y, i) => (
            <line key={`h${i}`} x1={0} y1={y} x2={N} y2={y} stroke={SWIFT} strokeWidth={0.4} opacity={0.7} />
          ))}
          <rect x={shift} y={shift} width={win} height={win} fill={rgba(SWIFT, 0.25)} stroke={SWIFT} strokeWidth={0.6} />
        </svg>
      </div>
      <button
        onClick={() => setShifted((s) => !s)}
        className="mx-auto mt-3 rounded-md border px-3 py-1 font-mono text-[11px]"
        style={{ borderColor: rgba(SWIFT, 0.4), color: p.accent, background: rgba(SWIFT, 0.08) }}
      >
        {shifted ? "SW-MSA (shifted windows)" : "W-MSA (regular windows)"} — toggle
      </button>
    </div>
  );
}

function FourierViz({ gray, spectrum, p }: { gray: Float32Array; spectrum: Complex; p: Palette }) {
  const [radius, setRadius] = useState(8);
  const [highpass, setHighpass] = useState(false);
  const mag = useMemo(() => magSpectrum(spectrum, N), [spectrum]);
  const recon = useMemo(
    () => reconstruct(applyRadialMask(spectrum, N, radius, highpass), N),
    [spectrum, radius, highpass],
  );
  return (
    <div className="flex h-full flex-col">
      <p className="mb-2 text-xs text-zinc-500">
        The Fourier branch runs a conv on the <strong>spectrum</strong> — one operation with a global
        receptive field. Drag the cutoff to keep low or high frequencies and watch the image rebuild:
      </p>
      <div className="grid grid-cols-3 gap-2">
        <GrayTile field={gray} n={N} label="input" />
        <SpectralTile field={mag} n={N} label="FFT magnitude" />
        <GrayTile field={recon} n={N} label={highpass ? "high-pass" : "low-pass"} />
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-16 font-mono text-[10px] text-zinc-500">cutoff</span>
          <input
            type="range"
            aria-label="Fourier frequency cutoff"
            min={1}
            max={N / 2}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="flex-1 accent-cyan-400"
            style={{ accentColor: SWIFT }}
          />
          <span className="w-8 text-right font-mono text-[10px]" style={{ color: p.accent }}>
            {radius}
          </span>
        </div>
        <div className="flex items-center justify-center gap-1">
          {[
            { id: false, label: "low-pass (structure)" },
            { id: true, label: "high-pass (detail)" },
          ].map((o) => (
            <button
              key={String(o.id)}
              onClick={() => setHighpass(o.id)}
              aria-pressed={highpass === o.id}
              className="rounded-md border px-2.5 py-1 font-mono text-[10px]"
              style={{
                background: highpass === o.id ? rgba(SWIFT, 0.14) : "transparent",
                borderColor: highpass === o.id ? rgba(SWIFT, 0.4) : "rgb(var(--line) / 0.12)",
                color: highpass === o.id ? p.accent : "rgb(var(--zinc-500))",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
        <p className="text-center text-[11px] text-zinc-500">
          Low frequencies carry structure; high frequencies carry the edges &amp; texture SR must recover.
          DSFB processes both, then fuses them with the spatial (ARFB) branch.
        </p>
      </div>
    </div>
  );
}

function ResidualViz({ gray, p }: { gray: Float32Array; p: Palette }) {
  // deep = high-frequency residual (edges); F0 = shallow; sum ≈ original
  const deep = useMemo(() => normalize(conv3x3(gray, N, [0, -1, 0, -1, 4, -1, 0, -1, 0])), [gray]);
  return (
    <div className="flex h-full flex-col justify-center">
      <p className="mb-3 text-xs text-zinc-500">
        The transformer stack learns a high-frequency <strong>residual</strong>; the shallow features F₀
        are added back via a long skip connection:
      </p>
      <div className="flex items-center justify-center gap-2">
        <div className="w-24">
          <GrayTile field={deep} n={N} label="deep (HF residual)" />
        </div>
        <span className="font-mono text-lg" style={{ color: p.accent }}>
          +
        </span>
        <div className="w-24">
          <GrayTile field={gray} n={N} label="F₀ (shallow)" />
        </div>
        <span className="font-mono text-lg text-zinc-500">=</span>
        <div className="w-24">
          <GrayTile field={gray} n={N} label="rich features" />
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-zinc-500">
        Learning only the residual keeps gradients healthy and lets deep layers specialise in detail.
      </p>
    </div>
  );
}

function PixelShuffleViz({ p }: { p: Palette }) {
  // Illustrate PixelShuffle ×2: 4 channels (r²) fold into a 2×2 super-pixel.
  const colors = ["#22d3ee", "#a78bfa", "#f472b6", "#fbbf24"];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="max-w-sm text-center text-xs text-zinc-500">
        PixelShuffle (×2 shown): a conv makes C·r² channels; each group of r²=4 channels is folded into
        one 2×2 output block — upscaling by rearranging, not interpolating.
      </p>
      <div className="flex items-center gap-6">
        {/* 4 input channels */}
        <div className="flex flex-col items-center gap-1">
          <div className="grid grid-cols-2 gap-1">
            {colors.map((c, i) => (
              <div
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded font-mono text-[10px] text-ink-900"
                style={{ background: c }}
              >
                c{i}
              </div>
            ))}
          </div>
          <span className="font-mono text-[9px] text-zinc-500">4 channels (1×1)</span>
        </div>

        <ChevronRight className="h-5 w-5" style={{ color: p.accent }} />

        {/* folded 2x2 super pixel */}
        <div className="flex flex-col items-center gap-1">
          <div className="grid grid-cols-2 gap-0 overflow-hidden rounded border" style={{ borderColor: "rgb(var(--line) / 0.2)" }}>
            {colors.map((c, i) => (
              <div key={i} className="flex h-8 w-8 items-center justify-center font-mono text-[10px] text-ink-900" style={{ background: c }}>
                c{i}
              </div>
            ))}
          </div>
          <span className="font-mono text-[9px] text-zinc-500">one 2×2 block (2×2)</span>
        </div>
      </div>
    </div>
  );
}

function ReconViz({ img, recon, p }: { img: HTMLImageElement; recon?: ReconCrops; p: Palette }) {
  // When the sample appears in the paper's qualitative comparison (Figure 3),
  // show its actual ×4 crops instead of a synthetic browser upscale.
  if (recon) return <PaperReconViz recon={recon} p={p} />;
  return <ComputedReconViz img={img} p={p} />;
}

// Real ×4 crops from the paper. Two large panels (top + bottom) rotate through
// the available versions at a one-step offset, so at every moment you are
// comparing a different pair — the classic SR "spot the difference" view.
function PaperReconViz({ recon, p }: { recon: ReconCrops; p: Palette }) {
  const reduced = usePrefersReducedMotion();
  const variants = recon.variants;
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);

  // Reset the rotation whenever the sample (and thus its crops) changes.
  useEffect(() => {
    setPhase(0);
    setPlaying(true);
  }, [recon]);

  useEffect(() => {
    if (!playing || reduced || variants.length < 2) return;
    const t = setInterval(() => setPhase((i) => (i + 1) % variants.length), 6400);
    return () => clearInterval(t);
  }, [playing, reduced, variants.length]);

  const top = variants[phase % variants.length];
  const bottom = variants[(phase + 1) % variants.length];

  return (
    <div className="flex h-full flex-col gap-3">
      <p className="text-xs text-zinc-500">
        Actual ×4 results from the paper on <strong>{recon.dataset}</strong>. The two panels rotate
        through <strong>{variants.map((v) => v.label.replace(" (ours)", "")).join(" → ")}</strong> at an
        offset, so each frame pits a different pair against each other — watch SWIFT recover the sharp
        edges and texture that bicubic upsampling smears away.
      </p>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        <ReconPanel v={top} corner="top" p={p} />
        <div className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-wide text-zinc-600">
          <div className="h-px flex-1" style={{ background: "rgb(var(--line) / 0.15)" }} />
          compare
          <div className="h-px flex-1" style={{ background: "rgb(var(--line) / 0.15)" }} />
        </div>
        <ReconPanel v={bottom} corner="bottom" p={p} />
      </div>

      {/* transport */}
      <div className="mt-1 flex items-center justify-center gap-3">
        <button
          onClick={() => setPlaying((v) => !v)}
          className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px]"
          style={{ borderColor: rgba(SWIFT, 0.4), color: p.accent, background: rgba(SWIFT, 0.08) }}
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "pause" : "play"}
        </button>
        <div className="flex items-center gap-1.5">
          {variants.map((v, i) => (
            <button
              key={v.label}
              onClick={() => {
                setPlaying(false);
                setPhase(i);
              }}
              title={v.label}
              aria-label={`Show ${v.label} reconstruction`}
              aria-pressed={i === phase % variants.length}
              className="h-2.5 w-2.5 rounded-full transition-transform"
              style={{
                background: i === phase % variants.length ? SWIFT : "rgb(var(--line) / 0.3)",
                transform: i === phase % variants.length ? "scale(1.25)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>

      <p className="text-center font-mono text-[10px] leading-relaxed text-zinc-600">
        Crops from {recon.source} of the SWIFT paper.
        {recon.note && <span className="block">{recon.note}</span>}
      </p>
    </div>
  );
}

function ReconPanel({ v, corner, p }: { v: ReconVariant; corner: "top" | "bottom"; p: Palette }) {
  return (
    <figure
      className="relative self-center overflow-hidden rounded-lg border"
      style={{ borderColor: v.accent ? rgba(SWIFT, 0.7) : "rgb(var(--line) / 0.15)" }}
    >
      {/* Natural aspect ratio, bounded by height — never cropped. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={v.src}
        src={v.src}
        alt={`${v.label} ×4 crop`}
        className="block"
        style={{ maxHeight: 300, maxWidth: "100%", width: "auto", height: "auto" }}
      />
      <figcaption
        className={`absolute left-2 ${corner === "top" ? "top-2" : "bottom-2"} flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] font-medium`}
        style={{ background: "rgb(0 0 0 / 0.6)", color: v.accent ? p.accent : "#ffffff" }}
      >
        {v.label}
        <span className="font-normal text-zinc-300">· {v.sub}</span>
      </figcaption>
    </figure>
  );
}

function ComputedReconViz({ img, p }: { img: HTMLImageElement; p: Palette }) {
  const lrRef = useRef<HTMLCanvasElement>(null);
  const nnRef = useRef<HTMLCanvasElement>(null);
  const srRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // downsample the sample to a small LR, then show nearest vs smooth ("SR") upscales
    const lrN = 20;
    const tmp = document.createElement("canvas");
    tmp.width = lrN;
    tmp.height = lrN;
    const tctx = tmp.getContext("2d");
    if (!tctx) return;
    tctx.imageSmoothingEnabled = true;
    tctx.imageSmoothingQuality = "high";
    tctx.drawImage(img, 0, 0, lrN, lrN);

    const lr = lrRef.current;
    if (lr) {
      const c = lr.getContext("2d")!;
      c.imageSmoothingEnabled = false;
      c.clearRect(0, 0, lrN, lrN);
      c.drawImage(tmp, 0, 0);
    }
    const dst = 128;
    const nn = nnRef.current;
    if (nn) {
      const c = nn.getContext("2d")!;
      c.imageSmoothingEnabled = false;
      c.clearRect(0, 0, dst, dst);
      c.drawImage(tmp, 0, 0, dst, dst);
    }
    const sr = srRef.current;
    if (sr) {
      const c = sr.getContext("2d")!;
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = "high";
      c.clearRect(0, 0, dst, dst);
      c.drawImage(tmp, 0, 0, dst, dst);
    }
  }, [img]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <p className="max-w-sm text-center text-xs text-zinc-500">
        The final conv emits the ×r image. Compared to naive nearest-neighbour upscaling, the network
        reconstructs smooth edges and texture:
      </p>
      <div className="flex items-end justify-center gap-3">
        <figure className="flex flex-col items-center gap-1">
          <canvas ref={lrRef} width={20} height={20} className="w-16 rounded border" style={{ imageRendering: "pixelated", borderColor: "rgb(var(--line) / 0.15)" }} />
          <figcaption className="font-mono text-[9px] text-zinc-500">LR input</figcaption>
        </figure>
        <ChevronRight className="mb-4 h-4 w-4 text-zinc-600" />
        <figure className="flex flex-col items-center gap-1">
          <canvas ref={nnRef} width={128} height={128} className="w-28 rounded border" style={{ imageRendering: "pixelated", borderColor: "rgb(var(--line) / 0.15)" }} />
          <figcaption className="font-mono text-[9px] text-zinc-500">nearest ×r</figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-1">
          <canvas ref={srRef} width={128} height={128} className="w-28 rounded border" style={{ borderColor: rgba(SWIFT, 0.5) }} />
          <figcaption className="font-mono text-[9px]" style={{ color: p.accent }}>
            SWIFT ×r (illustrative)
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
