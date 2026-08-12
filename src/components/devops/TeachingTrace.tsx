import { teachingAppointments } from "@/data/devops/teaching";
import { DV } from "./tokens";

export function TeachingTrace() {
  return (
    <ol className="m-0 mt-5 max-w-[72ch] list-none p-0">
      {teachingAppointments.map((appointment, index) => (
        <li
          key={appointment.id}
          className="grid gap-2 border-t py-4 sm:grid-cols-[32px_1fr]"
          style={{ borderColor: DV.border }}
        >
          <span className="font-mono text-[12px]" style={{ color: DV.amber }} aria-hidden>
            {String(index + 1).padStart(2, "0")}
          </span>
          <article aria-labelledby={`${appointment.id}-title`}>
            <p className="m-0 font-mono text-[12px] leading-relaxed" style={{ color: DV.cyan }}>
              {appointment.dates} · {appointment.learners}
            </p>
            <h3 id={`${appointment.id}-title`} className="mb-0 mt-1 text-[17px] font-semibold" style={{ color: DV.text }}>
              {appointment.course}
            </h3>
            <p className="m-0 mt-1.5 text-[15px] leading-relaxed" style={{ color: DV.muted }}>
              {appointment.contribution}
            </p>
          </article>
        </li>
      ))}
    </ol>
  );
}
