"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

/**
 * Одноразовое появление крупной смысловой секции.
 *
 * Оборачиваем только блоки, где появляются данные — не каждую строку и не каждый
 * заголовок: одинаковый вход на каждой секции читается как шум, а не как приём.
 * При prefers-reduced-motion контент виден сразу.
 */
export function ReportReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.12 });
  const reduced = useReducedMotion();
  const shown = reduced || visible;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 24 }}
      transition={{ duration: 0.7, delay: reduced ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
