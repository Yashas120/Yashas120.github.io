import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Download,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Monitor,
} from "lucide-react";
import { courses, teachingStats } from "@/data/teaching";
import { experience } from "@/data/experience";
import { highlights } from "@/data/highlights";
import { kernelPortfolio, workLabels } from "@/data/kernelPortfolio";
import { profile } from "@/data/profile";
import { kernelProjects as projects } from "@/data/projects";
import { publications } from "@/data/publications";
import { evidenceCapabilities, systemsThemes } from "@/data/skills";
import { transcriptSummary } from "@/data/coursework";
import type { PortfolioCaseStudy, Project } from "@/types";
import { SchedulerExperiment } from "./SchedulerExperiment";
import { SystemsVisualizer } from "./SystemsVisualizer";
import styles from "./kernel-overview.module.css";

const projectById = new Map(projects.map((project) => [project.id, project]));
const orderedProjects = kernelPortfolio.projectOrder
  .map((id) => projectById.get(id))
  .filter((project): project is Project => Boolean(project));
const featuredProjects = kernelPortfolio.featuredProjectIds
  .map((id) => projectById.get(id))
  .filter((project): project is Project => Boolean(project));
const caseStudyById = new Map<string, PortfolioCaseStudy>([
  ...experience.flatMap((item) => item.caseStudies ?? []),
  ...projects.flatMap((project) => project.caseStudy ? [project.caseStudy] : []),
].map((caseStudy) => [caseStudy.id, caseStudy]));
const orderedCaseStudies = kernelPortfolio.caseStudyOrder.map((id) => {
  const caseStudy = caseStudyById.get(id);
  if (!caseStudy) throw new Error(`Missing canonical kernel case study: ${id}`);
  return caseStudy;
});
const orderedProof = kernelPortfolio.proofOrder.map((id) => {
  const proof = profile.systemsProof.find((item) => item.id === id);
  if (!proof) throw new Error(`Missing canonical kernel proof: ${id}`);
  return proof;
});

