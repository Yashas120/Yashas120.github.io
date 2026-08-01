"use client";

import { useRef } from "react";
import { ChevronDown, Github, Linkedin, Mail, Radio } from "lucide-react";
import { MotionConfig, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ClusterBackground } from "@/components/cluster/ClusterBackground";
import { RaftElection } from "@/components/cluster/RaftElection";
import { ReplicatedLog } from "@/components/cluster/ReplicatedLog";
import { HashRing } from "@/components/cluster/HashRing";
import { ServiceMesh } from "@/components/cluster/ServiceMesh";
import { SloDashboard } from "@/components/cluster/SloDashboard";
import { PartitionLab } from "@/components/cluster/PartitionLab";
import { PaperTrail } from "@/components/cluster/PaperTrail";
import { Membership } from "@/components/cluster/Membership";
import { Emerge, ScrollStage, StageOpen } from "@/components/cluster/scroll";
import { profile } from "@/data/profile";
import { hexToRgba } from "@/lib/utils";

const ACCENT = "#22d3ee";

function ActHead({
  n,
  label,
  title,
  subtitle,
}: Readonly<{ n: string; label: string; title?: string; subtitle?: string }>) {
  return (
    <div className="mb-6">
      <p className="font-mono text-[11px] tracking-wide text-zinc-600">
        <span style={{ color: ACCENT }}>{n}</span> — {label}
      </p>
      {title && (
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-zinc-400">{subtitle}</p>
      )}
    </div>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Push the camera *through* the title rather than sliding it away.
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const filter = useTransform(scrollYProgress, [0, 0.8], ["blur(0px)", "blur(16px)"]);

  return (
    <div ref={ref} className="relative h-screen">
      <motion.div
        style={{ opacity, y, scale, filter }}
        className="sticky top-0 flex h-screen flex-col items-center justify-center px-6 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-[11px] tracking-wide"
          style={{ color: ACCENT }}
        >
          raft://cluster · 5 nodes · term 8
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl"
        >
          {profile.shortName}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg"
        >
          A résumé that behaves like a distributed system. Nodes elect a leader, the career
          commits to a replicated log, and the projects hash onto a ring.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="absolute bottom-12 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[10.5px] text-zinc-600">scroll to reach quorum</span>
          <motion.span
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-4 w-4" style={{ color: ACCENT }} />
          </motion.span>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function ClusterPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  // Slower spring for the backdrop so scenery drifts rather than snaps.
  const bgProgress = useSpring(scrollYProgress, { stiffness: 55, damping: 26, mass: 0.7 });

  return (
    // reducedMotion="user" drops the 3D/scale transforms for visitors who ask
    // for less motion, while leaving opacity fades intact.
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-screen text-zinc-300">
        <ClusterBackground progress={bgProgress} />

        <div className="relative z-10">
          <header
            className="sticky top-0 z-40 border-b backdrop-blur"
            style={{ background: "rgb(var(--ink-900) / 0.72)", borderColor: hexToRgba(ACCENT, 0.15) }}
          >
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3 font-mono text-sm">
              <span className="text-zinc-500">Yashas Kadambi</span>
              <span className="flex items-center gap-2" style={{ color: ACCENT }}>
                <Radio className="h-4 w-4" /> raft://cluster
              </span>
              <span className="hidden items-center gap-1.5 text-xs text-zinc-500 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#4ade80" }} />{" "}
                quorum healthy
              </span>
            </div>
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] w-full origin-left"
              style={{ scaleX, background: ACCENT }}
            />
          </header>

          <Hero />

          <ScrollStage vh={280}>
            {(p) => (
              <StageOpen progress={p}>
                <ActHead n="01" label="consensus" />
                <RaftElection progress={p} />
              </StageOpen>
            )}
          </ScrollStage>

          <ScrollStage vh={360}>
            {(p) => (
              <StageOpen progress={p}>
                <ActHead
                  n="02"
                  label="replicated log"
                  title="The career, committed one entry at a time"
                  subtitle="An append-only log replays oldest to newest. Each entry commits as you scroll, then gets applied to the state machine."
                />
                <ReplicatedLog progress={p} />
              </StageOpen>
            )}
          </ScrollStage>

          <ScrollStage vh={340}>
            {(p) => (
              <StageOpen progress={p}>
                <ActHead
                  n="03"
                  label="key-space"
                  title="Projects, hashed onto the ring"
                  subtitle="Every project is a key. The needle sweeps the keyspace clockwise; whichever node owns that arc serves the request."
                />
                <HashRing progress={p} />
              </StageOpen>
            )}
          </ScrollStage>

          <ScrollStage vh={220}>
            {(p) => (
              <StageOpen progress={p}>
                <ActHead
                  n="04"
                  label="service mesh"
                  title="Capabilities, registered as services"
                  subtitle="Each skill group runs as its own service with its endpoints registered in the mesh."
                />
                <ServiceMesh progress={p} />
              </StageOpen>
            )}
          </ScrollStage>

          <ScrollStage vh={260}>
            {(p) => (
              <StageOpen progress={p}>
                <ActHead
                  n="05"
                  label="SLIs"
                  title="Numbers that survived production"
                  subtitle="Measured impact rather than adjectives."
                />
                <SloDashboard progress={p} />
              </StageOpen>
            )}
          </ScrollStage>

          <ScrollStage vh={260}>
            {(p) => (
              <StageOpen progress={p}>
                <ActHead
                  n="06"
                  label="chaos"
                  title="Break the cluster on purpose"
                  subtitle="Cut the network in half and watch Raft trade availability for consistency. The quorum maths decides what happens."
                />
                <PartitionLab />
              </StageOpen>
            )}
          </ScrollStage>

          <ScrollStage vh={200}>
            {(p) => (
              <StageOpen progress={p}>
                <ActHead
                  n="07"
                  label="published work"
                  title="Papers, filed as RFCs"
                  subtitle="Peer-reviewed work, with DOIs if you want the full text."
                />
                <PaperTrail progress={p} />
              </StageOpen>
            )}
          </ScrollStage>

          <ScrollStage vh={230}>
            {(p) => (
              <StageOpen progress={p}>
                <ActHead
                  n="08"
                  label="membership"
                  title="Gossip — awards, certs and education"
                  subtitle="The membership list every node agrees on."
                />
                <Membership progress={p} />
              </StageOpen>
            )}
          </ScrollStage>

          <section className="mx-auto max-w-5xl px-6 pb-28 pt-10">
            <Emerge>
              <div
                className="rounded-xl border p-6 font-mono text-sm backdrop-blur"
                style={{ borderColor: hexToRgba(ACCENT, 0.25), background: hexToRgba(ACCENT, 0.04) }}
              >
                <p className="text-xs text-zinc-500">{"// send an RPC to the leader"}</p>
                <p className="mt-2 text-zinc-300">
                  <span style={{ color: ACCENT }}>POST</span> /rpc/contact {"{"}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-2 rounded-md border border-line/10 px-3 py-2 text-zinc-200 transition-colors hover:border-line/30"
                  >
                    <Mail className="h-4 w-4" /> {profile.email}
                  </a>
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-md border border-line/10 px-3 py-2 text-zinc-200 transition-colors hover:border-line/30"
                  >
                    <Github className="h-4 w-4" /> @{profile.githubUser}
                  </a>
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-md border border-line/10 px-3 py-2 text-zinc-200 transition-colors hover:border-line/30"
                  >
                    <Linkedin className="h-4 w-4" /> linkedin
                  </a>
                </div>
                <p className="mt-3 text-zinc-500">{"}"}</p>
              </div>
            </Emerge>
          </section>
        </div>
      </main>
    </MotionConfig>
  );
}
