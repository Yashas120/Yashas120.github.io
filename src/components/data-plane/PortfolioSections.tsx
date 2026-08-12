"use client";

import { ArrowUpRight } from "lucide-react";
import {
  evidenceByCategory,
  evidenceById,
  type EvidenceHref,
  type EvidenceRecord,
} from "@/data/evidence";
import { CANVAS, FAINT, MUTED, RESEARCH, RULE, SIGNAL, SURFACE, TEXT, VERIFIED } from "./palette";

const featuredIds = ["project-ghost", "project-bitcoin", "project-underwater", "project-multiview"] as const;
const featured = featuredIds.map(evidenceById);
const work = evidenceByCategory("project");
const publications = evidenceByCategory("publication");
const courses = evidenceByCategory("teaching");
const education = evidenceByCategory("education");
const recognition = evidenceByCategory("recognition");
const leadership = evidenceByCategory("leadership");

const featuredFrame: Record<string, { problem: string; constraint: string; why: string }> = {
  "project-ghost": {
    problem: "Compare kernel and user-space scheduling policies under different workload shapes.",
    constraint: "Rebuild and configure Linux around ghOSt, then evaluate the framework rather than claim its invention.",
    why: "The closest independent evidence for system boundaries, concurrency, measurement, and trade-off reasoning.",
  },
  "project-bitcoin": {
    problem: "Understand and implement the transaction path beneath wallet abstractions.",
    constraint: "No external cryptography dependencies; educational implementation, not a production-wallet security claim.",
    why: "From-scratch protocol and cryptographic primitives show low-level correctness work beyond employer claims.",
  },
  "project-underwater": {
    problem: "Monitor submerged infrastructure where physical maintenance is expensive and slow.",
    constraint: "Embedded sensing and redundancy under difficult access conditions.",
    why: "Direct embedded-monitoring, hardware-integration, and reliability relevance.",
  },
  "project-multiview": {
    problem: "Recover camera pose and sparse 3D structure from unordered 2D views without deep learning.",
    constraint: "Traditional geometry, overlap/order sensitivity, expensive bundle adjustment, and no dense-MVS completion.",
    why: "A multi-stage geometric pipeline with explicit measured limitations.",
  },
};

function Chips({ record }: Readonly<{ record: EvidenceRecord }>) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {record.relationship.map((label) => (
        <span key={label} className="rounded-sm border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ borderColor: RULE, color: label === "Research" ? RESEARCH : SIGNAL }}>{label}</span>
      ))}
      {record.status && <span className="rounded-sm border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ borderColor: RULE, color: VERIFIED }}>{record.status}</span>}
      {record.ownership && <span className="rounded-sm border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ borderColor: RULE, color: FAINT }}>{record.ownership}</span>}
    </div>
  );
}

function EvidenceLink({ link }: Readonly<{ link: EvidenceHref }>) {
  const external = link.href.startsWith("https://");
  return (
    <a
      href={link.href}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-sm px-1 text-[0.82rem] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ color: SIGNAL }}
    >
      {link.label}{external && <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}

function EvidenceLinks({ record }: Readonly<{ record: EvidenceRecord }>) {
  if (!record.hrefs?.length) return <span className="text-[0.8rem]" style={{ color: FAINT }}>No public artifact linked</span>;
  return <div className="flex flex-wrap gap-x-3">{record.hrefs.map((link) => <EvidenceLink key={`${record.id}-${link.label}`} link={link} />)}</div>;
}

function Field({ term, children }: Readonly<{ term: string; children: React.ReactNode }>) {
  return (
    <div>
      <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em]" style={{ color: SIGNAL }}>{term}</dt>
      <dd className="mt-1 text-[0.84rem] leading-[1.58]" style={{ color: MUTED }}>{children}</dd>
    </div>
  );
}

