"use client";

import { useEffect, useMemo, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Stage, DownArrow, BTC, rgba, ByteGrid } from "./parts";
import { sha256Trace, sha256, utf8ToBytes, bytesToHex } from "@/lib/demos/bitcoin";

const REG = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

function bitDiff(a: string, b: string): number {
  let d = 0;
  for (let i = 0; i < a.length; i += 2) {
    let x = parseInt(a.slice(i, i + 2), 16) ^ parseInt(b.slice(i, i + 2), 16);
    while (x) {
      d += x & 1;
      x >>= 1;
    }
  }
  return d;
}

// one 32-bit register shown as a 4-byte color strip
function Register({ name, hex, changed }: { name: string; hex: string; changed: boolean }) {
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-md border p-1.5"
      style={{
        borderColor: changed ? BTC : "rgb(var(--line) / 0.07)",
        background: changed ? rgba(BTC, 0.1) : "rgb(var(--ink-800))",
        boxShadow: changed ? `0 0 0 1px ${rgba(BTC, 0.4)}` : "none",
      }}
    >
      <span className="font-mono text-[10px]" style={{ color: changed ? BTC : "rgb(var(--zinc-500))" }}>
        {name}
      </span>
      <ByteGrid hex={hex} cols={4} cell={11} gap={1} />
    </div>
  );
}

export function Sha256Section() {
  const [msg, setMsg] = useState("Bitcoin");
  const [round, setRound] = useState(64);
  const [playing, setPlaying] = useState(false);

  const trace = useMemo(() => sha256Trace(utf8ToBytes(msg)), [msg]);
  const r = Math.min(round, trace.rounds.length - 1);
  const state = trace.rounds[r];
  const prev = trace.rounds[Math.max(0, r - 1)];

  // avalanche: flip one bit of the input, see how different the digest is
  const digestB = useMemo(() => {
    const b = utf8ToBytes(msg);
    const c = new Uint8Array(b.length || 1);
    c.set(b);
    c[0] = (c[0] ?? 0) ^ 0x01; // flip a single bit
    return bytesToHex(sha256(c));
  }, [msg]);
  const diff = bitDiff(trace.digest, digestB);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setRound((x) => {
        if (x >= 64) {
          setPlaying(false);
          return 64;
        }
        return x + 1;
      });
    }, 90);
    return () => clearInterval(id);
  }, [playing]);

  const padBytes = trace.paddedHex.length / 2;
  const oneIdx = (trace.inputBits / 8) | 0; // index of the 0x80 byte

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-zinc-400">
        SHA-256 crushes any input into a 256-bit fingerprint. Every colored square below is one byte;
        the pattern <em>is</em> the hash. Change one letter and watch the whole picture change.
      </p>

      <input
        aria-label="Message to hash"
        value={msg}
        onChange={(e) => {
          setMsg(e.target.value);
          setRound(64);
          setPlaying(false);
        }}
        spellCheck={false}
        className="w-full rounded-lg border bg-ink-900 px-3 py-2 text-sm text-zinc-200 outline-none"
        style={{ borderColor: "rgb(var(--line) / 0.12)" }}
      />

      <Stage n={1} title="Padding → 512-bit blocks" desc="Your bytes, then a marker byte 0x80, zeros, and the length — padded to a multiple of 64 bytes.">
        <div className="flex flex-wrap items-center gap-3">
          <ByteGrid
            hex={trace.paddedHex}
            cols={Math.min(padBytes, 32)}
            cell={12}
            highlight={(i) => {
              if (i < (trace.inputBits / 8 | 0)) return undefined; // message bytes: natural color
              if (i === oneIdx) return "#ffffff"; // the 0x80 marker
              if (i >= padBytes - 8) return rgba(BTC, 0.8); // length field
              return "rgb(var(--line) / 0.12)"; // zero padding
            }}
          />
          <div className="font-mono text-[10px] text-zinc-500">
            <div><span className="mr-1 inline-block h-2 w-2 rounded-sm align-middle" style={{ background: "#888" }} /> message ({trace.inputBits} bits)</div>
            <div><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-white align-middle" /> 0x80 marker</div>
            <div><span className="mr-1 inline-block h-2 w-2 rounded-sm align-middle" style={{ background: "rgb(var(--line) / 0.2)" }} /> zero padding</div>
            <div><span className="mr-1 inline-block h-2 w-2 rounded-sm align-middle" style={{ background: rgba(BTC, 0.8) }} /> 64-bit length</div>
            <div className="mt-1 text-zinc-600">{trace.blocks} block{trace.blocks > 1 ? "s" : ""}</div>
          </div>
        </div>
      </Stage>
      <DownArrow />

      <Stage n={2} title="64 compression rounds" desc="Eight 32-bit registers churn. Each round only a and e get fresh values; the rest shift down. Hit play to watch the mixing.">
        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={() => {
              if (r >= 64) setRound(0);
              setPlaying((p) => !p);
            }}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-mono text-xs font-medium text-black"
            style={{ background: BTC }}
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {playing ? "pause" : "play"}
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setRound(0);
            }}
            className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 font-mono text-xs text-zinc-300"
            style={{ borderColor: "rgb(var(--line) / 0.15)" }}
          >
            <RotateCcw className="h-3.5 w-3.5" /> reset
          </button>
          <input
            type="range"
            aria-label="SHA-256 compression round"
            min={0}
            max={64}
            value={r}
            onChange={(e) => {
              setPlaying(false);
              setRound(Number(e.target.value));
            }}
            className="flex-1 accent-orange-500"
          />
          <span className="w-16 flex-shrink-0 text-right font-mono text-xs text-zinc-300">{r}/64</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
          {REG.map((name) => (
            <Register key={name} name={name} hex={state[name]} changed={r > 0 && state[name] !== prev[name]} />
          ))}
        </div>
      </Stage>
      <DownArrow />

      <Stage n={3} title="256-bit digest" desc="The final fingerprint — 32 bytes. This exact pattern appears nowhere else for any other input.">
        <div className="flex justify-center py-1">
          <ByteGrid hex={trace.digest} cols={16} cell={18} gap={2} />
        </div>
      </Stage>

      <Stage title="Avalanche effect" desc="Flip a single input bit and roughly half of the 256 output bits flip — there is no partial similarity.">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <ByteGrid hex={trace.digest} cols={8} cell={13} />
            <span className="font-mono text-[9px] text-zinc-500">original</span>
          </div>
          <div className="text-center">
            <div className="font-mono text-2xl font-bold" style={{ color: BTC }}>
              {diff}
            </div>
            <div className="font-mono text-[10px] text-zinc-500">of 256 bits differ</div>
            <div className="mt-1 font-mono text-[10px] text-zinc-600">({((diff / 256) * 100).toFixed(0)}%)</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ByteGrid hex={digestB} cols={8} cell={13} />
            <span className="font-mono text-[9px] text-zinc-500">1 bit flipped</span>
          </div>
        </div>
      </Stage>
    </div>
  );
}
