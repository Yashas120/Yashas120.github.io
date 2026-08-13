"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";

const BLUE = "#76b3ff";
const GREEN = "#79d99a";
const AMBER = "#ffc66d";
const MUTED = "#60738a";
const LINE = "#2b3d52";
const SURFACE = "#0b131e";

function useSegment(progress: MotionValue<number>, start: number, end: number) {
  return useTransform(progress, [start, end], [0, 1], { clamp: true });
}

function SceneLayer({
  progress,
  range,
  children,
  className = "",
}: Readonly<{
  progress: MotionValue<number>;
  range: readonly [number, number];
  children: ReactNode;
  className?: string;
}>) {
  const span = range[1] - range[0];
  const opacity = useTransform(
    progress,
    [range[0] - span * 0.12, range[0] + span * 0.08, range[1] - span * 0.08, range[1] + span * 0.12],
    [0, 1, 1, 0],
    { clamp: true },
  );
  return <motion.g className={className} style={{ opacity }}>{children}</motion.g>;
}

function Text({ x, y, children, anchor = "start", fill = MUTED, size = 13 }: Readonly<{ x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; fill?: string; size?: number }>) {
  return <text x={x} y={y} textAnchor={anchor} fill={fill} fontSize={size} fontFamily="var(--font-jetbrains), ui-monospace, monospace">{children}</text>;
}

function StateNode({ x, y, label, state = "stable", width = 126 }: Readonly<{ x: number; y: number; label: string; state?: "stable" | "changed" | "review" | "complete"; width?: number }>) {
  const color = state === "review" ? AMBER : state === "complete" ? GREEN : state === "changed" ? BLUE : LINE;
  const fill = state === "review" ? "rgba(255,198,109,.08)" : state === "complete" ? "rgba(121,217,154,.07)" : state === "changed" ? "rgba(118,179,255,.08)" : SURFACE;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={width} height="52" rx="7" fill={fill} stroke={color} />
      <path d="M14 17h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Text x={14} y={36} fill="#dbe8f6" size={12}>{label}</Text>
    </g>
  );
}

function Edge({ d, color = LINE, dashed = false, width = 1.5 }: Readonly<{ d: string; color?: string; dashed?: boolean; width?: number }>) {
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dashed ? "5 5" : undefined} strokeLinecap="round" />;
}

function IntentAct({ progress }: Readonly<{ progress: MotionValue<number> }>) {
  const local = useSegment(progress, 0, 0.1);
  const intentX = useTransform(local, [0, 0.72], [-20, 28], { clamp: true });
  const inspect = useTransform(local, [0.22, 0.7], [0, 1], { clamp: true });
  const desiredOpacity = useTransform(local, [0, 0.45], [0.7, 1]);
  const markerScale = useTransform(local, [0, 0.65], [0.78, 1], { clamp: true });
  return (
    <SceneLayer progress={progress} range={[-0.01, 0.1]}>
      <motion.g style={{ x: intentX }}>
        <rect x="20" y="36" width="322" height="58" rx="29" fill="rgba(118,179,255,.1)" stroke={BLUE} />
        <circle cx="48" cy="65" r="7" fill={BLUE} />
        <Text x={66} y={61} fill={BLUE} size={11}>OPERATOR INTENT</Text>
        <Text x={66} y={78} fill="#e6eef8" size={12}>make delivery repeatable · constrain blast radius</Text>
      </motion.g>
      <g transform="translate(286 124)">
        <path d="M0 0h240l25 25v102l-25 25H0l-25-25V25Z" fill="rgba(13,23,34,.92)" stroke={BLUE} />
        <Text x={120} y={42} anchor="middle" fill={BLUE} size={11}>CONTROL PLANE</Text>
        <Text x={120} y={70} anchor="middle" fill="#edf4fb" size={20}>inspect difference</Text>
        <motion.path d="M74 94h92" stroke={BLUE} strokeWidth="2" style={{ pathLength: inspect }} />
        <Text x={120} y={117} anchor="middle" fill={MUTED} size={11}>intent → inspect → plan → review → apply</Text>
      </g>
      <g transform="translate(16 344)">
        <Text x={0} y={0} fill="#a8b6c7" size={11}>CURRENT STATE</Text>
        <StateNode x={0} y={20} label="serial delivery" />
        <StateNode x={0} y={86} label="manual release" state="stable" />
      </g>
      <motion.g transform="translate(516 344)" style={{ opacity: desiredOpacity }}>
        <Text x={0} y={0} fill="#a8b6c7" size={11}>DESIRED STATE</Text>
        <StateNode x={0} y={20} label="parallel plan" state="changed" />
        <StateNode x={0} y={86} label="repeatable release" state="changed" />
      </motion.g>
      <Edge d="M143 390C235 390 234 300 286 270" color={BLUE} dashed />
      <Edge d="M516 390C430 390 424 300 526 270" color={BLUE} dashed />
      <motion.g style={{ scale: markerScale, transformOrigin: "392px 382px" }}>
        <path d="M392 365l14 24h-28Z" fill="rgba(255,198,109,.15)" stroke={AMBER} />
        <Text x={392} y={410} anchor="middle" fill={AMBER} size={11}>DIVERGENCE</Text>
      </motion.g>
      <Text x={392} y={486} anchor="middle" fill={GREEN} size={15}>50% faster deployments</Text>
    </SceneLayer>
  );
}

