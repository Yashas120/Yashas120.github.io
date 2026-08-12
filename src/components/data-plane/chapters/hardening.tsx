"use client";

/**
 * Chapters 07–09: white-box testing, secure development, and cross-layer
 * diagnosis.
 *
 * Chapter 07 is careful to show the real production sources staying solid — the
 * framework compiles the actual production path, so only the hardware and
 * external SDK boundaries are replaced. Chapter 08 names no tool, host or
 * credential store. Chapter 09 is the only place the failure colour appears.
 */

import { motion, useTransform } from "framer-motion";
import { Ann, DrawLine, Reveal, StatusMark, useRange } from "../kit";
import { AMBER, FAINT, FAULT, GRID, MUTED, RAISED, SIGNAL, TEXT, VERIFIED } from "../palette";
import { geoFor, panelBox } from "../system";
import type { ChapterVisualProps } from "../types";

/* ========================= 07 — white-box harness ======================== */

export function Ch7Harness({ p, compact }: Readonly<ChapterVisualProps>) {
  const geo = geoFor(compact);
  const b = panelBox(geo);
  const real = useRange(p, 0.02, 0.22);
  const cut = useRange(p, 0.2, 0.5);
  const loop = useRange(p, 0.48, 0.9);

  const y0 = b.top + (compact ? 22 : 30);
  const rowH = compact ? 26 : 32;
  const w = b.right - b.left;

  // the feedback loop contracts
  const rOuter = compact ? 40 : 56;
  const cy = b.bottom - (compact ? 52 : 88);
  // Not shrunk so far that the timing label no longer fits inside the ring.
  const rr = useTransform(loop, [0, 1], [rOuter, rOuter * 0.56]);
  const slow = useTransform(loop, [0, 0.5], [1, 0]);
  const fast = useRange(loop, 0.5, 1);

  return (
    <g>
      <Ann x={b.left} y={b.top} size={geo.f.tiny} color={FAINT}>
        DEPENDENCY GRAPH · CUT AT THE BOUNDARY
      </Ann>

      {/* the real production path stays real */}
      <Reveal step={real}>
        <rect x={b.left} y={y0} width={w} height={rowH} rx={4} fill={RAISED} stroke={VERIFIED} strokeOpacity={0.55} strokeWidth={1.1} />
        <Ann x={b.left + 10} y={y0 + rowH / 2 + 3.5} size={geo.f.mono} color={TEXT}>
          production C path · compiled for x86_64
        </Ann>
      </Reveal>

      {/* only the external boundaries become doubles */}
      <Reveal step={cut}>
        <rect
          x={b.left}
          y={y0 + rowH + 12}
          width={w}
          height={rowH}
          rx={4}
          fill="none"
          stroke={SIGNAL}
          strokeOpacity={0.6}
          strokeWidth={1.1}
          strokeDasharray="5 5"
        />
        <Ann x={b.left + 10} y={y0 + rowH + 12 + rowH / 2 + 3.5} size={geo.f.mono} color={SIGNAL}>
          SDK / hardware boundaries stubbed
        </Ann>
      </Reveal>
      <Reveal step={cut}>
        <Ann x={b.left} y={y0 + rowH * 2 + 38} size={geo.f.tiny} color={MUTED}>
          typed strong stubs
        </Ann>
        <Ann x={b.left} y={y0 + rowH * 2 + (compact ? 50 : 52)} size={geo.f.tiny} color={MUTED}>
          + generated weak fallbacks · per-test linker wrappers
        </Ann>
      </Reveal>

      {/* build → test → fix, contracting */}
      <motion.circle
        cx={b.cx}
        cy={cy}
        fill="none"
        stroke={SIGNAL}
        strokeOpacity={0.55}
        strokeWidth={1.2}
        strokeDasharray="5 6"
        style={{ r: rr, opacity: cut }}
      />
      <motion.g style={{ opacity: slow }}>
        <Ann x={b.cx} y={cy - 2} size={geo.f.mono} color={MUTED} anchor="middle">
          tens of minutes
        </Ann>
      </motion.g>
      <motion.g style={{ opacity: fast }}>
        <Ann x={b.cx} y={cy - 2} size={geo.f.label} color={VERIFIED} anchor="middle">
          seconds
        </Ann>
      </motion.g>
      <Reveal step={cut}>
        {/* Anchored outside the largest ring so it never collides as it contracts. */}
        <Ann x={b.cx} y={cy + rOuter + 12} size={geo.f.tiny} color={FAINT} anchor="middle">
          build → test → fix
        </Ann>
      </Reveal>
      <Reveal step={loop}>
        <Ann x={b.left} y={b.bottom} size={geo.f.tiny} color={VERIFIED}>
          mandatory gate for newly added code
        </Ann>
      </Reveal>
    </g>
  );
}

