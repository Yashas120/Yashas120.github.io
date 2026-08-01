"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Power, Radio, ShieldCheck, Server, Waves, Gauge, Activity, Check } from "lucide-react";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#a78bfa";
const STEP_MS = 420;

// The career brought up like a DWDM span: every stage is a real milestone,
// worded the way traffic actually comes up on a line card.
const stages = [
  {
    id: "power",
    label: "power-on",
    icon: Power,
    org: "PES University",
    detail: "B.Tech CSE, 2019–2023 — chassis powered, firmware loaded (9.33/10)",
  },
  {
    id: "light",
    label: "first light",
    icon: Radio,
    org: "Schneider Electric",
    detail: "Summer Intern, 2022 — first light on the span: switchgear tool, 2 days → 2 hours",
  },
  {
    id: "image",
    label: "image load",
    icon: ShieldCheck,
    org: "Cisco",
    detail: "Technical Intern, 2023 — signed SDK image auto-published on every API change (4h → 0)",
  },
  {
    id: "ctrl",
    label: "control plane up",
    icon: Server,
    org: "Cisco",
    detail: "SDE Backend, 2023–2025 — PX Cloud Terraform IaC, deploy time −50%",
  },
  {
    id: "cdr",
    label: "CDR lock",
    icon: Waves,
    org: "Cisco",
    detail: "Optical SDE II, 2025–2026 — Aquila line-card dataplane: CDR integration + secure boot",
  },
  {
    id: "fec",
    label: "FEC converge",
    icon: Gauge,
    org: "Cisco",
    detail: "Optical SDE II — QPSK modulation on NCS 1014 for long-haul reach",
  },
  {
    id: "traffic",
    label: "traffic running",
    icon: Activity,
    org: "UC San Diego",
    detail: "MSCS, incoming Sep 2026 — next span provisioned, La Jolla CA",
  },
];

const LAST = stages.length - 1;

export function Bringup({ trigger }: Readonly<{ trigger: number }>) {
  const [done, setDone] = useState(-1);

  useEffect(() => {
    setDone(-1);
    let i = -1;
    const iv = setInterval(() => {
      i += 1;
      setDone(i);
      if (i >= LAST) clearInterval(iv);
    }, STEP_MS);
    return () => clearInterval(iv);
  }, [trigger]);

  const up = done >= LAST;

  return (
    <div className="rounded-xl border border-line/10 bg-ink-800 p-4">
      {/* span endpoints */}
      <div className="mb-3 flex items-center justify-between font-mono text-[10px]">
        <span className="text-zinc-500">Tx · Bengaluru</span>
        <span style={{ color: up ? "#4ade80" : "#fbbf24" }}>{up ? "● span in service" : "● bringing up span…"}</span>
        <span className="text-zinc-500">Rx · La Jolla</span>
      </div>

      {/* the span itself */}
      <div className="flex items-start">
        {stages.map((s, i) => {
          const complete = i <= done;
          const running = i === done + 1 && !up;
          const Icon = s.icon;
          let tone = "#52525b";
          if (complete) tone = ACCENT;
          else if (running) tone = "#fbbf24";
          return (
            <div key={s.id} className="flex flex-1 items-start">
              <div className="flex flex-1 flex-col items-center text-center">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors"
                  style={{
                    borderColor: complete ? ACCENT : "rgb(var(--line) / 0.15)",
                    background: complete ? hexToRgba(ACCENT, 0.15) : "transparent",
                    color: tone,
                    boxShadow: complete ? `0 0 10px ${hexToRgba(ACCENT, 0.35)}` : "none",
                  }}
                >
                  {complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <p className="mt-1.5 font-mono text-[9px] leading-tight" style={{ color: complete ? ACCENT : "#a1a1aa" }}>
                  {s.label}
                </p>
              </div>
              {i < LAST && (
                <div className="mt-4 hidden sm:block" style={{ flex: "0 0 12px" }}>
                  <div className="h-px w-full transition-colors" style={{ background: i < done ? ACCENT : "rgb(var(--line) / 0.15)" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* bringup console — fills in as each stage locks */}
      <div
        className="mt-4 rounded-lg border p-2.5 font-mono text-[10px] leading-5"
        style={{ borderColor: "rgb(var(--line) / 0.08)", background: "rgb(var(--ink-900))" }}
      >
        {stages.slice(0, Math.max(done + 1, 0)).map((s) => (
          <motion.p
            key={s.id}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex gap-2"
          >
            <span className="shrink-0" style={{ color: "#4ade80" }}>ok</span>
            <span className="w-[92px] shrink-0 text-zinc-300">{s.label}</span>
            <span className="truncate text-zinc-500">
              <span className="text-zinc-300">{s.org}</span> · {s.detail}
            </span>
          </motion.p>
        ))}
        {!up && <p className="text-zinc-600">…</p>}
        {up && (
          <p className="mt-1" style={{ color: "#4ade80" }}>
            ✓ traffic running end-to-end — post-FEC BER 0, errors corrected
          </p>
        )}
      </div>
    </div>
  );
}
