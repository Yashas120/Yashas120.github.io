"use client";

import { Fragment, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Github } from "lucide-react";
import { projects } from "@/data/projects";
import { hexToRgba } from "@/lib/utils";
import { PHOSPHOR } from "../desktop/types";
import { Chip } from "./ui";

const STATE_COLOR: Record<string, string> = {
  R: PHOSPHOR,
  S: "#a1a1aa",
  D: "#fbbf24",
  Z: "#f87171",
};

const STATE_LABEL: Record<string, string> = {
  R: "running",
  S: "sleeping",
  D: "uninterruptible",
  Z: "zombie",
};

const FKEYS: [string, string][] = [
  ["F1", "Help"],
  ["F2", "Setup"],
  ["F3", "Search"],
  ["F4", "Filter"],
  ["F6", "SortBy"],
  ["F9", "Kill"],
  ["F10", "Quit"],
];

function Meter({ label, pct, color }: Readonly<{ label: string; pct: number; color: string }>) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-[10px]">
      <span className="w-6 flex-shrink-0 text-zinc-500">{label}</span>
      <span className="text-zinc-600">[</span>
      <span className="relative h-2 flex-1 overflow-hidden" style={{ background: "rgb(var(--line) / 0.08)" }}>
        <span
          className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-linear"
          style={{ width: `${pct}%`, background: color }}
        />
      </span>
      <span className="w-9 flex-shrink-0 text-right text-zinc-500">{pct.toFixed(1)}%</span>
      <span className="text-zinc-600">]</span>
    </div>
  );
}

export function Htop() {
  const [open, setOpen] = useState<string | null>(projects[0].id);
  const [cores, setCores] = useState([38, 61, 22, 47]);

  useEffect(() => {
    const id = setInterval(
      () => setCores((c) => c.map((v) => Math.max(6, Math.min(96, v + (Math.random() - 0.5) * 26)))),
      900
    );
    return () => clearInterval(id);
  }, []);

  const totalCpu = projects.reduce((s, p) => s + p.cpu, 0);
  const totalMem = projects.reduce((s, p) => s + p.mem, 0);
  const running = projects.filter((p) => p.state === "R").length;

  return (
    <div className="flex min-h-full flex-col font-mono text-[11px]">
      {/* Meters */}
      <div
        className="grid flex-shrink-0 gap-x-6 gap-y-1 border-b px-4 py-3 sm:grid-cols-2"
        style={{ borderColor: "rgb(var(--line) / 0.08)" }}
      >
        <div className="space-y-1">
          {cores.map((v, i) => (
            <Meter key={`cpu${i}`} label={`${i}`} pct={v} color={PHOSPHOR} />
          ))}
        </div>
        <div className="space-y-1">
          <Meter label="Mem" pct={Math.min(99, totalMem)} color="#fbbf24" />
          <Meter label="Swp" pct={8.2} color="#a78bfa" />
          <p className="pt-1 text-[10px] text-zinc-500">
            Tasks: <span className="text-zinc-300">{projects.length}</span>, {running} running
          </p>
          <p className="text-[10px] text-zinc-500">
            Load average: <span className="text-zinc-300">1.42 0.98 0.71</span>
          </p>
        </div>
      </div>

      <p className="flex-shrink-0 px-4 pt-2 text-[10px] text-zinc-600">
        {totalCpu.toFixed(1)}% total CPU across {projects.length} tasks — click a row to{" "}
        <span style={{ color: PHOSPHOR }}>strace</span> it.
      </p>

      {/* Process table */}
      <div className="flex-1 overflow-x-auto px-2 py-2">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr style={{ background: hexToRgba(PHOSPHOR, 0.14) }}>
              {["PID", "USER", "PRI", "%CPU", "%MEM", "S", "COMMAND"].map((h) => (
                <th
                  key={h}
                  className={`px-2 py-1 font-normal text-zinc-400 ${h === "COMMAND" ? "" : "whitespace-nowrap"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const isOpen = open === p.id;
              return (
                <Fragment key={p.id}>
                  <tr
                    onClick={() => setOpen(isOpen ? null : p.id)}
                    className="cursor-pointer transition-colors hover:bg-line/[0.05]"
                    style={{ background: isOpen ? hexToRgba(PHOSPHOR, 0.08) : undefined }}
                  >
                    <td className="px-2 py-1 text-zinc-500">{p.pid}</td>
                    <td className="px-2 py-1 text-zinc-500">yashas</td>
                    <td className="px-2 py-1 text-zinc-600">20</td>
                    <td className="px-2 py-1" style={{ color: PHOSPHOR }}>
                      {p.cpu.toFixed(1)}
                    </td>
                    <td className="px-2 py-1 text-zinc-400">{p.mem.toFixed(1)}</td>
                    <td className="px-2 py-1" style={{ color: STATE_COLOR[p.state] }}>
                      {p.state}
                    </td>
                    <td className="px-2 py-1 text-zinc-200">{p.title}</td>
                  </tr>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <tr>
                        <td colSpan={7} className="px-2 pb-2">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden"
                          >
                            <div
                              className="rounded-lg border p-3"
                              style={{
                                borderColor: "rgb(var(--line) / 0.08)",
                                background: "rgb(var(--ink-900))",
                              }}
                            >
                              <p className="text-zinc-600">
                                $ strace -p {p.pid}
                                <span className="ml-2 text-zinc-700">
                                  # state {p.state} · {STATE_LABEL[p.state]}
                                </span>
                              </p>
                              <p className="mt-2 font-sans text-[12px] leading-relaxed text-zinc-300">
                                {p.detail}
                              </p>
                              <div className="mt-2.5 flex flex-wrap gap-1.5">
                                {p.tech.map((t) => (
                                  <Chip key={t}>{t}</Chip>
                                ))}
                              </div>
                              {p.repoUrl && (
                                <a
                                  href={p.repoUrl}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-zinc-300 hover:text-zinc-50"
                                >
                                  <Github className="h-3.5 w-3.5" />
                                  {p.repoUrl.replace("https://github.com/", "")}
                                  {p.stars ? <span className="text-zinc-500"> · ★ {p.stars}</span> : null}
                                </a>
                              )}
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        className="sticky bottom-0 flex flex-shrink-0 flex-wrap gap-x-3 gap-y-1 border-t px-3 py-1.5 text-[10px] text-zinc-600 backdrop-blur"
        style={{ borderColor: "rgb(var(--line) / 0.08)", background: "rgb(var(--ink-800) / 0.9)" }}
      >
        {FKEYS.map(([key, label]) => (
          <span key={key}>
            <span className="text-zinc-500">{key}</span>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
