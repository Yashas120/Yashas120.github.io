// SWIFT playground — an in-browser, illustrative walkthrough of the SWIFT
// lightweight super-resolution architecture from
// https://github.com/Yashas120/SWIFT  (paper: "Towards Faster and Efficient
// Lightweight Image Super-Resolution Using SwinV2 Transformers and Fourier
// Convolutions").
//
// SWIFT has three modules:
//   1. Feature Extraction (FE)  — a single 3x3 conv that lifts the LR image to
//      a C-channel feature space (low-frequency features).
//   2. High-Frequency Extraction (HFE) — a stack of Fourier-Swin Transformer
//      Blocks (FSTBs). Each FSTB = SwinV2+ transformer layers (window attention
//      with attention scaling) followed by Dual-Spectrum Frequency Blocks
//      (DSFB) that process one channel-half in the Fourier domain (Fast Fourier
//      Convolution) and the other in the spatial domain (ARFB). A tail conv +
//      global residual close the module.
//   3. Reconstruction — a parameter-efficient sub-pixel (PixelShuffle) upsampler
//      followed by a conv back to RGB.
//
// NOTE: This module does NOT run the trained network. It computes small, real,
// dependency-free signal-processing visualizations (2D DFT, convolutions,
// pixel-shuffle) so each layer's *role* can be shown honestly and interactively.

// ------------------------------- architecture data -------------------------------

export type Module = "FE" | "HFE" | "UP";
export type Domain = "spatial" | "frequency" | "both";
export type Viz =
  | "input"
  | "features"
  | "attention"
  | "fourier"
  | "residual"
  | "pixelshuffle"
  | "recon";

export interface Layer {
  id: string;
  short: string; // compact label
  title: string; // full name
  op: string; // the core operation, e.g. "Conv 3x3"
  module: Module;
  domain: Domain;
  shapeIn: string;
  shapeOut: string;
  summary: string;
  what: string[];
  viz: Viz;
}

