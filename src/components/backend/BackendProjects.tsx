"use client";

/**
 * The two featured projects, rendered as literal descriptions.
 *
 * Ownership and status labels are factual and prominent: Cloud-Hack is team
 * coursework where the contribution was the MongoDB deployment, and neither
 * project is described as deployed to production. Only these two are featured;
 * forks and unrelated coursework are reachable via GitHub but are not given equal
 * visual weight here.
 */

import { motion, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { projects, type BackendProject } from "@/data/backend";
import { colors, PROJECT_SUBSTATES } from "./tokens";

function Field({
  label,
  children,
  mobile,
}: Readonly<{ label: string; children: React.ReactNode; mobile?: boolean }>) {
  return (
    <div className="mt-3.5">
      <p className="font-mono text-[11px] tracking-[0.16em]" style={{ color: colors.muted }}>
        {label}
      </p>
      <p className="mt-1" style={{ color: colors.muted, fontSize: mobile ? 16 : 17, lineHeight: 1.6 }}>
        {children}
      </p>
    </div>
  );
}

export function ProjectPanel({
  project,
  mobile,
  active,
  showStack = true,
}: Readonly<{ project: BackendProject; mobile?: boolean; active: boolean; showStack?: boolean }>) {
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.18em]" style={{ color: colors.warning }}>
        {project.ownership}
      </p>
      <h3
        className="mt-3 font-semibold tracking-[-0.02em]"
        style={{
          color: colors.text,
          fontSize: mobile ? "clamp(24px, 7vw, 30px)" : "clamp(1.7rem, 2.8vw, 2.6rem)",
          lineHeight: 1.12,
        }}
      >
        {project.title}
      </h3>

      <Field label="PROBLEM" mobile={mobile}>
        {project.problem}
      </Field>
      <Field label="MY CONTRIBUTION" mobile={mobile}>
        {project.contribution}
      </Field>
      {project.system && !mobile && (
        <Field label="SYSTEM" mobile={mobile}>
          {project.system}
        </Field>
      )}

      {showStack && (
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <li
              key={s}
              className="rounded border px-2 py-0.5 font-mono text-[11px]"
              style={{ borderColor: colors.line, color: colors.muted }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}

      <a
        href={project.repo}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`${project.title} repository on GitHub (opens in a new tab)`}
        tabIndex={active ? undefined : -1}
        className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 rounded-md border px-3 text-[15px]"
        style={{ borderColor: colors.line, color: colors.active }}
      >
        Repository
        <ArrowUpRight className="h-4 w-4" aria-hidden />
      </a>
    </div>
  );
}

/**
 * Inside the projects chapter the two panels cross-fade on their own substates
 * (0.77–0.84 and 0.84–0.91), matching the visual's topology morph.
 */
export function BackendProjects({
  progress,
  active,
  activeSubstate,
  mobile,
}: Readonly<{
  progress: MotionValue<number>;
  active: boolean;
  /** Index of the project currently on screen; gates which link is focusable. */
  activeSubstate: number;
  mobile?: boolean;
}>) {
  return (
    <div className="relative">
      {projects.map((project, i) => (
        <ProjectSubstate
          key={project.id}
          progress={progress}
          index={i}
          active={active && activeSubstate === i}
          mobile={mobile}
          project={project}
        />
      ))}
      {/* reserves height so the cross-fade does not shift surrounding layout */}
      <div className="invisible" aria-hidden>
        <ProjectPanel project={projects[0]} mobile={mobile} active={false} />
      </div>
    </div>
  );
}

function ProjectSubstate({
  progress,
  index,
  active,
  mobile,
  project,
}: Readonly<{
  progress: MotionValue<number>;
  index: number;
  active: boolean;
  mobile?: boolean;
  project: BackendProject;
}>) {
  const { start, end } = PROJECT_SUBSTATES[index];
  const len = end - start;
  const first = index === 0;
  const last = index === PROJECT_SUBSTATES.length - 1;
  const opacity = useTransform(
    progress,
    [
      first ? -1 : start,
      first ? -0.999 : start + len * 0.28,
      last ? 2 : end - len * 0.28,
      last ? 2.001 : end,
    ],
    [0, 1, 1, 0],
    { clamp: true }
  );

  return (
    <motion.div className="absolute inset-0" style={{ opacity }} aria-hidden={!active}>
      {/* `active` already accounts for which substate is on screen, so only the
          visible panel's repository link is reachable by keyboard */}
      <ProjectPanel project={project} mobile={mobile} active={active} />
    </motion.div>
  );
}
