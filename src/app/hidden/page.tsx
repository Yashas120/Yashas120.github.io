"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";
import { themes } from "@/lib/themes";
import { profile } from "@/data/profile";
import { InterfaceCard } from "@/components/shared/InterfaceCard";

export default function HiddenLauncher() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-70" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] max-w-full -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(34,211,238,0.14), transparent)" }}
      />

      <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="font-mono text-xs text-zinc-500">
            <span className="text-cluster">$</span> whoami <span className="text-zinc-600">· private index</span>
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
            {profile.shortName}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            {profile.tagline}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-500">
            {profile.summary}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 font-mono text-xs text-zinc-400">
            <span className="rounded-full border border-line/10 px-3 py-1">{profile.current}</span>
            <span className="rounded-full border border-line/10 px-3 py-1">{profile.previous}</span>
            <span className="rounded-full border border-line/10 px-3 py-1">{profile.education}</span>
          </div>

          <div className="mt-5 flex items-center gap-4 text-zinc-400">
            <a href={profile.github} target="_blank" rel="noreferrer noopener" aria-label="GitHub" className="hover:text-zinc-100">
              <Github className="h-5 w-5" />
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer noopener" aria-label="LinkedIn" className="hover:text-zinc-100">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href={`mailto:${profile.email}`} aria-label="Email" className="hover:text-zinc-100">
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </motion.div>

        <div className="mt-12">
          <p className="mb-4 font-mono text-xs text-zinc-500">
            <span className="text-cluster">$</span> select --interface{" "}
            <span className="text-zinc-600">(same resume, six lenses — pick one, or ⌘K here)</span>
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {themes.map((t, i) => (
              <InterfaceCard key={t.id} theme={t} index={i} />
            ))}
          </div>
        </div>

        <p className="mt-14 font-mono text-[11px] text-zinc-600">
          private index · each interface is shared independently · next.js
        </p>
      </div>
    </main>
  );
}
