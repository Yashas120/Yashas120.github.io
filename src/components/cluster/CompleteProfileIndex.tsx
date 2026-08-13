import { Fragment } from "react";
import { ProjectDemoPresentation } from "@/components/demos/ProjectDemoPresentation";
import { PROJECT_DEMO_EVIDENCE, type DemoId } from "@/data/demos";
import {
  beyondLens,
  contact,
  education,
  experience,
  featuredSystems,
  leadership,
  links,
  proofLinks,
  publications,
  scopeBands,
  teaching,
  type EvidenceItem,
  type PublicLink,
} from "@/lib/clusterContent";
import {
  projectEvidenceGroups,
  projectEvidenceLabels,
  projectIndexIntro,
  type ProjectEvidenceItem,
  type ProjectEvidenceLink,
} from "@/lib/clusterProjectIndex";
import styles from "./cluster.module.css";

function EvidenceLink({ link }: Readonly<{ link: PublicLink }>) {
  return (
    <a
      className={styles.entryLink}
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noreferrer noopener" : undefined}
      aria-label={`${link.label}${link.detail ? `, ${link.detail}` : ""}${link.external ? " (opens in a new tab)" : ""}`}
    >
      {link.label}
      {link.external && <span aria-hidden="true"> ↗</span>}
    </a>
  );
}

function Labels({ items }: Readonly<{ items: string[] }>) {
  return (
    <div className={styles.labels} aria-label="Ownership and status">
      {items.map((item) => (
        <span className={styles.label} key={item}>
          {item}
        </span>
      ))}
    </div>
  );
}

function SectionIntro({ eyebrow, heading, body, headingId }: Readonly<{ eyebrow: string; heading: string; body?: string; headingId?: string }>) {
  return (
    <header>
      <p className={styles.sectionEyebrow}>{eyebrow}</p>
      <h2 id={headingId} className={styles.sectionHeading}>{heading}</h2>
      {body && <p className={styles.sectionIntro}>{body}</p>}
    </header>
  );
}

