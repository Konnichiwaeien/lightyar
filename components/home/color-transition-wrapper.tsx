"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Props {
  /** Sections rendered before the dark zone */
  lightZone: ReactNode;
  /** The section that triggers the color transition (campaigns) */
  darkZoneTrigger: ReactNode;
  /** Sections rendered after the dark zone trigger */
  darkZone: ReactNode;
}

export function ColorTransitionWrapper({ lightZone, darkZoneTrigger, darkZone }: Props) {
  const darkZoneRef = useRef(null);
  const { scrollYProgress: colorProgress } = useScroll({
    target: darkZoneRef,
    offset: ["start end", "start center"],
  });
  const bgColor = useTransform(colorProgress, [0, 1], ["#e8e4dc", "#0a0a0a"]);
  const textColor = useTransform(colorProgress, [0, 1], ["#1c1c1c", "#ffffff"]);

  return (
    <motion.main
      id="main-content"
      tabIndex={-1}
      style={{ backgroundColor: bgColor, color: textColor }}
      className="relative min-h-screen overflow-x-clip pt-0 font-sans cursor-none outline-none"
    >
      {/* Film grain */}
      <div className="film-grain" aria-hidden="true" />

      {/* ═══ Light zone ═══ */}
      {lightZone}

      {/* ═══ Dark zone — ref tracks campaigns for color transition ═══ */}
      <div ref={darkZoneRef} className="relative">
        {darkZoneTrigger}
      </div>
      {darkZone}
    </motion.main>
  );
}
