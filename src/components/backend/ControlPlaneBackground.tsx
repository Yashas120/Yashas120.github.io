"use client";

import { hexToRgba } from "@/lib/utils";

const ACCENT = "#60a5fa";
const GREEN = "#4ade80";

// Ambient control plane: the declarative source on one side, the run trace on
// the other — the two things actually on screen while a deploy goes out.
const hcl = [
  'module "px_cloud_service" {',
  '  source  = "../modules/common"',
  '  compute = ["ecs", "lambda"]',
  '  state   = ["rds", "dynamodb"]',
  "  events  = [dynamodb_stream, sns_topic, sqs_queue]",
  "  auth    = okta.oidc  # was: ping",
  "}",
];

const runTrace = [
  "agent> plan    42 to add · 11 to change · 0 to destroy",
  "human> review  blast radius read → approve",
  "agent> apply   parallel graph · deploy time halved",
  "ci   > sdk     python + java published on merge",
  "bot  > answer  3 chunks cited from #ci-cd",
  "slo  > p95     -40% after index + query work",
];

export function ControlPlaneBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-ink-900">
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${hexToRgba(ACCENT, 0.08)}, transparent 45%, ${hexToRgba(GREEN, 0.05)})` }}
      />

      {/* blueprint grid — infra drawn before it is built */}
      <div className="grid-bg absolute inset-0 opacity-70" />

      <div
        className="absolute -left-24 top-1/4 h-[440px] w-[440px] rounded-full blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${hexToRgba(ACCENT, 0.18)}, transparent)` }}
      />
      <div
        className="absolute -right-24 top-2/3 h-[460px] w-[460px] rounded-full blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${hexToRgba(GREEN, 0.12)}, transparent)` }}
      />

      <div
        className="absolute inset-x-0 top-0 flex justify-between px-6 py-1 font-mono text-[9px]"
        style={{ color: hexToRgba(ACCENT, 0.32) }}
      >
        <span>intent</span>
        <span className="hidden sm:inline">plan → review → apply → observe → converge</span>
        <span>desired state</span>
      </div>

      <pre
        className="absolute left-5 top-16 hidden font-mono text-[10px] leading-5 xl:block"
        style={{ color: hexToRgba(ACCENT, 0.22) }}
      >
        {hcl.join("\n")}
      </pre>

      <pre
        className="absolute bottom-40 right-5 hidden text-right font-mono text-[10px] leading-5 xl:block"
        style={{ color: hexToRgba(GREEN, 0.2) }}
      >
        {runTrace.join("\n")}
      </pre>

      {/* pipeline rails — work moving through the system with nobody pushing it */}
      {[0, 1, 2].map((i) => (
        <div key={i} className="absolute inset-x-0 overflow-hidden" style={{ bottom: 44 + i * 22 }}>
          <div className="h-px w-full" style={{ background: hexToRgba(ACCENT, 0.1) }} />
          <div
            className="animate-flow -mt-px h-px w-1/4"
            style={{
              background: `linear-gradient(90deg, transparent, ${hexToRgba(i === 1 ? GREEN : ACCENT, 0.55)}, transparent)`,
              animationDelay: `${i * 2.4}s`,
            }}
          />
        </div>
      ))}

      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgb(var(--ink-900) / 0.5) 100%)" }}
      />
    </div>
  );
}
