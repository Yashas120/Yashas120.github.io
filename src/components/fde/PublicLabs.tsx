import { ProjectDemoPresentation } from "@/components/demos/ProjectDemoPresentation";
import type { DemoId } from "@/data/demos";
import { COBALT, INK } from "./dossier/kit";

const LABS: readonly DemoId[] = ["ghost", "bitcoin", "chocollvm", "swift", "multiview", "cifar", "parallel", "cloud", "yelp", "petra"];

const fdeTheme = {
  accent: COBALT,
  surface: "var(--fde-paper)",
  border: "var(--fde-rule)",
  text: INK,
  muted: "color-mix(in srgb, var(--fde-ink) 72%, transparent)",
  label: "Related public lab — not employer code",
};

export function PublicLabs() {
  return (
    <section id="public-labs" data-evidence-ids="LK-05" className="fde-annex-section scroll-mt-20" style={{ color: INK }} aria-labelledby="public-labs-title">
      <div>
        <header className="fde-folio-head grid gap-5 border-t pt-5 md:grid-cols-[9rem_1fr]">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-50">In-page proof</div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: COBALT }}>PUBLIC IMPLEMENTATION LABS · INTERACTIVE</p>
            <h2 id="public-labs-title" className="mt-2 max-w-[28ch] text-[clamp(1.75rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.03em]">Run the evidence here.</h2>
            <p className="mt-4 max-w-[76ch] text-[0.98rem] leading-7 opacity-70">All ten browser labs are mounted in this dossier. They do not reproduce Cisco, Schneider Electric, or Webex systems; each is an independent implementation that makes constraints, decisions, and state inspectable here.</p>
          </div>
        </header>

        <div className="mt-10 space-y-10">
          {LABS.map((demoId) => (
            <div key={demoId} id={`lab-${demoId}`} className="scroll-mt-20">
              <ProjectDemoPresentation
                demoId={demoId}
                theme={fdeTheme}
                headingLevel={3}
                autoOpen={demoId === "cloud"}
                eyebrow="Public browser lab — runs in this dossier"
                standaloneHref={null}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