function CareerAct({ progress }: Readonly<{ progress: MotionValue<number> }>) {
  const local = useSegment(progress, 0.1, 0.22);
  const lensY = useTransform(local, [0, 1], [156, 418]);
  const coreY = useTransform(local, [0, 1], [170, 250]);
  return (
    <SceneLayer progress={progress} range={[0.1, 0.22]}>
      <Text x={36} y={50} fill={BLUE} size={11}>ONE CONTROL-PLANE MENTAL MODEL</Text>
      <Text x={36} y={80} fill="#edf4fb" size={24}>The boundary changes. The reasoning persists.</Text>
      <Edge d="M72 140H700" color={LINE} />
      {[{ y: 156, label: "SERVICE STATE", detail: "API contract · SDK delivery" }, { y: 286, label: "INFRASTRUCTURE STATE", detail: "dependencies · events · migration" }, { y: 416, label: "HARDWARE STATE", detail: "desired/current · test boundary" }].map((row) => (
        <g key={row.label}>
          <circle cx="108" cy={row.y} r="7" fill={BLUE} />
          <Edge d={`M115 ${row.y}H650`} color={LINE} />
          <Text x={140} y={row.y - 8} fill="#edf4fb" size={14}>{row.label}</Text>
          <Text x={140} y={row.y + 17} size={12}>{row.detail}</Text>
          <StateNode x={510} y={row.y - 27} label="same change" state="changed" width={140} />
        </g>
      ))}
      <motion.rect x="76" width="596" height="78" rx="8" fill="rgba(118,179,255,.04)" stroke={BLUE} style={{ y: lensY }} />
      <motion.g style={{ y: coreY }}>
        <circle cx="392" cy="0" r="42" fill="#0b131e" stroke={BLUE} />
        <Text x={392} y={5} anchor="middle" fill={BLUE} size={11}>INSPECT</Text>
      </motion.g>
      <Text x={36} y={520} fill={MUTED} size={11}>Cisco internship → backend & cloud → optical systems · Schneider workflow</Text>
    </SceneLayer>
  );
}

