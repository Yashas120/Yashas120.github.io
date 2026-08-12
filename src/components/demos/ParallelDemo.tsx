"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, Lock, LockOpen, Pause, Play, RotateCcw } from "lucide-react";
import { LiveDemo } from "./LiveDemo";
import { useOnScreen, usePrefersReducedMotion } from "./bitcoin/parts";
import {
  MODES,
  cacheStats,
  mulberry32,
  piMidpoint,
  rectContribution,
  semicircleY,
} from "@/lib/demos/parallel";
import { cardProps } from "@/data/demos";

const REPO = "https://github.com/Yashas120/SSP";
const ACC = "#818cf8"; // indigo
const THREAD_COLORS = ["#818cf8", "#34d399", "#f472b6", "#fbbf24", "#22d3ee", "#f87171", "#a78bfa", "#4ade80"];

const FW = 620;
const FH = 300;
const NRECT_VIZ = 60;
const PI_FINE = 40000;
const GRID_N = 12;
const CACHE_LINE = 4;
const PI_VALUE = piMidpoint(PI_FINE);

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

const CAPTIONS = [
  "Rectangles are coloured by the thread that owns them — notice the interleaving: thread t takes every T-th rectangle. Local partial sums build on the right, then main reduces them into gPi and doubles it.",
  "The shared gPi and each thread's LOAD → ADD → STORE. Without the lock the two threads' steps interleave and a STORE lands on a stale value — a lost update. Turn the mutex on to serialise them.",
  "Left: the N×N matrix. Right: the same accesses laid out in linear memory (the malloc'd row blocks end-to-end). Sequential access walks one block and rides the cache line; the transposed order jumps a whole block every step.",
];

