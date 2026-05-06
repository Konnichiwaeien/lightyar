"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

interface Props {
  textEnter: () => void;
  textLeave: () => void;
}

export function HeroSection({ textEnter, textLeave }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  // Animation durations
  const BLUR_DURATION = 4;
  const BLUR_DELAY = 0.6;
  const TEXT_START = 0.3;

  // Stagger delays for text lines
  const line2Delay = TEXT_START + 0.3;
  const svetDelay = TEXT_START + 0.7;

  // Text shadow for readability
  const textShadow = "0 2px 20px rgba(0,0,0,0.6), 0 4px 40px rgba(0,0,0,0.4)";
  const svetShadow = "0 4px 30px rgba(0,0,0,0.5), 0 0 80px rgba(245,158,11,0.3)";

  return (
    <section ref={sectionRef} className="relative h-screen bg-[#e8e4dc]">
      <div className="relative h-full overflow-hidden bg-black">
        
        {/* Layer 1: Background with auto-play blur-to-clarity */}
        <motion.div 
          className="absolute inset-0 z-0 will-change-transform"
          initial={{ scale: 1.15, filter: "blur(40px) brightness(30%)" }}
          animate={{ scale: 1, filter: "blur(4px) brightness(88%)" }}
          transition={{ duration: BLUR_DURATION, delay: BLUR_DELAY, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Fallback gradient */}
          <div className="absolute inset-0 hero-video-fallback" />

          {/* Video element */}
          <video
            className="absolute inset-0 w-full h-full object-cover z-1"
            autoPlay
            muted
            loop
            playsInline
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          >
            <source src="/hero-video-2.mp4" type="video/mp4" />
          </video>
          
          {/* Subtle warm overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent mix-blend-overlay z-2" />
        </motion.div>

        {/* Dark overlay that fades out on load */}
        <motion.div 
          className="absolute inset-0 bg-black/50 z-10 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: BLUR_DURATION, delay: BLUR_DELAY, ease: "easeOut" }}
        />

        {/* Cinematic vignette — permanent dark edges */}
        <div 
          className="absolute inset-0 z-[11] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
          }}
        />


        {/* Layer 2: Center text with staggered animation */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center pointer-events-none">

          {/* Subtitle: mission statement — one line */}
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 0.85, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: line2Delay, ease: "easeOut" }}
            className="text-white font-bold uppercase tracking-[0.25em] text-[3.5vw] md:text-[2vw] xl:text-[1.4vw] leading-none mb-[1vw]"
            style={{ textShadow }}
          >
            Лечим, любим, ищем дом
          </motion.p>

          {/* Main heading — "Светлый" as dramatic centerpiece */}
          <motion.h1 
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.4, delay: svetDelay, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif italic font-bold text-amber-300 tracking-[-0.03em] text-[17vw] md:text-[16vw] xl:text-[13vw] leading-[0.85] drop-shadow-2xl uppercase"
            style={{ textShadow: svetShadow }}
          >
            Светлый
          </motion.h1>
        </div>

        {/* Layer 3: Bottom bar with stats + buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: BLUR_DELAY + BLUR_DURATION * 0.6, ease: "easeOut" }}
          className="absolute bottom-12 left-6 md:left-12 right-6 md:right-12 z-30 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          {/* Tagline */}
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-amber-200/70" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
            Приют для бездомных животных · Ярославль
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="#donate"
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
              className="bg-white text-black px-7 py-3.5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-amber-100 transition-colors duration-300 pointer-events-auto cursor-none"
            >
              Помочь сейчас
            </a>
            <a
              href="#pets"
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
              className="border border-white/30 text-white px-7 py-3.5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:border-white transition-colors duration-300 pointer-events-auto cursor-none"
            >
              Найти друга
            </a>
          </div>
        </motion.div>


      </div>
    </section>
  );
}