function PlanAct({ progress }: Readonly<{ progress: MotionValue<number> }>) {
  const local = useSegment(progress, 0.22, 0.4);
  const split = useTransform(local, [0.44, 0.82], [0, 1], { clamp: true });
  const reviewOpacity = useTransform(local, [0.24, 0.38, 0.58, 0.72], [0, 1, 1, 0], { clamp: true });
  const applied = useTransform(local, [0.65, 0.94], [0, 1], { clamp: true });
  const nodeY1 = useTransform(split, [0, 1], [282, 236]);
  const nodeY2 = useTransform(split, [0, 1], [282, 330]);
  const nodeX1 = useTransform(split, [0, 1], [204, 286]);
  const nodeX2 = useTransform(split, [0, 1], [330, 286]);
  const nodeX3 = useTransform(split, [0, 1], [456, 456]);
  const edgeOpacity = useTransform(split, [0, 0.25], [1, 0]);
  const laneOpacity = useTransform(split, [0.2, 0.55], [0, 1]);
  return (
    <SceneLayer progress={progress} range={[0.22, 0.4]}>
      <Text x={36} y={48} fill={BLUE} size={11}>INSPECT → PLAN → REVIEW → APPLY</Text>
      <g transform="translate(36 78)">
        <Text x={0} y={0} fill="#edf4fb" size={15}>UNCHANGED</Text>
        <Edge d="M0 18h154" color={MUTED} />
        <Text x={0} y={42} size={11}>stable resources remain in place</Text>
      </g>
      <g transform="translate(572 78)">
        <Text x={0} y={0} fill={BLUE} size={15}>CHANGE SET</Text>
        <Edge d="M0 18h150" color={BLUE} />
        <Text x={0} y={42} size={11}>only difference enters the plan</Text>
      </g>
      <Text x={392} y={166} anchor="middle" fill="#edf4fb" size={20}>dependency plan</Text>
      <motion.g style={{ opacity: edgeOpacity }}>
        <Edge d="M120 308H636" color={BLUE} width={2} />
      </motion.g>
      <StateNode x={78} y={282} label="network" state="complete" width={104} />
      <motion.g style={{ x: nodeX1, y: nodeY1 }}><StateNode x={0} y={0} label="compute" state="changed" width={104} /></motion.g>
      <motion.g style={{ x: nodeX2, y: nodeY2 }}><StateNode x={0} y={0} label="data" state="changed" width={104} /></motion.g>
      <motion.g style={{ x: nodeX3, y: nodeY1 }}><StateNode x={0} y={0} label="events" state="changed" width={104} /></motion.g>
      <StateNode x={584} y={282} label="identity" state="review" width={104} />
      <motion.g style={{ opacity: laneOpacity }}>
        <Edge d="M182 308C226 308 230 262 286 262" color={BLUE} width={2} />
        <Edge d="M182 308C226 308 230 356 286 356" color={BLUE} width={2} />
        <Edge d="M390 262H456" color={BLUE} width={2} />
        <Edge d="M390 356C430 356 422 308 456 308" color={BLUE} width={2} />
        <Edge d="M560 282H584" color={BLUE} width={2} />
      </motion.g>
      <motion.g style={{ opacity: reviewOpacity }}>
        <rect x="218" y="410" width="348" height="84" rx="9" fill="rgba(255,198,109,.08)" stroke={AMBER} strokeWidth="1.5" />
        <Text x={392} y={438} anchor="middle" fill={AMBER} size={11}>HUMAN REVIEW REQUIRED</Text>
        <Text x={392} y={463} anchor="middle" fill="#edf4fb" size={14}>identity / permission boundary</Text>
        <Text x={392} y={482} anchor="middle" fill={MUTED} size={11}>review the real blast radius before apply</Text>
      </motion.g>
      <motion.g style={{ opacity: applied }}>
        <Text x={36} y={445} fill={GREEN} size={12}>APPLY · independent branches advance together</Text>
        <Edge d="M36 466h356" color={GREEN} width={2} />
        <g transform="translate(430 416)">
          <Text x={0} y={0} fill={BLUE} size={10}>EARLIER CISCO INTERNSHIP</Text>
          <Text x={0} y={22} fill="#edf4fb" size={12}>OpenAPI change → Python SDK + Java SDK</Text>
          <Text x={0} y={44} fill={GREEN} size={11}>publish · roughly four manual hours removed</Text>
        </g>
      </motion.g>
    </SceneLayer>
  );
}

