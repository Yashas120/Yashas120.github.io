"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PHOSPHOR } from "./desktop/types";

const post = [
  "yashOS portfolio lab — Yashas Srinivasan Kadambi",
  "Reading verified profile data ...",
  "  ROLE: Systems Software Engineer ................ OK",
  "  INDEX: projects, experience, evidence .......... OK",
  "Starting optional desktop interface ...",
];

const dmesg: { t: string; msg: string; ok?: boolean }[] = [
  { t: "0.000000", msg: "Starting the optional yashOS portfolio interface ..." },
  { t: "0.004211", msg: "profile: Systems Software Engineer" },
  { t: "0.019887", msg: "identity: Yashas Srinivasan Kadambi" },
  { t: "0.041002", msg: "edu: PES University, B.Tech CSE — GPA 3.78 / 4", ok: true },
  { t: "0.088150", msg: "sched: ghOSt experiment; CFS and FIFO baselines indexed" },
  { t: "0.132774", msg: "cisco: optical line-card contribution indexed", ok: true },
  { t: "0.201339", msg: "hardware: secure-boot and CDR integration evidence indexed" },
  { t: "0.256610", msg: "net: 2 publications, AWS Developer Associate cert mounted", ok: true },
  { t: "0.301998", msg: "init: reached target multi-user — 8 services ready" },
  { t: "0.334120", msg: "systemd: starting display manager ..." },
];

const login = [
  { text: "yashOS 6.11 tty1", delay: 260 },
  { text: "login: yashas", delay: 420 },
  { text: "Password: ••••••••••", delay: 380 },
  { text: "Last login: today, from 127.0.0.1", delay: 240 },
];

type Stage = "post" | "dmesg" | "login" | "menu";

const AUTO_SECONDS = 6;

// A GRUB-style choice so anyone can pick how to read the profile. The first
// entry preserves the original behaviour (drop straight into the desktop); the
// second is a plain-text path for non-technical visitors.
const menuEntries = [
  {
    id: "desktop",
    label: "yashOS — graphical desktop",
    note: "explore the optional portfolio lab as applications",
  },
  {
    id: "terminal",
    label: "yashOS — pre-boot shell",
    note: "type commands to explore first · press F5 there to boot the desktop",
  },
];

