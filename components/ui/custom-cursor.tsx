"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCursor } from "@/components/ui/cursor-context";

/**
 * Position is written directly by CursorProvider. This component only
 * re-renders when the visual variant or pointer capability changes.
 */
export function CustomCursor() {
  const { cursorVariant, isCustomCursorEnabled, attachCursorNode } = useCursor();
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  useEffect(() => {
    if (isHomepage && isCustomCursorEnabled) {
      document.body.classList.add("has-custom-cursor");
    } else {
      document.body.classList.remove("has-custom-cursor");
    }

    return () => {
      document.body.classList.remove("has-custom-cursor");
    };
  }, [isHomepage, isCustomCursorEnabled]);

  if (!isHomepage || !isCustomCursorEnabled) return null;

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      width: 40,
      height: 40,
      backgroundColor: "rgba(255, 230, 150, 0.6)",
      boxShadow: "0 0 40px 20px rgba(255, 200, 50, 0.3)",
      filter: "blur(8px)",
      mixBlendMode: "screen",
    },
    hover: {
      width: 80,
      height: 80,
      backgroundColor: "rgba(255, 230, 150, 0.9)",
      boxShadow: "0 0 60px 30px rgba(255, 200, 50, 0.6)",
      filter: "blur(12px)",
      mixBlendMode: "screen",
    },
    image: {
      width: 80,
      height: 80,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      boxShadow: "0 0 60px 30px rgba(255, 255, 255, 0.6)",
      filter: "blur(12px)",
      mixBlendMode: "screen",
    },
  };

  return (
    <div
      ref={attachCursorNode}
      className="fixed top-0 left-0 opacity-0 rounded-full z-[100] pointer-events-none flex items-center justify-center text-xs font-bold uppercase tracking-widest will-change-transform"
      style={{
        ...variantStyles[cursorVariant],
        transition: "width 0.15s ease-out, height 0.15s ease-out, background-color 0.15s, box-shadow 0.15s, filter 0.15s",
      }}
    >
      {cursorVariant === "image" ? (
        <span className="mix-blend-difference text-white">Смотреть</span>
      ) : null}
    </div>
  );
}
