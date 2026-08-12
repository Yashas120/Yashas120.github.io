"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { profile } from "@/data/profile";
import { demoEvidence, type DemoId } from "@/data/demos";
import { hexToRgba } from "@/lib/utils";
import { DesktopProvider } from "./DesktopContext";
import { DesktopTour } from "./DesktopTour";
import { Dock } from "./Dock";
import { MenuBar } from "./MenuBar";
import { Window } from "./Window";
import { PHOSPHOR, type AppDef, type WinState } from "./types";

const MOBILE_QUERY = "(max-width: 860px)";
const MIN_W = 300;
const MIN_H = 200;
// Assumed surface size before the real one can be measured. Used for the very
// first render so the initial windows exist in the server-rendered HTML; a mount
// effect re-clamps everything to the actual viewport straight after.
const ASSUMED_W = 1200;
const ASSUMED_H = 700;

/** Sizes and positions a window so it sits fully inside the given surface. */
function place(app: AppDef, availW: number, availH: number): WinState {
  const w = Math.min(app.size.w, Math.max(MIN_W, availW - 48));
  const h = Math.min(app.size.h, Math.max(MIN_H, availH - 96));
  return {
    id: app.id,
    x: Math.max(12, Math.min(app.pos.x, availW - w - 12)),
    y: Math.max(12, Math.min(app.pos.y, availH - h - 12)),
    w,
    h,
    minimized: false,
    maximized: false,
  };
}

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

