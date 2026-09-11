"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLenis } from "@/components/ui/smooth-scroll";
import { BrandLogo } from "@/components/ui/brand-logo";

const MENU_ITEMS = [
  { label: "Главная", href: "/" },
  { label: "О фонде", href: "/about" },
  { label: "Отчётность", href: "/reports" },
  { label: "Сборы", href: "/campaigns" },
  { label: "Волонтеры", href: "/#volunteer" },
  { label: "Питомцы", href: "/pets" },
  { label: "Новости", href: "/news" },
];

export function MenuOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const savedScrollYRef = useRef(0);
  const { getLenis } = useLenis();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    window.addEventListener("open-menu", open);
    return () => window.removeEventListener("open-menu", open);
  }, [open]);

  // Professional scroll lock: Lenis stop + body position:fixed
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      savedScrollYRef.current = scrollY;
      // Stop Lenis via React Context
      getLenis()?.stop();
      // Lock body scroll
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
    } else {
      const savedY = savedScrollYRef.current;
      // Unlock body
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      // Restore scroll position
      window.scrollTo(0, savedY);
      // Restart Lenis via React Context
      getLenis()?.start();
    }
  }, [isOpen, getLenis]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

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
          data-lenis-prevent
          className="fixed inset-0 z-200 bg-[#faf8f5] text-[#1c1c1c] overflow-y-auto overscroll-contain px-6 md:px-12 pointer-events-auto"
        >
          {/* Close button */}
          <button
            onClick={close}
            aria-label="Закрыть меню"
            className="group absolute top-6 right-6 md:top-8 md:right-8 size-12 md:size-14 rounded-full border border-[#1c1c1c]/15 bg-white/40 text-[#1c1c1c] shadow-[0_8px_24px_rgba(28,28,28,0.06)] flex items-center justify-center transition-[background-color,border-color,box-shadow,translate,scale,rotate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:shadow-[0_12px_30px_rgba(120,77,0,0.12)] focus-visible:-translate-y-0.5 focus-visible:border-amber-300 focus-visible:bg-amber-50 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:outline-hidden active:translate-y-0 active:scale-[0.97] active:duration-150 motion-reduce:transition-none motion-reduce:transform-none"
          >
            <span className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[6deg] group-hover:scale-105 group-focus-visible:rotate-[6deg] group-focus-visible:scale-105 motion-reduce:transition-none motion-reduce:transform-none">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </span>
          </button>

          <div className="absolute top-6 left-6 md:top-8 md:left-8">
            <Link
              href="/"
              onClick={close}
              aria-label="Главная страница приюта Светлый"
              className="block size-14 md:size-16 rounded-full bg-[#f7f3eb] overflow-hidden shadow-[0_8px_24px_rgba(28,28,28,0.05)] transition-[background-color,box-shadow,translate,scale,rotate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_30px_rgba(28,28,28,0.1)] focus-visible:-translate-y-0.5 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:outline-hidden active:translate-y-0 active:scale-[0.97] active:duration-150 motion-reduce:transition-none motion-reduce:transform-none"
            >
              <BrandLogo />
            </Link>
          </div>

          <div className="flex min-h-full w-full items-center justify-center py-24 md:py-28">
            <div className="flex flex-col gap-6 md:gap-8 items-center max-w-7xl mx-auto w-full text-center">
              {/* Маска даёт пункту выезд снизу, боковой запас в ней — чтобы она
                  не срезала стрелку, появляющуюся правее подписи. */}
              {MENU_ITEMS.map((item, i) => (
                <div key={item.label} className="overflow-hidden px-14">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.5, delay: i * 0.05 + 0.1, ease: [0.33, 1, 0.68, 1] }}
                  >
                    {/* Стрелка вынесена из потока: иначе она резервирует место
                        и подпись всё время стоит левее настоящего центра. */}
                    <Link
                      href={item.href}
                      onClick={close}
                      className="group inline-flex justify-center rounded-lg px-4 py-2 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#faf8f5] focus-visible:outline-hidden"
                    >
                      <span className="relative inline-flex items-center">
                        <span className="block text-4xl md:text-5xl lg:text-6xl font-serif text-[#1c1c1c]/60 transition-[color,translate,scale,rotate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-3 group-hover:text-[#d97706] group-focus-visible:-translate-x-3 group-focus-visible:text-[#d97706] motion-reduce:transition-none motion-reduce:transform-none">
                          {item.label}
                        </span>
                        <span
                          aria-hidden="true"
                          className="absolute left-full ml-3 -translate-x-3 opacity-0 text-[#d97706] transition-[opacity,translate,scale,rotate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none motion-reduce:transform-none"
                        >
                          <ArrowRight size={32} strokeWidth={1.5} />
                        </span>
                      </span>
                    </Link>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

