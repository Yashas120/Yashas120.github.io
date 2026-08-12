import Link from "next/link";
import {
  contact,
  educationRecords,
  featuredSystems,
  professionalRecords,
  publications,
  recognitionRecords,
  scopeRecords,
  teachingRecords,
  teachingTotal,
  workIndex,
  type EvidenceLink,
  type ProfileEvidenceRecord,
} from "@/data/profileEvidence";

const anchorClass = "scroll-mt-20";
const linkClass = "fde-link inline-flex min-h-11 items-center border-b border-current/35 font-mono text-[10px] uppercase tracking-[0.14em] transition-opacity hover:opacity-65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";

function SourceLink({ link }: Readonly<{ link: EvidenceLink }>) {
  if (link.external) {
    return <a className={linkClass} href={link.href} target="_blank" rel="noreferrer noopener" aria-label={`${link.label} (opens in a new tab)`}>{link.label} ↗</a>;
  }
  return <Link className={linkClass} href={link.href}>{link.label} →</Link>;
}

function EvidenceLinks({ links }: Readonly<{ links: readonly EvidenceLink[] }>) {
  if (links.length === 0) return <span className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-50">No verified public link</span>;
  return <span className="flex flex-wrap gap-x-5 gap-y-1">{links.map((item) => <SourceLink key={`${item.label}-${item.href}`} link={item} />)}</span>;
}

function FolioHeading({ folio, eyebrow, title, copy }: Readonly<{ folio: string; eyebrow: string; title: string; copy?: string }>) {
  return (
    <header className="fde-folio-head grid gap-5 border-t pt-5 md:grid-cols-[9rem_1fr]">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-50">Folio {folio}</div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--fde-cobalt)" }}>{eyebrow}</p>
        <h2 className="mt-2 max-w-[28ch] text-[clamp(1.75rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.03em]">{title}</h2>
        {copy ? <p className="mt-4 max-w-[68ch] text-[0.98rem] leading-7 opacity-70">{copy}</p> : null}
      </div>
    </header>
  );
}

function RecordLabels({ record }: Readonly<{ record: ProfileEvidenceRecord }>) {
  return <p className="font-mono text-[10px] uppercase leading-5 tracking-[0.13em] opacity-55">{record.kind.join(" · ")} · {record.ownership} · {record.status}</p>;
}