// Illustrative dimensions for a x4 model with embedding dim C = 60 (SwinIR-lite
// style). H, W are the LR spatial size; r is the upscale factor.
export const LAYERS: Layer[] = [
  {
    id: "lr",
    short: "LR",
    title: "Low-resolution input",
    op: "I_LR",
    module: "FE",
    domain: "spatial",
    shapeIn: "—",
    shapeOut: "H×W×3",
    summary: "The small, degraded image we want to upscale by ×r.",
    what: [
      "A single RGB image at low resolution (e.g. 64×64).",
      "Contains most low-frequency structure but has lost high-frequency detail (edges, texture).",
      "Goal: recover a ×r larger image that looks like the original high-res.",
    ],
    viz: "input",
  },
  {
    id: "fe",
    short: "FE",
    title: "Feature Extraction",
    op: "Conv 3×3",
    module: "FE",
    domain: "spatial",
    shapeIn: "H×W×3",
    shapeOut: "H×W×C",
    summary: "One 3×3 conv lifts RGB into a C-channel feature space F₀.",
    what: [
      "A single 3×3 convolution — cheap, but establishes the feature space the whole network operates in.",
      "Maps 3 colour channels up to C=64 feature channels (each channel a learned filter response).",
      "Captures shallow, mostly low-frequency features; F₀ is later added back as a global residual.",
    ],
    viz: "features",
  },
  {
    id: "swin",
    short: "SwinV2+",
    title: "SwinV2+ Transformer Layers",
    op: "(S)W-MSA + attn scaling",
    module: "HFE",
    domain: "spatial",
    shapeIn: "H×W×C",
    shapeOut: "H×W×C",
    summary: "Window self-attention models long-range dependencies; attention scaling fights the frequency-erasing of transformers.",
    what: [
      "Splits the feature map into non-overlapping 8×8 windows and computes multi-head self-attention (8 heads) inside each (W-MSA).",
      "Alternating layers shift the window grid (SW-MSA) so information crosses window borders; SwinV2 adds scaled-cosine attention, post-norm and log-spaced relative position bias.",
      "Plain self-attention acts as a low-pass filter (erasing detail). AttnScale rescales its high-pass component with a learned λ so attention behaves as an all-pass filter — preserving high-frequency information.",
    ],
    viz: "attention",
  },
  {
    id: "dsfb",
    short: "DSFB",
    title: "Dual-Spectrum Frequency Block",
    op: "FFC ∥ ARFB",
    module: "HFE",
    domain: "both",
    shapeIn: "H×W×C",
    shapeOut: "H×W×C",
    summary: "Splits channels in half: one half goes through a Fourier branch (Fast Fourier Convolution), the other through a spatial branch (ARFB).",
    what: [
      "Fourier branch (FFC): real FFT → 1×1 conv + BN + ReLU on the spectrum → inverse FFT. A single spectral conv sees the WHOLE image at once (global receptive field) and directly edits frequency content.",
      "Spatial branch: average-pool → a stack of weight-shared Adaptive Residual Feature Blocks (ARFB) that refine local detail in the pixel domain.",
      "The two branches are fused with a Stereo Cross-Attention Module (SCAM), then concatenated along channels — combining global frequency context with local spatial detail to recover high-frequency texture.",
    ],
    viz: "fourier",
  },
  {
    id: "hfe-tail",
    short: "+ F₀",
    title: "HFE tail conv + global residual",
    op: "Conv 3×3, add F₀",
    module: "HFE",
    domain: "spatial",
    shapeIn: "H×W×C",
    shapeOut: "H×W×C",
    summary: "A conv processes the deep features, then the shallow features F₀ are added back.",
    what: [
      "After N stacked FSTBs, a 3×3 conv aggregates the deep high-frequency features.",
      "The shallow features F₀ from the FE module are added via a long skip connection.",
      "This lets the transformer stack focus purely on the high-frequency residual, stabilising training.",
    ],
    viz: "residual",
  },
  {
    id: "upsample",
    short: "PixelShuffle",
    title: "Sub-pixel upsampling",
    op: "Conv → PixelShuffle ×r",
    module: "UP",
    domain: "spatial",
    shapeIn: "H×W×C",
    shapeOut: "rH×rW×C",
    summary: "A conv produces C·r² channels, then PixelShuffle rearranges them into a ×r larger image — no expensive deconvolution.",
    what: [
      "A conv expands to C·r² channels while keeping the spatial size H×W.",
      "PixelShuffle (sub-pixel conv) rearranges each r² group of channels into an r×r spatial block.",
      "Parameter-efficient: upscaling happens by reshaping learned features, not by interpolation or transposed conv.",
    ],
    viz: "pixelshuffle",
  },
  {
    id: "recon",
    short: "HR",
    title: "Reconstruction",
    op: "Conv 3×3 → I_SR",
    module: "UP",
    domain: "spatial",
    shapeIn: "rH×rW×C",
    shapeOut: "rH×rW×3",
    summary: "A final 3×3 conv maps features back to an RGB super-resolved image.",
    what: [
      "Projects the upsampled feature map back to 3 colour channels.",
      "The output I_SR is ×r larger with recovered edges and texture.",
      "SWIFT matches/beats SwinIR (+0.10–0.20 dB PSNR) with ~34% fewer parameters and up to 60% faster inference.",
    ],
    viz: "recon",
  },
];

export interface ModuleInfo {
  id: Module;
  label: string;
  note: string;
}

export const MODULES: ModuleInfo[] = [
  { id: "FE", label: "Feature Extraction", note: "3×3 conv → F₀" },
  { id: "HFE", label: "High-Frequency Extraction", note: "FSTB ×4 (2 SwinV2+ · 2 DSFB)" },
  { id: "UP", label: "Reconstruction", note: "sub-pixel ×r" },
];

// ------------------------------- sample images -------------------------------

