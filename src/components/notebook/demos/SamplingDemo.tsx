"use client";

import { useEffect, useRef, useState } from "react";

const ACCENT = "#fb7185";
const N = 150;

function drawScene(ctx: CanvasRenderingContext2D) {
  const img = ctx.createImageData(N, N);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      // concentric rings + gradient => aliasing shows clearly when undersampled
      const dx = x - N / 2, dy = y - N / 2;
      const r = Math.sqrt(dx * dx + dy * dy);
      const rings = (Math.sin(r * 0.6) * 0.5 + 0.5) * 200;
      const v = Math.min(255, Math.round(rings + (x / N) * 55));
      const idx = (y * N + x) * 4;
      img.data[idx] = img.data[idx + 1] = img.data[idx + 2] = v;
      img.data[idx + 3] = 255;
    }
  }
  return img;
}

export function SamplingDemo() {
  const origRef = useRef<HTMLCanvasElement>(null);
  const sampRef = useRef<HTMLCanvasElement>(null);
  const [interval, setIntervalV] = useState(8);

  useEffect(() => {
    const orig = origRef.current, samp = sampRef.current;
    if (!orig || !samp) return;
    const oc = orig.getContext("2d")!;
    const scn = drawScene(oc);
    oc.putImageData(scn, 0, 0);

    const sc = samp.getContext("2d")!;
    const out = sc.createImageData(N, N);
    for (let y = 0; y < N; y += interval) {
      for (let x = 0; x < N; x += interval) {
        const s = (y * N + x) * 4;
        const v = scn.data[s];
        for (let k = 0; k < interval && y + k < N; k++)
          for (let l = 0; l < interval && x + l < N; l++) {
            const idx = ((y + k) * N + (x + l)) * 4;
            out.data[idx] = out.data[idx + 1] = out.data[idx + 2] = v;
            out.data[idx + 3] = 255;
          }
      }
    }
    sc.putImageData(out, 0, 0);
  }, [interval]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {[{ ref: origRef, label: "original" }, { ref: sampRef, label: `sampled · every ${interval}px` }].map((p, i) => (
          <div key={i} className="text-center">
            <canvas ref={p.ref} width={N} height={N} className="block w-full rounded-md border" style={{ borderColor: "rgb(var(--line) / 0.1)", imageRendering: "pixelated" }} />
            <p className="mt-1 font-mono text-[10px]" style={{ color: i === 1 ? ACCENT : "rgb(var(--zinc-400))" }}>{p.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <label className="font-mono text-[10px] text-zinc-500" htmlFor="samp">sampling interval: {interval}px</label>
        <input id="samp" type="range" min={1} max={20} value={interval} onChange={(e) => setIntervalV(Number(e.target.value))} className="mt-1 w-full accent-[#fb7185]" />
      </div>
      <p className="mt-1 font-mono text-[10px] leading-relaxed text-zinc-500">
        Drag to undersample. As the interval grows, the rings alias into blocky artifacts — a hands-on look at the sampling theorem.
      </p>
    </div>
  );
}
