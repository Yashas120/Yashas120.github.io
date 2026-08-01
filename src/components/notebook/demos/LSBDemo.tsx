"use client";

import { useEffect, useRef, useState } from "react";

const ACCENT = "#fb7185";
const N = 140;

function drawCover(ctx: CanvasRenderingContext2D) {
  // a synthetic grayscale "photo": diagonal gradient + a soft disc
  const img = ctx.createImageData(N, N);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const grad = ((x + y) / (2 * N)) * 180 + 30;
      const dx = x - N * 0.62;
      const dy = y - N * 0.4;
      const disc = Math.max(0, 60 - Math.sqrt(dx * dx + dy * dy)) * 0.9;
      const v = Math.min(255, Math.round(grad + disc));
      const idx = (y * N + x) * 4;
      img.data[idx] = img.data[idx + 1] = img.data[idx + 2] = v;
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return img;
}

// render the secret ("PES") into a binary bit-plane
function makeSecret(): Uint8Array {
  const c = document.createElement("canvas");
  c.width = N;
  c.height = N;
  const cx = c.getContext("2d")!;
  cx.fillStyle = "#000";
  cx.fillRect(0, 0, N, N);
  cx.fillStyle = "#fff";
  cx.font = "bold 54px monospace";
  cx.textAlign = "center";
  cx.textBaseline = "middle";
  cx.fillText("PES", N / 2, N / 2);
  const d = cx.getImageData(0, 0, N, N).data;
  const bits = new Uint8Array(N * N);
  for (let i = 0; i < N * N; i++) bits[i] = d[i * 4] > 128 ? 1 : 0;
  return bits;
}

export function LSBDemo() {
  const coverRef = useRef<HTMLCanvasElement>(null);
  const stegoRef = useRef<HTMLCanvasElement>(null);
  const outRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const cover = coverRef.current, stego = stegoRef.current, out = outRef.current;
    if (!cover || !stego || !out) return;
    const cc = cover.getContext("2d")!;
    const sc = stego.getContext("2d")!;
    const oc = out.getContext("2d")!;

    const base = drawCover(cc);
    const secret = makeSecret();

    // embed: clear LSB, then set it to the secret bit
    const stegoImg = sc.createImageData(N, N);
    for (let i = 0; i < N * N; i++) {
      const v = (base.data[i * 4] & 0xfe) | secret[i];
      const idx = i * 4;
      stegoImg.data[idx] = stegoImg.data[idx + 1] = stegoImg.data[idx + 2] = v;
      stegoImg.data[idx + 3] = 255;
    }
    sc.putImageData(stegoImg, 0, 0);

    // extract: read bit-plane 1, amplify to full white
    const outImg = oc.createImageData(N, N);
    for (let i = 0; i < N * N; i++) {
      const bit = stegoImg.data[i * 4] & 1;
      const v = bit * 255;
      const idx = i * 4;
      outImg.data[idx] = outImg.data[idx + 1] = outImg.data[idx + 2] = v;
      outImg.data[idx + 3] = 255;
    }
    oc.putImageData(outImg, 0, 0);
  }, []);

  const panels = [
    { ref: coverRef, label: "cover image", sub: "original" },
    { ref: stegoRef, label: "watermarked", sub: "logo embedded — looks identical" },
    { ref: outRef, label: "bit-plane 1", sub: "extracted secret", hide: !revealed },
  ];

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {panels.map((p, i) => (
          <div key={i} className="text-center">
            <div className="relative overflow-hidden rounded-md border" style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
              <canvas ref={p.ref} width={N} height={N} className="block w-full" style={{ imageRendering: "pixelated" }} />
              {p.hide && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                  <button
                    onClick={() => setRevealed(true)}
                    className="rounded-md border px-3 py-1.5 font-mono text-[10px]"
                    style={{ borderColor: ACCENT, color: ACCENT }}
                  >
                    bitget(img,1)
                  </button>
                </div>
              )}
            </div>
            <p className="mt-1 font-mono text-[10px]" style={{ color: i === 2 ? ACCENT : "rgb(var(--zinc-400))" }}>{p.label}</p>
            <p className="font-mono text-[9px] text-zinc-500">{p.sub}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-zinc-500">
        The cover and watermarked images are visually identical — the PES logo hides in the lowest bit. Click <span style={{ color: ACCENT }}>bitget(img,1)</span> to read bit-plane 1 and reveal it. (Live, computed in your browser.)
      </p>
    </div>
  );
}
