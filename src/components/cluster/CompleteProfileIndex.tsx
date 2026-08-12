import { Fragment } from "react";
import { ProjectDemoPresentation } from "@/components/demos/ProjectDemoPresentation";
import type { DemoId } from "@/data/demos";
import {
  beyondLens,
  contact,
  education,
  experience,
  featuredSystems,
  leadership,
  links,
  projectLedger,
  proofLinks,
  publicExplorations,
  publications,
  scopeBands,
  teaching,
  type EvidenceItem,
  type PublicLink,
} from "@/lib/clusterContent";
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
    <article className={styles.editorialRow}>
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

const staticDemoByRepository: Record<string, DemoId> = {
  "https://github.com/Yashas120/Bitcoin-Transactions-in-java": "bitcoin",
  "https://github.com/Yashas120/SSP": "parallel",
  "https://github.com/Yashas120/SWIFT": "swift",
  "https://github.com/Yashas120/Multiview-3D-Reconstruction": "multiview",
};

function staticDemoFor(item: EvidenceItem): DemoId | undefined {
  return item.links.map((link) => staticDemoByRepository[link.href]).find(Boolean);
}

const compactTheme = {
  accent: "#ff6b35",
  surface: "#111824",
  border: "rgba(255, 107, 53, 0.3)",
  text: "#f8f6f1",
  muted: "#b8bdc8",
  label: "Evidence index · live implementation",
};

function LedgerRow({ item }: Readonly<{ item: EvidenceItem }>) {
  return (
    <article className={styles.ledgerRow}>
      <div className={styles.ledgerCell}>
        <p className={styles.ledgerKey}>Name / description</p>
        <h3 className={styles.entryTitle}>{item.name}</h3>
        <p className={styles.ledgerValue}>{item.description}</p>
      </div>
      <div className={styles.ledgerCell}>
        <p className={styles.ledgerKey}>Contribution / status</p>
        <p className={styles.ledgerValue}>{item.contribution}</p>
        <p className={styles.ledgerValue}>
          {item.relationship} · {item.status}
        </p>
      </div>
      <div className={styles.ledgerCell}>
        <p className={styles.ledgerKey}>Domain / evidence</p>
        <p className={styles.ledgerValue}>{item.domain}</p>
        {item.links.length > 0 ? (
          <div className={styles.entryLinks}>
            {item.links.map((link) => (
              <EvidenceLink key={link.href} link={link} />
            ))}
          </div>
        ) : (
          <p className={styles.ledgerValue}>Public-safe experience evidence; no external link.</p>
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
                <article className={styles.role} key={`${role.org}-${role.role}`}>
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
            body="These projects support the systems lens. They are not presented as production systems, and team and fork status remains visible."
          />
          <div className={styles.editorialRows}>
            {featuredSystems.map((item) => {
              const demoId = staticDemoFor(item);
              return <Fragment key={item.name}><EditorialEvidenceRow item={item} />{demoId && <ProjectDemoPresentation demoId={demoId} theme={compactTheme} headingLevel={3} preview />}</Fragment>;
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
              const demoId = staticDemoFor(item);
              return <Fragment key={item.name}><EditorialEvidenceRow item={item} />{demoId && <ProjectDemoPresentation demoId={demoId} theme={compactTheme} headingLevel={3} preview />}</Fragment>;
            })}
          </div>
        </section>

        <section id="complete-project-index" className={styles.profileSection}>
          <SectionIntro
            eyebrow="Complete project and evidence index"
            heading="Every substantive project, with provenance."
            body="Contribution, status, domain, and evidence remain visible even when the strongest honest statement is that ownership needs further documentation."
          />
          <div className={styles.ledger} aria-label="Complete project and evidence ledger">
            {projectLedger.map((item) => (
              <LedgerRow key={item.name} item={item} />
            ))}
          </div>
          <div className={styles.subordinate}>
            <h3 className={styles.subheading}>Public forks and explorations</h3>
            <div className={styles.ledger}>
              {publicExplorations.map((item) => (
                <LedgerRow key={item.name} item={item} />
              ))}
            </div>
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
            Claim boundary: managed services are named as dependencies, personal contribution is separated from team work, and prototypes, coursework, forks, and research retain their actual provenance.
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
