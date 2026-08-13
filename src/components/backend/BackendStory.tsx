"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUpRight, FileText, Github, Linkedin, Mail } from "lucide-react";
import type { DemoId } from "@/data/demos";
import {
  contactLinks,
  education,
  featuredWorkIds,
  outcomeById,
  publications,
  recognition,
  resumeState,
  roleById,
  roleEvidence,
  sceneRanges,
  skillLayers,
  teaching,
  workById,
  type WorkEvidence,
} from "@/data/backend";
import { ProjectDemoPresentation } from "@/components/demos/ProjectDemoPresentation";
import { BackendHeader } from "./BackendHeader";
import { BackendStage } from "./BackendStage";
import { StaticControlPlane } from "./StaticControlPlane";
import { WorkEvidenceLinks, WorkIndex, WorkLabels } from "./WorkIndex";

const actionClass = "bk-action";
const deploymentOutcome = outcomeById["deployment-time"];
const sdkOutcome = outcomeById["sdk-manual-work"];
const pageLoadOutcome = outcomeById["page-load"];
const outageOutcome = outcomeById.outages;
const projectIds: readonly DemoId[] = ["cloud", "bitcoin", "multiview", "swift"];

function StorySection({ id, eyebrow, heading, children, className = "", span }: Readonly<{ id: string; eyebrow: string; heading: string; children: ReactNode; className?: string; span?: number }>) {
  const minHeight = span ?? 88;
  return (
    <section id={id} data-backend-act={id} className={`bk-story-section ${className}`} style={{ "--bk-scene-min": `${minHeight}svh` } as CSSProperties}>
      <div className="bk-section-card">
        <p className="bk-eyebrow">{eyebrow}</p>
        <h2>{heading}</h2>
        {children}
        <StaticControlPlane act={id} />
      </div>
    </section>
  );
}

function InlineFlow({ items, label }: Readonly<{ items: readonly string[]; label: string }>) {
  return <ol className="bk-inline-flow" aria-label={label}>{items.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong>{index < items.length - 1 && <ArrowRight aria-hidden />}</li>)}</ol>;
}

function Metric({ value, label, detail }: Readonly<{ value: string; label: string; detail: string }>) {
  return <div className="bk-metric"><p>{value}</p><strong>{label}</strong><span>{detail}</span></div>;
}

function FeaturedProject({ work }: Readonly<{ work: WorkEvidence }>) {
  return (
    <article className="bk-project-card">
      <WorkLabels work={work} featured />
      <h3>{work.title}</h3>
      <p>{work.summary}</p>
      <dl>
        <div><dt>Contribution</dt><dd>{work.contribution}</dd></div>
        <div><dt>Mechanism</dt><dd>{work.technologies.join(" · ")}</dd></div>
        <div><dt>Why here</dt><dd>{work.routeRelevance.join(" · ")}</dd></div>
        {work.limitation && <div><dt>Boundary</dt><dd>{work.limitation}</dd></div>}
      </dl>
      <WorkEvidenceLinks work={work} />
    </article>
  );
}

const demoTheme = { accent: "#76b3ff", surface: "#0b131e", border: "rgba(118,179,255,.28)", text: "#edf4fb", muted: "#a8b6c7", label: "Shared project proof" };