export function KernelPortfolioOverview() {
  const professionalExperience = experience.filter((item) => item.kind === "professional");
  const education = experience.filter((item) => item.kind === "education");
  const [production, hardware, scheduling] = orderedCaseStudies;

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">Skip to content</a>

      <header className={styles.systemBar}>
        <Link href="/kernel" className={styles.wordmark} aria-label="Yashas Kadambi portfolio overview">
          <span className={styles.wordmarkMark} aria-hidden="true">YK</span>
          <span>Portfolio Overview</span>
          <code>/kernel</code>
        </Link>
        <div className={styles.systemActions}>
          <span className={styles.systemStatus}><i aria-hidden="true" /> Profile online</span>
          <Link href="/kernel/lab" className={styles.labButton}>
            <Monitor aria-hidden="true" /> Explore yashOS
          </Link>
        </div>
      </header>

      <nav aria-label="Portfolio sections" className={styles.sectionNav}>
        <div className={styles.sectionNavInner}>
          {kernelPortfolio.sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              <span>{section.label}</span>
              <code>{section.alias}</code>
            </a>
          ))}
        </div>
      </nav>

      <main id="main-content">
        <section id="kernel-hero" className={styles.hero} data-kernel-scene="identity">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{kernelPortfolio.eyebrow}</p>
            <h1>{profile.shortName}</h1>
            <p className={styles.role}>{profile.role}</p>
            <p className={styles.introduction}>{kernelPortfolio.introduction}</p>
            <p className={styles.heroProof}><strong>{orderedProof[0].value}</strong> production C files · <strong>{orderedProof[2].value}</strong> validation cycle</p>
            <p className={styles.currentContext}>{profile.currentContext}</p>
            <div className={styles.heroActions} aria-label="Primary portfolio actions">
              <a href="#production-testing" className={styles.primaryAction}>
                View systems work <ArrowDown aria-hidden="true" />
              </a>
              <a href={profile.resume.href} className={styles.secondaryAction}>
                <Download aria-hidden="true" /> {profile.resume.label}
              </a>
              <Link href="/kernel/lab" className={styles.secondaryAction}>
                <Monitor aria-hidden="true" /> Explore yashOS
              </Link>
            </div>
            <div className={styles.contactActions} aria-label="Profile links">
              <a href={profile.github} target="_blank" rel="noreferrer noopener"><Github aria-hidden="true" /> GitHub</a>
              {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer noopener"><Linkedin aria-hidden="true" /> LinkedIn</a>}
              <a href={`mailto:${profile.email}`}><Mail aria-hidden="true" /> Email</a>
            </div>
          </div>
          <div className={styles.heroVisual}><SystemsVisualizer compact /></div>
        </section>

        <div className={styles.proofStrip} aria-label="Selected evidence">
          {orderedProof.map((proof) => (
            <div key={proof.label}>
              <strong>{proof.value}</strong>
              <span>{proof.label}</span>
            </div>
          ))}
        </div>

        <section className={styles.capabilitySummary} aria-labelledby="capability-summary-title">
          <SectionIntro
            eyebrow="IMMEDIATE CAPABILITY SUMMARY"
            title="What I do at systems boundaries"
            id="capability-summary-title"
            body="Three themes connect the production work and experiments below. Each summary links directly to its evidence."
          />
          <div className={styles.summaryGrid}>
            {systemsThemes.map((capability, index) => (
              <a href={capability.href} key={capability.title}>
                <span className={styles.summaryIndex}>0{index + 1}</span>
                <h3>{capability.title}</h3>
                <p>{capability.body}</p>
                <span className={styles.textLink}>See evidence <ArrowRight aria-hidden="true" /></span>
              </a>
            ))}
          </div>
        </section>

        <div className={styles.caseStudyLayout}>
          <div className={styles.caseStudyColumn}>
            <section id="production-testing" className={`${styles.section} ${styles.caseStudy} ${styles.flagship}`} data-kernel-scene="test-boundary">
              <CaseHeader context={production.context} heading={production.heading} title={production.title} />
              <p className={styles.lead}>{production.body}</p>
              <div className={styles.impact}><span>{production.impactLabel}</span><p>{production.impact}</p></div>
              <ProductionBoundaryDiagram />
              <EvidenceList items={production.evidence ?? []} />
            </section>

            <section id="hardware-integration" className={`${styles.section} ${styles.caseStudy}`} data-kernel-scene="hardware-integration">
              <CaseHeader context={hardware.context} heading={hardware.heading} title={hardware.title} />
              <p className={styles.lead}>{hardware.body}</p>
              <div className={styles.impact}><span>{hardware.impactLabel}</span><p>{hardware.impact}</p></div>
              <HardwarePathDiagram />
              <EvidenceList items={hardware.evidence ?? []} />
            </section>

            <section id="ghost-scheduling" className={`${styles.section} ${styles.caseStudy}`} data-kernel-scene="scheduler">
              <CaseHeader context={scheduling.context} heading={scheduling.heading} title={scheduling.title} />
              <p className={styles.lead}>{scheduling.body}</p>
              <div className={styles.impact}><span>{scheduling.impactLabel}</span><p>{scheduling.impact}</p></div>
              <div className={styles.matrixWrap}>
                <table>
                  <caption>Verified experimental matrix</caption>
                  <tbody>
                    {(scheduling.matrix ?? []).map(([dimension, configuration]) => (
                      <tr key={dimension}><th scope="row">{dimension}</th><td>{configuration}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <SchedulerExperiment />
            </section>
          </div>
          <aside className={styles.stickyVisual} aria-label="System response to the portfolio section">
            <SystemsVisualizer />
          </aside>
        </div>

        <section id="systems-projects" className={`${styles.section} ${styles.fullWidth}`} data-kernel-scene="projects">
          <SectionIntro
            eyebrow="SELECTED SYSTEMS PROJECTS"
            title="Protocol, compiler, and performance work"
            id="systems-projects-title"
            body="The labels below separate context, ownership, and status. A course contribution is not presented as production work, and a public fork is not presented as sole authorship."
          />
          <div className={styles.featuredProjects}>
            {featuredProjects.map((project) => <ProjectCard key={project.id} project={project} featured />)}
          </div>
        </section>

        <section id="experience" className={`${styles.section} ${styles.fullWidth}`} data-kernel-scene="projects">
          <SectionIntro
            eyebrow="COMPLETE PROFESSIONAL EXPERIENCE"
            title="Work experience"
            alias="systemd"
            id="experience-title"
            body="Approximately three years of production engineering comes first; graduate study is listed separately under Education."
          />
          <div className={styles.timeline}>
            {professionalExperience.map((item) => (
              <article key={item.id} className={styles.experienceItem}>
                <div className={styles.experienceWhen}>
                  <span>{item.start} — {item.end}</span>
                  <span>{item.location}</span>
                </div>
                <div>
                  <p className={styles.itemMeta}>{workLabels.ownership[item.ownership]} · Professional</p>
                  <h3>{item.role}</h3>
                  <p className={styles.organization}>{item.org}</p>
                  <p className={styles.scope}>{item.scope}</p>
                  <ul className={styles.outcomes}>
                    {item.points.slice(0, 5).map((point) => <li key={point}>{point}</li>)}
                  </ul>
                  <TechList items={item.technologies} />
                  {item.related?.length ? (
                    <div className={styles.inlineLinks}>{item.related.map((link) => <a href={link.href} key={link.href}>{link.label} <ArrowRight aria-hidden="true" /></a>)}</div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="projects" className={`${styles.section} ${styles.fullWidth}`} data-kernel-scene="projects">
          <SectionIntro
            eyebrow="COMPLETE PROJECT INDEX"
            title="Systems-first, not systems-only"
            alias="htop"
            id="projects-title"
            body={kernelPortfolio.broaderIntroduction}
          />
          <div className={styles.projectIndex}>
            {orderedProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
        </section>

        <section id="research-teaching" className={`${styles.section} ${styles.fullWidth}`} data-kernel-scene="projects">
          <SectionIntro
            eyebrow="RESEARCH · PUBLICATIONS · TEACHING"
            title="Research and teaching"
            alias="papers"
            id="research-teaching-title"
            body={`Two peer-reviewed publications and teaching support across ${teachingStats.courses} computer-science courses.`}
          />
          <div className={styles.researchGrid}>
            <div>
              <h3>Publications</h3>
              {publications.map((publication) => (
                <article className={styles.publication} key={publication.id}>
                  <p>{publication.venue} · {publication.year}</p>
                  <h4>{publication.title}</h4>
                  <ul>{publication.points.map((point) => <li key={point}>{point}</li>)}</ul>
                  <a href={`https://doi.org/${publication.doi}`} target="_blank" rel="noreferrer noopener">DOI {publication.doi} <ExternalLink aria-hidden="true" /></a>
                </article>
              ))}
            </div>
            <div>
              <h3>Teaching at PES University</h3>
              {courses.map((course) => (
                <article className={styles.course} key={course.id}>
                  <p>{course.term}{course.students ? ` · ${course.students}` : ""}</p>
                  <h4>{course.name}</h4>
                  <p>{course.summary}</p>
                  <span>{course.instructor}</span>
                </article>
              ))}
              <Link href="/notebook" className={styles.sectionLink}>Explore teaching materials <ArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
          <div className={styles.achievementRow} aria-label="Other verified accomplishments">
            {highlights.map((highlight) => <div key={highlight.id}><strong>{highlight.label}</strong><span>{highlight.detail}</span></div>)}
          </div>
        </section>

        <section id="education" className={`${styles.section} ${styles.fullWidth}`} data-kernel-scene="identity">
          <SectionIntro eyebrow="EDUCATION" title="Education" alias="profile" id="education-title" />
          <div className={styles.educationGrid}>
            {education.map((item) => (
              <article key={item.id}>
                <span>{item.start} — {item.end}</span>
                <h3>{item.org}</h3>
                <p>{item.role.replace(" (Incoming)", "")}</p>
                <small>{item.scope}</small>
              </article>
            ))}
            <article>
              <span>2019 — 2023</span>
              <h3>PES University</h3>
              <p>B.Tech, Computer Science and Engineering</p>
              <small>GPA {transcriptSummary.usGpa} / 4 · U.S. equivalency: {transcriptSummary.equivalency}</small>
            </article>
          </div>
        </section>

        <section id="capabilities" className={`${styles.section} ${styles.fullWidth}`} data-kernel-scene="capabilities">
          <SectionIntro
            eyebrow="EVIDENCE MAP"
            title="Capabilities backed by work"
            alias="/proc/skills"
            id="capabilities-title"
            body="No percentages or self-scored bars: every group points back to visible work on this page."
          />
          <div className={styles.capabilityMap}>
            {evidenceCapabilities.map((group) => (
              <article key={group.title}>
                <h3>{group.title}</h3>
                <TechList items={[...group.items]} />
                <p>Backed by</p>
                <div className={styles.evidenceLinks}>
                  {group.evidence.map((id) => {
                    const project = projectById.get(id);
                    return <a href={project?.caseStudyUrl ?? `#${id}`} key={id}>{project?.title ?? id.replaceAll("-", " ")} <ArrowRight aria-hidden="true" /></a>;
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className={`${styles.section} ${styles.contact}`} data-kernel-scene="contact">
          <p className={styles.eyebrow}>CONTACT · SERVICES READY</p>
          <h2>Let’s build systems that have to work across real boundaries.</h2>
          <p>For systems software, infrastructure, performance-engineering or hardware-adjacent opportunities, get in touch.</p>
          <div className={styles.heroActions}>
            <a href={profile.resume.href} className={styles.primaryAction}><Download aria-hidden="true" /> {profile.resume.label}</a>
            <a href={`mailto:${profile.email}`} className={styles.secondaryAction}><Mail aria-hidden="true" /> Email Yashas</a>
            <a href={profile.github} target="_blank" rel="noreferrer noopener" className={styles.secondaryAction}><Github aria-hidden="true" /> GitHub</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer noopener" className={styles.secondaryAction}><Linkedin aria-hidden="true" /> LinkedIn</a>
            <Link href="/kernel/lab" className={styles.secondaryAction}><Monitor aria-hidden="true" /> Explore yashOS</Link>
          </div>
          <p className={styles.contactAddress}>{profile.email} · {profile.location}</p>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Yashas Kadambi · Systems Software Engineer</span>
        <a href="#kernel-hero">Return to top ↑</a>
      </footer>
    </div>
  );
}

function SectionIntro({ eyebrow, title, body, alias, id }: Readonly<{ eyebrow: string; title: string; body?: string; alias?: string; id: string }>) {
  return (
    <header className={styles.sectionIntro}>
      <p>{eyebrow}</p>
      <h2 id={id}>{title}{alias ? <code>{alias}</code> : null}</h2>
      {body ? <div>{body}</div> : null}
    </header>
  );
}

function CaseHeader({ context, heading, title }: Readonly<{ context: string; heading: string; title: string }>) {
  return <header className={styles.caseHeader}><p>{context}</p><span>{heading}</span><h2>{title}</h2></header>;
}

function EvidenceList({ items }: Readonly<{ items: readonly string[] }>) {
  return <ul className={styles.evidenceList}>{items.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul>;
}

function TechList({ items }: Readonly<{ items: string[] }>) {
  return <ul className={styles.techList} aria-label="Technologies">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function ProjectCard({ project, featured = false }: Readonly<{ project: Project; featured?: boolean }>) {
  return (
    <article id={project.id} className={`${styles.projectCard} ${featured ? styles.projectFeatured : ""}`}>
      <div className={styles.classification} aria-label="Project classification">
        <span>{workLabels.context[project.context]}</span>
        <span>{workLabels.ownership[project.ownership]}</span>
        <span>{workLabels.status[project.status]}</span>
      </div>
      <h3>{project.title}</h3>
      <p className={styles.projectPurpose}>{project.blurb}</p>
      {featured ? <p>{project.detail}</p> : null}
      <dl className={styles.projectFacts}>
        <div><dt>Contribution</dt><dd>{project.contribution}</dd></div>
        <div><dt>Outcome</dt><dd>{project.outcome}</dd></div>
        {project.evidence.length ? <div><dt>Evidence</dt><dd>{project.evidence.map((item) => <span key={item.label}><b>{item.label}</b>{item.value ? ` — ${item.value}` : ""}</span>)}</dd></div> : null}
      </dl>
      <TechList items={project.tech} />
      <div className={styles.projectLinks}>
        {project.repoUrl ? <a href={project.repoUrl} target="_blank" rel="noreferrer noopener"><Github aria-hidden="true" /> Source</a> : <span>No public source linked</span>}
        {project.caseStudyUrl ? <a href={project.caseStudyUrl}>Case study <ArrowRight aria-hidden="true" /></a> : null}
        {project.demoId ? <Link href={`/kernel/lab?app=demo-lab&demo=${project.demoId}`}>Run live demo in yashOS <ExternalLink aria-hidden="true" /></Link> : null}
      </div>
    </article>
  );
}

function ProductionBoundaryDiagram() {
  return (
    <figure className={styles.inlineDiagram}>
      <div className={styles.boundaryDiagram} aria-hidden="true">
        <span>Test cases</span><b>→</b><span className={styles.healthyNode}>Production C</span><b>→</b>
        <span className={styles.boundaryNode}>SDK boundary stubs</span><b>→</b><span className={styles.hardwareNode}>Physical hardware</span>
      </div>
      <figcaption>The real production source stays under test. Only external SDK and hardware dependencies move behind the controlled test boundary.</figcaption>
    </figure>
  );
}

function HardwarePathDiagram() {
  const nodes = ["Platform software", "Device API", "FPGA / FPD", "CDR", "Optical hardware"];
  return (
    <figure className={styles.inlineDiagram}>
      <div className={styles.hardwarePath} aria-hidden="true">{nodes.map((node, index) => <span key={node}>{node}{index < nodes.length - 1 ? <b>→</b> : null}</span>)}</div>
      <div className={styles.secureBoot} aria-hidden="true"><span>Root of trust ✓</span><span>Firmware ✓</span><span>FPGA/FPD ✓</span><span>Application ✓</span></div>
      <figcaption>Platform software reaches the optical device through device and firmware boundaries. Secure boot authenticates each stage before execution continues.</figcaption>
    </figure>
  );
}
