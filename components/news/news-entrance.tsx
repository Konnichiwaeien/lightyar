"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function NewsEntrance({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return <motion.div className="news-hero__art" initial={false}
    animate={reduce ? { y: 0, rotate: 0 } : { y: [18, 0], rotate: [-2, 0] }}
    transition={{ duration: reduce ? 0 : .65, ease: [.22, 1, .36, 1] }}>{children}</motion.div>;
}
