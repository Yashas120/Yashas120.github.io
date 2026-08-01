"use client";

import { useRef } from "react";
import Link from "next/link";
import { BookOpen, Circle, GraduationCap, ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import { MarkdownCell, CodeCell } from "@/components/notebook/Cell";
import { MarkovSimulator } from "@/components/notebook/MarkovSimulator";
import { Worksheet } from "@/components/notebook/Worksheet";
import { KaggleCard } from "@/components/notebook/KaggleCard";
import {
  ExperienceSection,
  ProjectsSection,
  PublicationsSection,
  SkillsSection,
  AwardsSection,
} from "@/components/notebook/ProfileSections";
import { LSBDemo } from "@/components/notebook/demos/LSBDemo";
import { MachBandDemo } from "@/components/notebook/demos/MachBandDemo";
import { SamplingDemo } from "@/components/notebook/demos/SamplingDemo";
import { HistEqDemo } from "@/components/notebook/demos/HistEqDemo";
import { profile } from "@/data/profile";
import { courses, teachingStats, teachingSummary } from "@/data/teaching";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#fb7185";

const demos: Record<string, React.ReactNode> = {
  lsb: <LSBDemo />,
  histeq: <HistEqDemo />,
  machband: <MachBandDemo />,
  sampling: <SamplingDemo />,
};

const nav = [
  { id: "about", label: "About" },
  { id: "teaching", label: "Teaching" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

function LabOutput({ blurb, output, lang }: Readonly<{ blurb: string; output: string; lang: string }>) {
  return (
    <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: hexToRgba(ACCENT, 0.25), background: hexToRgba(ACCENT, 0.05) }}>
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase" style={{ background: hexToRgba(ACCENT, 0.15), color: ACCENT }}>{lang}</span>
        <span className="text-xs font-medium text-zinc-300">{blurb}</span>
      </div>
      <p className="text-xs leading-relaxed text-zinc-400">{output}</p>
    </div>
  );
}

function Heading({ id, children }: Readonly<{ id: string; children: React.ReactNode }>) {
  return (
    <div id={id} className="scroll-mt-32">
      <MarkdownCell>
        <h2 className="text-base font-semibold text-zinc-100">{children}</h2>
      </MarkdownCell>
    </div>
  );
}

export default function NotebookPage() {
  const counter = useRef(0);
  const getExec = () => (counter.current += 1);

  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="min-h-screen bg-ink-900 text-zinc-300">
      <header className="sticky top-0 z-40 border-b backdrop-blur" style={{ background: "rgb(var(--ink-900) / 0.9)", borderColor: hexToRgba(ACCENT, 0.2) }}>
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-center justify-between py-3 font-mono text-sm">
            <span className="text-zinc-500">Yashas Kadambi</span>
            <span className="flex items-center gap-2 text-zinc-300">
              <BookOpen className="h-4 w-4" style={{ color: ACCENT }} /> yashas_kadambi.ipynb
            </span>
            <Link href="/notebook/gradebook" className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100">
              <GraduationCap className="h-4 w-4" /> <span className="hidden sm:inline">gradebook</span>
            </Link>
          </div>
          <div className="flex items-center justify-between border-t py-2 font-mono text-[11px]" style={{ borderColor: "rgb(var(--line) / 0.06)" }}>
            <nav className="flex gap-4 overflow-x-auto">
              {nav.map((n) => (
                <button key={n.id} onClick={() => goTo(n.id)} className="whitespace-nowrap text-zinc-400 transition-colors hover:text-zinc-100">
                  {n.label}
                </button>
              ))}
            </nav>
            <span className="flex flex-shrink-0 items-center gap-1.5 text-zinc-500">
              Python 3 <Circle className="h-2 w-2 fill-current" style={{ color: "#4ade80" }} /> idle
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-2 py-8 sm:px-4">
        <div className="overflow-hidden rounded-xl border border-line/10 bg-ink-800">
          {/* Title */}
          <MarkdownCell>
            <h1 className="text-xl font-semibold text-zinc-50"># {profile.shortName}</h1>
            <p className="mt-1 text-zinc-400">{profile.tagline}</p>
          </MarkdownCell>
          <CodeCell
            getExec={getExec}
            code={["profile"]}
            output={
              <div>
                <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                  <span className="rounded-full border border-line/10 px-3 py-1">{profile.current}</span>
                  <span className="rounded-full border border-line/10 px-3 py-1">{profile.previous}</span>
                  <span className="rounded-full border border-line/10 px-3 py-1">{profile.education}</span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-zinc-400">
                  <a href={profile.github} target="_blank" rel="noreferrer noopener" aria-label="GitHub" className="hover:text-zinc-100"><Github className="h-4 w-4" /></a>
                  <a href={profile.linkedin} target="_blank" rel="noreferrer noopener" aria-label="LinkedIn" className="hover:text-zinc-100"><Linkedin className="h-4 w-4" /></a>
                  <a href={`mailto:${profile.email}`} aria-label="Email" className="hover:text-zinc-100"><Mail className="h-4 w-4" /></a>
                </div>
              </div>
            }
          />

          {/* 1. About */}
          <Heading id="about">## 1. About</Heading>
          <CodeCell
            getExec={getExec}
            code={["about"]}
            output={
              <div className="space-y-2">
                <p className="leading-relaxed text-zinc-300">{teachingSummary}</p>
                <p className="text-zinc-400"><span style={{ color: ACCENT }}>Teaching philosophy › </span>make the abstract tactile, make it fun, and automate the tedious. I TA&apos;d three CSE courses at PES ({teachingStats.terms}).</p>
                <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                  <span className="rounded-full border border-line/15 px-3 py-1"><strong className="text-zinc-100">{teachingStats.students}</strong> students supported</span>
                  <span className="rounded-full border border-line/15 px-3 py-1"><strong className="text-zinc-100">{teachingStats.submissions}</strong> submissions graded</span>
                  <span className="rounded-full border border-line/15 px-3 py-1"><strong className="text-zinc-100">{teachingStats.courses}</strong> courses</span>
                </div>
                <ul className="space-y-1 text-zinc-400">
                  <li><span style={{ color: ACCENT }}>› Subject mastery.</span> A / A− in the exact courses I&apos;d support.</li>
                  <li><span style={{ color: ACCENT }}>› Mentorship.</span> Mentored an intern and onboarded 4 engineers at Cisco via KT sessions and code-quality standards.</li>
                  <li><span style={{ color: ACCENT }}>› Communication.</span> Labs, worksheets, forums, and a RAG QA bot to keep knowledge accessible.</li>
                </ul>
              </div>
            }
          />

          {/* 2. Education */}
          <Heading id="education">## 2. Education</Heading>
          <CodeCell
            getExec={getExec}
            code={["education"]}
            output={
              <div className="space-y-3">
                <div className="space-y-1">
                  <p><strong className="text-zinc-200">UC San Diego</strong> — M.S. Computer Science (incoming).</p>
                  <p><strong className="text-zinc-200">PES University</strong> — B.Tech in Computer Science &amp; Engineering, GPA 3.78 / 4 (officially evaluated to a U.S. B.S. in CSE).</p>
                </div>
                <Link href="/notebook/gradebook" className="group flex items-center justify-between rounded-xl border p-4 transition-colors" style={{ borderColor: hexToRgba(ACCENT, 0.3), background: hexToRgba(ACCENT, 0.06) }}>
                  <span className="flex items-center gap-3">
                    <GraduationCap className="h-6 w-6" style={{ color: ACCENT }} />
                    <span>
                      <span className="block text-sm font-medium text-zinc-100">Open the full gradebook →</span>
                      <span className="block text-xs text-zinc-400">Every PES course mapped to its UC San Diego equivalent, with U.S. grades.</span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-zinc-500 group-hover:text-zinc-200" />
                </Link>
              </div>
            }
          />

          {/* 3. Teaching Experience */}
          <Heading id="teaching">## 3. Teaching Experience</Heading>
          <CodeCell
            getExec={getExec}
            code={["teaching_demo.play()"]}
            output={
              <div>
                <p className="mb-2 text-xs text-zinc-400">A short demo of how I teach — walking through a concept the way I would in a session.</p>
                <div className="overflow-hidden rounded-lg border border-line/10">
                  <iframe
                    className="aspect-video w-full"
                    src="https://www.youtube-nocookie.com/embed/FjpIQYT_FyQ"
                    title="Yashas Kadambi — teaching demo"
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            }
          />
          {courses.map((c) => (
            <div key={c.id}>
              <MarkdownCell>
                <h3 className="text-sm font-semibold text-zinc-100">### {c.name}{c.students ? <span className="text-zinc-500"> · {c.students}</span> : null}</h3>
                <p className="mt-0.5 font-mono text-[11px] text-zinc-500">{c.code ? `${c.code} · ` : ""}{c.instructor} · {c.term}{c.level ? ` · ${c.level}` : ""}</p>
                <p className="mt-2 text-zinc-400"><span style={{ color: ACCENT }}>approach › </span>{c.approach}</p>
                {c.stats && (
                  <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px]">
                    {c.stats.map((s) => (
                      <span key={s.label} className="rounded-md border border-line/15 px-2 py-1">
                        <span className="text-zinc-500">{s.label}: </span>
                        <span className="text-zinc-200">{s.value}</span>
                      </span>
                    ))}
                  </div>
                )}
              </MarkdownCell>

              {c.labs.map((lab) => (
                <CodeCell
                  key={lab.id}
                  getExec={getExec}
                  code={[`# ${lab.title}`, ...lab.code]}
                  output={
                    demos[lab.id] ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-zinc-300">{lab.blurb}</p>
                        {demos[lab.id]}
                      </div>
                    ) : (
                      <LabOutput blurb={lab.blurb} output={lab.output} lang={lab.lang} />
                    )
                  }
                />
              ))}

              {c.id === "da" && (
                <>
                  <CodeCell getExec={getExec} code={["worksheet_5"]} output={<Worksheet />} />
                  <CodeCell getExec={getExec} code={["markov.simulate()"]} output={<MarkovSimulator />} />
                  {c.kaggle && <CodeCell getExec={getExec} code={["kaggle_leaderboard"]} output={<KaggleCard comp={c.kaggle} />} />}
                </>
              )}
            </div>
          ))}
          {/* 4. Industry Experience */}
          <Heading id="experience">## 4. Industry Experience</Heading>
          <CodeCell getExec={getExec} code={["experience"]} output={<ExperienceSection exclude={["ucsd", "pes-ta"]} />} />

          {/* 5. Projects */}
          <Heading id="projects">## 5. Projects</Heading>
          <CodeCell getExec={getExec} code={["projects"]} output={<ProjectsSection />} />

          {/* 6. Publications */}
          <Heading id="publications">## 6. Publications</Heading>
          <CodeCell getExec={getExec} code={["publications"]} output={<PublicationsSection />} />

          {/* 7. Skills */}
          <Heading id="skills">## 7. Skills</Heading>
          <CodeCell getExec={getExec} code={["skills"]} output={<SkillsSection />} />

          {/* 8. Awards */}
          <Heading id="awards">## 8. Awards &amp; Highlights</Heading>
          <CodeCell getExec={getExec} code={["awards"]} output={<AwardsSection />} />

          {/* 9. Contact */}
          <Heading id="contact">## 9. Contact / Office Hours</Heading>
          <CodeCell
            getExec={getExec}
            code={["contact"]}
            output={
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                <a href={`mailto:${profile.email}`} className="rounded border border-line/10 px-2.5 py-1.5 text-zinc-200 hover:border-line/30">{profile.email}</a>
                <a href={profile.github} target="_blank" rel="noreferrer noopener" className="rounded border border-line/10 px-2.5 py-1.5 text-zinc-200 hover:border-line/30">@{profile.githubUser}</a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer noopener" className="rounded border border-line/10 px-2.5 py-1.5 text-zinc-200 hover:border-line/30">linkedin</a>
              </div>
            }
          />
        </div>
      </div>
    </main>
  );
}
