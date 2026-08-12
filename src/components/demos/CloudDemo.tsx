"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, CornerDownRight, Database, Play, RotateCcw, Trash2, XCircle } from "lucide-react";
import { LiveDemo } from "./LiveDemo";
import { usePrefersReducedMotion } from "./bitcoin/parts";
import {
  DISKS,
  GPUS,
  MACHINES,
  RAM_OPTIONS,
  callLiteral,
  deleteVM,
  seedDB,
  traceCreateVM,
  type CloudDB,
  type Disk,
  type Frame,
  type Gpu,
  type Machine,
  type Trace,
  type VMRequest,
  type ZoneQuota,
} from "@/lib/demos/cloud";
import { cardProps } from "@/data/demos";

const REPO = "https://github.com/Yashas120/Cloud-Provisioning-using-RDBMS";
const ACC = "#22d3ee"; // cyan
const ZONES = ["Z1", "Z2", "Z3", "Z4"];

function rgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${a})`;
}

export function CloudDemo() {
  const reduced = usePrefersReducedMotion();
  const [db, setDb] = useState<CloudDB>(() => seedDB());
  const [trace, setTrace] = useState<Trace | null>(null);
  const [reveal, setReveal] = useState(0);
  const [sel, setSel] = useState(0);
  const [req, setReq] = useState<VMRequest>({
    project: "labra213-123",
    zone: "Z1",
    machine: "A2",
    gpu: "A100",
    gpuCount: 1,
    disk: "SSD",
    ram: 16,
    preemptible: true,
  });

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!trace) return;
    if (reduced) {
      setReveal(trace.frames.length);
      setSel(trace.frames.length - 1);
      return;
    }
    setReveal(0);
    setSel(0);
    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      setReveal(i);
      setSel(Math.min(i - 1, trace.frames.length - 1));
      if (i >= trace.frames.length && timer.current) clearInterval(timer.current);
    }, 520);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [trace, reduced]);

  const zone = db.zones.find((z) => z.name === req.zone)!;
  const project = db.projects.find((p) => p.id === req.project)!;
  const quota = project.quota[req.zone];

  const execute = () => {
    const { trace: t, db: ndb } = traceCreateVM(db, req);
    setTrace(t);
    setDb(ndb);
  };
  const reset = () => {
    setDb(seedDB());
    setTrace(null);
    setReveal(0);
  };

  const projectVMs = db.vms.filter((v) => v.project === req.project);
  const frame: Frame | null = trace ? trace.frames[Math.min(sel, trace.frames.length - 1)] : null;
  const revealedAll = trace ? reveal >= trace.frames.length : false;

  // Dry-run the composed request against current quota so the outcome is visible
  // BEFORE executing. traceCreateVM is pure — it only clones the DB on success.
  const preview = useMemo(() => traceCreateVM(db, req).trace, [db, req]);
  const previewReason = preview.ok
    ? `allocates on rack ${preview.rackId} · RAM tier ${preview.ramBlk}`
    : preview.frames.filter((f) => !f.ok).sort((a, b) => b.depth - a.depth)[0]?.note ?? "request will be rejected";

  const set = (patch: Partial<VMRequest>) => {
    setReq({ ...req, ...patch });
    setTrace(null);
  };

  return (
    <LiveDemo
      title="Cloud Provisioning — PL/pgSQL stored-procedure tracer"
      subtitle="Not a cloud console — a look inside the RDBMS implementation. Provisioning is one deeply-nested composite argument to create_VM, which threads a call chain of quota functions. Build the call and step through it: watch the nested LIMIT_QUOTAS lookups, the RAM-block bin-packing over rack IDs, and the dotted-path composite UPDATE that commits the allocation."
      repoUrl={REPO}
      accent={ACC}
      {...cardProps("cloud")}
    >
      {/* composite-argument builder */}
      <div className="mb-3 rounded-lg border p-3" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
          <Database className="h-3.5 w-3.5" /> compose the create_VM() argument
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <Ctl label="project">
            <Seg options={db.projects.map((p) => ({ v: p.id, l: p.name }))} value={req.project} onChange={(v) => set({ project: v })} />
          </Ctl>
          <Ctl label="zone"><Seg options={ZONES.map((z) => ({ v: z, l: z }))} value={req.zone} onChange={(v) => set({ zone: v })} /></Ctl>
          <Ctl label="machine"><Seg options={MACHINES.map((m) => ({ v: m, l: m }))} value={req.machine} onChange={(v) => set({ machine: v as Machine })} /></Ctl>
          <Ctl label="GPU"><Seg options={GPUS.map((g) => ({ v: g, l: g }))} value={req.gpu} onChange={(v) => set({ gpu: v as Gpu })} /></Ctl>
          <Ctl label="× count"><Seg options={[0, 1, 2].map((n) => ({ v: String(n), l: String(n) }))} value={String(req.gpuCount)} onChange={(v) => set({ gpuCount: Number(v) })} /></Ctl>
          <Ctl label="RAM"><Seg options={RAM_OPTIONS.map((r) => ({ v: String(r), l: String(r) }))} value={String(req.ram)} onChange={(v) => set({ ram: Number(v) })} /></Ctl>
          <Ctl label="disk"><Seg options={DISKS.map((d) => ({ v: d, l: d }))} value={req.disk} onChange={(v) => set({ disk: v as Disk })} /></Ctl>
          <Ctl label="pool">
            <Seg
              options={[{ v: "1", l: "preemptible" }, { v: "0", l: "on-demand" }]}
              value={req.preemptible ? "1" : "0"}
              onChange={(v) => set({ preemptible: v === "1" })}
            />
          </Ctl>
        </div>
        <pre className="mt-3 overflow-x-auto rounded-md p-2.5 font-mono text-[10.5px] leading-relaxed text-cyan-300" style={{ background: "rgb(var(--line) / 0.05)" }}>
          {callLiteral(db, req)}
        </pre>
        {/* live verdict — dry-run of the composed request against current quota */}
        <div
          className="mt-2 flex items-start gap-2 rounded-md px-2.5 py-1.5 font-mono text-[11px]"
          style={{
            background: preview.ok ? rgba("#4ade80", 0.1) : rgba("#f87171", 0.1),
            border: `1px solid ${preview.ok ? rgba("#4ade80", 0.35) : rgba("#f87171", 0.35)}`,
          }}
        >
          {preview.ok ? (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: "#4ade80" }} />
          ) : (
            <XCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: "#f87171" }} />
          )}
          <span style={{ color: preview.ok ? "#4ade80" : "#f87171" }}>
            <span className="font-semibold">{preview.ok ? "WILL COMMIT" : "WILL REJECT"}</span>
            <span className="text-zinc-400"> — {previewReason}</span>
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button onClick={execute} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-medium text-ink-900 transition-opacity hover:opacity-90" style={{ background: ACC }}>
            <Play className="h-3.5 w-3.5" /> execute
          </button>
          <button onClick={reset} className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:text-zinc-200" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
            <RotateCcw className="h-3.5 w-3.5" /> reset DB
          </button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* call stack */}
        <div className="rounded-lg border p-3" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-zinc-500">call stack</div>
          {!trace ? (
            <div className="flex h-full min-h-[150px] items-center justify-center text-center font-mono text-xs text-zinc-600">
              press execute to trace the procedure chain
            </div>
          ) : (
            <div className="space-y-1">
              {trace.frames.slice(0, reveal).map((f, i) => {
                const active = i === sel;
                const color = f.ok ? "#4ade80" : "#f87171";
                return (
                  <button
                    key={f.fn}
                    onClick={() => setSel(i)}
                    className="flex w-full items-start gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors"
                    style={{
                      marginLeft: f.depth * 14,
                      background: active ? rgba(ACC, 0.1) : "transparent",
                      border: `1px solid ${active ? rgba(ACC, 0.4) : "transparent"}`,
                    }}
                  >
                    {f.depth > 0 && <CornerDownRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-zinc-600" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12px] font-semibold" style={{ color: active ? ACC : "rgb(var(--zinc-200))" }}>{f.fn}</span>
                        <span className="rounded px-1 font-mono text-[9px]" style={{ background: rgba(color, 0.15), color }}>
                          → {f.ret || f.retType}
                        </span>
                      </div>
                      <div className="font-mono text-[10px] text-zinc-500">{f.note}</div>
                    </div>
                  </button>
                );
              })}
              {revealedAll && (
                <div className="mt-2 rounded-md px-2.5 py-1.5 font-mono text-[11px] font-semibold" style={{ background: trace.ok ? rgba("#4ade80", 0.12) : rgba("#f87171", 0.12), color: trace.ok ? "#4ade80" : "#f87171" }}>
                  {trace.ok ? `✓ create_VM committed ${trace.vm?.id} on rack ${trace.rackId}` : "✗ RAISE NOTICE — d_rack = '0000000000', no row inserted"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* source + watch of selected frame */}
        <div className="rounded-lg border p-3" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
            {frame ? `${frame.fn} — source` : "procedure source"}
          </div>
          {!frame ? (
            <div className="flex h-full min-h-[150px] items-center justify-center font-mono text-xs text-zinc-600">—</div>
          ) : (
            <>
              <pre className="overflow-x-auto rounded-md p-2 font-mono text-[10px] leading-[1.5]" style={{ background: "rgb(var(--line) / 0.05)" }}>
                {frame.src.map((line, i) => (
                  <div
                    key={i}
                    style={{
                      background: i === frame.activeLine ? rgba(ACC, 0.16) : "transparent",
                      color: i === frame.activeLine ? "#e6faff" : "rgb(var(--zinc-400))",
                      borderLeft: `2px solid ${i === frame.activeLine ? ACC : "transparent"}`,
                      paddingLeft: 6,
                    }}
                  >
                    {line || " "}
                  </div>
                ))}
              </pre>
              {frame.watch.length > 0 && (
                <div className="mt-2">
                  <div className="mb-1 font-mono text-[9px] uppercase tracking-wide text-zinc-600">watch · locals</div>
                  <div className="flex flex-wrap gap-1">
                    {frame.watch.map((w) => (
                      <span key={w.name} className="rounded px-1.5 py-0.5 font-mono text-[10px]" style={{ background: "rgb(var(--line) / 0.06)" }}>
                        <span className="text-zinc-500">{w.name}</span> <span className="text-cyan-300">{w.val}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* dotted-path UPDATE on success */}
      {trace && revealedAll && trace.ok && (
        <div className="mt-3 rounded-lg border p-3" style={{ borderColor: rgba(ACC, 0.25) }}>
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
            committed — dotted-path composite UPDATE (the trigger of the design)
          </div>
          <pre className="overflow-x-auto font-mono text-[10px] leading-relaxed text-zinc-300">
            {trace.updates.join("\n")}
          </pre>
        </div>
      )}

      {/* live nested composite quota + VMs */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border p-3" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
            PROJECT.quotas.{req.zone} · nested composite (live)
          </div>
          <QuotaTree q={quota} req={req} />
          <div className="mt-2 font-mono text-[10px] text-zinc-600">
            ZONE {req.zone} avail · RAM tiers {zone.ram.blk1}/{zone.ram.blk2}/{zone.ram.blk3}/{zone.ram.blk4} GB
          </div>
        </div>

        <div className="rounded-lg border p-3" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wide text-zinc-500">
            <span>VM table — {project.name}</span>
            <span className="text-zinc-600">{projectVMs.length} rows</span>
          </div>
          {projectVMs.length === 0 ? (
            <div className="py-3 text-center font-mono text-xs text-zinc-600">no rows — INSERT via create_VM()</div>
          ) : (
            <div className="space-y-1">
              {projectVMs.map((v) => (
                <div key={v.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 font-mono text-[10.5px]" style={{ background: "rgb(var(--line) / 0.04)" }}>
                  <span className="text-cyan-400">{v.id}</span>
                  <span className="text-zinc-500">{v.zone}</span>
                  <span className="text-zinc-400">{v.machine}</span>
                  <span className="text-zinc-500">{v.gpuCount > 0 ? `${v.gpuCount}×${v.gpu}` : "no-gpu"}</span>
                  <span className="text-zinc-600">{v.rack}</span>
                  {v.preemptible && <span className="rounded bg-amber-400/15 px-1 text-amber-400">spot</span>}
                  <button onClick={() => setDb(deleteVM(db, v.id))} aria-label={`deleteVM(${v.id}) — release ${v.id} and its quota`} className="ml-auto text-zinc-500 transition-colors hover:text-red-400" title="deleteVM()">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="mt-3 font-mono text-[10px] leading-relaxed text-zinc-600">
        A faithful model of the Postgres implementation: <code>CHECK_ZONE_QUOTA</code> reads composite columns
        (<code>(GPU_AVAILABLE).NVIDIA_TESLA_A100</code>) and buckets RAM into blocks; <code>CHECK_RACK_QUOTA</code>
        finds a rack whose id carries that block (<code>RACK_ID LIKE &apos;%blk2%&apos;</code>); <code>CHECK_PROJ_QUOTA</code>
        reads the nested <code>LIMIT_QUOTAS</code> and picks the preemptible or on-demand pool; and <code>create_VM</code>
        commits with a dotted-path composite <code>UPDATE</code>. Data is seeded and lives only in your browser.
      </p>
    </LiveDemo>
  );
}

function Ctl({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 font-mono text-[9px] uppercase tracking-wide text-zinc-500">{label}</div>
      {children}
    </div>
  );
}

function Seg({ options, value, onChange }: { options: { v: string; l: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className="rounded px-2 py-1 font-mono text-[10px] transition-colors"
          style={{
            background: value === o.v ? rgba(ACC, 0.15) : "transparent",
            color: value === o.v ? ACC : "rgb(var(--zinc-400))",
            border: `1px solid ${value === o.v ? rgba(ACC, 0.4) : "rgb(var(--line) / 0.12)"}`,
          }}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function Chips({ map, hi }: { map: Record<string, number>; hi?: string }) {
  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(map).map(([k, n]) => (
        <span
          key={k}
          className="rounded px-1.5 py-0.5 font-mono text-[9.5px]"
          style={{
            background: n <= 0 ? rgba("#f87171", 0.12) : "rgb(var(--line) / 0.06)",
            color: n <= 0 ? "#f87171" : "rgb(var(--zinc-300))",
            outline: k === hi ? `1.5px solid ${ACC}` : "none",
          }}
        >
          {k} {n}
        </span>
      ))}
    </div>
  );
}

function QuotaTree({ q, req }: { q: ZoneQuota; req: VMRequest }) {
  const Row = ({ label, map, hi }: { label: string; map: Record<string, number>; hi?: string }) => (
    <div className="flex items-start gap-2">
      <span className="w-40 flex-shrink-0 font-mono text-[10px] text-zinc-500">{label}</span>
      <Chips map={map} hi={hi} />
    </div>
  );
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 font-mono text-[10px]">
        <span className="w-40 flex-shrink-0 text-zinc-500">NO_VMS</span>
        <span className={q.NO_VMS > 0 ? "text-zinc-300" : "text-red-400"}>{q.NO_VMS}</span>
      </div>
      <Row label="GPU_PREMPT" map={q.GPU_PREMPT} hi={req.preemptible ? req.gpu : undefined} />
      <Row label="GPU (on-demand)" map={q.GPU} hi={!req.preemptible ? req.gpu : undefined} />
      <Row label="MACHINE_FAMILY_PREMPT" map={q.MACHINE_FAMILY_PREMPT} hi={req.preemptible ? req.machine : undefined} />
      <Row label="MACHINE_FAMILY" map={q.MACHINE_FAMILY} hi={!req.preemptible ? req.machine : undefined} />
      <Row label="DISK" map={q.DISK} hi={req.disk} />
    </div>
  );
}
