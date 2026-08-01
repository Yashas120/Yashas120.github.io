"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { profile } from "@/data/profile";
import { skills } from "@/data/skills";
import { projects } from "@/data/projects";
import { hexToRgba } from "@/lib/utils";
import { PHOSPHOR } from "../desktop/types";

const FILES = ["status", "cmdline", "maps", "environ", "version"] as const;
type FileName = (typeof FILES)[number];

function Row({ k, v }: Readonly<{ k: string; v: React.ReactNode }>) {
  return (
    <p className="flex flex-wrap gap-x-2">
      <span className="w-28 flex-shrink-0 text-zinc-500">{k}:</span>
      <span className="min-w-0 flex-1 text-zinc-300">{v}</span>
    </p>
  );
}

/** Deterministic pseudo-addresses so the maps listing looks stable and real. */
function region(i: number): string {
  const base = 0x400000 + i * 0xa1000;
  const end = base + 0x6d000;
  return `${base.toString(16).padStart(8, "0")}-${end.toString(16).padStart(8, "0")}`;
}

function Status() {
  return (
    <div className="space-y-1">
      <Row k="Name" v={profile.name} />
      <Row k="State" v={<span style={{ color: PHOSPHOR }}>R (running)</span>} />
      <Row k="Tgid" v="1" />
      <Row k="Threads" v={`${skills.length} skill groups, ${projects.length} tasks`} />
      <Row k="Current" v={profile.current} />
      <Row k="Previous" v={profile.previous} />
      <Row k="Education" v={profile.education} />
      <Row k="Location" v={profile.location} />
      <Row k="Handle" v={`@${profile.githubUser}`} />
      <p className="mt-3 border-t pt-3 font-sans text-[12px] leading-relaxed text-zinc-400" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>
        {profile.summary}
      </p>
    </div>
  );
}

function Maps() {
  return (
    <div className="space-y-2.5">
      {skills.map((s, i) => (
        <div key={s.category}>
          <p className="whitespace-nowrap text-zinc-500">
            {region(i)} r-xp 00000000 08:02 {1048577 + i}{" "}
            <span style={{ color: PHOSPHOR }}>[{s.category.toLowerCase().replace(/[^a-z]+/g, "-")}]</span>
          </p>
          <p className="pl-4 text-zinc-300">{s.items.join("  ")}</p>
        </div>
      ))}
    </div>
  );
}

function Environ() {
  const env: [string, string][] = [
    ["USER", "yashas"],
    ["HOME", "/home/yashas"],
    ["SHELL", "/bin/yash"],
    ["EDITOR", "vim"],
    ["TZ", "Asia/Kolkata → America/Los_Angeles"],
    ["FOCUS", "distributed systems, operating systems, applied ML"],
    ["CERT", "AWS Certified Developer – Associate"],
    ["EMAIL", profile.email],
  ];
  return (
    <div className="space-y-1">
      {env.map(([k, v]) => (
        <p key={k}>
          <span style={{ color: PHOSPHOR }}>{k}</span>
          <span className="text-zinc-600">=</span>
          <span className="text-zinc-300">{v}</span>
        </p>
      ))}
    </div>
  );
}

const CONTENT: Record<FileName, () => React.ReactNode> = {
  status: Status,
  cmdline: () => <p className="text-zinc-300">{profile.tagline}</p>,
  maps: Maps,
  environ: Environ,
  version: () => (
    <p className="leading-relaxed text-zinc-300">
      yashOS kernel version 6.11.0-yashas (yashas@kernel) (gcc 13.2.0) #1 SMP PREEMPT_RT
      <br />
      Built from B.Tech CSE, PES University · 3 years at Cisco · incoming MSCS at UC San Diego.
    </p>
  ),
};

export function Procfs() {
  const [file, setFile] = useState<FileName>("status");

  return (
    <div className="flex min-h-full flex-col font-mono text-[11.5px] sm:flex-row">
      <nav
        aria-label="procfs files"
        className="no-scrollbar flex flex-shrink-0 gap-1 overflow-x-auto border-b p-2 sm:w-44 sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r"
        style={{ borderColor: "rgb(var(--line) / 0.08)" }}
      >
        <p className="hidden px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-600 sm:block">
          /proc/yashas
        </p>
        {FILES.map((f) => {
          const active = f === file;
          return (
            <button
              key={f}
              onClick={() => setFile(f)}
              className="flex flex-shrink-0 items-center gap-1.5 rounded px-2 py-1.5 text-left transition-colors hover:bg-line/10"
              style={{
                background: active ? hexToRgba(PHOSPHOR, 0.12) : "transparent",
                color: active ? PHOSPHOR : "rgb(var(--zinc-400))",
              }}
            >
              <FileText className="h-3 w-3 flex-shrink-0" />
              {f}
            </button>
          );
        })}
      </nav>

      <div className="min-w-0 flex-1 overflow-x-auto p-4">
        <p className="mb-3 text-zinc-600">$ cat /proc/yashas/{file}</p>
        {CONTENT[file]()}
      </div>
    </div>
  );
}
