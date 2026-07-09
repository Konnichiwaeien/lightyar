import { HelpCircle, Home, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#e8e4dc] flex flex-col justify-between font-sans text-[#1c1c1c]">
      {/* Visual background elements */}
      <div className="absolute inset-0 pointer-events-none film-grain" />

      {/* Header top spacing */}
      <header className="w-full max-w-[1400px] mx-auto pt-8 px-6 md:px-12 flex justify-between items-center z-10 shrink-0">
        <Link
          href="/"
          className="font-serif italic font-extrabold text-2xl text-[#1c1c1c] tracking-tight hover:text-amber-500 transition-colors"
        >
          Светлый
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 z-10">
        <div className="max-w-xl w-full py-16 px-8 sm:px-12 text-center bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-[#1c1c1c]/5 shadow-[0_12px_40px_rgba(0,0,0,0.03)] flex flex-col items-center gap-8">
          
          {/* Animated Glow Circle */}
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
            <span className="relative inline-block p-6 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
              <HelpCircle size={44} className="stroke-1.5" />
            </span>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-600">Ошибка 404</span>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#1c1c1c] tracking-tight leading-tight">
              Страница не найдена
            </h1>
            <p className="text-[#1c1c1c]/60 text-sm sm:text-base font-light leading-relaxed max-w-md mx-auto">
              Возможно, этот раздел еще находится в разработке, ссылка устарела или питомец уже нашел свою любящую семью и его анкета была перенесена.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2.5 bg-[#2e2620] hover:bg-amber-500 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-colors duration-300 pointer-events-auto cursor-pointer shadow-sm focus-visible:ring-4 focus-visible:ring-amber-500/50 focus-visible:outline-hidden"
            >
              <Home size={14} /> На главную
            </Link>
            
            <Link
              href="/pets"
              className="inline-flex items-center justify-center gap-2.5 bg-white hover:bg-amber-50 text-[#1c1c1c] border border-[#1c1c1c]/10 px-8 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-colors duration-300 pointer-events-auto cursor-pointer shadow-sm focus-visible:ring-4 focus-visible:ring-amber-500/50 focus-visible:outline-hidden"
            >
              <Heart size={14} className="text-rose-500 fill-rose-500" /> Наши питомцы
            </Link>
          </div>

          {/* Helper quick links */}
          <div className="w-full bg-[#1c1c1c]/5 rounded-2xl p-4 border border-[#1c1c1c]/5 text-left text-xs space-y-2">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/50 mb-1">Полезные ссылки:</span>
            <Link href="/campaigns" className="flex items-center justify-between text-[#1c1c1c]/70 hover:text-amber-600 transition-colors group">
              <span>Помочь финансово (Сборы)</span>
              <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="border-t border-[#1c1c1c]/5 my-1" />
            <Link href="/news" className="flex items-center justify-between text-[#1c1c1c]/70 hover:text-amber-600 transition-colors group">
              <span>Новости и события приюта</span>
              <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
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
