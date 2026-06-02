"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useCursor } from "@/components/ui/cursor-context";
import { usePathname } from "next/navigation";

export function CustomCursor() {
  const { mousePosition, cursorVariant } = useCursor();
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  useEffect(() => {
    if (isHomepage) {
      document.body.classList.add("has-custom-cursor");
    } else {
      document.body.classList.remove("has-custom-cursor");
    }
    return () => {
      document.body.classList.remove("has-custom-cursor");
    };
  }, [isHomepage]);

  if (!isHomepage) return null;

  const cursorVariants = {
    default: {
      x: mousePosition.x - 20, y: mousePosition.y - 20,
      height: 40, width: 40,
      backgroundColor: "rgba(255, 230, 150, 0.6)",
      boxShadow: "0 0 40px 20px rgba(255, 200, 50, 0.3)",
      filter: "blur(8px)",
      mixBlendMode: "screen" as const,
    },
    hover: {
      x: mousePosition.x - 40, y: mousePosition.y - 40,
      height: 80, width: 80,
      backgroundColor: "rgba(255, 230, 150, 0.9)",
      boxShadow: "0 0 60px 30px rgba(255, 200, 50, 0.6)",
      filter: "blur(12px)",
      mixBlendMode: "screen" as const,
      scale: 1.2,
    },
    image: {
      x: mousePosition.x - 40, y: mousePosition.y - 40,
      height: 80, width: 80,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      boxShadow: "0 0 60px 30px rgba(255, 255, 255, 0.6)",
      filter: "blur(12px)",
      mixBlendMode: "screen" as const,
      scale: 1.5,
    },
  };

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full z-[100] pointer-events-none flex items-center justify-center text-xs font-bold uppercase tracking-widest"
      variants={cursorVariants}
      animate={cursorVariant}
      transition={{ type: "tween", ease: "backOut", duration: 0.15 }}
    >
      {cursorVariant === "image" && (
        <span className="mix-blend-difference text-white">Смотреть</span>
      )}
    </motion.div>
  );
}
