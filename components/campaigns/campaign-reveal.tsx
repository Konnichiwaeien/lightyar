"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** Server-rendered content stays visible without JS. Reveals run once;
 * no scroll listeners, blur filters or changes to document layout. */
export function CampaignReveal({ children, className, entrance = false, delay = 0 }: {
  children: ReactNode; className?: string; entrance?: boolean; delay?: number;
}) {
  const still = useReducedMotion();
  return <motion.div className={className} initial={false}
    animate={!still && entrance ? { y: [12, 0] } : undefined}
    whileInView={!still && !entrance ? { opacity: [.6, 1], y: [18, 0] } : undefined}
    viewport={{ once: true, amount: .12 }}
    transition={{ duration: .48, delay, ease: [.22, 1, .36, 1] }}>
    {children}
  </motion.div>;
}
