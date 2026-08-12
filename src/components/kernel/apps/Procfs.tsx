"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { kernelPortfolio, workLabels } from "@/data/kernelPortfolio";
import { profile } from "@/data/profile";
import { kernelProjects as projects } from "@/data/projects";
import { skills } from "@/data/skills";
import { hexToRgba } from "@/lib/utils";
import { PHOSPHOR } from "../desktop/types";

const FILES = ["status", "capabilities", "evidence", "contact", "about"] as const;
type FileName = (typeof FILES)[number];

function Row({ label, value }: Readonly<{ label: string; value: React.ReactNode }>) {
  return <p className="flex flex-wrap gap-x-2"><span className="w-28 flex-shrink-0 text-zinc-500">{label}:</span><span className="min-w-0 flex-1 text-zinc-300">{value}</span></p>;
}

function Status() {
  return (
    <div className="space-y-1">
      <Row label="Name" value={profile.name} />
      <Row label="Role" value={<span style={{ color: PHOSPHOR }}>{profile.role}</span>} />
      <Row label="Current" value={profile.current} />
      <Row label="Previous" value={profile.previous} />
      <Row label="Education" value={profile.education} />
      <Row label="Location" value={profile.location} />
      <Row label="Handle" value={`@${profile.githubUser}`} />
      <p className="mt-3 border-t pt-3 font-sans text-[12px] leading-relaxed text-zinc-400" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>{kernelPortfolio.introduction}</p>
    </div>
  );
}

function Capabilities() {
  return (
    <div className="space-y-3">
      {skills.map((group) => (
        <section key={group.category}>
          <h3 className="text-zinc-500">[{group.category.toLowerCase()}]</h3>
          <p className="mt-1 leading-relaxed text-zinc-300">{group.items.join(" · ")}</p>
        </section>
      ))}
      <p className="border-t pt-3 font-sans text-[12px] text-zinc-500" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>Capabilities are mapped to visible work in the Overview; no percentage scores are used.</p>
    </div>
  );
}

function Evidence() {
  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <div key={project.id} className="border-b pb-2" style={{ borderColor: "rgb(var(--line) / 0.06)" }}>
          <p className="text-zinc-200">{project.title}</p>
          <p className="text-[10px] text-zinc-500">{workLabels.context[project.context]} · {workLabels.ownership[project.ownership]} · {workLabels.status[project.status]}</p>
        </div>
      ))}
    </div>
  );
}

function Contact() {
  return <div className="space-y-1"><Row label="Email" value={profile.email} /><Row label="GitHub" value={profile.github} /><Row label="LinkedIn" value={profile.linkedin} /></div>;
}

const CONTENT: Record<FileName, () => React.ReactNode> = {
  status: Status,
  capabilities: Capabilities,
  evidence: Evidence,
  contact: Contact,
  about: () => <div className="space-y-3"><p className="leading-relaxed text-zinc-300">yashOS is an optional interactive portfolio interface. It is not a production operating system and does not display simulated machine telemetry.</p><Link href="/kernel" className="inline-flex min-h-11 items-center" style={{ color: PHOSPHOR }}>Open complete Portfolio Overview →</Link></div>,
};

export function Procfs() {
  const [file, setFile] = useState<FileName>("status");
  return (
    <div className="flex min-h-full flex-col font-mono text-[11.5px] sm:flex-row">
      <nav aria-label="Profile files" className="no-scrollbar flex flex-shrink-0 gap-1 overflow-x-auto border-b p-2 sm:w-44 sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>
        <p className="hidden px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-600 sm:block">/proc/yashas</p>
        {FILES.map((item) => {
          const selected = item === file;
          return (
            <button key={item} onClick={() => setFile(item)} className="flex min-h-11 flex-shrink-0 items-center gap-1.5 rounded px-2 py-1.5 text-left transition-colors hover:bg-line/10" style={{ background: selected ? hexToRgba(PHOSPHOR, 0.12) : "transparent", color: selected ? PHOSPHOR : "rgb(var(--zinc-400))" }}>
              <FileText className="h-3 w-3 flex-shrink-0" />{item}
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
