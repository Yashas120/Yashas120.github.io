"use client";

import { useEffect, useState } from "react";
import { MotionValue, AnimatePresence, motion, useTransform } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import { projects } from "@/data/projects";
import { hexToRgba } from "@/lib/utils";
import { useIsLight } from "@/lib/useIsLight";
import { EASE_OUT, useStepIndex } from "./scroll";

const ACCENT = "#22d3ee";

const CX = 170;
const CY = 150;
const R = 112;

const pos = projects.map((_, i) => {
  const a = (i / projects.length) * Math.PI * 2 - Math.PI / 2;
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
});

/** FNV-1a — a real (if tiny) hash, so the printed key is reproducible. */
function hashKey(key: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `0x${(h >>> 0).toString(16).padStart(8, "0")}`;
}

export function HashRing({ progress }: { progress: MotionValue<number> }) {
  const scrolled = useStepIndex(progress, projects.length, 0.13, 0.97);
  const [picked, setPicked] = useState<number | null>(null);
  const isLight = useIsLight();

  // The needle rotates continuously with scroll instead of snapping shard to
  // shard, so the sweep reads as one fluid motion.
  const sweep = useTransform(
    progress,
    [0.13, 0.97],
    [0, (360 * (projects.length - 1)) / projects.length]
  );

  // A click wins until the sweep moves on to the next shard.
  useEffect(() => setPicked(null), [scrolled]);

  const index = picked ?? scrolled;
  const active = projects[index];
  const nodeFill = isLight ? "#e2e8f0" : "#11141b";
  const nodeStroke = isLight ? "rgba(15,23,42,0.25)" : "rgba(255,255,255,0.2)";

  return (
    <div className="grid items-center gap-8 md:grid-cols-2">
      <div className="flex justify-center">
        <svg width="340" height="320" viewBox="0 0 340 320" className="max-w-full">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke={hexToRgba(ACCENT, 0.18)} strokeWidth={1} />

          {/* keyspace ticks */}
          {Array.from({ length: 32 }, (_, i) => {
            const a = (i / 32) * Math.PI * 2 - Math.PI / 2;
            const inner = R - 5;
            return (
              <line
                key={`tick-${i}`}
                x1={CX + inner * Math.cos(a)}
                y1={CY + inner * Math.sin(a)}
                x2={CX + R * Math.cos(a)}
                y2={CY + R * Math.sin(a)}
                stroke={hexToRgba(ACCENT, 0.16)}
                strokeWidth={1}
              />
            );
          })}

          {/* sweep needle: rotates clockwise through the keyspace with scroll */}
          <motion.g
            style={{
              rotate: sweep,
              transformOrigin: `${CX}px ${CY}px`,
              transformBox: "view-box",
            }}
          >
            <line
              x1={CX}
              y1={CY}
              x2={CX}
              y2={CY - R}
              stroke={hexToRgba(ACCENT, 0.5)}
              strokeWidth={1.5}
            />
            <circle
              cx={CX}
              cy={CY - R}
              r={4}
              fill={ACCENT}
              style={{ filter: `drop-shadow(0 0 6px ${hexToRgba(ACCENT, 0.9)})` }}
            />
          </motion.g>

          {projects.map((p, i) => {
            const isSel = i === index;
            return (
              <g
                key={p.id}
                onClick={() => setPicked(i)}
                style={{ cursor: "pointer" }}
                role="button"
                aria-label={p.title}
              >
                {/* generous invisible hit area */}
                <circle cx={pos[i].x} cy={pos[i].y} r={18} fill="transparent" />
                <motion.circle
                  cx={pos[i].x}
                  cy={pos[i].y}
                  fill={isSel ? ACCENT : nodeFill}
                  stroke={isSel ? ACCENT : nodeStroke}
                  strokeWidth={1.5}
                  initial={{ r: 6 }}
                  animate={{ r: isSel ? 11 : 6 }}
                  transition={{ type: "spring", stiffness: 240, damping: 20 }}
                  style={isSel ? { filter: `drop-shadow(0 0 9px ${hexToRgba(ACCENT, 0.9)})` } : undefined}
                />
              </g>
            );
          })}

          <circle cx={CX} cy={CY} r={3.5} fill="#52525b" />
          <text x={CX} y={CY + 26} textAnchor="middle" className="font-mono" fontSize={9} fill="#52525b">
            2³² keyspace
          </text>
          <text x={CX} y={22} textAnchor="middle" className="font-mono" fontSize={8.5} fill="#52525b">
            0x00000000
          </text>
        </svg>
      </div>

      <div className="relative min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="rounded-xl border border-line/10 bg-ink-800/80 p-5 backdrop-blur sm:p-6"
          >
            <div className="flex items-center justify-between font-mono text-[10.5px]">
              <span className="text-zinc-500">
                hash(<span style={{ color: ACCENT }}>{active.id}</span>) = {hashKey(active.id)}
              </span>
              <span style={{ color: ACCENT }}>shard {String(index).padStart(2, "0")}</span>
            </div>

            <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-50 sm:text-xl">
              {active.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{active.detail}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {active.tech.map((t) => (
                <span
                  key={t}
                  className="rounded border px-2 py-0.5 font-mono text-[10px]"
                  style={{ borderColor: hexToRgba(ACCENT, 0.25), color: ACCENT }}
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-4 font-mono text-[11px] text-zinc-500">
              <span>replica state: {active.status}</span>
              {active.repoUrl && (
                <a
                  href={active.repoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-zinc-50"
                >
                  <Github className="h-3.5 w-3.5" /> repo <ArrowUpRight className="h-3 w-3" />
                </a>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="mt-3 font-mono text-[10.5px] text-zinc-600">
          keep scrolling to walk the ring — or click any node to jump to its shard
        </p>
      </div>
    </div>
  );
}