function EventAct({ progress }: Readonly<{ progress: MotionValue<number> }>) {
  const local = useSegment(progress, 0.4, 0.53);
  const envelopeX = useTransform(local, [0.08, 0.34], [116, 318], { clamp: true });
  const branchX = useTransform(local, [0.35, 0.72], [340, 546], { clamp: true });
  const branchY = useTransform(local, [0.35, 0.72], [276, 185], { clamp: true });
  const branchY2 = useTransform(local, [0.35, 0.72], [276, 365], { clamp: true });
  const complete = useTransform(local, [0.7, 0.95], [0, 1], { clamp: true });
  return (
    <SceneLayer progress={progress} range={[0.4, 0.53]}>
      <Text x={36} y={48} fill={BLUE} size={11}>APPLIED SYSTEM · EVENTS IN MOTION</Text>
      <Text x={36} y={78} fill="#edf4fb" size={23}>One write becomes two independent regional paths.</Text>
      <g transform="translate(38 225)"><StateNode x={0} y={0} label="DynamoDB write" state="complete" width={150} /></g>
      <g transform="translate(300 225)"><circle cx="60" cy="26" r="48" fill="rgba(118,179,255,.08)" stroke={BLUE} /><Text x={60} y={22} anchor="middle" fill={BLUE} size={11}>SNS</Text><Text x={60} y={39} anchor="middle" fill="#edf4fb" size={12}>fan-out</Text></g>
      <g>
        <rect x="508" y="118" width="228" height="154" rx="10" fill="rgba(118,179,255,.025)" stroke={LINE} strokeDasharray="5 5" />
        <Text x={526} y={142} fill={MUTED} size={10}>REGION A</Text>
        <StateNode x={526} y={158} label="regional SQS" state="changed" width={130} />
        <StateNode x={586} y={220} label="service → SQL" state="complete" width={132} />
        <rect x="508" y="300" width="228" height="154" rx="10" fill="rgba(118,179,255,.025)" stroke={LINE} strokeDasharray="5 5" />
        <Text x={526} y={324} fill={MUTED} size={10}>REGION B</Text>
        <StateNode x={526} y={340} label="regional SQS" state="changed" width={130} />
        <StateNode x={586} y={402} label="service → SQL" state="complete" width={132} />
      </g>
      <Edge d="M188 251H300" color={BLUE} width={2} />
      <Edge d="M408 251C452 251 470 184 526 184" color={BLUE} width={2} />
      <Edge d="M408 251C452 251 470 366 526 366" color={BLUE} width={2} />
      <motion.g style={{ x: envelopeX }}><path d="M0 238h20v14H0Z" fill={BLUE} /><path d="m0 238 10 8 10-8" fill="none" stroke="#07101a" /></motion.g>
      <motion.g style={{ x: branchX, y: branchY }}><path d="M0 0h20v14H0Z" fill={BLUE} /><path d="m0 0 10 8 10-8" fill="none" stroke="#07101a" /></motion.g>
      <motion.g style={{ x: branchX, y: branchY2 }}><path d="M0 0h20v14H0Z" fill={BLUE} /><path d="m0 0 10 8 10-8" fill="none" stroke="#07101a" /></motion.g>
      <motion.g style={{ opacity: complete }}><Text x={392} y={520} anchor="middle" fill={GREEN} size={12}>ARRIVAL CONFIRMED · retry and ordering behavior are not claimed</Text></motion.g>
    </SceneLayer>
  );
}

function ObserveAct({ progress }: Readonly<{ progress: MotionValue<number> }>) {
  const local = useSegment(progress, 0.53, 0.66);
  const dataX = useTransform(local, [0.05, 0.42], [360, 286], { clamp: true });
  const traceWidth = useTransform(local, [0.08, 0.52], [310, 190], { clamp: true });
  const traffic = useTransform(local, [0.48, 0.88], [0, 1], { clamp: true });
  const oldPathOpacity = useTransform(traffic, [0, 1], [1, 0.3]);
  const loopRotate = useTransform(local, [0.66, 1], [0, 270], { clamp: true });
  return (
    <SceneLayer progress={progress} range={[0.53, 0.66]}>
      <Text x={36} y={48} fill={BLUE} size={11}>OBSERVE → ISOLATE → CHANGE → VERIFY → PREVENT</Text>
      <Text x={36} y={80} fill="#edf4fb" size={23}>Observation changes the live path.</Text>
      <g transform="translate(36 120)">
        <Text x={0} y={0} fill={MUTED} size={10}>REQUEST TRACE</Text>
        <StateNode x={0} y={24} label="service" state="stable" width={112} />
        <motion.g style={{ x: dataX }}><StateNode x={0} y={24} label="filter at data" state="changed" width={130} /></motion.g>
        <StateNode x={582} y={24} label="database" state="complete" width={112} />
        <motion.rect x="122" y="42" height="14" rx="7" fill="rgba(255,198,109,.26)" stroke={AMBER} style={{ width: traceWidth }} />
        <Text x={0} y={106} fill={GREEN} size={13}>40% faster page load · no fabricated milliseconds</Text>
      </g>
      <g transform="translate(36 302)">
        <Text x={0} y={0} fill={MUTED} size={10}>OBSERVED-CONSUMER MIGRATION</Text>
        <StateNode x={0} y={24} label="traffic evidence" state="changed" width={138} />
        <StateNode x={258} y={24} label="feature flag" state="review" width={122} />
        <StateNode x={552} y={-6} label="old boundary" state="stable" width={132} />
        <StateNode x={552} y={58} label="new boundary" state="complete" width={132} />
        <Edge d="M138 50H258M380 50H552" color={LINE} />
        <motion.path d="M380 50C450 50 470 110 552 110" fill="none" stroke={GREEN} strokeWidth="3" style={{ pathLength: traffic }} />
        <motion.path d="M380 50H552" fill="none" stroke={MUTED} strokeWidth="2" style={{ opacity: oldPathOpacity }} />
      </g>
      <g transform="translate(628 488)">
        <motion.g style={{ rotate: loopRotate }}><circle r="38" fill="none" stroke={BLUE} strokeWidth="2" strokeDasharray="18 8" /></motion.g>
        <Text x={0} y={4} anchor="middle" fill={BLUE} size={10}>VERIFY</Text>
      </g>
      <Text x={36} y={520} fill={MUTED} size={11}>compatibility remains until evidence supports the shift · unresolved scale withheld</Text>
    </SceneLayer>
  );
}

