"use client";

/**
 * Chapters 01–03: platform scope, early bring-up, and CDR integration.
 *
 * Each draws into the panel region of the persistent system. Chapter 03 draws a
 * connector out of the panel and into the base driver plate, because that is
 * literally where the selected tuning row goes.
 */

import { motion, useTransform } from "framer-motion";
import { Ann, DrawLine, Reveal, useRange } from "../kit";
import { AMBER, FAINT, GRID, MUTED, RAISED, SIGNAL, VERIFIED } from "../palette";
import { geoFor, panelBox } from "../system";
import type { ChapterVisualProps } from "../types";

/* ============================ 01 — platform scope ========================= */

/** One cell of the architecture map: shared base, or platform-specific. */
function ArchCell({
  x,
  y,
  w,
  h,
  index,
  count,
  specific,
  p,
}: Readonly<{ x: number; y: number; w: number; h: number; index: number; count: number; specific: boolean; p: ReturnType<typeof useRange> }>) {
  const a = 0.04 + (index / count) * 0.34;
  const step = useRange(p, a, a + 0.22);
  const opacity = useTransform(step, [0, 1], [0, specific ? 1 : 0.42]);
  return (
    <motion.rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={1.5}
      fill={specific ? SIGNAL : GRID}
      fillOpacity={specific ? 0.14 : 0.5}
      stroke={specific ? SIGNAL : "none"}
      strokeWidth={specific ? 0.9 : 0}
      style={{ opacity }}
    />
  );
}

const SPECIFIC_LABELS = ["revised CDR", "secure boot", "lambda-split", "resource maps"];

export function Ch1Platform({ p, compact }: Readonly<ChapterVisualProps>) {
  const geo = geoFor(compact);
  const b = panelBox(geo);
  const cols = compact ? 8 : 10;
  const rows = compact ? 6 : 8;
  const total = cols * rows;
  const gridW = b.right - b.left;
  const gridH = (compact ? 96 : 176);
  const cw = gridW / cols - 3;
  const ch = gridH / rows - 3;
  const gy = b.top + (compact ? 30 : 40);

  // The platform-specific region: a contiguous block, deliberately a minority
  // of the map. Roughly 10% of cells, matching "largely shared software base".
  const specificCells = Math.max(4, Math.round(total * 0.1));
  const isSpecific = (r: number, c: number) => r >= rows - 2 && c >= cols - Math.ceil(specificCells / 2);

  const legend = useRange(p, 0.44, 0.66);
  const labels = useRange(p, 0.6, 0.94);

  return (
    <g>
      <Ann x={b.left} y={b.top} size={geo.f.tiny} color={FAINT}>
        PLATFORM COMPOSITION
      </Ann>
      <Ann x={b.left} y={b.top + (compact ? 16 : 20)} size={geo.f.mono} color={MUTED}>
        largely shared software base
      </Ann>

      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => (
          <ArchCell
            key={`${r}-${c}`}
            x={b.left + c * (cw + 3)}
            y={gy + r * (ch + 3)}
            w={cw}
            h={ch}
            index={r * cols + c}
            count={total}
            specific={isSpecific(r, c)}
            p={p}
          />
        )),
      )}

      <Reveal step={legend}>
        <rect x={b.left} y={gy + gridH + 12} width={9} height={9} rx={1.5} fill={GRID} fillOpacity={0.5} />
        <Ann x={b.left + 15} y={gy + gridH + 20} size={geo.f.tiny} color={MUTED}>
          shared / retained
        </Ann>
        <rect
          x={b.left + (compact ? 152 : 130)}
          y={gy + gridH + 12}
          width={9}
          height={9}
          rx={1.5}
          fill={SIGNAL}
          fillOpacity={0.14}
          stroke={SIGNAL}
          strokeWidth={0.9}
        />
        <Ann x={b.left + (compact ? 167 : 145)} y={gy + gridH + 20} size={geo.f.tiny} color={SIGNAL}>
          platform-specific
        </Ann>
      </Reveal>

      <Reveal step={labels}>
        {SPECIFIC_LABELS.map((label, i) => (
          <Ann
            key={label}
            x={b.left + (compact ? (i % 2) * 150 : (i % 2) * 168)}
            y={gy + gridH + (compact ? 40 : 46) + Math.floor(i / 2) * (compact ? 15 : 17)}
            size={geo.f.tiny}
            color={MUTED}
          >
            {`· ${label}`}
          </Ann>
        ))}
      </Reveal>
    </g>
  );
}

