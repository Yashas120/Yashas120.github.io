"use client";

import { RefreshCw, Key, Sparkle, Hash, Fingerprint, Wallet, ArrowRight } from "lucide-react";
import { BTC, rgba, Node, Chip, ByteGrid } from "./parts";
import type { WalletResult } from "@/lib/demos/bitcoin";

function Flow({ children }: { children: React.ReactNode[] }) {
  return (
    <div className="flex flex-wrap items-stretch justify-center gap-2">
      {children.map((c, i) => (
        <div key={i} className="flex items-center gap-2">
          {c}
          {i < children.length - 1 && (
            <ArrowRight className="h-4 w-4 flex-shrink-0" style={{ color: rgba(BTC, 0.6) }} />
          )}
        </div>
      ))}
    </div>
  );
}

export function KeysSection({
  privHex,
  setPrivHex,
  wallet,
  regenerate,
  valid,
}: {
  privHex: string;
  setPrivHex: (v: string) => void;
  wallet: WalletResult | null;
  regenerate: () => void;
  valid: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-zinc-400">
        A Bitcoin identity is just a number. The public key, your address, the power to spend — all{" "}
        <em>derived</em> from one 256-bit private key through a chain of one-way steps.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          aria-label="Private key in hexadecimal"
          value={privHex}
          spellCheck={false}
          onChange={(e) => setPrivHex(e.target.value)}
          className="flex-1 rounded-lg border bg-ink-900 px-3 py-2 font-mono text-xs text-zinc-200 outline-none"
          style={{ borderColor: valid ? "rgb(var(--line) / 0.12)" : "#f87171" }}
        />
        <button
          onClick={regenerate}
          className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 font-mono text-xs font-medium text-black"
          style={{ background: BTC }}
        >
          <RefreshCw className="h-3.5 w-3.5" /> roll new key
        </button>
      </div>
      {!valid && <p className="font-mono text-[11px] text-red-400">need exactly 64 hex characters</p>}

      {wallet && (
        <>
          <div
            className="rounded-xl border bg-ink-900 p-4"
            style={{ borderColor: "rgb(var(--line) / 0.08)" }}
          >
            <Flow>
              {[
                <Node key="k" icon={<Key className="h-4 w-4" />} title="private key">
                  <Chip value={wallet.privKeyHex} />
                </Node>,
                <Node key="p" icon={<Sparkle className="h-4 w-4" />} title="public key">
                  <Chip value={wallet.pubKeyHex} />
                </Node>,
                <Node key="s" icon={<Hash className="h-4 w-4" />} title="SHA-256">
                  <Chip value={wallet.sha256Hex} />
                </Node>,
                <Node key="h" icon={<Fingerprint className="h-4 w-4" />} title="HASH160">
                  <Chip value={wallet.hash160Hex} />
                </Node>,
                <Node key="a" icon={<Wallet className="h-4 w-4" />} title="address" accent>
                  <Chip value={wallet.address} accent />
                </Node>,
              ]}
            </Flow>
            <p className="mt-3 text-center font-mono text-[10px] text-zinc-600">
              key · G → hash → hash → encode &nbsp;·&nbsp; each arrow is one-way (easy →, infeasible ←)
            </p>
          </div>

          {/* the address as a visual fingerprint you can hand out */}
          <div
            className="rounded-xl border p-4"
            style={{ borderColor: rgba(BTC, 0.35), background: rgba(BTC, 0.05) }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex justify-center">
                <ByteGrid hex={wallet.hash160Hex} cols={5} cell={22} gap={3} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10px] uppercase tracking-wide text-zinc-500">
                  your public address
                </div>
                <div className="break-all font-mono text-sm" style={{ color: BTC }}>
                  {wallet.address}
                </div>
                <div className="mt-1.5">
                  <Chip label="WIF" value={wallet.wif} />
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  The colored grid is the 20-byte HASH160 — a visual fingerprint of this address.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