function HardwareAct({ progress }: Readonly<{ progress: MotionValue<number> }>) {
  const local = useSegment(progress, 0.66, 0.78);
  const sweepX = useTransform(local, [0.08, 0.72], [86, 592], { clamp: true });
  const changed = useTransform(local, [0.45, 0.84], [0, 1], { clamp: true });
  const boundaryX = useTransform(local, [0.58, 0.98], [520, 406], { clamp: true });
  return (
    <SceneLayer progress={progress} range={[0.66, 0.78]}>
      <Text x={36} y={48} fill={BLUE} size={11}>SYSTEM BOUNDARY · CLOUD STATE → HARDWARE STATE</Text>
      <Text x={36} y={80} fill="#edf4fb" size={23}>Preserve what matches. Change only what diverged.</Text>
      <Text x={52} y={130} fill={MUTED} size={10}>DESIRED SOFTWARE STATE</Text>
      <Text x={496} y={130} fill={MUTED} size={10}>CURRENT HARDWARE STATE</Text>
      {[0, 1, 2].map((index) => {
        const y = 154 + index * 70;
        const divergent = index === 1;
        return (
          <g key={index}>
            <StateNode x={52} y={y} label={`resource ${index + 1}`} state={divergent ? "changed" : "complete"} width={138} />
            <Edge d={`M190 ${y + 26}H550`} color={divergent ? BLUE : LINE} dashed={divergent} />
            <StateNode x={550} y={y} label={divergent ? "diverged" : "matches"} state={divergent ? "review" : "complete"} width={138} />
            <Text x={392} y={y + 20} anchor="middle" fill={divergent ? BLUE : GREEN} size={10}>{divergent ? "CHANGE" : "PRESERVE"}</Text>
          </g>
        );
      })}
      <motion.line x1="0" y1="142" x2="0" y2="360" stroke={BLUE} strokeWidth="2" style={{ x: sweepX }} />
      <motion.g style={{ opacity: changed }}>
        <path d="M190 250H550" stroke={GREEN} strokeWidth="3" />
        <Text x={392} y={346} anchor="middle" fill={GREEN} size={12}>MARK & SWEEP · CONVERGED WITHOUT WIPING STABLE STATE</Text>
      </motion.g>
      <g transform="translate(52 404)">
        <Text x={0} y={0} fill={MUTED} size={10}>TEST BOUNDARY</Text>
        <StateNode x={0} y={22} label="production C logic" state="stable" width={174} />
        <motion.g style={{ x: boundaryX }}><rect x="0" y="8" width="2" height="86" fill={BLUE} /><Text x={-12} y={24} anchor="end" fill={BLUE} size={10}>generated/card-specific stubs</Text></motion.g>
        <StateNode x={528} y={22} label="hardware / SDK" state="stable" width={148} />
        <Edge d="M174 48H528" color={BLUE} dashed />
        <Text x={0} y={106} fill={GREEN} size={11}>hardware-coupled feedback → local, isolated test loop</Text>
      </g>
    </SceneLayer>
  );
}

const projectActs = [
  { name: "Cloud provisioning", flow: "request → quota / constraint → allocation", color: "#22d3ee" },
  { name: "Bitcoin transactions", flow: "transaction → hash → sign → verify", color: "#f7931a" },
  { name: "Multiview reconstruction", flow: "matches → geometry → triangulation", color: "#34d399" },
  { name: "SWIFT super-resolution", flow: "spatial / attention + frequency branches", color: "#22d3ee" },
] as const;

function ProjectRow({ progress, project, index }: Readonly<{ progress: MotionValue<number>; project: (typeof projectActs)[number]; index: number }>) {
  const start = 0.78 + index * 0.045;
  const local = useSegment(progress, start, start + 0.045);
  const x = useTransform(local, [0, 0.78], [118, 430], { clamp: true });
  const path = useTransform(local, [0, 0.74], [0, 1], { clamp: true });
  return (
    <g transform={`translate(36 ${126 + index * 94})`}>
      <Text x={0} y={0} fill={project.color} size={12}>{String(index + 1).padStart(2, "0")} · {project.name}</Text>
      <Text x={0} y={25} fill="#dce8f5" size={13}>{project.flow}</Text>
      <motion.path d="M0 48H628" stroke={project.color} strokeWidth="2" style={{ pathLength: path }} />
      <motion.g style={{ x }}><circle cx="0" cy="48" r="8" fill={project.color} /><circle cx="0" cy="48" r="16" fill="none" stroke={project.color} opacity=".35" /></motion.g>
      <Text x={682} y={52} anchor="end" fill={MUTED} size={10}>SHARED LIVE DEMO ↓</Text>
    </g>
  );
}