/* ============================ 02 — early bring-up ======================== */

export function Ch2Precursor({ p, compact }: Readonly<ChapterVisualProps>) {
  const geo = geoFor(compact);
  const b = panelBox(geo);
  const bw = b.right - b.left;
  const bh = compact ? 74 : 108;
  const gap = compact ? 20 : 30;
  const y0 = b.top + (compact ? 24 : 34);

  const prove = useRange(p, 0.08, 0.44);
  const settle = useRange(p, 0.46, 0.92);
  const precursorOpacity = useTransform(settle, [0, 1], [1, 0.2]);
  const finalScale = useTransform(settle, [0, 1], [1.05, 1]);

  return (
    <g>
      <Ann x={b.left} y={b.top} size={geo.f.tiny} color={FAINT}>
        HARDWARE AVAILABILITY
      </Ann>

      {/* precursor hardware: translucent, but the software path is real */}
      <motion.g style={{ opacity: precursorOpacity }}>
        <rect
          x={b.left}
          y={y0}
          width={bw}
          height={bh}
          rx={5}
          fill={SIGNAL}
          fillOpacity={0.05}
          stroke={SIGNAL}
          strokeOpacity={0.45}
          strokeWidth={1.1}
          strokeDasharray="5 5"
        />
        <Ann x={b.left + 10} y={y0 + 18} size={geo.f.label} color={SIGNAL}>
          precursor hardware
        </Ann>
        <Ann x={b.left + 10} y={y0 + 34} size={geo.f.tiny} color={MUTED}>
          revised CDR behavior proven
        </Ann>
        <Ann x={b.left + 10} y={y0 + 48} size={geo.f.tiny} color={MUTED}>
          lambda-split provisioning path
        </Ann>
      </motion.g>

      <Reveal step={prove} lift={0}>
        <Ann x={b.left} y={y0 - 8} size={geo.f.tiny} color={SIGNAL}>
          software path active first
        </Ann>
      </Reveal>

      {/* the final board materialises around an already-working path */}
      <motion.g
        style={{
          opacity: settle,
          scale: finalScale,
          originX: `${b.left + bw / 2}px`,
          originY: `${y0 + bh + gap + bh / 2}px`,
        }}
      >
        <rect
          x={b.left}
          y={y0 + bh + gap}
          width={bw}
          height={bh}
          rx={5}
          fill={RAISED}
          stroke={VERIFIED}
          strokeOpacity={0.6}
          strokeWidth={1.2}
        />
        <Ann x={b.left + 10} y={y0 + bh + gap + 18} size={geo.f.label} color={VERIFIED}>
          final board
        </Ann>
        <Ann x={b.left + 10} y={y0 + bh + gap + 34} size={geo.f.tiny} color={MUTED}>
          driver and HAL path already in place
        </Ann>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x={b.left + 10 + i * ((bw - 24) / 5)}
            y={y0 + bh + gap + bh - 24}
            width={(bw - 24) / 5 - 8}
            height={13}
            rx={2}
            fill={VERIFIED}
            fillOpacity={0.09}
            stroke={GRID}
          />
        ))}
      </motion.g>

      <Reveal step={settle}>
        <Ann x={b.left} y={Math.min(y0 + bh + gap + bh + 20, b.bottom)} size={geo.f.tiny} color={FAINT}>
          bring-up off the critical path of hardware
        </Ann>
      </Reveal>
    </g>
  );
}

