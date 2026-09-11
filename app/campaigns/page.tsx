import { Suspense } from "react";
import { CampaignsControls } from "@/components/campaigns/campaigns-controls";
import { CampaignsPagination } from "@/components/campaigns/campaigns-pagination";
import { InnerHeader } from "@/components/layout/inner-header";
import { Heart, CheckCircle2 } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { ResilientImage } from "@/components/ui/resilient-image";
import { campaignsService } from "@/lib/api/services/campaigns";
import { normalizeCampaignData } from "@/lib/helpers/campaigns/normalize-campaign-data";

export const metadata: Metadata = {
  title: "Все сборы",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CampaignsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  // Параметры из URL
  const status = typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status : "active";
  const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : "date_desc";
  const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page, 10) : 1;
  const itemsPerPage = 12;

  // Map sort option to Strapi API sort query
  let strapiSort = "createdAt:desc";
  if (sort === "date_asc") strapiSort = "createdAt:asc";
  else if (sort === "collected_desc") strapiSort = "current:desc";
  else if (sort === "collected_asc") strapiSort = "current:asc";

  const campaignsData = await campaignsService.getCampaigns({
    status: status === "closed" ? "closed" : "active",
    sort: strapiSort,
    limit: itemsPerPage,
    start: (page - 1) * itemsPerPage
  });

  const campaignsList = campaignsData.data || [];
  const pagination = campaignsData.meta?.pagination;
  const totalItems = pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const safePage = Math.max(1, Math.min(page, totalPages || 1));
  const paginated = campaignsList.map(normalizeCampaignData);

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
          <Suspense fallback={null}><CampaignsControls /></Suspense>

          {/* Bento Grid */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start" role="list">
            {paginated.length > 0 ? (
              paginated.map((fund, index) => {
                // Bento styling logic:
                const isLarge = index === 0 || index === 5;
                const colSpanClass = isLarge ? "sm:col-span-2 lg:col-span-2" : "col-span-1";

                return (
                  <li key={fund.id} className={`${colSpanClass} h-full`}>
                    <Link
                      href={`/campaigns/${fund.id}`}
                      className="group relative bg-white border border-[#1c1c1c]/5 rounded-[2rem] overflow-hidden flex flex-col shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 pointer-events-auto h-full min-h-[460px] cursor-pointer block focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-hidden"
                    >
                      <div className={`w-full ${isLarge ? 'h-64' : 'h-48'} shrink-0 overflow-hidden relative`}>
                        <ResilientImage
                          src={fund.image} 
                          alt={fund.title} 
                          fill
                          sizes={isLarge ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
                          className={`object-cover transition-transform duration-1000 ${fund.status === 'closed' ? 'grayscale opacity-70' : 'group-hover:scale-105'}`} 
                          fallbackLabel="Обложка сбора временно недоступна"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-white via-white/20 to-transparent opacity-80" />
                        
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]">
                          {fund.tag}
                        </div>
                      </div>

                      <div className="p-6 md:p-8 flex flex-col flex-1 bg-white relative z-10 w-full h-full justify-between">
                        <div className="mb-8">
                          {fund.petName && (
                            <div className="text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                              Сбор для питомца: {fund.petName}
                            </div>
                          )}
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
                                {fund.current.toLocaleString()} <span className="font-sans font-light text-amber-500">₽</span>
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/30 block mb-1">Цель</span>
                              <span className="text-sm font-serif text-[#1c1c1c]/60 flex items-center justify-end gap-1">
                                {fund.total.toLocaleString()} <span className="font-sans font-light text-[#1c1c1c]/30">₽</span>
                              </span>
                            </div>
                          </div>

                          <div 
                            className="w-full h-2 md:h-3 bg-[#e8e4dc] rounded-full relative overflow-hidden mb-6"
                            role="progressbar"
                            aria-valuenow={fund.current}
                            aria-valuemin={0}
                            aria-valuemax={fund.total}
                            aria-label={`Прогресс сбора: собрано ${fund.current} рублей из ${fund.total}`}
                          >
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
                  </li>
                );
              })
            ) : (
              <li className="col-span-full py-24 text-center">
                <span className="inline-block p-6 bg-white rounded-full mx-auto mb-6">
                  <Heart size={48} className="text-[#1c1c1c]/10" />
                </span>
                <h3 className="text-2xl font-serif text-[#1c1c1c] mb-2">Сборов не найдено</h3>
                <p className="text-[#1c1c1c]/50">Попробуйте изменить параметры фильтрации.</p>
              </li>
            )}
          </ul>

          <Suspense fallback={null}><CampaignsPagination currentPage={safePage} totalPages={totalPages} /></Suspense>
          
        </div>
      </main>
    </div>
  );
}
