/**
 * The browser-like frame that holds the document and the inspector.
 *
 * Two deliberate restraints:
 *  - The address strip shows `portfolio://…`, an obviously internal scheme. There
 *    is no padlock and no invented hostname, because implying a secure connection
 *    to a domain that does not exist would be a small lie in a page whose whole
 *    argument is traceable evidence.
 *  - The window controls are decoration, so they are `aria-hidden` and are dropped
 *    entirely below 768px where they would only consume vertical space.
 */

import { CHROME_H, DV, MAX_WIDTH } from "./tokens";

export interface BrowserShellProps {
  children: React.ReactNode;
}

export function BrowserShell({ children }: Readonly<BrowserShellProps>) {
  return (
    <div className="mx-auto w-full px-0 sm:px-6 sm:py-6" style={{ maxWidth: MAX_WIDTH }}>
      <div
        className="overflow-hidden border-y sm:rounded-[14px] sm:border"
        style={{ borderColor: DV.border, background: DV.browser }}
      >
        {/* Browser chrome: desktop and tablet only. */}
        <div
          className="hidden items-center gap-3 border-b px-4 md:flex"
          style={{ height: CHROME_H, borderColor: DV.border, background: DV.browser }}
          aria-hidden
        >
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full" style={{ background: DV.border }} />
            <span className="h-3 w-3 rounded-full" style={{ background: DV.border }} />
            <span className="h-3 w-3 rounded-full" style={{ background: DV.border }} />
          </div>
          <div
            className="ml-2 flex-1 rounded-md border px-3 py-1 font-mono text-[12px]"
            style={{ borderColor: DV.border, background: DV.canvas, color: DV.muted }}
          >
            portfolio://delivery-system
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
