"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type CursorVariant = "default" | "hover" | "image";

interface CursorContextType {
  cursorVariant: CursorVariant;
  isCustomCursorEnabled: boolean;
  textEnter: () => void;
  textLeave: () => void;
  imageEnter: () => void;
  imageLeave: () => void;
  attachCursorNode: (node: HTMLDivElement | null) => void;
}

const CursorContext = createContext<CursorContextType | null>(null);

/**
 * Pointer position stays outside React state and DOM writes are batched to one
 * per animation frame. Capability and variant changes are the only updates
 * that re-render the provider tree.
 */
export function CursorProvider({ children }: { children: ReactNode }) {
  const [cursorVariant, setCursorVariant] = useState<CursorVariant>("default");
  const [isCustomCursorEnabled, setIsCustomCursorEnabled] = useState(false);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef({ x: 0, y: 0, hasPosition: false });

  useEffect(() => {
    const capability = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
    let animationFrameId = 0;

    const renderPosition = () => {
      animationFrameId = 0;
      const node = cursorRef.current;
      const position = posRef.current;
      if (!node || !position.hasPosition) return;

      node.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`;
      node.style.opacity = "1";
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;

      posRef.current.x = event.clientX;
      posRef.current.y = event.clientY;
      posRef.current.hasPosition = true;
      if (!animationFrameId) animationFrameId = requestAnimationFrame(renderPosition);
    };

    const syncCapability = () => {
      const enabled = capability.matches;
      setIsCustomCursorEnabled(enabled);
      window.removeEventListener("pointermove", handlePointerMove);

      if (enabled) {
        window.addEventListener("pointermove", handlePointerMove, { passive: true });
      } else {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
        setCursorVariant("default");
      }
    };

    syncCapability();
    capability.addEventListener("change", syncCapability);

    return () => {
      capability.removeEventListener("change", syncCapability);
      window.removeEventListener("pointermove", handlePointerMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const textEnter = useCallback(() => setCursorVariant("hover"), []);
  const textLeave = useCallback(() => setCursorVariant("default"), []);
  const imageEnter = useCallback(() => setCursorVariant("image"), []);
  const imageLeave = useCallback(() => setCursorVariant("default"), []);

  const attachCursorNode = useCallback((node: HTMLDivElement | null) => {
    cursorRef.current = node;
    if (!node) return;

    const position = posRef.current;
    node.style.opacity = position.hasPosition ? "1" : "0";
    if (position.hasPosition) {
      node.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`;
    }
  }, []);

  return (
    <CursorContext.Provider value={{ cursorVariant, isCustomCursorEnabled, textEnter, textLeave, imageEnter, imageLeave, attachCursorNode }}>
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  const context = useContext(CursorContext);
  if (!context) throw new Error("useCursor must be used within CursorProvider");
  return context;
}
