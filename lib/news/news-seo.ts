import type { StrapiNews } from "../api/types.ts";
import { siteUrl } from "../seo/site.ts";

export type NewsSearchParams = Record<string, string | string[] | undefined>;

export function newsCatalogState(params: NewsSearchParams) {
  const requested = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isSafeInteger(requested) && requested > 0 ? requested : 1;
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const tag = typeof params.tag === "string" ? params.tag : "";
  const sort = params.sort === "publishedAt:asc" ? "publishedAt:asc" : "publishedAt:desc";
  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (tag) query.set("tag", tag);
  if (sort === "publishedAt:asc") query.set("sort", sort);
  if (page > 1) query.set("page", String(page));
  return { page, search, tag, sort, noindex: Boolean(search || tag || sort === "publishedAt:asc"),
    canonical: siteUrl(`/news${query.size ? `?${query}` : ""}`) };
}

export function newsDescription(article: Pick<StrapiNews, "excerpt" | "content">) {
  const text = (article.excerpt || article.content || "Новости и истории приюта «Светлый» в Ярославле.")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\s+/g, " ").trim();
  return text.length > 180 ? `${text.slice(0, 177).replace(/\s+\S*$/, "")}…` : text;
}

export function newsArticleSchema(article: StrapiNews, images: string[]) {
  const isoDate = (value: string) => Number.isNaN(Date.parse(value)) ? undefined : new Date(value).toISOString();
  return {
    "@context": "https://schema.org", "@type": "NewsArticle",
    headline: article.title, description: newsDescription(article),
    mainEntityOfPage: siteUrl(`/news/${article.slug}`), url: siteUrl(`/news/${article.slug}`),
    image: images.length ? images : undefined,
    datePublished: isoDate(article.publishedAt), dateModified: isoDate(article.updatedAt),
    inLanguage: "ru-RU",
    publisher: { "@type": "Organization", name: "АНБО «Светлый»", url: siteUrl("/") },
  };
}

export const serializeNewsSchema = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
