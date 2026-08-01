"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { experience } from "@/data/experience";
import { hexToRgba } from "@/lib/utils";
import { PHOSPHOR } from "../desktop/types";
import { AppHeader } from "./ui";

const DEAD = "#71717a";

/** Stable fake PIDs so the journal lines look like a real log across renders. */
function pidFor(id: string): number {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 9000;
  return 1000 + h;
}

export function Systemd() {
  const [open, setOpen] = useState<string | null>(experience[1]?.id ?? experience[0].id);

  return (
    <div className="min-h-full font-mono text-[11px]">
      <AppHeader
        command="systemctl list-units --type=service"
        hint={`${experience.length} units loaded · click a unit for its journal`}
      />

      <ul className="divide-y" style={{ borderColor: "rgb(var(--line) / 0.06)" }}>
        {experience.map((e) => {
          const isOpen = open === e.id;
          const live = e.end === "Present";
          const color = live ? PHOSPHOR : DEAD;
          const unit = `${e.id}.service`;
          const pid = pidFor(e.id);

          return (
            <li
              key={e.id}
              className="px-4 py-3 transition-colors"
              style={{
                borderColor: "rgb(var(--line) / 0.06)",
                background: isOpen ? hexToRgba(PHOSPHOR, 0.04) : undefined,
              }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : e.id)}
                className="w-full text-left"
                aria-expanded={isOpen}
              >
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span style={{ color }}>●</span>
                  <span className="text-zinc-200">{unit}</span>
                  <span className="text-zinc-500">
                    — {e.role} @ {e.org}
                  </span>
                </p>
                <p className="mt-1 pl-4 text-zinc-500">
                  Loaded: <span className="text-zinc-400">loaded</span> (/etc/systemd/system/{unit};{" "}
                  <span style={{ color }}>enabled</span>; preset: enabled)
                </p>
                <p className="pl-4 text-zinc-500">
                  Active:{" "}
                  <span style={{ color }}>{live ? "active (running)" : "inactive (dead)"}</span> since{" "}
                  {e.start}
                  {live ? "" : `; stopped ${e.end}`}
                </p>
                {e.tags.length > 0 && (
                  <p className="pl-4 text-zinc-600">
                    WantedBy: {e.tags.map((t) => `${t}.target`).join(" ")}
                  </p>
                )}
                {e.location && <p className="pl-4 text-zinc-600">Node: {e.location}</p>}
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="mt-3 rounded-lg border p-3"
                      style={{
                        borderColor: "rgb(var(--line) / 0.08)",
                        background: "rgb(var(--ink-900))",
                      }}
                    >
                      <p className="mb-2 text-zinc-600">$ journalctl -u {unit} --no-pager</p>
                      <ul className="space-y-1.5">
                        {e.points.map((p) => (
                          <li key={p} className="flex gap-2 leading-relaxed">
                            <span className="flex-shrink-0 text-zinc-600">
                              {e.start} {e.id.split("-")[0]}[{pid}]:
                            </span>
                            <span className="font-sans text-[12px] text-zinc-300">{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
