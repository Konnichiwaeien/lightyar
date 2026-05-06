"use client";

import { useCursor } from "@/components/ui/cursor-context";

export function HomeHeader() {
  const { textEnter, textLeave } = useCursor();

  return (
    <header className="fixed top-0 w-full z-40 p-6 md:p-8 flex justify-between items-center mix-blend-difference text-white pointer-events-none">
      {/* Round logo placeholder */}
      <div className="pointer-events-auto cursor-none w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white/80 flex items-center justify-center">
        <svg viewBox="0 0 40 40" className="w-6 h-6 md:w-7 md:h-7" fill="none">
          <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1.5" />
          <path d="M20 8 L20 32 M14 14 Q20 6 26 14 M14 26 Q20 34 26 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      {/* Round hamburger menu button */}
      <button
        onClick={() => window.dispatchEvent(new Event("open-menu"))}
        onMouseEnter={textEnter}
        onMouseLeave={textLeave}
        className="pointer-events-auto cursor-none w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-colors duration-500 group"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>
    </header>
  );
}
