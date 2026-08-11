"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { skills } from "@/data/skills";
import { experience } from "@/data/experience";
import { publications } from "@/data/publications";
import { useDesktop } from "../desktop/DesktopContext";
import { BOOT_LABEL } from "../desktop/uptime";
import { PHOSPHOR } from "../desktop/types";

const LOGO = [
  "        .--.       ",
  "       |o_o |      ",
  "       |:_/ |      ",
  "      //   \\ \\     ",
  "     (|     | )    ",
  "    /'\\_   _/`\\    ",
  "    \\___)=(___/    ",
];

// Kept free of `Date.now()`: this renders during SSR of a static export, so a
// clock-derived value would drift from the client and trip a hydration mismatch.
// The live uptime counter lives in the menu bar tray instead.
const FACTS: [string, string][] = [
  ["OS", "yashOS 6.11 (ghOSt-enabled)"],
  ["Host", "UC San Diego · ex-Cisco"],
  ["Kernel", "6.11.0-yashas"],
  ["Uptime", `since ${BOOT_LABEL}`],
  ["Shell", "/bin/yash"],
  ["Packages", `${projects.length} projects, ${publications.length} papers`],
  ["CPU", "Systems + Distributed (5 cores)"],
  ["Memory", "Python, Java, C/C++, TypeScript"],
  ["Locale", profile.location],
];

function neofetch(): string[] {
  const right = [
    `yashas@kernel`,
    `-------------`,
    ...FACTS.map(([k, v]) => `${(k + ":").padEnd(10)}${v}`),
  ];
  const rows = Math.max(LOGO.length, right.length);
  const out: string[] = [];
  for (let i = 0; i < rows; i += 1) {
    out.push(`${(LOGO[i] ?? "").padEnd(20)}${right[i] ?? ""}`);
  }
  return out;
}

const APPS = ["htop", "systemd", "man", "proc", "sched", "papers", "mail"];

export function Terminal({ autoFocus = false }: Readonly<{ autoFocus?: boolean }>) {
  const desktop = useDesktop();
  const [history, setHistory] = useState<{ cmd: string; out: string[] }[]>([
    { cmd: "neofetch", out: neofetch() },
  ]);
  const [recall, setRecall] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [history]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    setRecall((r) => [cmd, ...r]);
    setCursor(-1);

    const [head, ...args] = cmd.split(/\s+/);
    let out: string[] = [];

    switch (head) {
      case "help":
        out = [
          "builtin commands:",
          "  neofetch          system summary",
          "  whoami            identity + summary",
          "  ps                running projects",
          "  lsmod             loaded skills",
          "  jobs              career history",
          "  man yashas        the full resume",
          "  open <app>        launch a window",
          `  ls                ${APPS.join("  ")}`,
          "  contact           how to reach me",
          "  uname -a          kernel version",
          "  panic             (don't)",
          "  clear             clear the screen",
        ];
        break;
      case "neofetch":
        out = neofetch();
        break;
      case "whoami":
        out = [profile.name, "", profile.summary];
        break;
      case "ps":
        out = [
          "  PID %CPU %MEM STAT COMMAND",
          ...projects.map(
            (p) =>
              `${String(p.pid).padStart(5)} ${p.cpu.toFixed(1).padStart(4)} ${p.mem
                .toFixed(1)
                .padStart(4)} ${p.state.padEnd(4)} ${p.title}`
          ),
          "",
          "run `open htop` for details.",
        ];
        break;
      case "lsmod":
        out = [
          `${"Module".padEnd(16)}Used by`,
          ...skills.map((s) => `${s.category.toLowerCase().padEnd(16)}${s.items.join(", ")}`),
        ];
        break;
      case "jobs":
        out = experience.map(
          (e) => `[${e.end === "Present" ? "+" : "-"}] ${e.start}–${e.end}  ${e.role} @ ${e.org}`
        );
        break;
      case "man":
        if (args[0] && args[0] !== "yashas") {
          out = [`No manual entry for ${args[0]}`];
          break;
        }
        desktop.open("man");
        out = ["opening man(1) yashas ..."];
        break;
      case "ls":
        out = [APPS.join("  ")];
        break;
      case "open":
        if (!args[0]) {
          out = [`usage: open <app>`, `apps: ${APPS.join(", ")}`];
        } else if (!APPS.includes(args[0])) {
          out = [`open: no such app: ${args[0]}`];
        } else {
          desktop.open(args[0]);
          out = [`launching ${args[0]} ...`];
        }
        break;
      case "contact":
        desktop.open("mail");
        out = [
          `email:    ${profile.email}`,
          `github:   ${profile.github}`,
          `linkedin: ${profile.linkedin}`,
        ];
        break;
      case "uname":
        out = [
          "yashOS kernel 6.11.0-yashas #1 SMP PREEMPT_RT systems+distributed x86_64 GNU/Linux",
        ];
        break;
      case "sudo":
        out = ["yashas is not in the sudoers file. This incident has been reported."];
        break;
      case "exit":
        out = ["there is no exit — only ⌘W"];
        break;
      case "panic":
        desktop.panic();
        out = ["triggering kernel panic ..."];
        break;
      case "clear":
        setHistory([]);
        return;
      default:
        out = [`${head}: command not found (try 'help')`];
    }

    setHistory((h) => [...h, { cmd, out }]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    if (e.key === "Enter") {
      run(el.value);
      el.value = "";
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(cursor + 1, recall.length - 1);
      if (next >= 0) {
        setCursor(next);
        el.value = recall[next];
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = cursor - 1;
      setCursor(next);
      el.value = next >= 0 ? recall[next] : "";
    }
  };

  return (
    // Clicking anywhere in the pane focuses the prompt, the way a real terminal
    // behaves. The input itself stays in the tab order for keyboard users.
    <div
      onMouseDown={(e) => {
        if (e.target !== inputRef.current) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }}
      className="min-h-full cursor-text px-4 py-3 font-mono text-[11.5px] leading-relaxed"
    >
      {history.map((h, i) => (
        <div key={`${h.cmd}-${i}`} className="mb-2">
          <p>
            <span style={{ color: PHOSPHOR }}>yashas@kernel</span>
            <span style={{ color: "rgb(var(--term-dim))" }}>:~$ {h.cmd}</span>
          </p>
          {h.out.map((line, j) => (
            <p
              key={`${line}-${j}`}
              className="whitespace-pre-wrap"
              style={{ color: "rgb(var(--term-dim))" }}
            >
              {line}
            </p>
          ))}
        </div>
      ))}

      <div className="flex items-center gap-2">
        <span style={{ color: PHOSPHOR }}>yashas@kernel</span>
        <span style={{ color: "rgb(var(--term-dim))" }}>:~$</span>
        <input
          ref={inputRef}
          aria-label="Terminal input"
          className="min-w-0 flex-1 bg-transparent outline-none"
          style={{ color: PHOSPHOR }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}
