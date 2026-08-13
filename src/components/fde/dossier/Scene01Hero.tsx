"use client";

/**
 * Scene 01 — ambiguity resolves. Five scattered fragments are crossed by a
 * cobalt calibration line and settle into the first revision of the dossier.
 */

import { motion, useTransform } from "framer-motion";
import { Ann, COBALT, GREEN, useRange } from "./kit";
import type { SceneVisualProps } from "./types";

const FRAGMENTS = [
  { label: "workflow", from: [64, 92, -9], to: [232, 118] },
  { label: "constraint", from: [430, 62, 7], to: [232, 164] },
  { label: "security", from: [122, 330, 5], to: [232, 210] },
  { label: "operator", from: [462, 306, -6], to: [232, 256] },
  { label: "production", from: [286, 190, 11], to: [232, 302] },
] as const;

function Fragment({
  p,
  index,
  frag,
}: Readonly<{ p: SceneVisualProps["p"]; index: number; frag: (typeof FRAGMENTS)[number] }>) {
  const [fx, fy, fr] = frag.from;
  const [tx, ty] = frag.to;
  // The line sweeps left to right, so each fragment locks as it is crossed.
  const a = 0.16 + index * 0.09;
  const b = a + 0.26;
  const x = useRange(p, a, b, fx, tx);
  const y = useRange(p, a, b, fy, ty);
  const rot = useRange(p, a, b, fr, 0);
  const settled = useRange(p, a, b, 0, 1);
  const strokeOpacity = useTransform(settled, [0, 1], [0.35, 0.85]);
  const accent = useTransform(settled, [0.6, 1], [0, 1]);

  return (
    <motion.g style={{ x, y, rotate: rot }}>
      <motion.rect
        width={176}
        height={30}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.9}
        style={{ opacity: strokeOpacity }}
      />
      <motion.rect width={3} height={30} fill={COBALT} style={{ opacity: accent }} />
      <g transform="translate(14 20)">
        <Ann x={0} y={0} size={11}>
          {frag.label}
        </Ann>
      </g>
    </motion.g>
  );
}

export function Scene01Hero({ p, compact, reduced = false }: Readonly<SceneVisualProps>) {
  const coverOpacity = useRange(p, 0.14, 0.34, 1, 0);
  const sealOpacity = useRange(p, 0.02, 0.16, 0.35, 1);
  const fragmentOpacity = useRange(p, 0.12, 0.3, 0, 1);
  const sweepX = useRange(p, 0.06, 0.76, 24, 664);
  const sweepOpacity = useTransform(p, [0.02, 0.1, 0.72, 0.86], [0, 1, 1, 0], { clamp: true });
  const plateOpacity = useRange(p, 0.72, 0.95, 0, 1);
  const spineHeight = useRange(p, 0.5, 0.95, 0, 232);

  return (
    <g>
      {/* The page opens as a readable dossier, before discovery fragments move. */}
      <motion.g style={{ opacity: reduced ? 1 : coverOpacity }}>
        <rect x={compact ? 92 : 132} y={54} width={compact ? 496 : 416} height={348} fill="var(--fde-paper)" stroke="currentColor" strokeWidth={1.1} opacity={0.98} />
        <line x1={compact ? 92 : 132} y1={112} x2={compact ? 588 : 548} y2={112} stroke="currentColor" strokeWidth={0.8} opacity={0.38} />
        <Ann x={compact ? 112 : 154} y={82} size={compact ? 14 : 11} color={COBALT}>THE DEPLOYMENT DOSSIER</Ann>
        <Ann x={compact ? 112 : 154} y={101} size={compact ? 11 : 9} opacity={0.58}>FORWARD DEPLOYED ENGINEERING · ROLE LENS</Ann>
        <Ann x={compact ? 112 : 154} y={166} size={compact ? 22 : 18}>YASHAS KADAMBI</Ann>
        <Ann x={compact ? 112 : 154} y={194} size={compact ? 12 : 10} opacity={0.62}>PRODUCTION SOFTWARE ENGINEER · COMPLETE RECORD</Ann>
        <motion.g style={{ opacity: sealOpacity }}>
          <rect x={compact ? 112 : 154} y={230} width={compact ? 292 : 250} height={54} fill="none" stroke={GREEN} strokeWidth={1.2} />
          <Ann x={compact ? 128 : 170} y={253} size={compact ? 12 : 10} color={GREEN}>DISCOVER · BUILD · DEPLOY</Ann>
          <Ann x={compact ? 128 : 170} y={273} size={compact ? 12 : 10} color={GREEN}>OPERATE · HAND OFF</Ann>
        </motion.g>
        <Ann x={compact ? 112 : 154} y={340} size={compact ? 12 : 9} opacity={0.56}>5 ROLES · PROJECTS · RESEARCH · TEACHING</Ann>
        {(["DISCOVER", "BUILD", "DEPLOY", "OPERATE", "HAND OFF"] as const).map((label, index) => (
          <g key={label} transform={`translate(${compact ? 526 : 488} ${132 + index * 39})`}>
            <rect width={compact ? 62 : 60} height={27} fill="none" stroke="currentColor" strokeWidth={0.8} opacity={0.42} />
            <Ann x={(compact ? 62 : 60) / 2} y={18} size={compact ? 9 : 7.5} anchor="middle" opacity={0.72}>{label}</Ann>
          </g>
        ))}
      </motion.g>

      {/* the spine the fragments align against */}
      <motion.rect
        x={222}
        y={110}
        width={1}
        height={spineHeight}
        fill={COBALT}
        style={{ opacity: reduced ? 0 : 0.5 }}
      />

      {reduced ? null : (
        <motion.g style={{ opacity: fragmentOpacity }}>
          {FRAGMENTS.map((f, i) => <Fragment key={f.label} p={p} index={i} frag={f} />)}
        </motion.g>
      )}

      {/* calibration line */}
      <motion.g style={{ x: sweepX, opacity: reduced ? 0 : sweepOpacity }}>
        <line x1={0} y1={20} x2={0} y2={440} stroke={COBALT} strokeWidth={1.4} />
        <rect x={-1} y={20} width={2} height={40} fill={COBALT} />
        <g transform="translate(8 16)">
          <Ann x={0} y={0} size={9} color={COBALT}>
            CALIBRATE
          </Ann>
        </g>
      </motion.g>

      <motion.g style={{ opacity: reduced ? 0 : plateOpacity }}>
        <line x1={222} y1={352} x2={408} y2={352} stroke="currentColor" strokeWidth={0.9} opacity={0.5} />
        <Ann x={222} y={372} size={9} opacity={0.6}>
          DEPLOYMENT DOSSIER · REV 01
        </Ann>
        {!compact && (
          <>
            <Ann x={608} y={128} size={9} anchor="end" opacity={0.55}>
              inputs: ambiguous
            </Ann>
            <Ann x={608} y={146} size={9} anchor="end" color={COBALT}>
              status: aligned
            </Ann>
          </>
        )}
      </motion.g>
    </g>
  );
}
