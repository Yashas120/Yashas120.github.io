import type { ReactNode } from "react";

const actContent: Record<string, { state: string; title: string; children: ReactNode }> = {
  overview: {
    state: "DIVERGENCE DETECTED",
    title: "Operator intent enters a current/desired-state comparison.",
    children: <><div className="bk-static-plane__states"><span>current · serial delivery</span><i>≠</i><span>desired · repeatable delivery</span></div><p>Make delivery repeatable without widening blast radius.</p></>,
  },
  experience: {
    state: "BOUNDARY LENS",
    title: "The same reasoning crosses three system layers.",
    children: <ol><li>service state · API contract and SDK delivery</li><li>infrastructure state · dependencies, events, migration</li><li>hardware state · desired/current reconciliation</li></ol>,
  },
  infrastructure: {
    state: "REVIEWED PLAN",
    title: "A serial graph becomes dependency-aware parallel lanes.",
    children: <><div className="bk-static-plane__flow"><span>inspect</span><span>plan</span><span className="is-review">human review</span><span>parallel apply</span><span className="is-complete">converge</span></div><p>Unchanged resources stay stable; independent changes advance together.</p></>,
  },
  events: {
    state: "EVENTS IN MOTION",
    title: "One durable write fans out into two regional paths.",
    children: <div className="bk-static-plane__fanout"><span>DynamoDB write</span><i>SNS</i><span>regional SQS → service → SQL</span><span>regional SQS → service → SQL</span></div>,
  },
  reliability: {
    state: "OBSERVE / REPAIR",
    title: "Evidence shortens one trace and shifts traffic safely.",
    children: <><div className="bk-static-plane__flow"><span>observe</span><span>isolate</span><span>change</span><span>verify</span><span className="is-complete">prevent</span></div><p>Filtering moves closer to data; compatibility stays until observed traffic completes the shift.</p></>,
  },
  systems: {
    state: "PHYSICAL RECONCILIATION",
    title: "Desired software state meets current hardware state.",
    children: <div className="bk-static-plane__rows"><span>resource 1 · matches · PRESERVE</span><span>resource 2 · diverged · CHANGE</span><span>resource 3 · matches · PRESERVE</span></div>,
  },
  automation: {
    state: "REPEATED WORK REMOVED",
    title: "Two earlier flows attach proof to the control loop.",
    children: <div className="bk-static-plane__rows"><span>OpenAPI → Python + Java SDKs → publish</span><span>domain knowledge → guided engineering workflow</span></div>,
  },
  projects: {
    state: "PROJECT LABS",
    title: "Each mechanism resolves into the real shared demo.",
    children: <div className="bk-static-plane__rows"><span>cloud · request → constraints → allocation</span><span>bitcoin · transaction → sign → verify</span><span>multiview · matches → geometry → triangulation</span><span>SWIFT · spatial + frequency branches</span></div>,
  },
  "research-teaching": {
    state: "EVIDENCE ATTACHED",
    title: "Research, teaching, education, and leadership stay in the same record.",
    children: <div className="bk-static-plane__flow"><span>papers</span><span>656 learners</span><span>education</span><span>leadership</span></div>,
  },
  "work-index": {
    state: "REGISTRY COMPLETE",
    title: "Ownership, contribution, lifecycle, and exclusions remain auditable.",
    children: <div className="bk-static-plane__flow"><span>featured</span><span>indexed</span><span>excluded</span><span className="is-complete">verified</span></div>,
  },
  contact: {
    state: "CONVERGED",
    title: "Current and desired state align.",
    children: <><div className="bk-static-plane__states"><span>observed state</span><i>=</i><span>desired state</span></div><p>Ready for the next system.</p></>,
  },
};

export function StaticControlPlane({ act }: Readonly<{ act: string }>) {
  const content = actContent[act] ?? actContent.overview;
  return (
    <figure className="bk-static-plane" aria-labelledby={`bk-static-${act}`}>
      <figcaption><span>{content.state}</span><strong id={`bk-static-${act}`}>{content.title}</strong></figcaption>
      {content.children}
    </figure>
  );
}
