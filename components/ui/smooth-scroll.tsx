"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
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

  const contextValue: LenisContextType = {
    getLenis: () => lenisRef.current,
  };

  return (
    <LenisContext.Provider value={contextValue}>
      {children}
    </LenisContext.Provider>
  );
}
