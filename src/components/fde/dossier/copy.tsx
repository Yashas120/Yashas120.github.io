"use client";

/**
 * The two scenes whose editorial zone is not a plain copy block: scene 06 reveals
 * its accomplishments one line at a time against the same rail, and the handoff
 * plate carries the contact details.
 */

import { motion, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { BG, CopyBlock, COBALT, GREEN } from "./kit";
import { fdeChrome, handoff, leverageItems, type DossierScene } from "@/data/fdeDossier";

function LeverageLine({
  p,
  i,
  n,
  line,
}: Readonly<{ p: MotionValue<number>; i: number; n: number; line: string }>) {
  const step = 1 / n;
  const a = i * step;
  const opacity = useTransform(
    p,
    [a - step * 0.5, a + step * 0.35, a + step * 0.9, a + step * 1.4],
    [0.18, 1, 1, 0.18],
    { clamp: true }
  );
  const x = useTransform(p, [a - step * 0.5, a + step * 0.35], [8, 0], { clamp: true });

  return (
    <motion.li className="flex gap-3" style={{ opacity, x }}>
      <span className="mt-[3px] font-mono text-[10px] tabular-nums" style={{ color: GREEN }}>
        {String(i + 1).padStart(2, "0")}
      </span>
      <span className="text-[0.9rem] leading-[1.5] md:text-[1rem]">{line}</span>
    </motion.li>
  );
}

/** Narrow viewports show one accomplishment at a time in a fixed slot. */
function LeverageSlot({ p, i, n, line }: Readonly<{ p: MotionValue<number>; i: number; n: number; line: string }>) {
  const step = 1 / n;
  const a = i * step;
  const opacity = useTransform(
    p,
    [a - step * 0.18, a + step * 0.18, a + step * 0.82, a + step * 1.18],
    [0, 1, 1, 0],
    { clamp: true }
  );
  return (
    <motion.li className="absolute inset-x-0 top-0 flex gap-3" style={{ opacity }}>
      <span className="mt-[3px] font-mono text-[10px] tabular-nums" style={{ color: GREEN }}>
        {String(i + 1).padStart(2, "0")}
      </span>
      <span className="text-[0.95rem] leading-[1.5]">{line}</span>
    </motion.li>
  );
}

export function LeverageCopy({
  p,
  scene,
  compact,
}: Readonly<{ p: MotionValue<number>; scene: DossierScene; compact: boolean }>) {
  return (
    <CopyBlock scene={scene.id} slug={scene.slug} headline={scene.headline}>
      {compact ? (
        <ul className="relative mt-6 h-[7.5rem]">
          {leverageItems.map((it, i) => (
            <LeverageSlot key={it.id} p={p} i={i} n={leverageItems.length} line={it.line} />
          ))}
        </ul>
      ) : (
        <ul className="mt-6 space-y-3.5">
          {leverageItems.map((it, i) => (
            <LeverageLine key={it.id} p={p} i={i} n={leverageItems.length} line={it.line} />
          ))}
        </ul>
      )}
    </CopyBlock>
  );
}

const linkClass =
  "inline-flex items-center gap-1.5 border-b border-current/40 pb-0.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";

export function HandoffCopy() {
  return (
    <div className="max-w-[600px]">
      <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] opacity-45">
        <span aria-hidden className="inline-block h-[1px] w-6 bg-current" />
        handoff
      </p>

      <h2
        className="mt-4 font-semibold leading-[1.02] tracking-[-0.025em]"
        style={{ fontSize: "clamp(1.75rem, 3.4vw, 3.25rem)" }}
      >
        {handoff.headline}
      </h2>

      <p className="mt-5 max-w-[42ch] text-[1rem] leading-[1.55] opacity-75 md:text-[1.1rem]">
        {handoff.body}
      </p>

      <dl className="mt-7 font-mono text-[11px] leading-[1.9] tracking-[0.06em]">
        <dt className="sr-only">Name</dt>
        <dd className="opacity-90">{handoff.name}</dd>
        <dt className="sr-only">Education</dt>
        <dd className="opacity-60">{handoff.education}</dd>
        <dt className="sr-only">Email</dt>
        <dd>
          <a
            href={`mailto:${handoff.email}`}
            className="border-b border-current/40 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            aria-label={`Email Yashas Kadambi at ${handoff.email}`}
          >
            {handoff.email}
          </a>
        </dd>
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <a
          href={fdeChrome.links.resume.href}
          target="_blank"
          rel="noreferrer noopener"
          className={linkClass}
          aria-label="Resume — Yashas Kadambi on LinkedIn (opens in a new tab)"
        >
          Resume <ArrowUpRight className="h-3 w-3" aria-hidden />
        </a>
        <a
          href={fdeChrome.github}
          target="_blank"
          rel="noreferrer noopener"
          className={linkClass}
          aria-label="Yashas Kadambi on GitHub (opens in a new tab)"
        >
          GitHub <ArrowUpRight className="h-3 w-3" aria-hidden />
        </a>
      </div>

      <a
        href={`mailto:${handoff.email}?subject=Forward%20Deployed%20Engineering`}
        className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] transition-transform hover:-translate-y-[1px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        style={{ background: COBALT, color: BG, outlineColor: COBALT }}
      >
        {handoff.cta} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      </a>
    </div>
  );
}
