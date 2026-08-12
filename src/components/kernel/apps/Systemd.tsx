"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { experience } from "@/data/experience";
import { workLabels } from "@/data/kernelPortfolio";
import { hexToRgba } from "@/lib/utils";
import { PHOSPHOR } from "../desktop/types";
import { AppHeader, Chip } from "./ui";

const professionalExperience = experience.filter((item) => item.kind === "professional");

export function Systemd() {
  const [open, setOpen] = useState<string | null>(professionalExperience[0]?.id ?? null);
  const reducedMotion = useReducedMotion();

  return (
    <div className="min-h-full font-mono text-[11px]">
      <AppHeader command="systemctl — professional experience" hint="education is listed separately in the Overview" />
      <ul className="divide-y" style={{ borderColor: "rgb(var(--line) / 0.06)" }}>
        {professionalExperience.map((item) => {
          const isOpen = open === item.id;
          return (
            <li key={item.id} className="px-4 py-3" style={{ borderColor: "rgb(var(--line) / 0.06)", background: isOpen ? hexToRgba(PHOSPHOR, 0.04) : undefined }}>
              <button onClick={() => setOpen(isOpen ? null : item.id)} className="min-h-11 w-full text-left" aria-expanded={isOpen}>
                <p className="font-sans text-[14px] font-semibold text-zinc-100">{item.role}</p>
                <p className="mt-0.5 font-sans text-[12px] text-zinc-400">{item.org} · {item.location}</p>
                <p className="mt-1 text-zinc-500">{item.start} — {item.end} · {workLabels.ownership[item.ownership]}</p>
                <p className="mt-1 text-zinc-600">service alias: {item.id}.service</p>
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: reducedMotion ? 0 : 0.18 }} className="overflow-hidden">
                    <div className="mt-3 rounded-lg border p-3" style={{ borderColor: "rgb(var(--line) / 0.08)", background: "rgb(var(--ink-900))" }}>
                      <p className="font-sans text-[12px] leading-relaxed text-zinc-300">{item.scope}</p>
                      <h3 className="mt-3 text-[10px] uppercase tracking-wider text-zinc-600">Verified outcomes</h3>
                      <ul className="mt-2 space-y-1.5 font-sans text-[12px] leading-relaxed text-zinc-400">
                        {item.points.slice(0, 5).map((point) => <li key={point} className="flex gap-2"><span style={{ color: PHOSPHOR }}>·</span>{point}</li>)}
                      </ul>
                      <div className="mt-3 flex flex-wrap gap-1.5">{item.technologies.map((technology) => <Chip key={technology}>{technology}</Chip>)}</div>
                      <Link href="/kernel#experience" className="mt-3 inline-flex min-h-11 items-center text-[11px]" style={{ color: PHOSPHOR }}>View complete Work Experience →</Link>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
