"use client";

import { hexToRgba } from "@/lib/utils";

const ACCENT = "#a78bfa";
const CYAN = "#22d3ee";

// Ambient bench console — the real bring-up toolchain. Insiders read the stack
// (HAL → HW register maps → device drivers) and the test gear (VIAVI, Spirent).
const stackTrace = [
  "[ hal  ] hw_map: optics 0/0/0 -> bar0 0x4000_0000  probe ok",
  "[ hwmap] reg CDR_CTRL 0x1a04  MDIO clause-45  lane[0..7]",
  "[ drv  ] coherent_dsp: serdes lane align ... LOCKED",
  "[ drv  ] i2c qsfp-dd cage3 page 0x11  temp=41.2C vcc=3.29V",
  "[ drv  ] pldm fw_update slot=1  crc ok  secure-boot verified",
  "[ obfl ] onboard failure log: env snapshot committed",
];

const benchTrace = [
  "viavi mts-5800: pre-fec ber sweep  span=88.6km  0 err",
  "spirent testcenter: 400G line-rate  0 drops  fec=on",
  "edfa gain=18.4dB  osnr=17.8dB  c-band lambda locked",
  "dco: mod=qpsk baud=63.1G  cd=1200 ps/nm  pmd ok",
  "xr> show controllers optics 0/0/0  admin=up oper=up",
  "cdr: clk&data recovery  prbs31 loopback  ber=3.1e-3",
];

const NCH = 44;

// DWDM carriers on an OSA sweep, shaped by an EDFA gain-tilt envelope.
const carriers = Array.from({ length: NCH }, (_, i) => {
  const t = i / (NCH - 1);
  const env = 0.32 + 0.62 * Math.exp(-Math.pow((t - 0.5) * 2.4, 2));
  const jitter = 0.9 + 0.1 * Math.sin(i * 1.7);
  return { x: t * 100, h: env * jitter * 100, hot: i % 11 === 4 };
});

export function LabBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-ink-900">
      {/* subtle violet bench tint so it reads as a lab, not plain black */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${hexToRgba(ACCENT, 0.07)}, transparent 45%, ${hexToRgba(CYAN, 0.05)})` }}
      />

      {/* bench graph-paper */}
      <div className="grid-bg absolute inset-0 opacity-[0.7]" />

      {/* laser-source / equipment glows */}
      <div
        className="absolute -left-20 top-1/4 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${hexToRgba(ACCENT, 0.18)}, transparent)` }}
      />
      <div
        className="absolute -right-20 top-2/3 h-[460px] w-[460px] rounded-full blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${hexToRgba(CYAN, 0.16)}, transparent)` }}
      />

      {/* wavelength ruler */}
      <div
        className="absolute inset-x-0 top-0 flex justify-between px-6 py-1 font-mono text-[9px]"
        style={{ color: hexToRgba(ACCENT, 0.32) }}
      >
        <span>1530.33 nm</span>
        <span className="hidden sm:inline">ITU C-band · 50 GHz grid · 96λ</span>
        <span>1565.50 nm</span>
      </div>

      {/* OSA spectrum sweep along the bottom */}
      <svg className="absolute inset-x-0 bottom-0 h-[28vh] w-full opacity-[0.22]" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="0" y1="99.5" x2="100" y2="99.5" stroke={ACCENT} strokeWidth="0.2" vectorEffect="non-scaling-stroke" />
        {carriers.map((c) => (
          <line
            key={c.x}
            x1={c.x}
            y1="100"
            x2={c.x}
            y2={100 - c.h}
            stroke={c.hot ? CYAN : ACCENT}
            strokeWidth={c.hot ? 0.9 : 0.55}
            opacity={c.hot ? 1 : 0.6}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* ambient stack trace (HAL / hwmap / drivers / OBFL) */}
      <pre
        className="absolute left-5 top-16 hidden font-mono text-[10px] leading-5 xl:block"
        style={{ color: hexToRgba(ACCENT, 0.22) }}
      >
        {stackTrace.join("\n")}
      </pre>

      {/* ambient bench trace (VIAVI / Spirent / OSA) */}
      <pre
        className="absolute bottom-32 right-5 hidden text-right font-mono text-[10px] leading-5 xl:block"
        style={{ color: hexToRgba(CYAN, 0.22) }}
      >
        {benchTrace.join("\n")}
      </pre>

      {/* faint sheen + soft vignette (kept light so bench elements stay visible) */}
      <div className="scanlines absolute inset-0 opacity-20" />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgb(var(--ink-900) / 0.5) 100%)" }}
      />
    </div>
  );
}