/* ========================== 03 — CDR integration ======================== */

const HARDCODED = ["tune = 0x…", "tune = 0x…", "tune = 0x…", "tune = 0x…", "tune = 0x…", "tune = 0x…"];

/** One hardcoded constant, collapsing into the shared table. */
function HardcodedRow({
  x,
  from,
  to,
  label,
  collapse,
  size,
}: Readonly<{ x: number; from: number; to: number; label: string; collapse: ReturnType<typeof useRange>; size: number }>) {
  const y = useTransform(collapse, [0, 1], [from, to]);
  const opacity = useTransform(collapse, [0, 0.72], [1, 0]);
  return (
    <motion.text
      x={x}
      fontSize={size}
      fill={AMBER}
      style={{ y, opacity, fontFamily: "var(--font-jetbrains), ui-monospace, monospace", letterSpacing: "0.06em" }}
    >
      {label}
    </motion.text>
  );
}

export function Ch3Cdr({ p, compact }: Readonly<ChapterVisualProps>) {
  const geo = geoFor(compact);
  const b = panelBox(geo);
  const intro = useRange(p, 0, 0.16);
  const collapse = useRange(p, 0.1, 0.5);
  const table = useRange(p, 0.44, 0.66);
  const send = useRange(p, 0.62, 0.94);

  const rowY = b.top + (compact ? 22 : 30);
  const rowStep = compact ? 15 : 19;
  const tableY = rowY + (compact ? 96 : 128);
  const tableH = compact ? 40 : 48;

  // The selected row leaves the panel and enters the real driver plate.
  const exitY = tableY + tableH / 2;
  const path = compact
    ? `M ${b.left + 6} ${tableY} L ${b.left + 6} ${geo.driver.y + geo.driver.h + 14} L ${geo.driver.x + geo.driver.w / 2} ${geo.driver.y + geo.driver.h + 14} L ${geo.driver.x + geo.driver.w / 2} ${geo.driver.y + geo.driver.h}`
    : `M ${b.x} ${exitY} L ${b.x - 16} ${exitY} L ${b.x - 16} ${geo.driver.y + geo.driver.h / 2} L ${geo.driver.x + geo.driver.w} ${geo.driver.y + geo.driver.h / 2}`;

  return (
    <g>
      <Ann x={b.left} y={b.top} size={geo.f.tiny} color={FAINT}>
        CDR TUNING SELECTION
      </Ann>

      {HARDCODED.map((label, i) => (
        <HardcodedRow
          key={`${label}-${i}`}
          x={b.left}
          from={rowY + i * rowStep}
          to={tableY + 22}
          label={label}
          collapse={collapse}
          size={geo.f.mono}
        />
      ))}
      <Reveal step={intro} lift={0}>
        <Ann x={b.left} y={rowY - 10} size={geo.f.tiny} color={AMBER}>
          hardcoded per use site
        </Ann>
      </Reveal>

      <Reveal step={table}>
        <rect x={b.left} y={tableY} width={b.right - b.left} height={tableH} rx={4} fill={RAISED} stroke={SIGNAL} strokeOpacity={0.55} />
        <Ann x={b.left + 10} y={tableY + 18} size={geo.f.label} color={SIGNAL}>
          table-driven selection
        </Ann>
        <Ann x={b.left + 10} y={tableY + 33} size={geo.f.tiny} color={MUTED}>
          one source · per-platform rows
        </Ann>
      </Reveal>

      <DrawLine d={path} step={send} color={SIGNAL} width={1.3} />

      <Reveal step={send}>
        <Ann x={b.left} y={tableY + tableH + (compact ? 22 : 30)} size={geo.f.tiny} color={MUTED}>
          migrated across the relevant programming path
        </Ann>
        <Ann x={b.left} y={tableY + tableH + (compact ? 36 : 46)} size={geo.f.tiny} color={VERIFIED}>
          shared-card behavior regression-protected
        </Ann>
      </Reveal>
    </g>
  );
}
