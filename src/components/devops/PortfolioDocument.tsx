/** The complete, server-rendered portfolio document beside the inspector. */

import { ArrowUpRight, FileText, Github, Linkedin, Mail, PlayCircle } from "lucide-react";
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
import { boundaryLayers } from "@/data/devops/experience";
import { exclusionRegister } from "@/data/devops/projects";
import { recognition, leadership } from "@/data/devops/recognition";
import { researchIntro, researchPublications } from "@/data/devops/research";
import { skillGroups } from "@/data/devops/skills";
import { teachingLead } from "@/data/devops/teaching";
import { CompleteWorkIndex } from "./CompleteWorkIndex";
import { EvidenceDrawer } from "./EvidenceDrawer";
import { ExperienceTrace } from "./ExperienceTrace";
import { InlineInspector } from "./InspectorDock";
import { Badges, Bullets, H3, Labelled, PortfolioChapter, Prose } from "./PortfolioChapter";
import { SelectedSystems } from "./SelectedSystems";
import { TeachingTrace } from "./TeachingTrace";
import { ACTION, DV } from "./tokens";

const chapter = (id: (typeof chapters)[number]["id"]) => chapters.find((item) => item.id === id)!;

function ActionLink({
  href,
  children,
  label,
  primary,
}: Readonly<{
  href: string;
  children: React.ReactNode;
  label?: string;
  primary?: boolean;
}>) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      download={href.endsWith(".pdf") ? true : undefined}
      aria-label={label}
      className={`${ACTION} ${primary ? "" : "border"}`}
      style={
        primary
          ? { background: DV.amber, color: DV.canvas }
          : { borderColor: DV.border, color: DV.text }
      }
    >
      {children}
    </a>
  );
}