export type SampleKind = "panda" | "barbara" | "building";
// A single labelled panel in the reconstruction comparison.
export interface ReconVariant {
  src: string;
  label: string;
  sub: string;
  accent?: boolean; // highlight SWIFT (our method)
}
// `recon` holds the paper's actual ×4 result crops so the reconstruction step can
// show real before/after panels. barbara & img_092 come from the Figure 3
// qualitative comparison (Bicubic / SWIFT / HR reference); the panda comes from
// the Figure 2 teaser (its bicubic baseline uses the standard HR→LR→bicubic
// degradation on the same crop).
export interface ReconCrops {
  dataset: string;
  source: string; // figure the crops are taken from (shown in the caption)
  note?: string; // optional extra caption line
  variants: ReconVariant[];
}
export const SAMPLES: {
  id: SampleKind;
  label: string;
  src: string;
  note: string;
  recon?: ReconCrops;
}[] = [
  {
    id: "panda",
    label: "red panda",
    src: "/demos/swift/panda.png",
    note: "the LR image the paper feeds through SWIFT",
    recon: {
      dataset: "red panda",
      source: "Figure 2 (architecture teaser)",
      note: "SWIFT panel is the paper's real ×4 output; the LR input and bicubic baseline are the matching low-res / naïve-upsample versions of the same crop.",
      variants: [
        { src: "/demos/swift/panda_lr.png", label: "LR input", sub: "×4 low-res" },
        { src: "/demos/swift/panda_bicubic.png", label: "Bicubic", sub: "naïve upsample" },
        { src: "/demos/swift/panda_swift.png", label: "SWIFT (ours)", sub: "×4 reconstruction", accent: true },
      ],
    },
  },
  {
    id: "barbara",
    label: "barbara",
    src: "/demos/swift/barbara.png",
    note: "Set14 ×4 benchmark — stripes = strong frequencies",
    recon: {
      dataset: "Set14 ×4",
      source: "Figure 3 (qualitative comparison)",
      variants: [
        { src: "/demos/swift/barbara_bicubic.png", label: "Bicubic", sub: "naïve upsample" },
        { src: "/demos/swift/barbara_swift.png", label: "SWIFT (ours)", sub: "reconstructed", accent: true },
        { src: "/demos/swift/barbara_ref.png", label: "Reference", sub: "HR ground truth" },
      ],
    },
  },
  {
    id: "building",
    label: "building",
    src: "/demos/swift/building.png",
    note: "Urban100 img_092 — periodic texture",
    recon: {
      dataset: "Urban100 ×4",
      source: "Figure 3 (qualitative comparison)",
      variants: [
        { src: "/demos/swift/building_bicubic.png", label: "Bicubic", sub: "naïve upsample" },
        { src: "/demos/swift/building_swift.png", label: "SWIFT (ours)", sub: "reconstructed", accent: true },
        { src: "/demos/swift/building_ref.png", label: "Reference", sub: "HR ground truth" },
      ],
    },
  },
];

// ------------------------------- convolution -------------------------------

export const KERNELS: { id: string; label: string; k: number[] }[] = [
  { id: "identity", label: "identity", k: [0, 0, 0, 0, 1, 0, 0, 0, 0] },
  { id: "blur", label: "low-freq (blur)", k: [1, 2, 1, 2, 4, 2, 1, 2, 1].map((v) => v / 16) as number[] },
  { id: "sobel", label: "edges (Sobel)", k: [1, 0, -1, 2, 0, -2, 1, 0, -1] },
  { id: "sharpen", label: "sharpen", k: [0, -1, 0, -1, 5, -1, 0, -1, 0] },
];

// Apply a 3x3 kernel with reflect padding; returns values (may be signed for edge kernels).
export function conv3x3(src: Float32Array, n: number, kernel: number[]): Float32Array {
  const out = new Float32Array(n * n);
  const clamp = (i: number) => (i < 0 ? -i : i >= n ? 2 * n - i - 2 : i);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let acc = 0;
      let ki = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const sx = clamp(x + dx);
          const sy = clamp(y + dy);
          acc += src[sy * n + sx] * kernel[ki++];
        }
      }
      out[y * n + x] = acc;
    }
  }
  return out;
}

// Normalize an arbitrary (possibly signed) field to 0..1 for display.
export function normalize(src: Float32Array): Float32Array {
  let min = Infinity;
  let max = -Infinity;
  for (const v of src) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = max - min || 1;
  const out = new Float32Array(src.length);
  for (let i = 0; i < src.length; i++) out[i] = (src[i] - min) / range;
  return out;
}

// ------------------------------- 2D DFT -------------------------------

export interface Complex {
  re: Float32Array;
  im: Float32Array;
}

