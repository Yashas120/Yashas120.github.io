"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useScroll } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUpRight, FileText, Github, Linkedin, Mail } from "lucide-react";
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
import { BackendHeader } from "./BackendHeader";
import { BackendStage } from "./BackendStage";
import { BackendProjectLabs } from "./BackendProjectLabs";
import { WorkEvidenceLinks, WorkIndex, WorkLabels } from "./WorkIndex";

const actionClass = "bk-action";
const deploymentOutcome = outcomeById["deployment-time"];
const sdkOutcome = outcomeById["sdk-manual-work"];
const pageLoadOutcome = outcomeById["page-load"];
const outageOutcome = outcomeById.outages;

function StorySection({
  id,
  eyebrow,
  heading,
  children,
  className = "",
}: Readonly<{ id: string; eyebrow: string; heading: string; children: ReactNode; className?: string }>) {
  const range = sceneRanges.find((scene) => scene.id === id);
  const minHeight = range ? Math.max((range.end - range.start) * 1180, 76) : 90;
  const style = { "--bk-scene-min": `${minHeight}svh` } as CSSProperties;
  return (
    <section id={id} className={`bk-story-section ${className}`} style={style}>
      <div className="bk-section-card">
        <p className="bk-eyebrow">{eyebrow}</p>
        <h2>{heading}</h2>
        {children}
      </div>
    </section>
  );
}

