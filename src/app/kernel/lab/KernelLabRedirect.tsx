"use client";

import { useEffect } from "react";

export function KernelLabRedirect() {
  useEffect(() => {
    const current = new URL(window.location.href);
    const target = new URL("/kernel", current.origin);
    target.searchParams.set("view", "desktop");
    for (const key of ["app", "demo"] as const) {
      const value = current.searchParams.get(key);
      if (value) target.searchParams.set(key, value);
    }
    window.location.replace(`${target.pathname}${target.search}${current.hash}`);
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-ink-900 p-6 text-zinc-200">
      <div className="max-w-lg rounded-xl border border-white/10 bg-ink-800 p-6 text-center">
        <h1 className="text-xl font-semibold">yashOS now runs inside the portfolio story</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">Opening the interactive desktop on the canonical <code>/kernel</code> route.</p>
        <a className="mt-5 inline-flex min-h-11 items-center rounded-md border border-cyan-300/40 px-4 text-sm font-semibold text-cyan-300" href="/kernel?view=desktop">
          Continue to the interactive desktop
        </a>
        <noscript><p className="mt-4 text-sm text-amber-200">JavaScript is unavailable. Use the visible link above.</p></noscript>
      </div>
    </main>
  );
}
