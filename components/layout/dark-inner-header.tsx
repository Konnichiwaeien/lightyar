"use client";

import Link from "next/link";

export function DarkInnerHeader() {
  return (
    <header className="w-full p-6 md:p-8 flex items-center justify-between relative z-50">
      <Link href="/" className="text-2xl font-serif text-[#f5f4f0] hover:text-amber-400 transition-colors">
        Светлый.
      </Link>
      
      <button 
        onClick={() => window.dispatchEvent(new Event("open-menu"))}
        className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 text-[#f5f4f0] flex items-center justify-center hover:bg-white hover:text-black transition-colors duration-300 cursor-none"
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
