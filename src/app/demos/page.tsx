import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Zap, BookOpen } from "lucide-react";
import { DEMOS } from "@/data/demos";
import { BitcoinDemo } from "@/components/demos/BitcoinDemo";
import { ChocoLLVMDemo } from "@/components/demos/ChocoLLVMDemo";
import { CifarSparkDemo } from "@/components/demos/CifarSparkDemo";
import { CloudDemo } from "@/components/demos/CloudDemo";
import { MultiviewDemo } from "@/components/demos/MultiviewDemo";
import { ParallelDemo } from "@/components/demos/ParallelDemo";
import { PetraDemo } from "@/components/demos/PetraDemo";
import { SwiftDemo } from "@/components/demos/SwiftDemo";
import { YelpDemo } from "@/components/demos/YelpDemo";

const DEMOS_DESC =
  "Nine GitHub projects brought to life in the browser — no server, no install. A from-scratch Bitcoin wallet, a ChocoPy→LLVM IR compiler, SWIFT super-resolution, Structure-from-Motion 3D reconstruction, a Spark-style CIFAR-10 streaming classifier, a parallel-computing playground, an RDBMS cloud-provisioning tracer, a Yelp closure predictor with a live map, and a MERN request tracer.";

export const metadata: Metadata = {
  title: "Live demos",
  description: DEMOS_DESC,
  openGraph: {
    title: "Live demos — Yashas Kadambi",
    description: DEMOS_DESC,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live demos — Yashas Kadambi",
    description: DEMOS_DESC,
  },
};

export default function DemosPage() {
  return (
    <main className="min-h-screen px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/hidden"
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> all interfaces
        </Link>

        <header className="mb-8 max-w-2xl">
          <h1 className="text-2xl font-bold text-zinc-100">Live demos</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Some of these GitHub projects can actually <em>run</em> — right here in your browser, with
            no backend. Everything below computes client-side on your machine.
          </p>
        </header>

        {/* overview index — jump to any card */}
        <nav aria-label="Demo index" className="mb-10 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DEMOS.map((d) => (
            <a
              key={d.id}
              href={`#${d.id}`}
              className="group rounded-lg border bg-ink-800/60 p-3 transition-colors hover:bg-ink-800"
              style={{ borderColor: "rgb(var(--line) / 0.1)" }}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: d.accent }} />
                <span className="truncate text-sm font-medium text-zinc-200 group-hover:text-zinc-50">
                  {d.title}
                </span>
                <span
                  className="ml-auto inline-flex flex-shrink-0 items-center gap-1 font-mono text-[9px] uppercase tracking-wide"
                  style={{ color: d.kind === "interactive" ? d.accent : "rgb(var(--zinc-500))" }}
                  title={d.kind === "interactive" ? "runs in your browser" : "interactive explainer"}
                >
                  {d.kind === "interactive" ? <Zap className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 font-mono text-[11px] leading-relaxed text-zinc-500">{d.blurb}</p>
            </a>
          ))}
        </nav>

        <BitcoinDemo />

        <div className="mt-10">
          <ChocoLLVMDemo />
        </div>

        <div className="mt-10">
          <SwiftDemo />
        </div>

        <div className="mt-10">
          <MultiviewDemo />
        </div>

        <div className="mt-10">
          <CifarSparkDemo />
        </div>

        <div className="mt-10">
          <ParallelDemo />
        </div>

        <div className="mt-10">
          <CloudDemo />
        </div>

        <div className="mt-10">
          <YelpDemo />
        </div>

        <div className="mt-10">
          <PetraDemo />
        </div>
      </div>
    </main>
  );
}
