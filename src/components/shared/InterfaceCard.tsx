"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ThemeMeta } from "@/lib/themes";
import { hexToRgba } from "@/lib/utils";

export function InterfaceCard({ theme, index }: { theme: ThemeMeta; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
    >
      <Link
        href={theme.path}
        className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border p-5 transition-all"
        style={{
          background: "#0b0d12",
          borderColor: "rgb(var(--line) / 0.08)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
          style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
        />
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: hexToRgba(theme.accent, 0.18) }}
        />

        <div>
          <div className="flex items-center justify-between">
            <span
              className="flex items-center gap-2 font-mono text-[11px]"
              style={{ color: theme.accent }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: theme.accent, boxShadow: `0 0 10px ${hexToRgba(theme.accent, 0.9)}` }}
              />
              {theme.label}
            </span>
            <ArrowUpRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-zinc-200" />
          </div>
          <h3 className="mt-3 text-lg font-semibold text-zinc-100">{theme.metaphor}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{theme.tagline}</p>
        </div>

        <div
          className="mt-5 rounded-md border px-3 py-2 font-mono text-[11px]"
          style={{ borderColor: "rgb(var(--line) / 0.06)", background: "#08090c", color: theme.accent }}
        >
          {theme.prompt}
          <span className="ml-1 inline-block h-3 w-1.5 translate-y-0.5 animate-blink" style={{ background: theme.accent }} />
        </div>
      </Link>
    </motion.div>
  );
}
