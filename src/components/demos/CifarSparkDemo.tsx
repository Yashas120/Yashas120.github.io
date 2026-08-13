"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { LiveDemo } from "./LiveDemo";
import { useOnScreen, usePrefersReducedMotion } from "./bitcoin/parts";
import {
  CIFAR_CLASSES,
  CLASS_COLORS,
  poolFeatures,
  seededShuffle,
  Softmax,
  Standardizer,
  STEPS,
  type CifarMeta,
} from "@/lib/demos/cifar";
import { cardProps } from "@/data/demos";

const REPO = "https://github.com/Yashas120/SSML-spark-streaming-for-machine-learning";
const SPARK = "#e25a1c"; // Apache Spark orange-red
const BLUE = "#60a5fa";
const POOL = 2; // 32 -> 16 average pooling
const TRAIN_PER = 60; // per class used for streaming training
const BATCH_SIZES = [1, 4, 8, 16, 32, 64];
const TICK_MS = 550;
const STEP_MS = 8000; // walkthrough auto-advance — give time to read
const ABBR = ["ai", "au", "bi", "ca", "de", "do", "fr", "ho", "sh", "tr"];

const FW = 460; // logical canvas width
const FH = 300; // logical canvas height

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

interface BatchItem {
  tile: number;
  pred: number;
  truth: number;
  ok: boolean;
}
interface FeatSample {
  tile: number;
  pooled: Float32Array; // 16*16*3 in [0,1]
  std: Float32Array; // 769 standardized (+bias)
  label: number;
}

