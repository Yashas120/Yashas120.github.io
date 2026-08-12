"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Database,
  Github,
  Inbox,
  Linkedin,
  Mail,
  Radio,
  Server,
} from "lucide-react";
import { BlueprintBackground } from "@/components/shared/BlueprintBackground";
import { DiffCards } from "@/components/shared/DiffCards";
import { FlowPath, type FlowNode } from "@/components/shared/FlowPath";
import { GroundedConsole } from "@/components/shared/GroundedConsole";
import { MetricConverge, type ConvergingMetric } from "@/components/shared/MetricConverge";
import { Section } from "@/components/shared/Section";
import { AirGapRollout } from "@/components/fde/AirGapRollout";
import { CaseStudyCard } from "@/components/fde/CaseStudyCard";
import { DeliveryLoop } from "@/components/fde/DeliveryLoop";
import { DependencyPlan } from "@/components/fde/DependencyPlan";
import { LayerTrace } from "@/components/fde/LayerTrace";
import { TrafficDiscovery } from "@/components/fde/TrafficDiscovery";
import { WorkflowToTool } from "@/components/fde/WorkflowToTool";
import { ACCENT, GREEN, VIOLET } from "@/components/fde/palette";
import { AttributionTags, Tag } from "@/components/fde/Tags";
import {
  capabilities,
  closing,
  communication,
  constrainedCases,
  constrainedTheme,
  crossRegion,
  debugging,
  debuggingSignals,
  discovery,
  discoveryFacts,
  discoveryScale,
  discoverySignals,
  education,
  fdeContact,
  fdeProjects,
  flagship,
  flagshipNotes,
  hero,
  leverage,
  leverageDiffs,
  loopStages,
  prototypes,
  ragDemo,
  reliabilityInset,
  sequencing,
  sequencingFacts,
  sequencingScope,
} from "@/data/fde";
import { profile } from "@/data/profile";
import { disclose, discloseFacts, type DisclosedFacts } from "@/lib/disclosure";
import { hexToRgba } from "@/lib/utils";

const CROSS_REGION_NODES: FlowNode[] = [
  { id: "ddb", label: "DynamoDB", icon: Database, detail: "A record is inserted in one region. That insert is what starts the workflow." },
  { id: "sns", label: "SNS", icon: Radio, detail: "The insert publishes to a topic, so regions subscribe rather than being called directly." },
  { id: "sqs", label: "regional SQS", icon: Inbox, detail: "Each region has its own queue, so consumers pick the event up in their own region." },
  { id: "svc", label: "services", icon: Server, detail: "Region-specific services consume the event and carry out the regional work." },
  { id: "sql", label: "SQL databases", icon: Boxes, detail: "The related SQL databases are synchronized as a result of that consumption." },
];

const OUTCOME_METRICS: ConvergingMetric[] = [
  {
    label: "deployment window",
    unit: "%",
    before: 100,
    after: 48,
    delta: "~-50%",
    context: "Independent work made concurrent while prerequisite-bound stages stayed gated.",
  },
  {
    label: "SDK update, per SDK",
    unit: "h",
    before: 4,
    after: 0,
    delta: "→ automated",
    context: "Regenerated and published whenever a downstream contract changed.",
  },
  {
    label: "hardware-independent build cycle",
    unit: "s",
    before: 1800,
    after: 10,
    delta: "~30m → ~10s",
    context: "White-box framework compiling production sources against stubbed SDK boundaries.",
  },
];

