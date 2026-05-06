"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

type CursorVariant = "default" | "hover" | "image";

interface CursorContextType {
  mousePosition: { x: number; y: number };
  cursorVariant: CursorVariant;
  textEnter: () => void;
  textLeave: () => void;
  imageEnter: () => void;
  imageLeave: () => void;
}

const CursorContext = createContext<CursorContextType | null>(null);

export function CursorProvider({ children }: { children: ReactNode }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState<CursorVariant>("default");

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;
    const handler = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const textEnter = useCallback(() => setCursorVariant("hover"), []);
  const textLeave = useCallback(() => setCursorVariant("default"), []);
  const imageEnter = useCallback(() => setCursorVariant("image"), []);
  const imageLeave = useCallback(() => setCursorVariant("default"), []);

  return (
    <CursorContext.Provider value={{ mousePosition, cursorVariant, textEnter, textLeave, imageEnter, imageLeave }}>
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  const ctx = useContext(CursorContext);
  if (!ctx) throw new Error("useCursor must be used within CursorProvider");
  return ctx;
}
