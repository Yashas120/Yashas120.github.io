"use client";

import { useEffect, useState } from "react";
import { projects } from "@/data/projects";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#f59e0b";

// deterministic pseudo-timings so the waterfall looks real but stable
const rows = projects.map((p, i) => ({
  name: p.repoUrl ? p.repoUrl.replace("https://github.com/Yashas120/", "") : p.id,
  title: p.title,
  type: p.repoUrl ? "fetch" : "xhr",
  size: `${(12 + i * 7).toString()}.${(i * 3) % 9}kB`,
  start: i * 60,
  dur: 120 + ((i * 53) % 260),
  status: 200,
  domains: p.domains,
}));

export function NetworkPanel() {
  const [loaded, setLoaded] = useState(0);
  const maxEnd = Math.max(...rows.map((r) => r.start + r.dur));

  useEffect(() => {
    if (loaded >= rows.length) return;
    const id = setTimeout(() => setLoaded((l) => l + 1), 180);
    return () => clearTimeout(id);
  }, [loaded]);

  return (
    <div className="font-mono text-[12px]">
      <div className="flex items-center gap-4 border-b px-3 py-1.5 text-[11px] text-zinc-500" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>
        <span>Name</span>
        <span className="ml-auto">Status</span>
        <span className="w-16 text-right">Type</span>
        <span className="w-16 text-right">Size</span>
        <span className="w-40 text-right">Waterfall</span>
      </div>
      {rows.slice(0, loaded).map((r) => (
        <div key={r.name} className="flex items-center gap-4 border-b px-3 py-2 hover:bg-line/[0.03]" style={{ borderColor: "rgb(var(--line) / 0.04)" }}>
          <span className="min-w-0 truncate text-zinc-200" title={r.title}>{r.name}</span>
          <span className="ml-auto text-signal-green" style={{ color: "#4ade80" }}>{r.status}</span>
          <span className="w-16 text-right text-zinc-500">{r.type}</span>
          <span className="w-16 text-right text-zinc-500">{r.size}</span>
          <span className="w-40">
            <span className="relative block h-2 w-full rounded" style={{ background: "rgb(var(--line) / 0.05)" }}>
              <span
                className="absolute top-0 h-2 rounded"
                style={{
                  left: `${(r.start / maxEnd) * 100}%`,
                  width: `${(r.dur / maxEnd) * 100}%`,
                  background: ACCENT,
                  boxShadow: `0 0 6px ${hexToRgba(ACCENT, 0.6)}`,
                }}
              />
            </span>
          </span>
        </div>
      ))}
      <div className="px-3 py-2 text-[11px] text-zinc-500">
        {loaded}/{rows.length} requests · {loaded >= rows.length ? "Finish: all 200 OK" : "loading…"}
      </div>
    </div>
  );
}
