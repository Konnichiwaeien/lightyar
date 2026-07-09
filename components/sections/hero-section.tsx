"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { useCursor } from "@/components/ui/cursor-context";

export function HeroSection() {
  const { textEnter, textLeave } = useCursor();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  const shouldReduceMotion = useReducedMotion() && mounted;
  const [isPlaying, setIsPlaying] = useState(true);

  // Synchronize playback with user reduced motion settings
  useEffect(() => {
    if (shouldReduceMotion && videoRef.current) {
      videoRef.current.pause();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsPlaying(false);
    }
  }, [shouldReduceMotion]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

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
          initial={shouldReduceMotion ? { scale: 1, filter: "blur(4px) brightness(88%)" } : { scale: 1.15, filter: "blur(40px) brightness(30%)" }}
          animate={{ scale: 1, filter: "blur(4px) brightness(88%)" }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: BLUR_DURATION, delay: BLUR_DELAY, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Fallback gradient */}
          <div className="absolute inset-0 hero-video-fallback" />

          {/* Video element */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover z-1"
            autoPlay={!shouldReduceMotion}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
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
          initial={shouldReduceMotion ? { opacity: 0.15 } : { opacity: 1 }}
          animate={{ opacity: 0.15 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: BLUR_DURATION, delay: BLUR_DELAY, ease: "easeOut" }}
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
            initial={shouldReduceMotion ? { opacity: 0.85, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 0.85, y: 0, filter: "blur(0px)" }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 1, delay: line2Delay, ease: "easeOut" }}
            className="text-white font-bold uppercase tracking-[0.25em] text-[3.5vw] md:text-[2vw] xl:text-[1.4vw] leading-none mb-[1vw] text-pretty"
            style={{ textShadow }}
          >
            Лечим, любим, ищем дом
          </motion.p>

          {/* Main heading — "Светлый" as dramatic centerpiece */}
          <motion.h1 
            initial={shouldReduceMotion ? { opacity: 1, scale: 1, filter: "blur(0px)" } : { opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.4, delay: svetDelay, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif italic font-bold text-amber-300 tracking-[-0.03em] text-[17vw] md:text-[16vw] xl:text-[13vw] leading-[0.85] drop-shadow-2xl uppercase text-wrap: balance"
            style={{ textShadow: svetShadow }}
          >
            Светлый
          </motion.h1>
        </div>

        {/* Layer 3: Bottom bar with stats + buttons */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 1, delay: BLUR_DELAY + BLUR_DURATION * 0.6, ease: "easeOut" }}
          className="absolute bottom-12 left-6 md:left-12 right-6 md:right-12 z-30 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          {/* Tagline */}
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-amber-200/70" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
            Приют для бездомных животных · Ярославль
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            {/* Minimalist Premium Play/Pause Toggle */}
            <button
              type="button"
              onClick={togglePlay}
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
              aria-label={isPlaying ? "Приостановить фоновое видео" : "Воспроизвести фоновое видео"}
              className="w-10 h-10 rounded-full border border-white/20 hover:border-white/50 text-white bg-black/40 backdrop-blur-md flex items-center justify-center focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden transition-all duration-300 pointer-events-auto cursor-none group shadow-md"
            >
              {isPlaying ? <Pause size={14} aria-hidden="true" /> : <Play size={14} className="ml-0.5" aria-hidden="true" />}
            </button>

            <a
              href="#donate"
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
              className="bg-white text-black px-7 py-3.5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden transition-colors duration-300 pointer-events-auto cursor-none shadow-md"
            >
              Помочь сейчас
            </a>
            <a
              href="#pets"
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
              className="border border-white/30 text-white px-7 py-3.5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:border-white focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden transition-colors duration-300 pointer-events-auto cursor-none"
            >
              Найти друга
            </a>
          </div>
        </motion.div>


      </div>
    </section>
  );
}
