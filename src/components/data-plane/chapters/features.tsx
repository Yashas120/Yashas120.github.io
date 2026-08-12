"use client";

/**
 * Chapters 04–06: high-speed feature paths, state reconciliation, and
 * validation scale.
 *
 * Chapter 05 is the centrepiece mechanism of the route, but it is one chapter of
 * nine — the surrounding story is deliberately not collapsed into it.
 *
 * Two accuracy constraints are enforced by construction here:
 *  - The modulation comparison is structural. Symbol counts are a property of
 *    the modulation format itself; no reach, OSNR or BER figure is drawn.
 *  - The configuration lattice represents scale by sampling density. It never
 *    renders millions of elements, and it never implies each drawn dot is a
 *    literal state.
 */

import { motion, useTransform } from "framer-motion";
import { Ann, DrawLine, Reveal, StatusMark, useRange } from "../kit";
import { AMBER, FAINT, GRID, MUTED, RAISED, SIGNAL, VERIFIED } from "../palette";
import { geoFor, panelBox } from "../system";
import type { ChapterVisualProps } from "../types";

/* ========================= 04 — high-speed feature paths ================= */

/** A constellation: symbol count is the honest structural difference. */
function Constellation({
  cx,
  cy,
  r,
  points,
  color,
  step,
  label,
  sub,
  size,
}: Readonly<{
  cx: number;
  cy: number;
  r: number;
  points: number;
  color: string;
  step: ReturnType<typeof useRange>;
  label: string;
  sub: string;
  size: number;
}>) {
  const side = Math.sqrt(points);
  const gap = (r * 2) / side;
  const dots: [number, number][] = [];
  for (let i = 0; i < side; i++) {
    for (let j = 0; j < side; j++) {
      dots.push([cx - r + gap * (i + 0.5), cy - r + gap * (j + 0.5)]);
    }
  }
  return (
    <Reveal step={step}>
      <rect x={cx - r - 8} y={cy - r - 8} width={r * 2 + 16} height={r * 2 + 16} rx={4} fill="none" stroke={GRID} strokeWidth={0.9} />
      <line x1={cx - r - 4} y1={cy} x2={cx + r + 4} y2={cy} stroke={GRID} strokeWidth={0.6} />
      <line x1={cx} y1={cy - r - 4} x2={cx} y2={cy + r + 4} stroke={GRID} strokeWidth={0.6} />
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={points > 4 ? 1.5 : 2.4} fill={color} />
      ))}
      <Ann x={cx} y={cy + r + 22} size={size} color={color} anchor="middle">
        {label}
      </Ann>
      <Ann x={cx} y={cy + r + 34} size={size - 1} color={MUTED} anchor="middle">
        {sub}
      </Ann>
    </Reveal>
  );
}

/** One logical subchannel splitting out of the 800G trunk. */
function Subchannel({
  x,
  y,
  w,
  index,
  count,
  step,
}: Readonly<{ x: number; y: number; w: number; index: number; count: number; step: ReturnType<typeof useRange> }>) {
  const a = (index / count) * 0.5;
  const local = useTransform(step, [a, a + 0.5], [0, 1], { clamp: true });
  // Thin lanes with real gaps: eight touching bars read as one filled block.
  return <motion.rect x={x} y={y} width={w} height={4} rx={1} fill={SIGNAL} fillOpacity={0.6} style={{ opacity: local }} />;
}

