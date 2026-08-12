import { ProjectDemoPresentation } from "@/components/demos/ProjectDemoPresentation";
import { CANVAS, MUTED, RULE, SIGNAL, SURFACE, TEXT } from "./palette";

const theme = {
  accent: SIGNAL,
  surface: SURFACE,
  border: RULE,
  text: TEXT,
  muted: MUTED,
  label: "Control / annotation plane",
};

export function ResearchLabsSection() {
  return (
    <section id="project-labs" className="scroll-mt-20 px-5 py-16 sm:px-8 md:px-10 md:py-24" style={{ background: CANVAS }}>
      <div className="mx-auto max-w-5xl">
        <div className="border-y py-6" style={{ borderColor: RULE }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: SIGNAL }}>Signal handoff</p>
          <h2 className="mt-3 text-[clamp(1.4rem,2.4vw,2.1rem)] font-semibold tracking-[-0.02em]" style={{ color: TEXT }}>
            Production systems above. Inspectable implementations below.
          </h2>
          <p className="mt-3 max-w-[76ch] text-[0.95rem] leading-[1.65]" style={{ color: MUTED }}>
            Each control record names the project boundary; the surface beneath it is the inspected browser signal. Labs load only as they approach the viewport or when opened.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          <ProjectDemoPresentation demoId="bitcoin" theme={theme} autoOpen />
          <ProjectDemoPresentation demoId="multiview" theme={theme} autoOpen />
          <ProjectDemoPresentation demoId="swift" theme={theme} />

          <article id="project-underwater" className="scroll-mt-20 rounded-xl border p-5 sm:p-6" style={{ borderColor: RULE, background: SURFACE }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: SIGNAL }}>Compact research record · no matching browser lab</p>
            <h3 className="mt-2 text-xl font-semibold" style={{ color: TEXT }}>Underwater Data-Center Monitoring</h3>
            <p className="mt-3 max-w-[78ch] text-[0.9rem] leading-[1.65]" style={{ color: MUTED }}>
              Contributed to a redundant Arduino sensing and alerting concept for submerged infrastructure, where maintenance access is expensive and slow. Published at IEEE CSITSS in 2021. Repository and publication evidence remain visible elsewhere in the complete record; no unrelated demo is attached here.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