export function ParallelDemo() {
  const light = useIsLight();
  const reduced = usePrefersReducedMotion();
  const accentText = light ? "#4f46e5" : ACC;

  const [mode, setMode] = useState(0);
  const [threads, setThreads] = useState(4);
  const [locked, setLocked] = useState(false);
  const [columnMajor, setColumnMajor] = useState(false);
  const [playing, setPlaying] = useState(true);

  const st = useRef({ mode, threads, locked, columnMajor, playing, light, reduced });
  st.current = { mode, threads, locked, columnMajor, playing, light, reduced };
  const t0 = useRef(performance.now());
  const canvas = useRef<HTMLCanvasElement>(null);
  // Only animate while the demo is actually on screen (see useOnScreen).
  const onScreen = useOnScreen(canvas);

  useEffect(() => {
    t0.current = performance.now();
  }, [mode, columnMajor, locked, threads]);

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

  const restart = () => {
    t0.current = performance.now();
    setPlaying(true);
  };

  // ------------------------------ drawing ----------------------------------
  function fit(): CanvasRenderingContext2D | null {
    const cv = canvas.current;
    if (!cv) return null;
    const cssW = cv.clientWidth || FW;
    const scale = cssW / FW;
    const dpr = window.devicePixelRatio || 1;
    const nw = Math.round(cssW * dpr);
    const nh = Math.round(FH * scale * dpr);
    if (cv.width !== nw || cv.height !== nh) {
      cv.width = nw;
      cv.height = nh;
      cv.style.height = `${FH * scale}px`;
    }
    const ctx = cv.getContext("2d")!;
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.clearRect(0, 0, FW, FH);
    return ctx;
  }
  function pal() {
    const lt = st.current.light;
    return {
      text: lt ? "#3f3f46" : "#a1a1aa",
      dim: "#71717a",
      grid: lt ? "rgba(9,9,11,0.09)" : "rgba(255,255,255,0.08)",
      box: lt ? "rgba(9,9,11,0.16)" : "rgba(255,255,255,0.16)",
    };
  }
  function label(ctx: CanvasRenderingContext2D, x: number, y: number, s: string, c: string, size = 11, w = "600") {
    ctx.fillStyle = c;
    ctx.font = `${w} ${size}px ui-monospace, monospace`;
    ctx.fillText(s, x, y);
  }
  function accentTextCanvas() {
    return st.current.light ? "#4f46e5" : ACC;
  }
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  function draw() {
    const ctx = fit();
    if (!ctx) return;
    const now = st.current.playing ? performance.now() : t0.current + 1;
    const elapsed = st.current.reduced ? 6000 : now - t0.current;
    const key = MODES[st.current.mode].key;
    if (key === "pi") drawPi(ctx, elapsed);
    else if (key === "race") drawRace(ctx, elapsed);
    else drawCache(ctx, elapsed);
  }

  // ---- parallel π -----------------------------------------------------------
  function drawPi(ctx: CanvasRenderingContext2D, elapsed: number) {
    const p = pal();
    const T = st.current.threads;
    const padL = 42, padR = 250, baseY = 214, topY = 40;
    const xMap = (x: number) => padL + ((x + 1) / 2) * (FW - padL - padR);
    const yMap = (y: number) => baseY - y * (baseY - topY);

    ctx.strokeStyle = p.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, baseY);
    ctx.lineTo(FW - padR, baseY);
    ctx.stroke();

    const stepsPerThread = Math.ceil(NRECT_VIZ / T);
    const prog = Math.min(1, elapsed / 3200);
    const done = Math.floor(prog * stepsPerThread);
    const partial = new Array(T).fill(0);

    for (let i = 0; i < NRECT_VIZ; i++) {
      const t = i % T;
      const k = Math.floor(i / T);
      if (k >= done) continue;
      const { x, area } = rectContribution(i, NRECT_VIZ);
      partial[t] += area;
      const h = 2 / NRECT_VIZ;
      const x0 = xMap(x - h / 2);
      const x1 = xMap(x + h / 2);
      const yTop = yMap(semicircleY(x));
      ctx.fillStyle = rgba(THREAD_COLORS[t % THREAD_COLORS.length], 0.55);
      ctx.fillRect(x0, yTop, x1 - x0 - 0.5, baseY - yTop);
      ctx.strokeStyle = rgba(THREAD_COLORS[t % THREAD_COLORS.length], 0.9);
      ctx.lineWidth = 0.6;
      ctx.strokeRect(x0, yTop, x1 - x0 - 0.5, baseY - yTop);
    }
    // semicircle outline
    ctx.strokeStyle = p.text;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let s = 0; s <= 120; s++) {
      const x = -1 + (2 * s) / 120;
      const sx = xMap(x), sy = yMap(semicircleY(x));
      s === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    label(ctx, padL, topY - 18, "for (i = t; i < N; i += T)  →  thread t owns every T-th rectangle", p.text, 11);
    label(ctx, padL - 6, baseY + 16, "−1", p.dim, 9, "400");
    label(ctx, FW - padR - 10, baseY + 16, "+1", p.dim, 9, "400");

    // reduction panel
    const bx = FW - padR + 26, bw = 150;
    label(ctx, bx, 34, "local partialSum[t]", p.text, 10);
    const maxBar = 2 / T + 0.04;
    let gPi = 0;
    for (let t = 0; t < T; t++) {
      const y = 46 + t * 16;
      const w = ((partial[t] * 2) / maxBar) * bw;
      ctx.fillStyle = THREAD_COLORS[t % THREAD_COLORS.length];
      ctx.fillRect(bx, y, Math.max(1, w), 11);
      label(ctx, bx - 22, y + 9, `t${t}`, p.dim, 9, "400");
      gPi += partial[t];
    }
    // reduce → gPi → ×2
    const ry = 46 + T * 16 + 18;
    ctx.strokeStyle = p.box;
    ctx.lineWidth = 1;
    for (let t = 0; t < T; t++) {
      ctx.beginPath();
      ctx.moveTo(bx + 4, 46 + t * 16 + 5);
      ctx.lineTo(bx + 4, ry - 6);
      ctx.stroke();
    }
    label(ctx, bx, ry + 4, `gPi = Σ partials = ${gPi.toFixed(4)}`, p.text, 10, "400");
    label(ctx, bx, ry + 24, `π = 2·gPi ≈ ${(done >= stepsPerThread ? PI_VALUE : gPi * 2).toFixed(5)}`, accentTextCanvas(), 15);
    label(ctx, bx, ry + 42, `error ${Math.abs(PI_VALUE - Math.PI).toExponential(1)} @ ${PI_FINE.toLocaleString()} rects`, p.dim, 9, "400");
    if (done >= stepsPerThread) label(ctx, bx, ry + 60, "✓ all stripes summed & reduced", "#4ade80", 9, "600");
  }

  // ---- race: LOAD / ADD / STORE interleaving --------------------------------
  function drawRace(ctx: CanvasRenderingContext2D, elapsed: number) {
    const p = pal();
    const locked = st.current.locked;
    const SLOT = 6;
    const SLOT_MS = 780;
    const slotAbs = Math.floor(elapsed / SLOT_MS);
    const round = Math.floor(slotAbs / SLOT);
    const s = slotAbs % SLOT; // active slot 0..5

    const collideRound = (r: number) => (locked ? false : mulberry32(999 + r * 3)() < 0.6);

    // accumulate finished rounds
    let baseGpi = 0, baseLost = 0;
    for (let r = 0; r < round; r++) {
      if (collideRound(r)) { baseGpi += 1; baseLost += 1; } else { baseGpi += 2; }
    }
    const collide = collideRound(round);
    const serial = [
      { t: 0, op: "LOAD" }, { t: 0, op: "ADD" }, { t: 0, op: "STORE" },
      { t: 1, op: "LOAD" }, { t: 1, op: "ADD" }, { t: 1, op: "STORE" },
    ];
    const raced = [
      { t: 0, op: "LOAD" }, { t: 1, op: "LOAD" }, { t: 0, op: "ADD" },
      { t: 1, op: "ADD" }, { t: 0, op: "STORE" }, { t: 1, op: "STORE" },
    ];
    const sched = collide ? raced : serial;

    // replay completed slots of the current round
    let g = baseGpi;
    const reg: (number | null)[] = [null, null];
    let attemptedRound = 0, lostRound = 0;
    for (let k = 0; k < s && k < SLOT; k++) {
      const o = sched[k];
      if (o.op === "LOAD") reg[o.t] = g;
      else if (o.op === "ADD") reg[o.t] = (reg[o.t] ?? g) + 1;
      else {
        attemptedRound++;
        const v = reg[o.t] ?? g + 1;
        if (v > g) g = v;
        else lostRound++;
      }
    }

    // shared gPi box
    const boxW = 150, boxX = FW - boxW - 24, boxY = 44, boxH = 70;
    ctx.strokeStyle = rgba(ACC, 0.6);
    ctx.lineWidth = 1.5;
    roundRect(ctx, boxX, boxY, boxW, boxH, 8);
    ctx.stroke();
    label(ctx, boxX + 14, boxY + 22, "shared gPi", p.dim, 10, "400");
    label(ctx, boxX + 14, boxY + 54, `${g}`, accentTextCanvas(), 30);
    label(ctx, boxX, boxY - 12, locked ? "mutex: LOCKED (serialised)" : "no lock: RACING", locked ? "#4ade80" : "#f87171", 10, "600");

    // two thread lanes with slot tokens
    const laneX = 26, colW = 74, laneY = [150, 214];
    for (let t = 0; t < 2; t++) {
      label(ctx, laneX - 4, laneY[t] - 20, `thread ${t}`, THREAD_COLORS[t], 10, "600");
      label(ctx, laneX + 250, laneY[t] - 20, reg[t] === null ? "reg —" : `reg ${reg[t]}`, p.dim, 10, "400");
    }
    for (let k = 0; k < SLOT; k++) {
      const o = sched[k];
      const active = k === s;
      const doneSlot = k < s;
      if (!active && !doneSlot) continue;
      const tx = laneX + k * colW;
      const ty = laneY[o.t] - 14;
      const col = THREAD_COLORS[o.t];
      const isStore = o.op === "STORE";
      const isLostStore = isStore && collide && o.t === 1;
      ctx.globalAlpha = active ? 1 : 0.85;
      ctx.fillStyle = active ? rgba(col, 0.9) : rgba(col, 0.35);
      roundRect(ctx, tx, ty, colW - 10, 26, 6);
      ctx.fill();
      ctx.globalAlpha = 1;
      label(ctx, tx + 8, ty + 17, o.op, active ? "#0a0a0a" : p.text, 10, "700");
      // arrow to/from gPi box on active LOAD/STORE
      if (active && (o.op === "LOAD" || isStore)) {
        ctx.strokeStyle = isLostStore ? "#f87171" : rgba(ACC, 0.7);
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(tx + colW - 10, ty + 13);
        ctx.lineTo(boxX, boxY + boxH / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (isLostStore && doneSlot) {
        label(ctx, tx - 6, ty + 44, "lost!", "#f87171", 10, "700");
      }
    }
    // slot timeline ruler
    ctx.strokeStyle = p.grid;
    ctx.beginPath();
    ctx.moveTo(laneX, 128);
    ctx.lineTo(laneX + SLOT * colW, 128);
    ctx.stroke();
    label(ctx, laneX, 120, "time →", p.dim, 9, "400");

    // running tally
    const expected = 2 * round + attemptedRound;
    const actual = g;
    const lost = baseLost + lostRound;
    const ty2 = 262;
    label(ctx, laneX, ty2, `expected ${expected}`, p.dim, 11, "400");
    label(ctx, laneX + 130, ty2, `actual ${actual}`, actual === expected ? "#4ade80" : "#f87171", 11, "700");
    label(ctx, laneX + 250, ty2, lost > 0 ? `${lost} updates lost` : "0 lost", lost > 0 ? "#f87171" : "#4ade80", 11, "700");
  }

  // ---- cache: matrix walk + linear memory strip -----------------------------
  function drawCache(ctx: CanvasRenderingContext2D, elapsed: number) {
    const p = pal();
    const col = st.current.columnMajor; // true → arr[col][row] (jumping)
    const n = GRID_N;
    const cell = 15, gx = 26, gy = 52;
    label(ctx, gx, 28, col ? "arr[col][row] = 0  (inner index = row → jumps blocks)" : "arr[row][col] = 0  (inner index = col → sequential)", p.text, 11);

    const total = n * n;
    const prog = Math.min(1, elapsed / 5200);
    const shown = Math.floor(prog * total);
    // access k → grid (r,c); memory address is always r*n+c (row-major blocks)
    const order = (k: number) => (col ? { r: k % n, c: Math.floor(k / n) } : { r: Math.floor(k / n), c: k % n });
    const addrOf = (k: number) => {
      const { r, c } = order(k);
      return r * n + c;
    };
    const isMiss = (k: number) => (col ? true : addrOf(k) % CACHE_LINE === 0);

    let hits = 0, misses = 0;
    for (let k = 0; k < shown; k++) (isMiss(k) ? misses++ : hits++);

    // grid
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) {
        ctx.strokeStyle = p.grid;
        ctx.strokeRect(gx + c * cell, gy + r * cell, cell, cell);
      }
    for (let k = 0; k < shown; k++) {
      const { r, c } = order(k);
      ctx.fillStyle = isMiss(k) ? rgba("#f87171", 0.6) : rgba("#4ade80", 0.55);
      ctx.fillRect(gx + c * cell + 1, gy + r * cell + 1, cell - 2, cell - 2);
    }
    if (shown < total) {
      const { r, c } = order(shown);
      ctx.strokeStyle = ACC;
      ctx.lineWidth = 2;
      ctx.strokeRect(gx + c * cell, gy + r * cell, cell, cell);
    }
    label(ctx, gx, gy + n * cell + 18, `${n}×${n} matrix (grid position)`, p.dim, 9, "400");

    // linear memory strip: the n row-blocks laid end to end
    const memX = gx + n * cell + 44, memW = FW - memX - 24;
    const memY = 66, segH = 150 / n;
    label(ctx, memX, 52, "linear memory — row blocks end to end", p.text, 10, "400");
    for (let r = 0; r < n; r++) {
      ctx.strokeStyle = p.grid;
      ctx.strokeRect(memX, memY + r * segH, memW, segH);
    }
    // mark visited addresses + current, showing jump pattern
    const addrToXY = (addr: number) => {
      const r = Math.floor(addr / n), c = addr % n;
      return { x: memX + (c / n) * memW + memW / (2 * n), y: memY + r * segH + segH / 2 };
    };
    // trace last few accesses to show sequential vs jumping
    const traceStart = Math.max(0, shown - 10);
    ctx.lineWidth = 1.5;
    for (let k = traceStart; k < shown; k++) {
      const a = addrToXY(addrOf(k));
      ctx.fillStyle = isMiss(k) ? rgba("#f87171", 0.7) : rgba("#4ade80", 0.7);
      ctx.beginPath();
      ctx.arc(a.x, a.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
      if (k > traceStart) {
        const b = addrToXY(addrOf(k - 1));
        ctx.strokeStyle = col ? rgba("#f87171", 0.4) : rgba("#4ade80", 0.4);
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(a.x, a.y);
        ctx.stroke();
      }
    }
    if (shown < total) {
      const a = addrToXY(addrOf(shown));
      ctx.strokeStyle = ACC;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(a.x, a.y, 4.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    label(ctx, memX, memY + 150 + 16, col ? "each step jumps a block → miss" : "steps stay in a block → cache-line hits", col ? "#f87171" : "#4ade80", 9, "600");

    // stats
    const rowMiss = cacheStats(n, CACHE_LINE, false).misses;
    const colMiss = cacheStats(n, CACHE_LINE, true).misses;
    label(ctx, gx, 262, `hits ${hits}`, "#4ade80", 12, "700");
    label(ctx, gx + 90, 262, `misses ${misses}`, "#f87171", 12, "700");
    label(ctx, gx + 220, 262, `sequential ≈ ${(colMiss / rowMiss).toFixed(0)}× fewer misses`, accentTextCanvas(), 11, "600");
  }

  const m = MODES[mode];

  return (
    <LiveDemo
      title="Parallel Computing Playground"
      subtitle="Three implementation lessons from the SSP pthreads/cache coursework, each shown as its real C code beside a live animation of the mechanism it hides: how work is split across threads, how a shared update races, and how memory layout decides speed."
      repoUrl={REPO}
      accent={ACC}
      {...cardProps("parallel")}
    >
      {/* mode tabs */}
      <div className="mb-4 flex items-center gap-1 overflow-x-auto pb-1">
        {MODES.map((mm, i) => (
          <div key={mm.key} className="flex items-center">
            <button
              onClick={() => {
                setMode(i);
                restart();
              }}
              className="whitespace-nowrap rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors"
              style={{
                background: i === mode ? rgba(ACC, 0.15) : "transparent",
                color: i === mode ? accentText : "rgb(var(--zinc-500))",
                border: `1px solid ${i === mode ? rgba(ACC, 0.4) : "rgb(var(--line) / 0.1)"}`,
              }}
            >
              {mm.title.split(" — ")[0]}
            </button>
            {i < MODES.length - 1 && <ChevronRight className="h-3 w-3 flex-shrink-0 text-zinc-700" />}
          </div>
        ))}
      </div>

      {/* controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPlaying((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-medium text-ink-900 transition-opacity hover:opacity-90"
          style={{ background: ACC }}
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? "pause" : "play"}
        </button>
        <button
          onClick={restart}
          aria-label="Restart the animation"
          title="restart"
          className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:text-zinc-200"
          style={{ borderColor: "rgb(var(--line) / 0.12)" }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        {m.key === "pi" && (
          <div className="flex items-center gap-1">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-wide text-zinc-500">threads</span>
            {[1, 2, 4, 8].map((tv) => (
              <button
                key={tv}
                onClick={() => {
                  setThreads(tv);
                  restart();
                }}
                className="rounded px-2 py-1 font-mono text-[10px]"
                style={{
                  background: threads === tv ? rgba(ACC, 0.15) : "transparent",
                  color: threads === tv ? accentText : "rgb(var(--zinc-500))",
                  border: `1px solid ${threads === tv ? rgba(ACC, 0.4) : "rgb(var(--line) / 0.12)"}`,
                }}
              >
                {tv}
              </button>
            ))}
          </div>
        )}
        {m.key === "race" && (
          <button
            onClick={() => {
              setLocked((v) => !v);
              restart();
            }}
            className="ml-auto flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-colors"
            style={{
              borderColor: locked ? rgba("#4ade80", 0.5) : "rgb(var(--line) / 0.12)",
              color: locked ? "#4ade80" : "rgb(var(--zinc-400))",
            }}
          >
            {locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
            {locked ? "mutex on" : "no lock"}
          </button>
        )}
        {m.key === "cache" && (
          <div className="ml-auto flex items-center gap-1">
            {[
              { v: false, l: "arr[row][col]" },
              { v: true, l: "arr[col][row]" },
            ].map((o) => (
              <button
                key={o.l}
                onClick={() => {
                  setColumnMajor(o.v);
                  restart();
                }}
                className="rounded px-2 py-1 font-mono text-[10px]"
                style={{
                  background: columnMajor === o.v ? rgba(ACC, 0.15) : "transparent",
                  color: columnMajor === o.v ? accentText : "rgb(var(--zinc-500))",
                  border: `1px solid ${columnMajor === o.v ? rgba(ACC, 0.4) : "rgb(var(--line) / 0.12)"}`,
                }}
              >
                {o.l}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* code + mechanism */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
            <span style={{ color: accentText }}>{m.file}</span>
          </div>
          <pre className="overflow-x-auto rounded-lg border p-3 font-mono text-[10.5px] leading-[1.55]" style={{ borderColor: "rgb(var(--line) / 0.12)", background: "rgb(var(--line) / 0.04)" }}>
            {m.code.map((line, i) => {
              const hot = m.focus.includes(i);
              return (
                <div
                  key={i}
                  style={{
                    background: hot ? rgba(ACC, 0.14) : "transparent",
                    borderLeft: `2px solid ${hot ? ACC : "transparent"}`,
                    paddingLeft: 6,
                    color: hot ? (light ? "#312e81" : "#e0e7ff") : "rgb(var(--zinc-400))",
                  }}
                >
                  {line || " "}
                </div>
              );
            })}
          </pre>
        </div>

        <div>
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-zinc-500">how it works</div>
          <ol className="space-y-2">
            {m.steps.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-zinc-300">
                <span
                  className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-bold"
                  style={{ background: rgba(ACC, 0.18), color: accentText }}
                >
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* visualization */}
      <div className="mt-4">
        <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
          live animation of the mechanism above
        </div>
        <div className="overflow-hidden rounded-lg border bg-ink-900 p-2" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
          <canvas
            ref={canvas}
            role="img"
            aria-label={`Live animation: ${MODES[mode].title}. ${CAPTIONS[mode]}`}
            className="mx-auto block w-full"
            style={{ maxWidth: FW }}
          />
        </div>
        <p className="mt-2 font-mono text-[10.5px] leading-relaxed text-zinc-500">{CAPTIONS[mode]}</p>
      </div>

      <p className="mt-3 font-mono text-[10px] leading-relaxed text-zinc-600">
        Faithful to the SSP sources: the π estimate uses the exact midpoint integrand and the <code>i += NUMTHREADS</code>
        strided split from <code>parallel_pi.c</code>; the race models the non-atomic <code>gPi += partial</code> reduction
        guarded by the file&apos;s <code>gLock</code>; the cache lesson contrasts <code>arr[row][col]</code> against
        <code> arr[col][row]</code> from <code>2d_row.c</code>/<code>2d_col.c</code>. Timings are illustrative models, not
        hardware counters.
      </p>
    </LiveDemo>
  );
}
