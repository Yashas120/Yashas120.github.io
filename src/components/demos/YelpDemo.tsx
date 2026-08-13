"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { ChevronRight, Crosshair, Minus as MinusIcon, Plus as PlusIcon } from "lucide-react";
import { LiveDemo } from "./LiveDemo";
import { useOnScreen, usePrefersReducedMotion } from "./bitcoin/parts";
import {
  CITY_NAME,
  FEATURES,
  NEIGHBORHOODS,
  TOPICS,
  accuracy,
  contributions,
  generateSample,
  predictOpen,
  trainLogistic,
  type Row,
} from "@/lib/demos/yelp";
import { cardProps } from "@/data/demos";

const REPO = "https://github.com/Yashas120/Restaurant-analysis-using-YELP-dataset";
const ACC = "#f43f5e"; // rose
const FW = 520;
const FH = 260;
const MAP_H = 360;
const TILE = 256;

// Web Mercator projection (world pixels at a given zoom)
const projX = (lng: number, z: number) => ((lng + 180) / 360) * Math.pow(2, z) * TILE;
const projY = (lat: number, z: number) => {
  const s = Math.sin((lat * Math.PI) / 180);
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * Math.pow(2, z) * TILE;
};
const xLng = (x: number, z: number) => (x / (Math.pow(2, z) * TILE)) * 360 - 180;
const yLat = (y: number, z: number) => {
  const n = Math.pow(2, z) * TILE;
  const g = Math.PI - (2 * Math.PI * y) / n;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(g) - Math.exp(-g)));
};
interface View { lat: number; lng: number; z: number; }

type MapPoint = { lat: number; lng: number };

// A small, local vector basemap keeps the project map reliable on static hosts
// and in browsers that block third-party map tiles. Coordinates describe only
// the illustrative demo extent; they are not a geographic data product.
const COASTLINE: readonly MapPoint[] = [
  { lat: 34.397, lng: -119.755 },
  { lat: 34.399, lng: -119.736 },
  { lat: 34.403, lng: -119.716 },
  { lat: 34.405, lng: -119.696 },
  { lat: 34.409, lng: -119.675 },
] as const;

const ARTERIALS: readonly (readonly MapPoint[])[] = [
  [
    { lat: 34.406, lng: -119.755 },
    { lat: 34.412, lng: -119.731 },
    { lat: 34.418, lng: -119.708 },
    { lat: 34.425, lng: -119.676 },
  ],
  [
    { lat: 34.444, lng: -119.742 },
    { lat: 34.433, lng: -119.727 },
    { lat: 34.420, lng: -119.704 },
    { lat: 34.408, lng: -119.686 },
  ],
  [
    { lat: 34.398, lng: -119.724 },
    { lat: 34.414, lng: -119.713 },
    { lat: 34.432, lng: -119.700 },
    { lat: 34.444, lng: -119.691 },
  ],
] as const;

const MODES = [
  { key: "risk", title: "Closure risk" },
  { key: "explore", title: "Data explorer" },
  { key: "map", title: "City map" },
  { key: "topics", title: "Review topics (LDA)" },
];
const NUM_KEYS = ["checkins", "reviews", "stars", "price"];

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
const featLabel = (k: string) => FEATURES.find((f) => f.key === k)?.label ?? k;