/* ======================== 08 — secure development ======================= */

const STAGES = ["safe boot sequence", "node selection", "authentication", "image installation", "log collection"] as const;

function StageRow({
  index,
  label,
  x,
  y,
  w,
  h,
  geo,
  step,
}: Readonly<{
  index: number;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  geo: ReturnType<typeof geoFor>;
  step: ReturnType<typeof useRange>;
}>) {
  const a = index * 0.16;
  const local = useTransform(step, [a, a + 0.3], [0, 1], { clamp: true });
  const stroke = useTransform(local, [0, 1], [GRID, VERIFIED]);
  return (
    <motion.g style={{ opacity: useTransform(local, [0, 0.4], [0.25, 1]) }}>
      <motion.rect x={x} y={y} width={w} height={h} rx={4} fill={RAISED} strokeWidth={1.1} style={{ stroke }} />
      <Ann x={x + 10} y={y + h / 2 + 3.5} size={geo.f.mono} color={TEXT}>
        {`${index + 1}. ${label}`}
      </Ann>
      <StatusMark x={x + w - 14} y={y + h / 2} kind="keep" step={local} />
    </motion.g>
  );
}

export function Ch8SecureBoot({ p, compact }: Readonly<ChapterVisualProps>) {
  const geo = geoFor(compact);
  const b = panelBox(geo);
  const manual = useRange(p, 0.02, 0.2);
  const collapse = useRange(p, 0.18, 0.42);
  const guard = useRange(p, 0.36, 0.94);

  const h = compact ? 24 : 30;
  const gap = compact ? 6 : 9;
  const y0 = b.top + (compact ? 26 : 36);
  const w = b.right - b.left;
  const manualOpacity = useTransform(collapse, [0, 1], [1, 0]);
  const manualY = useTransform(collapse, [0, 1], [0, 14]);

  return (
    <g>
      <Ann x={b.left} y={b.top} size={geo.f.tiny} color={FAINT}>
        DEPLOYMENT WORKFLOW
      </Ann>

      <motion.g style={{ opacity: manualOpacity, y: manualY }}>
        <Ann x={b.right} y={b.top} size={geo.f.tiny} color={AMBER} anchor="end">
          ad-hoc manual steps
        </Ann>
      </motion.g>
      <motion.g style={{ opacity: useTransform(manual, [0, 1], [0, 1]) }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.rect
            key={i}
            x={b.left + i * ((w - 20) / 6)}
            y={b.top + (compact ? 10 : 14)}
            width={(w - 20) / 6 - 8}
            height={5}
            rx={1.5}
            fill={AMBER}
            fillOpacity={0.45}
            style={{ opacity: manualOpacity }}
          />
        ))}
      </motion.g>

      {STAGES.map((label, i) => (
        <StageRow
          key={label}
          index={i}
          label={label}
          x={b.left}
          y={y0 + i * (h + gap)}
          w={w}
          h={h}
          geo={geo}
          step={guard}
        />
      ))}

      <Reveal step={guard}>
        <Ann x={b.left} y={b.bottom} size={geo.f.tiny} color={VERIFIED}>
          one standardized path · adopted beyond the team
        </Ann>
      </Reveal>
    </g>
  );
}

/* ======================= 09 — cross-layer diagnosis ===================== */

const LAYERS = ["software upgrade path", "firmware image", "FPGA change"] as const;

