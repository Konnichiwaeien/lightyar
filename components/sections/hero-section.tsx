"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HeartHandshake, PawPrint, Play, Pause } from "lucide-react";
import { useCursor } from "@/components/ui/cursor-context";

type NetworkInformation = {
  effectiveType?: string;
  saveData?: boolean;
};

function getNetworkInformation() {
  return (navigator as Navigator & { connection?: NetworkInformation }).connection;
}

export function HeroSection({ videoUrl, posterUrl }: { videoUrl?: string; posterUrl?: string } = {}) {
  const { textEnter, textLeave } = useCursor();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  const shouldReduceMotion = useReducedMotion() && mounted;
  const [allowVideo, setAllowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Decorative video is delayed until the page is interactive and omitted on
  // data-saving/2G connections. The gradient remains the complete fallback.
  useEffect(() => {
    const connection = getNetworkInformation();
    const lowBandwidth =
      connection?.saveData ||
      connection?.effectiveType === "slow-2g" ||
      connection?.effectiveType === "2g";
    if (shouldReduceMotion || lowBandwidth) return;

    const requestIdle = window.requestIdleCallback ?? ((callback: IdleRequestCallback) => window.setTimeout(callback, 250));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const idleId = requestIdle(() => setAllowVideo(true), { timeout: 1_200 });

    return () => cancelIdle(idleId);
  }, [shouldReduceMotion]);

  // Synchronize playback with user reduced motion settings
  useEffect(() => {
    if ((shouldReduceMotion || !allowVideo) && videoRef.current) {
      videoRef.current.pause();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsPlaying(false);
    }
  }, [allowVideo, shouldReduceMotion]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.play().catch(() => {});
    } else {
      userPaused.current = true;
      video.pause();
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let visible = false;
    const sync = () => {
      const active = visible && !document.hidden;
      section.dataset.heroActive = String(active);
      const video = videoRef.current;
      if (!video) return;
      if (active && allowVideo && !shouldReduceMotion && !userPaused.current) void video.play().catch(() => {});
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.001;
      sync();
    }, { threshold: [0, 0.001] });
    observer.observe(section);
    document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [allowVideo, shouldReduceMotion]);

  // Animation durations
  const BLUR_DURATION = 4;
  const BLUR_DELAY = 0.6;
  const TEXT_START = 0.1;

  // Stagger delays for text lines
  const line2Delay = TEXT_START + 0.3;
  const svetDelay = TEXT_START + 0.25;

  // Text shadow for readability
  const textShadow = "0 2px 20px rgba(0,0,0,0.6), 0 4px 40px rgba(0,0,0,0.4)";
  const svetShadow = "0 4px 30px rgba(0,0,0,0.5), 0 0 80px rgba(245,158,11,0.3)";

  return (
    <section ref={sectionRef} data-hero-mounted={mounted} className="hero-section relative h-screen bg-[#e8e4dc]">
      <div className="relative h-full overflow-hidden bg-black">
        
        {/* Layer 1: Background with auto-play blur-to-clarity */}
        <div className="hero-media-layer absolute inset-0 z-0">
          {/* Fallback gradient */}
          <div className="absolute inset-0 hero-video-fallback" />

          {/* Video element */}
          {allowVideo && (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover z-1"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={posterUrl}
              aria-hidden="true"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onPlaying={() => { if (sectionRef.current) sectionRef.current.dataset.videoReady = "true"; }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                if (sectionRef.current) sectionRef.current.dataset.videoReady = "false";
                setIsPlaying(false);
              }}
            >
              <source src={videoUrl || "/hero-video-2.mp4"} type="video/mp4" />
            </video>
          )}
          
          {/* Subtle warm overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent mix-blend-overlay z-2" />
        </div>

        {/* Dark overlay that fades out on load */}
        <div className="hero-intro-shade absolute inset-0 bg-black/50 z-10 pointer-events-none" />

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
            initial={shouldReduceMotion ? { opacity: 1, scale: 1, filter: "blur(0px)" } : { opacity: 1, scale: 0.86, filter: "blur(14px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.1, delay: svetDelay, ease: [0.16, 1, 0.3, 1] }}
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
          className="hero-footer absolute bottom-6 left-4 right-4 z-30 flex flex-col justify-between gap-4 sm:bottom-8 sm:left-6 sm:right-6 md:bottom-12 md:left-12 md:right-12 md:flex-row md:items-end md:gap-6"
        >
          {/* Tagline */}
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-amber-200/70" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
            Помогаем бездомным животным · Ярославль
          </p>

          {/* Buttons */}
          <div className="hero-actions flex w-max max-w-full flex-row flex-wrap items-center justify-start gap-2 md:ml-auto md:justify-end">
            <a
              href="#donate"
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
              className="hero-action hero-action--primary inline-flex min-h-11 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-3 py-3 text-center text-[9px] font-bold uppercase tracking-[0.12em] text-black shadow-md transition-colors duration-300 hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden sm:px-6 sm:text-[10px] sm:tracking-widest pointer-events-auto cursor-none"
            >
              <HeartHandshake className="hero-action__icon" size={16} strokeWidth={1.9} aria-hidden="true" />
              Помочь сейчас
            </a>
            <div className="hero-actions__secondary-group inline-flex shrink-0 items-center gap-2">
              <a
                href="#pets"
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
                className="hero-action hero-action--secondary inline-flex min-h-11 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/30 px-3 py-3 text-center text-[9px] font-bold uppercase tracking-[0.12em] text-white transition-colors duration-300 hover:border-white focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden sm:px-6 sm:text-[10px] sm:tracking-widest pointer-events-auto cursor-none"
              >
                <PawPrint className="hero-action__icon" size={16} strokeWidth={1.9} aria-hidden="true" />
                Найти друга
              </a>

              {/* Кнопка всегда остаётся круглой и стоит рядом с «Найти друга». */}
              {allowVideo && (
                <button
                  type="button"
                  onClick={togglePlay}
                  onMouseEnter={textEnter}
                  onMouseLeave={textLeave}
                  aria-label={isPlaying ? "Приостановить фоновое видео" : "Воспроизвести фоновое видео"}
                  className="hero-actions__play flex size-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-md backdrop-blur-md transition-all duration-300 hover:border-white/50 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden pointer-events-auto cursor-none group"
                >
                  {isPlaying ? <Pause size={14} aria-hidden="true" /> : <Play size={14} className="ml-0.5" aria-hidden="true" />}
                </button>
              )}
            </div>
          </div>
        </motion.div>


      </div>
    </section>
  );
}