function ProjectAct({ progress }: Readonly<{ progress: MotionValue<number> }>) {
  return (
    <SceneLayer progress={progress} range={[0.78, 0.94]}>
      <Text x={36} y={48} fill={BLUE} size={11}>PROJECT LABS · EXPLAIN → PROVE</Text>
      <Text x={36} y={80} fill="#edf4fb" size={23}>The control flow resolves into the real browser lab.</Text>
      {projectActs.map((project, index) => <ProjectRow key={project.name} progress={progress} project={project} index={index} />)}
      <Text x={36} y={528} fill={MUTED} size={11}>real lab mounted in place · no iframe · no duplicate implementation</Text>
    </SceneLayer>
  );
}

function ConvergedAct({ progress }: Readonly<{ progress: MotionValue<number> }>) {
  const local = useSegment(progress, 0.96, 1);
  const path = useTransform(local, [0, 0.86], [0, 1], { clamp: true });
  const settle = useTransform(local, [0.4, 1], [0, 1], { clamp: true });
  return (
    <SceneLayer progress={progress} range={[0.96, 1.01]}>
      <Text x={36} y={48} fill={BLUE} size={11}>FULL SYSTEM · FINAL STATE</Text>
      <Text x={36} y={80} fill="#edf4fb" size={23}>Current and desired state align.</Text>
      <g transform="translate(86 152)">
        <StateNode x={0} y={0} label="operator intent" state="complete" width={144} />
        <StateNode x={238} y={0} label="control plane" state="complete" width={144} />
        <StateNode x={476} y={0} label="desired state" state="complete" width={144} />
        <StateNode x={0} y={178} label="observed state" state="complete" width={144} />
        <StateNode x={238} y={178} label="evidence" state="complete" width={144} />
        <StateNode x={476} y={178} label="current state" state="complete" width={144} />
        <motion.path d="M144 26H238M382 26H476M548 52V178M476 204H382M238 204H144M72 178V52" fill="none" stroke={GREEN} strokeWidth="3" style={{ pathLength: path }} />
        <motion.g style={{ opacity: settle }}><Text x={310} y={125} anchor="middle" fill={GREEN} size={18}>CONVERGED</Text><Text x={310} y={148} anchor="middle" fill="#edf4fb" size={12}>ready for the next system</Text></motion.g>
      </g>
      <Text x={392} y={510} anchor="middle" fill={MUTED} size={11}>the system is calm · no loop · no ambient messages</Text>
    </SceneLayer>
  );
}

export function ControlPlaneSession({ progress }: Readonly<{ progress: MotionValue<number> }>) {
  const progressScale = useTransform(progress, [0, 1], [0, 1], { clamp: true });
  return (
    <div className="bk-session" data-control-plane-session>
      <div className="bk-session__state"><span /> LIVE CONTROL PLANE</div>
      <svg viewBox="0 0 784 560" role="img" aria-labelledby="bk-session-title bk-session-description">
        <title id="bk-session-title">A supervised control plane moving from intent and drift to a reviewed, observed, converged state</title>
        <desc id="bk-session-description">One persistent system changes topology across infrastructure planning, regional events, reliability, hardware reconciliation, project proofs, and final convergence.</desc>
        <IntentAct progress={progress} />
        <CareerAct progress={progress} />
        <PlanAct progress={progress} />
        <EventAct progress={progress} />
        <ObserveAct progress={progress} />
        <HardwareAct progress={progress} />
        <ProjectAct progress={progress} />
        <ConvergedAct progress={progress} />
      </svg>
      <div className="bk-session__rail"><motion.span style={{ scaleX: progressScale }} /></div>
      <ol className="bk-session__acts" aria-hidden="true">
        {['intent', 'career lens', 'plan / review / apply', 'events', 'observe / repair', 'hardware', 'project labs', 'converged'].map((act) => <li key={act}>{act}</li>)}
      </ol>
    </div>
  );
}
