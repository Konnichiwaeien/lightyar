import { CampaignsControls } from "@/components/campaigns/campaigns-controls";
import { CampaignsPagination } from "@/components/campaigns/campaigns-pagination";
import { InnerHeader } from "@/components/layout/inner-header";
import { Heart, CheckCircle2 } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Все сборы | Светлый",
};

// Генерация 24 моковых сборов для демонстрации
const MOCK_CAMPAIGNS = Array.from({ length: 24 }).map((_, i) => {
  const isClosed = i % 4 === 0; // Каждый четвертый закрыт
  let total = 30 + (i % 5) * 20;
  let current = isClosed ? total : Math.floor(total * (0.1 + (i % 8) * 0.1));
  
  return {
    id: `camp-${i + 1}`,
    title: `Сбор #${i + 1}: ${["Операция для Рекса", "Закупка корма", "Утепление будок", "Стерилизация кошек", "Лечение Мухтара"][i % 5]}`,
    desc: "Это небольшое описание сбора. Важен каждый рубль, чтобы помочь подопечным фонда. Спасибо вам за вашу поддержку!",
    current,
    total,
    image: [
      "https://images.unsplash.com/photo-1544568100-847a948585b9",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee",
      "https://images.unsplash.com/photo-1537151608828-ea2b11777ee9",
      "https://images.unsplash.com/photo-1601630138404-32b0ed355153",
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e"
    ][i % 5] + "?auto=format&fit=crop&q=80&w=800",
    status: isClosed ? "closed" : "active",
    date: new Date(2025, 2, 1 - i).toISOString(),
    tag: isClosed ? "Завершено" : ["Срочно", "Регулярный", "Разовый", "Медицина", "Корм"][i % 5],
  };
});

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function CampaignsPage({ searchParams }: PageProps) {
  // Параметры из URL
  const status = typeof searchParams.status === "string" ? searchParams.status : "active";
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "date_desc";
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const itemsPerPage = 12;

  // 1. Фильтрация
  let filtered = MOCK_CAMPAIGNS.filter((c) => c.status === status);

  // 2. Сортировка
  filtered = filtered.sort((a, b) => {
    if (sort === "date_desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sort === "date_asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sort === "collected_desc") return b.current - a.current;
    if (sort === "collected_asc") return a.current - b.current;
    return 0;
  });

  // 3. Пагинация
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const safePage = Math.max(1, Math.min(page, totalPages || 1));
  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#e8e4dc] selection:bg-amber-500 selection:text-white pb-24">
      <InnerHeader />
      <main className="text-[#1c1c1c] pt-12 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto relative">

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#1c1c1c] leading-none mb-6">
              Все <span className="italic text-amber-500">сборы</span>
            </h1>
            <p className="text-[#1c1c1c]/60 max-w-xl text-lg md:text-xl font-light">
              Каждая сумма дарит надежду. Здесь вы можете найти кому нужна помощь прямо сейчас, или посмотреть архивы завершенных сборов.
            </p>
          </div>

          {/* URL Controller Components */}
          <CampaignsControls />

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {paginated.length > 0 ? (
              paginated.map((fund, index) => {
                // Bento styling logic:
                const isLarge = index === 0 || index === 5;
                const colSpanClass = isLarge ? "sm:col-span-2 lg:col-span-2" : "col-span-1";

                return (
                  <Link
                    href={`/campaigns/${fund.id}`}
                    key={fund.id}
                    className={`group relative bg-white border border-[#1c1c1c]/5 rounded-[2rem] overflow-hidden flex flex-col shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 ${colSpanClass} pointer-events-auto h-full min-h-[460px] cursor-pointer`}
                  >
                    <div className={`w-full ${isLarge ? 'h-64' : 'h-48'} shrink-0 overflow-hidden relative`}>
                      <img 
                        src={fund.image} 
                        alt={fund.title} 
                        className={`w-full h-full object-cover transition-transform duration-1000 ${fund.status === 'closed' ? 'grayscale opacity-70' : 'group-hover:scale-105'}`} 
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-white via-white/20 to-transparent opacity-80" />
                      
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]">
                        {fund.tag}
                      </div>
                    </div>

                    <div className="p-6 md:p-8 flex flex-col flex-1 bg-white relative z-10 w-full h-full justify-between">
                      <div className="mb-8">
                        <h3 className={`font-serif leading-tight mb-3 text-[#1c1c1c] ${fund.status === 'closed' ? 'text-black/60' : 'group-hover:text-amber-500'} transition-colors duration-300 ${isLarge ? 'text-3xl md:text-4xl' : 'text-xl'}`}>
                          {fund.title}
                        </h3>
                        <p className={`text-[#1c1c1c]/50 text-sm font-light ${isLarge ? 'line-clamp-4' : 'line-clamp-2'}`}>
                          {fund.desc}
                        </p>
                      </div>

                      {/* Progress Section */}
                      <div className="mt-auto">
                        <div className="flex justify-between items-end mb-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 block mb-1">Собрано</span>
                            <span className="text-xl font-serif text-[#1c1c1c] flex items-center gap-1">
                              {fund.current * 1000} <span className="font-sans font-light text-amber-500">₽</span>
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/30 block mb-1">Цель</span>
                            <span className="text-sm font-serif text-[#1c1c1c]/60 flex items-center justify-end gap-1">
                              {fund.total * 1000} <span className="font-sans font-light text-[#1c1c1c]/30">₽</span>
                            </span>
                          </div>
                        </div>

                        <div className="w-full h-2 md:h-3 bg-[#e8e4dc] rounded-full relative overflow-hidden mb-6">
                          <div
                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${fund.status === 'closed' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(100, (fund.current / fund.total) * 100)}%` }}
                          />
                        </div>

                        {fund.status === 'active' ? (
                          <div className="w-full bg-[#1c1c1c] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:bg-amber-500 transition-colors flex items-center justify-center gap-2">
                            <Heart size={16} /> Помочь
                          </div>
                        ) : (
                          <div className="w-full bg-emerald-50 text-emerald-700 border border-emerald-100 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center gap-2">
                            <CheckCircle2 size={16} /> Сбор закрыт
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full py-24 text-center">
                <span className="inline-block p-6 bg-white rounded-full mx-auto mb-6">
                  <Heart size={48} className="text-[#1c1c1c]/10" />
                </span>
                <h3 className="text-2xl font-serif text-[#1c1c1c] mb-2">Сборов не найдено</h3>
                <p className="text-[#1c1c1c]/50">Попробуйте изменить параметры фильтрации.</p>
              </div>
            )}
          </div>

          <CampaignsPagination currentPage={safePage} totalPages={totalPages} />
          
        </div>
      </main>
    </div>
  );
}