function InlineFlow({ items, label }: Readonly<{ items: readonly string[]; label: string }>) {
  return (
    <ol className="bk-inline-flow" aria-label={label}>
      {items.map((item, index) => (
        <li key={item}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{item}</strong>
          {index < items.length - 1 && <ArrowRight aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

function Metric({ value, label, detail }: Readonly<{ value: string; label: string; detail: string }>) {
  return (
    <div className="bk-metric">
      <p>{value}</p>
      <strong>{label}</strong>
      <span>{detail}</span>
    </div>
  );
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

export function BackendStory() {
  const storyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: storyRef, offset: ["start start", "end end"] });
  const [activeScene, setActiveScene] = useState(0);

  useEffect(() => {
    const root = storyRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const next = sceneRanges.findIndex((scene) => scene.id === visible.target.id);
        if (next >= 0) setActiveScene(next);
      },
      { rootMargin: "-34% 0px -52% 0px", threshold: [0, 0.15, 0.35, 0.65] },
    );
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
        <BackendStage progress={scrollYProgress} activeScene={activeScene} />
        <div className="bk-story__foreground">
          <section id="overview" className="bk-story-section bk-hero" style={{ "--bk-scene-min": "92svh" } as CSSProperties}>
            <div className="bk-section-card">
              <p className="bk-eyebrow">BACKEND · PLATFORM · RELIABILITY</p>
              <h1>I build backend systems that replace repeated work with reliable infrastructure.</h1>
              <p className="bk-lede">
                I&apos;m Yashas Kadambi, a systems-oriented software engineer with roughly three years of production experience spanning backend platforms, cloud infrastructure, optical line-card software, developer tooling, and reliability. I begin an MSCS at UC San Diego in September 2026.
              </p>
              <p className="bk-lens">This is my complete engineering portfolio, ordered through a backend and platform lens.</p>
              <Metric
                value={`${deploymentOutcome.value}%`}
                label="faster deployments"
                detail={deploymentOutcome.context}
              />
              <div className="bk-actions">
                <a className={`${actionClass} is-primary`} href="#experience">Experience <ArrowDown aria-hidden /></a>
                <a className={actionClass} href="#projects">Projects &amp; demos</a>
                <a className={actionClass} href={resumeState.publicHref} target="_blank" rel="noreferrer">Résumé <ArrowUpRight aria-hidden /></a>
                <a className={actionClass} href={contactLinks.emailHref}>Email</a>
              </div>
            </div>
          </section>

          <StorySection id="experience" eyebrow="PROFESSIONAL THROUGHLINE" heading="One career, several system layers.">
            <p className="bk-lede">
              I moved from API contracts and delivery automation, to backend and cloud-platform ownership, to production software at the hardware boundary. Before Cisco, I independently turned a mechanical-engineering workflow into a shipped internal tool. Across each role, the pattern is the same: understand the real system, remove repeated work, make change safer, and leave the next engineer with a better operating surface.
            </p>
            <ol className="bk-timeline">
              {roleEvidence.slice(0, 4).map((role) => (
                <li key={role.id} className={role.id === "cisco-backend" ? "is-route-focus" : ""}>
                  <p>{role.start}–{role.end}</p>
                  <h3>{role.organization} · {role.title}</h3>
                  <span>{role.mechanism}</span>
                </li>
              ))}
            </ol>
            <aside className="bk-parallel-track">
              <span>PARALLEL TEACHING TRACK</span>
              <strong>{roleById["pes-ta"].organization} · {roleById["pes-ta"].title}</strong>
              <p>{roleById["pes-ta"].start}–{roleById["pes-ta"].end} · {roleById["pes-ta"].summary}</p>
            </aside>
          </StorySection>

          <StorySection id="infrastructure" eyebrow="INFRASTRUCTURE AS CODE" heading="Infrastructure became a dependency graph, not a checklist.">
            <p className="bk-lede">At Cisco, I helped move backend services toward reusable Terraform modules across EC2, ECS, Lambda, RDS, DynamoDB, SQS, SNS, and IAM. I modeled deployment dependencies so independent work could run in parallel while dependent changes stayed ordered. The result was a {deploymentOutcome.value}% reduction in deployment time.</p>
            <InlineFlow items={["desired state", "dependency plan", "human review", "parallel groups", "converged state"]} label="Infrastructure change flow" />
            <div className="bk-comparison" aria-label="Serial plan compared with a dependency-aware plan">
              <div><span>BEFORE</span><strong>network → compute → data → events → identity</strong><p>One avoidably serial path.</p></div>
              <div><span>AFTER</span><strong>network → compute + data → events + identity</strong><p>Only real prerequisites stay ordered.</p></div>
            </div>
            <aside className="bk-review-note"><strong>HUMAN REVIEW</strong><p>Production-impacting change remains reviewable. Scrolling never requires a click and this is not an AI execution claim.</p></aside>
            <p>Earlier, as a technical intern, I built GitHub Actions delivery for generated Python and Java SDKs. An OpenAPI change could regenerate and publish the artifacts while the version bump remained an intentional release decision, replacing roughly {sdkOutcome.value} hours of manual generation and publication.</p>
          </StorySection>

          <StorySection id="events" eyebrow="EVENT-DRIVEN SYSTEMS" heading="One durable write became a regional delivery path.">
            <p className="bk-lede">I worked on a cross-region workflow in which a DynamoDB insert emitted through SNS, fanned out to regional SQS queues, and let services update their local SQL state. The architecture decoupled the source write from regional consumers and made the system&apos;s handoff points explicit.</p>
            <InlineFlow items={["DynamoDB insert", "SNS fan-out", "regional SQS queues", "regional consumers", "local SQL state"]} label="Verified event topology" />
            <aside className="bk-evidence-boundary">
              <strong>EVIDENCE BOUNDARY</strong>
              <p>The source record confirms DynamoDB → SNS → regional SQS. Retry policy, dead-letter queues, idempotency, duplicate handling, and ordering guarantees are not documented here and are not presented as career claims.</p>
            </aside>
          </StorySection>

          <StorySection id="reliability" eyebrow="RELIABILITY & MIGRATION" heading="Reliability work starts where the diagram stops.">
            <p className="bk-lede">I traced backend and database behavior to move filtering closer to the data, improving page-load time by {pageLoadOutcome.value}%. I partnered with operations and infrastructure teams to root-cause {outageOutcome.value} production outages and convert the findings into prevention work.</p>
            <InlineFlow items={["observe", "isolate", "change", "verify", "prevent recurrence"]} label="Reliability method" />
            <div className="bk-metric-row">
              <Metric value={`${pageLoadOutcome.value}%`} label="faster page loads" detail="Filtering moved toward the data after tracing the bottleneck." />
              <Metric value={outageOutcome.value} label="production outage RCAs" detail="An aggregate outcome, not four fabricated incident records." />
            </div>
            <p>For authentication and API-gateway modernization, I used traffic evidence to discover real consumers, preserved compatibility, and staged rollout behind feature flags. I also contributed to a database replacement path that used transaction records to move state without planned downtime.</p>
            <p>The same role involved reconstructing local execution for mature services, diagnosing opaque Java dependencies, adapting data tooling to constrained developer environments, standardizing logs and repository setup, and supporting OpenSearch, Protobuf, and API-lifecycle compatibility.</p>
            <p>I mentored an intern and a non-traditional apprentice, onboarded four engineers, and turned repeated setup and debugging knowledge into reusable guides.</p>
          </StorySection>

          <StorySection id="systems" eyebrow="SYSTEMS BREADTH · LATEST CISCO ROLE" heading="The same reliability discipline continued down to the line card.">
            <p className="bk-role-line">Cisco · Optical Software Development Engineer II · Jan 2025–2026</p>
            <p className="bk-lede">On a new optical line-card platform, I worked in C across coherent-DSP integration, secure-boot-aware delivery, high-speed Ethernet modes, and the boundary between platform software and programmable hardware. The work demanded conservative change, platform bring-up, and debugging across components that fail in different ways.</p>
            <div className="bk-state-table" role="table" aria-label="Warm reload state reconciliation">
              <div role="row"><span role="columnheader">Current hardware state</span><span role="columnheader">Desired software state</span><span role="columnheader">Action</span></div>
              <div role="row"><span role="cell">matches</span><span role="cell">matches</span><strong role="cell">preserve</strong></div>
              <div role="row"><span role="cell">diverged</span><span role="cell">required</span><strong role="cell">change</strong></div>
            </div>
            <p>I generalized and owned a Mark-and-Sweep path for warm reloads: compare desired software state with current hardware state, preserve resources that already match, and change only what diverged. That is control-plane reasoning expressed against physical state.</p>
            <p>I built a hardware-independent CMocka architecture that isolated production C code behind generated and card-specific boundaries, turning a hardware-coupled feedback loop into fast local tests and making the approach mandatory for new code.</p>
            <p>I also built small build, deploy, performance-monitoring, and device-log tools and root-caused a firmware or programmable-device release blocker across component boundaries. Disclosure-sensitive platform names, counts, and timings remain withheld.</p>
          </StorySection>

          <StorySection id="automation" eyebrow="AUTOMATION LINEAGE" heading="Automation is a durable career pattern.">
            <div className="bk-role-cards">
              <article>
                <span>PROFESSIONAL · SHIPPED</span>
                <h3>Cisco · Technical Intern · Jan–Jul 2023</h3>
                <p>I built GitHub Actions automation that generated and published Python and Java SDKs when the OpenAPI contract changed, replacing roughly {sdkOutcome.value} hours of manual release work while keeping version choice intentional.</p>
                <p>I also standardized API descriptions and documentation, shipped Java backend and filtering changes, reconstructed a Colima-based local workflow, and evaluated an approximately 500 GB AWS Glue data pipeline as a <strong>PROOF OF CONCEPT</strong>.</p>
                <InlineFlow items={["OpenAPI contract", "generate Python + Java", "human version choice", "publish artifacts"]} label="SDK delivery flow" />
              </article>
              <article>
                <span>PROFESSIONAL · SHIPPED</span>
                <h3>Schneider Electric · Summer Intern · Jun–Aug 2022</h3>
                <p>As the sole software engineer embedded with a mechanical team, I took a Python/Tkinter decision tool from requirements through internal deployment. It turned an Excel-backed engineering knowledge base and roughly twenty recurring workflows into a guided interface.</p>
                <Metric value="2 days → 2 hours" label="representative workflow" detail="More than 90% shorter, with the mechanism and context kept together." />
              </article>
            </div>
          </StorySection>

          <StorySection id="projects" eyebrow="FEATURED PROJECTS" heading="Proof objects, with ownership made explicit." className="bk-wide-section">
            <p className="bk-lede">Four projects receive detailed treatment because they show backend delivery, protocol-level implementation, algorithmic systems work, and reproducible research. Ownership and limitations are part of the evidence.</p>
            <div className="bk-project-grid">
              {featuredWorkIds.map((id) => <FeaturedProject key={id} work={workById[id]} />)}
            </div>
          </StorySection>

          <BackendProjectLabs />

          <StorySection id="research-teaching" eyebrow="RESEARCH · TEACHING · EDUCATION · LEADERSHIP" heading="Breadth that strengthens engineering judgment." className="bk-wide-section">
            <div className="bk-ledger-grid">
              <section>
                <h3>Peer-reviewed publications</h3>
                <ol>{publications.map((paper) => <li key={paper.href}><span>{paper.labels.join(" · ")}</span><a href={paper.href} target="_blank" rel="noreferrer">{paper.title} <ArrowUpRight aria-hidden /></a><p>{paper.venue}</p></li>)}</ol>
              </section>
              <section>
                <h3>Teaching is another form of systems design.</h3>
                <p>As a PES University teaching assistant from July 2022 to May 2023, I supported 656 learners across three courses and built assignments, labs, grading tools, and feedback paths.</p>
                <ol>{teaching.map((course) => <li key={course.title}><strong>{course.title} · {course.approx ? "~" : ""}{course.count} learners</strong><p>{course.mechanism}</p></li>)}</ol>
              </section>
              <section>
                <h3>Education</h3>
                <ol>{education.map((item) => <li key={item.school}><strong>{item.school}</strong><p>{item.degree} · {item.dates}</p><span>{item.detail}</span></li>)}</ol>
              </section>
              <section>
                <h3>Recognition &amp; leadership</h3>
                <ol>{recognition.map((item) => <li key={item.title}><span>{item.state}</span><strong>{item.title}</strong><p>{item.detail}</p></li>)}</ol>
              </section>
            </div>
          </StorySection>

          <StorySection id="work-index" eyebrow="COMPLETE WORK INDEX" heading="The complete, auditable work index." className="bk-wide-section bk-index-section">
            <p className="bk-lede">Everything is visible by default. Filters narrow the ledger; they never create the evidence or flatten coursework, forks, prototypes, and production work into one status.</p>
            <WorkIndex />
            <div className="bk-skills">
              <h3>Operating layers, tied back to evidence</h3>
              <div>
                {skillLayers.map((layer) => (
                  <article key={layer.title}>
                    <span>Evidence: {roleById[layer.evidenceId]?.organization ?? workById[layer.evidenceId]?.title}</span>
                    <h4>{layer.title}</h4>
                    <p>{layer.items}</p>
                  </article>
                ))}
              </div>
            </div>
          </StorySection>

          <StorySection id="contact" eyebrow="CONTACT" heading="Build the control plane with me." className="bk-contact-section">
            <p className="bk-lede">I&apos;m interested in backend, platform, infrastructure, reliability, and forward-deployed engineering roles where the work spans code, operations, and the real constraints around a system.</p>
            <p className="bk-context">Incoming M.S. Computer Science student at UC San Diego · September 2026</p>
            <div className="bk-actions">
              <a className={`${actionClass} is-primary`} href={contactLinks.emailHref}><Mail aria-hidden /> Email Yashas</a>
              <a className={actionClass} href={resumeState.publicHref} target="_blank" rel="noreferrer"><FileText aria-hidden /> Résumé <ArrowUpRight aria-hidden /></a>
              <a className={actionClass} href={contactLinks.github} target="_blank" rel="noreferrer"><Github aria-hidden /> GitHub <ArrowUpRight aria-hidden /></a>
              <a className={actionClass} href={contactLinks.linkedin} target="_blank" rel="noreferrer"><Linkedin aria-hidden /> LinkedIn <ArrowUpRight aria-hidden /></a>
            </div>
            <a className="bk-email" href={contactLinks.emailHref}>{contactLinks.email}</a>
          </StorySection>
        </div>
      </div>
    </>
  );
}
