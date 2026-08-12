"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LiveDemo } from "./LiveDemo";
import { KeysSection } from "./bitcoin/KeysSection";
import { Sha256Section } from "./bitcoin/Sha256Section";
import { EcdsaSection } from "./bitcoin/EcdsaSection";
import { TransactionSection } from "./bitcoin/TransactionSection";
import { LedgerSection } from "./bitcoin/LedgerSection";
import { BTC, rgba, StoryRail, ByteGrid, Chip } from "./bitcoin/parts";
import { ArrowRight, Box, ChevronLeft, ChevronRight, KeyRound, RotateCcw, Trophy } from "lucide-react";
import {
  deriveWallet,
  randomPrivKey,
  hexToBytes,
  bytesToHex,
  type WalletResult,
} from "@/lib/demos/bitcoin";
import { cardProps } from "@/data/demos";

const REPO = "https://github.com/Yashas120/Bitcoin-Transactions-in-java";

const SECTIONS = [
  {
    id: "keys",
    short: "Keys",
    title: "Keys & Address",
    why: "It all starts with one random number — your private key. Everything below is derived from it.",
  },
  {
    id: "sha",
    short: "SHA-256",
    title: "The hash function",
    why: "SHA-256 is the workhorse behind addresses, transaction IDs, and mining. See what it actually does to bytes.",
  },
  {
    id: "ecdsa",
    short: "Sign",
    title: "Signatures",
    why: "Prove you own the key that controls the address — without ever revealing it.",
  },
  {
    id: "tx",
    short: "Transact",
    title: "Transaction",
    why: "Spend a coin: reference an old output, create new ones, and sign. Out comes a transaction ID.",
  },
  {
    id: "ledger",
    short: "Mine",
    title: "Block & Mining",
    why: "Bundle that transaction into a block and burn energy until the network accepts it.",
  },
] as const;

// Rendered by the server and by the client's first render, then replaced with a
// real random key after mount. Generating the key during render would make the
// derived address text differ between the two and break hydration. Valid
// secp256k1 scalar (0 < k < n).
const SSR_PRIV_HEX = "1".repeat(64);

function isValidPrivHex(hex: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(hex.trim());
}

