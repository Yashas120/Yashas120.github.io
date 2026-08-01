"use client";

import { useRef, useState } from "react";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { skills } from "@/data/skills";
import { highlights } from "@/data/highlights";

const ACCENT = "#f59e0b";

type Line = { input: string; output: string[]; isError?: boolean };

const banner = [
  "// Yashas.js — interactive console",
  "// try: whoami, projects(), skills(), highlights(), contact(), help()",
];

export function ConsolePanel() {
  const [lines, setLines] = useState<Line[]>([]);
  const ref = useRef<HTMLInputElement>(null);

  const evalCmd = (raw: string): { output: string[]; isError?: boolean } => {
    const cmd = raw.trim().replace(/\(\)$/, "");
    switch (cmd) {
      case "help":
        return { output: ["whoami · projects · skills · highlights · contact · clear"] };
      case "whoami":
        return { output: [`"${profile.name}"`, `"${profile.tagline}"`] };
      case "projects":
        return { output: projects.map((p) => `• ${p.title}${p.repoUrl ? "  → " + p.repoUrl.replace("https://github.com/", "") : ""}`) };
      case "skills":
        return { output: skills.map((s) => `${s.category}: ${s.items.join(", ")}`) };
      case "highlights":
        return { output: highlights.map((h) => `★ ${h.label} — ${h.detail}`) };
      case "contact":
        return { output: [`{ email: "${profile.email}", github: "${profile.github}", linkedin: "${profile.linkedin}" }`] };
      case "clear":
        setLines([]);
        return { output: [] };
      case "":
        return { output: [] };
      default:
        return { output: [`Uncaught ReferenceError: ${cmd} is not defined`], isError: true };
    }
  };

  const submit = (v: string) => {
    if (v.trim() === "clear") {
      evalCmd(v);
      return;
    }
    const { output, isError } = evalCmd(v);
    setLines((l) => [...l, { input: v, output, isError }]);
  };

  return (
    <div className="p-3 font-mono text-[12px] leading-relaxed" onClick={() => ref.current?.focus()}>
      {banner.map((b, i) => (
        <p key={i} className="text-zinc-500">{b}</p>
      ))}
      {lines.map((l, i) => (
        <div key={i} className="mt-1">
          <p className="flex gap-2">
            <span style={{ color: ACCENT }}>›</span>
            <span className="text-zinc-200">{l.input}</span>
          </p>
          {l.output.map((o, j) => (
            <p key={j} className="whitespace-pre-wrap pl-4" style={{ color: l.isError ? "#f87171" : "#a3e635" }}>
              {o}
            </p>
          ))}
        </div>
      ))}
      <div className="mt-1 flex items-center gap-2">
        <span style={{ color: ACCENT }}>›</span>
        <input
          ref={ref}
          aria-label="console input"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 bg-transparent text-zinc-100 outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              submit((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = "";
            }
          }}
        />
      </div>
    </div>
  );
}
