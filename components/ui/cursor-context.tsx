"use client";

import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type CursorVariant = "default" | "hover" | "image";

interface CursorContextType {
  cursorVariant: CursorVariant;
  textEnter: () => void;
  textLeave: () => void;
  imageEnter: () => void;
  imageLeave: () => void;
  /** Ref to the cursor DOM node — cursor component reads this */
  cursorRef: React.RefObject<HTMLDivElement | null>;
}

const CursorContext = createContext<CursorContextType | null>(null);

/**
 * PERF FIX: Mouse position is stored in a ref and applied via direct DOM
 * manipulation (transform), NOT via useState. This avoids re-rendering
 * the entire React tree on every mousemove event (~60-120 times/sec).
 * Only cursorVariant changes trigger re-renders (rare hover/leave events).
 */
export function CursorProvider({ children }: { children: ReactNode }) {
  const [cursorVariant, setCursorVariant] = useState<CursorVariant>("default");
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const handler = (e: MouseEvent) => {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
      // Direct DOM update — zero React re-renders
      const node = cursorRef.current;
      if (node) {
        const hw = node.offsetWidth / 2;
        const hh = node.offsetHeight / 2;
        node.style.transform = `translate3d(${e.clientX - hw}px, ${e.clientY - hh}px, 0)`;
      }
    };

    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const textEnter = useCallback(() => setCursorVariant("hover"), []);
  const textLeave = useCallback(() => setCursorVariant("default"), []);
  const imageEnter = useCallback(() => setCursorVariant("image"), []);
  const imageLeave = useCallback(() => setCursorVariant("default"), []);

  return (
    <CursorContext.Provider value={{ cursorVariant, textEnter, textLeave, imageEnter, imageLeave, cursorRef }}>
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  const ctx = useContext(CursorContext);
  if (!ctx) throw new Error("useCursor must be used within CursorProvider");
  return ctx;
}
