/**
 * /devtools — "Inspect the delivery system."
 *
 * A DevOps and platform-engineering portfolio framed as a browser with a docked
 * inspector. The document on the left is the portfolio; the inspector on the right
 * explains the delivery system behind it. The frame is a metaphor, not the
 * information architecture — a visitor never has to decode it to read a role, a
 * result, a project or a contact method.
 *
 * A server component: the whole readable page, including every diagram's text
 * equivalent, is in the exported HTML. The inspector, the mobile sheet and the
 * evidence drawers are the only client code, and each is additive.
 */

import { BrowserShell } from "@/components/devops/BrowserShell";
import { InspectorDock } from "@/components/devops/InspectorDock";
import { MobileInspectorSheet } from "@/components/devops/MobileInspectorSheet";
import { PortfolioDocument } from "@/components/devops/PortfolioDocument";
import { PortfolioHeader } from "@/components/devops/PortfolioHeader";
import { TabletPanelBar } from "@/components/devops/TabletPanelBar";
import { DV } from "@/components/devops/tokens";

export default function DevToolsPage() {
  return (
    <div className="devops min-h-screen">
      <a
        href="#main-content"
        className="skip-link m-2 rounded-md px-3 py-2 text-[14px]"
        style={{ background: DV.amber, color: DV.canvas }}
      >
        Skip to portfolio
      </a>

      <PortfolioHeader />
      <TabletPanelBar />

      <BrowserShell>
        {/* 58/42 split only once there is room for it; one column below that. */}
        <div className="grid grid-cols-1 dock:grid-cols-[58fr_42fr]">
          <PortfolioDocument />
          <InspectorDock />
        </div>
      </BrowserShell>

      {/* Bottom padding clears the sticky mobile trigger. */}
      <div className="h-20 md:h-0" aria-hidden />
      <MobileInspectorSheet />
    </div>
  );
}
