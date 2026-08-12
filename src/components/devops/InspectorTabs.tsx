/**
 * The inspector tab strip.
 *
 * A real tablist: roving tabIndex, Left/Right/Home/End, aria-selected and
 * aria-controls pointing at the panel's id. Enter and Space are handled by the
 * buttons themselves.
 *
 * The labels are Overview, Pipeline, Infrastructure, Reliability, DevEx and
 * Evidence — categories a visitor can read without knowing a browser's developer
 * tools.
 */

"use client";

import { useRef } from "react";
import { PANEL_IDS, panelLabel, type PanelId } from "@/data/devops/chapters";
import { DV, TAB_H } from "./tokens";

export interface InspectorTabsProps {
  active: PanelId;
  onSelect: (panel: PanelId) => void;
  /** Prefix for the tab/panel id pair, so several renderings can coexist. */
  idPrefix: string;
  className?: string;
}

export function InspectorTabs({ active, onSelect, idPrefix, className }: Readonly<InspectorTabsProps>) {
  const strip = useRef<HTMLDivElement>(null);

  const move = (delta: number | "home" | "end") => {
    const index = PANEL_IDS.indexOf(active);
    const next =
      delta === "home"
        ? 0
        : delta === "end"
          ? PANEL_IDS.length - 1
          : (index + delta + PANEL_IDS.length) % PANEL_IDS.length;
    onSelect(PANEL_IDS[next]);
    // Keyboard navigation moves focus with the selection, as a tablist should.
    strip.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  };

  return (
    <div
      ref={strip}
      role="tablist"
      aria-label="Inspector panels"
      className={`flex overflow-x-auto border-b no-scrollbar ${className ?? ""}`}
      style={{ height: TAB_H, borderColor: DV.border, background: DV.inspector }}
      onKeyDown={(e) => {
        const key = e.key;
        if (key === "ArrowRight") move(1);
        else if (key === "ArrowLeft") move(-1);
        else if (key === "Home") move("home");
        else if (key === "End") move("end");
        else return;
        e.preventDefault();
      }}
    >
      {PANEL_IDS.map((id) => {
        const selected = id === active;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${id}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(id)}
            className="whitespace-nowrap border-b-2 px-3 font-mono text-[12px] transition-colors duration-150"
            style={{
              borderColor: selected ? DV.amber : "transparent",
              color: selected ? DV.amber : DV.muted,
            }}
          >
            {panelLabel[id]}
          </button>
        );
      })}
    </div>
  );
}
