"use client";

/** Front-panel hardware you'd actually find on (or in front of) a line card. */
export type HardwareKind = "qsfp" | "osfp" | "lc" | "psu" | "rp" | "cdr" | "tam" | "cwdm";

const shapes: Record<HardwareKind, React.ReactNode> = {
  // Pluggable client optic with bail latch and electrical contacts.
  qsfp: (
    <>
      <rect x="7" y="6" width="32" height="11" rx="1.5" />
      <path d="M7 9.5 H2 M7 13.5 H2" />
      <path d="M13 6 v11" opacity="0.45" />
      <path d="M34 9 h4 M34 14 h4" opacity="0.7" />
    </>
  ),
  // Higher-rate trunk pluggable: bigger body, heatsink fins.
  osfp: (
    <>
      <rect x="6" y="6" width="34" height="12" rx="1.5" />
      <path d="M11 6 V3 M16 6 V3 M21 6 V3 M26 6 V3 M31 6 V3 M36 6 V3" opacity="0.8" />
      <path d="M6 10 H1 M6 14 H1" />
      <path d="M35 10 h4 M35 14 h4" opacity="0.6" />
    </>
  ),
  // Duplex LC: two ferrules into the faceplate.
  lc: (
    <>
      <rect x="9" y="3" width="14" height="7" rx="1" />
      <rect x="9" y="13" width="14" height="7" rx="1" />
      <circle cx="12" cy="6.5" r="1.2" />
      <circle cx="12" cy="16.5" r="1.2" />
      <path d="M23 6.5 h16 M23 16.5 h16" opacity="0.8" />
      <path d="M16 3 V1 M16 20 v2" opacity="0.5" />
    </>
  ),
  // Chassis power supply: fan, vents, AC inlet.
  psu: (
    <>
      <rect x="3" y="4" width="33" height="15" rx="1.5" />
      <circle cx="12" cy="11.5" r="5" />
      <path d="M12 6.5 v10 M7 11.5 h10" opacity="0.45" />
      <path d="M23 8 h9 M23 11.5 h9 M23 15 h6" opacity="0.6" />
      <path d="M36 9 h8 M36 14 h8" />
    </>
  ),
  // Route processor card: the brain, big ASIC plus support chips.
  rp: (
    <>
      <rect x="2" y="3" width="43" height="16" rx="1.5" />
      <rect x="7" y="7" width="13" height="8" rx="1" />
      <rect x="24" y="8" width="6" height="6" rx="1" opacity="0.7" />
      <rect x="33" y="8" width="6" height="6" rx="1" opacity="0.7" />
      <path d="M2 11 H0" opacity="0.5" />
    </>
  ),
  // Clock & data recovery / coherent DSP package with recovered waveform.
  cdr: (
    <>
      <rect x="12" y="5" width="24" height="13" rx="1.5" />
      <path d="M12 8 H7 M12 11.5 H7 M12 15 H7 M36 8 h5 M36 11.5 h5 M36 15 h5" opacity="0.75" />
      <path d="M17 13 q2.5 -5 5 0 t5 0 t5 0" opacity="0.9" />
    </>
  ),
  // Trust anchor module: the chip that gates secure boot.
  tam: (
    <>
      <rect x="12" y="4" width="24" height="15" rx="1.5" />
      <path d="M12 8 H7 M12 15 H7 M36 8 h5 M36 15 h5" opacity="0.75" />
      <path d="M20.5 11 v-1.5 a3.5 3.5 0 0 1 7 0 V11" />
      <rect x="19.5" y="11" width="9" height="6" rx="1" />
    </>
  ),
  // Passive mux: many wavelengths combined onto one fiber.
  cwdm: (
    <>
      <path d="M1 4 h11 M1 8 h11 M1 15 h11 M1 19 h11" opacity="0.8" />
      <path d="M12 4 L25 10 M12 8 L25 10.7 M12 15 L25 12.3 M12 19 L25 13" opacity="0.55" />
      <rect x="25" y="8" width="8" height="7" rx="1" />
      <path d="M33 11.5 h14" />
    </>
  ),
};

export function HardwareGlyph({
  kind,
  className,
  style,
}: Readonly<{ kind: HardwareKind; className?: string; style?: React.CSSProperties }>) {
  return (
    <svg
      viewBox="0 0 48 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      {shapes[kind]}
    </svg>
  );
}
