"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { InnerHeader } from "@/components/layout/inner-header";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CampaignsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Campaigns route error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#e8e4dc] pb-32">
      <InnerHeader />
      
      <main className="text-[#1c1c1c] pt-24 px-6 md:px-12 font-sans">
        <div className="max-w-xl mx-auto py-16 px-8 text-center bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-[#1c1c1c]/5 shadow-sm flex flex-col items-center gap-6">
          <span className="inline-block p-6 bg-rose-50 text-rose-500 rounded-full shadow-xs">
            <AlertTriangle size={40} className="stroke-1.5" />
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#1c1c1c]">Что-то пошло не так</h1>
          <p className="text-[#1c1c1c]/60 font-light leading-relaxed max-w-md">
            Не удалось загрузить каталог сборов приюта. Это могло произойти из-за временных проблем с соединением или технических работ на сервере.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2.5 bg-[#2e2620] hover:bg-amber-500 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-colors duration-300 pointer-events-auto cursor-pointer shadow-xs focus-visible:ring-4 focus-visible:ring-amber-500/50 focus-visible:outline-hidden"
          >
            <RotateCcw size={14} /> Попробовать снова
          </button>
        </div>
      </main>
    </div>
  );
}