export function YelpDemo({ embedded = false }: Readonly<{ embedded?: boolean }> = {}) {
  const light = useIsLight();
  usePrefersReducedMotion();
  const accentText = light ? "#be123c" : ACC;

  const sample = useMemo(() => generateSample(), []);
  const model = useMemo(() => trainLogistic(sample), [sample]);
  const acc = useMemo(() => accuracy(model, sample), [model, sample]);

  const [mode, setMode] = useState(0);
  const [xKey, setXKey] = useState("checkins");
  const [yKey, setYKey] = useState("stars");
  const [mapColor, setMapColor] = useState<"status" | "risk">("status");
  const [mapActive, setMapActive] = useState(false);
  const [view, setView] = useState<View>({ lat: 34.4208, lng: -119.6982, z: 14 });
  const [hover, setHover] = useState<{ idx: number; x: number; y: number } | null>(null);
  const [row, setRow] = useState<Row>({
    checkins: 30,
    reviews: 120,
    stars: 3.5,
    price: 2,
    reservations: 1,
    delivery: 1,
    outdoor: 0,
    groups: 1,
  });

  const st = useRef({ mode, row, xKey, yKey, light, mapColor, view, hoverIdx: -1 });
  st.current = { mode, row, xKey, yKey, light, mapColor, view, hoverIdx: hover?.idx ?? -1 };
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ sx: number; sy: number; cx: number; cy: number } | null>(null);
  const fitted = useRef(false);

  // Only animate while the demo is actually on screen (see useOnScreen).
  const onScreen = useOnScreen(canvas);
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

  // A tab can replace the observed canvas before IntersectionObserver reports
  // again (most noticeably on narrow screens). Draw the map once immediately
  // for every relevant state change, and redraw when its container is resized.
  useEffect(() => {
    if (mode !== 2) return;
    let frame = 0;
    const redraw = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(drawMap);
    };
    redraw();

    const cv = canvas.current;
    const observer = cv && typeof ResizeObserver !== "undefined" ? new ResizeObserver(redraw) : null;
    if (cv) observer?.observe(cv);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, view, mapColor, light]);

  // fit the view to all restaurants the first time the map is shown
  function fitView() {
    const cv = canvas.current;
    const w = cv?.clientWidth || FW;
    const lats = sample.rows.map((r) => r.lat);
    const lngs = sample.rows.map((r) => r.lng);
    const latMin = Math.min(...lats), latMax = Math.max(...lats);
    const lngMin = Math.min(...lngs), lngMax = Math.max(...lngs);
    let z = 18;
    for (; z > 3; z--) {
      const sx = projX(lngMax, z) - projX(lngMin, z);
      const sy = projY(latMin, z) - projY(latMax, z);
      if (sx <= w - 60 && sy <= MAP_H - 60) break;
    }
    setView({ lat: (latMin + latMax) / 2, lng: (lngMin + lngMax) / 2, z });
  }
  useEffect(() => {
    if (mode === 2 && !fitted.current) {
      fitted.current = true;
      requestAnimationFrame(fitView);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // cursor-anchored wheel zoom (needs a non-passive listener)
  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const onWheel = (e: WheelEvent) => {
      if (MODES[st.current.mode].key !== "map" || !mapActive) return;
      e.preventDefault();
      const rect = cv.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const { lat, lng, z } = st.current.view;
      const nz = Math.max(3, Math.min(18, z + (e.deltaY < 0 ? 1 : -1)));
      if (nz === z) return;
      const w = cv.clientWidth, h = MAP_H;
      const worldX = projX(lng, z) - w / 2 + mx;
      const worldY = projY(lat, z) - h / 2 + my;
      const ptLng = xLng(worldX, z), ptLat = yLat(worldY, z);
      const ncX = projX(ptLng, nz) - (mx - w / 2);
      const ncY = projY(ptLat, nz) - (my - h / 2);
      setView({ lat: yLat(ncY, nz), lng: xLng(ncX, nz), z: nz });
    };
    cv.addEventListener("wheel", onWheel, { passive: false });
    return () => cv.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapActive, mode]);

  function pickMarker(mx: number, my: number): number {
    const cv = canvas.current;
    if (!cv) return -1;
    const { lat, lng, z } = st.current.view;
    const w = cv.clientWidth, h = MAP_H;
    const tlX = projX(lng, z) - w / 2, tlY = projY(lat, z) - h / 2;
    let best = -1, bd = 10;
    sample.rows.forEach((r, i) => {
      const d = Math.hypot(projX(r.lng, z) - tlX - mx, projY(r.lat, z) - tlY - my);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }
  function onDown(e: ReactPointerEvent) {
    if (!mapActive) return;
    if (MODES[st.current.mode].key !== "map") return;
    const cv = canvas.current!;
    cv.setPointerCapture(e.pointerId);
    const { lat, lng, z } = st.current.view;
    drag.current = { sx: e.clientX, sy: e.clientY, cx: projX(lng, z), cy: projY(lat, z) };
    setHover(null);
  }
  function onMove(e: ReactPointerEvent) {
    if (!mapActive) return;
    const cv = canvas.current;
    if (!cv) return;
    if (drag.current) {
      const z = st.current.view.z;
      const nx = drag.current.cx - (e.clientX - drag.current.sx);
      const ny = drag.current.cy - (e.clientY - drag.current.sy);
      setView((v) => ({ ...v, lng: xLng(nx, z), lat: yLat(ny, z) }));
    } else {
      const rect = cv.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const idx = pickMarker(mx, my);
      setHover(idx >= 0 ? { idx, x: mx, y: my } : null);
    }
  }
  function onUp(e: ReactPointerEvent) {
    if (drag.current) {
      canvas.current?.releasePointerCapture(e.pointerId);
      drag.current = null;
    }
  }
  const zoomBy = (d: number) => setView((v) => ({ ...v, z: Math.max(3, Math.min(18, v.z + d)) }));

  const openP = predictOpen(model, row);
  const risk = 1 - openP;

  // ------------------------------ drawing ----------------------------------
  function fit(h = FH): CanvasRenderingContext2D | null {
    const cv = canvas.current;
    if (!cv) return null;
    const cssW = cv.clientWidth || FW;
    const scale = cssW / FW;
    const dpr = window.devicePixelRatio || 1;
    const nw = Math.round(cssW * dpr);
    const nh = Math.round(h * scale * dpr);
    if (cv.width !== nw || cv.height !== nh) {
      cv.width = nw;
      cv.height = nh;
      cv.style.height = `${h * scale}px`;
    }
    const ctx = cv.getContext("2d")!;
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.clearRect(0, 0, FW, h);
    return ctx;
  }
  function pal() {
    const lt = st.current.light;
    return {
      text: lt ? "#3f3f46" : "#a1a1aa",
      dim: "#71717a",
      grid: lt ? "rgba(9,9,11,0.1)" : "rgba(255,255,255,0.08)",
    };
  }
  function label(ctx: CanvasRenderingContext2D, x: number, y: number, s: string, c: string, size = 11, w = "600") {
    ctx.fillStyle = c;
    ctx.font = `${w} ${size}px ui-monospace, monospace`;
    ctx.fillText(s, x, y);
  }

  function draw() {
    const key = MODES[st.current.mode].key;
    if (key === "map") {
      drawMap();
      return;
    }
    const ctx = fit();
    if (!ctx) return;
    if (key === "explore") drawScatter(ctx);
    else drawGauge(ctx);
  }

  function drawGauge(ctx: CanvasRenderingContext2D) {
    const p = pal();
    const r = 1 - predictOpen(model, st.current.row);
    const cx = FW / 2, cy = 168, R = 110;
    // colored arc in segments (green → red)
    const seg = 60;
    for (let i = 0; i < seg; i++) {
      const a0 = Math.PI + (i / seg) * Math.PI;
      const a1 = Math.PI + ((i + 1) / seg) * Math.PI;
      const tcol = i / seg; // 0 low risk (green) → 1 high risk (red)
      const col = tcol < 0.5 ? mix("#4ade80", "#fbbf24", tcol * 2) : mix("#fbbf24", "#f87171", (tcol - 0.5) * 2);
      ctx.strokeStyle = col;
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.arc(cx, cy, R, a0, a1);
      ctx.stroke();
    }
    // needle
    const ang = Math.PI + r * Math.PI;
    ctx.strokeStyle = p.text;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(ang) * (R - 6), cy + Math.sin(ang) * (R - 6));
    ctx.stroke();
    ctx.fillStyle = p.text;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
    // labels
    label(ctx, cx - R - 4, cy + 18, "safe", "#4ade80", 10, "600");
    label(ctx, cx + R - 20, cy + 18, "risk", "#f87171", 10, "600");
    const col = r < 0.4 ? "#4ade80" : r < 0.65 ? "#fbbf24" : "#f87171";
    label(ctx, cx - 44, cy - 34, `${(r * 100).toFixed(0)}%`, col, 40);
    label(ctx, cx - 60, cy + 44, `closure risk · P(open)=${(1 - r).toFixed(2)}`, p.dim, 11, "400");
    label(ctx, 12, 20, `logistic model · test-style acc ${(acc * 100).toFixed(0)}%`, p.text, 10, "400");
  }

  function drawScatter(ctx: CanvasRenderingContext2D) {
    const p = pal();
    const xk = st.current.xKey, yk = st.current.yKey;
    const xs = sample.rows.map((r) => r[xk]).concat(st.current.row[xk]);
    const ys = sample.rows.map((r) => r[yk]).concat(st.current.row[yk]);
    const xmin = Math.min(...xs), xmax = Math.max(...xs);
    const ymin = Math.min(...ys), ymax = Math.max(...ys);
    const padL = 44, padB = 34, padT = 16, padR = 12;
    const X = (v: number) => padL + ((v - xmin) / (xmax - xmin || 1)) * (FW - padL - padR);
    const Y = (v: number) => FH - padB - ((v - ymin) / (ymax - ymin || 1)) * (FH - padB - padT);
    // axes
    ctx.strokeStyle = p.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, FH - padB);
    ctx.lineTo(FW - padR, FH - padB);
    ctx.stroke();
    label(ctx, FW / 2 - 30, FH - 8, featLabel(xk), p.dim, 10, "400");
    ctx.save();
    ctx.translate(12, FH / 2 + 30);
    ctx.rotate(-Math.PI / 2);
    label(ctx, 0, 0, featLabel(yk), p.dim, 10, "400");
    ctx.restore();
    // points
    sample.rows.forEach((r, i) => {
      ctx.fillStyle = sample.open[i] ? rgba("#4ade80", 0.7) : rgba("#f87171", 0.7);
      ctx.beginPath();
      ctx.arc(X(r[xk]), Y(r[yk]), 3.2, 0, Math.PI * 2);
      ctx.fill();
    });
    // your restaurant
    const rx = X(st.current.row[xk]), ry = Y(st.current.row[yk]);
    ctx.strokeStyle = ACC;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(rx, ry, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = ACC;
    ctx.beginPath();
    ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // legend
    label(ctx, FW - 130, padT + 6, "● open", "#4ade80", 10, "600");
    label(ctx, FW - 130, padT + 20, "● closed", "#f87171", 10, "600");
    label(ctx, FW - 130, padT + 34, "◎ you", ACC, 10, "600");
  }

  function drawVectorBasemap(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    tlX: number,
    tlY: number,
    z: number,
    lt: boolean,
  ) {
    const point = ({ lat, lng }: MapPoint) => ({ x: projX(lng, z) - tlX, y: projY(lat, z) - tlY });
    const road = (points: readonly MapPoint[], color: string, width: number) => {
      ctx.beginPath();
      points.forEach((item, index) => {
        const p = point(item);
        if (index === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    };

    ctx.fillStyle = lt ? "#edf0ea" : "#111820";
    ctx.fillRect(0, 0, w, h);

    // Neighborhood washes give the marker clusters a readable spatial frame.
    NEIGHBORHOODS.forEach((nb, index) => {
      const p = point(nb);
      const radius = Math.max(26, Math.min(105, Math.abs(projX(nb.lng + nb.spread, z) - projX(nb.lng, z)) * 2.4));
      ctx.fillStyle = lt
        ? index % 2 === 0 ? "rgba(244,63,94,0.055)" : "rgba(14,165,233,0.05)"
        : index % 2 === 0 ? "rgba(244,63,94,0.07)" : "rgba(56,189,248,0.06)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Procedural local streets stay aligned while panning and scale with zoom.
    const spacing = Math.max(30, Math.min(120, 52 * Math.pow(2, z - 14)));
    const ox = ((-tlX % spacing) + spacing) % spacing;
    const oy = ((-tlY % spacing) + spacing) % spacing;
    ctx.strokeStyle = lt ? "rgba(63,63,70,0.13)" : "rgba(226,232,240,0.11)";
    ctx.lineWidth = 1;
    for (let x = ox - spacing; x < w + spacing; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x - 16, 0);
      ctx.lineTo(x + 16, h);
      ctx.stroke();
    }
    for (let y = oy - spacing; y < h + spacing; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y + 10);
      ctx.lineTo(w, y - 10);
      ctx.stroke();
    }

    // Draw a visible coastline and water band without relying on a tile CDN.
    const coast = COASTLINE.map(point);
    ctx.beginPath();
    coast.forEach((p, index) => index === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.lineTo(coast[coast.length - 1].x + w, h + 80);
    ctx.lineTo(coast[0].x - w, h + 80);
    ctx.closePath();
    ctx.fillStyle = lt ? "#cfe8ee" : "#0b2935";
    ctx.fill();
    road(COASTLINE, lt ? "rgba(8,145,178,0.55)" : "rgba(56,189,248,0.5)", 2);

    // Major corridors sit above the local grid and provide map-like structure.
    ARTERIALS.forEach((path) => {
      road(path, lt ? "rgba(255,255,255,0.9)" : "rgba(8,9,12,0.8)", 7);
      road(path, lt ? "rgba(113,113,122,0.48)" : "rgba(161,161,170,0.42)", 2);
    });

    ctx.textAlign = "right";
    label(ctx, w - 8, h - 8, "built-in vector basemap", lt ? "rgba(24,24,27,0.62)" : "rgba(255,255,255,0.58)", 8, "500");
    ctx.textAlign = "left";
  }

  // Local vector basemap with restaurants projected through Web Mercator.
  function drawMap() {
    const cv = canvas.current;
    if (!cv) return;
    const lt = st.current.light;
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth || FW;
    const h = MAP_H;
    const nw = Math.round(w * dpr), nh = Math.round(h * dpr);
    if (cv.width !== nw || cv.height !== nh) {
      cv.width = nw;
      cv.height = nh;
      cv.style.height = `${h}px`;
    }
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = lt ? "#e6e6ea" : "#0c0c0e";
    ctx.fillRect(0, 0, w, h);

    const { lat, lng, z } = st.current.view;
    const tlX = projX(lng, z) - w / 2;
    const tlY = projY(lat, z) - h / 2;
    drawVectorBasemap(ctx, w, h, tlX, tlY, z, lt);

    // neighborhood labels at their real centroids
    ctx.textAlign = "center";
    NEIGHBORHOODS.forEach((nb) => {
      const mx = projX(nb.lng, z) - tlX, my = projY(nb.lat, z) - tlY;
      if (mx < -60 || mx > w + 60 || my < 0 || my > h) return;
      label(ctx, mx, my - 24, nb.name, lt ? "rgba(24,24,27,0.8)" : "rgba(255,255,255,0.72)", 9, "700");
    });
    ctx.textAlign = "left";

    // restaurants
    const byRisk = st.current.mapColor === "risk";
    sample.rows.forEach((r, i) => {
      const mx = projX(r.lng, z) - tlX, my = projY(r.lat, z) - tlY;
      if (mx < -12 || mx > w + 12 || my < -12 || my > h + 12) return;
      const rad = 3 + Math.min(4, Math.max(0, Math.log10(r.reviews) - 0.4));
      let col: string;
      if (byRisk) {
        const rk = 1 - predictOpen(model, r);
        col = rk < 0.5 ? mix("#4ade80", "#fbbf24", rk * 2) : mix("#fbbf24", "#f87171", (rk - 0.5) * 2);
      } else {
        col = sample.open[i] ? "#22c55e" : "#ef4444";
      }
      const hovered = st.current.hoverIdx === i;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(mx, my, hovered ? rad + 2 : rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = lt ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.55)";
      ctx.stroke();
      if (hovered) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = ACC;
        ctx.beginPath();
        ctx.arc(mx, my, rad + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

  }

  const contrib = contributions(model, row).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const maxC = Math.max(...contrib.map((c) => Math.abs(c.value)), 0.001);
  const m = MODES[mode];
  const hoodStats = NEIGHBORHOODS.map((nb, hi) => {
    let open = 0, closed = 0;
    sample.rows.forEach((r, i) => {
      if (r.hood === hi) {
        if (sample.open[i]) open++;
        else closed++;
      }
    });
    return { name: nb.name, open, closed };
  });

  return (
    <LiveDemo
      title="Yelp Restaurant Analysis — closure predictor"
      subtitle="A fictionalized educational scenario: a local logistic-regression model trains on seeded records, explains feature influence, and maps synthetic businesses. It makes no claim about any real restaurant."
      repoUrl={REPO}
      accent={ACC}
      embedded={embedded}
      {...cardProps("yelp")}
    >
      {/* mode tabs */}
      <div className="mb-4 flex items-center gap-1 overflow-x-auto pb-1">
        {MODES.map((mm, i) => (
          <div key={mm.key} className="flex items-center">
            <button
              onClick={() => setMode(i)}
              aria-pressed={i === mode}
              className="whitespace-nowrap rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors"
              style={{
                background: i === mode ? rgba(ACC, 0.15) : "transparent",
                color: i === mode ? accentText : "rgb(var(--zinc-500))",
                border: `1px solid ${i === mode ? rgba(ACC, 0.4) : "rgb(var(--line) / 0.1)"}`,
              }}
            >
              {mm.title}
            </button>
            {i < MODES.length - 1 && <ChevronRight className="h-3 w-3 flex-shrink-0 text-zinc-700" />}
          </div>
        ))}
      </div>

      {m.key === "topics" ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {TOPICS.map((t) => (
            <div key={t.name} className="rounded-lg border p-3" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-200">{t.name}</span>
                <span className="font-mono text-[10px]" style={{ color: t.openAssoc >= 0 ? "#4ade80" : "#f87171" }}>
                  {t.openAssoc >= 0 ? "+" : ""}
                  {t.openAssoc.toFixed(2)} → open
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {t.words.map((w) => (
                  <span key={w} className="rounded px-1.5 py-0.5 font-mono text-[10px] text-zinc-400" style={{ background: "rgb(var(--line) / 0.06)" }}>
                    {w}
                  </span>
                ))}
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgb(var(--line) / 0.08)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.abs(t.openAssoc) * 100}%`,
                    background: t.openAssoc >= 0 ? "#4ade80" : "#f87171",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : m.key === "map" ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-mono text-[11px] text-zinc-400">
              {CITY_NAME} · {sample.rows.length} synthetic restaurants · illustrative map
            </div>
            <div className="flex gap-1">
              {(["status", "risk"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setMapColor(c)}
                  className="rounded px-2 py-1 font-mono text-[10px] transition-colors"
                  style={{
                    background: mapColor === c ? rgba(ACC, 0.15) : "transparent",
                    color: mapColor === c ? accentText : "rgb(var(--zinc-400))",
                    border: `1px solid ${mapColor === c ? rgba(ACC, 0.4) : "rgb(var(--line) / 0.12)"}`,
                  }}
                >
                  {c === "status" ? "open / closed" : "predicted risk"}
                </button>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
            <canvas
              ref={canvas}
              role="img"
              aria-label={`Map of ${CITY_NAME} showing ${sample.rows.length} restaurants, coloured by ${
                mapColor === "status" ? "open or closed status" : "predicted closure risk"
              }. Marker size scales with review count.`}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerLeave={() => setHover(null)}
              className={`block w-full ${mapActive ? "touch-none cursor-grab active:cursor-grabbing" : "touch-pan-y"}`}
              style={{ height: MAP_H }}
            />
            {!mapActive && (
              <button type="button" onClick={() => setMapActive(true)} className="absolute inset-x-4 top-1/2 mx-auto min-h-11 w-fit -translate-y-1/2 rounded-md border px-4 font-mono text-[11px] shadow-lg" style={{ background: "rgb(var(--ink-900) / 0.94)", borderColor: rgba(ACC, 0.5), color: accentText }}>
                Activate map interactions
              </button>
            )}
            <div className="absolute right-2 top-2 flex flex-col gap-1">
              <MapBtn onClick={() => zoomBy(1)} label="zoom in"><PlusIcon className="h-3.5 w-3.5" /></MapBtn>
              <MapBtn onClick={() => zoomBy(-1)} label="zoom out"><MinusIcon className="h-3.5 w-3.5" /></MapBtn>
              <MapBtn onClick={fitView} label="recenter"><Crosshair className="h-3.5 w-3.5" /></MapBtn>
            </div>
            {hover && (
              <div
                className="pointer-events-none absolute z-10 rounded-md border px-2 py-1.5 font-mono text-[10px] shadow-lg"
                style={{
                  left: Math.min(hover.x + 12, (canvas.current?.clientWidth ?? FW) - 150),
                  top: Math.min(hover.y + 12, MAP_H - 60),
                  background: light ? "rgba(255,255,255,0.96)" : "rgba(9,9,11,0.94)",
                  borderColor: "rgb(var(--line) / 0.2)",
                }}
              >
                <div className="font-semibold" style={{ color: light ? "#18181b" : "#fafafa" }}>
                  {sample.names[hover.idx]}
                </div>
                <div className="text-zinc-400">
                  {sample.rows[hover.idx].stars.toFixed(1)}★ · {sample.rows[hover.idx].reviews} reviews
                </div>
                <div>
                  <span style={{ color: sample.open[hover.idx] ? "#22c55e" : "#ef4444" }}>
                    {sample.open[hover.idx] ? "open" : "closed"}
                  </span>
                  <span className="text-zinc-500"> · risk {((1 - predictOpen(model, sample.rows[hover.idx])) * 100).toFixed(0)}%</span>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
            {hoodStats.map((h) => (
              <div key={h.name} className="rounded-md border px-2 py-1.5" style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
                <div className="font-mono text-[10px] text-zinc-300">{h.name}</div>
                <div className="font-mono text-[10px] text-zinc-500">
                  <span className="text-green-400">{h.open}</span> open · <span className="text-red-400">{h.closed}</span> closed
                </div>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] leading-relaxed text-zinc-600">
            Fictional business identities and seeded educational records are placed over an illustrative map extent.
            After deliberate activation, drag to pan, use the +/− buttons to zoom, and hover a marker for details.
            Marker size scales with synthetic review count; predicted risk is not a claim about any real business.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* controls */}
          <div className="rounded-lg border p-4" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-wide text-zinc-500">your restaurant</div>
            <div className="space-y-2.5">
              {FEATURES.map((f) =>
                f.kind === "num" ? (
                  <div key={f.key}>
                    <div className="mb-0.5 flex items-center justify-between font-mono text-[11px]">
                      <span className="text-zinc-400">{f.label}</span>
                      <span className="text-zinc-200">
                        {f.key === "stars" ? row[f.key].toFixed(1) : Math.round(row[f.key])}
                        {f.unit ?? ""}
                      </span>
                    </div>
                    <input
                      aria-label={f.label}
                      type="range"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={row[f.key]}
                      onChange={(e) => setRow({ ...row, [f.key]: Number(e.target.value) })}
                      className="h-1 w-full cursor-pointer appearance-none rounded-full"
                      style={{ accentColor: ACC, background: "rgb(var(--line) / 0.15)" }}
                    />
                  </div>
                ) : (
                  <button
                    key={f.key}
                    onClick={() => setRow({ ...row, [f.key]: row[f.key] ? 0 : 1 })}
                    aria-pressed={Boolean(row[f.key])}
                    className="flex w-full items-center justify-between rounded-md border px-2.5 py-1.5 font-mono text-[11px] transition-colors"
                    style={{
                      borderColor: row[f.key] ? rgba(ACC, 0.4) : "rgb(var(--line) / 0.12)",
                      color: row[f.key] ? accentText : "rgb(var(--zinc-400))",
                      background: row[f.key] ? rgba(ACC, 0.1) : "transparent",
                    }}
                  >
                    {f.label}
                    <span>{row[f.key] ? "yes" : "no"}</span>
                  </button>
                ),
              )}
            </div>
            {m.key === "explore" && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <AxisSelect label="x-axis" value={xKey} onChange={setXKey} />
                <AxisSelect label="y-axis" value={yKey} onChange={setYKey} />
              </div>
            )}
          </div>

          {/* viz + contributions */}
          <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-lg border bg-ink-900 p-2" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
              <canvas ref={canvas} className="mx-auto block w-full" style={{ maxWidth: FW }} />
            </div>
            {m.key === "risk" && (
              <div className="rounded-lg border p-3" style={{ borderColor: "rgb(var(--line) / 0.12)" }}>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
                  what drives it · log-odds contribution
                </div>
                <div className="space-y-1.5">
                  {contrib.map((c) => {
                    const w = (Math.abs(c.value) / maxC) * 50;
                    const pos = c.value >= 0; // pushes toward OPEN
                    return (
                      <div key={c.key} className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="w-28 flex-shrink-0 text-right text-zinc-400">{featLabel(c.key)}</span>
                        <div className="relative flex h-3 flex-1 items-center">
                          <div className="absolute left-1/2 h-full w-px bg-zinc-700" />
                          <div
                            className="absolute h-2.5 rounded"
                            style={{
                              background: pos ? "#4ade80" : "#f87171",
                              width: `${w}%`,
                              left: pos ? "50%" : `${50 - w}%`,
                            }}
                          />
                        </div>
                        <span className="w-20 flex-shrink-0" style={{ color: pos ? "#4ade80" : "#f87171" }}>
                          {pos ? "↓ risk" : "↑ risk"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <p className="mt-3 font-mono text-[10px] leading-relaxed text-zinc-600">
        Mirrors the project&apos;s approach: check-in frequency and review signals drive an open-vs-closed classifier,
        and LDA surfaces the latent review topics that distinguish thriving from failing restaurants. The model is a
        real logistic regression trained live via gradient descent on a fictionalized, seeded educational sample;
        topic–outcome associations are illustrative and do not make claims about real businesses.
      </p>
    </LiveDemo>
  );
}

export function YelpLab() {
  return <YelpDemo embedded />;
}

function AxisSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-zinc-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border bg-transparent px-2 py-1 font-mono text-[11px] text-zinc-300"
        style={{ borderColor: "rgb(var(--line) / 0.12)" }}
      >
        {NUM_KEYS.map((k) => (
          <option key={k} value={k} className="bg-ink-900">
            {featLabel(k)}
          </option>
        ))}
      </select>
    </label>
  );
}

function MapBtn({ onClick, label, children }: { onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-7 w-7 items-center justify-center rounded-md border bg-ink-900/80 text-zinc-300 backdrop-blur transition-colors hover:text-zinc-100"
      style={{ borderColor: "rgb(var(--line) / 0.2)" }}
    >
      {children}
    </button>
  );
}

function mix(a: string, b: string, t: number): string {
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
