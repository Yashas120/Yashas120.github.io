/**
 * The portfolio document: seven chapters of ordinary, readable content.
 *
 * This is the page. The inspector is a second layer that explains the delivery
 * system behind the work — nothing here depends on it, and no role, achievement,
 * project or contact method requires opening a panel to discover.
 *
 * Server-rendered throughout. The only client components reached from here are the
 * inline tablet inspectors and the evidence drawers, both of which are additive.
 */

import { FileText, Github, Linkedin, Mail } from "lucide-react";
import { chapters } from "@/data/devops/chapters";
import {
  contact,
  delivery,
  devex,
  education,
  hero,
  identity,
  infrastructure,
  reliability,
  resumeLink,
} from "@/data/devops/profile";
import { evidenceById } from "@/data/devops/evidence";
import { projects, supportingProject } from "@/data/devops/projects";
import { skillGroups } from "@/data/devops/skills";
import { EvidenceDrawer } from "./EvidenceDrawer";
import { InlineInspector } from "./InspectorDock";
import { Badges, Bullets, ExternalLink, H3, Labelled, PortfolioChapter, Prose } from "./PortfolioChapter";
import { ACTION, DV } from "./tokens";

const ch = (id: string) => chapters.find((c) => c.id === id)!;

export function PortfolioDocument() {
  return (
    <main id="main-content" className="min-w-0">
      {/* ------------------------------------------------------------- hero */}
      <PortfolioChapter id="hero" eyebrow={hero.eyebrow} title={hero.heading} lead>
        <Prose>{hero.body}</Prose>

        <div className="dv-card mt-6 max-w-[62ch] p-4">
          <p className="m-0 font-mono text-[12px] tracking-[0.12em]" style={{ color: DV.muted }}>
            {hero.proof.label}
          </p>
          <p className="m-0 mt-1 text-[26px] font-semibold leading-tight dock:text-[30px]" style={{ color: DV.green }}>
            {hero.proof.value}
          </p>
          <p className="m-0 mt-2 text-[15px] leading-relaxed" style={{ color: DV.text }}>
            {hero.proof.detail}
          </p>
        </div>

        <ul className="m-0 mt-4 grid max-w-[62ch] list-none gap-3 p-0 sm:grid-cols-3">
          {hero.strip.map((s) => (
            <li key={s.value} className="dv-card p-3">
              <p className="m-0 font-mono text-[14px] font-medium" style={{ color: DV.amber }}>
                {s.value}
              </p>
              <p className="m-0 mt-1 text-[14px] leading-snug" style={{ color: DV.muted }}>
                {s.detail}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <a href="#delivery" className={ACTION} style={{ background: DV.amber, color: DV.canvas }}>
            View delivery work
          </a>
          <a
            href={resumeLink.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={resumeLink.ariaLabel}
            className={`${ACTION} border`}
            style={{ borderColor: DV.border, color: DV.text }}
          >
            <FileText className="h-4 w-4" aria-hidden /> Résumé
          </a>
          <a
            href={identity.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`GitHub — ${identity.githubUser} (opens in a new tab)`}
            className={`${ACTION} border`}
            style={{ borderColor: DV.border, color: DV.text }}
          >
            <Github className="h-4 w-4" aria-hidden /> GitHub
          </a>
          <a
            href={identity.emailHref}
            aria-label={`Email ${identity.email}`}
            className={`${ACTION} border`}
            style={{ borderColor: DV.border, color: DV.text }}
          >
            <Mail className="h-4 w-4" aria-hidden /> Email
          </a>
        </div>

        <p className="mt-4 max-w-[62ch] font-mono text-[12px] leading-relaxed" style={{ color: DV.muted }}>
          {hero.availability}
        </p>

        <InlineInspector panel="overview" />
      </PortfolioChapter>

      {/* --------------------------------------------------------- delivery */}
      <PortfolioChapter id="delivery" eyebrow={ch("delivery").eyebrow} title={ch("delivery").title}>
        <Prose>{delivery.intro}</Prose>
        <H3>{delivery.caseStudy.title}</H3>
        <Labelled label="Context">{delivery.caseStudy.context}</Labelled>
        <Labelled label="Contribution">{delivery.caseStudy.contribution}</Labelled>
        <Labelled label="Outcome">{delivery.caseStudy.outcome}</Labelled>
        <Badges items={delivery.caseStudy.badges} />
        <Bullets items={delivery.support} />
        <InlineInspector panel="pipeline" />
      </PortfolioChapter>

      {/* --------------------------------------------------- infrastructure */}
      <PortfolioChapter
        id="infrastructure"
        eyebrow={ch("infrastructure").eyebrow}
        title={ch("infrastructure").title}
      >
        <Prose>{infrastructure.body}</Prose>

        {/* The architecture as text, so the mechanism is readable without the diagram. */}
        <p className="mt-6 max-w-[62ch] font-mono text-[13px] leading-relaxed" style={{ color: DV.cyan }}>
          {infrastructure.flow.join(" → ")}
        </p>
        <p className="mt-2 max-w-[62ch] font-mono text-[12px] leading-relaxed" style={{ color: DV.muted }}>
          {infrastructure.architectureCaption}
        </p>

        <Labelled label="Contribution">{infrastructure.contribution}</Labelled>

        <H3>Operational constraints</H3>
        <Bullets items={infrastructure.constraints} />
        <InlineInspector panel="infrastructure" />
      </PortfolioChapter>

      {/* ------------------------------------------------------ reliability */}
      <PortfolioChapter id="reliability" eyebrow={ch("reliability").eyebrow} title={ch("reliability").title}>
        <Prose>{reliability.intro}</Prose>

        <H3>{reliability.incident.title}</H3>
        <Labelled label="Situation">{reliability.incident.situation}</Labelled>
        <Labelled label="Investigation">{reliability.incident.investigation}</Labelled>
        <Labelled label="Recovery and prevention">{reliability.incident.prevention}</Labelled>
        <p className="mt-4 max-w-[62ch] font-mono text-[13px] leading-relaxed" style={{ color: DV.muted }}>
          {reliability.phases.join(" → ")}
        </p>

        <H3>{reliability.performance.title}</H3>
        <Prose className="!text-[16px]">{reliability.performance.body}</Prose>

        <H3>Safer rollout</H3>
        <Prose className="!text-[16px]">{reliability.authMigration}</Prose>
        <Badges items={["Production work", "Staged rollout", "Traffic-based discovery", "Health checks"]} />
        <InlineInspector panel="reliability" />
      </PortfolioChapter>

      {/* ------------------------------------------------------------ devex */}
      <PortfolioChapter id="devex" eyebrow={ch("devex").eyebrow} title={ch("devex").title}>
        <H3>{devex.sdk.title}</H3>
        <Labelled label="Context">{devex.sdk.context}</Labelled>
        <Labelled label="Contribution">{devex.sdk.contribution}</Labelled>
        <Labelled label="Outcome">{devex.sdk.outcome}</Labelled>
        <Badges items={["Production work", "GitHub Actions", "OpenAPI", "Python", "Java"]} />

        <H3>{devex.testing.title}</H3>
        <Prose className="!text-[16px]">{devex.testing.body}</Prose>

        <H3>{devex.environments.title}</H3>
        <Prose className="!text-[16px]">{devex.environments.body}</Prose>
        <InlineInspector panel="devex" />
      </PortfolioChapter>

      {/* ---------------------------------------------------------- systems */}
      <PortfolioChapter id="systems" eyebrow={ch("systems").eyebrow} title={ch("systems").title}>
        <Prose>
          Public work, labelled as what it is. None of it is presented as production experience.
        </Prose>

        {projects.map((p) => (
          <article key={p.id} className="dv-card mt-6 max-w-[70ch] p-4">
            <p className="m-0 font-mono text-[12px]" style={{ color: DV.cyan }}>
              {p.label}
            </p>
            <h3 className="mb-0 mt-2 text-[19px] font-semibold leading-snug" style={{ color: DV.text }}>
              {p.title}
            </h3>
            <p className="m-0 mt-2 text-[15px] leading-relaxed" style={{ color: DV.muted }}>
              {p.summary}
            </p>
            <p className="m-0 mt-3 font-mono text-[12px] uppercase tracking-[0.1em]" style={{ color: DV.muted }}>
              What it demonstrates
            </p>
            <ul className="m-0 mt-1.5 flex list-none flex-wrap gap-1.5 p-0">
              {p.demonstrates.map((d) => (
                <li key={d}>
                  <span className="dv-chip">{d}</span>
                </li>
              ))}
            </ul>
            {p.link && (
              <ExternalLink
                href={p.link.href}
                label={p.link.label}
                ariaLabel={`${p.link.label} — ${p.title} (opens in a new tab)`}
              />
            )}
            <EvidenceDrawer ids={[p.evidenceId]} label="Contribution and classification" />
          </article>
        ))}

        <div className="mt-6 max-w-[70ch] border-t pt-4" style={{ borderColor: DV.border }}>
          <p className="m-0 font-mono text-[12px]" style={{ color: DV.muted }}>
            {supportingProject.label}
          </p>
          <h3 className="mb-0 mt-1 text-[16px] font-semibold" style={{ color: DV.text }}>
            {supportingProject.title}
          </h3>
          <p className="m-0 mt-1 text-[15px] leading-relaxed" style={{ color: DV.muted }}>
            {supportingProject.summary}
          </p>
        </div>

        <H3>Skills, and what backs them</H3>
        <div className="mt-4 grid max-w-[70ch] gap-3 sm:grid-cols-2">
          {skillGroups.map((g) => (
            <div key={g.id} className="dv-card p-4">
              <h4 className="m-0 text-[15px] font-semibold" style={{ color: DV.amber }}>
                {g.title}
              </h4>
              <p className="m-0 mt-1.5 text-[15px] leading-relaxed" style={{ color: DV.muted }}>
                {g.items.join(" · ")}
              </p>
              <EvidenceDrawer ids={g.evidenceIds} label="Show supporting evidence" />
            </div>
          ))}
        </div>
        <InlineInspector panel="evidence" />
      </PortfolioChapter>

      {/* ---------------------------------------------------------- contact */}
      <PortfolioChapter id="contact" eyebrow={ch("contact").eyebrow} title={contact.heading}>
        <Prose>{contact.body}</Prose>

        <H3>Certification and education</H3>
        <ul className="m-0 mt-4 max-w-[62ch] list-none space-y-4 p-0">
          <li>
            <p className="m-0 text-[16px] font-medium" style={{ color: DV.text }}>
              {education.certification.name}
            </p>
            <p className="m-0 mt-0.5 font-mono text-[12px]" style={{ color: DV.muted }}>
              {education.certification.note}
            </p>
          </li>
          {[education.ucsd, education.pes].map((e) => (
            <li key={e.school}>
              <p className="m-0 text-[16px] font-medium" style={{ color: DV.text }}>
                {e.school}
              </p>
              <p className="m-0 mt-0.5 text-[15px]" style={{ color: DV.muted }}>
                {e.degree} · {e.status}
              </p>
              <p className="m-0 mt-0.5 font-mono text-[12px]" style={{ color: DV.muted }}>
                {"focus" in e ? e.focus : e.gpa}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <a href={identity.emailHref} className={ACTION} style={{ background: DV.amber, color: DV.canvas }}>
            <Mail className="h-4 w-4" aria-hidden /> Email Yashas
          </a>
          <a
            href={resumeLink.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={resumeLink.ariaLabel}
            className={`${ACTION} border`}
            style={{ borderColor: DV.border, color: DV.text }}
          >
            <FileText className="h-4 w-4" aria-hidden /> Résumé
          </a>
          <a
            href={identity.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`GitHub — ${identity.githubUser} (opens in a new tab)`}
            className={`${ACTION} border`}
            style={{ borderColor: DV.border, color: DV.text }}
          >
            <Github className="h-4 w-4" aria-hidden /> GitHub
          </a>
          <a
            href={identity.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="LinkedIn — yashas120 (opens in a new tab)"
            className={`${ACTION} border`}
            style={{ borderColor: DV.border, color: DV.text }}
          >
            <Linkedin className="h-4 w-4" aria-hidden /> LinkedIn
          </a>
        </div>

        <p className="mt-8 font-mono text-[12px]" style={{ color: DV.muted }}>
          {contact.status.path}
          <span className="ml-2" style={{ color: DV.green }}>
            {contact.status.value}
          </span>
        </p>

        {/* The credential's disclosure state is stated, not implied. */}
        {evidenceById("aws-cert") && <EvidenceDrawer ids={["aws-cert"]} label="Credential record" />}
      </PortfolioChapter>
    </main>
  );
}