/** Renders an exact-figure grid only when disclosure review has cleared it. */
function Facts({ facts, color = ACCENT }: { facts: DisclosedFacts; color?: string }) {
  const cleared = discloseFacts(facts);
  if (!cleared) return null;
  return (
    <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {cleared.map((f) => (
        <div key={f.label} className="rounded-lg border border-line/10 bg-ink-800 px-3 py-2">
          <dt className="font-mono text-[10px] leading-snug text-zinc-500">{f.label}</dt>
          <dd className="mt-0.5 font-mono text-sm font-semibold" style={{ color }}>
            {f.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function SignalList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-xl border border-line/10 bg-ink-800 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">{title}</p>
      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {items.map((s) => (
          <li key={s} className="flex gap-2 text-[13px] leading-relaxed text-zinc-300">
            <ArrowRight className="mt-1 h-3 w-3 flex-shrink-0" style={{ color: ACCENT }} aria-hidden />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FdePage() {
  return (
    <>
      <BlueprintBackground
        accent={ACCENT}
        secondary={GREEN}
        strip={{
          left: "unclear problem",
          center: "discover → model → build → deploy → learn → codify",
          right: "adopted system",
        }}
        left={[
          "brief   = vague",
          "signals = workflow",
          "          users",
          "          constraints",
          "          data",
          "scope   = resolve()",
          "build   = app + data",
          "          + infra",
          "deploy  = as-is env",
          "learn   = adoption",
          "codify  = playbook",
        ]}
        right={[
          "2 days → 2 hours",
          "~35 users",
          "~30 integrations",
          "12 teams",
          "~50% faster deploys",
          "4 codebases traced",
          "~50 air-gapped envs",
          "4h per SDK → auto",
        ]}
      />

      <a
        href="#workflow-first"
        className="skip-link rounded-br-lg px-4 py-2 text-sm font-medium"
        style={{ background: ACCENT, color: "#0b0d12" }}
      >
        Skip to the case studies
      </a>

      <main className="relative min-h-screen text-zinc-300">
        <div className="relative z-10">
          <header
            className="sticky top-0 z-40 border-b backdrop-blur"
            style={{ background: "rgb(var(--ink-900) / 0.72)", borderColor: hexToRgba(ACCENT, 0.2) }}
          >
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-3 font-mono text-sm">
              <span className="text-zinc-500">{profile.shortName}</span>
              <span className="hidden sm:inline" style={{ color: ACCENT }}>
                forward deployed engineering
              </span>
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: GREEN }} /> problem → adopted system
              </span>
            </div>
          </header>

          {/* ------------------------------------------------------------ hero */}
          <section className="mx-auto max-w-5xl px-6 pb-6 pt-10">
            <p className="font-mono text-[11px] tracking-[0.16em]" style={{ color: ACCENT }}>
              {hero.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">{hero.name}</h1>
            <p className="mt-3 max-w-3xl text-xl font-medium leading-snug text-zinc-100 sm:text-2xl">{hero.statement}</p>
            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-zinc-400">{hero.supporting}</p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-500">{hero.context}</p>

            <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {hero.evidence.map((e) => (
                <li
                  key={e.value}
                  className="rounded-lg border px-3 py-2"
                  style={{ borderColor: hexToRgba(ACCENT, 0.28), background: hexToRgba(ACCENT, 0.06) }}
                >
                  <p className="font-mono text-[13px] font-semibold leading-tight" style={{ color: ACCENT }}>
                    {e.value}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-zinc-500">{e.note}</p>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <a
                href={hero.primaryAction.href}
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-sm transition-colors hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ borderColor: ACCENT, color: ACCENT, background: hexToRgba(ACCENT, 0.1), outlineColor: ACCENT }}
              >
                {hero.primaryAction.label} <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-lg border border-line/12 px-3 py-2 font-mono text-sm text-zinc-300 transition-colors hover:border-line/30"
              >
                <Github className="h-4 w-4" /> GitHub
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-lg border border-line/12 px-3 py-2 font-mono text-sm text-zinc-300 transition-colors hover:border-line/30"
              >
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
              <a
                href={`mailto:${fdeContact.email}`}
                className="inline-flex items-center gap-2 rounded-lg border border-line/12 px-3 py-2 font-mono text-sm text-zinc-300 transition-colors hover:border-line/30"
              >
                <Mail className="h-4 w-4" /> Email
              </a>
            </div>

            <ol className="mt-7 flex flex-wrap gap-1.5">
              {loopStages.map((s, i) => (
                <li key={s.id} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-zinc-700" aria-hidden>→</span>}
                  <span
                    className="rounded-md border px-2.5 py-1 font-mono text-[10px]"
                    style={{ borderColor: hexToRgba(ACCENT, 0.25), background: hexToRgba(ACCENT, 0.05), color: ACCENT }}
                    title={s.note}
                  >
                    {s.label}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-4">
              <DeliveryLoop />
            </div>
          </section>

          {/* --------------------------------------------------------- chapter 1 */}
          <Section
            id="workflow-first"
            tag="chapter 01 · discover → codify"
            title={flagship.title}
            accent={ACCENT}
            lede={
              <>
                {flagshipNotes.whyItLeads} <span className="text-zinc-500">{flagshipNotes.deliverySpeed}</span>
              </>
            }
          >
            <div className="space-y-4">
              <WorkflowToTool />
              <CaseStudyCard study={flagship} />
              <p className="text-[12px] leading-relaxed text-zinc-500">{flagshipNotes.architectureCaption}</p>
            </div>
          </Section>

          {/* --------------------------------------------------------- chapter 2 */}
          <Section
            tag="chapter 02 · discover"
            title={discovery.title}
            accent={ACCENT}
            lede={discovery.problem}
          >
            <div className="space-y-4">
              <TrafficDiscovery />
              <div className="rounded-xl border border-line/10 bg-ink-800 p-4">
                {disclose(discoveryScale).map((line) => (
                  <p key={line} className="text-[13px] leading-relaxed text-zinc-300">
                    {line}
                  </p>
                ))}
                <Facts facts={discoveryFacts} />
              </div>
              <SignalList items={discoverySignals} title="What this required" />
              <CaseStudyCard study={discovery} />
            </div>
          </Section>

          {/* --------------------------------------------------------- chapter 3 */}
          <Section
            tag="chapter 03 · model → deploy"
            title={sequencing.title}
            accent={ACCENT}
            lede={
              <>
                Built and maintained reusable Terraform components across EC2, ECS, Lambda, RDS, DynamoDB, SQS, SNS, and
                IAM while becoming a technical contact for shared infrastructure, networking, cross-region communication,
                and dependency ordering.
              </>
            }
          >
            <div className="space-y-4">
              <DependencyPlan />
              <div className="rounded-xl border border-line/10 bg-ink-800 p-4">
                <p className="text-[13px] leading-relaxed text-zinc-300">{sequencingScope}</p>
                <Facts facts={sequencingFacts} />
              </div>
              <div className="rounded-xl border border-line/10 bg-ink-800 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                    Technical depth · asynchronous cross-region workflow
                  </p>
                  <Tag color={VIOLET}>supporting contribution</Tag>
                </div>
                <p className="text-[13px] leading-relaxed text-zinc-300">{crossRegion.copy}</p>
                <div className="mt-3">
                  <FlowPath
                    nodes={CROSS_REGION_NODES}
                    accent={ACCENT}
                    pulse={GREEN}
                    minWidth={560}
                    header={{ left: "event path · select a hop", right: crossRegion.chain.join(" → ") }}
                    footer={crossRegion.caution}
                  />
                </div>
              </div>
              <CaseStudyCard study={sequencing} />
            </div>
          </Section>

          {/* --------------------------------------------------------- chapter 4 */}
          <Section
            tag="chapter 04 · diagnose"
            title={debugging.title}
            accent={ACCENT}
            lede={debugging.problem}
          >
            <div className="space-y-4">
              <LayerTrace />
              <SignalList items={debuggingSignals} title="What this required" />
              <CaseStudyCard study={debugging} />

              <div className="rounded-xl border border-line/10 bg-ink-800 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">{reliabilityInset.title}</p>
                  <Tag color={VIOLET}>collaborative</Tag>
                </div>
                <p className="text-[13px] leading-relaxed text-zinc-300">{reliabilityInset.copy}</p>
              </div>
            </div>
          </Section>

          {/* --------------------------------------------------------- chapter 5 */}
          <Section
            tag="chapter 05 · deploy"
            title="Meet the environment where it is"
            accent={ACCENT}
            lede={constrainedTheme}
          >
            <div className="space-y-4">
              <AirGapRollout />

              {constrainedCases
                .filter((c) => c.weight === "primary")
                .map((c) => (
                  <div key={c.id} className="rounded-xl border border-line/10 bg-ink-800 p-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-zinc-100">{c.title}</h3>
                      <Tag color={VIOLET}>{c.ownership === "individual" ? "individually owned" : "collaborative"}</Tag>
                    </div>
                    <p className="font-mono text-[10px] text-zinc-600">{c.environment}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-zinc-300">{c.copy}</p>
                  </div>
                ))}

              <div className="grid gap-4 lg:grid-cols-2">
                {constrainedCases
                  .filter((c) => c.weight === "supporting")
                  .map((c) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="rounded-xl border border-line/10 bg-ink-800 p-4"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-zinc-100">{c.title}</h3>
                        <Tag color={ACCENT}>{c.ownership === "individual" ? "individually owned" : "collaborative"}</Tag>
                      </div>
                      <p className="font-mono text-[10px] text-zinc-600">{c.environment}</p>
                      <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">{c.copy}</p>
                    </motion.div>
                  ))}
              </div>
            </div>
          </Section>

          {/* --------------------------------------------------------- chapter 6 */}
          <Section
            tag="chapter 06 · prototype"
            title="Prototype quickly. Label the limits honestly."
            accent={ACCENT}
            lede={
              <>
                A prototype earns its keep by settling a question. Calling one a production system is how a delivery
                promise turns into a problem, so each of these carries what it actually was.
              </>
            }
          >
            <div className="space-y-4">
              {prototypes.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  className="rounded-xl border border-line/10 bg-ink-800 p-4"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-zinc-100">{p.title}</h3>
                    <AttributionTags ownership={p.ownership} status={p.status} />
                  </div>
                  <p className="font-mono text-[10px]" style={{ color: p.status === "proof-of-concept" ? VIOLET : GREEN }}>
                    {p.label}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-zinc-300">{p.copy}</p>
                  {p.extra &&
                    disclose(p.extra).map((line) => (
                      <p key={line} className="mt-1.5 text-[12px] leading-relaxed text-zinc-500">
                        {line}
                      </p>
                    ))}

                  {p.demonstrated && (
                    <>
                      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                        What it demonstrated
                      </p>
                      <ul className="mt-1.5 grid gap-1 sm:grid-cols-2">
                        {p.demonstrated.map((d) => (
                          <li key={d} className="flex gap-2 text-[12px] leading-relaxed text-zinc-400">
                            <span aria-hidden style={{ color: VIOLET }}>
                              ·
                            </span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {p.limits && (
                    <p
                      className="mt-3 rounded-md border px-3 py-2 text-[12px] leading-relaxed text-zinc-300"
                      style={{ borderColor: hexToRgba(VIOLET, 0.3), background: hexToRgba(VIOLET, 0.06) }}
                    >
                      {p.limits}
                    </p>
                  )}

                  {p.id === "rag-assistant" && (
                    <div className="mt-3">
                      <GroundedConsole
                        entries={ragDemo.entries}
                        fallback={ragDemo.fallback}
                        accent={ACCENT}
                        good={GREEN}
                        warn={VIOLET}
                        unit="sources"
                        header={ragDemo.header}
                        footer={ragDemo.footer}
                        placeholder={ragDemo.placeholder}
                        inputLabel={ragDemo.inputLabel}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </Section>

          {/* --------------------------------------------------------- chapter 7 */}
          <Section
            tag="chapter 07 · codify"
            title="The first delivery solves one problem. The reusable path solves the next ten."
            accent={ACCENT}
            lede={
              <>
                The work that lasted longest was rarely the first fix. It was the module, pipeline, script or guide that
                made the second, third and tenth delivery cheaper than the first.
              </>
            }
          >
            <div className="space-y-4">
              <DiffCards
                entries={leverageDiffs}
                accent={ACCENT}
                labels={{ before: "--- solved once, by hand", after: "+++ turned into a reusable path" }}
              />

              <div className="grid gap-4 lg:grid-cols-2">
                {leverage.map((l, i) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-xl border border-line/10 bg-ink-800 p-4"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-zinc-100">{l.title}</h3>
                      <Tag color={l.ownership === "individual" ? ACCENT : VIOLET}>
                        {l.ownership === "individual" ? "individually owned" : "collaborative"}
                      </Tag>
                    </div>
                    <p className="text-[13px] leading-relaxed text-zinc-300">{l.copy}</p>
                    {l.note && (
                      <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: GREEN }}>
                        {l.note}
                      </p>
                    )}
                    {l.link && (
                      <a
                        href={l.link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mt-2.5 inline-flex items-center gap-1 rounded-md border border-line/10 px-2.5 py-1 font-mono text-[10px] text-zinc-300 transition-colors hover:border-line/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{ outlineColor: ACCENT }}
                      >
                        {l.link.label} <ArrowUpRight className="h-3 w-3" />
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>

              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                  What the reusable path was worth, measured
                </p>
                <MetricConverge
                  metrics={OUTCOME_METRICS}
                  accent={ACCENT}
                  good={GREEN}
                  columnsClass="lg:grid-cols-3"
                  header={{ left: "before → after", right: "dashed = before · solid = after" }}
                />
              </div>
            </div>
          </Section>

          {/* ---------------------------------------------------------- projects */}
          <Section
            tag="projects"
            title="Selected projects"
            accent={ACCENT}
            lede="Chosen for what they show about delivery, not for repository count. Ownership is labelled on each."
          >
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-3">
                {fdeProjects
                  .filter((p) => p.featured)
                  .map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex flex-col rounded-xl border border-line/10 bg-ink-800 p-4"
                    >
                      <h3 className="text-sm font-semibold text-zinc-100">{p.title}</h3>
                      <p className="mt-1 font-mono text-[10px]" style={{ color: VIOLET }}>
                        {p.label}
                      </p>
                      <p className="mt-2 text-[13px] leading-relaxed text-zinc-300">{p.copy}</p>
                      {p.evidence && (
                        <ul className="mt-3 flex flex-wrap gap-1.5">
                          {p.evidence.map((e) => (
                            <li
                              key={e}
                              className="rounded-md border border-line/10 px-2 py-1 font-mono text-[10px] text-zinc-400"
                            >
                              {e}
                            </li>
                          ))}
                        </ul>
                      )}
                      {p.links.length > 0 && (
                        <div className="mt-auto flex flex-wrap gap-2 pt-3">
                          {p.links.map((l) => (
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
                    </motion.div>
                  ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {fdeProjects
                  .filter((p) => !p.featured)
                  .map((p) => (
                    <div key={p.id} className="rounded-xl border border-line/10 bg-ink-800 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-zinc-100">{p.title}</h3>
                        {p.links.map((l) => (
                          <a
                            key={l.href}
                            href={l.href}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-500 transition-colors hover:text-zinc-200"
                          >
                            {l.label} <ArrowUpRight className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                      <p className="mt-1 font-mono text-[10px]" style={{ color: VIOLET }}>
                        {p.label}
                      </p>
                      <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">{p.copy}</p>
                    </div>
                  ))}
              </div>
            </div>
          </Section>

          {/* ------------------------------------------------------ capabilities */}
          <Section
            tag="capabilities"
            title="What I can be handed on day one"
            accent={ACCENT}
            lede="Grouped by what the work is for, because a keyword list does not say whether someone has done it."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {capabilities.map((g, i) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-line/10 bg-ink-800 p-4"
                >
                  <h3 className="text-sm font-semibold text-zinc-100">{g.title}</h3>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">{g.note}</p>
                  <ul className="mt-2.5 flex flex-wrap gap-1.5">
                    {g.items.map((it) => (
                      <li
                        key={it}
                        className="rounded-md border px-2 py-1 font-mono text-[10px] text-zinc-300"
                        style={{ borderColor: hexToRgba(ACCENT, 0.22), background: hexToRgba(ACCENT, 0.05) }}
                      >
                        {it}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </Section>

          {/* -------------------------------------------------------- explaining */}
          <Section tag="communication" title="Explaining it is part of delivering it" accent={ACCENT}>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-line/10 bg-ink-800 p-4">
                <p className="text-[13px] leading-relaxed text-zinc-300">{communication.teaching}</p>
              </div>
              <div className="rounded-xl border border-line/10 bg-ink-800 p-4">
                <p className="text-[13px] leading-relaxed text-zinc-300">{communication.writing}</p>
              </div>
            </div>
          </Section>

          {/* --------------------------------------------------------- education */}
          <Section tag="education" title="Education" accent={ACCENT}>
            <div className="grid gap-4 lg:grid-cols-2">
              {education.map((e) => (
                <div key={e.id} className="rounded-xl border border-line/10 bg-ink-800 p-4">
                  <h3 className="text-sm font-semibold text-zinc-100">{e.school}</h3>
                  <p className="mt-1 font-mono text-[11px]" style={{ color: ACCENT }}>
                    {e.line}
                  </p>
                  {e.detail && <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{e.detail}</p>}
                  {e.facts.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {e.facts.map((f) => (
                        <li key={f} className="flex gap-2 text-[12px] leading-relaxed text-zinc-400">
                          <span aria-hidden className="text-zinc-600">
                            ·
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* ----------------------------------------------------------- closing */}
          <section className="mx-auto max-w-5xl px-6 pb-24 pt-8">
            <div
              className="rounded-xl border p-6"
              style={{ borderColor: hexToRgba(ACCENT, 0.25), background: hexToRgba(ACCENT, 0.05) }}
            >
              <h2 className="max-w-3xl text-xl font-semibold leading-snug text-zinc-50 sm:text-2xl">{closing.heading}</h2>
              <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-zinc-300">{closing.copy}</p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <a
                  href={`mailto:${fdeContact.email}`}
                  className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-sm transition-colors hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ borderColor: ACCENT, color: ACCENT, background: hexToRgba(ACCENT, 0.12), outlineColor: ACCENT }}
                >
                  {closing.primaryAction} <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={`mailto:${fdeContact.email}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-line/12 px-3 py-2 font-mono text-sm text-zinc-300 transition-colors hover:border-line/30"
                >
                  <Mail className="h-4 w-4" /> {fdeContact.email}
                </a>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-lg border border-line/12 px-3 py-2 font-mono text-sm text-zinc-300 transition-colors hover:border-line/30"
                >
                  <Github className="h-4 w-4" /> GitHub
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-lg border border-line/12 px-3 py-2 font-mono text-sm text-zinc-300 transition-colors hover:border-line/30"
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
