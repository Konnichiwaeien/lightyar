"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getBreedInfo } from "@/lib/helpers/pets/breed-database";

interface BreedInfoDetailButtonProps {
  breedName: string;
}

export function BreedInfoDetailButton({ breedName }: BreedInfoDetailButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const breedInfo = getBreedInfo(breedName);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isMobile]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full bg-transparent hover:bg-amber-50/55 text-amber-700 hover:text-amber-800 border border-amber-500/25 hover:border-amber-500/50 py-4 rounded-[1.5rem] font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-500/50 focus-visible:outline-hidden group/breed"
      >
        <Info size={16} className="shrink-0 text-amber-600 transition-colors animate-pulse" />
        <span>Подробнее о породе</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark translucent backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#1c1c1c]/40 backdrop-blur-xs cursor-default z-50"
            />

            {isMounted && isMobile ? (
              createPortal(
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  className="fixed bottom-0 left-0 right-0 z-50 w-full max-h-[85vh] overflow-y-auto bg-[#fdfcfb] border-t border-[#1c1c1c]/10 rounded-t-[2.5rem] p-6 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] text-left cursor-default pointer-events-auto"
                >
                  {/* Bottom sheet drag handle indicator */}
                  <div className="w-12 h-1.5 bg-[#1c1c1c]/10 rounded-full mx-auto mb-5" />

                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1c1c1c]/5">
                    <span className="text-[11px] font-extrabold text-[#d97706] uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles size={12} className="animate-pulse" /> Справка о породе
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="text-black/40 hover:text-black p-2 hover:bg-black/5 rounded-full transition-colors cursor-pointer border-none flex items-center justify-center"
                      aria-label="Закрыть"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <h3 className="font-serif text-3xl text-[#1c1c1c] mb-3 leading-tight font-medium">
                    {breedInfo.name}
                  </h3>

                  <p className="text-[#1c1c1c]/70 text-base font-light leading-relaxed mb-6">
                    {breedInfo.description}
                  </p>

                  {/* Stats ratings */}
                  <div className="space-y-4 border-t border-[#1c1c1c]/5 pt-5 mb-6">
                    {/* Activity */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-sm font-semibold text-[#1c1c1c]/80">
                        <span>Активность</span>
                        <span className="text-[#d97706] font-bold">{breedInfo.stats.activity} / 5</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#1c1c1c]/5 rounded-full overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(breedInfo.stats.activity / 5) * 100}%` }}
                          transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.05 }}
                          className="absolute inset-y-0 left-0 bg-linear-to-r from-amber-400 to-[#d97706] rounded-full"
                        />
                      </div>
                    </div>

                    {/* Friendliness */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-sm font-semibold text-[#1c1c1c]/80">
                        <span>Дружелюбие</span>
                        <span className="text-rose-500 font-bold">{breedInfo.stats.friendliness} / 5</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#1c1c1c]/5 rounded-full overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(breedInfo.stats.friendliness / 5) * 100}%` }}
                          transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.15 }}
                          className="absolute inset-y-0 left-0 bg-linear-to-r from-rose-400 to-rose-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Care Needs */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-sm font-semibold text-[#1c1c1c]/80">
                        <span>Сложность ухода</span>
                        <span className="text-blue-500 font-bold">{breedInfo.stats.careNeeds} / 5</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#1c1c1c]/5 rounded-full overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(breedInfo.stats.careNeeds / 5) * 100}%` }}
                          transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.25 }}
                          className="absolute inset-y-0 left-0 bg-linear-to-r from-blue-400 to-blue-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Trainability */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-sm font-semibold text-[#1c1c1c]/80">
                        <span>Обучаемость</span>
                        <span className="text-emerald-500 font-bold">{breedInfo.stats.trainability} / 5</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#1c1c1c]/5 rounded-full overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(breedInfo.stats.trainability / 5) * 100}%` }}
                          transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.35 }}
                          className="absolute inset-y-0 left-0 bg-linear-to-r from-emerald-400 to-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Breed Tips */}
                  <div className="bg-amber-50/50 border border-amber-500/10 rounded-2xl p-5">
                    <span className="text-xs font-bold text-[#b45309] uppercase tracking-widest block mb-2.5">Совет по содержанию:</span>
                    <ul className="space-y-2">
                      {breedInfo.tips.map((tip, idx) => (
                        <li key={idx} className="text-sm text-[#1c1c1c]/70 font-light leading-relaxed flex items-start gap-2">
                          <span className="text-[#d97706] select-none shrink-0 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>,
                document.body
              )
            ) : (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Modal Card for Desktop */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="relative w-full max-w-lg bg-[#fdfcfb] border border-[#1c1c1c]/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.18)] text-left z-10 overflow-hidden"
                >
                  {/* Symmetrical top header row */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1c1c1c]/5">
                    <span className="text-[10px] font-extrabold text-[#d97706] uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles size={12} className="animate-pulse text-[#d97706]" /> Справка о породе
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="text-black/35 hover:text-black p-1.5 hover:bg-black/5 rounded-full transition-colors cursor-pointer border-none flex items-center justify-center"
                      aria-label="Закрыть"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-serif text-2xl md:text-3xl text-[#1c1c1c] mb-3 leading-tight font-medium">
                    {breedInfo.name}
                  </h3>

                  <p className="text-[#1c1c1c]/60 text-sm font-light leading-relaxed mb-6">
                    {breedInfo.description}
                  </p>

                  {/* Stats ratings */}
                  <div className="space-y-3.5 border-t border-[#1c1c1c]/5 pt-5 mb-6">
                    {/* Activity */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-semibold text-[#1c1c1c]/70">
                        <span>Активность</span>
                        <span className="text-[#d97706] font-bold">{breedInfo.stats.activity} / 5</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#1c1c1c]/5 rounded-full overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(breedInfo.stats.activity / 5) * 100}%` }}
                          transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.05 }}
                          className="absolute inset-y-0 left-0 bg-linear-to-r from-amber-400 to-[#d97706] rounded-full"
                        />
                      </div>
                    </div>

                    {/* Friendliness */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-semibold text-[#1c1c1c]/70">
                        <span>Дружелюбие</span>
                        <span className="text-rose-500 font-bold">{breedInfo.stats.friendliness} / 5</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#1c1c1c]/5 rounded-full overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(breedInfo.stats.friendliness / 5) * 100}%` }}
                          transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.15 }}
                          className="absolute inset-y-0 left-0 bg-linear-to-r from-rose-400 to-rose-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Care Needs */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-semibold text-[#1c1c1c]/70">
                        <span>Сложность ухода</span>
                        <span className="text-blue-500 font-bold">{breedInfo.stats.careNeeds} / 5</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#1c1c1c]/5 rounded-full overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(breedInfo.stats.careNeeds / 5) * 100}%` }}
                          transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.25 }}
                          className="absolute inset-y-0 left-0 bg-linear-to-r from-blue-400 to-blue-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Trainability */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-semibold text-[#1c1c1c]/70">
                        <span>Обучаемость</span>
                        <span className="text-emerald-500 font-bold">{breedInfo.stats.trainability} / 5</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#1c1c1c]/5 rounded-full overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(breedInfo.stats.trainability / 5) * 100}%` }}
                          transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.35 }}
                          className="absolute inset-y-0 left-0 bg-linear-to-r from-emerald-400 to-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Breed Tips */}
                  <div className="bg-[#fffbeb] border border-[#f59e0b]/10 rounded-2xl p-5">
                    <span className="text-[10px] font-bold text-[#b45309] uppercase tracking-widest block mb-2">Совет по содержанию:</span>
                    <ul className="space-y-2">
                      {breedInfo.tips.map((tip, idx) => (
                        <li key={idx} className="text-xs text-[#1c1c1c]/80 font-light leading-relaxed flex items-start gap-2">
                          <span className="text-[#d97706] select-none font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
}