export function CifarSparkDemo({ embedded = false }: Readonly<{ embedded?: boolean }> = {}) {
  const light = useIsLight();
  const reduced = usePrefersReducedMotion();
  const accentText = light ? "#c2410c" : SPARK;

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [batchSize, setBatchSize] = useState(8);
  const [executors, setExecutors] = useState(3);

  const [acc, setAcc] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  // data + model refs
  const meta = useRef<CifarMeta | null>(null);
  const sprite = useRef<HTMLCanvasElement | null>(null);
  const raw = useRef<Float32Array[]>([]); // pooled features per sprite tile
  const std = useRef<Standardizer | null>(null);
  const trainX = useRef<Float32Array[]>([]);
  const trainY = useRef<number[]>([]);
  const testX = useRef<Float32Array[]>([]);
  const testY = useRef<number[]>([]);
  const stream = useRef<number[]>([]);
  const trainTile = useRef<number[]>([]);
  const model = useRef<Softmax | null>(null);
  const feat = useRef<FeatSample | null>(null);

  const pos = useRef(0);
  const processedRef = useRef(0);
  const epochRef = useRef(0);
  const history = useRef<number[]>([]);
  const confusion = useRef<number[][]>([]);
  const batch = useRef<BatchItem[]>([]);

  // live scalars for the draw loop
  const st = useRef({ step, batchSize, executors, playing, light, reduced });
  st.current = { step, batchSize, executors, playing, light, reduced };
  const stepEnter = useRef(performance.now());
  const lastTick = useRef(0);

  const canvas = useRef<HTMLCanvasElement>(null);
  // The canvas only mounts once `ready`, so observe the always-rendered wrapper.
  const vizRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(vizRef);

  // -------------------------------- load data ------------------------------
  useEffect(() => {
    if (!onScreen || ready) return;
    let cancelled = false;
    setLoadError(null);
    (async () => {
      try {
        const response = await fetch("/demos/cifar/meta.json");
        if (!response.ok) throw new Error(`metadata request failed (${response.status})`);
        const m: CifarMeta = await response.json();
        const img = new Image();
        img.onload = () => {
          if (cancelled) return;
          try {
            const cv = document.createElement("canvas");
            cv.width = m.cols * m.tile;
            cv.height = m.rows * m.tile;
            const ctx = cv.getContext("2d", { willReadFrequently: true });
            if (!ctx) throw new Error("canvas context unavailable");
            ctx.drawImage(img, 0, 0);
            sprite.current = cv;
            meta.current = m;

            const rawArr: Float32Array[] = [];
            for (let i = 0; i < m.count; i++) {
              const tx = (i % m.cols) * m.tile;
              const ty = Math.floor(i / m.cols) * m.tile;
              rawArr.push(poolFeatures(ctx.getImageData(tx, ty, m.tile, m.tile).data, m.tile, POOL));
            }
            raw.current = rawArr;

            const trainIdx: number[] = [];
            const testIdx: number[] = [];
            for (let i = 0; i < m.count; i++) {
              (i % m.perClass < TRAIN_PER ? trainIdx : testIdx).push(i);
            }
            const dim = rawArr[0].length;
            const sd = new Standardizer(dim);
            sd.fit(trainIdx.map((i) => rawArr[i]));
            std.current = sd;

            trainX.current = trainIdx.map((i) => sd.transform(rawArr[i]));
            trainY.current = trainIdx.map((i) => m.labels[i]);
            testX.current = testIdx.map((i) => sd.transform(rawArr[i]));
            testY.current = testIdx.map((i) => m.labels[i]);
            stream.current = seededShuffle(trainIdx.map((_, k) => k), 1337);
            trainTile.current = trainIdx;

            model.current = new Softmax(dim + 1, 10);
            const e0 = model.current.evaluate(testX.current, testY.current);
            confusion.current = e0.confusion;
            setAcc(e0.acc);

            // deterministic featurize sample
            const ft = trainIdx[0];
            feat.current = {
              tile: ft,
              pooled: rawArr[ft],
              std: sd.transform(rawArr[ft]),
              label: m.labels[ft],
            };
            setReady(true);
          } catch {
            if (!cancelled) setLoadError("The CIFAR sample could not be processed in this browser.");
          }
        };
        img.onerror = () => {
          if (!cancelled) setLoadError("The bundled CIFAR image could not be loaded.");
        };
        img.src = "/demos/cifar/sprite.png";
      } catch {
        if (!cancelled) setLoadError("The CIFAR metadata could not be loaded.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadAttempt, onScreen, ready]);

  useEffect(() => {
    stepEnter.current = performance.now();
  }, [step]);

  // ------------------------------ training loop ----------------------------
  useEffect(() => {
    if (!playing || !ready || !model.current || !onScreen) return;
    lastTick.current = performance.now();
    const stepOnce = () => {
      const bs = st.current.batchSize;
      const md = model.current!;
      const xs: Float32Array[] = [];
      const ys: number[] = [];
      const items: BatchItem[] = [];
      for (let n = 0; n < bs; n++) {
        if (pos.current >= stream.current.length) {
          pos.current = 0;
          epochRef.current += 1;
        }
        const k = stream.current[pos.current++];
        const x = trainX.current[k];
        const y = trainY.current[k];
        xs.push(x);
        ys.push(y);
        const pred = md.predict(x);
        items.push({ tile: trainTile.current[k], pred, truth: y, ok: pred === y });
      }
      md.trainBatch(xs, ys);
      processedRef.current += bs;
      const ev = md.evaluate(testX.current, testY.current);
      confusion.current = ev.confusion;
      batch.current = items;
      history.current.push(ev.acc);
      if (history.current.length > 400) history.current = history.current.slice(-400);
      setAcc(ev.acc);
      setProcessed(processedRef.current);
      setEpoch(epochRef.current);
    };
    const id = setInterval(stepOnce, reduced ? 90 : TICK_MS);
    return () => clearInterval(id);
  }, [playing, ready, reduced, onScreen]);

  // ---------------------------- walkthrough advance ------------------------
  useEffect(() => {
    if (!playing) return;
    if (reduced) {
      setStep(STEPS.length - 1);
      return;
    }
    if (step >= STEPS.length - 1) return; // stay on last, keep streaming
    const t = setTimeout(() => setStep((i) => Math.min(STEPS.length - 1, i + 1)), STEP_MS);
    return () => clearTimeout(t);
  }, [playing, step, reduced]);

  // -------------------------------- render loop ----------------------------
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

  const reset = () => {
    setPlaying(false);
    setStep(0);
    model.current?.reset();
    pos.current = 0;
    processedRef.current = 0;
    epochRef.current = 0;
    history.current = [];
    batch.current = [];
    setProcessed(0);
    setEpoch(0);
    if (model.current) {
      const ev = model.current.evaluate(testX.current, testY.current);
      confusion.current = ev.confusion;
      setAcc(ev.acc);
    }
  };

  // ============================ drawing ====================================
  function ctxFit(): { ctx: CanvasRenderingContext2D; run: boolean } | null {
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
    return { ctx, run: st.current.playing };
  }

  function palette() {
    const lt = st.current.light;
    return {
      stroke: lt ? "rgba(9,9,11,0.16)" : "rgba(255,255,255,0.14)",
      fill: lt ? "rgba(9,9,11,0.03)" : "rgba(255,255,255,0.03)",
      text: lt ? "#3f3f46" : "#a1a1aa",
      dim: "#71717a",
      panel: lt ? "#f4f4f5" : "#0a0e13",
    };
  }

  function draw() {
    const f = ctxFit();
    if (!f) return;
    const { ctx } = f;
    const key = STEPS[st.current.step].key;
    const t = st.current.reduced ? 0 : performance.now();
    switch (key) {
      case "producer":
        drawProducer(ctx, t);
        break;
      case "dstream":
        drawDStream(ctx, t);
        break;
      case "partition":
        drawPartition(ctx, t);
        break;
      case "map":
        drawMap(ctx);
        break;
      case "reduce":
        drawReduce(ctx, t);
        break;
      default:
        drawEvaluate(ctx);
    }
  }

  // display tiles for the flowing thumbnails (real batch if present, else preview)
  function displayTiles(n: number): { tile: number; truth: number; ok: boolean; scored: boolean }[] {
    const b = batch.current;
    if (b.length) {
      return b.slice(0, n).map((it) => ({ tile: it.tile, truth: it.truth, ok: it.ok, scored: true }));
    }
    const out: { tile: number; truth: number; ok: boolean; scored: boolean }[] = [];
    for (let i = 0; i < n && i < trainTile.current.length; i++) {
      const k = stream.current[i] ?? i;
      out.push({ tile: trainTile.current[k], truth: trainY.current[k], ok: false, scored: false });
    }
    return out;
  }

  function thumb(ctx: CanvasRenderingContext2D, x: number, y: number, tile: number, s: number) {
    const sp = sprite.current;
    const m = meta.current;
    if (!sp || !m) return;
    const sx = (tile % m.cols) * m.tile;
    const sy = Math.floor(tile / m.cols) * m.tile;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sp, sx, sy, m.tile, m.tile, x, y, s, s);
  }

  function node(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, glow = false) {
    const p = palette();
    roundRect(ctx, x, y, w, h, 8);
    ctx.fillStyle = glow ? rgba(SPARK, 0.12) : p.fill;
    ctx.fill();
    ctx.strokeStyle = glow ? rgba(SPARK, 0.6) : p.stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  function text(ctx: CanvasRenderingContext2D, x: number, y: number, s: string, c: string, size = 10, w = "600") {
    ctx.fillStyle = c;
    ctx.font = `${w} ${size}px ui-monospace, monospace`;
    ctx.fillText(s, x, y);
  }

  // ---- step 1: producer ---------------------------------------------------
  function drawProducer(ctx: CanvasRenderingContext2D, t: number) {
    const p = palette();
    const bs = st.current.batchSize;
    const prod = { x: 14, y: 104, w: 128, h: 92 };
    const recv = { x: FW - 132, y: 104, w: 118, h: 92 };
    node(ctx, prod.x, prod.y, prod.w, prod.h);
    text(ctx, prod.x + 12, prod.y + 20, "producer", SPARK, 11);
    text(ctx, prod.x + 12, prod.y + 36, "stream.py", p.dim, 9, "400");
    text(ctx, prod.x + 12, prod.y + 50, `batch-size ${bs}`, p.dim, 9, "400");
    text(ctx, prod.x + 12, prod.y + 64, "endless replay", p.dim, 9, "400");
    // dataset stack
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = rgba(CLASS_COLORS[i % 10], 0.7);
      roundRect(ctx, prod.x + 90 + i * 3, prod.y + 54 - i * 3, 20, 20, 3);
      ctx.fill();
    }
    node(ctx, recv.x, recv.y, recv.w, recv.h);
    text(ctx, recv.x + 12, recv.y + 20, "Spark", SPARK, 11);
    text(ctx, recv.x + 12, recv.y + 34, "receiver", p.dim, 9, "400");
    text(ctx, recv.x + 12, recv.y + 52, "TCP :6100", p.dim, 9, "400");

    const y = 150;
    const x0 = prod.x + prod.w;
    const x1 = recv.x;
    ctx.strokeStyle = rgba(SPARK, 0.4);
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, (x0 + x1) / 2 - 34, y - 8, "socket.send()", p.dim, 9, "400");

    // flowing thumbnails
    const tiles = displayTiles(Math.min(bs, 6));
    const period = 4200;
    tiles.forEach((it, i) => {
      const frac = ((t / period + i / tiles.length) % 1);
      const x = x0 + frac * (x1 - x0) - 8;
      thumb(ctx, x, y - 8, it.tile, 16);
    });
    const bcount = Math.floor(processedRef.current / Math.max(1, bs));
    text(ctx, 14, FH - 12, `batch #${bcount} · ${bs} images/batch → socket`, SPARK, 10);
  }

  // ---- step 2: DStream ----------------------------------------------------
  function drawDStream(ctx: CanvasRenderingContext2D, t: number) {
    const p = palette();
    const bs = st.current.batchSize;
    // batch-interval clock
    const clk = { x: 54, y: 60, r: 22 };
    ctx.strokeStyle = rgba(p.text === "#3f3f46" ? "#3f3f46" : "#a1a1aa", 0.25);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(clk.x, clk.y, clk.r, 0, Math.PI * 2);
    ctx.stroke();
    const sweep = ((t / 4000) % 1) * Math.PI * 2;
    ctx.strokeStyle = SPARK;
    ctx.beginPath();
    ctx.arc(clk.x, clk.y, clk.r, -Math.PI / 2, -Math.PI / 2 + sweep);
    ctx.stroke();
    text(ctx, clk.x - 42, clk.y + clk.r + 16, "batch interval", p.dim, 9, "400");

    // RDD staging box (fills as interval progresses)
    const rdd = { x: 130, y: 30, w: 150, h: 130 };
    node(ctx, rdd.x, rdd.y, rdd.w, rdd.h, true);
    text(ctx, rdd.x + 8, rdd.y - 6, `RDD (micro-batch) · ${bs} img`, p.dim, 9, "600");
    const tiles = displayTiles(Math.min(bs, 12));
    const cols = 4;
    const fillFrac = (t / 4000) % 1;
    const nShow = Math.max(1, Math.round(fillFrac * tiles.length));
    tiles.slice(0, nShow).forEach((it, i) => {
      const cx = rdd.x + 12 + (i % cols) * 34;
      const cy = rdd.y + 16 + Math.floor(i / cols) * 30;
      thumb(ctx, cx, cy, it.tile, 26);
    });

    // DStream timeline of RDDs
    const ty = 210;
    text(ctx, 14, ty - 8, "DStream = discretized series of RDDs over time", p.text, 10);
    const labels = ["t-2", "t-1", "t", "t+1", "t+2"];
    labels.forEach((lb, i) => {
      const bx = 20 + i * 84;
      const active = i === 2;
      node(ctx, bx, ty, 70, 50, active);
      text(ctx, bx + 8, ty + 30, `RDD@${lb}`, active ? SPARK : p.dim, 9, active ? "600" : "400");
      if (i < labels.length - 1) text(ctx, bx + 74, ty + 30, "→", rgba(SPARK, 0.6), 12);
    });
  }

  // ---- step 3: partition --------------------------------------------------
  function drawPartition(ctx: CanvasRenderingContext2D, t: number) {
    const p = palette();
    const ex = st.current.executors;
    const bs = st.current.batchSize;
    const rdd = { x: 14, y: 110, w: 130, h: 90 };
    node(ctx, rdd.x, rdd.y, rdd.w, rdd.h, true);
    text(ctx, rdd.x + 10, rdd.y + 18, "RDD", SPARK, 11);
    text(ctx, rdd.x + 10, rdd.y + 32, `${bs} records`, p.dim, 9, "400");
    const tiles = displayTiles(Math.min(bs, 6));
    tiles.forEach((it, i) => thumb(ctx, rdd.x + 12 + (i % 3) * 24, rdd.y + 44 + Math.floor(i / 3) * 24, it.tile, 20));

    const exX = FW - 150;
    const top = 30;
    const boxH = 46;
    const gap = ex > 1 ? (FH - top * 2 - boxH) / (ex - 1) : 0;
    for (let e = 0; e < ex; e++) {
      const ey = ex === 1 ? FH / 2 - boxH / 2 : top + e * gap;
      node(ctx, exX, ey, 138, boxH, true);
      text(ctx, exX + 10, ey + 18, `executor ${e + 1}`, p.text, 9);
      text(ctx, exX + 10, ey + 33, `partition ${e + 1}`, p.dim, 8, "400");
      // edge
      ctx.strokeStyle = rgba(SPARK, 0.3);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rdd.x + rdd.w, rdd.y + rdd.h / 2);
      ctx.lineTo(exX, ey + boxH / 2);
      ctx.stroke();
    }
    // tokens routed to partitions by index % ex
    const allTiles = displayTiles(Math.min(bs, 9));
    const period = 3600;
    allTiles.forEach((it, i) => {
      const e = i % ex;
      const ey = ex === 1 ? FH / 2 : top + e * gap + boxH / 2;
      const frac = (t / period + i / allTiles.length) % 1;
      const sx = rdd.x + rdd.w;
      const sy = rdd.y + rdd.h / 2;
      const x = sx + frac * (exX - sx) - 7;
      const y = sy + frac * (ey - sy) - 7;
      thumb(ctx, x, y, it.tile, 14);
    });
    text(ctx, 14, FH - 12, `record k → executor (k mod ${ex}) · parallel partitions`, SPARK, 10);
  }

  // ---- step 4: featurize --------------------------------------------------
  function drawMap(ctx: CanvasRenderingContext2D) {
    const p = palette();
    const fs = feat.current;
    if (!fs) return;
    const y0 = 70;
    const size = 96;
    // original image
    const ix = 20;
    thumb(ctx, ix, y0, fs.tile, size);
    ctx.strokeStyle = p.stroke;
    ctx.strokeRect(ix - 0.5, y0 - 0.5, size + 1, size + 1);
    text(ctx, ix, y0 - 10, "32×32 image", p.text, 10);
    text(ctx, ix, y0 + size + 16, CIFAR_CLASSES[fs.label], p.dim, 9, "400");

    arrow(ctx, ix + size + 8, y0 + size / 2, ix + size + 36, y0 + size / 2);

    // pooled 16x16 grid
    const px = ix + size + 44;
    const out = 16;
    const cell = size / out;
    for (let oy = 0; oy < out; oy++)
      for (let ox = 0; ox < out; ox++) {
        const o = (oy * out + ox) * 3;
        ctx.fillStyle = `rgb(${(fs.pooled[o] * 255) | 0},${(fs.pooled[o + 1] * 255) | 0},${(fs.pooled[o + 2] * 255) | 0})`;
        ctx.fillRect(px + ox * cell, y0 + oy * cell, cell + 0.5, cell + 0.5);
      }
    ctx.strokeStyle = p.stroke;
    ctx.strokeRect(px - 0.5, y0 - 0.5, size + 1, size + 1);
    text(ctx, px, y0 - 10, "avg-pool 16×16", p.text, 10);

    arrow(ctx, px + size + 8, y0 + size / 2, px + size + 36, y0 + size / 2);

    // standardized feature bars
    const bx = px + size + 44;
    const bw = FW - bx - 14;
    const nBars = Math.min(48, fs.std.length - 1);
    const barW = bw / nBars;
    const midY = y0 + size / 2;
    ctx.strokeStyle = rgba(p.text === "#3f3f46" ? "#3f3f46" : "#a1a1aa", 0.25);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx, midY);
    ctx.lineTo(bx + bw, midY);
    ctx.stroke();
    for (let i = 0; i < nBars; i++) {
      const v = Math.max(-3, Math.min(3, fs.std[i]));
      const h = (v / 3) * (size / 2);
      ctx.fillStyle = v >= 0 ? SPARK : BLUE;
      ctx.fillRect(bx + i * barW, midY - Math.max(0, h), Math.max(1, barW - 1), Math.abs(h));
    }
    text(ctx, bx, y0 - 10, "standardize · 768-d (+bias)", p.text, 10);
    text(ctx, 20, FH - 12, "map: one image → one standardized feature vector", SPARK, 10);
  }

  // ---- step 5: reduce / SGD ----------------------------------------------
  function drawReduce(ctx: CanvasRenderingContext2D, t: number) {
    const p = palette();
    const ex = st.current.executors;
    const md = model.current;
    const driver = { x: FW - 210, y: 40, w: 196, h: 150 };
    // executors emitting gradients
    const top = 40;
    const boxH = 40;
    const gap = ex > 1 ? (FH - 90 - top - boxH) / (ex - 1) : 0;
    for (let e = 0; e < ex; e++) {
      const ey = ex === 1 ? 120 : top + e * gap;
      node(ctx, 14, ey, 120, boxH);
      text(ctx, 24, ey + 16, `executor ${e + 1}`, p.text, 9);
      text(ctx, 24, ey + 30, "∂L/∂W (partial)", p.dim, 8, "400");
      ctx.strokeStyle = rgba(SPARK, 0.3);
      ctx.beginPath();
      ctx.moveTo(134, ey + boxH / 2);
      ctx.lineTo(driver.x, driver.y + driver.h / 2);
      ctx.stroke();
      // gradient token
      const frac = (t / 3000 + e / ex) % 1;
      const x = 134 + frac * (driver.x - 134);
      const y = ey + boxH / 2 + frac * (driver.y + driver.h / 2 - (ey + boxH / 2));
      ctx.fillStyle = SPARK;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // driver + weight heatmap
    node(ctx, driver.x, driver.y, driver.w, driver.h, true);
    text(ctx, driver.x + 12, driver.y + 18, "driver: reduce ∇", SPARK, 10);
    text(ctx, driver.x + 12, driver.y + 32, "W ← W − lr·∇", p.dim, 9, "400");
    if (md) {
      const rows = 10;
      const cols = 24;
      const gx = driver.x + 12;
      const gy = driver.y + 42;
      const cw = (driver.w - 24) / cols;
      const ch = 7;
      let maxAbs = 1e-6;
      for (let i = 0; i < md.W.length; i++) maxAbs = Math.max(maxAbs, Math.abs(md.W[i]));
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const j = Math.floor((c / cols) * (md.d - 1));
          const v = md.W[r * md.d + j] / maxAbs;
          ctx.fillStyle = v >= 0 ? rgba(SPARK, 0.15 + Math.abs(v) * 0.85) : rgba(BLUE, 0.15 + Math.abs(v) * 0.85);
          ctx.fillRect(gx + c * cw, gy + r * (ch + 1), cw - 0.5, ch);
        }
      text(ctx, gx, gy + rows * (ch + 1) + 12, "W: 10 classes × 769", p.dim, 8, "400");
    }
    // softmax probabilities for the featurize sample
    const fs = feat.current;
    if (md && fs) {
      const probs = md.probs(fs.std);
      const bx = 150;
      const by = FH - 66;
      const bw = FW - bx - 14;
      const barW = bw / 10;
      text(ctx, bx, by - 8, `softmax P(class) for a "${CIFAR_CLASSES[fs.label]}"`, p.text, 9);
      for (let c = 0; c < 10; c++) {
        const h = probs[c] * 46;
        ctx.fillStyle = c === fs.label ? "#4ade80" : rgba(SPARK, 0.6);
        ctx.fillRect(bx + c * barW, by + 46 - h, barW - 2, h);
        text(ctx, bx + c * barW, by + 58, ABBR[c], p.dim, 7, "400");
      }
    }
    text(ctx, 14, FH - 10, "one micro-batch = one SGD step on the driver", SPARK, 10);
  }

  // ---- step 6: evaluate ---------------------------------------------------
  function drawEvaluate(ctx: CanvasRenderingContext2D) {
    const p = palette();
    const hist = history.current;
    // accuracy curve (top)
    const x0 = 40, x1 = FW - 12, y0 = 128, y1 = 14;
    const maxAcc = Math.max(0.5, ...hist);
    const yTop = Math.min(1, maxAcc + 0.08);
    const yv = (v: number) => y0 - (v / yTop) * (y0 - y1);
    ctx.strokeStyle = rgba(p.text === "#3f3f46" ? "#3f3f46" : "#a1a1aa", 0.25);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, y1);
    ctx.lineTo(x0, y0);
    ctx.lineTo(x1, y0);
    ctx.stroke();
    [0.25, 0.5, 0.75, 1].forEach((gLine) => {
      if (gLine > yTop) return;
      const yy = yv(gLine);
      ctx.strokeStyle = rgba("#94a3b8", 0.1);
      ctx.beginPath();
      ctx.moveTo(x0, yy);
      ctx.lineTo(x1, yy);
      ctx.stroke();
      text(ctx, 12, yy + 3, `${Math.round(gLine * 100)}`, p.dim, 8, "400");
    });
    // chance line
    const yc = yv(0.1);
    ctx.strokeStyle = rgba("#94a3b8", 0.4);
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x0, yc);
    ctx.lineTo(x1, yc);
    ctx.stroke();
    ctx.setLineDash([]);
    if (hist.length > 1) {
      ctx.strokeStyle = SPARK;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      hist.forEach((v, i) => {
        const xx = x0 + (i / (hist.length - 1)) * (x1 - x0);
        i === 0 ? ctx.moveTo(xx, yv(v)) : ctx.lineTo(xx, yv(v));
      });
      ctx.stroke();
    }
    text(ctx, x0 + 6, y1 + 10, `test accuracy ${(acc * 100).toFixed(1)}%`, accentText, 11);

    // confusion matrix (bottom-left)
    const conf = confusion.current;
    if (conf.length === 10) {
      const pad = 16, cell = 11, cx = 30, cy = 160;
      ctx.font = "7px ui-monospace, monospace";
      for (let r = 0; r < 10; r++) {
        const rowSum = conf[r].reduce((a, b) => a + b, 0) || 1;
        ctx.fillStyle = rgba("#94a3b8", 0.8);
        ctx.fillText(ABBR[r], cx - 15, cy + pad + r * cell + cell - 3);
        ctx.fillText(ABBR[r], cx + pad + r * cell + 1, cy + pad - 4);
        for (let c = 0; c < 10; c++) {
          const v = conf[r][c] / rowSum;
          ctx.fillStyle = r === c ? rgba("#4ade80", 0.15 + v * 0.85) : rgba(SPARK, v * 0.9);
          ctx.fillRect(cx + pad + c * cell, cy + pad + r * cell, cell - 1, cell - 1);
        }
      }
      text(ctx, cx - 15, cy + pad + 10 * cell + 14, "confusion · truth rows", p.dim, 8, "400");
    }

    // incoming batch strip (bottom-right)
    const items = batch.current.slice(0, 8);
    const sx = 250, sy = 176, s = 34;
    text(ctx, sx, sy - 8, "latest micro-batch", p.text, 9);
    items.forEach((it, i) => {
      const x = sx + (i % 4) * (s + 6);
      const y = sy + Math.floor(i / 4) * (s + 20);
      thumb(ctx, x, y, it.tile, s);
      ctx.strokeStyle = it.ok ? "#4ade80" : "#f87171";
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 0.5, y - 0.5, s, s);
      text(ctx, x, y + s + 12, ABBR[it.pred], it.ok ? "#4ade80" : "#f87171", 8, "600");
    });
    if (!items.length) text(ctx, sx, sy + 24, "press play to stream", p.dim, 9, "400");
  }

  function arrow(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
    ctx.strokeStyle = rgba(SPARK, 0.7);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - 6, y1 - 4);
    ctx.lineTo(x1 - 6, y1 + 4);
    ctx.closePath();
    ctx.fillStyle = rgba(SPARK, 0.7);
    ctx.fill();
  }

  const s = STEPS[step];
  const atEnd = step >= STEPS.length - 1;

  return (
    <LiveDemo
      title="Spark Streaming — CIFAR-10 classifier"
      subtitle="A browser re-enactment of the project flow: bundled CIFAR-10 samples feed modeled micro-batches and executor stages while a local softmax classifier trains live. Apache Spark itself is not running."
      repoUrl={REPO}
      accent={SPARK}
      embedded={embedded}
      {...cardProps("cifar")}
    >
      {/* controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPlaying((v) => !v)}
          disabled={!ready}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-medium text-ink-900 transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ background: SPARK }}
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? "pause" : atEnd ? "resume stream" : "play walkthrough"}
        </button>
        <button
          onClick={reset}
          disabled={!ready}
          aria-label="Reset the stream and model"
          title="reset"
          className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:text-zinc-200 disabled:opacity-40"
          style={{ borderColor: "rgb(var(--line) / 0.12)" }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex items-center gap-1">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-wide text-zinc-500">micro-batch</span>
            {BATCH_SIZES.map((b) => (
              <button
                key={b}
                onClick={() => setBatchSize(b)}
                aria-pressed={batchSize === b}
                className="rounded px-2 py-1 font-mono text-[10px]"
                style={{
                  background: batchSize === b ? rgba(SPARK, 0.15) : "transparent",
                  color: batchSize === b ? accentText : "rgb(var(--zinc-500))",
                  border: `1px solid ${batchSize === b ? rgba(SPARK, 0.4) : "rgb(var(--line) / 0.12)"}`,
                }}
              >
                {b}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-wide text-zinc-500">executors</span>
            {[2, 3, 4].map((e) => (
              <button
                key={e}
                onClick={() => setExecutors(e)}
                aria-pressed={executors === e}
                className="rounded px-2 py-1 font-mono text-[10px]"
                style={{
                  background: executors === e ? rgba(SPARK, 0.15) : "transparent",
                  color: executors === e ? accentText : "rgb(var(--zinc-500))",
                  border: `1px solid ${executors === e ? rgba(SPARK, 0.4) : "rgb(var(--line) / 0.12)"}`,
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* step pipeline */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((stp, i) => (
          <div key={stp.key} className="flex items-center">
            <button
              onClick={() => {
                setPlaying(false);
                setStep(i);
              }}
              aria-pressed={i === step}
              className="whitespace-nowrap rounded-md px-2 py-1 font-mono text-[10px] transition-colors"
              style={{
                background: i === step ? rgba(SPARK, 0.15) : "transparent",
                color: i === step ? accentText : "rgb(var(--zinc-500))",
                border: `1px solid ${i === step ? rgba(SPARK, 0.4) : "rgb(var(--line) / 0.1)"}`,
              }}
            >
              {i + 1}. {stp.title}
            </button>
            {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 flex-shrink-0 text-zinc-700" />}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {/* explanation */}
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
            <span style={{ color: accentText }}>{s.module}</span>
            <ChevronRight className="h-3 w-3 text-zinc-600" />
            <span className="text-zinc-400">step {step + 1}/{STEPS.length}</span>
          </div>
          <h3 className="text-base font-semibold text-zinc-100">{s.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-zinc-500">
            <span className="rounded px-1.5 py-0.5" style={{ background: rgba(SPARK, 0.12), color: accentText }}>
              {s.op}
            </span>
            <span>
              batch {batchSize} · {executors} executors · seen {processed.toLocaleString()} · acc {(acc * 100).toFixed(1)}%
              {epoch > 0 ? ` · epoch ${epoch}` : ""}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-300">{s.summary}</p>
          <ul className="mt-3 space-y-1.5">
            {s.what.map((w, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-zinc-400">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full" style={{ background: SPARK }} />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* visualization */}
        <div className="flex flex-col">
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
            visualization <span className="ml-1 text-zinc-600">· computed live</span>
          </div>
          <div
            ref={vizRef}
            className="flex-1 overflow-hidden rounded-lg border bg-ink-900 p-2"
            style={{ borderColor: "rgb(var(--line) / 0.12)" }}
          >
            {loadError ? (
              <div className="flex h-48 flex-col items-center justify-center gap-3 text-center" role="alert">
                <p className="font-mono text-xs text-zinc-400">{loadError}</p>
                <button type="button" onClick={() => setLoadAttempt((value) => value + 1)} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 font-mono text-xs" style={{ borderColor: rgba(SPARK, 0.4), color: accentText }}>
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Retry sample
                </button>
              </div>
            ) : ready ? (
              <canvas
                ref={canvas}
                role="img"
                aria-label={`Step ${step + 1} of ${STEPS.length}: ${s.title}. ${s.summary}`}
                className="mx-auto block w-full"
                style={{ maxWidth: 820 }}
              />
            ) : (
              <div className="flex h-48 items-center justify-center font-mono text-xs text-zinc-500">
                loading CIFAR-10 sample…
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 font-mono text-[10px] leading-relaxed text-zinc-600">
        The diagram animates Spark&apos;s distributed execution to show how the system is built; the model itself
        trains single-threaded in your browser. Real CIFAR-10 thumbnails (bundled sprite), 16×16 average-pooled +
        standardised features, softmax trained via mini-batch SGD on a train split and scored on a held-out test
        split each batch. A linear model on pooled pixels tops out well below deep nets — the point is the streaming
        behaviour and batch-size effect, exactly what the Spark project measured.
      </p>
    </LiveDemo>
  );
}

export function CifarSparkLab() {
  return <CifarSparkDemo embedded />;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
