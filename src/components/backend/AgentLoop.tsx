"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Check, ChevronRight, ShieldCheck, TriangleAlert, UserCheck, X } from "lucide-react";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#60a5fa";
const GREEN = "#4ade80";
const AMBER = "#fbbf24";
const RED = "#f87171";

interface Step {
  kind: "intent" | "think" | "tool" | "done";
  text: string;
  out?: string;
  note?: string;
}

// Everything the agent "does" below is real work from the PX Cloud backend role.
// The agent framing is how it gets sequenced now — propose, review, apply, observe.
const planningSteps: Step[] = [
  {
    kind: "intent",
    text: "migrate every PX Cloud service to infrastructure as code — and make every deploy after this one boring",
  },
  {
    kind: "think",
    text: "7 products · EC2, ECS, Lambda, RDS, DynamoDB, SQS, SNS, IAM · provisioned by hand, drift undocumented",
  },
  {
    kind: "tool",
    text: 'repo.inventory(scope="px-cloud/*")',
    out: "9 services · 0 modules · 3 envs drifting",
    note: "Measure the sprawl before automating it.",
  },
  {
    kind: "tool",
    text: 'terraform.plan(module="common")',
    out: "42 to add · 11 to change · 0 to destroy",
    note: "Common modules become the one contract every service is provisioned through.",
  },
];

const applyingSteps: Step[] = [
  {
    kind: "tool",
    text: "terraform.apply(parallelism=12)",
    out: "applied · deploy time -50%",
    note: "Independent resources stopped queueing behind each other.",
  },
  {
    kind: "tool",
    text: "events.wire(dynamodb → sns → sqs → lambda)",
    out: "workflows self-trigger",
    note: "Interdependent services react to events instead of waiting on a person.",
  },
  {
    kind: "tool",
    text: 'ci.publish_sdk(langs=["python", "java"])',
    out: "4h of hand-edits → 0",
    note: "Both SDKs regenerate and publish on any API change.",
  },
  {
    kind: "tool",
    text: "auth.migrate(ping → okta, products=7)",
    out: "7 products · zero prod impact",
    note: "Staged behind checks, product by product — not a big-bang weekend.",
  },
  {
    kind: "tool",
    text: 'db.tune(["postgres", "mongo", "cassandra"])',
    out: "p95 page load -40%",
    note: "A $2B-revenue app, measured before and after rather than guessed at.",
  },
  {
    kind: "tool",
    text: 'rag.index(source="#ci-cd")',
    out: "QA bot answers, with citations",
    note: "OpenAI APIs + retrieval, so repeat questions stop interrupting engineers.",
  },
  {
    kind: "tool",
    text: "incidents.postmortem(n=4)",
    out: "4 root-caused · prevention shipped",
    note: "Kill the class of failure with ops and infra, not just today's symptom.",
  },
  {
    kind: "done",
    text: "loop closed — the next deploy needs no one",
    note: "Humans review. Machines repeat.",
  },
];

interface Guardrail {
  label: string;
  result: string;
  level: "pass" | "warn";
}

interface DiffLine {
  op: "+" | "~" | "-";
  resource: string;
  tag?: string;
  flag?: boolean;
}

interface Plan {
  summary: string;
  guardrails: Guardrail[];
  diff: DiffLine[];
  more: number;
  escalation: string;
}

