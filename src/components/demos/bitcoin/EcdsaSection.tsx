"use client";

import { useMemo, useState } from "react";
import { PenLine, ShieldCheck, ShieldX } from "lucide-react";
import { Stage, DownArrow, BTC, rgba, Chip, ByteGrid, usePrefersReducedMotion } from "./parts";
import {
  sha256,
  utf8ToBytes,
  signTrace,
  verify,
  hexToBytes,
  type EcdsaTrace,
  type Signature,
} from "@/lib/demos/bitcoin";

// y² = x³ + 7 with G and the signing point R marked.
function CurvePlot({ markerT }: { markerT?: number }) {
  const reduced = usePrefersReducedMotion();
  const W = 240, H = 180, cx = 66, sx = 36, cy = H / 2, sy = 13;
  const samples: { x: number; sxp: number; syp: number }[] = [];
  for (let x = -1.912; x <= 3.4; x += 0.02) {
    const y = Math.sqrt(x * x * x + 7);
    samples.push({ x, sxp: cx + x * sx, syp: cy - y * sy });
  }
  const upper = samples.map((s) => `${s.sxp},${s.syp}`).join(" ");
  const lower = samples.map((s) => `${s.sxp},${cy + (cy - s.syp)}`).join(" ");
  const g = samples[Math.floor(samples.length * 0.28)];
  const R = markerT !== undefined ? samples[Math.floor(markerT * (samples.length - 1))] : null;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 190 }}>
      <line x1="8" y1={cy} x2={W - 8} y2={cy} stroke="rgb(var(--line) / 0.15)" strokeWidth="1" />
      <line x1={cx} y1="8" x2={cx} y2={H - 8} stroke="rgb(var(--line) / 0.15)" strokeWidth="1" />
      <polyline points={upper} fill="none" stroke={BTC} strokeWidth="2" />
      <polyline points={lower} fill="none" stroke={BTC} strokeWidth="2" />
      {/* generator point G */}
      <circle cx={g.sxp} cy={g.syp} r="4" fill="#60a5fa" />
      <text x={g.sxp + 6} y={g.syp - 4} fill="#60a5fa" fontSize="9" fontFamily="monospace">G</text>
      {/* signing point R = k·G */}
      {R && (
        <>
          <line x1={g.sxp} y1={g.syp} x2={R.sxp} y2={R.syp} stroke={rgba(BTC, 0.5)} strokeWidth="1" strokeDasharray="3 2" />
          <circle cx={R.sxp} cy={R.syp} r={reduced ? 6 : 5} fill={BTC}>
            {!reduced && (
              <animate attributeName="r" values="5;8;5" dur="1.4s" repeatCount="indefinite" />
            )}
          </circle>
          <text x={R.sxp + 6} y={R.syp - 4} fill={BTC} fontSize="9" fontFamily="monospace">R = k·G</text>
        </>
      )}
      <text x={W - 46} y={cy - 6} fill="rgb(var(--zinc-500))" fontSize="9" fontFamily="monospace">
        y² = x³ + 7
      </text>
    </svg>
  );
}