export function Ch4Features({ p, compact }: Readonly<ChapterVisualProps>) {
  const geo = geoFor(compact);
  const b = panelBox(geo);
  const qpsk = useRange(p, 0.04, 0.3);
  const higher = useRange(p, 0.18, 0.44);
  const split = useRange(p, 0.42, 0.74);
  const dual = useRange(p, 0.72, 0.96);

  const r = compact ? 26 : 34;
  const rowA = b.top + (compact ? 34 : 44);
  const rowB = rowA + (compact ? 78 : 104);
  const rowC = rowB + (compact ? 62 : 84);
  const trunkW = b.right - b.left - (compact ? 60 : 90);

  return (
    <g>
      <Ann x={b.left} y={b.top} size={geo.f.tiny} color={FAINT}>
        FEATURE PATHS
      </Ann>

      {/* 400G QPSK vs higher-order: structural trade-off only */}
      <Constellation
        cx={b.left + r + 10}
        cy={rowA}
        r={r}
        points={4}
        color={VERIFIED}
        step={qpsk}
        label="QPSK · 4 symbols"
        sub="more tolerant"
        size={geo.f.tiny}
      />
      <Constellation
        cx={b.left + r * 3 + (compact ? 54 : 76)}
        cy={rowA}
        r={r}
        points={16}
        color={AMBER}
        step={higher}
        label="higher-order"
        sub="denser, less tolerant"
        size={geo.f.tiny}
      />
      <Reveal step={qpsk}>
        <Ann x={b.right} y={b.top} size={geo.f.tiny} color={VERIFIED} anchor="end">
          400G QPSK
        </Ann>
      </Reveal>

      {/* 800GE separating into logical subchannels */}
      <Reveal step={split}>
        <Ann x={b.left} y={rowB - (compact ? 12 : 16)} size={geo.f.tiny} color={SIGNAL}>
          800GE · slice / bundle
        </Ann>
        <rect x={b.left} y={rowB} width={compact ? 40 : 56} height={14} rx={2} fill={SIGNAL} fillOpacity={0.2} stroke={SIGNAL} strokeWidth={0.9} />
        <Ann x={b.left + (compact ? 20 : 28)} y={rowB + 10} size={geo.f.tiny - 0.5} color={SIGNAL} anchor="middle">
          800G
        </Ann>
      </Reveal>
      <DrawLine
        d={`M ${b.left + (compact ? 40 : 56)} ${rowB + 7} L ${b.left + (compact ? 52 : 74)} ${rowB + 7}`}
        step={split}
        color={SIGNAL}
      />
      {Array.from({ length: 8 }).map((_, i) => (
        <Subchannel
          key={i}
          x={b.left + (compact ? 56 : 78)}
          y={rowB + i * (compact ? 7 : 8) - (compact ? 12 : 14)}
          w={trunkW}
          index={i}
          count={8}
          step={split}
        />
      ))}
      <Reveal step={split}>
        <Ann x={b.right} y={rowB + (compact ? 38 : 44)} size={geo.f.tiny} color={MUTED} anchor="end">
          8x100G distribution
        </Ann>
      </Reveal>

      {/* 2x100G client path */}
      <Reveal step={dual}>
        <Ann x={b.left} y={rowC} size={geo.f.tiny} color={VERIFIED}>
          2x100G
        </Ann>
        {[0, 1].map((i) => (
          <g key={i}>
            <rect
              x={b.left + (compact ? 52 : 78)}
              y={rowC - 8 + i * (compact ? 14 : 16)}
              width={trunkW}
              height={7}
              rx={1.5}
              fill={VERIFIED}
              fillOpacity={0.4}
            />
          </g>
        ))}
        <Ann x={b.right} y={rowC + (compact ? 22 : 26)} size={geo.f.tiny} color={MUTED} anchor="end">
          validation automated
        </Ann>
      </Reveal>
    </g>
  );
}

/* ====================== 05 — state reconciliation (centrepiece) ========== */

const ROWS = [
  { label: "port_mode", match: true },
  { label: "trunk_lane", match: true },
  { label: "cdr_tune", match: false },
  { label: "fec_profile", match: true },
  { label: "if_800ge", match: false },
  { label: "if_2x100g", match: true },
] as const;

function ReconcileRow({
  index,
  row,
  geo,
  merge,
  mark,
  sweep,
}: Readonly<{
  index: number;
  row: (typeof ROWS)[number];
  geo: ReturnType<typeof geoFor>;
  merge: ReturnType<typeof useRange>;
  mark: ReturnType<typeof useRange>;
  sweep: ReturnType<typeof useRange>;
}>) {
  const b = panelBox(geo);
  const compact = geo.compact;
  const rowH = compact ? 20 : 26;
  const gap = compact ? 5 : 9;
  const y = b.top + (compact ? 30 : 44) + index * (rowH + gap);
  const labelW = compact ? 62 : 78;
  const cellW = compact ? 62 : 82;
  const desiredX = b.left + labelW;
  const offset = compact ? 74 : 104;

  const actualX = useTransform(merge, [0, 1], [desiredX + offset, desiredX]);
  const stroke = useTransform([mark, sweep] as ReturnType<typeof useRange>[], ([m, s]: number[]) => {
    if (row.match) return m > 0.4 ? VERIFIED : GRID;
    if (s > 0.55) return VERIFIED;
    return m > 0.4 ? AMBER : GRID;
  });
  const fillOpacity = useTransform(mark, [0, 1], [0.05, 0.16]);
  const markStep = row.match ? mark : sweep;

  return (
    <g>
      <Ann x={b.left} y={y + rowH / 2 + 3.5} size={geo.f.tiny} color={MUTED}>
        {row.label}
      </Ann>
      {/* desired software state: an outline */}
      <motion.rect
        x={desiredX}
        y={y}
        width={cellW}
        height={rowH}
        rx={3}
        fill="none"
        strokeDasharray="4 3"
        strokeWidth={1.1}
        style={{ stroke }}
      />
      {/* actual hardware state: solid, slides onto the outline */}
      <motion.rect
        y={y}
        width={cellW}
        height={rowH}
        rx={3}
        strokeWidth={1.2}
        style={{ x: actualX, stroke, fill: stroke, fillOpacity }}
      />
      <StatusMark
        x={desiredX + cellW + (compact ? 16 : 22)}
        y={y + rowH / 2}
        kind={row.match ? "keep" : "fix"}
        step={markStep}
        label={compact ? undefined : row.match ? "preserved" : "corrected"}
      />
    </g>
  );
}

