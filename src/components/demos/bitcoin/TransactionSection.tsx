"use client";

import { useState } from "react";
import { Lock, Send, ArrowRight, FileText } from "lucide-react";
import { Stage, DownArrow, BTC, rgba, Coin, Chip, ByteGrid, useDeferred } from "./parts";
import {
  signTransaction,
  serializeTx,
  txid as computeTxid,
  bytesToHex,
  hexToBytes,
  randomBytes,
  type Tx,
  type SignedInput,
  type WalletResult,
} from "@/lib/demos/bitcoin";

const DEFAULT_RECIPIENT = "1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH";

// Placeholder used for the server render and the client's first render.
const SSR_TXID = "0".repeat(64);

export function TransactionSection({
  privHex,
  wallet,
  onTxid,
}: {
  privHex: string;
  wallet: WalletResult | null;
  onTxid: (id: string) => void;
}) {
  const [recipient, setRecipient] = useState(DEFAULT_RECIPIENT);
  const [sendSats, setSendSats] = useState(60000);
  // Deferred: a random txid during render would not survive hydration.
  const prevTxid = useDeferred(SSR_TXID, () => bytesToHex(randomBytes(32)));
  const [result, setResult] = useState<{
    signed: SignedInput[];
    hex: string;
    id: string;
  } | null>(null);

  const inputValue = 100000; // the UTXO we're spending: 0.001 BTC
  const fee = 5000;
  const change = inputValue - sendSats - fee;

  const valid = /^[0-9a-fA-F]{64}$/.test(privHex.trim()) && wallet && change >= 0;

  const build = () => {
    if (!wallet || !valid) return;
    const tx: Tx = {
      version: 1,
      inputs: [
        { prevTxid, vout: 0, ownerHash160: wallet.hash160Hex, sequence: 0xffffffff },
      ],
      outputs: [
        { address: recipient, value: sendSats },
        { address: wallet.address, value: change }, // change back to self
      ],
      locktime: 0,
    };
    const signed = signTransaction(tx, hexToBytes(privHex.trim()));
    const hex = bytesToHex(serializeTx(tx));
    const id = computeTxid(tx);
    setResult({ signed, hex, id });
    onTxid(id);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-zinc-400">
        Bitcoin tracks coins, not balances. To spend, you point at an earlier output
        (a <strong>UTXO</strong>) and split it into new outputs. Whatever you don&apos;t assign
        becomes the miner&apos;s fee.
      </p>

      {/* the money-flow diagram */}
      <div
        className="rounded-xl border bg-ink-900 p-4"
        style={{ borderColor: "rgb(var(--line) / 0.08)" }}
      >
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Coin sats={inputValue} label="UTXO in" />
          <ArrowRight className="h-4 w-4" style={{ color: rgba(BTC, 0.6) }} />
          <div
            className="flex flex-col items-center gap-1 rounded-xl border px-4 py-3"
            style={{ borderColor: rgba(BTC, 0.4), background: rgba(BTC, 0.06) }}
          >
            {result ? (
              <Lock className="h-6 w-6" style={{ color: "#4ade80" }} />
            ) : (
              <FileText className="h-6 w-6" style={{ color: BTC }} />
            )}
            <span className="font-mono text-[10px] text-zinc-400">
              {result ? "signed tx" : "transaction"}
            </span>
          </div>
          <ArrowRight className="h-4 w-4" style={{ color: rgba(BTC, 0.6) }} />
          <div className="flex flex-col gap-1.5">
            <Coin sats={sendSats} label="→ recipient" color="#60a5fa" />
            <Coin sats={change} label="→ change (you)" color="#4ade80" />
            <Coin sats={fee} label="→ fee (miner)" color="#f7931a" />
          </div>
        </div>
      </div>

      <Stage n={1} title="Set the outputs" desc="Drag to choose how much to send; the change and fee update live.">
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          recipient address
        </label>
        <input
          aria-label="Recipient address"
          value={recipient}
          spellCheck={false}
          onChange={(e) => {
            setRecipient(e.target.value);
            setResult(null);
          }}
          className="mb-3 w-full rounded-lg border bg-ink-800 px-3 py-2 font-mono text-xs text-zinc-200 outline-none"
          style={{ borderColor: "rgb(var(--line) / 0.12)" }}
        />
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          amount to send: {sendSats.toLocaleString()} sats
        </label>
        <input
          type="range"
          aria-label="Amount to send in satoshis"
          min={1000}
          max={inputValue - fee}
          step={1000}
          value={sendSats}
          onChange={(e) => {
            setSendSats(Number(e.target.value));
            setResult(null);
          }}
          className="w-full accent-orange-500"
        />
      </Stage>
      <DownArrow />

      <Stage n={2} title="Sign each input" desc="Hash the transaction (sighash) and sign it with ECDSA. The seal proves you authorized this exact spend.">
        <button
          onClick={build}
          disabled={!valid}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-xs font-medium text-black disabled:opacity-40"
          style={{ background: BTC }}
        >
          <Send className="h-3.5 w-3.5" /> build &amp; sign transaction
        </button>

        {result && (
          <div className="mt-3 space-y-3">
            {result.signed.map((s) => (
              <div
                key={s.index}
                className="flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2"
                style={{ borderColor: rgba("#4ade80", 0.3), background: "rgba(74,222,128,0.05)" }}
              >
                <Lock className="h-5 w-5" style={{ color: "#4ade80" }} />
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-zinc-500">input {s.index} signature (r ‖ s)</span>
                  <ByteGrid hex={s.sigHex} cols={18} cell={9} />
                </div>
                <span className="font-mono text-[11px]" style={{ color: "#4ade80" }}>
                  verified ✓
                </span>
              </div>
            ))}
          </div>
        )}
      </Stage>

      {result && (
        <>
          <DownArrow />
          <Stage n={3} title="Transaction ID" desc="Double-SHA-256 of the serialized bytes — the unique fingerprint explorers show. This id feeds the block in the next tab.">
            <div className="flex flex-wrap items-center gap-3">
              <ByteGrid hex={result.id} cols={8} cell={14} />
              <Chip label="txid" value={result.id} accent />
            </div>
          </Stage>
        </>
      )}
    </div>
  );
}
