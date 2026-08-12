/**
 * A normalized before/after bar.
 *
 * The bars communicate a normalized before/after relationship without publishing
 * held employer measurements or implying an absolute duration. The explanatory
 * caption is required.
 */

"use client";

import { DV } from "../tokens";
import { DiagramFrame } from "./parts";

const TRACK_X = 6;
const TRACK_W = 348;

export interface NormalizedComparisonProps {
  /** What is being compared, e.g. "deployment duration". */
  measure: string;
  before: number;
  after: number;
  /** Mandatory: names the comparison as normalized, not measured. */
  caption: string;
  accent?: string;
}

export function NormalizedComparison({
  measure,
  before,
  after,
  caption,
  accent = DV.amber,
}: Readonly<NormalizedComparisonProps>) {
  const scale = TRACK_W / Math.max(before, after);
  return (
    <figure className="m-0">
      <DiagramFrame
        title={`Normalized ${measure}`}
        desc={`${measure}, normalized: before ${before} units, after ${after} units. A ratio drawn to scale, not a measured duration.`}
        height={92}
      >
        <text x={TRACK_X} y={12} fontSize={12} fill={DV.muted} className="font-mono">
          before
        </text>
        <rect x={TRACK_X} y={18} width={before * scale} height={16} rx={3} fill={DV.border} />
        <text x={TRACK_X + before * scale - 6} y={31} fontSize={12} fill={DV.text} textAnchor="end" className="font-mono">
          {before}
        </text>

        <text x={TRACK_X} y={56} fontSize={12} fill={DV.muted} className="font-mono">
          after
        </text>
        <rect x={TRACK_X} y={62} width={after * scale} height={16} rx={3} fill={accent} />
        <text x={TRACK_X + after * scale - 6} y={75} fontSize={12} fill={DV.canvas} textAnchor="end" className="font-mono">
          {after}
        </text>
      </DiagramFrame>
      <figcaption className="mt-1 font-mono text-[12px] leading-snug" style={{ color: DV.muted }}>
        {caption}
      </figcaption>
    </figure>
  );
}