export function Ch5Reconcile({ p, compact }: Readonly<ChapterVisualProps>) {
  const geo = geoFor(compact);
  const b = panelBox(geo);
  // software state vanishes on reload, then reconstructs
  const reload = useRange(p, 0.02, 0.18);
  const rebuild = useRange(p, 0.16, 0.34);
  const merge = useRange(p, 0.3, 0.56);
  const mark = useRange(p, 0.52, 0.72);
  const sweep = useRange(p, 0.72, 0.94);

  const swOpacity = useTransform([reload, rebuild] as ReturnType<typeof useRange>[], ([r, rb]: number[]) =>
    Math.max(0.12, 1 - r + rb * 0.9) > 1 ? 1 : Math.max(0.12, 1 - r + rb * 0.9),
  );
  const swLabel = useTransform([reload, rebuild] as ReturnType<typeof useRange>[], ([r, rb]: number[]): string => {
    if (rb > 0.7) return "software state reconstructed";
    if (r > 0.6) return "software state gone — hardware still programmed";
    return "software state";
  });

  return (
    <g>
      <Ann x={b.left} y={b.top} size={geo.f.tiny} color={FAINT}>
        WARM RELOAD
      </Ann>

      <motion.text
        x={b.right}
        y={b.top}
        fontSize={geo.f.tiny}
        textAnchor="end"
        style={{ fontFamily: "var(--font-jetbrains), ui-monospace, monospace", fill: AMBER, opacity: swOpacity }}
      >
        {swLabel}
      </motion.text>

      {!compact && (
        <Reveal step={merge}>
          <Ann x={b.left + 78} y={b.top + 30} size={geo.f.tiny} color={FAINT}>
            desired
          </Ann>
          <Ann x={b.left + 78 + 104} y={b.top + 30} size={geo.f.tiny} color={FAINT}>
            actual
          </Ann>
        </Reveal>
      )}

      {ROWS.map((row, i) => (
        <ReconcileRow key={row.label} index={i} row={row} geo={geo} merge={merge} mark={mark} sweep={sweep} />
      ))}

      <Reveal step={sweep}>
        <Ann x={b.left} y={b.bottom} size={geo.f.tiny} color={VERIFIED}>
          matches never reprogrammed · traffic continuous
        </Ann>
      </Reveal>
    </g>
  );
}

/* ========================= 06 — validation scale ========================= */

/** A lattice node. Density stands in for scale; each dot is not one state. */
function LatticeDot({
  x,
  y,
  index,
  count,
  step,
}: Readonly<{ x: number; y: number; index: number; count: number; step: ReturnType<typeof useRange> }>) {
  const a = (index / count) * 0.5;
  const local = useTransform(step, [a, a + 0.4], [0, 1], { clamp: true });
  return <motion.circle cx={x} cy={y} r={1.6} fill={GRID} style={{ opacity: local }} />;
}

const DEFECTS_A: readonly [number, number][] = [
  [2, 3],
  [5, 1],
  [7, 4],
  [9, 2],
  [4, 5],
];

const DEFECTS_B: readonly [number, number][] = [
  [1, 2],
  [3, 0],
  [6, 3],
  [8, 1],
  [5, 4],
  [2, 0],
  [7, 2],
  [4, 3],
];

