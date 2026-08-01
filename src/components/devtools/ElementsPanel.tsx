"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { profile } from "@/data/profile";
import { skills } from "@/data/skills";
import { experience } from "@/data/experience";

const ACCENT = "#f59e0b";
const tag = "#7dd3fc";
const attr = "#c4b5fd";
const val = "#fca5a5";
const txt = "#d4d4d8";

function Node({
  label,
  children,
  defaultOpen = false,
  depth = 0,
}: {
  label: React.ReactNode;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  depth?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = Boolean(children);
  return (
    <div style={{ paddingLeft: depth * 14 }}>
      <div
        className="flex cursor-pointer items-start gap-1 rounded py-0.5 hover:bg-line/[0.04]"
        onClick={() => hasChildren && setOpen((o) => !o)}
      >
        {hasChildren ? (
          <ChevronRight className="mt-0.5 h-3 w-3 flex-shrink-0 transition-transform" style={{ transform: open ? "rotate(90deg)" : "none", color: "#71717a" }} />
        ) : (
          <span className="w-3" />
        )}
        <span className="whitespace-pre-wrap">{label}</span>
      </div>
      {open && hasChildren && <div>{children}</div>}
    </div>
  );
}

const t = (name: string, close = false) => (
  <span style={{ color: tag }}>{`<${close ? "/" : ""}${name}>`}</span>
);

export function ElementsPanel() {
  return (
    <div className="p-3 font-mono text-[12px] leading-relaxed" style={{ color: txt }}>
      <Node depth={0} defaultOpen label={<>{t("body")}</>}>
        <Node depth={1} defaultOpen label={<><span style={{ color: tag }}>{"<main "}</span><span style={{ color: attr }}>id</span>=<span style={{ color: val }}>&quot;{profile.handle}&quot;</span><span style={{ color: attr }}> role</span>=<span style={{ color: val }}>&quot;engineer&quot;</span><span style={{ color: tag }}>{">"}</span></>}>
          <Node depth={2} label={<><span style={{ color: tag }}>{"<h1>"}</span> {profile.shortName} <span style={{ color: tag }}>{"</h1>"}</span></>} />
          <Node depth={2} label={<><span style={{ color: tag }}>{"<p "}</span><span style={{ color: attr }}>class</span>=<span style={{ color: val }}>&quot;summary&quot;</span><span style={{ color: tag }}>{">"}</span> {profile.tagline} <span style={{ color: tag }}>{"</p>"}</span></>} />

          <Node depth={2} defaultOpen label={<><span style={{ color: tag }}>{"<section "}</span><span style={{ color: attr }}>id</span>=<span style={{ color: val }}>&quot;experience&quot;</span><span style={{ color: tag }}>{">"}</span></>}>
            {experience.map((e) => (
              <Node key={e.id} depth={3} label={<><span style={{ color: tag }}>{"<article "}</span><span style={{ color: attr }}>data-org</span>=<span style={{ color: val }}>&quot;{e.org}&quot;</span><span style={{ color: tag }}>{">"}</span> {e.role} <span style={{ color: "#52525b" }}>({e.start}–{e.end})</span></>}>
                {e.points.slice(0, 2).map((p, i) => (
                  <Node key={i} depth={4} label={<><span style={{ color: tag }}>{"<li>"}</span> {p}</>} />
                ))}
              </Node>
            ))}
          </Node>

          <Node depth={2} label={<><span style={{ color: tag }}>{"<section "}</span><span style={{ color: attr }}>id</span>=<span style={{ color: val }}>&quot;skills&quot;</span><span style={{ color: tag }}>{">"}</span></>}>
            {skills.map((s) => (
              <Node key={s.category} depth={3} label={<><span style={{ color: attr }}>data-{s.category.toLowerCase().replace(/[^a-z]/g, "")}</span>=<span style={{ color: val }}>&quot;{s.items.join(", ")}&quot;</span></>} />
            ))}
          </Node>
          <span style={{ color: tag }}>{"</main>"}</span>
        </Node>
        <div>{t("body", true)}</div>
      </Node>
      <p className="mt-3 text-[11px]" style={{ color: "#52525b" }}>
        <span style={{ color: ACCENT }}>styles</span> · Inter / JetBrains Mono · dark theme · click nodes to expand the DOM
      </p>
    </div>
  );
}
