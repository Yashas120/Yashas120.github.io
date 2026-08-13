"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Download,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Menu,
  MonitorUp,
} from "lucide-react";
import { transcriptSummary } from "@/data/coursework";
import { DEMOS } from "@/data/demos";
import { experience } from "@/data/experience";
import { highlights } from "@/data/highlights";
import { kernelPortfolio, workLabels } from "@/data/kernelPortfolio";
import { profile } from "@/data/profile";
import { kernelProjects } from "@/data/projects";
import { publications } from "@/data/publications";
import { evidenceCapabilities } from "@/data/skills";
import { courses, teachingStats } from "@/data/teaching";
import type { PortfolioCaseStudy, Project } from "@/types";
import { apps } from "../apps/registry";
import { KernelStage } from "./KernelStage";
import styles from "./kernel-story.module.css";
import type { KernelStageStep } from "./stageModel";
import { storyDock } from "./stageModel";
import { useDesktopMode } from "./useDesktopMode";
import { useKernelStory } from "./useKernelStory";

const InteractiveDesktopOverlay = dynamic(() => import("./InteractiveDesktopOverlay"), { ssr: false });
const validAppIds = apps.map((app) => app.id);
const validDemoIds = DEMOS.map((demo) => demo.id);

const projectById = new Map(kernelProjects.map((project) => [project.id, project]));
const caseStudyById = new Map<string, PortfolioCaseStudy>([
  ...experience.flatMap((item) => item.caseStudies ?? []),
  ...kernelProjects.flatMap((project) => project.caseStudy ? [project.caseStudy] : []),
].map((item) => [item.id, item]));

function requireCaseStudy(id: string) {
  const study = caseStudyById.get(id);
  if (!study) throw new Error(`Missing kernel case study: ${id}`);
  return study;
}