export function EcdsaSection({ privHex, pubKeyHex }: { privHex: string; pubKeyHex: string }) {
  const [message, setMessage] = useState("I authorize this spend");
  const [trace, setTrace] = useState<EcdsaTrace | null>(null);
  const [tampered, setTampered] = useState(false);

  const priv = useMemo(() => {
    try {
      return /^[0-9a-fA-F]{64}$/.test(privHex.trim()) ? hexToBytes(privHex.trim()) : null;
    } catch {
      return null;
    }
  }, [privHex]);

  const doSign = () => {
    if (!priv) return;
    const z = sha256(utf8ToBytes(message));
    setTrace(signTrace(z, priv, hexToBytes(pubKeyHex)));
    setTampered(false);
  };

  // Live verification result; when "tampered" we verify the same signature
  // against a *changed* message hash — which must fail.
  const verified = useMemo(() => {
    if (!trace) return null;
    if (!tampered) return trace.valid;
    const sig: Signature = { r: BigInt("0x" + trace.r), s: BigInt("0x" + trace.s) };
    const z2 = sha256(utf8ToBytes(message + " (altered)"));
    return verify(z2, sig, hexToBytes(pubKeyHex));
  }, [trace, tampered, message, pubKeyHex]);

  const markerT = trace ? parseInt(trace.r.slice(0, 4), 16) / 0xffff : undefined;
  const match = trace ? trace.recoveredRx === trace.r && !tampered : false;

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-zinc-400">
        A signature proves you own the private key <em>without revealing it</em>. Signing picks a
        random point <span style={{ color: BTC }}>R = k·G</span> on the curve; verifying rebuilds that
        point from the signature and your public key.
      </p>

      <div
        className="rounded-xl border bg-ink-900 p-3"
        style={{ borderColor: "rgb(var(--line) / 0.08)" }}
      >
        <CurvePlot markerT={markerT} />
      </div>

      <input
        aria-label="Message to sign"
        value={message}
        spellCheck={false}
        onChange={(e) => {
          setMessage(e.target.value);
          setTrace(null);
        }}
        className="w-full rounded-lg border bg-ink-900 px-3 py-2 text-sm text-zinc-200 outline-none"
        style={{ borderColor: "rgb(var(--line) / 0.12)" }}
      />
      <button
        onClick={doSign}
        disabled={!priv}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-xs font-medium text-black disabled:opacity-40"
        style={{ background: BTC }}
      >
        <PenLine className="h-3.5 w-3.5" /> sign with private key
      </button>

      {trace && (
        <>
          <Stage n={1} title="The signature" desc="Two 256-bit numbers, r and s, derived from your key, the message, and a one-time random nonce k. This pair is the signature — shown here as its byte fingerprint.">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <ByteGrid hex={trace.r} cols={8} cell={13} />
                <span className="font-mono text-[10px] text-zinc-500">r</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ByteGrid hex={trace.s} cols={8} cell={13} />
                <span className="font-mono text-[10px] text-zinc-500">s</span>
              </div>
              <div className="space-y-1">
                <Chip label="z (msg hash)" value={trace.z} />
                <div />
                <Chip label="k (nonce)" value={trace.k} />
              </div>
            </div>
          </Stage>
          <DownArrow />
          <Stage n={2} title="Verification" desc="Recompute the point using only the public key. Its x-coordinate must equal r.">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <ByteGrid hex={trace.recoveredRx} cols={8} cell={11} />
                <span className="font-mono text-[9px] text-zinc-500">recovered x</span>
              </div>
              <span className="font-mono text-lg" style={{ color: match ? "#4ade80" : "#f87171" }}>
                {match ? "=" : "≠"}
              </span>
              <div className="flex flex-col items-center gap-1">
                <ByteGrid hex={trace.r} cols={8} cell={11} />
                <span className="font-mono text-[9px] text-zinc-500">r</span>
              </div>
            </div>
          </Stage>

          <label className="flex items-center justify-center gap-1.5 font-mono text-[11px] text-zinc-400">
            <input type="checkbox" checked={tampered} onChange={(e) => setTampered(e.target.checked)} />
            tamper with the message after signing
          </label>

          <div
            className="flex flex-col items-center gap-2 rounded-xl border px-4 py-5"
            style={{
              borderColor: verified ? rgba("#4ade80", 0.4) : rgba("#f87171", 0.4),
              background: verified ? "rgba(74,222,128,0.06)" : "rgba(248,113,113,0.06)",
            }}
          >
            {verified ? (
              <ShieldCheck className="h-10 w-10" style={{ color: "#4ade80" }} />
            ) : (
              <ShieldX className="h-10 w-10" style={{ color: "#f87171" }} />
            )}
            <span className="font-mono text-sm font-semibold" style={{ color: verified ? "#4ade80" : "#f87171" }}>
              {verified ? "SIGNATURE VALID" : "SIGNATURE INVALID"}
            </span>
            <span className="text-center text-[11px] text-zinc-500">
              {verified
                ? "The recovered point matches r — provably signed by this key."
                : "The message changed, so the recovered point no longer matches r."}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
