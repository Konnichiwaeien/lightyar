import Link from "next/link";
import { ArrowUpRight, CalendarDays, Tag } from "lucide-react";
import { ResilientImage } from "@/components/ui/resilient-image";
import type { StrapiNews } from "@/lib/api/types";
import { strapiClient } from "@/lib/api/client";

const dateFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function NewsJournalCard({ article, isLarge }: { article: StrapiNews; isLarge: boolean }) {
  const date = article.publishedAt ? new Date(article.publishedAt) : null;
  const validDate = date && !Number.isNaN(date.getTime());
  return (
    <li className={`news-story${isLarge ? " news-story--large" : ""}`}>
      <Link href={`/news/${article.slug}`} className="news-story__link" aria-labelledby={`news-title-${article.id}`}>
        <div className="news-story__photo">
          <ResilientImage src={article.mainImage?.url ? strapiClient.resolveMediaUrl(article.mainImage.url) : "/photo-placeholder.jpg"}
            alt="" fill
            sizes={isLarge ? "(max-width: 767px) 100vw, (max-width: 1023px) 45vw, 420px" : "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 440px"}
            loading="lazy" />
          <div className="news-story__tags">{article.tags?.length ? article.tags.slice(0, 3).map(tag =>
            <span key={tag.id}><Tag size={11} aria-hidden="true" />{tag.name}</span>) : <span><Tag size={11} aria-hidden="true" />Новость</span>}
          </div>
        </div>
        <div className="news-story__body">
          {validDate && <time className="news-story__date" dateTime={article.publishedAt}><CalendarDays size={14} aria-hidden="true" />{dateFormat.format(date)}</time>}
          <h2 id={`news-title-${article.id}`}>{article.title}</h2>
          <p>{article.excerpt || article.content}</p>
          <span className="news-story__read">Читать полностью <span><ArrowUpRight size={20} aria-hidden="true" /></span></span>
        </div>
      </Link>
    </li>
  );
}
