import { ProjectDemoPresentation } from "@/components/demos/ProjectDemoPresentation";
import { BG, COBALT, INK } from "./dossier/kit";

const fdeTheme = {
  accent: COBALT,
  surface: "#f4efe5",
  border: "rgba(20, 46, 92, 0.28)",
  text: INK,
  muted: "rgba(20, 30, 43, 0.72)",
  label: "Related public lab — not employer code",
};

export function PublicLabs() {
  return (
    <section id="public-labs" className="scroll-mt-20 border-t px-5 py-20 md:px-10 md:py-28" style={{ background: BG, color: INK, borderColor: "rgba(20, 46, 92, 0.22)" }} aria-labelledby="public-labs-title">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: COBALT }}>Continue to related public implementation labs ↓</p>
        <h2 id="public-labs-title" className="mt-3 max-w-[28ch] text-[clamp(1.75rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.03em]">Independent evidence, with the employer boundary intact.</h2>
        <p className="mt-4 max-w-[76ch] text-[0.98rem] leading-7 opacity-70">These labs do not reproduce Cisco, Schneider Electric, or Webex systems. Each independent browser lab demonstrates the same engineering habit: make constraints, decisions, and system state inspectable.</p>

        <div className="mt-10 space-y-10">
          <ProjectDemoPresentation demoId="cloud" theme={fdeTheme} autoOpen eyebrow="Related public lab — not employer code" />
          <ProjectDemoPresentation demoId="petra" theme={fdeTheme} eyebrow="Related public lab — not employer code" />
        </div>
      </div>
    </section>
  );
}
