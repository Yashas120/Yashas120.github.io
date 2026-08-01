"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#fb7185";

export function MarkdownCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 px-3 py-3 sm:px-5">
      <div className="w-14 flex-shrink-0" />
      <div className="prose-invert min-w-0 flex-1 text-sm leading-relaxed text-zinc-300">{children}</div>
    </div>
  );
}

export function CodeCell({
  code,
  output,
  getExec,
}: {
  code: string[];
  output: React.ReactNode;
  getExec: () => number;
}) {
  const [exec, setExec] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);
  const getExecRef = useRef(getExec);
  getExecRef.current = getExec;
  const busyRef = useRef(false);

  const run = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setExec(null);
    // simulate an execution time (varies a little per cell so it feels organic)
    const delay = 850 + Math.random() * 700;
    setTimeout(() => {
      setExec(getExecRef.current());
      setBusy(false);
      busyRef.current = false;
    }, delay);
  };

  // Execute a cell once its top reaches the middle of the viewport. The last cells
  // near the page bottom can never reach the middle (you can't scroll far enough),
  // so also run any still-pending, visible cell once the page is scrolled to the end.
  useEffect(() => {
    const el = cellRef.current;
    if (!el) return;
    let ran = false;
    let io: IntersectionObserver | null = null;

    const cleanup = () => {
      io?.disconnect();
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };

    function check() {
      if (ran || !el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const topPassedMiddle = rect.top <= vh / 2;
      const doc = document.documentElement;
      const atBottom = window.scrollY + vh >= doc.scrollHeight - 4;
      const visible = rect.top < vh && rect.bottom > 0;
      if (topPassedMiddle || (atBottom && visible)) {
        ran = true;
        cleanup();
        run();
      }
    }

    io = new IntersectionObserver(check, { rootMargin: "-50% 0px -50% 0px", threshold: 0 });
    io.observe(el);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={cellRef} className="px-3 py-2 sm:px-5">
      {/* input */}
      <div className="flex gap-3">
        <div className="flex w-14 flex-shrink-0 flex-col items-end gap-1">
          <span className="font-mono text-[11px] text-zinc-500">
            In [{busy ? "*" : exec ?? " "}]:
          </span>
          <button
            onClick={run}
            aria-label="Run cell"
            className="rounded p-1 transition-colors hover:bg-line/10"
            style={{ color: ACCENT }}
          >
            <Play className="h-3.5 w-3.5" />
          </button>
        </div>
        <div
          className="min-w-0 flex-1 overflow-x-auto rounded-md border px-3 py-2 font-mono text-[12px] leading-relaxed"
          style={{ borderColor: hexToRgba(ACCENT, 0.2), background: "rgb(var(--code-bg))" }}
        >
          {code.map((line, i) => (
            <div key={i} className="flex gap-3">
              <span className="w-5 select-none text-right text-zinc-600">{i + 1}</span>
              <span style={{ color: line.trim().startsWith("#") ? "#65a30d" : "rgb(var(--code-fg))" }}>{line}</span>
            </div>
          ))}
        </div>
      </div>

      {/* output */}
      {exec !== null && !busy && (
        <div className="mt-1 flex gap-3">
          <span className="w-14 flex-shrink-0 text-right font-mono text-[11px] text-zinc-500">
            Out[{exec ?? ""}]:
          </span>
          <div className="min-w-0 flex-1 text-sm text-zinc-300">{output}</div>
        </div>
      )}
    </div>
  );
}
