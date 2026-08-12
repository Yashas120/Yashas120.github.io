"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Pause, Play, PawPrint, Plus, RotateCcw } from "lucide-react";
import { LiveDemo } from "./LiveDemo";
import { useOnScreen } from "./bitcoin/parts";
import {
  ACTIONS,
  HOTELS,
  NODE_META,
  type FlowStep,
  type NodeId,
  bookingCost,
  inr,
} from "@/lib/demos/petra";
import { cardProps } from "@/data/demos";

const REPO = "https://github.com/Yashas120/Petra";
const ACC = "#14b8a6"; // teal

const KIND_COLOR: Record<FlowStep["kind"], string> = {
  req: "#14b8a6",
  res: "#4ade80",
  query: "#fbbf24",
  ext: "#f472b6",
  render: "#a78bfa",
};
const KIND_LABEL: Record<FlowStep["kind"], string> = {
  req: "request",
  res: "response",
  query: "db query",
  ext: "external",
  render: "client render",
};

// SVG node geometry (viewBox 600×230)
const NODE: Record<NodeId, { x: number; y: number; hw: number; hh: number }> = {
  client: { x: 92, y: 152, hw: 62, hh: 28 },
  api: { x: 300, y: 152, hw: 62, hh: 28 },
  db: { x: 508, y: 152, hw: 62, hh: 28 },
  google: { x: 300, y: 46, hw: 62, hh: 24 },
};

function rgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${a})`;
}
function border(a: { x: number; y: number; hw: number; hh: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x, dy = b.y - a.y;
  if (Math.abs(dx) > Math.abs(dy)) return { x: a.x + Math.sign(dx) * a.hw, y: a.y };
  return { x: a.x, y: a.y + Math.sign(dy) * a.hh };
}
const ease = (t: number) => t * t * (3 - 2 * t);

function useIsLight(): boolean {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const update = () => setLight(el.classList.contains("light"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return light;
}

export function PetraDemo() {
  const light = useIsLight();
  const [actionIdx, setActionIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(true);

  const action = ACTIONS[actionIdx];
  const steps = action.steps;
  const step = steps[Math.min(stepIdx, steps.length - 1)];
  const showCost = action.key === "view" || action.key === "reserve";

  const tRef = useRef(0);
  const packetRef = useRef<SVGCircleElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  // Only run the packet animation while the diagram is on screen.
  const onScreen = useOnScreen(diagramRef);
  const stRef = useRef({ steps, stepIdx, playing });
  stRef.current = { steps, stepIdx, playing };

  const selectStep = (i: number) => {
    setStepIdx(i);
    tRef.current = 0;
  };
  const restart = () => {
    setStepIdx(0);
    tRef.current = 0;
    setPlaying(true);
  };
  useEffect(() => {
    setStepIdx(0);
    tRef.current = 0;
  }, [actionIdx]);

  useEffect(() => {
    if (!onScreen) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      const s = stRef.current;
      const cur = s.steps[s.stepIdx];
      const dur = cur.from === cur.to ? 1200 : 950;
      if (s.playing) {
        tRef.current += dt / dur;
        if (tRef.current >= 1) {
          tRef.current = 0;
          setStepIdx((i) => (i + 1) % s.steps.length);
        }
      } else if (tRef.current < 1) {
        tRef.current = Math.min(1, tRef.current + dt / dur);
      }
      const pk = packetRef.current;
      if (pk) {
        if (cur.from === cur.to) {
          pk.style.opacity = "0";
        } else {
          const A = NODE[cur.from], B = NODE[cur.to];
          const p1 = border(A, B), p2 = border(B, A);
          const e = ease(Math.min(1, tRef.current));
          pk.setAttribute("cx", String(p1.x + (p2.x - p1.x) * e));
          pk.setAttribute("cy", String(p1.y + (p2.y - p1.y) * e));
          pk.style.opacity = "1";
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [onScreen]);

  const kc = KIND_COLOR[step.kind];
  const activeNodes = new Set<NodeId>([step.from, step.to]);

  return (
    <LiveDemo
      title="Petra — a hand-built MERN booking app"
      subtitle="Not a UI tour: this traces how Petra's full stack actually serves a request. Pick a user action and watch it travel the React SPA → the custom Express API on :3001 → MongoDB (and out to Google for auth) and back — with the real endpoints, DB operations, and the app's own pet-care pricing."
      repoUrl={REPO}
      accent={ACC}
      {...cardProps("petra")}
    >
      {/* action tabs */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {ACTIONS.map((a, i) => (
          <button
            key={a.key}
            onClick={() => setActionIdx(i)}
            className="rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors"
            style={{
              background: i === actionIdx ? rgba(ACC, 0.15) : "transparent",
              color: i === actionIdx ? (light ? "#0f766e" : ACC) : "rgb(var(--zinc-500))",
              border: `1px solid ${i === actionIdx ? rgba(ACC, 0.4) : "rgb(var(--line) / 0.12)"}`,
            }}
          >
            {a.label}
          </button>
        ))}
      </div>
      <p className="mb-4 text-[13px] leading-relaxed text-zinc-400">{action.blurb}</p>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* architecture diagram + timeline */}
        <div>
          <div ref={diagramRef} className="overflow-hidden rounded-lg border bg-ink-900 p-2" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
            <svg viewBox="0 0 600 230" className="w-full">
              {/* edges */}
              {([["client", "api"], ["api", "db"], ["api", "google"]] as [NodeId, NodeId][]).map(([f, t]) => {
                const p1 = border(NODE[f], NODE[t]);
                const p2 = border(NODE[t], NODE[f]);
                const on = activeNodes.has(f) && activeNodes.has(t);
                return (
                  <line
                    key={`${f}-${t}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={on ? kc : light ? "rgba(9,9,11,0.14)" : "rgba(255,255,255,0.12)"}
                    strokeWidth={on ? 2 : 1.2}
                    strokeDasharray={on ? "none" : "4 4"}
                  />
                );
              })}
              {/* packet */}
              <circle ref={packetRef} r={5} fill={kc} style={{ opacity: 0 }}>
                <animate attributeName="r" values="5;6.5;5" dur="0.9s" repeatCount="indefinite" />
              </circle>
              {/* nodes */}
              {(Object.keys(NODE) as NodeId[]).map((id) => {
                const n = NODE[id];
                const on = activeNodes.has(id);
                const meta = NODE_META[id];
                return (
                  <g key={id}>
                    <rect
                      x={n.x - n.hw}
                      y={n.y - n.hh}
                      width={n.hw * 2}
                      height={n.hh * 2}
                      rx={8}
                      fill={light ? "#ffffff" : "#0a0a0a"}
                      stroke={on ? kc : light ? "rgba(9,9,11,0.2)" : "rgba(255,255,255,0.2)"}
                      strokeWidth={on ? 2 : 1}
                    />
                    <text x={n.x} y={n.y - 2} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="12" fontWeight="700" fill={on ? kc : light ? "#3f3f46" : "#e4e4e7"}>
                      {meta.label}
                    </text>
                    <text x={n.x} y={n.y + 13} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9" fill="#71717a">
                      {meta.sub}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* controls */}
          <div className="mt-2 flex items-center gap-2">
            <button onClick={() => setPlaying((v) => !v)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-medium text-ink-900" style={{ background: ACC }}>
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {playing ? "pause" : "play"}
            </button>
            <button onClick={restart} aria-label="Restart the request flow" title="restart" className="rounded-lg border px-2.5 py-1.5 text-zinc-400 hover:text-zinc-200" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <span className="ml-auto font-mono text-[10px] text-zinc-500">
              step {Math.min(stepIdx, steps.length - 1) + 1} / {steps.length}
            </span>
          </div>

          {/* step timeline */}
          <div className="mt-2 space-y-1">
            {steps.map((s, i) => {
              const on = i === stepIdx;
              const c = KIND_COLOR[s.kind];
              return (
                <button key={i} onClick={() => selectStep(i)} className="flex w-full items-center gap-2 rounded px-2 py-1 text-left transition-colors" style={{ background: on ? rgba(c, 0.12) : "transparent" }}>
                  <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-bold" style={{ background: rgba(c, 0.2), color: c }}>
                    {i + 1}
                  </span>
                  <span className="font-mono text-[11px]" style={{ color: on ? (light ? "#18181b" : "#e4e4e7") : "rgb(var(--zinc-500))" }}>
                    {s.title}
                  </span>
                  <span className="ml-auto font-mono text-[9px] text-zinc-600">
                    {NODE_META[s.from].label}
                    {s.from !== s.to ? ` → ${NODE_META[s.to].label}` : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* current step detail */}
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide" style={{ background: rgba(kc, 0.15), color: kc }}>
              {KIND_LABEL[step.kind]}
            </span>
            <span className="font-mono text-[11px] text-zinc-500">
              {NODE_META[step.from].label}
              {step.from !== step.to ? ` → ${NODE_META[step.to].label}` : ""}
            </span>
          </div>
          <div className="font-mono text-sm font-semibold" style={{ color: kc }}>{step.title}</div>
          <pre className="mt-2 overflow-x-auto rounded-lg border p-3 font-mono text-[11px] leading-[1.6] text-zinc-300" style={{ borderColor: "rgb(var(--line) / 0.12)", background: "rgb(var(--line) / 0.04)" }}>
            {step.body}
          </pre>
        </div>
      </div>

      {showCost && <CostPanel light={light} />}

      <p className="mt-4 font-mono text-[10px] leading-relaxed text-zinc-600">
        Faithful to the repo: routes, payloads and endpoints are lifted from <code>Header.jsx</code>, <code>SignUp.jsx</code>
        and <code>Product.jsx</code> (Express base <code>http://localhost:3001</code>); auth flips every route to the
        <code> /auth/google/account/*</code> namespace and is threaded through <code>sessionStorage</code>; pricing uses the
        app&apos;s own fields — <code>ppn</code>, <code>service_fee</code>, <code>taxes</code>, and per-hour
        <code> spa_cost</code>/<code>sitter_cost</code> billed 5&nbsp;hrs/day. Backend responses are stubbed; the flow is the app&apos;s.
      </p>
    </LiveDemo>
  );
}

function CostPanel({ light }: { light: boolean }) {
  const [hotelIdx, setHotelIdx] = useState(0);
  const [nights, setNights] = useState(3);
  const [pets, setPets] = useState(1);
  const [withSitter, setWithSitter] = useState(true);
  const [withSpa, setWithSpa] = useState(false);
  const accentText = light ? "#0f766e" : ACC;
  const hotel = HOTELS[hotelIdx];
  const cost = useMemo(() => bookingCost(hotel, nights, pets, withSitter, withSpa), [hotel, nights, pets, withSitter, withSpa]);

  return (
    <div className="mt-5 rounded-lg border p-4" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
      <div className="mb-3 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
        cost breakdown · <code style={{ color: accentText }}>bookingCost()</code> from the hotel document
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {HOTELS.map((h, i) => (
              <button key={h.id} onClick={() => setHotelIdx(i)} className="rounded px-1.5 py-1 font-mono text-[9.5px] transition-colors"
                style={{ background: i === hotelIdx ? rgba(ACC, 0.15) : "transparent", color: i === hotelIdx ? accentText : "rgb(var(--zinc-500))", border: `1px solid ${i === hotelIdx ? rgba(ACC, 0.4) : "rgb(var(--line) / 0.12)"}` }}>
                {h.title}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 font-mono text-[9px] uppercase tracking-wide text-zinc-500">nights · {nights}</div>
              <input type="range" min={1} max={7} value={nights} onChange={(e) => setNights(Number(e.target.value))} className="h-1 w-full cursor-pointer appearance-none rounded-full" style={{ accentColor: ACC, background: "rgb(var(--line) / 0.15)" }} />
            </div>
            <div>
              <div className="mb-1 font-mono text-[9px] uppercase tracking-wide text-zinc-500">pets</div>
              <div className="flex items-center justify-between rounded border px-1.5 py-1" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
                <button onClick={() => setPets((v) => Math.max(0, v - 1))} className="text-zinc-500 hover:text-zinc-200"><Minus className="h-3 w-3" /></button>
                <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-200"><PawPrint className="h-3 w-3" />{pets}</span>
                <button onClick={() => setPets((v) => Math.min(4, v + 1))} className="text-zinc-500 hover:text-zinc-200"><Plus className="h-3 w-3" /></button>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Toggle label={`sitter · ${inr(hotel.sitter_cost)}/hr`} on={withSitter} disabled={pets === 0} onClick={() => setWithSitter((v) => !v)} accentText={accentText} />
            <Toggle label={`spa · ${inr(hotel.spa_cost)}/hr`} on={withSpa} disabled={pets === 0} onClick={() => setWithSpa((v) => !v)} accentText={accentText} />
          </div>
        </div>
        <div className="space-y-1 font-mono text-[11px]">
          <Row label={`${inr(hotel.ppn)} × ${nights} night${nights > 1 ? "s" : ""}`} val={inr(cost.base)} />
          <Row label="service fee" val={inr(cost.service_fee)} sub />
          <Row label="other charges (taxes)" val={inr(cost.taxes)} sub />
          <Row label={pets > 0 ? `pet care · (${withSpa ? "spa+" : ""}${withSitter ? "sitter" : withSpa ? "" : "none"}) × 5 hrs/day` : "pet care · no pets"} val={inr(cost.petPerDay)} sub />
          <div className="mt-1 flex items-center justify-between border-t pt-2 text-sm font-semibold" style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
            <span className="text-zinc-200">total</span>
            <span style={{ color: accentText }}>{inr(cost.total)}</span>
          </div>
          <p className="pt-1 text-[9.5px] text-zinc-600">&quot;You won&apos;t be charged as yet&quot; — Reserve is auth-gated; a guest is bounced to /login and returned to finish.</p>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, on, disabled, onClick, accentText }: { label: string; on: boolean; disabled: boolean; onClick: () => void; accentText: string }) {
  return (
    <button onClick={onClick} disabled={disabled} className="flex-1 rounded px-2 py-1.5 font-mono text-[10px] transition-colors disabled:opacity-40"
      style={{ background: on && !disabled ? rgba(ACC, 0.15) : "transparent", color: on && !disabled ? accentText : "rgb(var(--zinc-500))", border: `1px solid ${on && !disabled ? rgba(ACC, 0.4) : "rgb(var(--line) / 0.12)"}` }}>
      {on ? "✓ " : ""}{label}
    </button>
  );
}

function Row({ label, val, sub }: { label: string; val: string; sub?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={sub ? "text-zinc-500" : "text-zinc-300"}>{label}</span>
      <span className={sub ? "text-zinc-500" : "text-zinc-200"}>{val}</span>
    </div>
  );
}
