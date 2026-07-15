"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

export function ReportBeam() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <div className="reports-beam" aria-hidden="true">
      <motion.span
        className="reports-beam__line"
        style={{ scaleY: reduceMotion ? 1 : scaleY }}
      />
    </div>
  );
}
