"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const MENU_ITEMS = [
  { label: "Главная", href: "/" },
  { label: "О фонде", href: "/#about" },
  { label: "Сборы", href: "/campaigns" },
  { label: "Волонтеры", href: "/#volunteer" },
  { label: "Питомцы", href: "/#dogs" },
  { label: "Новости", href: "/#news" },
];

export function MenuOverlay() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-menu", handleOpen);
    return () => window.removeEventListener("open-menu", handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          role="dialog"
          aria-modal="true"
          aria-label="Главное меню"
          className="fixed inset-0 z-200 bg-dark-card text-[#e8e4dc] flex flex-col justify-center items-center px-6 md:px-12 pointer-events-auto"
        >
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Закрыть меню"
            className="absolute top-6 right-6 md:top-8 md:right-8 w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden transition-colors duration-300"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="flex flex-col gap-6 md:gap-8 items-center max-w-7xl mx-auto w-full text-center">
            {MENU_ITEMS.map((item, i) => (
              <div key={item.label} className="overflow-hidden">
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.5, delay: i * 0.05 + 0.1, ease: [0.33, 1, 0.68, 1] }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center justify-center gap-6 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden rounded-xl px-4 py-2"
                  >
                    <span className="text-4xl md:text-5xl lg:text-6xl font-serif text-white/70 group-hover:text-amber-500 transition-colors duration-500 block">
                      {item.label}
                    </span>
                    <span className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-amber-500">
                      <ArrowRight size={32} strokeWidth={1.5} />
                    </span>
                  </Link>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