// Round 1: the machine's checks all pass, but it refuses to decide one thing on
// its own — a change to the prod database — and escalates that to a human.
const plan1: Plan = {
  summary: "42 to add · 11 to change · 0 to destroy",
  guardrails: [
    { label: "tfsec", result: "0 high · 0 medium", level: "pass" },
    { label: "ingress", result: "no 0.0.0.0/0", level: "pass" },
    { label: "iam", result: "least-privilege", level: "pass" },
    { label: "cost", result: "+$180/mo est.", level: "pass" },
    { label: "blast radius", result: "touches rds-pxcloud (prod)", level: "warn" },
  ],
  diff: [
    { op: "+", resource: "aws_ecs_service.px_api" },
    { op: "+", resource: "aws_lambda_function.sdk_publisher" },
    { op: "+", resource: "aws_dynamodb_table.events" },
    { op: "+", resource: "aws_sns_topic.fanout" },
    { op: "+", resource: "aws_sqs_queue.workers" },
    { op: "+", resource: "aws_iam_role.service", tag: "scoped" },
    { op: "~", resource: "aws_db_instance.pxcloud", tag: "prod · param group", flag: true },
  ],
  more: 46,
  escalation: "An agent can write the plan. Only a human should sign off on touching prod.",
};

// Round 2: after a reject the agent narrows scope to stage, so nothing prod is
// in the blast radius — now every check is green and it's a clean approve.
const plan2: Plan = {
  summary: "38 to add · 4 to change · 0 to destroy · stage only",
  guardrails: [
    { label: "tfsec", result: "0 high · 0 medium", level: "pass" },
    { label: "ingress", result: "no 0.0.0.0/0", level: "pass" },
    { label: "iam", result: "least-privilege", level: "pass" },
    { label: "cost", result: "+$120/mo est.", level: "pass" },
    { label: "blast radius", result: "stage only · prod untouched", level: "pass" },
  ],
  diff: [
    { op: "+", resource: "aws_ecs_service.px_api" },
    { op: "+", resource: "aws_lambda_function.sdk_publisher" },
    { op: "+", resource: "aws_dynamodb_table.events" },
    { op: "+", resource: "aws_sns_topic.fanout" },
    { op: "+", resource: "aws_sqs_queue.workers" },
    { op: "+", resource: "aws_iam_role.service", tag: "scoped" },
  ],
  more: 32,
  escalation: "Scope narrowed to stage. Prod change is now its own reviewed change window.",
};

type Phase = "planning" | "gate" | "revising" | "applying" | "done";

function opColor(op: DiffLine["op"]) {
  return op === "+" ? GREEN : op === "-" ? RED : ACCENT;
}

function StepRow({ s }: { s: Step }) {
  if (s.kind === "intent") {
    return (
      <div className="rounded-lg border px-3 py-2" style={{ borderColor: hexToRgba(ACCENT, 0.3), background: hexToRgba(ACCENT, 0.07) }}>
        <span className="text-[10px] uppercase tracking-widest" style={{ color: ACCENT }}>
          intent
        </span>
        <p className="mt-0.5 text-zinc-200">{s.text}</p>
      </div>
    );
  }
  if (s.kind === "think") return <p className="text-zinc-500">··· {s.text}</p>;
  if (s.kind === "done") {
    return (
      <div className="rounded-lg border px-3 py-2" style={{ borderColor: hexToRgba(GREEN, 0.35), background: hexToRgba(GREEN, 0.07) }}>
        <span className="flex items-center gap-2" style={{ color: GREEN }}>
          <Check className="h-3.5 w-3.5" /> {s.text}
        </span>
        {s.note && <p className="mt-1 text-[11px] text-zinc-500">{s.note}</p>}
      </div>
    );
  }
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <ChevronRight className="h-3.5 w-3.5 translate-y-0.5" style={{ color: ACCENT }} />
        <span className="text-zinc-200">{s.text}</span>
        {s.out && (
          <span className="ml-auto text-[11px]" style={{ color: GREEN }}>
            {s.out}
          </span>
        )}
      </div>
      {s.note && <p className="pl-5 text-[11px] text-zinc-500">{s.note}</p>}
    </div>
  );
}