export function BootSequence({
  onDone,
  onReadTerminal,
}: Readonly<{ onDone: () => void; onReadTerminal: () => void }>) {
  const [stage, setStage] = useState<Stage>("post");
  const [n, setN] = useState(0);
  const [sel, setSel] = useState(0);
  const [countdown, setCountdown] = useState(AUTO_SECONDS);
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  const reducedMotion = useReducedMotion();

  const choose = (id: string) => {
    if (done.current) return;
    done.current = true;
    if (id === "terminal") onReadTerminal();
    else onDone();
  };

  useEffect(() => {
    if (!reducedMotion || done.current) return;
    done.current = true;
    onDone();
  }, [onDone, reducedMotion]);

  // Type out POST -> dmesg -> login, then hand off to the boot menu.
  useEffect(() => {
    if (reducedMotion) return;
    if (stage === "post") {
      if (n < post.length) {
        const id = setTimeout(() => setN((c) => c + 1), n === 0 ? 180 : 120);
        return () => clearTimeout(id);
      }
      const id = setTimeout(() => {
        setStage("dmesg");
        setN(0);
      }, 260);
      return () => clearTimeout(id);
    }

    if (stage === "dmesg") {
      if (n < dmesg.length) {
        const id = setTimeout(() => setN((c) => c + 1), 130);
        return () => clearTimeout(id);
      }
      const id = setTimeout(() => {
        setStage("login");
        setN(0);
      }, 300);
      return () => clearTimeout(id);
    }

    if (stage === "login") {
      if (n < login.length) {
        const id = setTimeout(() => setN((c) => c + 1), login[n].delay);
        return () => clearTimeout(id);
      }
      const id = setTimeout(() => setStage("menu"), 420);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, n, reducedMotion]);

  // Countdown that auto-boots the highlighted (desktop) entry, unless the
  // visitor interacts — then we stop and let them choose deliberately.
  useEffect(() => {
    if (stage !== "menu" || paused) return;
    if (countdown <= 0) {
      choose(menuEntries[0].id);
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, countdown, paused]);

  useEffect(() => {
    if (stage !== "menu") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setPaused(true);
        setSel((s) => (s + (e.key === "ArrowDown" ? 1 : menuEntries.length - 1)) % menuEntries.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        choose(menuEntries[sel].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, sel]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [n, stage]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.35 }}
      className="crt fixed inset-0 z-[70] overflow-hidden"
    >
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto px-5 py-6 font-mono text-[11px] leading-relaxed sm:px-8 sm:text-[12px]"
      >
        {post.slice(0, stage === "post" ? n : post.length).map((l) => (
          <p key={l} style={{ color: "rgb(var(--term-dim))" }}>
            {l}
          </p>
        ))}

        {stage !== "post" && (
          <div className="mt-3">
            {dmesg.slice(0, stage === "dmesg" ? n : dmesg.length).map((l) => (
              <div key={l.t} className="flex gap-2">
                <span className="flex-shrink-0 opacity-50" style={{ color: "rgb(var(--term-dim))" }}>
                  [{l.t}]
                </span>
                <span style={{ color: l.ok ? PHOSPHOR : "rgb(var(--term-dim))" }}>
                  {l.ok ? "[  OK  ] " : ""}
                  {l.msg}
                </span>
              </div>
            ))}
          </div>
        )}

        {(stage === "login" || stage === "menu") && (
          <div className="mt-4">
            {login.slice(0, stage === "login" ? n : login.length).map((l) => (
              <p key={l.text} style={{ color: PHOSPHOR }}>
                {l.text}
              </p>
            ))}
            {stage === "menu" && (
              <p style={{ color: PHOSPHOR }}>$ startx</p>
            )}
          </div>
        )}

        {stage === "menu" && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            aria-label="Choose how to view the profile"
            onMouseEnter={() => setPaused(true)}
            className="mt-5 max-w-xl rounded-md border p-3"
            style={{ borderColor: "rgba(74,222,128,0.3)", background: "rgba(74,222,128,0.05)" }}
          >
            <p className="mb-2" style={{ color: "rgb(var(--term-dim))" }}>
              How would you like to view my profile?
            </p>
            <ul className="space-y-1">
              {menuEntries.map((m, i) => {
                const active = i === sel;
                return (
                  <li key={m.id}>
                    <button
                      onClick={() => choose(m.id)}
                      onMouseEnter={() => {
                        setPaused(true);
                        setSel(i);
                      }}
                      className="w-full rounded px-2 py-1.5 text-left transition-colors"
                      style={{ background: active ? "rgba(74,222,128,0.14)" : "transparent" }}
                    >
                      <span className="block" style={{ color: active ? PHOSPHOR : "rgb(var(--term-dim))" }}>
                        {active ? "▸ " : "\u00A0\u00A0"}
                        {m.label}
                      </span>
                      <span className="block pl-4 text-[10px]" style={{ color: "rgb(var(--term-dim))" }}>
                        {m.note}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-[10px]" style={{ color: "rgb(var(--term-dim))" }}>
              Use ↑ ↓ and Enter ·{" "}
              {paused ? "auto-boot paused" : `booting the highlighted option in ${countdown}s`}
            </p>
          </motion.section>
        )}

        {stage !== "menu" && (
          <span
            className="ml-0.5 inline-block h-3 w-[7px] animate-blink align-middle"
            style={{ background: PHOSPHOR }}
          />
        )}
      </div>

      <button
        onClick={() => choose("desktop")}
        className="absolute right-4 top-4 rounded-md border px-3 py-1.5 font-mono text-[11px] transition-colors"
        style={{
          borderColor: "rgba(74,222,128,0.3)",
          color: PHOSPHOR,
          background: "rgba(74,222,128,0.06)",
        }}
      >
        skip →
      </button>
    </motion.div>
  );
}
