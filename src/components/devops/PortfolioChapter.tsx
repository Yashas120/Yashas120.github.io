/**
 * Chapter shell and the small shared pieces the document is built from.
 *
 * Server components: the readable portfolio is fully present in the static HTML,
 * so the page is complete before — and without — hydration. `data-chapter` is the
 * only hook the client inspector needs, and it is an attribute rather than a
 * component boundary.
 */

import { ArrowUpRight } from "lucide-react";
import type { ChapterId } from "@/data/devops/chapters";
import { DV } from "./tokens";

export interface PortfolioChapterProps {
  id: ChapterId;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  /** Renders the chapter title as the page's single h1 (hero only). */
  lead?: boolean;
}

export function PortfolioChapter({ id, eyebrow, title, children, lead }: Readonly<PortfolioChapterProps>) {
  const Heading = lead ? "h1" : "h2";
  return (
    <section
      id={id}
      data-chapter={id}
      // scroll-margin keeps the sticky header from covering an anchored heading
      className="scroll-mt-[72px] border-b px-4 py-12 last:border-b-0 sm:px-8 md:py-16"
      style={{ borderColor: DV.border }}
      aria-labelledby={`${id}-title`}
    >
      <p className="m-0 font-mono text-[12px] tracking-[0.14em]" style={{ color: DV.amber }}>
        {eyebrow}
      </p>
      <Heading
        id={`${id}-title`}
        className={
          lead
            ? "mb-0 mt-3 text-[34px] font-semibold leading-[1.12] tracking-tight md:text-[44px] dock:text-[56px]"
            : "mb-0 mt-3 text-[28px] font-semibold leading-[1.18] tracking-tight md:text-[34px] dock:text-[40px]"
        }
        style={{ color: DV.text }}
      >
        {title}
      </Heading>
      {children}
    </section>
  );
}

/** Body copy at the route's reading size. */
export function Prose({ children, className }: Readonly<{ children: React.ReactNode; className?: string }>) {
  return (
    <p className={`mt-4 max-w-[62ch] text-[16px] leading-relaxed dock:text-[17px] ${className ?? ""}`} style={{ color: DV.muted }}>
      {children}
    </p>
  );
}

export function H3({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <h3 className="mb-0 mt-8 text-[20px] font-semibold leading-snug dock:text-[22px]" style={{ color: DV.text }}>
      {children}
    </h3>
  );
}

/** A labelled paragraph inside a case study: Context, Contribution, Outcome. */
export function Labelled({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div className="mt-4">
      <p className="m-0 font-mono text-[12px] uppercase tracking-[0.1em]" style={{ color: DV.muted }}>
        {label}
      </p>
      <p className="m-0 mt-1 max-w-[62ch] text-[16px] leading-relaxed" style={{ color: DV.text }}>
        {children}
      </p>
    </div>
  );
}

export function Badges({ items }: Readonly<{ items: readonly string[] }>) {
  return (
    <ul className="m-0 mt-4 flex list-none flex-wrap gap-1.5 p-0">
      {items.map((b, i) => (
        <li key={b}>
          {/* The first badge is the classification, so it is the one that is coloured. */}
          <span className="dv-chip" style={i === 0 ? { color: DV.green, borderColor: DV.green } : undefined}>
            {b}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Bullets({ items }: Readonly<{ items: readonly string[] }>) {
  return (
    <ul className="m-0 mt-4 max-w-[62ch] list-none space-y-2 p-0">
      {items.map((t) => (
        <li key={t} className="flex gap-2.5 text-[16px] leading-relaxed" style={{ color: DV.muted }}>
          <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-sm" style={{ background: DV.cyan }} />
          {t}
        </li>
      ))}
    </ul>
  );
}

export function ExternalLink({
  href,
  label,
  ariaLabel,
}: Readonly<{ href: string; label: string; ariaLabel: string }>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={ariaLabel}
      className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-[15px]"
      style={{ color: DV.cyan }}
    >
      {label} <ArrowUpRight className="h-4 w-4" aria-hidden />
    </a>
  );
}