export function PortfolioDocument() {
  return (
    <main id="main-content" className="min-w-0">
      <PortfolioChapter id="overview" eyebrow={hero.eyebrow} title={hero.heading} lead>
        <Prose>{hero.body}</Prose>

        <aside className="dv-card mt-5 max-w-[64ch] border-l-2 p-4" style={{ borderLeftColor: DV.amber }}>
          <p className="m-0 text-[15px] leading-relaxed" style={{ color: DV.text }}>
            {hero.roleLens}
          </p>
        </aside>

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
          {hero.strip.map((item) => (
            <li key={item.evidenceId} className="dv-card p-3">
              <p className="m-0 font-mono text-[14px] font-medium" style={{ color: DV.amber }}>
                {item.value}
              </p>
              <p className="m-0 mt-1 text-[14px] leading-snug" style={{ color: DV.muted }}>
                {item.detail}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex max-w-[68ch] flex-wrap items-center gap-2">
          <ActionLink href="#delivery" primary>
            Inspect delivery work
          </ActionLink>
          <ActionLink href={resumeLink.href} label={resumeLink.ariaLabel}>
            <FileText className="h-4 w-4" aria-hidden /> Résumé
          </ActionLink>
          <ActionLink href={identity.demos}>
            <PlayCircle className="h-4 w-4" aria-hidden /> Live demos
          </ActionLink>
          <ActionLink href={identity.github} label={`GitHub — ${identity.githubUser} (opens in a new tab)`}>
            <Github className="h-4 w-4" aria-hidden /> GitHub
          </ActionLink>
          <ActionLink href={identity.linkedin} label="LinkedIn — yashas120 (opens in a new tab)">
            <Linkedin className="h-4 w-4" aria-hidden /> LinkedIn
          </ActionLink>
          <ActionLink href={identity.emailHref} label={`Email ${identity.email}`}>
            <Mail className="h-4 w-4" aria-hidden /> Email Yashas
          </ActionLink>
        </div>

        <p className="mt-4 max-w-[62ch] font-mono text-[12px] leading-relaxed" style={{ color: DV.muted }}>
          {hero.availability}
        </p>
        <InlineInspector panel="overview" />
      </PortfolioChapter>

      <PortfolioChapter id="delivery" eyebrow={chapter("delivery").eyebrow} title={chapter("delivery").title}>
        <Prose>{delivery.intro}</Prose>
        <H3>{delivery.caseStudy.title}</H3>
        <Labelled label="Context">{delivery.caseStudy.context}</Labelled>
        <Labelled label="Contribution">{delivery.caseStudy.contribution}</Labelled>
        <Labelled label="Outcome">{delivery.caseStudy.outcome}</Labelled>
        <Badges items={delivery.caseStudy.badges} />
        <Bullets items={delivery.support} />
        <InlineInspector panel="pipeline" />
      </PortfolioChapter>

      <PortfolioChapter id="infrastructure" eyebrow={chapter("infrastructure").eyebrow} title={chapter("infrastructure").title}>
        <Prose>{infrastructure.body}</Prose>
        <p className="mt-6 max-w-[62ch] font-mono text-[13px] leading-relaxed" style={{ color: DV.cyan }}>
          {infrastructure.flow.join(" → ")}
        </p>
        <p className="mt-2 max-w-[62ch] font-mono text-[12px] leading-relaxed" style={{ color: DV.muted }}>
          {infrastructure.architectureCaption}
        </p>
        <Labelled label="Contribution">{infrastructure.contribution}</Labelled>
        <H3>Permanent design questions</H3>
        <Bullets items={[
          "Which dependencies must exist before consumers start?",
          "Where should human approval remain?",
          "How are retries, idempotency, ordering, and dead-letter behavior defined?",
          "Which resources can safely converge in parallel?",
        ]} />
        <p className="mt-3 max-w-[62ch] text-[14px] leading-relaxed" style={{ color: DV.muted }}>
          These are engineering questions, not claims that every mechanism existed in the employer system.
        </p>
        <InlineInspector panel="infrastructure" />
      </PortfolioChapter>

      <PortfolioChapter id="reliability" eyebrow={chapter("reliability").eyebrow} title={chapter("reliability").title}>
        <Prose>{reliability.intro}</Prose>
        <p className="mt-5 max-w-[62ch] font-mono text-[13px] leading-relaxed" style={{ color: DV.cyan }}>
          {reliability.phases.join(" → ")}
        </p>
        <div className="mt-6 max-w-[72ch] space-y-3">
          {reliability.evidenceCards.map((item) => (
            <article key={item.evidenceId} className="dv-card p-4">
              <h3 className="m-0 text-[17px] font-semibold" style={{ color: DV.text }}>{item.title}</h3>
              <p className="m-0 mt-2 text-[15px] leading-relaxed" style={{ color: DV.muted }}>{item.body}</p>
              <EvidenceDrawer ids={[item.evidenceId]} label="Inspect evidence" />
            </article>
          ))}
        </div>
        <InlineInspector panel="reliability" />
      </PortfolioChapter>

      <PortfolioChapter id="devex" eyebrow={chapter("devex").eyebrow} title={chapter("devex").title}>
        <H3>{devex.sdk.title}</H3>
        <Labelled label="Context">{devex.sdk.context}</Labelled>
        <Labelled label="Contribution">{devex.sdk.contribution}</Labelled>
        <Labelled label="Outcome">{devex.sdk.outcome}</Labelled>
        <Badges items={["Production work", "GitHub Actions", "OpenAPI", "Python", "Java", "Human version gate"]} />

        <H3>{devex.testing.title}</H3>
        <Prose className="!text-[16px]">{devex.testing.body}</Prose>

        <H3>{devex.environments.title}</H3>
        <Prose className="!text-[16px]">{devex.environments.body}</Prose>
        <Bullets items={devex.supporting} />
        <InlineInspector panel="devex" />
      </PortfolioChapter>

      <PortfolioChapter id="experience" eyebrow={chapter("experience").eyebrow} title={chapter("experience").title}>
        <Prose>
          My DevOps work is grounded in production engineering across layers. Cloud services, databases, optical line cards, firmware, test environments, and developer workflows all fail at boundaries; the operating habit is the same—make state explicit, shorten feedback loops, collect the right evidence, and leave behind a repeatable path.
        </Prose>
        <p className="mt-5 max-w-[68ch] font-mono text-[13px] leading-relaxed" style={{ color: DV.cyan }}>
          {boundaryLayers.join(" → ")}
        </p>
        <ExperienceTrace />
        <aside className="dv-card mt-6 max-w-[70ch] p-4">
          <p className="m-0 text-[14px] leading-relaxed" style={{ color: DV.muted }}>
            Optical work is not presented as distributed-systems ownership. Its relevance here is the transferable reliability discipline: explicit interfaces, repeatable validation, diagnostic evidence, and safer handoffs across software, firmware, and hardware.
          </p>
        </aside>
      </PortfolioChapter>

      <PortfolioChapter id="systems" eyebrow={chapter("systems").eyebrow} title={chapter("systems").title}>
        <Prose>
          Four role-relevant systems receive deeper treatment. Coursework, team work, public forks, and original work remain visibly distinct from production experience.
        </Prose>
        <SelectedSystems />
        <InlineInspector panel="evidence" />
      </PortfolioChapter>

      <PortfolioChapter id="complete-work" eyebrow={chapter("complete-work").eyebrow} title={chapter("complete-work").title}>
        <Prose>{researchIntro}</Prose>

        <H3>Research and publications</H3>
        <div className="mt-4 max-w-[74ch] space-y-3">
          {researchPublications.map((publication) => (
            <article key={publication.id} className="dv-card p-4">
              <p className="m-0 font-mono text-[12px]" style={{ color: DV.cyan }}>
                {publication.venue} · {publication.date}
              </p>
              <h4 className="mb-0 mt-1.5 text-[17px] font-semibold leading-snug" style={{ color: DV.text }}>
                {publication.title}
              </h4>
              <p className="m-0 mt-2 text-[15px] leading-relaxed" style={{ color: DV.muted }}>
                {publication.contribution}
              </p>
              <p className="m-0 mt-2 font-mono text-[12px]" style={{ color: DV.muted }}>{publication.ownership}</p>
              <div className="mt-2 flex flex-wrap gap-x-4">
                {publication.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer noopener" : undefined}
                    className="inline-flex min-h-[44px] items-center gap-1 text-[14px]"
                    style={{ color: DV.cyan }}
                  >
                    {link.label}{link.href.startsWith("http") && <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>

        <H3>Complete verified-work index</H3>
        <CompleteWorkIndex />

        <H3>Verification and exclusion register</H3>
        <ul className="m-0 mt-4 max-w-[72ch] list-none p-0">
          {exclusionRegister.map((item) => (
            <li key={item.name} className="border-t py-3" style={{ borderColor: DV.border }}>
              <p className="m-0 text-[15px] font-medium" style={{ color: DV.text }}>{item.name}</p>
              <p className="m-0 mt-1 text-[14px] leading-relaxed" style={{ color: DV.muted }}>{item.disposition}</p>
            </li>
          ))}
        </ul>
      </PortfolioChapter>

      <PortfolioChapter id="enablement" eyebrow={chapter("enablement").eyebrow} title={chapter("enablement").title}>
        <Prose>{teachingLead}</Prose>
        <TeachingTrace />
        <EvidenceDrawer ids={["teaching-scale"]} label="Inspect teaching evidence" />

        <H3>Education</H3>
        <ul className="m-0 mt-4 max-w-[70ch] list-none p-0">
          {[education.ucsd, education.pes].map((item) => (
            <li key={item.school} className="border-t py-4" style={{ borderColor: DV.border }}>
              <p className="m-0 text-[17px] font-semibold" style={{ color: DV.text }}>{item.school}</p>
              <p className="m-0 mt-1 text-[15px]" style={{ color: DV.muted }}>{item.degree} · {item.status}</p>
              <p className="m-0 mt-1 font-mono text-[12px] leading-relaxed" style={{ color: DV.muted }}>
                {"focus" in item ? item.focus : item.gpa}
              </p>
            </li>
          ))}
        </ul>

        <H3>Recognition and leadership</H3>
        <div className="mt-4 grid max-w-[72ch] gap-3 sm:grid-cols-2">
          {recognition.map((item) => (
            <article key={item.title} className="dv-card p-4">
              <h4 className="m-0 text-[15px] font-semibold" style={{ color: DV.text }}>{item.title}</h4>
              <p className="m-0 mt-1.5 text-[14px] leading-relaxed" style={{ color: DV.muted }}>{item.detail}</p>
            </article>
          ))}
        </div>
        <Bullets items={leadership} />

        <H3>Evidence-backed scope</H3>
        <div className="mt-4 grid max-w-[74ch] gap-3 sm:grid-cols-2">
          {skillGroups.map((group) => (
            <article key={group.id} className="dv-card p-4">
              <h4 className="m-0 text-[15px] font-semibold" style={{ color: DV.amber }}>{group.title}</h4>
              <p className="m-0 mt-1.5 text-[14px] leading-relaxed" style={{ color: DV.muted }}>
                {group.items.join(" · ")}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-3">
                {group.evidenceDestinations.map((href) => (
                  <a key={href} href={href} className="inline-flex min-h-[44px] items-center font-mono text-[12px]" style={{ color: DV.cyan }}>
                    supporting work {href}
                  </a>
                ))}
              </div>
              <EvidenceDrawer ids={group.evidenceIds} label="Inspect supporting evidence" />
            </article>
          ))}
        </div>
      </PortfolioChapter>

      <PortfolioChapter id="contact" eyebrow={chapter("contact").eyebrow} title={contact.heading}>
        <Prose>{contact.body}</Prose>
        <div className="mt-7 flex max-w-[70ch] flex-wrap items-center gap-2">
          <ActionLink href={identity.emailHref} label={`Email ${identity.email}`} primary>
            <Mail className="h-4 w-4" aria-hidden /> Email Yashas
          </ActionLink>
          <ActionLink href={resumeLink.href} label={resumeLink.ariaLabel}>
            <FileText className="h-4 w-4" aria-hidden /> Résumé
          </ActionLink>
          <ActionLink href={identity.github} label={`GitHub — ${identity.githubUser} (opens in a new tab)`}>
            <Github className="h-4 w-4" aria-hidden /> GitHub
          </ActionLink>
          <ActionLink href={identity.linkedin} label="LinkedIn — yashas120 (opens in a new tab)">
            <Linkedin className="h-4 w-4" aria-hidden /> LinkedIn
          </ActionLink>
          <ActionLink href={identity.demos}>
            <PlayCircle className="h-4 w-4" aria-hidden /> Live project demos
          </ActionLink>
          <ActionLink href={identity.portfolioSource} label="Portfolio source (opens in a new tab)">
            <Github className="h-4 w-4" aria-hidden /> Portfolio source
          </ActionLink>
        </div>
        {!resumeLink.isPdf && (
          <p className="mt-3 max-w-[62ch] font-mono text-[12px] leading-relaxed" style={{ color: DV.muted }}>
            The résumé action currently opens the verified LinkedIn profile; a canonical public PDF has not yet been supplied.
          </p>
        )}
        <p className="mt-8 font-mono text-[12px]" style={{ color: DV.muted }}>
          {contact.status.path}
          <span className="ml-2" style={{ color: DV.green }}>{contact.status.value}</span>
        </p>
        {evidenceById("portfolio-system") && <EvidenceDrawer ids={["portfolio-system"]} label="Inspect portfolio proof" />}
      </PortfolioChapter>
    </main>
  );
}
