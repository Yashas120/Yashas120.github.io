"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Move3d, Pause, Play, RotateCcw } from "lucide-react";
import { LiveDemo } from "./LiveDemo";
import { useOnScreen, usePrefersReducedMotion } from "./bitcoin/parts";
import {
  CAM_A,
  CAM_B,
  epipolarLine,
  fitIntrinsics,
  fundamental,
  norm,
  project,
  SCENES,
  STEPS,
  sub,
  triangulate,
  type Camera,
  type Intrinsics,
  type Mat,
  type Pixel,
  type SceneId,
  type Vec3,
} from "@/lib/demos/sfm";
import { cardProps } from "@/data/demos";

const REPO = "https://github.com/Yashas120/Multiview-3D-Reconstruction";
const MV = "#34d399"; // emerald accent

const IMG_W = 300;
const IMG_H = 220;
const GAP = 30;
const MARGIN = 26;
const LOGICAL_W = 2 * IMG_W + GAP;

function rgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${a})`;
}

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

interface Feature {
  i: number;
  color: string;
  world: Vec3;
  a: Pixel;
  b: Pixel;
}

interface Geo {
  feats: Feature[];
  F: Mat;
  recovered: { p: Vec3; color: string }[];
  center: Vec3;
  radiusPts: number;
  radiusCam: number;
  K: Intrinsics;
}

function buildGeo(sceneId: SceneId): Geo {
  const scene = SCENES.find((s) => s.id === sceneId) ?? SCENES[0];
  const pts = scene.points;
  const K = fitIntrinsics(pts.map((p) => p.p), [CAM_A, CAM_B], IMG_W, IMG_H, MARGIN);
  const feats: Feature[] = [];
  pts.forEach((sp, i) => {
    const a = project(sp.p, CAM_A, K);
    const b = project(sp.p, CAM_B, K);
    if (a.z <= 0 || b.z <= 0) return;
    feats.push({ i, color: sp.color, world: sp.p, a, b });
  });
  const F = fundamental(CAM_A, CAM_B, K);
  const recovered = feats.map((f) => ({ p: triangulate(f.a, f.b, CAM_A, CAM_B, K), color: f.color }));

  // View framing for the 3D renders.
  const center: Vec3 = [0, 0, 0];
  recovered.forEach((r) => {
    center[0] += r.p[0];
    center[1] += r.p[1];
    center[2] += r.p[2];
  });
  const n = recovered.length || 1;
  center[0] /= n;
  center[1] /= n;
  center[2] /= n;
  let radiusPts = 0.001;
  recovered.forEach((r) => (radiusPts = Math.max(radiusPts, norm(sub(r.p, center)))));
  const radiusCam = Math.max(norm(sub(CAM_A.C, center)), norm(sub(CAM_B.C, center)));
  return { feats, F, recovered, center, radiusPts, radiusCam, K };
}

// ------------------------------- 3D projection ------------------------------

interface Proj {
  sx: number;
  sy: number;
  depth: number;
  persp: number;
}
function project3(
  p: Vec3,
  center: Vec3,
  radius: number,
  W: number,
  H: number,
  az: number,
  el: number,
): Proj {
  const x0 = p[0] - center[0];
  const y0 = p[1] - center[1];
  const z0 = p[2] - center[2];
  // rotate around Y (azimuth)
  const x1 = x0 * Math.cos(az) + z0 * Math.sin(az);
  const z1 = -x0 * Math.sin(az) + z0 * Math.cos(az);
  const y1 = y0;
  // rotate around X (elevation)
  const y2 = y1 * Math.cos(el) - z1 * Math.sin(el);
  const z2 = y1 * Math.sin(el) + z1 * Math.cos(el);
  const D = radius * 3.4;
  const persp = D / (D - z2);
  const s = (Math.min(W, H) * 0.4) / radius;
  return { sx: W / 2 + s * x1 * persp, sy: H / 2 - s * y2 * persp, depth: z2, persp };
}

export function MultiviewDemo({ embedded = false }: Readonly<{ embedded?: boolean }> = {}) {
  const light = useIsLight();
  const reduced = usePrefersReducedMotion();
  const [sceneId, setSceneId] = useState<SceneId>("house");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const geo = useMemo(() => buildGeo(sceneId), [sceneId]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const geoRef = useRef(geo);
  const stepRef = useRef(step);
  const stepEnter = useRef(performance.now());
  const orbit = useRef({ az: -0.55, el: 0.32 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const reducedRef = useRef(reduced);

  geoRef.current = geo;
  reducedRef.current = reduced;

  useEffect(() => {
    stepRef.current = step;
    stepEnter.current = performance.now();
  }, [step, sceneId]);

  // autoplay walkthrough (advance steps), stopping on the final cloud step
  useEffect(() => {
    if (!playing) return;
    if (reduced) {
      setStep(STEPS.length - 1);
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => {
      setStep((i) => {
        if (i >= STEPS.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 3000);
    return () => clearTimeout(t);
  }, [playing, step, reduced]);

  // single render loop drives every animated step — only while on screen
  const onScreen = useOnScreen(canvasRef);
  useEffect(() => {
    if (!onScreen) return;
    let raf = 0;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScreen]);

  function draw() {
    const cv = canvasRef.current;
    if (!cv) return;
    const g = geoRef.current;
    const key = STEPS[stepRef.current].key;
    const is3D = key === "triangulate" || key === "cloud";
    const LH = is3D ? 300 : IMG_H + 2;
    const cssW = cv.clientWidth || LOGICAL_W;
    const scale = cssW / LOGICAL_W;
    const dpr = window.devicePixelRatio || 1;
    const needW = Math.round(cssW * dpr);
    const needH = Math.round(LH * scale * dpr);
    if (cv.width !== needW || cv.height !== needH) {
      cv.width = needW;
      cv.height = needH;
      cv.style.height = `${LH * scale}px`;
    }
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.clearRect(0, 0, LOGICAL_W, LH);
    const t = performance.now();
    if (is3D) draw3D(ctx, g, key, LOGICAL_W, LH, t);
    else draw2D(ctx, g, key, t);
  }

  // --------------------------- 2D two-view render ---------------------------

  function panel(ctx: CanvasRenderingContext2D, ox: number, label: string) {
    ctx.fillStyle = "#0a0e13";
    ctx.fillRect(ox, 0, IMG_W, IMG_H);
    ctx.strokeStyle = rgba("#94a3b8", 0.22);
    ctx.lineWidth = 1;
    ctx.strokeRect(ox + 0.5, 0.5, IMG_W - 1, IMG_H - 1);
    ctx.fillStyle = rgba("#94a3b8", 0.85);
    ctx.font = "600 11px ui-monospace, monospace";
    ctx.fillText(label, ox + 8, 16);
  }

  function dot(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, r: number, a = 1) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = a;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function draw2D(ctx: CanvasRenderingContext2D, g: Geo, key: string, t: number) {
    const oxB = IMG_W + GAP;
    panel(ctx, 0, "view A");
    panel(ctx, oxB, "view B");

    if (key === "capture" || key === "detect") {
      g.feats.forEach((f) => {
        if (key === "detect") {
          // small "detected keypoint" squares with a soft pulse
          const pulse = 0.6 + 0.4 * Math.sin(t / 400 + f.i);
          ctx.strokeStyle = f.color;
          ctx.globalAlpha = 0.9;
          ctx.lineWidth = 1;
          const s = 3 + pulse;
          ctx.strokeRect(f.a.x - s, f.a.y - s, s * 2, s * 2);
          ctx.strokeRect(oxB + f.b.x - s, f.b.y - s, s * 2, s * 2);
          ctx.globalAlpha = 1;
        }
        dot(ctx, f.a.x, f.a.y, f.color, 2.4);
        dot(ctx, oxB + f.b.x, f.b.y, f.color, 2.4);
      });
      return;
    }

    if (key === "match") {
      const stepN = Math.max(1, Math.floor(g.feats.length / 16));
      g.feats.forEach((f, idx) => {
        if (idx % stepN === 0) {
          ctx.beginPath();
          ctx.moveTo(f.a.x, f.a.y);
          ctx.lineTo(oxB + f.b.x, f.b.y);
          ctx.strokeStyle = f.color;
          ctx.globalAlpha = 0.5;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        dot(ctx, f.a.x, f.a.y, f.color, 2.2, 0.9);
        dot(ctx, oxB + f.b.x, f.b.y, f.color, 2.2, 0.9);
      });
      return;
    }

    if (key === "epipolar") {
      const n = g.feats.length;
      const active = g.feats[Math.floor(t / 1500) % n];
      // faint everything
      g.feats.forEach((f) => {
        dot(ctx, f.a.x, f.a.y, f.color, 1.8, 0.28);
        dot(ctx, oxB + f.b.x, f.b.y, f.color, 1.8, 0.28);
      });
      // a few faint epipolar lines to reveal the epipole (where they converge)
      ctx.save();
      ctx.beginPath();
      ctx.rect(oxB, 0, IMG_W, IMG_H);
      ctx.clip();
      g.feats.forEach((f, idx) => {
        if (idx % Math.max(1, Math.floor(n / 6)) !== 0) return;
        drawEpiLine(ctx, epipolarLine(g.F, f.a.x, f.a.y), oxB, rgba(MV, 0.16), 1);
      });
      // bright active epipolar line
      drawEpiLine(ctx, epipolarLine(g.F, active.a.x, active.a.y), oxB, MV, 1.6);
      ctx.restore();
      // highlight active point in A and its true match in B
      ring(ctx, active.a.x, active.a.y, active.color);
      ring(ctx, oxB + active.b.x, active.b.y, active.color);
      ctx.fillStyle = rgba(MV, 0.9);
      ctx.font = "600 10px ui-monospace, monospace";
      ctx.fillText("l′ = F·x", oxB + 8, IMG_H - 10);
      return;
    }
  }

  function drawEpiLine(
    ctx: CanvasRenderingContext2D,
    l: [number, number, number],
    ox: number,
    color: string,
    w: number,
  ) {
    const [a, b, c] = l;
    let p0: [number, number];
    let p1: [number, number];
    if (Math.abs(b) > 1e-6) {
      p0 = [0, -c / b];
      p1 = [IMG_W, -(a * IMG_W + c) / b];
    } else {
      const x = -c / a;
      p0 = [x, 0];
      p1 = [x, IMG_H];
    }
    ctx.beginPath();
    ctx.moveTo(ox + p0[0], p0[1]);
    ctx.lineTo(ox + p1[0], p1[1]);
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.stroke();
  }

  function ring(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    ctx.beginPath();
    ctx.arc(x, y, 5.5, 0, Math.PI * 2);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    dot(ctx, x, y, color, 3);
  }

  // ------------------------------ 3D render ---------------------------------

  function draw3D(ctx: CanvasRenderingContext2D, g: Geo, key: string, W: number, H: number, t: number) {
    const isCloud = key === "cloud";
    // autospin the cloud
    if (isCloud && !dragging.current && !reducedRef.current) orbit.current.az += 0.004;
    const { az, el } = orbit.current;
    const radius = isCloud ? g.radiusPts : Math.max(g.radiusCam, g.radiusPts);
    const pr = (p: Vec3) => project3(p, g.center, radius, W, H, az, el);

    drawAxes(ctx, g, radius, az, el, W, H);

    // camera markers
    const camScreen = (cam: Camera) => {
      const k = (g.radiusPts * 1.3) / g.radiusCam;
      const pos: Vec3 = isCloud
        ? [
            g.center[0] + (cam.C[0] - g.center[0]) * k,
            g.center[1] + (cam.C[1] - g.center[1]) * k,
            g.center[2] + (cam.C[2] - g.center[2]) * k,
          ]
        : cam.C;
      return { pos, proj: pr(pos) };
    };
    const camA = camScreen(CAM_A);
    const camB = camScreen(CAM_B);

    if (key === "triangulate") {
      const elapsed = t - stepEnter.current;
      const total = g.recovered.length;
      const shown = Math.min(total, Math.floor(elapsed / 45));
      // already-recovered points
      for (let i = 0; i < shown; i++) {
        const p = pr(g.recovered[i].p);
        dot(ctx, p.sx, p.sy, g.recovered[i].color, Math.max(1.3, 2.4 * p.persp), 0.9);
      }
      // active point: draw both rays converging
      if (shown < total) {
        const cur = g.recovered[shown];
        const p = pr(cur.p);
        [camA, camB].forEach((cm) => {
          ctx.beginPath();
          ctx.moveTo(cm.proj.sx, cm.proj.sy);
          ctx.lineTo(p.sx, p.sy);
          ctx.strokeStyle = rgba(MV, 0.55);
          ctx.lineWidth = 1;
          ctx.stroke();
        });
        dot(ctx, p.sx, p.sy, "#ffffff", 4);
        dot(ctx, p.sx, p.sy, cur.color, 2.6);
      }
    } else {
      // full cloud, painter-sorted
      const projs = g.recovered
        .map((r) => ({ pr: pr(r.p), color: r.color }))
        .sort((u, v) => v.pr.depth - u.pr.depth);
      projs.forEach((q) => dot(ctx, q.pr.sx, q.pr.sy, q.color, Math.max(1.4, 2.6 * q.pr.persp), 0.95));
    }

    drawCamera(ctx, camA.proj, "cam A");
    drawCamera(ctx, camB.proj, "cam B");
  }

  function drawAxes(
    ctx: CanvasRenderingContext2D,
    g: Geo,
    radius: number,
    az: number,
    el: number,
    W: number,
    H: number,
  ) {
    const o = project3(g.center, g.center, radius, W, H, az, el);
    const L = radius * 0.6;
    const axes: [Vec3, string][] = [
      [[g.center[0] + L, g.center[1], g.center[2]], "#f87171"],
      [[g.center[0], g.center[1] + L, g.center[2]], "#4ade80"],
      [[g.center[0], g.center[1], g.center[2] + L], "#60a5fa"],
    ];
    axes.forEach(([p, c]) => {
      const q = project3(p, g.center, radius, W, H, az, el);
      ctx.beginPath();
      ctx.moveTo(o.sx, o.sy);
      ctx.lineTo(q.sx, q.sy);
      ctx.strokeStyle = c;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
  }

  function drawCamera(ctx: CanvasRenderingContext2D, p: Proj, label: string) {
    ctx.save();
    ctx.translate(p.sx, p.sy);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(-4, -4, 8, 8);
    ctx.restore();
    ctx.fillStyle = rgba("#e2e8f0", 0.9);
    ctx.font = "600 10px ui-monospace, monospace";
    ctx.fillText(label, p.sx + 8, p.sy + 3);
  }

  // ------------------------------ interaction -------------------------------

  const onDown = (e: React.PointerEvent) => {
    const key = STEPS[stepRef.current].key;
    if (key !== "triangulate" && key !== "cloud") return;
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    orbit.current.az += dx * 0.01;
    orbit.current.el = Math.max(-1.2, Math.min(1.2, orbit.current.el + dy * 0.01));
  };
  const onUp = () => {
    dragging.current = false;
  };

  const s = STEPS[step];
  const is3D = s.key === "triangulate" || s.key === "cloud";
  const accentText = light ? "#0f766e" : MV;

  return (
    <LiveDemo
      title="Multiview 3D Reconstruction"
      subtitle="Structure from Motion, live in your browser: two 2D views of a scene are turned back into 3D. Step through detection, matching, epipolar geometry and triangulation to see the point cloud reappear."
      repoUrl={REPO}
      accent={MV}
      embedded={embedded}
      {...cardProps("multiview")}
    >
      {/* controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            if (step >= STEPS.length - 1) {
              setStep(0);
              setPlaying(true);
            } else setPlaying((v) => !v);
          }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-medium text-ink-900 transition-opacity hover:opacity-90"
          style={{ background: MV }}
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? "pause" : step >= STEPS.length - 1 ? "replay" : "play walkthrough"}
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setStep(0);
          }}
          aria-label="Restart the reconstruction walkthrough"
          title="restart"
          className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:text-zinc-200"
          style={{ borderColor: "rgb(var(--line) / 0.12)" }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <div className="ml-auto flex items-center gap-1">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-wide text-zinc-500">scene</span>
          {SCENES.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setSceneId(sc.id)}
              aria-pressed={sceneId === sc.id}
              className="rounded px-2 py-1 font-mono text-[10px]"
              style={{
                background: sceneId === sc.id ? rgba(MV, 0.15) : "transparent",
                color: sceneId === sc.id ? accentText : "rgb(var(--zinc-500))",
                border: `1px solid ${sceneId === sc.id ? rgba(MV, 0.4) : "rgb(var(--line) / 0.12)"}`,
              }}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* pipeline */}
      <StepPipeline active={step} onPick={(i) => { setPlaying(false); setStep(i); }} accentText={accentText} />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* explanation */}
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
            <span style={{ color: accentText }}>{s.module}</span>
            <ChevronRight className="h-3 w-3 text-zinc-600" />
            <span className="text-zinc-400">
              step {step + 1}/{STEPS.length}
            </span>
          </div>
          <h3 className="text-base font-semibold text-zinc-100">{s.title}</h3>
          <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-zinc-500">
            <span className="rounded px-1.5 py-0.5" style={{ background: rgba(MV, 0.12), color: accentText }}>
              {s.op}
            </span>
            <span>
              {geo.feats.length} features · {geo.recovered.length} 3D points
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-300">{s.summary}</p>
          <ul className="mt-3 space-y-1.5">
            {s.what.map((w, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-zinc-400">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full" style={{ background: MV }} />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* visualization */}
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-wide text-zinc-500">
            <span>
              visualization <span className="ml-1 text-zinc-600">· computed live</span>
            </span>
            {is3D && (
              <span className="flex items-center gap-1 text-zinc-500">
                <Move3d className="h-3 w-3" /> drag to orbit
              </span>
            )}
          </div>
          <div
            className="flex-1 overflow-hidden rounded-lg border bg-ink-900 p-2"
            style={{ borderColor: "rgb(var(--line) / 0.12)" }}
          >
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step].title}.${
                is3D ? " Drag to orbit the 3D reconstruction." : ""
              }`}
              className="w-full"
              style={{ touchAction: "none", cursor: is3D ? "grab" : "default" }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerLeave={onUp}
            />
          </div>
        </div>
      </div>

      <p className="mt-3 font-mono text-[10px] leading-relaxed text-zinc-600">
        A synthetic scene with known camera poses keeps this robust, but the geometry is real and
        dependency-free: pinhole projection, the fundamental matrix (from the two camera matrices) and
        midpoint ray triangulation are all computed live. The repo runs incremental SfM on real photos.
      </p>
    </LiveDemo>
  );
}

export function MultiviewLab() {
  return <MultiviewDemo embedded />;
}

function StepPipeline({
  active,
  onPick,
  accentText,
}: {
  active: number;
  onPick: (i: number) => void;
  accentText: string;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <button
            onClick={() => onPick(i)}
            aria-pressed={i === active}
            className="whitespace-nowrap rounded-md px-2 py-1 font-mono text-[10px] transition-colors"
            style={{
              background: i === active ? rgba(MV, 0.15) : "transparent",
              color: i === active ? accentText : "rgb(var(--zinc-500))",
              border: `1px solid ${i === active ? rgba(MV, 0.4) : "rgb(var(--line) / 0.1)"}`,
            }}
          >
            {i + 1}. {s.title}
          </button>
          {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 flex-shrink-0 text-zinc-700" />}
        </div>
      ))}
    </div>
  );
}
