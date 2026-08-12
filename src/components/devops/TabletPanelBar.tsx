/**
 * Tablet-only jump bar for the inline inspectors.
 *
 * Anchor links to the inline panels rather than buttons: switching works before
 * hydration and with scripting disabled, and it uses the browser's own
 * fragment navigation instead of reimplementing it.
 */

import { PANEL_IDS, panelLabel } from "@/data/devops/chapters";
import { DV, HEADER_H } from "./tokens";

export function TabletPanelBar() {
  return (
    <nav
      aria-label="Inspector panels"
      className="sticky z-30 hidden border-b md:block dock:hidden"
      style={{ top: HEADER_H, borderColor: DV.border, background: DV.inspector }}
    >
      <ul className="m-0 flex list-none gap-1 overflow-x-auto p-0 px-4 no-scrollbar">
        {PANEL_IDS.map((id) => (
          <li key={id}>
            <a
              href={`#inline-${id}`}
              className="inline-flex min-h-[44px] items-center px-2 font-mono text-[12px]"
              style={{ color: DV.muted }}
            >
              {panelLabel[id]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
