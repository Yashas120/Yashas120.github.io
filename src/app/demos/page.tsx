import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Zap, BookOpen } from "lucide-react";
import { DEMOS } from "@/data/demos";
import { GhostDemo } from "@/components/demos/GhostDemo";
import { ChocoLLVMDemo } from "@/components/demos/ChocoLLVMDemo";
import { CifarSparkDemo } from "@/components/demos/CifarSparkDemo";
import { ParallelDemo } from "@/components/demos/ParallelDemo";
import { PetraDemo } from "@/components/demos/PetraDemo";
import { YelpDemo } from "@/components/demos/YelpDemo";
import { ProjectDemoPresentation } from "@/components/demos/ProjectDemoPresentation";

const DEMOS_DESC =
  "Ten projects with browser-native ports, simulations, live computation, and clearly labeled explainers. Every demo separates original work, contribution, and browser fidelity.";

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
            Inspect browser-native ports, simulations, live computation, and interactive explainers. Each card states
            what runs locally, what is modeled or precomputed, and how the original project is attributed.
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

        <GhostDemo />

        <div className="mt-10 scroll-mt-20" id="bitcoin">
          <ProjectDemoPresentation demoId="bitcoin" autoOpen />
        </div>

        <div className="mt-10">
          <ChocoLLVMDemo />
        </div>

        <div className="mt-10 scroll-mt-20" id="swift">
          <ProjectDemoPresentation demoId="swift" autoOpen />
        </div>

        <div className="mt-10 scroll-mt-20" id="multiview">
          <ProjectDemoPresentation demoId="multiview" autoOpen />
        </div>

        <div className="mt-10">
          <CifarSparkDemo />
        </div>

        <div className="mt-10">
          <ParallelDemo />
        </div>

        <div className="mt-10 scroll-mt-20" id="cloud">
          <ProjectDemoPresentation demoId="cloud" autoOpen />
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
