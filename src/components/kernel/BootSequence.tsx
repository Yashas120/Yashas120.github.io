"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PHOSPHOR } from "./desktop/types";

const post = [
  "yashOS BIOS v6.11 — Yashas Srinivasan Kadambi",
  "Detecting hardware ...",
  "  CPU0: engineer, 5 logical interfaces .......... OK",
  "  MEM:  8 projects, 2 publications .............. OK",
  "Booting from /dev/sda1 ...",
];

const dmesg: { t: string; msg: string; ok?: boolean }[] = [
  { t: "0.000000", msg: "Booting yashas-kernel 6.x (ghOSt-enabled) ..." },
  { t: "0.004211", msg: "CPU: detected engineer, 5 logical interfaces online" },
  { t: "0.019887", msg: "mem: loading identity — Yashas Srinivasan Kadambi" },
  { t: "0.041002", msg: "edu: PES University, B.Tech CSE — GPA 3.78 / 4", ok: true },
  { t: "0.088150", msg: "sched: registering ghOSt scheduling class over CFS/FIFO/Shinjuku" },
  { t: "0.132774", msg: "cisco: NCS 1014 line-card dataplane module loaded (Aquila)", ok: true },
  { t: "0.201339", msg: "crypto: secure-boot verified; CDR hardware attached" },
  { t: "0.256610", msg: "net: 2 publications, AWS Developer Associate cert mounted", ok: true },
  { t: "0.301998", msg: "init: reached target multi-user — 8 services ready" },
  { t: "0.334120", msg: "systemd: starting X display manager ..." },
];

const login = [
  { text: "yashOS 6.11 tty1", delay: 260 },
  { text: "login: yashas", delay: 420 },
  { text: "Password: ••••••••••", delay: 380 },
  { text: "Last login: today, from 127.0.0.1", delay: 240 },
  { text: "$ startx", delay: 520 },
];

type Stage = "post" | "dmesg" | "login";

export function BootSequence({ onDone }: Readonly<{ onDone: () => void }>) {
  const [stage, setStage] = useState<Stage>("post");
  const [n, setN] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    onDone();
  };

  useEffect(() => {
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
      const id = setTimeout(finish, 420);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, n]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [n, stage]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
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

        {stage === "login" && (
          <div className="mt-4">
            {login.slice(0, n).map((l) => (
              <p key={l.text} style={{ color: PHOSPHOR }}>
                {l.text}
              </p>
            ))}
          </div>
        )}

        <span
          className="ml-0.5 inline-block h-3 w-[7px] animate-blink align-middle"
          style={{ background: PHOSPHOR }}
        />
      </div>

      <button
        onClick={finish}
        className="absolute right-4 top-4 rounded-md border px-3 py-1.5 font-mono text-[11px] transition-colors"
        style={{
          borderColor: "rgba(74,222,128,0.3)",
          color: PHOSPHOR,
          background: "rgba(74,222,128,0.06)",
        }}
      >
        skip boot →
      </button>
    </motion.div>
  );
}