const production = requireCaseStudy("production-testing");
const hardware = requireCaseStudy("hardware-integration");
const scheduling = requireCaseStudy("ghost-scheduling");
const proof = kernelPortfolio.proofOrder.map((id) => {
  const item = profile.systemsProof.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Missing kernel proof: ${id}`);
  return item;
});
const professionalExperience = experience.filter((item) => item.kind === "professional");
const systemsProjects = ["bitcoin-java", "chocollvm", "parallel-systems", "ghost-scheduler"]
  .map((id) => projectById.get(id))
  .filter((item): item is Project => Boolean(item));

const workspaceProjects = {
  systems: ["bitcoin-java", "chocollvm", "parallel-systems", "ghost-scheduler"],
  backend: ["spark-cifar10", "cloud-provisioning", "petra"],
  infrastructure: ["cloud-hack", "portfolio-platform"],
  ml: ["swift", "multiview-3d", "yelp-analysis", "voice-assistant"],
  research: ["underwater-monitoring", "sunset-fork"],
} as const;

function projectsFor(ids: readonly string[]) {
  return ids.map((id) => projectById.get(id)).filter((item): item is Project => Boolean(item));
}

export function KernelStory() {
  const { rootRef, activeStep } = useKernelStory();
  const storyRef = useRef<HTMLDivElement>(null);
  const desktop = useDesktopMode(validAppIds, validDemoIds);

  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;
    story.inert = desktop.open;
    if (desktop.open) story.setAttribute("aria-hidden", "true");
    else story.removeAttribute("aria-hidden");
  }, [desktop.open]);

  const initialDesktopApp = useMemo(() => desktop.appId, [desktop.appId]);

  return (
    <div ref={rootRef} className={styles.page} data-active-step="identity">
      <a className={styles.skipLink} href="#main-content">Skip to content</a>

      <div ref={storyRef} className={styles.storyShell}>
        <main id="main-content" className={styles.story} tabIndex={-1}>
          <KernelStage activeStep={activeStep} onOpenDesktop={desktop.openDesktop} />

          <div className={styles.sceneRail}>
            <StoryScene id="identity" step="identity" className={styles.identityScene}>
              <p className={styles.eyebrow}>{kernelPortfolio.eyebrow}</p>
              <h1>{profile.shortName}</h1>
              <p className={styles.role}>{profile.role}</p>
              <p className={styles.lead}>{kernelPortfolio.introduction}</p>
              <ul className={styles.proofGrid} aria-label="Selected verified evidence">
                {proof.map((item) => <li key={item.id}><strong>{item.value}</strong><span>{item.label}</span></li>)}
              </ul>
              <p className={styles.currentContext}>{profile.currentContext}</p>
              <div className={styles.actions} aria-label="Primary portfolio actions">
                <a className={styles.primaryAction} href="#production-testing">Explore the system <ArrowDown /></a>
                <a href={profile.resume.href}><Download /> Résumé</a>
                <a href={`mailto:${profile.email}`}><Mail /> Email</a>
                <button type="button" onClick={() => desktop.openDesktop()}><MonitorUp /> Enter desktop</button>
              </div>
              <div className={styles.inlineLinks} aria-label="Professional links">
                <a href={profile.github} target="_blank" rel="noreferrer noopener"><Github /> GitHub</a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer noopener"><Linkedin /> LinkedIn</a>
              </div>
              <VisualEquivalent>Application, Linux-kernel, device and hardware layers resolve into one evidence-backed system map.</VisualEquivalent>
            </StoryScene>

            <StoryScene id="production-testing" step="production-testing" eyebrow={production.context} alias="test-boundary" title="Production C validation">
              <p className={styles.lead}>Built a CMocka-based validation framework for 122 production C source files and modeled roughly 430 external SDK interactions so tests could execute without physical hardware. Reduced a typical validation cycle from approximately 30 minutes to approximately 10 seconds and made the suite a required validation gate for new code.</p>
              <Callout label="The boundary">Production code remained real; external SDK and hardware dependencies were modeled.</Callout>
              <Evidence items={[
                "122 production C files",
                "Approximately 430 SDK interactions",
                "Approximately 30 minutes → approximately 10 seconds",
                "Hardware-independent execution",
                "Required new-code validation gate",
                "GCC · Clang · CMocka · ASan/UBSan where supported",
              ]} />
              <VisualEquivalent>Grouped production modules remain on the execution path while modeled dependencies move behind an amber test boundary; a validation event then resolves green.</VisualEquivalent>
            </StoryScene>

            <StoryScene id="hardware-integration" step="hardware-integration" eyebrow={hardware.context} alias="device-path" title="Hardware integration">
              <p className={styles.lead}>{hardware.body}</p>
              <Callout label="Responsibility">Integrated CDR paths, validated secure-boot and upgrade behavior, developed supporting production software, and diagnosed FPGA/FPD issues as a contributor to the line-card system.</Callout>
              <ol className={styles.pathList} aria-label="Hardware integration path">
                {[
                  ["Platform software", "Developed"],
                  ["Device API", "Integrated"],
                  ["FPGA / FPD", "Diagnosed"],
                  ["CDR", "Integrated"],
                  ["Optical hardware", "Validated"],
                ].map(([label, responsibility]) => <li key={label}><span>{label}</span><strong>{responsibility}</strong></li>)}
              </ol>
              <Evidence items={hardware.evidence ?? []} compact />
              <VisualEquivalent>The same shared boundary ports reorganize into the platform-software, device-API, FPGA/FPD, CDR and optical-hardware path.</VisualEquivalent>
            </StoryScene>

            <StoryScene id="ghost-scheduling" step="ghost-scheduling" eyebrow={scheduling.context} alias="sched" title="Linux scheduling experiments">
              <p className={styles.lead}>Built and instrumented a ghOSt-compatible Linux experimental environment to compare user-space scheduling policies with Linux CFS and FIFO baselines.</p>
              <p className={styles.conceptual}>Conceptual visualization of the experiment architecture—not measured output.</p>
              <dl className={styles.matrix}>
                {(scheduling.matrix ?? []).map(([dimension, value]) => <div key={dimension}><dt>{dimension}</dt><dd>{value}</dd></div>)}
              </dl>
              <button type="button" className={styles.appAction} onClick={() => desktop.openDesktop("sched")}><MonitorUp /> Open interactive scheduler configuration</button>
              <VisualEquivalent>Device events condense into runnable work; CFS and FIFO remain kernel baselines while the ghOSt agent occupies the user-space policy boundary and returns choices to kernel dispatch.</VisualEquivalent>
            </StoryScene>

            <StoryScene id="experience" step="experience" eyebrow="PROFESSIONAL EXPERIENCE" alias="systemd" title="Work experience">
              <p className={styles.lead}>Approximately three years of production engineering come first. Education and teaching remain separate contexts later in the system.</p>
              <div className={styles.experienceList}>
                {professionalExperience.map((item) => (
                  <article key={item.id}>
                    <div><span>{item.start} — {item.end}</span><span>{item.location}</span></div>
                    <p>{workLabels.ownership[item.ownership]} · Professional</p>
                    <h3>{item.role}</h3>
                    <strong>{item.org}</strong>
                    <p>{item.scope}</p>
                    <ul>{item.points.slice(0, 3).map((point) => <li key={point}>{point}</li>)}</ul>
                    <TechList items={item.technologies} />
                  </article>
                ))}
              </div>
              <VisualEquivalent>Scheduler lanes become a dependency tree whose primary Cisco process branches into validation, hardware integration, secure boot and diagnosis.</VisualEquivalent>
            </StoryScene>

            <StoryScene id="systems-projects" step="systems-projects" eyebrow="SELECTED SYSTEMS PROJECTS" alias="processes" title="Protocol, compiler and performance work">
              <p className={styles.lead}>Process telemetry has been replaced with factual portfolio fields: context, ownership, status, evidence, source and demo.</p>
              <ProjectRows projects={systemsProjects} onDemo={(project) => project.demoId && desktop.openDemo(project.demoId)} />
              <button type="button" className={styles.appAction} onClick={() => desktop.openDesktop("htop")}><MonitorUp /> Open project evidence application</button>
              <VisualEquivalent>The professional service tree flattens into project evidence rows, with attribution and verified links replacing PIDs, CPU and memory columns.</VisualEquivalent>
            </StoryScene>

            <StoryScene id="live-demos" step="live-demos" eyebrow="LIVE DEMO LAB" alias="demo-lab" title="Run the projects in yashOS">
              <p className={styles.lead}>Launch all ten browser experiences without leaving this portfolio. Each demo keeps its implementation fidelity and project attribution visible inside the lab.</p>
              <div className={styles.demoGrid}>
                {DEMOS.map((demo) => (
                  <article key={demo.id}>
                    <header>
                      <span aria-hidden="true" style={{ backgroundColor: demo.accent }} />
                      <code>{demo.kind === "interactive" ? "LIVE" : "EXPLAINER"}</code>
                    </header>
                    <h3>{demo.title}</h3>
                    <p>{demo.blurb}</p>
                    <ul aria-label={`${demo.title} technologies`}>
                      {demo.tech.slice(0, 3).map((technology) => <li key={technology}>{technology}</li>)}
                    </ul>
                    <button type="button" onClick={() => desktop.openDemo(demo.id)}>
                      <MonitorUp /> Launch demo <ArrowRight />
                    </button>
                  </article>
                ))}
              </div>
              <button type="button" className={styles.appAction} onClick={() => desktop.openDesktop("demo-lab")}><MonitorUp /> Open the complete demo lab</button>
              <VisualEquivalent>The project evidence index resolves into ten launchable browser experiences inside the same desktop, with live computation and explainers labeled separately.</VisualEquivalent>
            </StoryScene>

            <StoryScene id="complete-profile" step="complete-profile" eyebrow="COMPLETE PROFILE" alias="workspace --systems" title="Systems-first, not systems-only">
              <p className={styles.lead}>{kernelPortfolio.broaderIntroduction}</p>
              <WorkspaceNav />
              <ProjectRows projects={projectsFor(workspaceProjects.systems)} onDemo={(project) => project.demoId && desktop.openDemo(project.demoId)} compact />
              <VisualEquivalent>The evidence rows remain in the same window while the active workspace changes; systems and protocols are emphasized first.</VisualEquivalent>
            </StoryScene>

            <StoryScene id="projects" step="profile-backend" eyebrow="COMPLETE PROFILE · WORKSPACE 02" alias="workspace --backend" title="Distributed systems and backend">
              <p className={styles.lead}>Production backend platforms, distributed data paths and course-scale systems remain visible with their contexts and contribution boundaries.</p>
              <WorkspaceNav />
              <ProjectRows projects={projectsFor(workspaceProjects.backend)} onDemo={(project) => project.demoId && desktop.openDemo(project.demoId)} compact />
              <RelatedWork title="Production backend evidence" items={professionalExperience.filter((item) => item.id === "cisco-backend" || item.id === "cisco-intern").map((item) => `${item.role} · ${item.org}`)} />
            </StoryScene>

            <StoryScene id="infrastructure-projects" step="profile-infrastructure" eyebrow="COMPLETE PROFILE · WORKSPACE 03" alias="workspace --infrastructure" title="DevOps and infrastructure">
              <p className={styles.lead}>Infrastructure as code, release automation, event-driven services, container deployment and diagnosis connect delivery to operational evidence.</p>
              <WorkspaceNav />
              <ProjectRows projects={projectsFor(workspaceProjects.infrastructure)} onDemo={(project) => project.demoId && desktop.openDemo(project.demoId)} compact />
              <RelatedWork title="Production infrastructure evidence" items={["Terraform modules and AWS resources", "API/SDK release automation", "Staged rollout and reliability diagnosis", "Device build, deployment and log streaming"]} />
            </StoryScene>

            <StoryScene id="ml-vision" step="profile-ml" eyebrow="COMPLETE PROFILE · WORKSPACE 04" alias="workspace --ml-vision" title="Machine learning and computer vision">
              <p className={styles.lead}>Peer-reviewed research, independent vision work, distributed ML and applied analysis remain part of the same portfolio—with research, coursework and team status explicit.</p>
              <WorkspaceNav />
              <ProjectRows projects={projectsFor(workspaceProjects.ml)} onDemo={(project) => project.demoId && desktop.openDemo(project.demoId)} compact />
            </StoryScene>

            <StoryScene id="research-teaching" step="profile-research" eyebrow="COMPLETE PROFILE · WORKSPACE 05" alias="workspace --research" title="Research, teaching and education">
              <p className={styles.lead}>Two peer-reviewed publications and teaching support across {teachingStats.courses} computer-science courses for {teachingStats.students} learners.</p>
              <WorkspaceNav />
              <div className={styles.academicGrid}>
                <div>
                  <h3>Publications</h3>
                  {publications.map((item) => <article key={item.id}><span>{item.venue} · {item.year}</span><h4>{item.title}</h4><p>{item.contribution}</p><a href={item.paperUrl} target="_blank" rel="noreferrer noopener">Paper / DOI <ExternalLink /></a></article>)}
                </div>
                <div>
                  <h3>Teaching at PES University</h3>
                  {courses.map((course) => <article key={course.id}><span>{course.term} · {course.students}</span><h4>{course.name}</h4><p>{course.summary}</p></article>)}
                </div>
              </div>
              <section id="education" className={styles.education} aria-labelledby="education-title">
                <h3 id="education-title">Education</h3>
                <article><span>Begins Sep 2026 · Expected 2027</span><h4>UC San Diego</h4><p>MS Computer Science (Incoming)</p></article>
                <article><span>2019 — 2023</span><h4>PES University</h4><p>B.Tech, Computer Science and Engineering · GPA {transcriptSummary.usGpa} / 4</p></article>
              </section>
              <ProjectRows projects={projectsFor(workspaceProjects.research)} onDemo={() => undefined} compact />
            </StoryScene>

            <StoryScene id="capabilities" step="capabilities" eyebrow="EVIDENCE MAP" alias="/proc/capabilities" title="Capabilities backed by work">
              <p className={styles.lead}>No percentages or proficiency bars. Each capability branch resolves to work already visible in this running system.</p>
              <div className={styles.capabilities}>
                {evidenceCapabilities.map((group) => (
                  <article key={group.title}>
                    <h3>{group.title}</h3>
                    <TechList items={[...group.items]} />
                    <p>Backed by:</p>
                    <ul>{group.evidence.map((id) => {
                      const project = projectById.get(id);
                      return <li key={id}><a href={project?.caseStudyUrl ?? `#${id}`}>{project?.title ?? id.replaceAll("-", " ")} <ArrowRight /></a></li>;
                    })}</ul>
                  </article>
                ))}
              </div>
              <VisualEquivalent>Project rows collapse into a process-file tree; capability branches reconnect to production work, experiments, protocols and compiler evidence.</VisualEquivalent>
            </StoryScene>

            <StoryScene id="contact" step="contact" eyebrow="CONTACT · SERVICES READY" alias="mail" title="Let’s build systems across real boundaries.">
              <p className={styles.lead}>For systems software, infrastructure, performance-engineering or hardware-adjacent opportunities, get in touch.</p>
              <div className={styles.contactPanel}>
                <a className={styles.primaryAction} href={`mailto:${profile.email}`}><Mail /> Email Yashas</a>
                <a href={profile.resume.href}><Download /> View/download résumé</a>
                <a href={profile.github} target="_blank" rel="noreferrer noopener"><Github /> GitHub</a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer noopener"><Linkedin /> LinkedIn</a>
                <button type="button" onClick={() => desktop.openDesktop()}><MonitorUp /> Enter interactive desktop</button>
              </div>
              <p className={styles.contactAddress}>{profile.email} · {profile.location}</p>
              <div className={styles.highlights}>{highlights.map((item) => <span key={item.id}><strong>{item.label}</strong>{item.detail}</span>)}</div>
              <VisualEquivalent>The complete application, kernel, production and hardware map settles while résumé, mail, source and desktop services become ready.</VisualEquivalent>
            </StoryScene>
          </div>
        </main>

        <footer className={styles.footer}>
          <span>Yashas Kadambi · Systems Software Engineer</span>
          <a href="#identity">Return to system start ↑</a>
        </footer>

        <details className={styles.mobileMenu}>
          <summary><Menu /> All sections</summary>
          <nav aria-label="All portfolio sections">
            {storyDock.map((item) => <a href={`#${item.id}`} key={item.id}><span>{item.label}</span><code>{item.alias}</code></a>)}
            <a href="#complete-profile"><span>Complete profile</span><code>workspaces</code></a>
          </nav>
        </details>
      </div>

      {desktop.open ? (
        <InteractiveDesktopOverlay
          appId={initialDesktopApp}
          demoId={desktop.demoId}
          invalidApp={desktop.invalidApp}
          onClose={desktop.closeDesktop}
          onAppOpen={desktop.openApp}
          onDemoOpen={desktop.openDemo}
          onAppClose={desktop.closeApp}
        />
      ) : null}
    </div>
  );
}

