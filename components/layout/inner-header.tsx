"use client";

import Link from "next/link";

export function InnerHeader() {
  return (
    <header className="w-full p-6 md:p-8 flex items-center justify-between">
      <Link href="/" className="text-2xl font-serif text-[#1c1c1c] hover:text-amber-500 transition-colors">
        Светлый.
      </Link>
      
      <button 
        onClick={() => window.dispatchEvent(new Event("open-menu"))}
        className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#1c1c1c]/20 text-[#1c1c1c] flex items-center justify-center hover:bg-[#1c1c1c] hover:text-white transition-colors duration-300"
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
