"use client";

import { motion, useReducedMotion } from "framer-motion";

export function FinancialFlowMotion({ path }: { path: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.path
      d={path}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="3"
      initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.55 }}
      transition={{ duration: reduceMotion ? 0 : 1.4, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