function StoryScene({
  id,
  step,
  eyebrow,
  alias,
  title,
  children,
  className = "",
}: Readonly<{
  id: string;
  step: KernelStageStep;
  eyebrow?: string;
  alias?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <section id={id} data-kernel-step={step} className={`${styles.scene} ${className}`}>
      <article className={styles.sceneCopy}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        {title ? <header className={styles.sceneHeader}><h2>{title}</h2>{alias ? <code>{alias}</code> : null}</header> : null}
        {children}
      </article>
    </section>
  );
}

function Evidence({ items, compact = false }: Readonly<{ items: readonly string[]; compact?: boolean }>) {
  return <ul className={`${styles.evidence} ${compact ? styles.evidenceCompact : ""}`}>{items.map((item) => <li key={item}><Check /> {item}</li>)}</ul>;
}

function Callout({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return <aside className={styles.callout}><span>{label}</span><p>{children}</p></aside>;
}

function VisualEquivalent({ children }: Readonly<{ children: React.ReactNode }>) {
  return <p className={styles.visualEquivalent}><span>Visual state:</span> {children}</p>;
}

function TechList({ items }: Readonly<{ items: readonly string[] }>) {
  return <ul className={styles.techList} aria-label="Technologies">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function ProjectRows({ projects, onDemo, compact = false }: Readonly<{ projects: readonly Project[]; onDemo: (project: Project) => void; compact?: boolean }>) {
  return (
    <div className={`${styles.projectRows} ${compact ? styles.projectRowsCompact : ""}`}>
      {projects.map((project) => (
        <article id={project.id} key={project.id}>
          <header><h3>{project.title}</h3><span>{workLabels.context[project.context]} · {workLabels.ownership[project.ownership]} · {workLabels.status[project.status]}</span></header>
          <p>{project.blurb}</p>
          <dl><div><dt>Contribution</dt><dd>{project.contribution}</dd></div><div><dt>Evidence</dt><dd>{project.evidence.map((item) => `${item.label}${item.value ? ` — ${item.value}` : ""}`).join(" · ") || project.outcome}</dd></div></dl>
          <div className={styles.rowActions}>
            {project.repoUrl ? <a href={project.repoUrl} target="_blank" rel="noreferrer noopener"><Github /> Source</a> : <span>No public source linked</span>}
            {project.demoId ? <button type="button" onClick={() => onDemo(project)}><MonitorUp /> Demo in desktop</button> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function WorkspaceNav() {
  return <nav className={styles.workspaceNav} aria-label="Complete profile workspaces"><a href="#complete-profile">Systems</a><a href="#projects">Backend</a><a href="#infrastructure-projects">Infrastructure</a><a href="#ml-vision">ML & vision</a><a href="#research-teaching">Research & teaching</a></nav>;
}

function RelatedWork({ title, items }: Readonly<{ title: string; items: readonly string[] }>) {
  return <aside className={styles.relatedWork}><h3>{title}</h3><ul>{items.map((item) => <li key={item}><Check /> {item}</li>)}</ul></aside>;
}
