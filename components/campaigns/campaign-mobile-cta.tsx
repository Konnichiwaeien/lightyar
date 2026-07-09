"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

export function CampaignMobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };

    // Check initial position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    document
      .getElementById("donation-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="lg:hidden">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-4 right-4 z-40"
          >
            <button
              type="button"
              onClick={handleClick}
              className="w-full flex items-center justify-center gap-2.5 bg-[#f59e0b] text-white rounded-2xl py-4 font-serif font-black uppercase tracking-widest text-sm shadow-[0_10px_40px_rgba(245,158,11,0.4)] cursor-pointer transition-all duration-200 hover:bg-[#d97706] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-hidden"
            >
              <Heart size={18} strokeWidth={2.5} fill="currentColor" />
              <span>Поддержать сбор</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
