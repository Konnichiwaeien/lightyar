import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { DarkInnerHeader } from "@/components/layout/dark-inner-header";

export default function ReportNotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f7f4ee]">
      <DarkInnerHeader />
      <main id="main-content" className="mx-auto flex min-h-[70svh] max-w-5xl flex-col justify-center px-6 py-20 md:px-12">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-400">Год не найден</p>
        <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-none md:text-8xl">Такого опубликованного отчёта пока нет</h1>
        <p className="mt-7 max-w-xl text-white/58">В архив попадают только проверенные и опубликованные в Strapi материалы.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/reports" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-400 px-6 py-3 font-semibold text-[#0a0a0a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            <ArrowLeft aria-hidden="true" size={17} /> К архиву
          </Link>
          <Link href="/about" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400">
            О нас <ArrowUpRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </main>
    </div>
  );
}
