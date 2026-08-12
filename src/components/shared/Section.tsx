import type { ReactNode } from "react";

export interface SectionProps {
  tag: string;
  title: string;
  accent: string;
  id?: string;
  /** One plain sentence under the heading, when the title needs context. */
  lede?: ReactNode;
  children: ReactNode;
}

/** A titled band of the page: a small machine-ish tag, a human heading, content. */
export function Section({ tag, title, accent, id, lede, children }: SectionProps) {
  return (
    <section id={id} className="mx-auto max-w-5xl scroll-mt-16 px-6 py-8">
      <div className="mb-4">
        <p className="font-mono text-[11px]" style={{ color: accent }}>
          {tag}
        </p>
        <h2 className="mt-1 font-mono text-lg font-semibold text-zinc-100">{title}</h2>
        {lede && <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-zinc-300">{lede}</p>}
      </div>
      {children}
    </section>
  );
}
