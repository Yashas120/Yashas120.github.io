"use client";

import { MotionValue, motion } from "framer-motion";
import { skills } from "@/data/skills";
import { hexToRgba } from "@/lib/utils";
import { StaggerItem } from "./scroll";

const ACCENT = "#22d3ee";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function ServiceMesh({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((group, i) => (
        <StaggerItem key={group.category} progress={progress} index={i} total={skills.length}>
          <div className="h-full rounded-xl border border-line/10 bg-ink-800/80 p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] text-zinc-300">svc/{slug(group.category)}</p>
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
                <motion.span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "#4ade80" }}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: [1, 0.35, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                />
                healthy
              </span>
            </div>

            <p className="mt-1 font-mono text-[10px] text-zinc-600">
              {group.items.length} endpoints registered
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="rounded-md border px-2 py-1 font-mono text-[11px] text-zinc-300"
                  style={{ borderColor: hexToRgba(ACCENT, 0.22), background: hexToRgba(ACCENT, 0.06) }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </StaggerItem>
      ))}
    </div>
  );
}
