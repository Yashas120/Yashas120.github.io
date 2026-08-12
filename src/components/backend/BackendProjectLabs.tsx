import { ProjectDemoPresentation } from "@/components/demos/ProjectDemoPresentation";

const backendTheme = {
  accent: "#7dd3fc",
  surface: "#101827",
  border: "rgba(125, 211, 252, 0.24)",
  text: "#f8fafc",
  muted: "#a8b3c7",
  label: "Resolved control-plane evidence",
};

export function BackendProjectLabs() {
  return (
    <section id="backend-project-labs" className="bk-demo-labs" aria-labelledby="backend-project-labs-title">
      <div className="bk-demo-labs__inner">
        <p className="bk-eyebrow">RESULT → INSPECT IT YOURSELF</p>
        <h2 id="backend-project-labs-title">The control flow has converged. The implementations are live below.</h2>
        <p className="bk-lede">Cloud-Hack remains repository evidence with no browser lab yet. The three labs here are exact project matches and preserve their own ownership and runtime boundaries.</p>
        <div className="bk-demo-labs__stack">
          <ProjectDemoPresentation demoId="bitcoin" theme={backendTheme} autoOpen eyebrow="Signed transaction · resolved" />
          <ProjectDemoPresentation demoId="cloud" theme={backendTheme} eyebrow="Quota → allocation → commit / reject" />
          <ProjectDemoPresentation demoId="petra" theme={backendTheme} preview eyebrow="Secondary backend evidence · stubbed trace" />
        </div>
      </div>
    </section>
  );
}
