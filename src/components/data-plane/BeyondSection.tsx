"use client";

/**
 * "Systems beyond the line card" — the production work that is not optical.
 *
 * These are ordinary case-study blocks on purpose. The line-card metaphor is not
 * extended into unrelated roles: cloud infrastructure is not drawn as hardware
 * slots, and nobody's internship is rendered as a device bring-up.
 */

import { supportingRoles } from "@/data/dataPlane";
import { FAINT, MUTED, RULE, SIGNAL, SURFACE, TEXT } from "./palette";

export function BeyondSection() {
  return (
    <section id="beyond" className="scroll-mt-20 px-5 py-16 sm:px-8 md:px-10 md:py-24" style={{ background: SURFACE }}>
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: SIGNAL }}>
          Beyond the line card
        </p>
        <h2 className="mt-3 text-[clamp(1.4rem,2.4vw,2.1rem)] font-semibold tracking-[-0.02em]" style={{ color: TEXT }}>
          Systems beyond the line card
        </h2>
        <p className="mt-3 max-w-[64ch] text-[0.95rem] leading-[1.6]" style={{ color: MUTED }}>
          Before the optical dataplane, I built cloud infrastructure, backend services and developer tooling in
          production — and the reliability habits carried straight across.
        </p>

        <ol className="mt-10 space-y-9">
          {supportingRoles.map((role) => (
            <li key={role.id} className="border-l pl-5 md:pl-7" style={{ borderColor: RULE }}>
              <h3 className="text-[1.02rem] font-semibold md:text-[1.1rem]" style={{ color: TEXT }}>
                {role.title}
              </h3>
              <p className="mt-1 text-[0.92rem]" style={{ color: SIGNAL }}>
                {role.org}
              </p>
              <p className="mt-1 font-mono text-[11px]" style={{ color: FAINT }}>
                {role.dates}
              </p>
              <p className="mt-3 max-w-[70ch] text-[0.9rem] leading-[1.6]" style={{ color: MUTED }}>
                {role.summary}
              </p>
              <ul className="mt-4 space-y-2.5">
                {role.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-3 text-[0.88rem] leading-[1.58]" style={{ color: MUTED }}>
                    <span aria-hidden className="mt-[0.62em] block h-[1px] w-3 shrink-0" style={{ background: SIGNAL }} />
                    {pt}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
