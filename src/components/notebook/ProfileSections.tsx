"use client";

import { Github, ArrowUpRight, BookMarked, Award as AwardIcon } from "lucide-react";
import { experience } from "@/data/experience";
import { projects } from "@/data/projects";
import { publications } from "@/data/publications";
import { skills } from "@/data/skills";
import { highlights } from "@/data/highlights";

const ACCENT = "#fb7185";

const topics: Record<string, string> = {
  "ghost-scheduler": "Operating Systems · Computer Architecture",
  "spark-cifar10": "Distributed Systems · Big Data · ML",
  "multiview-3d": "Computer Vision · Image Processing",
  swift: "Deep Learning · Computer Vision",
  "bitcoin-java": "Cryptography · Security · Data Structures",
  "voice-assistant": "NLP · Applied ML",
  "cloud-hack": "Cloud · DevOps · Distributed Systems",
  petra: "Web Development",
};

export function ExperienceSection({ exclude = [], pinLast = [] }: { exclude?: string[]; pinLast?: string[] }) {
  const items = experience
    .filter((e) => !exclude.includes(e.id))
    .sort((a, b) => Number(pinLast.includes(a.id)) - Number(pinLast.includes(b.id)));
  return (
    <div className="space-y-3">
      {items.map((e) => (
        <div key={e.id} className="rounded-lg border border-line/5 bg-ink-900 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="text-sm font-medium text-zinc-100">
              {e.role} <span className="text-zinc-500">· {e.org}</span>
            </p>
            <span className="font-mono text-[11px] text-zinc-500">{e.start} – {e.end}</span>
          </div>
          <ul className="mt-2 space-y-1">
            {e.points.map((p, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed text-zinc-400">
                <span style={{ color: ACCENT }}>›</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function ProjectsSection() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {projects.map((p) => (
        <div key={p.id} className="flex flex-col rounded-lg border border-line/5 bg-ink-900 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-zinc-100">{p.title}</p>
            {p.repoUrl && (
              <a href={p.repoUrl} target="_blank" rel="noreferrer noopener" aria-label="repo" className="flex-shrink-0 text-zinc-500 hover:text-zinc-200">
                <Github className="h-4 w-4" />
              </a>
            )}
          </div>
          <p className="mt-1 flex-1 text-xs leading-relaxed text-zinc-400">{p.blurb}</p>
          {topics[p.id] && (
            <p className="mt-2 font-mono text-[10px]" style={{ color: ACCENT }}>topics: {topics[p.id]}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            {p.tech.slice(0, 4).map((t) => (
              <span key={t} className="rounded border border-line/10 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">{t}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PublicationsSection() {
  return (
    <div className="space-y-3">
      {publications.map((pub) => (
        <div key={pub.id} className="rounded-lg border border-line/5 bg-ink-900 p-4">
          <div className="flex items-start gap-2">
            <BookMarked className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: ACCENT }} />
            <div>
              <p className="text-sm font-medium leading-snug text-zinc-100">{pub.title}</p>
              <p className="mt-0.5 font-mono text-[11px] text-zinc-500">{pub.venue} · {pub.year}</p>
              <ul className="mt-1.5 space-y-1">
                {pub.points.map((pt, i) => (
                  <li key={i} className="text-xs leading-relaxed text-zinc-400">• {pt}</li>
                ))}
              </ul>
              <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noreferrer noopener" className="mt-1.5 inline-flex items-center gap-1 font-mono text-[10px]" style={{ color: "#7dd3fc" }}>
                doi:{pub.doi} <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkillsSection() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {skills.map((s) => (
        <div key={s.category} className="rounded-lg border border-line/5 bg-ink-900 p-4">
          <p className="mb-2 font-mono text-[11px] font-semibold" style={{ color: ACCENT }}>{s.category}</p>
          <div className="flex flex-wrap gap-1.5">
            {s.items.map((it) => (
              <span key={it} className="rounded border border-line/10 px-2 py-0.5 font-mono text-[10px] text-zinc-400">{it}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AwardsSection() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {highlights.map((h) => (
        <div key={h.id} className="flex items-start gap-2 rounded-lg border border-line/5 bg-ink-900 p-4">
          <AwardIcon className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: ACCENT }} />
          <div>
            <p className="text-sm font-medium text-zinc-100">{h.label}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">{h.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
