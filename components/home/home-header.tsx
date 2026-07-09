"use client";

import { useCursor } from "@/components/ui/cursor-context";
import { PawLogo } from "@/components/ui/paw-logo";
import Link from "next/link";

export function HomeHeader() {
  const { textEnter, textLeave } = useCursor();

  return (
    <header className="fixed top-0 w-full z-40 p-6 md:p-8 flex justify-between items-center mix-blend-difference text-white pointer-events-none">
      {/* Round logo Link */}
      <Link
        href="/"
        aria-label="Главная страница приюта Светлый"
        onMouseEnter={textEnter}
        onMouseLeave={textLeave}
        className="pointer-events-auto cursor-none w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white/80 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-hidden transition-all duration-300"
      >
        <PawLogo className="w-5 h-5 md:w-6 md:h-6" />
      </Link>
      {/* Round hamburger menu button */}
      <button
        onClick={() => window.dispatchEvent(new Event("open-menu"))}
        onMouseEnter={textEnter}
        onMouseLeave={textLeave}
        aria-label="Открыть меню навигации"
        aria-haspopup="dialog"
        className="pointer-events-auto cursor-none w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-hidden transition-colors duration-500 group"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>
    </header>
  );
}

