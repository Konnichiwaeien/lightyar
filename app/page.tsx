"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { DogsStoriesSection } from "@/components/sections/dogs-stories-section";
import { CampaignsSection } from "@/components/sections/campaigns-section";
import { PaymentSection } from "@/components/sections/payment-section";
import { NeedsSection } from "@/components/sections/needs-section";
import { VolunteerSection } from "@/components/sections/volunteer-section";
import { NewsSection } from "@/components/sections/news-section";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState("default");

  // Color transition — tracks the campaigns section itself
  const darkZoneRef = useRef(null);
  const { scrollYProgress: colorProgress } = useScroll({
    target: darkZoneRef,
    offset: ["start end", "start center"],
  });
  const bgColor = useTransform(colorProgress, [0, 1], ["#e8e4dc", "#0a0a0a"]);
  const textColor = useTransform(colorProgress, [0, 1], ["#1c1c1c", "#ffffff"]);

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;
    const handler = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

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

  const textEnter = () => setCursorVariant("hover");
  const textLeave = () => setCursorVariant("default");
  const imageEnter = () => setCursorVariant("image");
  const imageLeave = () => setCursorVariant("default");

  return (
    <motion.div
      style={{ backgroundColor: bgColor, color: textColor }}
      className="relative font-sans pt-0 min-h-screen cursor-none"
    >
      {/* Custom cursor */}
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

      {/* Film grain */}
      <div className="film-grain" aria-hidden="true" />

      {/* Fixed header */}
      <header className="fixed top-0 w-full z-40 p-6 md:p-8 flex justify-between items-center mix-blend-difference text-white pointer-events-none">
        {/* Round logo placeholder */}
        <div className="pointer-events-auto cursor-none w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white/80 flex items-center justify-center">
          <svg viewBox="0 0 40 40" className="w-6 h-6 md:w-7 md:h-7" fill="none">
            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1.5" />
            <path d="M20 8 L20 32 M14 14 Q20 6 26 14 M14 26 Q20 34 26 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        {/* Round hamburger menu button */}
        <button
          onClick={() => window.dispatchEvent(new Event("open-menu"))}
          onMouseEnter={textEnter}
          onMouseLeave={textLeave}
          className="pointer-events-auto cursor-none w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-colors duration-500 group"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
      </header>

      {/* ═══ Light zone ═══ */}
      <HeroSection textEnter={textEnter} textLeave={textLeave} />
      <AboutSection textEnter={textEnter} textLeave={textLeave} imageEnter={imageEnter} imageLeave={imageLeave} />
      <DogsStoriesSection textEnter={textEnter} textLeave={textLeave} imageEnter={imageEnter} imageLeave={imageLeave} />

      {/* ═══ Dark zone — ref tracks campaigns for color transition ═══ */}
      <div ref={darkZoneRef}>
        <CampaignsSection textEnter={textEnter} textLeave={textLeave} />
      </div>
      <PaymentSection textEnter={textEnter} textLeave={textLeave} />
      <NeedsSection textEnter={textEnter} textLeave={textLeave} />
      <VolunteerSection imageEnter={imageEnter} imageLeave={imageLeave} />
      <NewsSection textEnter={textEnter} textLeave={textLeave} />
    </motion.div>
  );
}
