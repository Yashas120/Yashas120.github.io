"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import type { FDECaseStudy } from "@/data/fde";
import { hexToRgba } from "@/lib/utils";
import { AttributionTags } from "./Tags";
import { ACCENT, GREEN, VIOLET } from "./palette";

function Field({ label, children, color = ACCENT }: { label: string; children: React.ReactNode; color?: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color }}>
        {label}
      </dt>
      <dd className="mt-1 text-[13px] leading-relaxed text-zinc-300">{children}</dd>
    </div>
  );
}

function Bullets({ items, color }: { items: string[]; color: string }) {
  return (
    <ul className="space-y-1">
      {items.map((c) => (
        <li key={c} className="flex gap-2">
          <span aria-hidden style={{ color }}>
            ·
          </span>
          <span>{c}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * One case study answered against the same questions every time: who had the
 * problem, what made it hard, what was personally built, how it reached people,
 * what changed, and what stayed reusable afterwards.
 */
export function CaseStudyCard({ study, dense = false }: { study: FDECaseStudy; dense?: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      className="overflow-hidden rounded-xl border border-line/10 bg-ink-800"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/10 px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-zinc-300">{study.role}</p>
          <p className="font-mono text-[10px] text-zinc-600">{study.period}</p>
        </div>
        <AttributionTags ownership={study.ownership} status={study.status} />
      </div>

      <dl className={`grid gap-4 p-4 ${dense ? "" : "sm:grid-cols-2"}`}>
        <Field label="Who had the problem" color={VIOLET}>
          {study.users}
        </Field>
        <Field label="The workflow, before any software" color={VIOLET}>
          {study.problem}
        </Field>
        <Field label="What made it difficult" color={VIOLET}>
          <Bullets items={study.constraints} color={VIOLET} />
        </Field>
        <Field label="Discovery">{study.discovery}</Field>
        <Field label="What I personally built or changed">
          <Bullets items={study.contribution} color={ACCENT} />
        </Field>
        <Field label="How it was deployed">{study.deployment}</Field>
        <Field label="Adoption" color={GREEN}>
          {study.adoption}
        </Field>
        <Field label="Measured outcome" color={GREEN}>
          {study.outcome}
        </Field>
        {study.reusableLeverage && (
          <Field label="What became reusable" color={GREEN}>
            <Bullets items={study.reusableLeverage} color={GREEN} />
          </Field>
        )}
      </dl>

      {study.architecture && (
        <div className="border-t border-line/10 px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">Architecture</p>
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {study.architecture.map((a, i) => (
              <span key={a} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3 text-zinc-600" aria-hidden />}
                <span
                  className="rounded-md border px-2 py-1 font-mono text-[10px]"
                  style={{ borderColor: hexToRgba(ACCENT, 0.28), background: hexToRgba(ACCENT, 0.06), color: ACCENT }}
                >
                  {a}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {study.evidenceLinks && study.evidenceLinks.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-line/10 px-4 py-3">
          {study.evidenceLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 rounded-md border border-line/10 px-2.5 py-1 font-mono text-[10px] text-zinc-300 transition-colors hover:border-line/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: ACCENT }}
            >
              {l.label} <ArrowUpRight className="h-3 w-3" />
            </a>
          ))}
        </div>
      )}
    </motion.article>
  );
}