export function Desktop({
  apps,
  initialOpen,
  active = true,
  routeAppId,
  routeDemoId,
  onAppOpen,
  onDemoOpen,
  onRoutedAppClose,
  onReplayBoot,
  returnHref,
}: Readonly<{
  apps: AppDef[];
  initialOpen: string[];
  active?: boolean;
  routeAppId?: string;
  routeDemoId?: DemoId;
  onAppOpen?: (id: string) => void;
  onDemoOpen?: (id: DemoId) => void;
  onRoutedAppClose?: () => void;
  onReplayBoot: () => void;
  returnHref: string;
}>) {
  const [wins, setWins] = useState<WinState[]>(() =>
    initialOpen
      .map((id) => apps.find((a) => a.id === id))
      .filter((a): a is AppDef => !!a)
      .map((a) => place(a, ASSUMED_W, ASSUMED_H))
  );
  const [panic, setPanic] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [demoId, setDemoId] = useState<DemoId | null>(routeDemoId ?? null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const openersRef = useRef(new Map<string, HTMLElement>());
  const panicOpenerRef = useRef<HTMLElement | null>(null);
  const mobile = useIsMobile();
  const reducedMotion = useReducedMotion();

  const byId = useMemo(() => new Map(apps.map((a) => [a.id, a])), [apps]);

  const spawn = useCallback((app: AppDef): WinState => {
    const box = surfaceRef.current?.getBoundingClientRect();
    return place(app, box?.width ?? ASSUMED_W, box?.height ?? ASSUMED_H);
  }, []);

  const focus = useCallback((id: string) => {
    setWins((ws) => {
      const target = ws.find((w) => w.id === id);
      if (!target || ws.at(-1)?.id === id) return ws;
      return [...ws.filter((w) => w.id !== id), { ...target, minimized: false }];
    });
  }, []);

  const openWindow = useCallback(
    (id: string) => {
      const app = byId.get(id);
      if (!app) return;
      setWins((ws) => {
        const existing = ws.find((w) => w.id === id);
        if (!existing) return [...ws, spawn(app)];
        return [...ws.filter((w) => w.id !== id), { ...existing, minimized: false }];
      });
    },
    [byId, spawn]
  );

  const open = useCallback(
    (id: string) => {
      if (document.activeElement instanceof HTMLElement) openersRef.current.set(id, document.activeElement);
      openWindow(id);
      onAppOpen?.(id);
    },
    [onAppOpen, openWindow]
  );

  const openDemo = useCallback((nextDemoId: DemoId) => {
    if (document.activeElement instanceof HTMLElement) openersRef.current.set("demo-lab", document.activeElement);
    setDemoId(nextDemoId);
    openWindow("demo-lab");
    onDemoOpen?.(nextDemoId);
  }, [onDemoOpen, openWindow]);

  const close = useCallback((id: string) => {
    setWins((ws) => ws.filter((w) => w.id !== id));
    if (routeAppId === id) onRoutedAppClose?.();
    const opener = openersRef.current.get(id);
    openersRef.current.delete(id);
    if (id === "demo-lab") setDemoId(null);
    window.requestAnimationFrame(() => opener?.focus());
  }, [onRoutedAppClose, routeAppId]);

  const update = useCallback((id: string, patch: Partial<WinState>) => {
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }, []);

  /** Dock behaviour: focused -> minimize, minimized/background -> raise, closed -> open. */
  const toggle = useCallback(
    (id: string) => {
      const top = wins.at(-1);
      if (top?.id === id && !top.minimized && !mobile) {
        update(id, { minimized: true });
        return;
      }
      open(id);
    },
    [wins, mobile, open, update]
  );

  // The seed above had to guess the surface size so the windows would exist in the
  // server-rendered HTML. Now that it can be measured, lay them out for real.
  useEffect(() => {
    const box = surfaceRef.current?.getBoundingClientRect();
    if (!box) return;
    setWins((ws) =>
      ws.map((w) => {
        const app = byId.get(w.id);
        return app ? place(app, box.width, box.height) : w;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previousRouteApp = useRef<string>();
  useEffect(() => {
    if (!active) return;
    const previous = previousRouteApp.current;
    if (previous && previous !== routeAppId) {
      setWins((ws) => ws.filter((win) => win.id !== previous));
    }
    if (routeAppId) openWindow(routeAppId);
    previousRouteApp.current = routeAppId;
  }, [active, openWindow, routeAppId]);

  useEffect(() => {
    if (routeDemoId) setDemoId(routeDemoId);
  }, [routeDemoId]);

  useEffect(() => {
    if (!shellRef.current) return;
    shellRef.current.inert = !active || tourOpen || panic;
  }, [active, panic, tourOpen]);

  useEffect(() => {
    if (!panic) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanic(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.requestAnimationFrame(() => panicOpenerRef.current?.focus());
    };
  }, [panic]);

  const closeTour = useCallback(() => {
    setTourOpen(false);
  }, []);

  const visible = wins.filter((w) => !w.minimized);
  const topId = visible.at(-1)?.id ?? null;
  const triggerPanic = useCallback(() => {
    panicOpenerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPanic(true);
  }, []);
  const api = useMemo(
    () => ({ open, close, isOpen: (id: string) => wins.some((w) => w.id === id), panic: triggerPanic, openDemo, demoId }),
    [open, close, triggerPanic, wins, openDemo, demoId]
  );

  return (
    <DesktopProvider value={api}>
      <div ref={shellRef} aria-hidden={!active || undefined} className="flex h-[100dvh] flex-col overflow-hidden">
        <MenuBar
          apps={apps}
          activeTitle={topId ? byId.get(topId)?.title : undefined}
          onLaunch={open}
          onHelp={() => setTourOpen(true)}
          onReplayBoot={onReplayBoot}
          returnHref={returnHref}
        />

        <div ref={surfaceRef} className="wallpaper relative min-h-0 flex-1 overflow-hidden">
          {/* Desktop launcher icons */}
          {!mobile && (
            <ul className="absolute left-3 top-3 z-0 grid w-20 gap-1">
              {apps
                .filter((a) => a.onDesktop)
                .map((a) => {
                  const Icon = a.icon;
                  return (
                    <li key={a.id}>
                      <button
                        onClick={() => open(a.id)}
                        title={a.blurb ?? a.friendly}
                        className="flex w-full flex-col items-center gap-1 rounded-lg px-1 py-2 transition-colors hover:bg-line/10"
                      >
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-lg border"
                          style={{
                            borderColor: hexToRgba(PHOSPHOR, 0.22),
                            background: "rgb(var(--ink-800) / 0.7)",
                          }}
                        >
                          <Icon className="h-4 w-4" style={{ color: PHOSPHOR }} />
                        </span>
                        <span className="w-full truncate text-center text-[9px] leading-tight text-zinc-300">
                          {a.friendly}
                        </span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          )}

          <AnimatePresence>
            {visible.map((w, i) => {
              const registeredApp = byId.get(w.id);
              if (!registeredApp) return null;
              const app = registeredApp.id === "demo-lab" && demoId
                ? { ...registeredApp, title: `demo-lab — ${demoEvidence(demoId).projectTitle}` }
                : registeredApp;
              // On mobile only the topmost window is rendered — one app at a time.
              if (mobile && w.id !== topId) return null;
              return (
                <Window
                  key={w.id}
                  app={app}
                  state={w}
                  focused={w.id === topId}
                  mobile={mobile}
                  z={10 + i}
                  onFocus={() => focus(w.id)}
                  onClose={() => close(w.id)}
                  onMinimize={() => update(w.id, { minimized: true })}
                  onToggleMax={() => update(w.id, { maximized: !w.maximized })}
                  onMove={(x, y) => {
                    const box = surfaceRef.current?.getBoundingClientRect();
                    const maxX = (box?.width ?? 1200) - 80;
                    const maxY = (box?.height ?? 700) - 40;
                    update(w.id, {
                      x: Math.max(-w.w + 120, Math.min(x, maxX)),
                      y: Math.max(0, Math.min(y, maxY)),
                    });
                  }}
                  onResize={(width, height) => {
                    const box = surfaceRef.current?.getBoundingClientRect();
                    update(w.id, {
                      w: Math.max(MIN_W, Math.min(width, (box?.width ?? 1200) - w.x - 8)),
                      h: Math.max(MIN_H, Math.min(height, (box?.height ?? 700) - w.y - 8)),
                    });
                  }}
                >
                  {app.render()}
                </Window>
              );
            })}
          </AnimatePresence>

          {!mobile && <Dock apps={apps} openIds={wins.map((w) => w.id)} activeId={topId} mobile={false} onLaunch={toggle} />}
        </div>

        {mobile && <Dock apps={apps} openIds={wins.map((w) => w.id)} activeId={topId} mobile onLaunch={toggle} />}
      </div>

      <DesktopTour open={tourOpen} onClose={closeTour} />

      <AnimatePresence>
        {panic && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="kernel-panic-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.16 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-6"
            style={{ background: "#0000aa" }}
          >
            <div className="max-w-lg font-mono text-[13px] text-zinc-50">
              <p id="kernel-panic-title" className="mb-3 flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-5 w-5" /> Kernel panic - not syncing: Attempted to kill init!
              </p>
              <pre className="whitespace-pre-wrap leading-relaxed opacity-90">{`Portfolio call trace (illustrative):
  hire_this_engineer+0x0/0xff
  read_the_resume+0x2a
  send_email+0x1c [${profile.email}]

Kidding. Nothing broke.`}</pre>
              <button
                autoFocus
                onClick={() => setPanic(false)}
                className="mt-5 min-h-11 rounded border border-white/50 px-4 text-left hover:bg-white/10"
              >
                Return to yashOS
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DesktopProvider>
  );
}
