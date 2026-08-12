"use client";

/**
 * The complete optical / dataplane experience, as scannable text.
 *
 * The film narrates this material, but the route is shared directly with
 * employers, so the role, dates, scope, every area of work and the ownership
 * split also exist as a plain, complete, linkable record. This is the skip
 * link's destination.
 *
 * Complete ownership and collaborative ownership are rendered as two separate
 * groups and never merged into one list.
 */

import { opticalRole, ownership, skillGroups } from "@/data/dataPlane";
import { AMBER, CANVAS, FAINT, MUTED, RULE, SIGNAL, SURFACE, TEXT, VERIFIED } from "./palette";

function OwnershipGroup({
  label,
  items,
  color,
  caption,
}: Readonly<{ label: string; items: readonly string[]; color: string; caption: string }>) {
  return (
    <div className="rounded-lg border p-5" style={{ borderColor: RULE, background: SURFACE }}>
      <div className="flex items-center gap-2">
        <span aria-hidden className="block h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        <h4 className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color }}>
          {label}
        </h4>
      </div>
      <p className="mt-2 text-[0.8rem] leading-[1.5]" style={{ color: FAINT }}>
        {caption}
      </p>
      <ul className="mt-3.5 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[0.88rem] leading-[1.55]" style={{ color: MUTED }}>
            <span aria-hidden className="mt-[0.6em] block h-[1px] w-3 shrink-0" style={{ background: color }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OpticalExperience() {
  return (
    <section id="experience" className="scroll-mt-20 px-5 py-16 sm:px-8 md:px-10 md:py-24" style={{ background: CANVAS }}>
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: SIGNAL }}>
          Optical dataplane experience
        </p>
        <h2 className="mt-3 text-[clamp(1.4rem,2.4vw,2.1rem)] font-semibold tracking-[-0.02em]" style={{ color: TEXT }}>
          {opticalRole.org} · {opticalRole.title}
        </h2>
        <p className="mt-1.5 font-mono text-[11px]" style={{ color: FAINT }}>
          {opticalRole.dates} · {opticalRole.location}
        </p>
        <p className="mt-4 max-w-[70ch] text-[0.95rem] leading-[1.62]" style={{ color: MUTED }}>
          {opticalRole.scope}
        </p>

        <h3 className="mt-10 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: FAINT }}>
          Areas of work
        </h3>
        <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {opticalRole.areas.map((area) => (
            <li key={area} className="flex items-start gap-2.5 text-[0.88rem] leading-[1.5]" style={{ color: MUTED }}>
              <span aria-hidden className="mt-[0.6em] block h-[1px] w-3 shrink-0" style={{ background: SIGNAL }} />
              {area}
            </li>
          ))}
        </ul>

        <h3 className="mt-12 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: FAINT }}>
          Ownership
        </h3>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <OwnershipGroup
            label={ownership.complete.label}
            items={ownership.complete.items}
            color={VERIFIED}
            caption="Designed, implemented and carried to release myself."
          />
          <OwnershipGroup
            label={ownership.coOwned.label}
            items={ownership.coOwned.items}
            color={AMBER}
            caption="Shared with teammates; my contribution was one part of the whole."
          />
        </div>

        <h3 className="mt-12 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: FAINT }}>
          Technical skills
        </h3>
        <dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((g) => (
            <div key={g.label}>
              <dt className="text-[0.82rem] font-semibold" style={{ color: TEXT }}>
                {g.label}
              </dt>
              <dd className="mt-1.5 font-mono text-[0.78rem] leading-[1.6]" style={{ color: MUTED }}>
                {g.items.join(" · ")}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