export function FeaturedSystemsSection() {
  return (
    <section id="featured-systems" className="scroll-mt-20 px-5 py-16 sm:px-8 md:px-10 md:py-24" style={{ background: CANVAS }}>
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: SIGNAL }}>Independent proof</p>
        <h2 className="mt-3 text-[clamp(1.4rem,2.4vw,2.1rem)] font-semibold tracking-[-0.02em]" style={{ color: TEXT }}>Selected systems that reinforce the dataplane lens</h2>
        <p className="mt-3 max-w-[76ch] text-[0.95rem] leading-[1.65]" style={{ color: MUTED }}>The production story leads. These systems add independent evidence of low-level reasoning, measurement, protocols, embedded monitoring, and geometric pipelines.</p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {featured.slice(0, 2).map((record) => {
            const frame = featuredFrame[record.id];
            return (
              <article key={record.id} className="rounded-lg border p-5 md:p-6" style={{ borderColor: RULE, background: SURFACE }}>
                <Chips record={record} />
                <h3 className="mt-4 text-[1.08rem] font-semibold" style={{ color: TEXT }}>{record.title}</h3>
                <dl className="mt-5 space-y-4">
                  <Field term="Problem">{frame.problem}</Field>
                  <Field term="Constraint">{frame.constraint}</Field>
                  <Field term="Mechanism">{record.publicCopy}</Field>
                  <Field term="Contribution">{record.contribution}</Field>
                  <Field term="Outcome / status">{record.status}</Field>
                  <Field term="Stack">{record.stack?.join(" · ")}</Field>
                  <Field term="Why featured">{frame.why}</Field>
                </dl>
                <div className="mt-4"><EvidenceLinks record={record} /></div>
              </article>
            );
          })}
        </div>

        <div className="mt-6 divide-y border-y" style={{ borderColor: RULE }}>
          {featured.slice(2).map((record) => {
            const frame = featuredFrame[record.id];
            return (
              <article key={record.id} className="grid gap-5 py-7 lg:grid-cols-[0.78fr_1.35fr] lg:gap-10">
                <div>
                  <Chips record={record} />
                  <h3 className="mt-3 text-[1rem] font-semibold" style={{ color: TEXT }}>{record.title}</h3>
                  <p className="mt-2 text-[0.84rem] leading-[1.58]" style={{ color: FAINT }}>{frame.why}</p>
                  <EvidenceLinks record={record} />
                </div>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Field term="Problem">{frame.problem}</Field>
                  <Field term="Constraint">{frame.constraint}</Field>
                  <Field term="Mechanism">{record.publicCopy}</Field>
                  <Field term="Contribution">{record.contribution}</Field>
                  <Field term="Stack">{record.stack?.join(" · ")}</Field>
                  <Field term="Outcome / status">{record.status}</Field>
                </dl>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WorkIndexSection() {
  return (
    <section id="work-index" className="scroll-mt-20 px-5 py-16 sm:px-8 md:px-10 md:py-24" style={{ background: SURFACE }}>
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: SIGNAL }}>No-drop index</p>
        <h2 className="mt-3 text-[clamp(1.4rem,2.4vw,2.1rem)] font-semibold tracking-[-0.02em]" style={{ color: TEXT }}>Complete verified-work index</h2>
        <p className="mt-3 max-w-[76ch] text-[0.95rem] leading-[1.65]" style={{ color: MUTED }}>Featured work is selective; this index is not. Each visible row separates contribution, relationship, lifecycle, and evidence.</p>
        <div className="mt-8 border-y" style={{ borderColor: RULE }}>
          <div className="hidden grid-cols-[1.1fr_1.65fr_0.8fr_0.7fr_0.85fr] gap-4 border-b py-3 font-mono text-[9.5px] uppercase tracking-[0.13em] lg:grid" style={{ borderColor: RULE, color: FAINT }} aria-hidden>
            <span>Work</span><span>Contribution</span><span>Domain</span><span>Relationship / status</span><span>Evidence</span>
          </div>
          {work.map((record) => (
            <article key={record.id} className="grid gap-4 border-b py-6 last:border-b-0 lg:grid-cols-[1.1fr_1.65fr_0.8fr_0.7fr_0.85fr] lg:py-5" style={{ borderColor: RULE }}>
              <div><p className="mb-1 font-mono text-[9px] uppercase tracking-[0.13em] lg:hidden" style={{ color: FAINT }}>Work</p><h3 className="text-[0.93rem] font-semibold leading-[1.4]" style={{ color: TEXT }}>{record.title}</h3></div>
              <div><p className="mb-1 font-mono text-[9px] uppercase tracking-[0.13em] lg:hidden" style={{ color: FAINT }}>Contribution</p><p className="text-[0.82rem] leading-[1.58]" style={{ color: MUTED }}>{record.contribution ?? record.publicCopy}</p></div>
              <div><p className="mb-1 font-mono text-[9px] uppercase tracking-[0.13em] lg:hidden" style={{ color: FAINT }}>Domain</p><p className="text-[0.79rem] leading-[1.5]" style={{ color: MUTED }}>{record.domain}</p></div>
              <div><p className="mb-1 font-mono text-[9px] uppercase tracking-[0.13em] lg:hidden" style={{ color: FAINT }}>Relationship / status</p><p className="font-mono text-[0.7rem] leading-[1.6]" style={{ color: SIGNAL }}>{record.relationship.join(" · ")}<br /><span style={{ color: VERIFIED }}>{record.status}</span></p></div>
              <div><p className="mb-1 font-mono text-[9px] uppercase tracking-[0.13em] lg:hidden" style={{ color: FAINT }}>Evidence</p><EvidenceLinks record={record} /></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ResearchPublicationsSection() {
  return (
    <section id="research" className="scroll-mt-20 px-5 py-16 sm:px-8 md:px-10 md:py-24" style={{ background: CANVAS }}>
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: RESEARCH }}>Research record</p>
        <h2 className="mt-3 text-[clamp(1.4rem,2.4vw,2.1rem)] font-semibold tracking-[-0.02em]" style={{ color: TEXT }}>Research and peer-reviewed publications</h2>
        <p className="mt-3 max-w-[75ch] text-[0.95rem] leading-[1.65]" style={{ color: MUTED }}>Two publications extend the same systems habit into experimental work: make the boundary explicit, validate against a baseline, and state contribution honestly.</p>
        <div className="mt-9 space-y-6">
          {publications.map((record) => (
            <article key={record.id} className="border-l pl-5 md:pl-7" style={{ borderColor: RESEARCH }}>
              <Chips record={record} />
              <h3 className="mt-3 text-[1.02rem] font-semibold leading-[1.4]" style={{ color: TEXT }}>{record.title}</h3>
              <p className="mt-2 max-w-[82ch] text-[0.88rem] leading-[1.62]" style={{ color: MUTED }}>{record.publicCopy}</p>
              <p className="mt-3 max-w-[78ch] text-[0.84rem] leading-[1.58]" style={{ color: FAINT }}>{record.contribution}</p>
              <div className="mt-2"><EvidenceLinks record={record} /></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TeachingSection() {
  return (
    <section id="teaching" className="scroll-mt-20 px-5 py-16 sm:px-8 md:px-10 md:py-24" style={{ background: SURFACE }}>
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: SIGNAL }}>Technical teaching</p>
        <h2 className="mt-3 text-[clamp(1.4rem,2.4vw,2.1rem)] font-semibold tracking-[-0.02em]" style={{ color: TEXT }}>Teaching complex systems at scale</h2>
        <p className="mt-3 max-w-[78ch] text-[0.95rem] leading-[1.65]" style={{ color: MUTED }}>As a PES University teaching assistant from Jul 2022 to May 2023, I supported 656 learners across computer vision, data analytics, and graduate deep learning—designing labs, assignments, grading tools, competitions, and technical explanations.</p>
        <div className="mt-9 divide-y border-y" style={{ borderColor: RULE }}>
          {courses.map((record) => (
            <article key={record.id} className="grid gap-4 py-7 md:grid-cols-[0.72fr_1.55fr] md:gap-10">
              <div><Chips record={record} /><h3 className="mt-3 text-[1rem] font-semibold" style={{ color: TEXT }}>{record.title}</h3><p className="mt-1 font-mono text-[10.5px]" style={{ color: FAINT }}>{record.dates}</p></div>
              <div><p className="text-[0.88rem] leading-[1.65]" style={{ color: MUTED }}>{record.publicCopy}</p>{record.details?.map((detail) => <p key={detail} className="mt-3 text-[0.84rem] leading-[1.6]" style={{ color: MUTED }}>{detail}</p>)}<EvidenceLinks record={record} /></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EducationRecognitionSection() {
  return (
    <>
      <section id="education" className="scroll-mt-20 px-5 py-16 sm:px-8 md:px-10 md:py-20" style={{ background: CANVAS }}>
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: SIGNAL }}>Foundation</p>
          <h2 className="mt-3 text-[clamp(1.4rem,2.4vw,2.1rem)] font-semibold tracking-[-0.02em]" style={{ color: TEXT }}>Education</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {education.map((record) => <article key={record.id} className="border-l pl-5" style={{ borderColor: RULE }}><h3 className="text-[0.98rem] font-semibold" style={{ color: TEXT }}>{record.title}</h3><p className="mt-2 text-[0.86rem] leading-[1.6]" style={{ color: MUTED }}>{record.publicCopy}</p><p className="mt-2 font-mono text-[10.5px]" style={{ color: FAINT }}>{record.location}</p></article>)}
          </div>
        </div>
      </section>
      <section id="recognition" className="scroll-mt-20 px-5 py-16 sm:px-8 md:px-10 md:py-20" style={{ background: SURFACE }}>
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: SIGNAL }}>Recognition and leadership</p>
          <h2 className="mt-3 text-[clamp(1.4rem,2.4vw,2.1rem)] font-semibold tracking-[-0.02em]" style={{ color: TEXT }}>Recognition and engineering leadership</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {recognition.map((record) => <article key={record.id} className="rounded-lg border p-4" style={{ borderColor: RULE, background: CANVAS }}><Chips record={record} /><h3 className="mt-3 text-[0.96rem] font-semibold" style={{ color: TEXT }}>{record.title}</h3><p className="mt-2 text-[0.84rem] leading-[1.58]" style={{ color: MUTED }}>{record.publicCopy}</p></article>)}
          </div>
          <div id="leadership" className="scroll-mt-20 mt-7 border-t pt-7" style={{ borderColor: RULE }}>
            {leadership.map((record) => <article key={record.id} className="border-l pl-5" style={{ borderColor: SIGNAL }}><Chips record={record} /><h3 className="mt-3 text-[0.98rem] font-semibold" style={{ color: TEXT }}>{record.title}</h3><p className="mt-2 max-w-[74ch] text-[0.86rem] leading-[1.6]" style={{ color: MUTED }}>{record.publicCopy}</p></article>)}
          </div>
        </div>
      </section>
    </>
  );
}

const scope = [
  { label: "Dataplane and optical", skills: "NCS 1014 · CDR · QPSK · 100/400/800G paths · FEC/error counters · PM/telemetry · warm-reload reconciliation", proof: "Cisco optical chapters 01–06 and 09" },
  { label: "Low-level systems", skills: "C · Linux/PetaLinux · drivers/HAL · firmware/FPGA boundaries · secure boot · kernel/ghOSt · scheduling · concurrency · cache/locality · LLVM IR", proof: "Cisco optical · ghOSt · SSP · ChocoLLVM" },
  { label: "Verification and observability", skills: "CMocka · typed stubs · coverage · ASan/UBSan · static analysis · error injection · trace replay · logging · PM · controlled experiments", proof: "Optical chapters 06–09 · backend failure isolation" },
  { label: "Cloud and platform", skills: "AWS · Terraform · Docker · Kubernetes · GitHub Actions/CI/CD · serverless · deployment orchestration", proof: "Cisco backend/intern · Cloud-Hack" },
  { label: "Backend and data", skills: "Java · Python · APIs/SDKs · PostgreSQL · MongoDB · Cassandra · DynamoDB · SNS/SQS · Glue · OpenSearch · Protobuf", proof: "Cisco backend/intern · RDBMS provisioning" },
  { label: "Protocols and security", skills: "secure boot · auth-boundary migrations · air-gapped patching · SHA-256/RIPEMD-160 · secp256k1/ECDSA · P2PKH", proof: "Cisco roles · Bitcoin" },
  { label: "ML, CV, and data systems", skills: "PyTorch/TensorFlow · OpenCV · SfM · Spark/Kafka · RAG · super-resolution · experimental evaluation", proof: "SWIFT · Multiview · Spark/CIFAR · RAG prototypes" },
  { label: "Engineering communication", skills: "technical teaching · assignment/autograder design · mentorship · onboarding · documentation", proof: "Three TA roles · professional leadership" },
  { label: "Languages", skills: "C · Python · Java · C++ · TypeScript/JavaScript · SQL/PL/SQL · MATLAB · shell", proof: "Production roles, projects, and teaching above" },
] as const;

export function EngineeringScopeSection() {
  return (
    <section id="scope" className="scroll-mt-20 px-5 py-16 sm:px-8 md:px-10 md:py-24" style={{ background: CANVAS }}>
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: SIGNAL }}>Evidence trace</p>
        <h2 className="mt-3 text-[clamp(1.4rem,2.4vw,2.1rem)] font-semibold tracking-[-0.02em]" style={{ color: TEXT }}>Engineering scope, proven in the work above</h2>
        <dl className="mt-8 divide-y border-y" style={{ borderColor: RULE }}>
          {scope.map((group) => (
            <div key={group.label} className="grid gap-2 py-5 md:grid-cols-[0.7fr_1.6fr_0.9fr] md:gap-8">
              <dt className="text-[0.88rem] font-semibold" style={{ color: TEXT }}>{group.label}</dt>
              <dd className="font-mono text-[0.76rem] leading-[1.65]" style={{ color: MUTED }}>{group.skills}</dd>
              <dd className="text-[0.78rem] leading-[1.55]" style={{ color: FAINT }}><span className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: SIGNAL }}>Demonstrated by</span><br />{group.proof}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