export function BackendStory() {
  const storyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeProjectRef = useRef<DemoId>("cloud");
  const projectDemoVisibleRef = useRef(false);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const [activeScene, setActiveScene] = useState(0);
  const [activeProject, setActiveProject] = useState<DemoId>("cloud");
  const [projectDemoVisible, setProjectDemoVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (value < 0.78 || value >= 0.96) {
      if (projectDemoVisibleRef.current) {
        projectDemoVisibleRef.current = false;
        setProjectDemoVisible(false);
      }
      return;
    }
    const index = Math.min(3, Math.max(0, Math.floor((value - 0.78) / 0.045)));
    const next = projectIds[index];
    if (activeProjectRef.current !== next) {
      activeProjectRef.current = next;
      setActiveProject(next);
    }
    const substate = ((value - 0.78) % 0.045) / 0.045;
    const nextVisible = substate >= 0.38;
    if (projectDemoVisibleRef.current !== nextVisible) {
      projectDemoVisibleRef.current = nextVisible;
      setProjectDemoVisible(nextVisible);
    }
  });

  useEffect(() => {
    const root = storyRef.current;
    if (!root) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const next = sceneRanges.findIndex((scene) => scene.id === visible.target.id);
      if (next >= 0) setActiveScene(next);
    }, { rootMargin: "-34% 0px -52% 0px", threshold: [0, 0.15, 0.35, 0.65] });
    for (const scene of sceneRanges) {
      const section = root.querySelector(`#${scene.id}`);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  const activeId = sceneRanges[activeScene]?.id ?? "overview";

  return (
    <>
      <BackendHeader activeId={activeId} />
      <div ref={storyRef} className="bk-story">
        <div ref={trackRef} className="bk-story__track" data-story-span="1030">
          <BackendStage progress={scrollYProgress} activeProject={activeProject} projectDemoVisible={projectDemoVisible} />
          <div className="bk-story__foreground">
          <section id="overview" data-backend-act="overview" className="bk-story-section bk-hero" style={{ "--bk-scene-min": "103svh" } as CSSProperties}>
            <div className="bk-section-card">
              <p className="bk-eyebrow">BACKEND · PLATFORM · RELIABILITY</p>
              <h1>I build backend systems that replace repeated work with reliable infrastructure.</h1>
              <p className="bk-lede bk-hero-full-lede">I&apos;m Yashas Kadambi, a systems-oriented software engineer with roughly three years of production experience spanning backend platforms, cloud infrastructure, optical line-card software, developer tooling, and reliability. I begin an MSCS at UC San Diego in September 2026.</p>
              <p className="bk-lede bk-hero-compact-lede">I&apos;m Yashas Kadambi, a backend and systems engineer with roughly three years of production experience across platforms, reliability, and optical software.</p>
              <p className="bk-lens">This is my complete engineering portfolio, ordered through a backend and platform lens.</p>
              <Metric value={`${deploymentOutcome.value}%`} label="faster deployments" detail="Dependency-aware execution removed avoidable deployment serialization." />
              <div className="bk-actions">
                <a className={`${actionClass} is-primary`} href="#experience">Experience <ArrowDown aria-hidden /></a>
                <a className={actionClass} href="#projects">Project labs</a>
                <a className={actionClass} href={resumeState.publicHref} target="_blank" rel="noreferrer">Résumé <ArrowUpRight aria-hidden /></a>
                <a className={actionClass} href={contactLinks.emailHref}>Email</a>
              </div>
              <StaticControlPlane act="overview" />
            </div>
          </section>

          <StorySection id="experience" eyebrow="PROFESSIONAL THROUGHLINE" heading="One career, several system layers." span={119}>
            <p className="bk-lede">I moved from API contracts and delivery automation, to backend and cloud-platform ownership, to production software at the hardware boundary. Before Cisco, I independently turned a mechanical-engineering workflow into a shipped internal tool. Across each role, the pattern is the same: understand the real system, remove repeated work, make change safer, and leave the next engineer with a better operating surface.</p>
            <details className="bk-evidence-drawer"><summary>Professional evidence · four roles</summary><ol className="bk-timeline">{roleEvidence.slice(0, 4).map((role) => <li key={role.id} className={role.id === "cisco-backend" ? "is-route-focus" : ""}><p>{role.start}–{role.end}</p><h3>{role.organization} · {role.title}</h3><span>{role.mechanism}</span></li>)}</ol></details>
            <aside className="bk-parallel-track"><span>PARALLEL TEACHING TRACK</span><strong>{roleById["pes-ta"].organization} · {roleById["pes-ta"].title}</strong><p>{roleById["pes-ta"].start}–{roleById["pes-ta"].end} · {roleById["pes-ta"].summary}</p></aside>
          </StorySection>

          <StorySection id="infrastructure" eyebrow="PLAN · REVIEW · APPLY" heading="Infrastructure became a dependency graph, not a checklist." span={180}>
            <p className="bk-lede">At Cisco, I helped move backend services toward reusable Terraform modules across EC2, ECS, Lambda, RDS, DynamoDB, SQS, SNS, and IAM. I modeled deployment dependencies so independent work could run in parallel while dependent changes stayed ordered. The result was a {deploymentOutcome.value}% reduction in deployment time.</p>
            <InlineFlow items={["inspect current state", "compute difference", "human review", "parallel apply", "converge"]} label="Infrastructure change flow" />
            <aside className="bk-review-note"><strong>HUMAN REVIEW</strong><p>Identity and permission boundaries remain visible to an operator before apply. This conceptual interface explains Yashas&apos;s engineering work; it does not imply an AI performed it.</p></aside>
            <details className="bk-evidence-drawer"><summary>Earlier automation evidence · Cisco internship and Schneider</summary><p>An OpenAPI change regenerated and published Python and Java SDKs while the version choice remained intentional, replacing roughly {sdkOutcome.value} hours of manual generation and publication. The same role included API descriptions, Java backend/filtering changes, a Colima local workflow, and an approximately 500 GB AWS Glue <strong>PROOF OF CONCEPT</strong>.</p><p>At Schneider Electric, as the sole software engineer embedded with a mechanical team, I turned an Excel-backed knowledge base and roughly twenty workflows into a guided Python/Tkinter tool, reducing a representative workflow from about two days to two hours.</p></details>
          </StorySection>

          <StorySection id="events" eyebrow="EVENTS IN MOTION" heading="One durable write became a regional delivery path." span={130}>
            <p className="bk-lede">I worked on a cross-region workflow in which a DynamoDB insert emitted through SNS, fanned out to regional SQS queues, and let services update their local SQL state. The architecture decoupled the source write from regional consumers and made the system&apos;s handoff points explicit.</p>
            <InlineFlow items={["DynamoDB write", "SNS fan-out", "regional SQS A / B", "regional services", "local SQL state"]} label="Verified event topology" />
            <aside className="bk-evidence-boundary"><strong>EVIDENCE BOUNDARY</strong><p>Retry policy, dead-letter queues, idempotency, duplicate handling, and ordering guarantees are not documented and are not shown as shipped behavior.</p></aside>
          </StorySection>

          <StorySection id="reliability" eyebrow="OBSERVE · REPAIR" heading="Reliability work starts where the diagram stops." span={130}>
            <p className="bk-lede">I traced backend and database behavior to move filtering closer to the data, improving page-load time by {pageLoadOutcome.value}%. I partnered with operations and infrastructure teams to root-cause {outageOutcome.value} production outages and convert the findings into prevention work.</p>
            <div className="bk-metric-row"><Metric value={`${pageLoadOutcome.value}%`} label="faster page loads" detail="Filtering moved toward the data after tracing the bottleneck." /><Metric value={outageOutcome.value} label="production outage RCAs" detail="A verified aggregate, not four invented incident animations." /></div>
            <p>For authentication and API-gateway modernization, I used traffic evidence to discover real consumers, preserved compatibility, and staged rollout behind feature flags. The unresolved public scale remains withheld.</p>
            <details className="bk-evidence-drawer"><summary>Mature-system and enablement evidence</summary><p>I reconstructed local execution for mature services, diagnosed opaque Java dependencies, adapted data tooling to constrained environments, standardized logs and repository setup, supported OpenSearch, Protobuf, and API lifecycle compatibility, mentored an intern and apprentice, and onboarded four engineers.</p></details>
          </StorySection>

          <StorySection id="systems" eyebrow="PHYSICAL RECONCILIATION · LATEST CISCO ROLE" heading="The same reliability discipline continued down to the line card." span={120}>
            <p className="bk-role-line">Cisco · Optical Software Development Engineer II · Jan 2025–2026</p>
            <p className="bk-lede">On a new optical line-card platform, I worked in C across coherent-DSP integration, secure-boot-aware delivery, high-speed Ethernet modes, and the boundary between platform software and programmable hardware.</p>
            <div className="bk-state-table" role="table" aria-label="Warm reload state reconciliation"><div role="row"><span role="columnheader">Current hardware state</span><span role="columnheader">Desired software state</span><span role="columnheader">Action</span></div><div role="row"><span role="cell">matches</span><span role="cell">matches</span><strong role="cell">preserve</strong></div><div role="row"><span role="cell">diverged</span><span role="cell">required</span><strong role="cell">change</strong></div></div>
            <p>I generalized and owned a Mark-and-Sweep warm-reload path that preserved matching resources and changed only divergent state. I also built a hardware-independent CMocka architecture around generated and card-specific boundaries, plus build, deploy, monitoring, and device-log tools, and root-caused a cross-component release blocker.</p>
            <p className="bk-publication-note">Internal platform names, exact counts, final 2026 month, and private timings remain verification-gated.</p>
          </StorySection>

          <StorySection id="projects" eyebrow="PROJECT LABS · EXPLAIN → PROVE" heading="The mechanism resolves into the real demo." className="bk-projects-section" span={180}>
            <p className="bk-lede">Four projects receive flagship treatment because each moves from an honest mechanism summary into a real interactive browser lab mounted directly on this page. Cloud-Hack remains visible in the complete index with its verified team contribution.</p>
            <div className="bk-project-grid">{featuredWorkIds.map((id) => <FeaturedProject key={id} work={workById[id]} />)}</div>
            <div className="bk-mobile-project-labs">
              <ProjectDemoPresentation demoId="cloud" theme={demoTheme} autoOpen standaloneHref={null} eyebrow="Request → constraints → allocation" />
              <ProjectDemoPresentation demoId="bitcoin" theme={demoTheme} autoOpen standaloneHref={null} eyebrow="Transaction → hash → sign → verify" />
              <ProjectDemoPresentation demoId="multiview" theme={demoTheme} autoOpen standaloneHref={null} eyebrow="Matches → geometry → triangulation" />
              <ProjectDemoPresentation demoId="swift" theme={demoTheme} autoOpen standaloneHref={null} eyebrow="Spatial / attention + frequency branches" />
            </div>
          </StorySection>

          <StorySection id="contact" eyebrow="CONVERGED · READY FOR THE NEXT SYSTEM" heading="Build the control plane with me." className="bk-contact-section" span={68}>
            <p className="bk-lede">I&apos;m interested in backend, platform, infrastructure, reliability, and forward-deployed engineering roles where the work spans code, operations, and the real constraints around a system.</p><p className="bk-context">Incoming M.S. Computer Science student at UC San Diego · September 2026</p>
            <div className="bk-actions"><a className={`${actionClass} is-primary`} href={contactLinks.emailHref}><Mail aria-hidden /> Email Yashas</a><a className={actionClass} href={resumeState.publicHref} target="_blank" rel="noreferrer"><FileText aria-hidden /> Résumé <ArrowUpRight aria-hidden /></a><a className={actionClass} href={contactLinks.github} target="_blank" rel="noreferrer"><Github aria-hidden /> GitHub <ArrowUpRight aria-hidden /></a><a className={actionClass} href={contactLinks.linkedin} target="_blank" rel="noreferrer"><Linkedin aria-hidden /> LinkedIn <ArrowUpRight aria-hidden /></a></div><a className="bk-email" href={contactLinks.emailHref}>{contactLinks.email}</a>
          </StorySection>
          </div>
        </div>

        <div className="bk-registry">
          <StorySection id="automation" eyebrow="AUTOMATION LINEAGE · COMPLETE ROLE EVIDENCE" heading="Two earlier roles made repeated work operable." className="bk-wide-section">
            <div className="bk-role-cards"><article><span>PROFESSIONAL · SHIPPED</span><h3>Cisco · Technical Intern · Jan–Jul 2023</h3><p>GitHub Actions generated and published Python and Java SDKs from an OpenAPI change, removing roughly four hours of manual release work while preserving intentional version choice.</p><p>Other work included API descriptions, documentation, Java backend/filtering changes, a Colima local workflow, and an approximately 500 GB AWS Glue <strong>PROOF OF CONCEPT</strong>.</p></article><article><span>PROFESSIONAL · SHIPPED</span><h3>Schneider Electric · Summer Intern · Jun–Aug 2022</h3><p>As the sole software engineer embedded with a mechanical team, I turned an Excel-backed knowledge base and roughly twenty workflows into a guided Python/Tkinter tool.</p><Metric value="2 days → 2 hours" label="representative workflow" detail="More than 90% shorter, with context kept beside the result." /></article></div>
          </StorySection>
          <StorySection id="research-teaching" eyebrow="RESEARCH · TEACHING · EDUCATION · LEADERSHIP" heading="Breadth that strengthens engineering judgment." className="bk-wide-section">
            <div className="bk-ledger-grid"><section><h3>Peer-reviewed publications</h3><ol>{publications.map((paper) => <li key={paper.href}><span>{paper.labels.join(" · ")}</span><a href={paper.href} target="_blank" rel="noreferrer">{paper.title} <ArrowUpRight aria-hidden /></a><p>{paper.venue}</p></li>)}</ol></section><section><h3>Teaching is another form of systems design.</h3><p>From July 2022 to May 2023, I supported 656 learners across three courses and built assignments, labs, grading tools, and feedback paths.</p><ol>{teaching.map((course) => <li key={course.title}><strong>{course.title} · {course.approx ? "~" : ""}{course.count} learners</strong><p>{course.mechanism}</p></li>)}</ol></section><section><h3>Education</h3><ol>{education.map((item) => <li key={item.school}><strong>{item.school}</strong><p>{item.degree} · {item.dates}</p><span>{item.detail}</span></li>)}</ol></section><section><h3>Recognition &amp; leadership</h3><ol>{recognition.map((item) => <li key={item.title}><span>{item.state}</span><strong>{item.title}</strong><p>{item.detail}</p></li>)}</ol></section></div>
          </StorySection>

          <StorySection id="work-index" eyebrow="COMPLETE EVIDENCE REGISTRY" heading="The complete, auditable work index." className="bk-wide-section bk-index-section">
            <p className="bk-lede">Everything is visible by default. Filters narrow the registry; they never create evidence or flatten coursework, forks, prototypes, and production work into one status.</p><WorkIndex />
            <div className="bk-skills"><h3>Operating layers, tied back to evidence</h3><div>{skillLayers.map((layer) => <article key={layer.title}><span>Evidence: {roleById[layer.evidenceId]?.organization ?? workById[layer.evidenceId]?.title}</span><h4>{layer.title}</h4><p>{layer.items}</p></article>)}</div></div>
          </StorySection>

        </div>
      </div>
    </>
  );
}
