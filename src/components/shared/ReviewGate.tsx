"use client";

import { motion } from "framer-motion";
import { ShieldCheck, TriangleAlert, UserCheck, type LucideIcon } from "lucide-react";
import { hexToRgba } from "@/lib/utils";

export interface GateCheck {
  label: string;
  result: string;
  level: "pass" | "warn";
}

export interface GateAction {
  label: string;
  tone: "approve" | "reject";
  onClick: () => void;
}

export interface ReviewGateProps {
  title: string;
  summary?: string;
  checks?: GateCheck[];
  /** The artifact actually under review. */
  children?: React.ReactNode;
  note?: string;
  actions?: GateAction[];
  icon?: LucideIcon;
  tone?: string;
  pass?: string;
  reject?: string;
}

/**
 * The point where a machine stops and a person decides. Automated checks run
 * first, the change is shown, and only then is someone asked to sign off.
 */
export function ReviewGate({
  title,
  summary,
  checks,
  children,
  note,
  actions,
  icon: Icon = UserCheck,
  tone = "#fbbf24",
  pass = "#4ade80",
  reject = "#f87171",
}: ReviewGateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border p-3"
      style={{ borderColor: hexToRgba(tone, 0.4), background: hexToRgba(tone, 0.06) }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2" style={{ color: tone }}>
          <Icon className="h-3.5 w-3.5" /> {title}
        </span>
        {summary && <span className="text-[11px] text-zinc-500">{summary}</span>}
      </div>

      {checks && checks.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {checks.map((g) => {
            const warn = g.level === "warn";
            const c = warn ? tone : pass;
            const CheckIcon = warn ? TriangleAlert : ShieldCheck;
            return (
              <span
                key={g.label}
                className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]"
                style={{ borderColor: hexToRgba(c, 0.35), background: hexToRgba(c, 0.08), color: c }}
              >
                <CheckIcon className="h-3 w-3" />
                {g.label}: <span className="text-zinc-300">{g.result}</span>
              </span>
            );
          })}
        </div>
      )}

      {children}

      {note && <p className="mt-2 text-[11px] text-zinc-500">{note}</p>}

      {actions && actions.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {actions.map((a) => {
            const c = a.tone === "approve" ? pass : reject;
            return (
              <button
                key={a.label}
                onClick={a.onClick}
                className="rounded-md border px-3 py-1 text-[11px] transition-colors hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ borderColor: c, color: c, background: hexToRgba(c, 0.08), outlineColor: c }}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
