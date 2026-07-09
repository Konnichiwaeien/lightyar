"use client";

import { useState, useRef, useEffect } from "react";
import { Shield, Diamond, Heart } from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";

interface Props {
  current: number;
  total: number;
  feed: {
    name: string;
    type: string;
    date: string;
    amount: number;
  }[];
}

/* Animated counter hook */
function useCountUp(target: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    let rafId: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.floor(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration, start]);
  return value;
}

export function CampaignProgressCard({ current, total, feed }: Props) {
  const [activeTab, setActiveTab] = useState<"about" | "donors">("about");
  const aboutRef = useRef<HTMLDivElement>(null);
  const donorsRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const counterRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(counterRef, { once: true, margin: "-100px" });

  const animatedCurrent = useCountUp(current, 2200, isInView);
  const percentage = Math.min(100, Math.round((current / total) * 100));
  const animatedPercentage = useCountUp(percentage, 2200, isInView);

  // Measure the active tab's content height to animate the container smoothly
  useEffect(() => {
    const activeRef = activeTab === "about" ? aboutRef : donorsRef;
    if (activeRef.current) {
      setContentHeight(activeRef.current.scrollHeight);
    }
  }, [activeTab, feed]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-50px" }}
      className="bg-white rounded-[2rem] p-6 md:p-8 border border-stone-200/60 shadow-[0_4px_30px_rgba(0,0,0,0.015)]"
    >
      {/* Tab Selectors */}
      <div className="flex border-b border-stone-100 mb-6">
        <div className="flex gap-6 md:gap-8 text-xs font-bold uppercase tracking-widest select-none">
          <button
            onClick={() => setActiveTab("about")}
            className={`pb-4 -mb-[1px] flex items-center gap-2 border-b-2 transition-colors duration-200 cursor-pointer font-sans ${
              activeTab === "about"
                ? "text-[#d97706] border-[#d97706]"
                : "text-[#8c857b]/60 border-transparent hover:text-[#8c857b]"
            }`}
          >
            <span className="text-base leading-none">✓</span> О СБОРЕ
          </button>
          <button
            onClick={() => setActiveTab("donors")}
            className={`pb-4 -mb-[1px] flex items-center gap-2 border-b-2 transition-colors duration-200 cursor-pointer font-sans ${
              activeTab === "donors"
                ? "text-[#d97706] border-[#d97706]"
                : "text-[#8c857b]/60 border-transparent hover:text-[#8c857b]"
            }`}
          >
            <span className="text-base leading-none">♡</span> ПОДДЕРЖАЛИ
            <span className="ml-0.5 px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded-full text-[9px]">
              {feed.length}
            </span>
          </button>
        </div>
      </div>

      {/* Animated height container */}
      <motion.div
        animate={{ height: contentHeight || "auto" }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {activeTab === "about" && (
            <motion.div
              key="about-tab"
              ref={aboutRef}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <div className="space-y-6 md:space-y-8" ref={counterRef}>
                {/* Amounts */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-[#8c857b] block mb-2 md:mb-3 font-sans">
                      СОБРАНО СРЕДСТВ
                    </span>
                    <div className="font-sans text-4xl md:text-5xl lg:text-[54px] font-black text-[#1c1c1c] leading-none tracking-tight tabular-nums">
                      {animatedCurrent.toLocaleString("ru-RU")}{" "}
                      <span className="text-[#d97706] text-3xl md:text-4xl font-light">₽</span>
                    </div>
                  </div>
                  <div className="md:text-right">
                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-[#8c857b] block mb-2 md:mb-3 font-sans">
                      ЦЕЛЕВАЯ СУММА
                    </span>
                    <div className="font-sans text-2xl md:text-3xl lg:text-4xl font-black text-[#1c1c1c]/40 leading-none tracking-tight">
                      {total.toLocaleString("ru-RU")}{" "}
                      <span className="text-2xl md:text-3xl font-light">₽</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar with shimmer + percentage */}
                <div className="space-y-2">
                  <div className="relative w-full h-[22px] bg-[#f4f2ee] rounded-full overflow-hidden">
                    <motion.div
                      className="absolute top-0 left-0 h-full rounded-full bg-[#f59e0b]"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${Math.min(100, (current / total) * 100)}%` } : { width: 0 }}
                      transition={{ duration: 2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
                    >
                      {/* Shimmer overlay */}
                      <div
                        className="absolute inset-0 rounded-full overflow-hidden"
                        style={{
                          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 2s ease-in-out infinite",
                        }}
                      />
                    </motion.div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-[#8c857b] font-medium font-serif italic">
                      💛 Ваш вклад 500₽ = 1 день лечения подопечного
                    </p>
                    <span className="text-xs font-black text-[#d97706] font-sans tabular-nums">
                      {animatedPercentage}%
                    </span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8 pt-6 md:pt-8 border-t border-stone-100">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-[1rem] bg-[#fdf0e9] border border-[#f59e0b]/10 flex items-center justify-center shrink-0">
                      <Shield size={18} className="text-[#d97706]" />
                    </div>
                    <div>
                      <h4 className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-[#1c1c1c] mb-1.5 leading-tight font-sans">
                        ИНТЕГРАЛЬНЫЙ ПЛАН
                      </h4>
                      <p className="text-xs text-[#8c857b] leading-relaxed font-medium font-sans">
                        Контролируемый сбор средств для поэтапного запуска.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-[1rem] bg-[#fdf0e9] border border-[#f59e0b]/10 flex items-center justify-center shrink-0">
                      <Diamond size={18} className="text-[#d97706]" />
                    </div>
                    <div>
                      <h4 className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-[#1c1c1c] mb-1.5 leading-tight font-sans">
                        АДРЕСНАЯ ПОМОЩЬ
                      </h4>
                      <p className="text-xs text-[#8c857b] leading-relaxed font-medium font-sans">
                        Прямая помощь подопечному или цели сбора.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* DONORS TAB */}
          {activeTab === "donors" && (
            <motion.div
              key="donors-tab"
              ref={donorsRef}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {feed.length > 0 ? (
                <div
                  className="w-full max-h-[350px] overflow-y-auto pr-2 hide-scrollbar flex flex-col gap-3"
                  data-lenis-prevent
                >
                  {feed.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.05 }}
                      className="flex justify-between items-center bg-white border border-stone-100 rounded-2xl p-4 md:p-5 transition-all hover:border-[#f59e0b]/30 hover:shadow-[0_8px_20px_rgba(245,158,11,0.05)]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fdf0e9] text-[#d97706] font-bold font-serif text-sm shrink-0 select-none">
                          {item.name[0]?.toUpperCase() || "A"}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#1c1c1c] leading-none mb-1.5 font-serif">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-[#8c857b] uppercase tracking-widest font-semibold font-sans">
                            {item.type === "Ежемесячная помощь" ? "РЕГУЛЯРНО" : "РАЗОВО"}
                            <span className="mx-1 font-normal">•</span>
                            {item.date}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg md:text-xl font-serif font-black text-[#d97706] whitespace-nowrap">
                        +{item.amount.toLocaleString("ru-RU")}{" "}
                        <span className="text-sm font-bold text-[#f59e0b]">₽</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Heart size={40} className="text-[#f59e0b]/40 mb-4 animate-pulse" />
                  <span className="text-xs uppercase tracking-widest font-black text-[#8c857b] font-serif">
                    Будьте первым!
                  </span>
                  <p className="text-xs text-[#8c857b]/85 mt-2 max-w-[240px] leading-normal font-semibold font-sans">
                    Ваша поддержка поможет намного быстрее достичь цели.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
