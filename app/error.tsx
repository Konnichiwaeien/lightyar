"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home, MessageCircle } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Root application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#e8e4dc] flex flex-col justify-between font-sans text-[#1c1c1c]">
      {/* Visual background elements */}
      <div className="absolute inset-0 pointer-events-none film-grain" />

      {/* Header-like top spacing */}
      <header className="w-full max-w-[1400px] mx-auto pt-8 px-6 md:px-12 flex justify-between items-center z-10 shrink-0">
        <Link href="/" className="font-serif italic font-extrabold text-2xl text-[#1c1c1c] tracking-tight hover:text-amber-500 transition-colors">
          Светлый
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 z-10">
        <div className="max-w-xl w-full py-16 px-8 sm:px-12 text-center bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-[#1c1c1c]/5 shadow-[0_12px_40px_rgba(0,0,0,0.03)] flex flex-col items-center gap-8">
          
          {/* Animated Glow Alert Circle */}
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl animate-pulse" />
            <span className="relative inline-block p-6 bg-rose-50 text-rose-500 rounded-full border border-rose-100">
              <AlertCircle size={44} className="stroke-1.5" />
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-serif text-[#1c1c1c] tracking-tight leading-tight">
              Произошел сбой в системе
            </h1>
            <p className="text-[#1c1c1c]/60 text-sm sm:text-base font-light leading-relaxed max-w-md mx-auto">
              Не удалось загрузить данные. Это могло случиться из-за кратковременного сбоя сети или проведения технических работ на сервере приюта.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2.5 bg-[#2e2620] hover:bg-amber-500 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-colors duration-300 pointer-events-auto cursor-pointer shadow-sm focus-visible:ring-4 focus-visible:ring-amber-500/50 focus-visible:outline-hidden"
            >
              <RotateCcw size={14} /> Повторить попытку
            </button>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2.5 bg-white hover:bg-amber-50 text-[#1c1c1c] border border-[#1c1c1c]/10 px-8 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-colors duration-300 pointer-events-auto cursor-pointer shadow-sm focus-visible:ring-4 focus-visible:ring-amber-500/50 focus-visible:outline-hidden"
            >
              <Home size={14} /> На главную
            </Link>
          </div>

          {/* Collapsible Error Debug Details */}
          {error.message && (
            <details className="w-full text-left bg-[#1c1c1c]/5 rounded-2xl p-4 border border-[#1c1c1c]/5 group cursor-pointer transition-all duration-300 select-none">
              <summary className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/50 flex justify-between items-center group-open:mb-3">
                <span>Техническая информация</span>
                <span className="transition-transform group-open:rotate-180">↓</span>
              </summary>
              <p className="text-[11px] font-mono text-[#1c1c1c]/70 break-all select-all leading-normal bg-white/30 p-3 rounded-lg border border-[#1c1c1c]/5 overflow-auto max-h-24">
                {error.message}
              </p>
            </details>
          )}

          {/* Social Support Contacts */}
          <div className="border-t border-[#1c1c1c]/5 pt-6 w-full flex items-center justify-center gap-2 text-xs text-[#1c1c1c]/40 font-medium">
            <span>Есть вопросы?</span>
            <a
              href="https://vk.com/im?sel=-228082117"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-500 transition-colors pointer-events-auto"
            >
              <MessageCircle size={12} /> Напишите нам в ВК
            </a>
          </div>

        </div>
      </main>

      {/* Footer-like bottom spacing */}
      <footer className="w-full max-w-[1400px] mx-auto pb-8 px-6 text-center text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/25 z-10 shrink-0">
        © {new Date().getFullYear()} АНБО «Светлый» · Все права защищены
      </footer>
    </div>
  );
}
