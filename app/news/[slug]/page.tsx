import { InnerHeader } from "@/components/layout/inner-header";
import { ArrowLeft, Calendar, Tag, ArrowUpRight } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { newsService } from "@/lib/api/services/news";
import { NewsSlider } from "@/components/news/news-slider";
import { NewsAttachments } from "@/components/news/news-attachments";
import "@/components/news/news-article.css";
import { cache } from "react";
import { siteUrl } from "@/lib/seo/site";
import { newsArticleSchema, newsDescription, serializeNewsSchema } from "@/lib/news/news-seo";
import { parseNewsInline } from "@/lib/news/news-inline";
import { newsPresentation } from "@/lib/news/news-presentation";
import {
  buildNewsSlides,
  getSupplementaryNewsAttachments,
} from "@/lib/news/news-media";

export const revalidate = 3600; // Enable ISR, revalidate every hour
const getArticle = cache((slug: string) => newsService.getNewsBySlug(slug));

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticle(resolvedParams.slug);

  if (!article) {
    return {
      title: "Новость не найдена", robots: { index: false, follow: true },
    };
  }

  const description = newsDescription(article);
  const { title } = newsPresentation(article);
  const url = siteUrl(`/news/${article.slug}`);
  const image = article.mainImage?.url ? newsService.resolveMediaUrl(article.mainImage.url) : siteUrl("/og-image.jpg");
  return {
    title: `${title} | Новости`,
    description, alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", locale: "ru_RU", siteName: "Светлый",
      publishedTime: article.publishedAt, modifiedTime: article.updatedAt,
      images: [{ url: image, alt: article.mainImage?.alternativeText || article.title }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

// Generate static params for all slugs for SSG compile time speed
export async function generateStaticParams() {
  const slugs = await newsService.getAllNewsSlugs();
  return slugs.map((slug) => ({ slug }));
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

// Helper to parse VK markdown links like [displayName](url) into clickable React anchor tags
function parseMarkdownLinks(text: string): React.ReactNode[] {
  return parseNewsInline(text).map((part, index) => part.href ? (
      <a
        key={index}
        href={part.href}
        target="_blank"
        rel="noopener noreferrer"
        className="news-article-link"
      >
        {part.text}
      </a>
    ) : part.text);
}

// Helper to split text by paragraphs (double newlines) and lines (single newlines)
function renderContent(content?: string) {
  if (!content) return null;
  
  // Split by double newlines (with optional spaces in between)
  const paragraphs = content.split(/\r?\n\s*\r?\n/);
  
  return paragraphs.map((para, paraIdx) => {
    const trimmedPara = para.trim();
    if (!trimmedPara) return null;
    
    const lines = para.split(/\r?\n/);
    const renderedElements: React.ReactNode[] = [];
    
    lines.forEach((line, lineIdx) => {
      const parsed = parseMarkdownLinks(line);
      renderedElements.push(...parsed);
      
      // Smart inline flowing of text lines
      if (lineIdx < lines.length - 1) {
        const currentLineTrimmed = line.trim();
        const nextLineTrimmed = lines[lineIdx + 1]?.trim() || "";
        
        // Bullet list support: check if current or next line is a list item
        const isCurrentBullet = /^[-*•\d+\.]/.test(currentLineTrimmed);
        const isNextBullet = /^[-*•\d+\.]/.test(nextLineTrimmed);
        
        if (isCurrentBullet || isNextBullet) {
          renderedElements.push(<br key={`br-${lineIdx}`} />);
        } else {
          // Typographic optimization: don't insert space if next line starts with punctuation (e.g. '. Покалеченный')
          const startsWithPunctuation = /^[.,!?;)]/.test(nextLineTrimmed);
          if (!startsWithPunctuation) {
            renderedElements.push(" ");
          }
        }
      }
    });
    
    return (
      <p key={paraIdx} className="news-article-paragraph">
        {renderedElements}
      </p>
    );
  });
}

export default async function NewsDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const article = await getArticle(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  if (article.slug && resolvedParams.slug !== article.slug) permanentRedirect(`/news/${article.slug}`);

  const resolveMediaUrl = (url: string) => newsService.resolveMediaUrl(url);
  const presentation = newsPresentation(article);
  const mediaSlides = buildNewsSlides(article, resolveMediaUrl);
  const supplementaryAttachments = getSupplementaryNewsAttachments(
    article.attachments,
    resolveMediaUrl,
  );

  return (
    <div className="news-article-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeNewsSchema(newsArticleSchema(article, mediaSlides.filter(item => item.kind === "image").map(item => item.src))) }} />
      <InnerHeader />
      
      <main id="main-content" tabIndex={-1} className="news-article-main">
        <div className="news-article-shell">
          
          {/* Return to the news catalog */}
          <Link 
            href="/news#news-feed"
            className="news-article-back"
          >
            <ArrowLeft size={17} aria-hidden="true" /> Назад к новостям
          </Link>

          {/* Article Header */}
          <article className="w-full">
            <header className="news-article-header">
              <div className="news-article-meta">
                <span className="news-article-topic">
                  <Tag size={15} aria-hidden="true" /> {article.tags?.[0]?.name || "Новость"}
                </span>
                <time className="news-article-date" dateTime={article.publishedAt}>
                  <Calendar size={15} aria-hidden="true" /> {formatDate(article.publishedAt)}
                </time>
              </div>

              <h1 className="news-article-title">
                {presentation.title}
              </h1>

              {presentation.excerpt && (
                <p className="news-article-lead">
                  {presentation.excerpt}
                </p>
              )}
            </header>

            {/* Image and video slider */}
            <NewsSlider items={mediaSlides} title={article.title} />

            {/* Article Content */}
            <div className="news-article-content">
              {renderContent(presentation.content)}
            </div>

            <NewsAttachments items={supplementaryAttachments} />

            {/* VK Call-To-Action (if imported from VK) */}
            {article.vkUrl && (
              <aside className="news-vk" aria-labelledby="news-vk-title">
                <span className="news-vk__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.547 7h-3.29a.743.743 0 0 0-.655.392s-1.312 2.416-1.734 3.23C14.734 12.813 14 12.126 14 11.11V7.603A1.104 1.104 0 0 0 12.896 6.5h-2.474a1.982 1.982 0 0 0-1.75.813s1.255-.204 1.255 1.49c0 .42.017 1.7.028 2.785.01.98-.686 1.34-1.142.587-.652-1.075-1.445-3.01-1.445-3.01A.756.756 0 0 0 6.698 8.5H3.453a.7.7 0 0 0-.622.39c-.23.444-.011.998.451 2.223l.07.145c.96 2.036 2.2 3.899 3.96 5.089C9.072 17.63 11.1 18 12.78 18h1.538c.575 0 .82-.252.82-.685v-1.428c0-.573.245-.685.425-.685.24 0 .654.096 1.617 1.007 1.104 1.104 1.285 1.6 1.906 1.6h2.96c.436 0 .652-.218.527-.648-.136-.466-.63-1.146-1.283-1.95-.354-.443-.886-1.1-1.048-1.386-.24-.372-.17-.538 0-.868 0 0 2.514-3.548 2.775-4.753.09-.42-.1-.624-.442-.624z" /></svg>
                </span>
                <div className="news-vk__copy">
                  <h2 id="news-vk-title">Обсудить во ВКонтакте</h2>
                  <p>Эта история опубликована в нашем сообществе ВКонтакте. Там вы можете написать комментарий, задать вопрос или поддержать нас репостом.</p>
                </div>
                <a href={article.vkUrl} target="_blank" rel="noopener noreferrer" className="news-vk__button">
                  Перейти к посту <ArrowUpRight size={19} aria-hidden="true" />
                  <span className="sr-only"> (в новой вкладке)</span>
                </a>
              </aside>
            )}

          </article>
        </div>
      </main>
    </div>
  );
}