function ProfessionalRecord() {
  return (
    <section id="professional-record" className={`${anchorClass} fde-annex-section`}>
      <FolioHeading folio="02" eyebrow="PROFESSIONAL CHRONOLOGY" title="Professional record" copy="Five verified roles. Production work stays central; supporting work remains visible." />
      <div className="mt-10 border-t">
        {professionalRecords.map((record, index) => (
          <article key={record.id} data-evidence-id={record.id} className="fde-ledger-row grid gap-6 border-b py-8 md:grid-cols-[9rem_1fr]">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-50"><span>{String(index + 1).padStart(2, "0")}</span><br />{record.period}</div>
            <div>
              <RecordLabels record={record} />
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em]">{record.organization} · {record.title}</h3>
              <p className="mt-4 max-w-[78ch] leading-7 opacity-78">{record.publicCopy}</p>
              {record.details ? <ul className="mt-4 grid gap-2 text-[0.92rem] leading-6 opacity-70">{record.details.map((detail) => <li key={detail} className="border-l pl-4">{detail}</li>)}</ul> : null}
              <div className="mt-5"><EvidenceLinks links={record.evidenceLinks} /></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const featuredFields = (record: (typeof featuredSystems)[number]) => [
  ["Problem", record.problem],
  ["Constraints", record.constraints.join(" · ")],
  ["System", record.system],
  ["Verified contribution", record.publicCopy],
  ["Outcome / status", record.outcome],
  ["Stack", record.stack?.join(" · ") ?? ""],
  ["Ownership", `${record.kind.join(" · ")} · ${record.ownership}`],
] as const;

function FeaturedSystems() {
  return (
    <section id="featured-systems" className={`${anchorClass} fde-annex-section`}>
      <FolioHeading folio="03" eyebrow="INSPECTABLE SYSTEMS" title="Featured systems" copy="Four inspectable systems selected for constraints, implementation depth, verification, and public evidence." />
      <div className="mt-10 border-t">
        {featuredSystems.map((record, index) => (
          <article key={record.id} data-evidence-id={record.id} className="fde-feature-row border-b py-10">
            <div className="grid gap-5 md:grid-cols-[9rem_1fr]">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-50">Featured {String(index + 1).padStart(2, "0")}</div>
              <div>
                <RecordLabels record={record} />
                <h3 className="mt-2 text-[clamp(1.4rem,3vw,2.25rem)] font-semibold tracking-[-0.025em]">{record.title}</h3>
              </div>
            </div>
            <dl className="mt-8 divide-y border-y md:ml-[9rem]">
              {featuredFields(record).map(([label, value]) => (
                <div key={label} className="grid gap-2 py-4 md:grid-cols-[10rem_1fr]">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-50">{label}</dt>
                  <dd className="max-w-[76ch] text-[0.93rem] leading-6 opacity-76">{value}</dd>
                </div>
              ))}
              <div className="grid gap-2 py-3 md:grid-cols-[10rem_1fr]"><dt className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-50">Evidence</dt><dd><EvidenceLinks links={record.evidenceLinks} /></dd></div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkIndex() {
  return (
    <section id="work-index" className={`${anchorClass} fde-annex-section`}>
      <FolioHeading folio="04" eyebrow="ALL VERIFIED WORK" title="Complete verified-work index" copy="Every substantive verified project, with ownership and status stated plainly." />
      <div className="fde-work-head mt-10 hidden grid-cols-[1.25fr_2fr_.9fr_.8fr_1fr_1fr] gap-4 border-y py-3 font-mono text-[9px] uppercase tracking-[0.12em] opacity-50 lg:grid">
        <span>Work</span><span>What Yashas can claim</span><span>Ownership</span><span>Status</span><span>Domain</span><span>Evidence</span>
      </div>
      <div className="border-t lg:border-t-0">
        {workIndex.map((record) => {
          const featured = featuredSystems.some((system) => system.id === record.id);
          return (
            <article key={record.id} data-evidence-id={record.id} className="fde-work-row grid gap-4 border-b py-6 lg:grid-cols-[1.25fr_2fr_.9fr_.8fr_1fr_1fr] lg:py-5">
              <div><span className="fde-mobile-field">Work</span><h3 className="text-[1rem] font-semibold leading-6">{record.title}</h3>{featured ? <span className="mt-2 inline-block font-mono text-[9px] uppercase tracking-[0.13em]" style={{ color: "var(--fde-green)" }}>Featured above</span> : null}</div>
              <div><span className="fde-mobile-field">Verified claim</span><p className="text-[0.88rem] leading-6 opacity-72">{record.publicCopy}</p></div>
              <div><span className="fde-mobile-field">Ownership</span><p className="font-mono text-[10px] uppercase leading-5 tracking-[0.08em] opacity-65">{record.kind.join(" · ")}<br />{record.ownership}</p></div>
              <div><span className="fde-mobile-field">Status</span><p className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: record.status === "Prototype" ? "var(--fde-orange)" : "var(--fde-green)" }}>{record.status}</p></div>
              <div><span className="fde-mobile-field">Domain</span><p className="text-[0.82rem] leading-5 opacity-65">{record.domain}</p></div>
              <div><span className="fde-mobile-field">Evidence</span><EvidenceLinks links={record.evidenceLinks} /></div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

const breadth = [
  ["OPTICAL / HARDWARE BOUNDARY", "line-card bring-up, CDR integration, modes, resource reconciliation, secure boot, PM, validation", "#professional-record"],
  ["BACKEND / CLOUD", "Terraform and AWS, APIs, databases, event paths, migrations, incidents", "#professional-record"],
  ["RELIABILITY / ENABLEMENT", "air-gapped remediation, recovery, test harnesses, SDK and setup automation, runbooks", "#scope"],
  ["LOW-LEVEL / SECURITY", "C systems work, schedulers, concurrency, Bitcoin primitives, authentication and trust boundaries", "#work-index"],
  ["ML / COMPUTER VISION", "SWIFT, Multiview, Spark, and explicitly bounded retrieval prototypes", "#research"],
  ["TEACHING / PRODUCT", "656 learners, documentation, autograding, workflow UI, and the active portfolio", "#teaching"],
] as const;

function Breadth() {
  return (
    <section className="fde-annex-section" aria-labelledby="breadth-title">
      <FolioHeading folio="05" eyebrow="BREADTH TRACE" title="Beyond this lens" copy="Forward-deployed engineering is the ordering principle—not the boundary of the work." />
      <p className="mt-8 max-w-[76ch] leading-7 opacity-72">The same record also includes optical line-card software, backend and cloud platforms, reliability and developer tooling, low-level protocol and performance projects, machine-learning and computer-vision research, product integration, and teaching. Each item keeps its original domain, ownership, and status.</p>
      <div className="mt-8 border-t">{breadth.map(([label, copy, href]) => <a key={label} href={href} className="fde-breadth-row grid min-h-16 items-center gap-2 border-b py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:grid-cols-[15rem_1fr_2rem]"><span className="font-mono text-[10px] uppercase tracking-[0.13em]" style={{ color: "var(--fde-cobalt)" }}>{label}</span><span className="text-[0.9rem] leading-6 opacity-70">{copy}</span><span aria-hidden>→</span></a>)}</div>
    </section>
  );
}

function Research() {
  return (
    <section id="research" className={`${anchorClass} fde-annex-section`}>
      <FolioHeading folio="06" eyebrow="PEER-REVIEWED RECORD" title="Research and publications" />
      <div className="mt-10 border-t">{publications.map((record, index) => <article key={record.id} data-evidence-id={record.id} className="grid gap-5 border-b py-8 md:grid-cols-[9rem_1fr]"><div className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-50">Paper {String(index + 1).padStart(2, "0")}</div><div><p className="font-mono text-[10px] uppercase tracking-[0.13em] opacity-55">{record.label}</p><h3 className="mt-2 max-w-[40ch] text-xl font-semibold leading-7">{record.title}</h3><p className="mt-3 max-w-[82ch] text-[0.9rem] leading-6 opacity-60">{record.citation}</p><p className="mt-4 max-w-[78ch] leading-7 opacity-76">{record.copy}</p><div className="mt-4"><EvidenceLinks links={record.links} /></div></div></article>)}</div>
    </section>
  );
}

function Teaching() {
  return (
    <section id="teaching" className={`${anchorClass} fde-annex-section`}>
      <FolioHeading folio="07" eyebrow={`${teachingTotal} LEARNERS · THREE COURSES`} title="Teaching and technical enablement" copy="At PES University I supported 656 learners across three courses. The common thread was the same one that appears in production work: make the system understandable, make feedback fast, and leave reusable material behind." />
      <div className="mt-10 border-t">{teachingRecords.map((record, index) => <article key={record.id} data-evidence-id={record.id} className="grid gap-5 border-b py-7 md:grid-cols-[9rem_1fr]"><div className="font-mono text-[10px] uppercase leading-5 tracking-[0.13em] opacity-50">{String(index + 1).padStart(2, "0")}<br />{record.learners}</div><div><h3 className="text-lg font-semibold">{record.title}</h3><p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] opacity-50">{record.period}</p><p className="mt-3 max-w-[78ch] leading-7 opacity-74">{record.copy}</p><EvidenceLinks links={record.links} /></div></article>)}</div>
    </section>
  );
}

function EducationRecognition() {
  return (
    <>
      <section id="education" className={`${anchorClass} fde-annex-section`}>
        <FolioHeading folio="08" eyebrow="CURRENT CONTEXT + FOUNDATION" title="Education" />
        <div className="mt-10 border-t">{educationRecords.map((record) => <article key={record.id} data-evidence-id={record.id} className="grid gap-4 border-b py-7 md:grid-cols-[9rem_1fr]"><p className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-50">{record.period}</p><div><h3 className="text-lg font-semibold">{record.school} · {record.degree}</h3><p className="mt-3 max-w-[76ch] leading-7 opacity-72">{record.copy}</p></div></article>)}</div>
      </section>
      <section id="recognition" className={`${anchorClass} fde-annex-section`}>
        <FolioHeading folio="09" eyebrow="SUPPORTING SIGNALS" title="Recognition and leadership" />
        <div className="mt-10 border-t">{recognitionRecords.map((record) => <article key={record.id} data-evidence-id={record.id} className="grid gap-4 border-b py-6 md:grid-cols-[9rem_1fr]"><span className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-50">{record.id}</span><div><h3 className="font-semibold">{record.title}</h3><p className="mt-2 max-w-[76ch] leading-7 opacity-72">{record.copy}</p></div></article>)}</div>
      </section>
    </>
  );
}

function Scope() {
  return (
    <section id="scope" className={`${anchorClass} fde-annex-section`}>
      <FolioHeading folio="10" eyebrow="RESPONSIBILITY → EVIDENCE → SURFACE" title="Engineering scope, evidenced" />
      <div className="mt-10 border-t">{scopeRecords.map((row) => <article key={row.id} data-evidence-id={row.id} className="grid gap-3 border-b py-6 md:grid-cols-[1fr_1.5fr_1.4fr]"><div><span className="fde-mobile-field">Responsibility</span><h3 className="font-semibold">{row.responsibility}</h3></div><div><span className="fde-mobile-field">Evidence</span><p className="text-[0.9rem] leading-6 opacity-72">{row.evidence}</p></div><div><span className="fde-mobile-field">Supported technical surface</span><p className="font-mono text-[10px] leading-5 tracking-[0.05em] opacity-60">{row.surface}</p></div></article>)}</div>
    </section>
  );
}

function Contact() {
  const actions: EvidenceLink[] = [
    { label: "Email", href: `mailto:${contact.email}` },
    { label: "GitHub", href: contact.github, external: true },
    { label: "LinkedIn", href: contact.linkedin, external: true },
    { label: "Live demos", href: contact.demos },
    ...(contact.resumeUrl ? [{ label: "Resume", href: contact.resumeUrl, external: true }] : []),
  ];
  return (
    <section id="contact" className={`${anchorClass} fde-contact border-t px-5 py-20 md:px-10 md:py-28`}>
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--fde-green)" }}>FINAL HANDOFF · OPEN CHANNEL</p>
        <h2 className="mt-4 max-w-[23ch] text-[clamp(2rem,5vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.035em]">If the problem spans users, systems, and deployment, I’d like to hear about it.</h2>
        <p className="mt-6 max-w-[68ch] text-[1rem] leading-7 opacity-72">I’m preparing to begin UC San Diego’s MSCS program after roughly three years of production engineering at Cisco. I’m interested in work where discovery, implementation, deployment, debugging, and adoption belong to the same engineering problem.</p>
        <div className="mt-9 flex flex-wrap gap-x-7 gap-y-2"><EvidenceLinks links={actions} /></div>
      </div>
    </section>
  );
}

export function DossierAnnex() {
  const indexLinks = [
    ["Professional", "#professional-record"], ["Featured", "#featured-systems"], ["All work", "#work-index"], ["Research", "#research"], ["Teaching", "#teaching"], ["Education", "#education"], ["Recognition", "#recognition"], ["Scope", "#scope"], ["Contact", "#contact"],
  ] as const;
  return (
    <div className="fde-annex" style={{ background: "var(--fde-bg)", color: "var(--fde-ink)" }}>
      <section id="evidence-index" className={`${anchorClass} px-5 pb-8 pt-20 md:px-10 md:pt-28`}>
        <div className="mx-auto max-w-6xl">
          <FolioHeading folio="01" eyebrow="DOSSIER ANNEX · THE VERIFIED RECORD" title="The role lens changes the order. It does not change the record." copy="Forward-deployed work leads this page because it is the hiring lens. The record below remains complete: five roles, production systems, public projects, research, teaching, and current graduate-study context." />
          <nav aria-label="Verified record index" className="mt-8 flex flex-wrap border-y py-2">{indexLinks.map(([label, href]) => <a key={href} href={href} className="inline-flex min-h-11 items-center px-4 font-mono text-[10px] uppercase tracking-[0.13em] opacity-65 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">{label}</a>)}</nav>
          <div className="mt-6 flex flex-wrap gap-x-7"><SourceLink link={{ label: "GitHub", href: contact.github, external: true }} /><SourceLink link={{ label: "LinkedIn", href: contact.linkedin, external: true }} /><SourceLink link={{ label: "Live demos", href: contact.demos }} /></div>
        </div>
      </section>
      <div className="fde-annex-body mx-auto max-w-6xl px-5 md:px-10">
        <ProfessionalRecord />
        <FeaturedSystems />
        <WorkIndex />
        <Breadth />
        <Research />
        <Teaching />
        <EducationRecognition />
        <Scope />
      </div>
      <Contact />
    </div>
  );
}

