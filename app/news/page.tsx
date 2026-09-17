import { Suspense } from "react";
import { InnerHeader } from "@/components/layout/inner-header";
import { NewsControls } from "@/components/news/news-controls";
import { NewsHero } from "@/components/news/news-hero";
import { NewsJournalCard } from "@/components/news/news-journal-card";
import { NewsPagination } from "@/components/news/news-pagination";
import type { Metadata } from "next";
import { newsService } from "@/lib/api/services/news";
import { Newspaper, RotateCcw } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { newsCatalogState } from "@/lib/news/news-seo";
import "@/components/news/news-page.css";

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { page, canonical, noindex } = newsCatalogState(await searchParams);
  const title = `Новости и истории спасения${page > 1 ? ` — страница ${page}` : ""}`;
  const description = "Новости приюта «Светлый» в Ярославле: истории подопечных, приветы из новых семей, помощь волонтёров и отчёты о сборах.";
  return {
    title, description, alternates: { canonical }, robots: { index: !noindex, follow: true },
    openGraph: { title, description, url: canonical, type: "website", locale: "ru_RU", siteName: "Светлый", images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Приют «Светлый»" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.jpg"] },
  };
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { tag, search, sort, page } = newsCatalogState(params);
  const itemsPerPage = 9;
  const start = (page - 1) * itemsPerPage;
  const [newsData, tags] = await Promise.all([
    newsService.getNews({ tag, search, sort, limit: itemsPerPage, start, includeGallery: false }),
    newsService.getTags(),
  ]);
  const articles = newsData.data || [];
  const totalItems = newsData.meta?.pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (page > Math.max(1, totalPages)) notFound();
  const safePage = Math.max(1, Math.min(page, totalPages || 1));
  const isFiltered = !!(tag || search);

  return (
    <div className="news-page">
      <InnerHeader />
      <main id="main-content" tabIndex={-1}>
        <NewsHero />
        <section id="news-feed" className="news-feed" aria-label="Список новостей">
          <div className="news-shell">
            <Suspense fallback={null}><NewsControls tags={tags.map(({ name, slug }) => ({ name, slug }))} totalItems={totalItems} /></Suspense>
            {articles.length ? <>
              <ul className="news-grid" role="list">
                {articles.map((article, index) => {
                  const globalIndex = start + index;
                  return <NewsJournalCard key={article.id} article={article} isLarge={globalIndex % 7 === 0 || globalIndex % 7 === 3} />;
                })}
              </ul>
              <Suspense fallback={null}><NewsPagination currentPage={safePage} totalPages={totalPages} /></Suspense>
            </> : <div className="news-empty">
              <Newspaper size={38} aria-hidden="true" />
              <h2>Новости не найдены</h2>
              <p>{isFiltered ? "Попробуйте другие слова или уберите часть выбранных тем." : "Здесь пока нет новостей. Загляните позже."}</p>
              {isFiltered && <Link href="/news#news-feed"><RotateCcw size={16} aria-hidden="true" />Сбросить все фильтры</Link>}
            </div>}
          </div>
        </section>
      </main>
    </div>
  );
}
