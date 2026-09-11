"use client";

import { RotateCcw } from "lucide-react";
import { DarkInnerHeader } from "@/components/layout/dark-inner-header";

export default function ReportsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f7f4ee]">
      <DarkInnerHeader />
      <main id="main-content" className="mx-auto flex min-h-[70svh] max-w-5xl flex-col justify-center px-6 py-20 md:px-12">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-amber-400">Архив на паузе</p>
        <h1 className="max-w-3xl font-serif text-5xl leading-[0.98] md:text-7xl">Отчётность временно недоступна</h1>
        <p className="mt-7 max-w-xl text-base leading-relaxed text-white/58 md:text-lg">
          Выдумывать цифры вместо настоящих мы не станем. Попробуйте загрузить отчёты ещё раз.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-10 inline-flex min-h-11 w-fit items-center gap-3 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold transition-colors hover:border-amber-400 hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
        >
          <RotateCcw aria-hidden="true" size={17} />
          Повторить запрос
        </button>
      </main>
    </div>
  );
}
