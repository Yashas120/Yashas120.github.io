"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pickaxe, Square, Link2, Box } from "lucide-react";
import { Stage, DownArrow, BTC, rgba, ByteGrid, Chip, useDeferred } from "./parts";
import {
  merkleRoot,
  leadingZeroBits,
  bytesToHex,
  randomBytes,
  type BlockHeader,
} from "@/lib/demos/bitcoin";

const GENESIS_PREV = "0".repeat(64);

// Placeholders for the server render and the client's first render. The real
// random txids and wall-clock timestamp are filled in after mount, because
// values that differ between the two renders break hydration.
const SSR_TXID = "0".repeat(64);
const SSR_TIME = 1231006505; // Bitcoin genesis block timestamp

interface MinedBlock {
  height: number;
  hash: string;
  nonce: number;
  attempts: number;
}

// messages posted back from the mining worker
type MinerOut =
  | { type: "progress"; nonce: number; hash: string; attempts: number; ms: number }
  | { type: "found"; nonce: number; hash: string; attempts: number; ms: number };

export function LedgerSection({
  txId,
  onMined,
}: {
  txId: string | null;
  onMined?: (block: { hash: string; nonce: number; difficulty: number }) => void;
}) {
  const [difficulty, setDifficulty] = useState(16);
  const coinbase = useDeferred(SSR_TXID, () => bytesToHex(randomBytes(32)));
  const fallbackTxid = useDeferred(SSR_TXID, () => bytesToHex(randomBytes(32)));
  const [mining, setMining] = useState(false);
  const [progress, setProgress] = useState<{ nonce: number; hash: string; attempts: number }>({
    nonce: 0,
    hash: "",
    attempts: 0,
  });
  const [chain, setChain] = useState<MinedBlock[]>([]);
  const [rates, setRates] = useState<number[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const sampleRef = useRef<{ attempts: number; ms: number }>({ attempts: 0, ms: 0 });

  const txids = useMemo(
    () => [coinbase, txId ?? fallbackTxid],
    [coinbase, txId, fallbackTxid]
  );
  const merkle = useMemo(() => merkleRoot(txids), [txids]);

  const prevHash = chain.length ? chain[chain.length - 1].hash : GENESIS_PREV;
  const time = useDeferred(SSR_TIME, () => Math.floor(Date.now() / 1000));

  // terminate the worker if the component unmounts mid-mine
  useEffect(() => () => workerRef.current?.terminate(), []);

  const startMining = () => {
    if (mining) return;
    setMining(true);
    setRates([]);
    setProgress({ nonce: 0, hash: "", attempts: 0 });
    sampleRef.current = { attempts: 0, ms: 0 };

    const header: BlockHeader = {
      version: 1,
      prevHash,
      merkleRoot: merkle.root,
      time,
      bits: 0x1d00ffff,
      nonce: 0,
    };

    const worker = new Worker(new URL("./miner.worker.ts", import.meta.url));
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<MinerOut>) => {
      const d = e.data;
      setProgress({ nonce: d.nonce, hash: d.hash, attempts: d.attempts });

      // instantaneous hash rate between the last two batches
      const prev = sampleRef.current;
      const dMs = d.ms - prev.ms;
      if (dMs > 0) {
        const rate = ((d.attempts - prev.attempts) / dMs) * 1000;
        setRates((r) => [...r.slice(-39), rate]);
      }
      sampleRef.current = { attempts: d.attempts, ms: d.ms };

      if (d.type === "found") {
        setChain((c) => [...c, { height: c.length, hash: d.hash, nonce: d.nonce, attempts: d.attempts }]);
        onMined?.({ hash: d.hash, nonce: d.nonce, difficulty });
        worker.terminate();
        workerRef.current = null;
        setMining(false);
      }
    };

    worker.postMessage({ type: "start", header, difficulty });
  };

  const stopMining = () => {
    workerRef.current?.postMessage({ type: "stop" });
    workerRef.current?.terminate();
    workerRef.current = null;
    setMining(false);
  };

  const hashrate = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
  const currentZeros = progress.hash ? leadingZeroBits(progress.hash) : 0;

  const reversedLevels = [...merkle.levels].reverse();

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-zinc-400">
        Transactions get bundled into a <strong>block</strong>. Miners spin a counter (the nonce)
        and re-hash the header millions of times until the hash starts with enough zero bits. That
        burned work is what makes rewriting history expensive.
      </p>

      <Stage n={1} title="Merkle tree — one root for every transaction" desc="Transaction fingerprints are hashed in pairs, up the tree, until a single root remains. Change any tx and the root changes.">
        <div className="flex flex-col items-center gap-1">
          {reversedLevels.map((level, ri) => (
            <div key={ri} className="flex flex-col items-center gap-1">
              <div className="flex flex-wrap justify-center gap-4">
                {level.map((n, j) => (
                  <div key={j} className="flex flex-col items-center gap-0.5">
                    <div
                      className="rounded-md border p-1"
                      style={{ borderColor: ri === 0 ? rgba(BTC, 0.5) : "rgb(var(--line) / 0.1)" }}
                    >
                      <ByteGrid hex={n} cols={8} cell={6} gap={1} />
                    </div>
                    <span className="font-mono text-[8px] text-zinc-600">
                      {ri === 0
                        ? "root"
                        : ri === reversedLevels.length - 1
                        ? j === 0
                          ? "coinbase"
                          : "your tx"
                        : `h${j}`}
                    </span>
                  </div>
                ))}
              </div>
              {ri < reversedLevels.length - 1 && (
                <div className="h-4 w-px" style={{ background: rgba(BTC, 0.4) }} />
              )}
            </div>
          ))}
        </div>
      </Stage>
      <DownArrow />

      <Stage n={2} title="Block header (80 bytes)" desc="Six fields — including the previous block's hash. That back-link is the chain.">
        <div className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
          <Row label="version" value="1" />
          <Row label="timestamp" value={String(time)} />
          <Row label="prev block" chip={prevHash} />
          <Row label="merkle root" chip={merkle.root} accent />
          <Row label="bits" value="0x1d00ffff" />
          <Row label="nonce" value={progress.hash ? String(progress.nonce) : "— mine it"} />
        </div>
      </Stage>
      <DownArrow />

      <Stage n={3} title="Proof-of-work" desc="Demand more leading zero bits and the work explodes — every extra bit doubles the expected hashes.">
        <div className="mb-3 flex items-center gap-3">
          <span className="font-mono text-[11px] text-zinc-500">difficulty</span>
          <input
            type="range"
            aria-label="Proof-of-work difficulty"
            min={8}
            max={22}
            value={difficulty}
            disabled={mining}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="flex-1 accent-orange-500"
          />
          <span className="w-24 flex-shrink-0 text-right font-mono text-xs text-zinc-300">
            {difficulty} zero bits
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!mining ? (
            <button
              onClick={startMining}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-xs font-medium text-black"
              style={{ background: BTC }}
            >
              <Pickaxe className="h-3.5 w-3.5" /> mine block
            </button>
          ) : (
            <button
              onClick={stopMining}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-xs text-zinc-200"
              style={{ borderColor: "rgb(var(--line) / 0.2)" }}
            >
              <Square className="h-3.5 w-3.5" /> stop
            </button>
          )}
          <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
            <span>
              {progress.attempts.toLocaleString()} hashes
              {hashrate > 0 && ` · ${(hashrate / 1000).toFixed(0)}k H/s`}
            </span>
            <Sparkline data={rates} />
          </div>
        </div>

        {progress.hash && (
          <div className="mt-3 space-y-2">
            {/* target: required zero bits filling up */}
            <div className="flex items-center gap-2">
              <span className="w-12 font-mono text-[10px] text-zinc-500">target</span>
              <div className="flex flex-wrap gap-[3px]">
                {Array.from({ length: difficulty }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 14,
                      borderRadius: 2,
                      background: i < currentZeros ? "#4ade80" : "rgb(var(--line) / 0.15)",
                    }}
                  />
                ))}
              </div>
              <span
                className="font-mono text-[11px]"
                style={{ color: currentZeros >= difficulty ? "#4ade80" : "rgb(var(--zinc-400))" }}
              >
                {currentZeros}/{difficulty}
              </span>
            </div>
            {/* the candidate hash as a fingerprint, leading zero bytes lit */}
            <div className="flex flex-col items-center gap-1">
              <ByteGrid
                hex={progress.hash}
                cols={16}
                cell={13}
                highlight={(i, v) =>
                  i < Math.floor(currentZeros / 8) ? "#4ade80" : v === 0 ? "rgb(var(--line) / 0.2)" : undefined
                }
              />
              <span className="font-mono text-[9px] text-zinc-600">
                candidate @ nonce {progress.nonce.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </Stage>

      {chain.length > 0 && (
        <>
          <DownArrow />
          <Stage n={4} title="The ledger" desc="Each block links to the one before it. Tampering with an old block breaks every hash after it.">
            <div className="flex flex-wrap items-center gap-2">
              {chain.map((b, i) => (
                <div key={b.height} className="flex items-center gap-2">
                  {i > 0 && <Link2 className="h-4 w-4" style={{ color: rgba(BTC, 0.6) }} />}
                  <div
                    className="flex flex-col items-center gap-1 rounded-lg border px-3 py-2"
                    style={{ borderColor: rgba(BTC, 0.35), background: rgba(BTC, 0.05) }}
                  >
                    <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-400">
                      <Box className="h-3 w-3" style={{ color: BTC }} /> #{b.height}
                    </div>
                    <ByteGrid hex={b.hash} cols={8} cell={6} gap={1} />
                    <span className="font-mono text-[8px] text-zinc-600">
                      nonce {b.nonce.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Stage>
        </>
      )}
    </div>
  );
}

// A tiny hash-rate history sparkline.
function Sparkline({
  data,
  width = 120,
  height = 26,
}: {
  data: number[];
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (max > 0 ? (v / max) * (height - 2) : 0) - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} aria-hidden>
      <polyline points={pts} fill="none" stroke={BTC} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

// compact header field: label + short value or hex chip
function Row({
  label,
  value,
  chip,
  accent,
}: {
  label: string;
  value?: string;
  chip?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-mono text-[10px] uppercase tracking-wide text-zinc-500">{label}</span>
      {chip ? (
        <Chip value={chip} accent={accent} />
      ) : (
        <span className="font-mono text-[11px] text-zinc-300">{value}</span>
      )}
    </div>
  );
}
