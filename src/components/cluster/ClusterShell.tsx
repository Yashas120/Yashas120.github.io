"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { links } from "@/lib/clusterContent";
import { useClusterTheme, useTokens } from "./theme";
import styles from "./cluster.module.css";

const navigation = [
  ["Production", "#regional-consequences"],
  ["Experience", "#experience"],
  ["Systems", "#systems-evidence"],
  ["Beyond", "#beyond-the-lens"],
  ["Evidence", "#complete-project-index"],
  ["Contact", "#contact"],
] as const;

type ClusterVariables = CSSProperties & Record<`--cluster-${string}`, string>;

export function ClusterShell({ children }: Readonly<{ children: ReactNode }>) {
  const base = useTokens("base");
  const night = useTokens("inverted");
  const { mode, toggle } = useClusterTheme();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButton.current?.focus();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const variables: ClusterVariables = {
    "--cluster-base-canvas": base.canvas,
    "--cluster-base-ink": base.ink,
    "--cluster-base-muted": base.muted,
    "--cluster-base-line": base.line,
    "--cluster-base-blue": base.blue,
    "--cluster-base-coral": base.coral,
    "--cluster-base-green": base.green,
    "--cluster-night-canvas": night.canvas,
    "--cluster-night-ink": night.ink,
    "--cluster-night-muted": night.muted,
    "--cluster-night-line": night.line,
    "--cluster-night-blue": night.blue,
    "--cluster-night-coral": night.coral,
    "--cluster-night-green": night.green,
  };

  return (
    <div className={styles.root} style={variables}>
      <a className={styles.skipLink} href="#cluster-main">
        Skip to main content
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a className={styles.name} href="#identity" aria-label="Yashas Kadambi, start of portfolio">
            Yashas Kadambi
          </a>
          <nav className={styles.nav} aria-label="Portfolio sections">
            {navigation.map(([label, href]) => (
              <a key={href} className={styles.navLink} href={href}>
                {label}
              </a>
            ))}
          </nav>
          <div className={styles.headerActions}>
            <a className={styles.iconButton} href={links.github.href} target="_blank" rel="noreferrer noopener" aria-label="GitHub profile (opens in a new tab)">
              GH
            </a>
            <button
              type="button"
              className={styles.iconButton}
              onClick={toggle}
              aria-pressed={mode === "light"}
              aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {mode === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>
            <button
              ref={menuButton}
              type="button"
              className={styles.menuButton}
              aria-expanded={open}
              aria-controls="cluster-mobile-nav"
              aria-label={open ? "Close section menu" : "Open section menu"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
          {open && (
            <nav id="cluster-mobile-nav" className={styles.mobileNav} aria-label="Portfolio sections, mobile">
              {navigation.map(([label, href]) => (
                <a key={href} className={styles.navLink} href={href} onClick={() => setOpen(false)}>
                  {label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