function Gate({ plan, canReject, onApprove, onReject }: { plan: Plan; canReject: boolean; onApprove: () => void; onReject: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border p-3"
      style={{ borderColor: hexToRgba(AMBER, 0.4), background: hexToRgba(AMBER, 0.06) }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2" style={{ color: AMBER }}>
          <UserCheck className="h-3.5 w-3.5" /> human gate — review the plan
        </span>
        <span className="text-[11px] text-zinc-500">{plan.summary}</span>
      </div>

      {/* the machine's own checks, run before a human is asked */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {plan.guardrails.map((g) => {
          const warn = g.level === "warn";
          const c = warn ? AMBER : GREEN;
          const Icon = warn ? TriangleAlert : ShieldCheck;
          return (
            <span
              key={g.label}
              className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]"
              style={{ borderColor: hexToRgba(c, 0.35), background: hexToRgba(c, 0.08), color: c }}
            >
              <Icon className="h-3 w-3" />
              {g.label}: <span className="text-zinc-300">{g.result}</span>
            </span>
          );
        })}
      </div>

      {/* the actual thing under review — a terraform plan diff */}
      <div className="mt-2.5 overflow-hidden rounded-md border border-line/10" style={{ background: "rgb(var(--code-bg))" }}>
        <div className="border-b border-line/10 px-3 py-1 text-[10px] text-zinc-500">terraform plan · px-cloud/common</div>
        <div className="px-3 py-2">
          {plan.diff.map((d) => (
            <p key={d.resource} className="flex items-baseline gap-2">
              <span style={{ color: opColor(d.op) }}>{d.op}</span>
              <span className="text-zinc-300">{d.resource}</span>
              {d.tag && (
                <span
                  className="rounded px-1 text-[9px]"
                  style={{
                    background: hexToRgba(d.flag ? AMBER : ACCENT, 0.12),
                    color: d.flag ? AMBER : ACCENT,
                  }}
                >
                  {d.tag}
                </span>
              )}
            </p>
          ))}
          <p className="mt-0.5 text-[11px] text-zinc-600">… +{plan.more} more resources</p>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-zinc-500">{plan.escalation}</p>

      <div className="mt-2.5 flex flex-wrap gap-2">
        <button
          onClick={onApprove}
          className="rounded-md border px-3 py-1 text-[11px] transition-colors hover:brightness-125"
          style={{ borderColor: GREEN, color: GREEN, background: hexToRgba(GREEN, 0.08) }}
        >
          approve (y)
        </button>
        {canReject && (
          <button
            onClick={onReject}
            className="rounded-md border px-3 py-1 text-[11px] transition-colors hover:brightness-125"
            style={{ borderColor: RED, color: RED, background: hexToRgba(RED, 0.08) }}
          >
            reject & revise (n)
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function AgentLoop({ trigger }: { trigger: number }) {
  const [phase, setPhase] = useState<Phase>("planning");
  const [planIdx, setPlanIdx] = useState(0);
  const [applyIdx, setApplyIdx] = useState(0);
  const [round, setRound] = useState<1 | 2>(1);
  const [decision, setDecision] = useState<null | { round: 1 | 2; action: "approved" | "rejected" }>(null);
  const [rejectedOnce, setRejectedOnce] = useState(false);

  useEffect(() => {
    setPhase("planning");
    setPlanIdx(0);
    setApplyIdx(0);
    setRound(1);
    setDecision(null);
    setRejectedOnce(false);
  }, [trigger]);

  // reveal the planning steps, then stop at the gate
  useEffect(() => {
    if (phase !== "planning") return;
    if (planIdx >= planningSteps.length) {
      const t = setTimeout(() => setPhase("gate"), 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPlanIdx((i) => i + 1), planIdx === 0 ? 200 : 380);
    return () => clearTimeout(t);
  }, [phase, planIdx]);

  // after a reject, the agent revises scope and re-plans
  useEffect(() => {
    if (phase !== "revising") return;
    const t = setTimeout(() => {
      setRound(2);
      setPhase("gate");
    }, 1100);
    return () => clearTimeout(t);
  }, [phase]);

  // reveal the apply steps once approved
  useEffect(() => {
    if (phase !== "applying") return;
    if (applyIdx >= applyingSteps.length) {
      setPhase("done");
      return;
    }
    const t = setTimeout(() => setApplyIdx((i) => i + 1), 380);
    return () => clearTimeout(t);
  }, [phase, applyIdx]);

  const approve = useCallback(() => {
    setDecision({ round, action: "approved" });
    setPhase("applying");
  }, [round]);

  const reject = useCallback(() => {
    setDecision({ round, action: "rejected" });
    setRejectedOnce(true);
    setPhase("revising");
  }, [round]);

  // y/n answer the gate prompt like a terminal
  useEffect(() => {
    if (phase !== "gate") return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const k = e.key.toLowerCase();
      if (k === "y") approve();
      if (k === "n" && round === 1) reject();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, round, approve, reject]);

  const status =
    phase === "gate"
      ? "awaiting human review"
      : phase === "revising"
      ? "revising scope"
      : phase === "done"
      ? "converged"
      : phase === "applying"
      ? "applying"
      : "planning";
  const statusColor = phase === "gate" ? AMBER : phase === "revising" ? RED : phase === "done" ? GREEN : ACCENT;
  const currentPlan = round === 1 ? plan1 : plan2;
  const showCursor = phase === "planning" || phase === "applying";

  return (
    <div className="overflow-hidden rounded-xl border border-line/10 bg-ink-800">
      <div className="flex items-center justify-between border-b border-line/10 px-4 py-2.5 font-mono text-[11px]">
        <span className="flex items-center gap-2 text-zinc-400">
          <Bot className="h-3.5 w-3.5" style={{ color: ACCENT }} /> agent run #{trigger + 1}
        </span>
        <span className="flex items-center gap-2" style={{ color: statusColor }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor }} />
          {status}
        </span>
      </div>

      <div className="space-y-2 p-4 font-mono text-[12px] leading-relaxed">
        {planningSteps.slice(0, planIdx).map((s, i) => (
          <motion.div key={`plan-${i}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <StepRow s={s} />
          </motion.div>
        ))}

        {/* decision history — reads back like a log once resolved */}
        {rejectedOnce && (
          <div className="flex items-center gap-2 text-[11px]" style={{ color: RED }}>
            <X className="h-3.5 w-3.5" /> human rejected round 1 — reason: don&apos;t touch prod in this window
          </div>
        )}
        {rejectedOnce && phase !== "gate" && phase !== "revising" && (
          <p className="text-zinc-500">··· agent revised: scope narrowed to stage, prod carved out into its own change</p>
        )}

        {phase === "revising" && (
          <p className="text-zinc-500">
            ··· re-planning with prod excluded
            <span className="ml-1 inline-block h-3 w-1.5 animate-blink align-middle" style={{ background: RED }} />
          </p>
        )}

        {phase === "gate" && <Gate plan={currentPlan} canReject={round === 1} onApprove={approve} onReject={reject} />}

        {/* collapsed approval marker, so the applied run still shows a human signed off */}
        {decision?.action === "approved" && phase !== "gate" && (
          <div className="flex items-center gap-2 text-[11px]" style={{ color: GREEN }}>
            <UserCheck className="h-3.5 w-3.5" /> human approved round {decision.round} — blast radius reviewed
          </div>
        )}

        {applyingSteps.slice(0, applyIdx).map((s, i) => (
          <motion.div key={`apply-${i}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <StepRow s={s} />
          </motion.div>
        ))}

        {showCursor && <span className="inline-block h-3.5 w-1.5 animate-blink align-middle" style={{ background: ACCENT }} />}
      </div>

      <div className="border-t border-line/10 px-4 py-2 font-mono text-[10px] text-zinc-600">
        real work from the PX Cloud backend role, sequenced the way I run it now: propose → review → apply → observe
      </div>
    </div>
  );
}
