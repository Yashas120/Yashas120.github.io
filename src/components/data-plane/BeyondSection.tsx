"use client";

/** Production work beyond optics, kept in literal case studies rather than fictional hardware slots. */

import { evidenceById, type EvidenceRecord } from "@/data/evidence";
import { FAINT, MUTED, RULE, SIGNAL, SURFACE, TEXT } from "./palette";

const roles = [
  evidenceById("role-cisco-backend"),
  evidenceById("role-cisco-intern"),
  evidenceById("role-schneider"),
] as const;

const backendClusters = [
  { title: "Infrastructure and deployment", range: [0, 3] },
  { title: "State, migration, and performance", range: [3, 5] },
  { title: "Failure isolation and secure operations", range: [5, 7] },
  { title: "Developer leverage, applied AI, and leadership", range: [7, 9] },
] as const;

function EvidenceList({ points }: Readonly<{ points: readonly string[] }>) {
  return (
    <ul className="mt-3 space-y-2.5">
      {points.map((point) => (
        <li key={point} className="flex items-start gap-3 text-[0.86rem] leading-[1.62]" style={{ color: MUTED }}>
          <span aria-hidden className="mt-[0.65em] block h-px w-3 shrink-0" style={{ background: SIGNAL }} />
          <span>{point}</span>
        </li>
      ))}
    </ul>
  );
}

function RoleCaseStudy({ role }: Readonly<{ role: EvidenceRecord }>) {
  const details = role.details ?? [];
  return (
    <article className="border-l pl-5 md:pl-7" style={{ borderColor: RULE }}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-sm border px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em]" style={{ borderColor: RULE, color: SIGNAL }}>
          Professional
        </span>
        <span className="rounded-sm border px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em]" style={{ borderColor: RULE, color: FAINT }}>
          {role.status}
        </span>
      </div>
      <h3 className="mt-3 text-[1.05rem] font-semibold md:text-[1.16rem]" style={{ color: TEXT }}>{role.title}</h3>
      <p className="mt-1 font-mono text-[11px]" style={{ color: FAINT }}>{role.dates} · {role.location}</p>
      <p className="mt-4 max-w-[78ch] text-[0.92rem] leading-[1.65]" style={{ color: MUTED }}>{role.publicCopy}</p>

      {role.id === "role-cisco-backend" ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {backendClusters.map((cluster) => (
            <section key={cluster.title} aria-labelledby={`${role.id}-${cluster.range[0]}`} className="rounded-lg border p-4" style={{ borderColor: RULE, background: SURFACE }}>
              <h4 id={`${role.id}-${cluster.range[0]}`} className="font-mono text-[10.5px] uppercase tracking-[0.14em]" style={{ color: SIGNAL }}>{cluster.title}</h4>
              <EvidenceList points={details.slice(cluster.range[0], cluster.range[1])} />
            </section>
          ))}
        </div>
      ) : (
        <EvidenceList points={details} />
      )}

      {role.lensCopy?.dataplane && (
        <div className="mt-6 border-t pt-4" style={{ borderColor: RULE }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: SIGNAL }}>Why it matters here</p>
          <p className="mt-2 max-w-[76ch] text-[0.87rem] leading-[1.62]" style={{ color: MUTED }}>{role.lensCopy.dataplane}</p>
        </div>
      )}
    </article>
  );
}

export function BeyondSection() {
  return (
    <section id="experience" className="scroll-mt-20 px-5 py-16 sm:px-8 md:px-10 md:py-24" style={{ background: SURFACE }}>
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: SIGNAL }}>Beyond the line card</p>
        <h2 className="mt-3 text-[clamp(1.4rem,2.4vw,2.1rem)] font-semibold tracking-[-0.02em]" style={{ color: TEXT }}>Systems beyond the line card</h2>
        <p className="mt-3 max-w-[78ch] text-[0.95rem] leading-[1.65]" style={{ color: MUTED }}>
          Before the optical dataplane, I built and operated cloud infrastructure, backend services, API tooling, database migrations, and developer environments in production. The domains changed; the engineering habits—explicit state, safe rollout, observability, reproducibility, and failure isolation—carried across.
        </p>
        <div className="mt-12 space-y-14">
          {roles.map((role) => <RoleCaseStudy key={role.id} role={role} />)}
        </div>
      </div>
    </section>
  );
}
