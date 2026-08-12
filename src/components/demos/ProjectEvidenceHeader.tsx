import { ArrowUpRight } from "lucide-react";
import { projectDemoEvidence } from "@/data/demos";

export interface ProjectDemoTheme {
  accent: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  label?: string;
}

export const DEFAULT_DEMO_THEME: ProjectDemoTheme = {
  accent: "#22d3ee",
  surface: "#111827",
  border: "rgba(148, 163, 184, 0.22)",
  text: "#f4f4f5",
  muted: "#a1a1aa",
  label: "Project evidence",
};

type HeadingLevel = 2 | 3 | 4;

export function ProjectEvidenceHeader({
  projectId,
  theme = DEFAULT_DEMO_THEME,
  headingLevel = 2,
  compact = false,
  eyebrow,
}: Readonly<{
  projectId: string;
  theme?: ProjectDemoTheme;
  headingLevel?: HeadingLevel;
  compact?: boolean;
  eyebrow?: string;
}>) {
  const project = projectDemoEvidence(projectId);
  if (!project) throw new Error(`No demo evidence is registered for project ${projectId}`);
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";

  return (
    <header
      id={project.anchorId}
      className={`scroll-mt-20 rounded-t-xl border px-4 sm:px-6 ${compact ? "py-4" : "py-6"}`}
      style={{ background: theme.surface, borderColor: theme.border, color: theme.text }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: theme.accent }}>
        {eyebrow ?? theme.label ?? "Project evidence"}
      </p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <Heading className="max-w-[34ch] text-xl font-semibold leading-tight tracking-[-0.02em] sm:text-2xl">
          {project.projectTitle}
        </Heading>
        <div className="flex flex-wrap gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em]" aria-label="Ownership and project status">
          <span className="rounded-full border px-2.5 py-1" style={{ borderColor: theme.border, color: theme.accent }}>Ownership · {project.ownership}</span>
          <span className="rounded-full border px-2.5 py-1" style={{ borderColor: theme.border, color: theme.text }}>Status · {project.status}</span>
        </div>
      </div>

      <dl className={`mt-5 grid gap-4 ${compact ? "" : "md:grid-cols-2"}`}>
        <EvidenceField label="My contribution" value={project.contribution} theme={theme} />
        <EvidenceField label="What the browser demo runs" value={project.browserRuns} theme={theme} />
        {!compact && <EvidenceField label="What is simplified, modeled, or stubbed" value={project.simplification} theme={theme} />}
        {!compact && <EvidenceField label="Demo fidelity" value={project.fidelity ?? "No browser demo"} theme={theme} />}
      </dl>

      {project.warning && (
        <p role="note" className="mt-5 rounded-md border px-3 py-2 text-[13px] font-medium leading-relaxed" style={{ borderColor: theme.accent, color: theme.text }}>
          {project.warning}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px]">
        {project.projectSourceHref && <SourceLink href={project.projectSourceHref} label="Original project source" color={theme.accent} />}
        {project.upstreamHref && <SourceLink href={project.upstreamHref} label="Upstream source" color={theme.accent} />}
        {project.browserImplementationHref && <SourceLink href={project.browserImplementationHref} label="Browser implementation source" color={theme.accent} />}
      </div>
    </header>
  );
}

function EvidenceField({ label, value, theme }: Readonly<{ label: string; value: string; theme: ProjectDemoTheme }>) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.13em]" style={{ color: theme.accent }}>{label}</dt>
      <dd className="mt-1 text-[13px] leading-relaxed sm:text-[14px]" style={{ color: theme.muted }}>{value}</dd>
    </div>
  );
}

function SourceLink({ href, label, color }: Readonly<{ href: string; label: string; color: string }>) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-11 items-center gap-1 py-3 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2" style={{ color }}>
      {label} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
