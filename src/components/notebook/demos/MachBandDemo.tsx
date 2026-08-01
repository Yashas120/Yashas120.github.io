"use client";

import { useEffect, useRef } from "react";

const W = 420;
const H = 90;
const BANDS = 5;

export function MachBandDemo() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const bandW = W / BANDS;
    for (let b = 0; b < BANDS; b++) {
      const v = Math.round((b / (BANDS - 1)) * 255);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(b * bandW, 0, Math.ceil(bandW), H);
    }
  }, []);

  return (
    <div>
      <canvas ref={ref} width={W} height={H} className="block w-full rounded-md border" style={{ borderColor: "rgb(var(--line) / 0.1)" }} />
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-zinc-500">
        Each band is a <span className="text-zinc-300">perfectly uniform</span> gray — yet the edges appear darker on one side and lighter on the other. That&apos;s the <span className="text-zinc-300">Mach band illusion</span>: your visual system exaggerates contrast at boundaries (lateral inhibition), not the pixels. A great lab for teaching that perception ≠ data.
      </p>
    </div>
  );
}
