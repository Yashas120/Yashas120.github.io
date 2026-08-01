"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, ShieldCheck, Award } from "lucide-react";
import { equivGroups, transcriptSummary, CourseEquiv } from "@/data/coursework";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#fb7185";

function gradeColor(gpa: number) {
  if (gpa >= 4) return "#4ade80"; // A
  if (gpa >= 3.67) return "#22d3ee"; // A-
  if (gpa >= 3.33) return "#a78bfa"; // B+
  return "#fbbf24";
}

function Row({ r, i }: { r: CourseEquiv; i: number }) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(i * 0.03, 0.3) }}
      className="border-b transition-colors hover:bg-line/[0.03]"
      style={{ borderColor: "rgb(var(--line) / 0.05)" }}
    >
      <td className="px-3 py-3 align-top sm:px-4">
        <span className="text-sm text-zinc-200">{r.pes}</span>
        {r.taught && (
          <span className="ml-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 align-middle font-mono text-[9px]" style={{ background: hexToRgba(ACCENT, 0.15), color: ACCENT }}>
            <GraduationCap className="h-2.5 w-2.5" /> I TA&apos;d this
          </span>
        )}
      </td>
      <td className="px-3 py-3 align-top sm:px-4">
        <span className="font-mono text-xs font-semibold" style={{ color: "#7dd3fc" }}>
          {r.ucsd}{r.approx ? " ≈" : ""}
        </span>
        <span className="mt-0.5 block text-xs text-zinc-500">{r.ucsdTitle}</span>
      </td>
      <td className="px-3 py-3 text-right align-top sm:px-4">
        <span className="font-mono text-sm font-semibold" style={{ color: gradeColor(r.gpa) }}>{r.grade}</span>
        <span className="ml-1 font-mono text-[10px] text-zinc-500">{r.gpa.toFixed(2)}</span>
      </td>
    </motion.tr>
  );
}

export default function GradebookPage() {
  return (
    <main className="min-h-screen bg-ink-900 text-zinc-300">
      <header className="sticky top-0 z-40 border-b backdrop-blur" style={{ background: "rgb(var(--ink-900) / 0.85)", borderColor: hexToRgba(ACCENT, 0.2) }}>
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3 font-mono text-sm">
          <Link href="/notebook" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="h-4 w-4" /> notebook
          </Link>
          <span className="flex items-center gap-2 text-zinc-300">
            <GraduationCap className="h-4 w-4" style={{ color: ACCENT }} /> gradebook
          </span>
          <span className="font-mono text-zinc-500">Yashas Kadambi</span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold text-zinc-50 sm:text-3xl">Gradebook — PES → UC San Diego</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          My PES University transcript, officially evaluated on the U.S. 4.0 scale and mapped to the closest UC San Diego course. UCSD titles are from the current{" "}
          <a href="https://catalog.ucsd.edu/courses/CSE.html" target="_blank" rel="noreferrer noopener" className="underline" style={{ color: "#7dd3fc" }}>CSE catalog</a>.
        </p>

        {/* summary */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-line/10 bg-ink-800 p-4">
            <p className="font-mono text-2xl font-semibold" style={{ color: "#4ade80" }}>{transcriptSummary.usGpa}</p>
            <p className="mt-1 text-[11px] text-zinc-400">U.S. GPA (4.0 scale)</p>
          </div>
          <div className="rounded-xl border border-line/10 bg-ink-800 p-4">
            <p className="font-mono text-2xl font-semibold text-zinc-100">{transcriptSummary.credits}</p>
            <p className="mt-1 text-[11px] text-zinc-400">U.S. semester credits</p>
          </div>
          <div className="col-span-2 rounded-xl border border-line/10 bg-ink-800 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-zinc-100"><Award className="h-4 w-4" style={{ color: ACCENT }} /> {transcriptSummary.equivalency}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500"><ShieldCheck className="h-3 w-3" style={{ color: "#4ade80" }} /> {transcriptSummary.verifiedBy}</p>
          </div>
        </div>

        {/* tables */}
        <div className="mt-8 space-y-8">
          {equivGroups.map((g) => (
            <section key={g.group}>
              <h2 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider" style={{ color: ACCENT }}>{g.group}</h2>
              <div className="overflow-hidden rounded-xl border border-line/10 bg-ink-800">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b font-mono text-[11px] uppercase text-zinc-500" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>
                      <th className="px-3 py-2 font-normal sm:px-4">PES University course</th>
                      <th className="px-3 py-2 font-normal sm:px-4">UC San Diego equivalent</th>
                      <th className="px-3 py-2 text-right font-normal sm:px-4">Grade (U.S.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((r, i) => (
                      <Row key={r.pes} r={r} i={i} />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-line/10 bg-ink-800 p-4 font-mono text-[11px] leading-relaxed text-zinc-500">
          <p>Grade scale: {transcriptSummary.scale}</p>
          <p className="mt-1">
            Source: official Course Analysis by {transcriptSummary.verifiedBy}, TEC No. {transcriptSummary.tecNo}, for {transcriptSummary.institution}.
            <span className="ml-1 text-zinc-600">≈ marks the closest UCSD analogue where there is no exact 1:1 course. Evaluation is advisory.</span>
          </p>
        </div>
      </div>
    </main>
  );
}
