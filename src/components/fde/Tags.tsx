import type { DeliveryStatus, Ownership } from "@/data/fde";
import { hexToRgba } from "@/lib/utils";
import { ACCENT, GREEN, VIOLET } from "./palette";

const OWNERSHIP_COPY: Record<Ownership, string> = {
  individual: "individually owned",
  collaborative: "collaborative",
  supporting: "supporting contribution",
};

const STATUS_COPY: Record<DeliveryStatus, string> = {
  production: "production",
  "deployed-internal": "deployed internally",
  "proof-of-concept": "proof of concept",
  coursework: "coursework",
};

export function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] leading-4"
      style={{ borderColor: hexToRgba(color, 0.35), background: hexToRgba(color, 0.08), color }}
    >
      {children}
    </span>
  );
}

/** Ownership and delivery status are shown together so neither can be inferred generously. */
export function AttributionTags({ ownership, status }: { ownership: Ownership; status: DeliveryStatus }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <Tag color={status === "proof-of-concept" ? VIOLET : GREEN}>{STATUS_COPY[status]}</Tag>
      <Tag color={ownership === "individual" ? ACCENT : VIOLET}>{OWNERSHIP_COPY[ownership]}</Tag>
    </span>
  );
}