// Separable naive 2D DFT (O(n^3), fine for n<=64). inverse=true divides by n^2.
export function fft2(reIn: Float32Array, imIn: Float32Array, n: number, inverse: boolean): Complex {
  const sign = inverse ? 1 : -1;
  const cos = new Float32Array(n * n);
  const sin = new Float32Array(n * n);
  for (let k = 0; k < n; k++) {
    for (let x = 0; x < n; x++) {
      const a = (sign * 2 * Math.PI * k * x) / n;
      cos[k * n + x] = Math.cos(a);
      sin[k * n + x] = Math.sin(a);
    }
  }
  // transform along x (rows)
  const r1 = new Float32Array(n * n);
  const i1 = new Float32Array(n * n);
  for (let y = 0; y < n; y++) {
    for (let k = 0; k < n; k++) {
      let sr = 0;
      let si = 0;
      for (let x = 0; x < n; x++) {
        const re = reIn[y * n + x];
        const im = imIn[y * n + x];
        const c = cos[k * n + x];
        const s = sin[k * n + x];
        sr += re * c - im * s;
        si += re * s + im * c;
      }
      r1[y * n + k] = sr;
      i1[y * n + k] = si;
    }
  }
  // transform along y (cols)
  const r2 = new Float32Array(n * n);
  const i2 = new Float32Array(n * n);
  for (let x = 0; x < n; x++) {
    for (let k = 0; k < n; k++) {
      let sr = 0;
      let si = 0;
      for (let y = 0; y < n; y++) {
        const re = r1[y * n + x];
        const im = i1[y * n + x];
        const c = cos[k * n + y];
        const s = sin[k * n + y];
        sr += re * c - im * s;
        si += re * s + im * c;
      }
      r2[k * n + x] = sr;
      i2[k * n + x] = si;
    }
  }
  if (inverse) {
    const N = n * n;
    for (let j = 0; j < N; j++) {
      r2[j] /= N;
      i2[j] /= N;
    }
  }
  return { re: r2, im: i2 };
}

// Log-magnitude spectrum, fftshifted (DC in the centre) and normalized 0..1.
export function magSpectrum(spec: Complex, n: number): Float32Array {
  const out = new Float32Array(n * n);
  let max = 0;
  const half = n >> 1;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const m = Math.log(1 + Math.hypot(spec.re[y * n + x], spec.im[y * n + x]));
      const sy = (y + half) % n;
      const sx = (x + half) % n;
      out[sy * n + sx] = m;
      if (m > max) max = m;
    }
  }
  if (max > 0) for (let i = 0; i < out.length; i++) out[i] /= max;
  return out;
}

// Apply a radial frequency mask (low- or high-pass) to a spectrum, in-place-safe
// (returns a new Complex). radius is in cycles from DC, 0..n/2.
export function applyRadialMask(spec: Complex, n: number, radius: number, highpass: boolean): Complex {
  const re = new Float32Array(spec.re);
  const im = new Float32Array(spec.im);
  for (let ky = 0; ky < n; ky++) {
    for (let kx = 0; kx < n; kx++) {
      const du = Math.min(kx, n - kx);
      const dv = Math.min(ky, n - ky);
      const d = Math.sqrt(du * du + dv * dv);
      const keep = highpass ? d > radius : d <= radius;
      if (!keep) {
        re[ky * n + kx] = 0;
        im[ky * n + kx] = 0;
      }
    }
  }
  return { re, im };
}

// Reconstruct a real image (clamped 0..1) from a (masked) spectrum.
export function reconstruct(spec: Complex, n: number): Float32Array {
  const inv = fft2(spec.re, spec.im, n, true);
  const out = new Float32Array(n * n);
  for (let i = 0; i < out.length; i++) out[i] = Math.min(1, Math.max(0, inv.re[i]));
  return out;
}

// ------------------------------- colormap -------------------------------

const SPECTRAL_STOPS: [number, number, number][] = [
  [13, 15, 45],
  [58, 22, 108],
  [140, 30, 118],
  [221, 74, 60],
  [247, 190, 78],
  [252, 253, 216],
];

// Map t in 0..1 to a magma-ish RGB — used for frequency spectra.
export function spectral(t: number): [number, number, number] {
  const c = Math.min(0.999, Math.max(0, t)) * (SPECTRAL_STOPS.length - 1);
  const i = Math.floor(c);
  const f = c - i;
  const a = SPECTRAL_STOPS[i];
  const b = SPECTRAL_STOPS[Math.min(SPECTRAL_STOPS.length - 1, i + 1)];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
}
