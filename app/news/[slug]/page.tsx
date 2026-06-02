import { InnerHeader } from "@/components/layout/inner-header";
import { ArrowLeft, Calendar, Tag, ArrowUpRight } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { newsService } from "@/lib/api/services/news";
import { NewsSlider } from "@/components/news/news-slider";

export const revalidate = 3600; // Enable ISR, revalidate every hour

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await newsService.getNewsBySlug(resolvedParams.slug);

  if (!article) {
    return {
      title: "Новость не найдена | Светлый",
    };
  }

  return {
    title: `${article.title} | Новости приюта «Светлый»`,
    description: article.excerpt || "Читайте последние новости и истории спасения в нашем приюте.",
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
  const day = date.getDate();
  const months = [
    "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
    "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// Helper to parse VK markdown links like [displayName](url) into clickable React anchor tags
function parseMarkdownLinks(text: string): React.ReactNode[] {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [, linkText, linkUrl] = match;
    const startIndex = match.index;

    // Add preceding plain text
    if (startIndex > lastIndex) {
      elements.push(text.substring(lastIndex, startIndex));
    }

    // Add clickable link element
    elements.push(
      <a
        key={startIndex}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-amber-500 hover:text-amber-600 underline font-medium break-all transition-colors duration-300"
      >
        {linkText}
      </a>
    );

    lastIndex = regex.lastIndex;
  }

  // Add trailing plain text
  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements.length > 0 ? elements : [text];
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
      <p key={paraIdx} className="mb-6 leading-relaxed font-light text-[#1c1c1c]/80 text-lg md:text-xl">
        {renderedElements}
      </p>
    );
  });
}

export default async function NewsDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const article = await newsService.getNewsBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const imageUrls: string[] = [];
  if (article.mainImage?.url) {
    imageUrls.push(newsService.resolveMediaUrl(article.mainImage.url));
  }
  if (article.gallery && article.gallery.length > 0) {
    article.gallery.forEach((img) => {
      if (img?.url) {
        const resolved = newsService.resolveMediaUrl(img.url);
        if (resolved && !imageUrls.includes(resolved)) {
          imageUrls.push(resolved);
        }
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#e8e4dc] selection:bg-amber-500 selection:text-white font-sans text-[#1c1c1c]">
      <InnerHeader />
      
      <main className="max-w-[1400px] mx-auto pt-8 px-6 md:px-12 pb-32">
        <div className="max-w-5xl mx-auto relative">
          
          {/* Breadcrumbs */}
          <Link 
            href="/#news" 
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 hover:text-amber-500 transition-colors duration-300 mb-8 pointer-events-auto"
          >
            <ArrowLeft size={14} /> Назад к новостям
          </Link>

          {/* Article Header */}
          <article className="w-full">
            <header className="mb-12">
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-500/10">
                  <Tag size={12} /> {article.tags?.[0]?.name || "Новость"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 bg-[#1c1c1c]/5 px-3.5 py-1.5 rounded-full">
                  <Calendar size={12} /> {formatDate(article.publishedAt)}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1] mb-6 text-[#1c1c1c]">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-lg md:text-xl font-light text-[#1c1c1c]/50 leading-relaxed italic border-l-2 border-amber-500 pl-4 mt-4">
                  {article.excerpt}
                </p>
              )}
            </header>

            {/* Image Slider */}
            <NewsSlider images={imageUrls} title={article.title} />

            {/* Article Content */}
            <div className="prose prose-lg max-w-3xl mx-auto text-[#1c1c1c]/80 font-sans mt-12">
              {renderContent(article.content)}
            </div>

            {/* VK Call-To-Action (if imported from VK) */}
            {article.vkUrl && (
              <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-[#1c1c1c]/5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.05)] transition-all duration-500 flex flex-col md:flex-row justify-between items-center gap-6 mt-16">
                <div className="flex gap-5 items-start">
                  <div className="bg-amber-500 text-white p-4 rounded-[1.5rem] shrink-0 shadow-[0_4px_10px_rgba(245,158,11,0.2)]">
                    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
                      <path d="M15.023 2H8.977C3.992 2 2 3.992 2 8.977v6.046C2 20.008 3.992 22 8.977 22h6.046c4.985 0 6.977-1.992 6.977-6.977V8.977C22 3.992 20.008 2 15.023 2zm3.365 12.392c.57.557.627.81.627.81v.006c0 .248-.184.453-.453.453h-1.921c-.482 0-.825-.262-1.397-.822-.44-.432-.783-.585-.92-.585-.19 0-.348.053-.473.16-.168.14-.249.385-.249.736v.195c0 .174-.143.316-.316.316h-1.127c-2.316 0-4.636-2.434-4.636-2.434s-2.001-2.128-3.08-5.328c-.059-.174.07-.316.243-.316H7.13c.277 0 .474.153.568.396 0 0 .97 2.378 2.213 3.974.39.5.549.658.694.658.077 0 .193-.05.193-.306V9.431c0-.498-.31-.722-.527-.751-.18-.024-.29-.033-.223-.197.095-.23.491-.482 1.026-.482h1.611c.291 0 .524.233.524.524v3.535c0 .224.102.302.164.302.14 0 .285-.084.582-.379.888-.89 1.455-2.923 1.455-2.923s.098-.242.348-.242h1.921c.224 0 .34.12.34.254a4.42 4.42 0 0 1-.161.76s-1.503 3.518-2.379 4.773c-.276.398-.372.553-.372.678 0 .13.076.223.284.426.602.589 2.002 2.016 2.002 2.016z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-serif text-2xl text-[#1c1c1c] mb-2">Обсудить во ВКонтакте</h4>
                    <p className="text-sm font-light text-[#1c1c1c]/50 max-w-lg leading-relaxed">
                      Эта история опубликована в нашем сообществе ВКонтакте. Там вы можете написать комментарий, задать вопрос или поддержать нас репостом.
                    </p>
                  </div>
                </div>
                <a
                  href={article.vkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#1c1c1c] text-white hover:bg-amber-500 px-8 py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-all duration-300 shadow-sm whitespace-nowrap group-hover:-translate-y-0.5"
                >
                  Перейти к посту <ArrowUpRight size={16} />
                </a>
              </div>
            )}

          </article>
        </div>
      </main>
    </div>
  );
}
