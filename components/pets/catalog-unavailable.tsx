import Link from "next/link";
import { PawPrint } from "lucide-react";
import { InnerHeader } from "@/components/layout/inner-header";

export function CatalogUnavailable() {
  return (
    <div className="min-h-screen bg-[#e8e4dc] selection:bg-amber-500 selection:text-white">
      <InnerHeader />
      <main className="text-[#1c1c1c] pt-24 px-6 md:px-12 text-center">
        <div className="max-w-md mx-auto py-16 bg-white rounded-[2rem] border border-[#1c1c1c]/5 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <span className="inline-block p-6 bg-amber-50 rounded-full text-amber-500 mb-6">
            <PawPrint size={48} />
          </span>
          <h1 className="text-2xl font-serif text-[#1c1c1c] mb-3">Каталог временно недоступен</h1>
          <p className="text-[#1c1c1c]/50 mb-8 px-6 text-sm">
            Сервер временно недоступен или ведутся технические работы. Пожалуйста, попробуйте обновить страницу позже.
          </p>
          <Link
            href="/pets"
            className="inline-block bg-[#1c1c1c] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-amber-500 transition-colors"
          >
            Обновить
          </Link>
        </div>
      </main>
    </div>
  );
}