function EditorialEvidenceRow({ item }: Readonly<{ item: EvidenceItem }>) {
  return (
    <article className={styles.editorialRow} data-editorial-evidence-row>
      <div>
        <h3 className={styles.entryTitle}>{item.name}</h3>
        <Labels items={item.labels} />
      </div>
      <div>
        <p className={styles.entryDescription}>{item.description}</p>
        {item.boundary && <p className={styles.boundary}>{item.boundary}</p>}
        <p className={styles.entryMeta}>
          {item.relationship} · {item.status} · {item.domain}
        </p>
        {item.links.length > 0 && (
          <div className={styles.entryLinks}>
            {item.links.map((link) => (
              <EvidenceLink key={link.href} link={link} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

const featuredAtTop = new Set<DemoId>(["cifar", "cloud"]);

function demoFor(item: EvidenceItem): DemoId | undefined {
  const evidenceLinks = new Set(item.links.map((link) => link.href));
  return PROJECT_DEMO_EVIDENCE.find(
    (project) => project.projectSourceHref && evidenceLinks.has(project.projectSourceHref),
  )?.demoId;
}

const compactTheme = {
  accent: "#ff6b35",
  surface: "#111824",
  border: "rgba(255, 107, 53, 0.3)",
  text: "#f8f6f1",
  muted: "#b8bdc8",
  label: "Evidence index · live implementation",
};

function IndexEvidenceLink({ link, title }: Readonly<{ link: ProjectEvidenceLink; title: string }>) {
  const external = link.href.startsWith("http");
  return (
    <a
      className={styles.indexEvidenceLink}
      href={link.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      aria-label={`${link.label}: evidence for ${title}${external ? " (opens in a new tab)" : ""}`}
    >
      {link.label} <span aria-hidden="true">{external ? "↗" : "↑"}</span>
    </a>
  );
}

function ProjectIndexRow({ item }: Readonly<{ item: ProjectEvidenceItem }>) {
  const metadata = [
    ["Context", projectEvidenceLabels.context[item.context]],
    ["Contribution model", projectEvidenceLabels.contribution[item.contributionModel]],
    ["Repository", projectEvidenceLabels.provenance[item.repositoryProvenance]],
    ["Artifact", projectEvidenceLabels.artifact[item.artifactKind]],
    ["Lifecycle", projectEvidenceLabels.lifecycle[item.lifecycle]],
  ] as const;

  return (
    <article
      id={`evidence-${item.id}`}
      className={styles.indexRow}
      data-project-evidence-item={item.id}
      data-evidence-group={item.group}
      data-index-compact={item.compact || undefined}
    >
      <div className={styles.indexIdentity}>
        <h4 className={styles.indexTitle}>{item.title}</h4>
        <dl className={styles.indexMetadata}>
          {metadata.map(([term, value]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={styles.indexNarrative}>
        <p className={styles.indexDescription}>{item.description}</p>
        <p className={styles.indexContribution}><span>Contribution</span>{item.contribution}</p>
        {item.boundary && <p className={styles.indexBoundary}>{item.boundary}</p>}
        {item.featuredAnchor && <a className={styles.indexDetailedLink} href={item.featuredAnchor}>Detailed above <span aria-hidden="true">↑</span></a>}
      </div>

      <div className={styles.indexProof}>
        <p className={styles.indexFieldLabel}>Domain</p>
        <p className={styles.indexDomain}>{item.domains.join(" · ")}</p>
        <p className={styles.indexFieldLabel}>Evidence</p>
        <p className={styles.indexEvidenceType}>{item.evidenceTypes.map((type) => projectEvidenceLabels.evidence[type]).join(" · ")}</p>
        {item.evidenceNote && <p className={styles.indexEvidenceNote}>{item.evidenceNote}</p>}
        {item.links.length > 0 && (
          <div className={styles.indexEvidenceLinks}>
            {item.links.map((link) => <IndexEvidenceLink key={`${link.kind}-${link.href}`} link={link} title={item.title} />)}
          </div>
        )}
      </div>
    </article>
  );
}

export function CompleteProfileIndex() {
  return (
    <div className={styles.profile}>
      <div className={styles.profileInner}>
        <section id="complete-profile" className={styles.profileSection} aria-labelledby="experience-heading">
          <div id="experience">
            <SectionIntro
              eyebrow="Experience"
              heading="Production work, in full."
              headingId="experience-heading"
              body="Four roles show a progression from internal tooling and cloud-platform automation to multi-region production services and optical platform software."
            />
            <div className={styles.timeline}>
              {experience.map((role) => (
                <article id={role.id} className={styles.role} key={role.id}>
                  <div className={styles.roleHeader}>
                    <h3 className={styles.entryTitle}>
                      {role.org} · {role.role}
                    </h3>
                    <p className={styles.date}>{role.dates}</p>
                  </div>
                  <Labels items={role.labels} />
                  <p className={styles.entryDescription}>{role.summary}</p>
                  <ul className={styles.responsibilities}>
                    {role.responsibilities.map((responsibility) => (
                      <li key={responsibility}>{responsibility}</li>
                    ))}
                  </ul>
                  {role.note && <p className={styles.boundary}>{role.note}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="systems-evidence" className={styles.profileSection}>
          <SectionIntro
            eyebrow="Systems evidence"
            heading="Public work with the boundary left intact."
            body="These projects support the systems lens. They are not presented as production systems, and collaborative contribution and scope remain visible."
          />
          <div className={styles.editorialRows}>
            {featuredSystems.map((item) => {
              const demoId = demoFor(item);
              return <Fragment key={item.name}><EditorialEvidenceRow item={item} />{demoId && !featuredAtTop.has(demoId) && <ProjectDemoPresentation demoId={demoId} theme={compactTheme} headingLevel={3} preview />}</Fragment>;
            })}
          </div>
        </section>

        <section id="beyond-the-lens" className={styles.profileSection}>
          <SectionIntro
            eyebrow="Beyond the lens"
            heading="The rest of the engineering record stays visible."
            body="Distributed systems is the organizing lens for this route, not a claim that every useful project belongs to that category."
          />
          <div className={styles.editorialRows}>
            {beyondLens.map((item) => {
              const demoId = demoFor(item);
              return <Fragment key={item.name}><EditorialEvidenceRow item={item} />{demoId && <ProjectDemoPresentation demoId={demoId} theme={compactTheme} headingLevel={3} preview />}</Fragment>;
            })}
          </div>
        </section>

        <section id="complete-project-index" className={styles.profileSection} aria-labelledby="project-evidence-index-heading">
          <SectionIntro eyebrow={projectIndexIntro.eyebrow} heading={projectIndexIntro.heading} headingId="project-evidence-index-heading" body={projectIndexIntro.body} />
          <dl className={styles.indexLegend} aria-label="Project evidence legend">
            {projectIndexIntro.legend.map((item) => (
              <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>
            ))}
          </dl>
          <div className={styles.indexGroups} aria-label="Complete project and evidence ledger">
            {projectEvidenceGroups.map((group, index) => (
              <section
                key={group.id}
                className={`${styles.indexGroup} ${group.subordinate ? styles.indexGroupSubordinate : ""}`}
                aria-labelledby={`evidence-group-${group.id}`}
                data-evidence-group-section={group.id}
              >
                <header className={styles.indexGroupHeader}>
                  <p className={styles.indexGroupNumber}>{String(index + 1).padStart(2, "0")} / 07</p>
                  <h3 id={`evidence-group-${group.id}`}>{group.title}</h3>
                  <p>{group.introduction}</p>
                </header>
                <div className={styles.indexRows}>
                  {group.items.map((item) => <ProjectIndexRow key={item.id} item={item} />)}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section id="research" className={styles.profileSection}>
          <SectionIntro eyebrow="Research" heading="Research and publications" />
          <div className={styles.simpleList}>
            {publications.map((publication) => (
              <article className={styles.simpleItem} key={publication.title}>
                <h3 className={styles.entryTitle}>{publication.title}</h3>
                <p className={styles.entryMeta}>{publication.meta}</p>
                <p className={styles.entryDescription}>{publication.description}</p>
                <div className={styles.entryLinks}>
                  <EvidenceLink link={publication.link} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="teaching" className={styles.profileSection}>
          <SectionIntro
            eyebrow="Teaching"
            heading="Teaching technical systems at scale"
            body="Teaching strengthened how I decompose mechanisms, review technical work, and make evidence and failure modes legible to different audiences."
          />
          <ul className={styles.simpleList}>
            {teaching.map((appointment) => (
              <li className={styles.simpleItem} key={appointment}>
                <p className={styles.entryTitle}>{appointment}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="education" className={styles.profileSection}>
          <SectionIntro eyebrow="Education" heading="Education" />
          <div className={styles.simpleList}>
            {education.map((entry) => (
              <article className={styles.simpleItem} key={entry.institution}>
                <h3 className={styles.entryTitle}>{entry.institution}</h3>
                <p className={styles.entryDescription}>{entry.degree}</p>
                <p className={styles.entryDescription}>{entry.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="recognition" className={styles.profileSection}>
          <SectionIntro
            eyebrow="Recognition · credentials · leadership · service"
            heading="Contribution beyond the ticket"
            body="Only publication-safe, evidence-confirmed items appear here; unverified awards and credentials are not converted into public claims."
          />
          <div className={styles.simpleList}>
            {leadership.map((entry) => (
              <article className={styles.simpleItem} key={entry.title}>
                <h3 className={styles.entryTitle}>{entry.title}</h3>
                <p className={styles.entryDescription}>{entry.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="scope" className={styles.profileSection}>
          <SectionIntro
            eyebrow="Evidence-derived scope"
            heading="What I work across"
            body="The vocabulary below is derived from visible experience, projects, research, and teaching—not a proficiency meter."
          />
          <div className={styles.scopeGrid}>
            {scopeBands.map((band) => (
              <article className={styles.scopeBand} key={band.title}>
                <h3 className={styles.entryTitle}>{band.title}</h3>
                <p className={styles.entryDescription}>{band.detail}</p>
              </article>
            ))}
          </div>
          <p className={styles.boundary}>
            Claim boundary: managed services are named as dependencies, personal contribution is separated from team work, and prototypes, coursework, collaborative work, and research retain their actual provenance.
          </p>
        </section>

        <footer id="contact" className={styles.contact}>
          <p className={styles.sectionEyebrow}>Contact and proof</p>
          <h2 className={styles.sectionHeading}>{contact.heading}</h2>
          <p className={styles.sectionIntro}>{contact.body}</p>
          <div className={styles.proofLinks}>
            {[...proofLinks, links.demos].map((link) => (
              <EvidenceLink key={link.href} link={link} />
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
