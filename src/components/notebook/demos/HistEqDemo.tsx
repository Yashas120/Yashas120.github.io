"use client";

import { useEffect, useRef } from "react";

const ACCENT = "#fb7185";
const N = 150;

function lowContrastScene(): Uint8ClampedArray {
  const data = new Uint8ClampedArray(N * N);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const dx = x - N * 0.4, dy = y - N * 0.55;
      const disc = Math.max(0, 40 - Math.sqrt(dx * dx + dy * dy)) / 40;
      // squeeze everything into a narrow band [96,150] => low contrast
      const v = 96 + Math.round((0.5 * (x / N) + 0.5 * disc) * 54);
      data[y * N + x] = v;
    }
  }
  return data;
}

function histogram(data: Uint8ClampedArray) {
  const h = new Array(256).fill(0);
  for (let i = 0; i < data.length; i++) h[data[i]]++;
  return h;
}

function equalize(data: Uint8ClampedArray) {
  const h = histogram(data);
  const cdf = new Array(256).fill(0);
  let acc = 0;
  for (let i = 0; i < 256; i++) { acc += h[i]; cdf[i] = acc; }
  const total = data.length;
  const cdfMin = cdf.find((v) => v > 0) ?? 0;
  const out = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = Math.round(((cdf[data[i]] - cdfMin) / (total - cdfMin)) * 255);
  }
  return out;
}

function paint(canvas: HTMLCanvasElement | null, gray: Uint8ClampedArray) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(N, N);
  for (let i = 0; i < gray.length; i++) {
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = gray[i];
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

function Hist({ data, color }: { data: Uint8ClampedArray; color: string }) {
  const h = histogram(data);
  const max = Math.max(...h);
  const bins = 48;
  const step = Math.ceil(256 / bins);
  const bars = [];
  for (let b = 0; b < 256; b += step) {
    let s = 0;
    for (let k = 0; k < step && b + k < 256; k++) s += h[b + k];
    bars.push(s);
  }
  return (
    <svg viewBox={`0 0 ${bars.length} 24`} preserveAspectRatio="none" className="h-6 w-full">
      {bars.map((v, i) => (
        <rect key={i} x={i} y={24 - (v / max) * 24} width={0.9} height={(v / max) * 24} fill={color} />
      ))}
    </svg>
  );
}

export function HistEqDemo() {
  const origRef = useRef<HTMLCanvasElement>(null);
  const eqRef = useRef<HTMLCanvasElement>(null);
  const orig = lowContrastScene();
  const eq = equalize(orig);

  useEffect(() => {
    paint(origRef.current, orig);
    paint(eqRef.current, eq);
  }, [orig, eq]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="text-center">
        <canvas ref={origRef} width={N} height={N} className="block w-full rounded-md border" style={{ borderColor: "rgb(var(--line) / 0.1)" }} />
        <p className="mt-1 font-mono text-[10px] text-zinc-400">original (low contrast)</p>
        <Hist data={orig} color="#71717a" />
      </div>
      <div className="text-center">
        <canvas ref={eqRef} width={N} height={N} className="block w-full rounded-md border" style={{ borderColor: "rgb(var(--line) / 0.1)" }} />
        <p className="mt-1 font-mono text-[10px]" style={{ color: ACCENT }}>equalized</p>
        <Hist data={eq} color={ACCENT} />
      </div>
      <p className="col-span-2 font-mono text-[10px] leading-relaxed text-zinc-500">
        The original packs all intensities into a narrow band (see its histogram). Equalization spreads the CDF across the full range — contrast pops, and the histogram fills out. Computed live.
      </p>
    </div>
  );
}
