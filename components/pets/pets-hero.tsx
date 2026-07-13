"use client";

import { useState, useEffect } from "react";
import { Heart, Home, PawPrint, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MappedPet } from "@/lib/helpers/pets/normalize-pet-data";
import { PetsMatchQuiz } from "./pets-match-quiz";

export interface PetsHeroProps {
  allPets?: MappedPet[];
  videoUrl?: string;
  posterUrl?: string;
}

export function PetsHero({ allPets = [], videoUrl, posterUrl }: PetsHeroProps) {
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  useEffect(() => {
    if (isQuizOpen) {
      const timer = setTimeout(() => {
        const element = document.getElementById("pets-match-quiz-drawer");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [isQuizOpen]);

  return (
    <div className="w-full relative mb-12 sm:mb-20">
      <section 
        aria-labelledby="pets-hero-title"
        className="relative select-none overflow-hidden rounded-[2rem] sm:rounded-[3rem] bg-[#fdfcfb]/60 border border-[#1c1c1c]/5 shadow-[0_8px_30px_rgba(0,0,0,0.015)]"
      >
        {/* Soft Ambient Colorful Spots with breathing micro-animations */}
        <motion.div 
          animate={{
            y: [0, -20, 20, 0],
            x: [0, 15, -15, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-24 -right-24 w-[400px] h-[400px] bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" 
        />
        <motion.div 
          animate={{
            y: [0, 25, -25, 0],
            x: [0, -20, 20, 0],
            scale: [1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-24 -left-24 w-[350px] h-[350px] bg-rose-100/30 rounded-full blur-3xl pointer-events-none -z-10" 
        />

        {/* Giant Elegant typographer's background watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12vw] font-serif text-[#1c1c1c]/3 font-extrabold uppercase tracking-[0.2em] pointer-events-none -z-10 select-none">
          Светлый
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 items-stretch z-10">
          
          {/* Left Column: Magazine Typography, Heading, and Stats */}
          <div className="lg:col-span-7 flex flex-col items-start justify-between relative p-5 sm:p-8 md:p-12 lg:p-16 lg:pr-8">
            <div>
              <h1 id="pets-hero-title" className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-[#1c1c1c] leading-none mb-6 sm:mb-8">
                Наши <span className="italic text-amber-500">питомцы</span>
              </h1>

              <p className="text-[#1c1c1c]/70 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-xl mb-6 sm:mb-8">
                Светлый — это не просто приют. Это место, где рождаются новые сюжеты преданности. Познакомьтесь с нашими подопечными, каждый из которых готов открыть свое сердце для вас и начать новую главу жизни.
              </p>

              <button
                type="button"
                onClick={() => !isQuizOpen && setIsQuizOpen(true)}
                disabled={isQuizOpen}
                className={`flex items-center gap-2 px-5 py-3.5 sm:px-8 sm:py-4 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all z-20 relative pointer-events-auto w-full sm:w-auto justify-center ${
                  isQuizOpen 
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-700/50 cursor-not-allowed shadow-none" 
                    : "bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg cursor-pointer border-none"
                }`}
              >
                <motion.div
                  animate={isQuizOpen ? {} : { rotate: [0, 360] }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  className="shrink-0 flex items-center justify-center"
                >
                  <motion.div
                    animate={isQuizOpen ? {} : { scale: [1, 1.25, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="flex items-center justify-center"
                  >
                    <Sparkles size={14} className={`sm:w-[16px] sm:h-[16px] ${isQuizOpen ? "text-amber-700/30" : "text-white"}`} />
                  </motion.div>
                </motion.div>
                <span>{isQuizOpen ? "Тест запущен" : "Подобрать идеального друга"}</span>
              </button>
            </div>

            {/* Elegant grid for counters on mobile, flex on desktop */}
            <dl className="grid grid-cols-3 gap-2 border-t border-[#1c1c1c]/10 pt-6 sm:pt-8 mt-8 sm:mt-12 w-full sm:flex sm:flex-wrap sm:gap-6 md:gap-10">
              {/* Stat 1 */}
              <div className="bg-white/45 backdrop-blur-xs border border-white/60 rounded-2xl p-3 sm:p-0 sm:bg-transparent sm:border-none sm:backdrop-none sm:rounded-none flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3.5 shadow-sm sm:shadow-none">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <PawPrint size={14} className="sm:w-[16px] sm:h-[16px]" />
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <dd className="text-lg sm:text-2xl md:text-3xl font-serif text-[#1c1c1c] leading-none font-semibold">15+</dd>
                  <dt className="text-[7.5px] sm:text-[9px] font-bold uppercase tracking-wider sm:tracking-widest text-[#1c1c1c]/40 mt-1 leading-tight">ждут встречу</dt>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-white/45 backdrop-blur-xs border border-white/60 rounded-2xl p-3 sm:p-0 sm:bg-transparent sm:border-none sm:backdrop-none sm:rounded-none flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3.5 sm:border-l border-l-0 border-[#1c1c1c]/10 sm:pl-6 md:pl-10 shadow-sm sm:shadow-none">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <Home size={14} className="sm:w-[16px] sm:h-[16px]" />
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <dd className="text-lg sm:text-2xl md:text-3xl font-serif text-[#1c1c1c] leading-none font-semibold">120+</dd>
                  <dt className="text-[7.5px] sm:text-[9px] font-bold uppercase tracking-wider sm:tracking-widest text-[#1c1c1c]/40 mt-1 leading-tight">обрели хозяев</dt>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-white/45 backdrop-blur-xs border border-white/60 rounded-2xl p-3 sm:p-0 sm:bg-transparent sm:border-none sm:backdrop-none sm:rounded-none flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3.5 sm:border-l border-l-0 border-[#1c1c1c]/10 sm:pl-6 md:pl-10 shadow-sm sm:shadow-none">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-rose-100/80 text-rose-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <Heart size={14} fill="currentColor" className="sm:w-[16px] sm:h-[16px]" />
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <dd className="text-lg sm:text-2xl md:text-3xl font-serif text-rose-600 leading-none font-semibold">100%</dd>
                  <dt className="text-[7.5px] sm:text-[9px] font-bold uppercase tracking-wider sm:tracking-widest text-[#1c1c1c]/40 mt-1 leading-tight">любовь и забота</dt>
                </div>
              </div>
            </dl>
          </div>

          {/* Right Column: Premium Looping Video Player (Full Height, Rounded on All Sides) */}
          <div className="lg:col-span-5 relative w-full h-[250px] sm:h-[300px] lg:h-auto overflow-hidden rounded-[2rem] sm:rounded-[3rem]">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={posterUrl}
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source
                src={videoUrl || "/hero-video-2.mp4"}
                type="video/mp4"
              />
              Ваш браузер не поддерживает видео.
            </video>

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Accordion quiz drawer */}
      <AnimatePresence>
        {isQuizOpen && (
          <motion.div
            id="pets-match-quiz-drawer"
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 32 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden w-full relative z-20 pointer-events-auto bg-[#fdfcfb] border border-[#1c1c1c]/10 rounded-[1.75rem] sm:rounded-[2.5rem] shadow-[0_24px_60px_rgba(28,28,28,0.06)] scroll-mt-6"
          >
            <PetsMatchQuiz pets={allPets} onClose={() => setIsQuizOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
