import type { Metadata } from "next";
import Link from "next/link";
import { KernalRedirect } from "./KernalRedirect";

export const metadata: Metadata = {
  title: "Portfolio moved — Yashas Kadambi",
  description: "The requested portfolio URL has moved to /kernel.",
  alternates: { canonical: "https://yashas120.github.io/kernel/" },
  robots: { index: false, follow: true },
};

export default function KernalCompatibilityPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-900 px-5 text-zinc-200">
      <KernalRedirect />
      <section className="max-w-lg rounded-xl border border-white/10 bg-ink-800 p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-400">URL compatibility</p>
        <h1 className="mt-3 text-2xl font-semibold">This portfolio moved to /kernel.</h1>
        <p className="mt-3 text-zinc-400">You should be redirected automatically. The ordinary link below remains available if JavaScript is disabled.</p>
        <Link href="/kernel" className="mt-6 inline-flex min-h-11 items-center rounded-md border border-cyan-400/50 px-4 text-sm font-semibold text-cyan-300 hover:bg-cyan-400/10">
          Open Portfolio Overview
        </Link>
        <noscript><p className="mt-4 text-sm text-amber-300">JavaScript is disabled; use the link above.</p></noscript>
      </section>
    </main>
  );
}
