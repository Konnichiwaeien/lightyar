import { Suspense } from "react";
import { InnerHeader } from "@/components/layout/inner-header";
import { NewsControls } from "@/components/news/news-controls";
import { NewsCard } from "@/components/news/news-card";
import { NewsPagination } from "@/components/news/news-pagination";
import { Metadata } from "next";
import { newsService } from "@/lib/api/services/news";
import { Newspaper, RotateCcw } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Новости и истории спасения",
  description: "Официальные новости, отчеты о сборах, счастливые истории пристройства и будни благотворительного фонда помощи животным «Светлый» в Ярославле.",
  keywords: ["новости приюта", "благотворительный фонд", "помощь животным", "ярославль", "светлый", "истории спасения", "отчеты о сборах"],
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NewsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  // Extract query filters from URL search params
  const tag = typeof resolvedSearchParams.tag === "string" ? resolvedSearchParams.tag : undefined;
  const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : undefined;
  const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : "publishedAt:desc";
  const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page, 10) : 1;

  const itemsPerPage = 9;
  const start = (page - 1) * itemsPerPage;

  // Fetch news articles and tags in parallel directly from Strapi
  const [newsData, tags] = await Promise.all([
    newsService.getNews({
      tag,
      search,
      sort,
      limit: itemsPerPage,
      start,
    }),
    newsService.getTags(),
  ]);

  const articles = newsData.data || [];
  const pagination = newsData.meta?.pagination;
  const totalItems = pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const safePage = Math.max(1, Math.min(page, totalPages || 1));

  const hasNews = articles.length > 0;
  const isFiltered = !!(tag || search);

  return (
    <div className="min-h-screen bg-[#e8e4dc] selection:bg-amber-500 selection:text-white pb-32">
      <InnerHeader />
      
      <main className="text-[#1c1c1c] pt-12 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto relative">
          
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#1c1c1c] leading-none mb-6">
              Новости <span className="italic text-amber-500">приюта</span>
            </h1>
            <p className="text-[#1c1c1c]/60 max-w-2xl text-lg md:text-xl font-light">
              Мы верим в абсолютную прозрачность. Читайте наши регулярные отчёты, делитесь счастливыми историями пристройства и следите за срочными сборами.
            </p>
          </div>

          {/* Search, Tag Filtering Ribbon, and Sort Selects */}
          <Suspense fallback={
            <div className="h-24 bg-white/20 animate-pulse rounded-[2.25rem] mb-12" />
          }>
            <NewsControls tags={tags} />
          </Suspense>

          {/* Grid / Bento Grid or Empty State */}
          {hasNews ? (
            <div>
              <ul role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
                {articles.map((article, index) => {
                  const globalIndex = start + index;
                  // Dynamic editorial zigzag bento rhythm:
                  // - Every 7th card starting from 0 (0, 7, 14...) is a large card (col-span-2)
                  // - Every 7th card starting from 3 (3, 10, 17...) is a large card reversed (col-span-2 reversed layout)
                  const isLarge = globalIndex % 7 === 0 || globalIndex % 7 === 3;
                  const isReversed = globalIndex % 7 === 3;

                  return (
                    <NewsCard 
                      key={article.id} 
                      article={article} 
                      isLarge={isLarge} 
                      isReversed={isReversed}
                    />
                  );
                })}
              </ul>

              {/* Dynamic pagination component */}
              <Suspense fallback={null}>
                <NewsPagination 
                  currentPage={safePage} 
                  totalPages={totalPages} 
                />
              </Suspense>
            </div>
          ) : (
            <div className="w-full py-24 text-center bg-white/30 backdrop-blur-md rounded-[2.5rem] border border-[#1c1c1c]/5 shadow-xs max-w-3xl mx-auto flex flex-col items-center p-8">
              <span className="inline-block p-6 bg-white rounded-full mb-6 text-amber-500 shadow-sm">
                <Newspaper size={40} className="stroke-1.5" />
              </span>
              <h3 className="text-3xl font-serif text-[#1c1c1c] mb-4">Новости не найдены</h3>
              <p className="text-[#1c1c1c]/50 font-light leading-relaxed max-w-md mb-8">
                {isFiltered 
                  ? "По вашему запросу ничего не найдено. Попробуйте изменить поисковую фразу или сбросить фильтры тегов." 
                  : "В каталоге новостей пока нет записей. Попробуйте заглянуть позже!"}
              </p>
              
              {isFiltered && (
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 bg-[#1c1c1c] text-white hover:bg-amber-500 px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-colors duration-300 pointer-events-auto shadow-sm"
                >
                  <RotateCcw size={14} /> Сбросить все фильтры
                </Link>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