function Campaign({
  x,
  y,
  w,
  cols,
  rows,
  defects,
  geo,
  form,
  sweep,
  found,
  title,
  scale,
  defectLabel,
}: Readonly<{
  x: number;
  y: number;
  w: number;
  cols: number;
  rows: number;
  defects: readonly [number, number][];
  geo: ReturnType<typeof geoFor>;
  form: ReturnType<typeof useRange>;
  sweep: ReturnType<typeof useRange>;
  found: ReturnType<typeof useRange>;
  title: string;
  /** Scale and defect summary. Kept to two short lines — the copy column
      carries the full figures, so the stage does not repeat them as fine print. */
  scale: string;
  defectLabel: string;
}>) {
  const stepX = w / (cols - 1);
  const stepY = geo.compact ? 13 : 17;
  const gy = y + (geo.compact ? 16 : 22);
  const sweepX = useTransform(sweep, [0, 1], [x - 5, x + w + 5]);

  return (
    <g>
      <Ann x={x} y={y} size={geo.f.tiny} color={SIGNAL}>
        {title}
      </Ann>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => (
          <LatticeDot
            key={`${r}-${c}`}
            x={x + c * stepX}
            y={gy + r * stepY}
            index={r * cols + c}
            count={cols * rows}
            step={form}
          />
        )),
      )}
      <motion.g style={{ opacity: form, x: sweepX }}>
        <line x1={0} y1={gy - 7} x2={0} y2={gy + stepY * (rows - 1) + 7} stroke={SIGNAL} strokeWidth={1} strokeOpacity={0.65} />
      </motion.g>
      {defects.map(([c, r]) => (
        <motion.g key={`${c}-${r}`} style={{ opacity: found }}>
          <circle cx={x + c * stepX} cy={gy + r * stepY} r={5} fill="none" stroke={AMBER} strokeWidth={1} />
          <circle cx={x + c * stepX} cy={gy + r * stepY} r={2} fill={AMBER} />
        </motion.g>
      ))}
      <Reveal step={form}>
        <Ann x={x} y={gy + stepY * rows + (geo.compact ? 10 : 14)} size={geo.f.tiny} color={MUTED}>
          {scale}
        </Ann>
      </Reveal>
      <Reveal step={found}>
        <Ann x={x} y={gy + stepY * rows + (geo.compact ? 23 : 29)} size={geo.f.tiny} color={AMBER}>
          {defectLabel}
        </Ann>
      </Reveal>
    </g>
  );
}

export function Ch6Validation({ p, compact }: Readonly<ChapterVisualProps>) {
  const geo = geoFor(compact);
  const b = panelBox(geo);
  const formA = useRange(p, 0.02, 0.24);
  const sweepA = useRange(p, 0.2, 0.46);
  const foundA = useRange(p, 0.42, 0.58);
  const formB = useRange(p, 0.5, 0.66);
  const sweepB = useRange(p, 0.62, 0.84);
  const foundB = useRange(p, 0.82, 0.98);

  // Two campaigns, always visually separated: side by side when there is width,
  // stacked with a divider when there is not.
  const colW = compact ? b.right - b.left : (b.right - b.left - 30) / 2;
  const rowBY = compact ? b.top + 128 : b.top + (compact ? 20 : 28);

  return (
    <g>
      <Ann x={b.left} y={b.top} size={geo.f.tiny} color={FAINT}>
        VALIDATION CAMPAIGNS · KEPT DISTINCT
      </Ann>

      <Campaign
        x={b.left}
        y={b.top + (compact ? 22 : 30)}
        w={colW}
        cols={compact ? 10 : 9}
        rows={compact ? 4 : 6}
        defects={DEFECTS_A}
        geo={geo}
        form={formA}
        sweep={sweepA}
        found={foundA}
        title="State reconciliation"
        scale="≈24k essential · ≤10M states"
        defectLabel="5 corner cases"
      />

      {compact ? (
        <line x1={b.left} y1={rowBY - 14} x2={b.right} y2={rowBY - 14} stroke={GRID} strokeWidth={0.8} />
      ) : (
        <line x1={b.left + colW + 15} y1={b.top + 20} x2={b.left + colW + 15} y2={b.bottom} stroke={GRID} strokeWidth={0.8} />
      )}

      <Campaign
        x={compact ? b.left : b.left + colW + 30}
        y={compact ? rowBY : b.top + 30}
        w={colW}
        cols={compact ? 10 : 9}
        rows={compact ? 4 : 6}
        defects={DEFECTS_B}
        geo={geo}
        form={formB}
        sweep={sweepB}
        found={foundB}
        title="800GE slice / bundle"
        scale=">20k combinations · ≈80k runs"
        defectLabel="5 slice + 3 bundle defects"
      />
    </g>
  );
}
