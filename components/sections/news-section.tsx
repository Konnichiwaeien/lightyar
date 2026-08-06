"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCursor } from "@/components/ui/cursor-context";
import { StrapiNews } from "@/lib/api/types";
import { NewsCard } from "@/components/news/news-card";

// Swiper imports for mobile carousel
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface NewsSectionProps {
  initialNews?: StrapiNews[];
}

export function NewsSection({ initialNews = [] }: NewsSectionProps) {
  const { textEnter, textLeave } = useCursor();
  
  const hasNews = initialNews && initialNews.length > 0;
  // Limit to 4 cards as requested by the user
  const newsItems = initialNews.slice(0, 4);

  return (
    <section className="relative py-20 md:py-28 px-6 md:px-12 bg-[#e8e4dc] text-[#1c1c1c]" id="news">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Style tag for custom Swiper pagination matching our amber theme */}
        <style dangerouslySetInnerHTML={{ __html: `
          .news-swiper .swiper-pagination-bullet-active {
            background: #f59e0b !important;
            width: 20px !important;
            border-radius: 4px !important;
            transition: all 0.3s ease;
          }
          .news-swiper .swiper-pagination-bullet {
            background: #1c1c1c;
            opacity: 0.2;
          }
          .news-swiper .swiper-pagination-bullet-active {
            opacity: 1;
          }
          /* точки живут в собственной полосе под карточками, а не поверх них */
          .news-swiper {
            padding-bottom: 3.25rem !important;
          }
          .news-swiper .swiper-pagination {
            bottom: 0 !important;
            line-height: 1;
          }
        `}} />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#1c1c1c] leading-[1.05] tracking-tight mb-6 text-wrap: balance">
              Новости <span className="italic text-amber-500">приюта</span>
            </h2>
            <p className="text-[#1c1c1c]/60 text-lg md:text-xl font-light">
              Что у нас происходит: пристройства, сборы, отчёты и истории подопечных.
            </p>
          </div>
        </div>

        {/* Dynamic Content / Error Handling */}
        {!hasNews ? (
          <div className="text-center py-20 px-6 bg-white rounded-[2rem] border border-[#1c1c1c]/5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col items-center max-w-3xl mx-auto">
            <span className="inline-block p-6 bg-[#f9f8f6] rounded-full mb-6 text-amber-500 shadow-sm">
              <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </span>
            <h3 className="text-3xl font-serif text-[#1c1c1c] mb-4">Не удалось загрузить новости</h3>
            <p className="text-[#1c1c1c]/50 font-light leading-relaxed mb-8 max-w-md">
              В данный момент сервис обновлений недоступен. Пожалуйста, попробуйте перезагрузить страницу позже или следите за нами в соцсетях.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-[#1c1c1c] text-white hover:bg-amber-500 px-6 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs transition-colors duration-300 pointer-events-auto cursor-none shadow-sm"
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
            >
              Обновить страницу
            </button>
          </div>
        ) : (
          <>
            {/* Mobile View: Swiper Carousel (1 slide at a time with slidesPerView 1.15 for slide peek) */}
            <div className="block md:hidden pointer-events-auto">
              <Swiper
                modules={[Pagination]}
                spaceBetween={16}
                slidesPerView={1.1}
                pagination={{ clickable: true }}
                className="news-swiper pb-16"
              >
                {newsItems.map((item) => (
                  <SwiperSlide key={item.id}>
                    {/* On mobile, cards are strictly normal vertical (isLarge={false}) */}
                    <NewsCard article={item} isLarge={false} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Desktop View: Unified Bento Grid (4 items total, filling 2 full 3-column rows) */}
            <ul role="list" className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
              {newsItems.map((item, index) => {
                // Alternating layout:
                // - Index 0: Large horizontal card (col-span-2)
                // - Index 1: Regular vertical card (col-span-1)
                // - Index 2: Regular vertical card (col-span-1)
                // - Index 3: Large horizontal card reversed (col-span-2, isReversed)
                // This fills exactly 6 grid column cells (3 cells per row, 2 rows total)
                const isLarge = index === 0 || index === 3;
                const isReversed = index === 3;
                
                return (
                  <NewsCard
                    key={item.id}
                    article={item}
                    isLarge={isLarge}
                    isReversed={isReversed}
                  />
                );
              })}
            </ul>

            {/* Global Button */}
            <div className="mt-12 md:mt-16 flex justify-center">
              <Link
                href="/news"
                className="inline-flex items-center gap-3 bg-transparent border border-[#1c1c1c]/20 text-[#1c1c1c] px-10 py-5 rounded-full font-medium sm:text-lg hover:border-amber-500 hover:bg-amber-500 hover:text-white transition-all duration-300 pointer-events-auto cursor-none"
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                Читать все новости <ArrowRight size={20} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