export function BitcoinDemo() {
  const [privHex, setPrivHex] = useState<string>(SSR_PRIV_HEX);

  // Swap the deterministic placeholder for a real random key once mounted.
  useEffect(() => {
    setPrivHex(bytesToHex(randomPrivKey()));
  }, []);

  const [index, setIndex] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [txId, setTxId] = useState<string | null>(null);
  const [minedBlock, setMinedBlock] = useState<{
    hash: string;
    nonce: number;
    difficulty: number;
  } | null>(null);

  const valid = isValidPrivHex(privHex);
  const wallet: WalletResult | null = useMemo(() => {
    if (!valid) return null;
    try {
      return deriveWallet(hexToBytes(privHex.trim()));
    } catch {
      return null;
    }
  }, [privHex, valid]);

  const regenerate = () => setPrivHex(bytesToHex(randomPrivKey()));

  const goTo = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(SECTIONS.length - 1, i));
    setIndex(clamped);
    setMaxReached((m) => Math.max(m, clamped));
  }, []);

  // Left/right arrow keys advance the story (ignored while typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight") goTo(index + 1);
      else if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, index]);

  const section = SECTIONS[index];
  const prev = index > 0 ? SECTIONS[index - 1] : null;
  const next = index < SECTIONS.length - 1 ? SECTIONS[index + 1] : null;

  return (
    <LiveDemo
      title="Bitcoin, end to end"
      subtitle="Follow one key as it becomes an address, signs a transaction, and lands in a mined block — all built from scratch and running live in this tab."
      repoUrl={REPO}
      accent={BTC}
      {...cardProps("bitcoin")}
    >
      {/* Guided progress rail */}
      <div className="mb-4">
        <StoryRail
          steps={SECTIONS as unknown as { short: string }[]}
          activeIndex={index}
          maxReached={maxReached}
          onSelect={goTo}
        />
      </div>

      {/* Data lineage carried across every step */}
      <div
        className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border bg-ink-900 px-3 py-2"
        style={{ borderColor: "rgb(var(--line) / 0.08)" }}
      >
        <span className="font-mono text-[10px] uppercase tracking-wide text-zinc-600">
          carried through
        </span>
        <LineageItem
          icon={<KeyRound className="h-3 w-3" />}
          label="private key"
          node={<ByteGrid hex={privHex} cols={32} cell={4} gap={1} />}
        />
        <ArrowRight className="h-3.5 w-3.5" style={{ color: rgba(BTC, 0.5) }} />
        <LineageItem
          label="address"
          node={<Chip value={wallet ? wallet.address : "—"} accent />}
        />
        <ArrowRight className="h-3.5 w-3.5" style={{ color: rgba(BTC, 0.5) }} />
        <LineageItem
          label="txid"
          node={
            txId ? (
              <ByteGrid hex={txId} cols={32} cell={4} gap={1} />
            ) : (
              <span className="font-mono text-[10px] text-zinc-600">build in step 4</span>
            )
          }
        />
        <ArrowRight className="h-3.5 w-3.5" style={{ color: rgba(BTC, 0.5) }} />
        <LineageItem
          icon={<Box className="h-3 w-3" />}
          label="block"
          node={
            minedBlock ? (
              <ByteGrid hex={minedBlock.hash} cols={32} cell={4} gap={1} />
            ) : (
              <span className="font-mono text-[10px] text-zinc-600">mine in step 5</span>
            )
          }
        />
      </div>

      {/* Step heading */}
      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[11px]" style={{ color: BTC }}>
            Step {index + 1} of {SECTIONS.length}
          </span>
          <h3 className="text-base font-semibold text-zinc-100">{section.title}</h3>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{section.why}</p>
      </div>

      {/* Active section */}
      {section.id === "keys" && (
        <KeysSection
          privHex={privHex}
          setPrivHex={setPrivHex}
          wallet={wallet}
          regenerate={regenerate}
          valid={valid}
        />
      )}
      {section.id === "sha" && <Sha256Section />}
      {section.id === "ecdsa" &&
        (wallet ? (
          <EcdsaSection privHex={privHex} pubKeyHex={wallet.pubKeyHex} />
        ) : (
          <p className="text-sm text-red-400">Enter a valid private key in step 1 first.</p>
        ))}
      {section.id === "tx" && (
        <TransactionSection privHex={privHex} wallet={wallet} onTxid={setTxId} />
      )}
      {section.id === "ledger" && <LedgerSection txId={txId} onMined={setMinedBlock} />}

      {/* Journey recap, revealed once the first block is mined */}
      {section.id === "ledger" && minedBlock && (
        <div
          className="mt-5 rounded-xl border p-4"
          style={{ borderColor: rgba(BTC, 0.45), background: rgba(BTC, 0.06) }}
        >
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5" style={{ color: BTC }} />
            <h4 className="text-sm font-semibold text-zinc-100">
              Block mined — you built Bitcoin end to end
            </h4>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            One random number became a spendable address, a signed transaction, and an immutable
            block — with {minedBlock.difficulty} leading zero bits of proof-of-work. Here is the whole
            journey:
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <RecapItem icon={<KeyRound className="h-3.5 w-3.5" />} label="private key">
              <ByteGrid hex={privHex} cols={16} cell={7} gap={1} />
            </RecapItem>
            <RecapItem label="address">
              <Chip value={wallet ? wallet.address : "—"} accent />
            </RecapItem>
            <RecapItem label="transaction id">
              {txId ? (
                <ByteGrid hex={txId} cols={16} cell={7} gap={1} />
              ) : (
                <span className="font-mono text-[10px] text-zinc-600">skipped step 4</span>
              )}
            </RecapItem>
            <RecapItem icon={<Box className="h-3.5 w-3.5" />} label={`block hash · nonce ${minedBlock.nonce.toLocaleString()}`}>
              <ByteGrid hex={minedBlock.hash} cols={16} cell={7} gap={1} />
            </RecapItem>
          </div>
        </div>
      )}

      {/* Prev / Next narrative controls */}
      <div
        className="mt-6 flex items-center justify-between border-t pt-4"
        style={{ borderColor: "rgb(var(--line) / 0.08)" }}
      >
        <button
          onClick={() => goTo(index - 1)}
          disabled={!prev}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-[11px] text-zinc-300 transition-colors hover:text-zinc-100 disabled:opacity-30"
          style={{ borderColor: "rgb(var(--line) / 0.12)" }}
        >
          <ChevronLeft className="h-3.5 w-3.5" /> {prev ? prev.title : "start"}
        </button>
        {next ? (
          <button
            onClick={() => goTo(index + 1)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-[11px] font-medium text-black transition-opacity hover:opacity-90"
            style={{ background: BTC }}
          >
            {next.title} <ChevronRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            onClick={() => goTo(0)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-[11px] font-medium text-black transition-opacity hover:opacity-90"
            style={{ background: BTC }}
          >
            <RotateCcw className="h-3.5 w-3.5" /> start over
          </button>
        )}
      </div>
    </LiveDemo>
  );
}

// A titled artifact in the end-of-journey recap grid.
function RecapItem({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col gap-1.5 rounded-lg border bg-ink-900 px-3 py-2"
      style={{ borderColor: "rgb(var(--line) / 0.08)" }}
    >
      <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}

// A single node in the cross-step data-lineage strip.
function LineageItem({
  icon,
  label,
  node,
}: {
  icon?: React.ReactNode;
  label: string;
  node: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-500">
        {icon}
        {label}
      </span>
      {node}
    </div>
  );
}
