"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";

interface LenisContextType {
  /** Call to get the current Lenis instance (may be null during SSR) */
  getLenis: () => Lenis | null;
}

const LenisContext = createContext<LenisContextType>({
  getLenis: () => null,
});

/** Access the Lenis instance via React Context — idiomatic React */
export function useLenis() {
  return useContext(LenisContext);
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const historyNavigation = useRef(false);
  const positions = useRef(new Map<string, number>());
  const restoreY = useRef<number | undefined>(undefined);

  useEffect(() => {
    const rememberDeparture = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank") return;
      if (link.origin === window.location.origin && link.pathname !== window.location.pathname) {
        const y = document.body.style.position === "fixed" ? -parseFloat(document.body.style.top || "0") : window.scrollY;
        positions.current.set(window.location.href, y);
      }
    };
    const onPopState = () => {
      historyNavigation.current = window.location.pathname !== previousPath.current;
      restoreY.current = positions.current.get(window.location.href);
    };
    document.addEventListener("click", rememberDeparture, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", rememberDeparture, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useLayoutEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (historyNavigation.current) {
      historyNavigation.current = false;
      const y = restoreY.current;
      restoreY.current = undefined;
      const frame = requestAnimationFrame(() => {
        lenisRef.current?.resize();
        lenisRef.current?.scrollTo(y ?? window.scrollY, { immediate: true, force: true });
        if (y !== undefined) window.scrollTo({ top: y, behavior: "instant" });
      });
      return () => cancelAnimationFrame(frame);
    }
    // Reset both native scroll and Lenis' previous destination on a new page.
    // Query-only catalog updates and browser history keep their position.
    const hash = window.location.hash.slice(1);
    const target = hash ? document.getElementById(decodeURIComponent(hash)) : null;
    if (hash && !target) return;
    lenisRef.current?.resize();
    lenisRef.current?.scrollTo(target ?? 0, { immediate: true, force: true });
    if (target) target.scrollIntoView({ behavior: "instant" });
    else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    const prefersNativeScroll = window.matchMedia(
      "(prefers-reduced-motion: reduce), (hover: none), (pointer: coarse)",
    );
    if (prefersNativeScroll.matches) return;

    let cancelled = false;
    let animationFrameId = 0;
    let lenis: Lenis | null = null;

    void import("lenis").then(({ default: LenisConstructor }) => {
      if (cancelled) return;

      lenis = new LenisConstructor({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        anchors: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      });
      lenisRef.current = lenis;

      function raf(time: number) {
        lenis?.raf(time);
        animationFrameId = requestAnimationFrame(raf);
      }

      animationFrameId = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, []);

  const contextValue = useMemo<LenisContextType>(() => ({
    getLenis: () => lenisRef.current,
  }), []);

  return (
    <LenisContext.Provider value={contextValue}>
      {children}
    </LenisContext.Provider>
  );
}