function DiagLayer({
  index,
  label,
  x,
  y,
  w,
  h,
  geo,
  probe,
  isolate,
  healthy,
  connectorX,
  gap,
}: Readonly<{
  index: number;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  geo: ReturnType<typeof geoFor>;
  probe: ReturnType<typeof useRange>;
  isolate: ReturnType<typeof useRange>;
  healthy: ReturnType<typeof useRange>;
  /** Centre x for the connector down to the next layer, if there is one. */
  connectorX?: number;
  gap?: number;
}>) {
  const isCause = index === LAYERS.length - 1;
  const reached = useTransform(probe, [index * 0.3, index * 0.3 + 0.34], [0, 1], { clamp: true });
  const connector = useTransform(probe, [index * 0.3 + 0.15, index * 0.3 + 0.45], [0, 1], { clamp: true });
  const stroke = useTransform(
    [reached, isolate, healthy] as ReturnType<typeof useRange>[],
    ([rc, is, hl]: number[]) => {
      if (hl > 0.5) return VERIFIED;
      if (isCause && is > 0.5) return FAULT;
      return rc > 0.4 ? AMBER : GRID;
    },
  );
  const causeOpacity = useTransform([isolate, healthy] as ReturnType<typeof useRange>[], ([is, hl]: number[]) =>
    Math.max(0, is - hl),
  );

  return (
    <g>
      <motion.rect x={x} y={y} width={w} height={h} rx={4} fill={RAISED} strokeWidth={1.2} style={{ stroke }} />
      <Ann x={x + 10} y={y + h / 2 + 3.5} size={geo.f.mono} color={TEXT}>
        {label}
      </Ann>
      {isCause && (
        <motion.g style={{ opacity: causeOpacity }}>
          <Ann x={x + w - 10} y={y + h / 2 + 3.5} size={geo.f.tiny} color={FAULT} anchor="end">
            cold boot required
          </Ann>
        </motion.g>
      )}
      <StatusMark x={x + w - 14} y={y + h / 2} kind="keep" step={healthy} />
      {connectorX !== undefined && gap !== undefined && (
        <DrawLine d={`M ${connectorX} ${y + h} L ${connectorX} ${y + h + gap}`} step={connector} color={AMBER} />
      )}
    </g>
  );
}

export function Ch9Diagnose({ p, compact }: Readonly<ChapterVisualProps>) {
  const geo = geoFor(compact);
  const b = panelBox(geo);
  const probe = useRange(p, 0.02, 0.28);
  const isolate = useRange(p, 0.26, 0.5);
  const reset = useRange(p, 0.5, 0.7);
  const healthy = useRange(p, 0.7, 0.92);
  const pm = useRange(p, 0.86, 1);

  const h = compact ? 26 : 32;
  const gap = compact ? 12 : 18;
  const y0 = b.top + (compact ? 24 : 34);
  const w = b.right - b.left;
  const resetOpacity = useTransform([reset, healthy] as ReturnType<typeof useRange>[], ([r, hl]: number[]) =>
    Math.max(0, r - hl),
  );

  return (
    <g>
      <Ann x={b.left} y={b.top} size={geo.f.tiny} color={FAINT}>
        SKIPPED-VERSION UPGRADE · TRACE
      </Ann>

      {/* the probe descends through layers the team did not own */}
      {LAYERS.map((label, i) => (
        <DiagLayer
          key={label}
          index={i}
          label={label}
          x={b.left}
          y={y0 + i * (h + gap)}
          w={w}
          h={h}
          geo={geo}
          probe={probe}
          isolate={isolate}
          healthy={healthy}
          connectorX={i < LAYERS.length - 1 ? b.cx : undefined}
          gap={i < LAYERS.length - 1 ? gap : undefined}
        />
      ))}

      <motion.g style={{ opacity: resetOpacity }}>
        <Ann x={b.left} y={y0 + LAYERS.length * (h + gap) + 6} size={geo.f.tiny} color={AMBER}>
          warm-boot path insufficient → controlled cold boot
        </Ann>
      </motion.g>

      <Reveal step={healthy}>
        <Ann x={b.left} y={y0 + LAYERS.length * (h + gap) + 6} size={geo.f.tiny} color={VERIFIED}>
          upgrade unblocked · traffic stable
        </Ann>
      </Reveal>

      {/* PM analyzer: a second, separate diagnostic thread */}
      <Reveal step={pm}>
        <line
          x1={b.left}
          y1={b.bottom - (compact ? 26 : 30)}
          x2={b.right}
          y2={b.bottom - (compact ? 26 : 30)}
          stroke={GRID}
          strokeWidth={0.8}
        />
        <Ann x={b.left} y={b.bottom - (compact ? 10 : 12)} size={geo.f.tiny} color={MUTED}>
          router logs → PM extraction → focused counter analysis
        </Ann>
      </Reveal>
    </g>
  );
}
