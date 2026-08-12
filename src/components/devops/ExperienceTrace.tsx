import { professionalExperience } from "@/data/devops/experience";
import { EvidenceDrawer } from "./EvidenceDrawer";
import { DV } from "./tokens";

export function ExperienceTrace() {
  return (
    <ol className="m-0 mt-7 max-w-[72ch] list-none border-l p-0" style={{ borderColor: DV.border }}>
      {professionalExperience.map((role) => (
        <li key={role.id} className="relative pb-8 pl-6 last:pb-0">
          <span
            aria-hidden
            className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-sm border"
            style={{ borderColor: DV.amber, background: DV.canvas }}
          />
          <article aria-labelledby={`${role.id}-title`}>
            <p className="m-0 font-mono text-[12px] leading-relaxed" style={{ color: DV.cyan }}>
              {role.organization} · {role.dates} · {role.location}
            </p>
            <h3 id={`${role.id}-title`} className="mb-0 mt-1 text-[19px] font-semibold leading-snug" style={{ color: DV.text }}>
              {role.role}
            </h3>
            <p className="m-0 mt-2 text-[15px] leading-relaxed" style={{ color: DV.muted }}>
              {role.summary}
            </p>
            <p className="m-0 mt-3 font-mono text-[12px] leading-relaxed" style={{ color: DV.muted }}>
              Layers: {role.layers.join(" → ")}
            </p>
            <EvidenceDrawer ids={role.evidenceIds} label="Inspect supporting evidence" />
          </article>
        </li>
      ))}
    </ol>
  );
}
