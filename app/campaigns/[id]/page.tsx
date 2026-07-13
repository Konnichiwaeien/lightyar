import { InnerHeader } from "@/components/layout/inner-header";
import { campaignsService } from "@/lib/api/services/campaigns";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { CampaignInteractiveWidget } from "@/components/campaigns/campaign-interactive-widget";
import { CampaignProgressCard } from "@/components/campaigns/campaign-progress-card";
import { CampaignGallery } from "@/components/campaigns/campaign-gallery";
import { CampaignShare } from "@/components/campaigns/campaign-share";
import { CampaignMobileCta } from "@/components/campaigns/campaign-mobile-cta";
import { CampaignScrollAnimations } from "@/components/campaigns/campaign-scroll-animations";
import { CampaignCountdown } from "@/components/campaigns/campaign-countdown";

export const revalidate = 3600; // Enable ISR revalidation every hour

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const campaign = await campaignsService.getCampaignByIdOrSlug(resolvedParams.id);

  if (!campaign) {
    return {
      title: "Сбор не найден | Светлый",
    };
  }

  // Resolve OG image
  let ogImage = "https://svetly.org/og-default.jpg";
  if (campaign.images && campaign.images.length > 0) {
    ogImage = campaignsService.resolveMediaUrl(campaign.images[0].url);
  }

  const description = campaign.shortDesc || "Поддержите сборы и проекты помощи бездомным животным в Ярославле.";

  return {
    title: `${campaign.title} | Сборы приюта «Светлый»`,
    description,
    openGraph: {
      title: `${campaign.title} — Помогите подопечным приюта «Светлый»`,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: campaign.title }],
      type: "website",
      siteName: "АНБО Светлый",
    },
    twitter: {
      card: "summary_large_image",
      title: campaign.title,
      description,
      images: [ogImage],
    },
  };
}

// Generate static params for compile-time speed (SSG)
export async function generateStaticParams() {
  const identifierObjects = await campaignsService.getAllCampaignIdentifiers();
  const paramsList = [];
  for (const item of identifierObjects) {
    if (item.id) paramsList.push({ id: item.id });
    if (item.slug) paramsList.push({ id: item.slug });
  }
  return paramsList;
}

const formatRussianDate = (date: Date) => {
  const months = [
    "ЯНВАРЯ", "ФЕВРАЛЯ", "МАРТА", "АПРЕЛЯ", "МАЯ", "ИЮНЯ",
    "ИЮЛЯ", "АВГУСТА", "СЕНТЯБРЯ", "ОКТЯБРЯ", "НОЯБРЯ", "ДЕКАБРЯ"
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year} Г.`;
};

export default async function CampaignDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const rawCampaign = await campaignsService.getCampaignByIdOrSlug(resolvedParams.id);

  if (!rawCampaign) {
    notFound();
  }

  // Parse total and current
  const total = Number(rawCampaign.total) || 100;
  const current = Number(rawCampaign.current) || 0;
  
  // Parse dates
  const startDate = rawCampaign.publishedAt ? new Date(rawCampaign.publishedAt) : new Date(rawCampaign.createdAt);
  const startStr = formatRussianDate(startDate);
  
  const deadlineDate = rawCampaign.deadline ? new Date(rawCampaign.deadline) : null;
  const endStr = deadlineDate ? formatRussianDate(deadlineDate) : "ДО ДОСТИЖЕНИЯ ЦЕЛИ";

  // Resolve image URLs
  const imageUrls: string[] = [];
  if (rawCampaign.images && rawCampaign.images.length > 0) {
    rawCampaign.images.forEach(img => {
      imageUrls.push(campaignsService.resolveMediaUrl(img.url));
    });
  } else if (rawCampaign.pet?.photos && rawCampaign.pet.photos.length > 0) {
    // У сбора нет своей галереи — показываем фото питомца, для которого он открыт
    rawCampaign.pet.photos.slice(0, 3).forEach(photo => {
      imageUrls.push(campaignsService.resolveMediaUrl(photo.url));
    });
  } else {
    imageUrls.push("/photo-placeholder.jpg");
  }

  // Map donations feed from real database transactions relation
  const donations = rawCampaign.donations || [];
  const feedMapped = [...donations]
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
    .map(d => ({
      name: d.donorName || "Анонимный помощник",
      type: d.type === "monthly" ? "Ежемесячная помощь" : "Разовая помощь",
      date: new Date(d.publishedAt || d.createdAt).toLocaleDateString("ru-RU"),
      amount: Number(d.amount) || 0
    }));

  const campaign = {
    id: rawCampaign.documentId,
    title: rawCampaign.title,
    shortDesc: rawCampaign.shortDesc,
    longDesc: rawCampaign.longDesc || "Сбор средств для подопечных нашего приюта. Спасибо вам за помощь!",
    current,
    total,
    images: imageUrls,
    feed: feedMapped,
  };

  // Split title elegantly for brand colors. Parentheses block takes precedence to color the entire brackets block orange.
  const titleUpper = campaign.title.toUpperCase();
  let mainPart = titleUpper;
  let lastWord = "";
  
  const parenIndex = titleUpper.indexOf("(");
  if (parenIndex !== -1) {
    mainPart = titleUpper.slice(0, parenIndex).trim();
    lastWord = titleUpper.slice(parenIndex).trim();
  } else {
    const titleWords = titleUpper.trim().split(/\s+/);
    if (titleWords.length > 1) {
      lastWord = titleWords.pop() || "";
      mainPart = titleWords.join(" ");
    }
  }

  // Fetch real other active campaigns dynamically from Strapi
  const allCampaignsRaw = await campaignsService.getCampaigns({ status: "active", limit: 4 }) || { data: [] };
  const otherCampaigns = (allCampaignsRaw.data || [])
    .filter(c => c.documentId !== campaign.id)
    .slice(0, 3)
    .map(c => {
      let imageUrl = "";
      if (c.images && c.images.length > 0) {
        imageUrl = campaignsService.resolveMediaUrl(c.images[0].url);
      } else if (c.pet?.photos && c.pet.photos.length > 0) {
        imageUrl = campaignsService.resolveMediaUrl(c.pet.photos[0].url);
      } else {
        imageUrl = "/photo-placeholder.jpg";
      }
      return {
        id: c.documentId,
        title: c.title,
        shortDesc: c.shortDesc || "",
        current: Number(c.current) || 0,
        total: Number(c.total) || 100,
        image: imageUrl,
        tag: c.tag || "Срочно",
        createdAt: c.createdAt,
        deadline: c.deadline || null,
      };
    });

  // JSON-LD BreadcrumbList structured data
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://svetly.org/" },
      { "@type": "ListItem", "position": 2, "name": "Сборы", "item": "https://svetly.org/campaigns" },
      { "@type": "ListItem", "position": 3, "name": campaign.title },
    ]
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] selection:bg-[#f59e0b]/20 selection:text-[#d97706] font-sans text-[#1c1c1c] relative">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Override body bg for footer ear fix */}
      <style dangerouslySetInnerHTML={{ __html: 'body { background-color: #faf8f5 !important; }' }} />

      <InnerHeader />
      
      <main className="max-w-[1600px] mx-auto pt-2 md:pt-4 px-6 md:px-12 pb-24 relative z-10">
        
        {/* Breadcrumbs */}
        <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#8c857b]/60 mb-20 md:mb-28 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[#d97706] transition-colors">ГЛАВНАЯ</Link>
          <span>/</span>
          <Link href="/campaigns" className="hover:text-[#d97706] transition-colors">СБОРЫ</Link>
          <span>/</span>
          <span className="text-[#8c857b]">{campaign.title.toUpperCase()}</span>
        </div>

        {/* ═══ Main Two-Column Bento Grid ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
          
          {/* Left Column (8 Columns) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Header Content Wrapper */}
            <CampaignScrollAnimations>
              {/* Active Pill Badge + Countdown */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="bg-[#fdf0e9] text-[#d97706] border border-[#d97706]/10 text-[10px] md:text-xs font-extrabold tracking-widest px-3.5 py-2 rounded-full uppercase inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse" />
                  АКТИВНЫЙ СБОР
                </span>
                <CampaignCountdown deadline={deadlineDate ? deadlineDate.toISOString() : null} />
              </div>

              {/* Heading Editorial Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6.5xl font-serif font-bold uppercase tracking-tight text-[#1c1c1c] leading-[1.05] mb-6">
                {mainPart}{" "}
                {lastWord && <span className="text-[#d97706]">{lastWord}</span>}
              </h1>

              {/* Dates metadata block + Share */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#8c857b]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#d97706] text-xs">📅</span>
                    <span>НАЧАЛО: {startStr}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#d97706] text-xs">🎯</span>
                    <span>ОКОНЧАНИЕ: {endStr}</span>
                  </div>
                </div>
                <CampaignShare title={campaign.title} campaignId={campaign.id} />
              </div>

              {/* Clean horizontal divider line */}
              <hr className="border-t border-stone-200/60 w-full mb-8" />

              {/* Large short description */}
              <div className="text-base md:text-lg lg:text-xl font-serif italic text-stone-700 leading-relaxed mb-10">
                {campaign.shortDesc}
              </div>
            </CampaignScrollAnimations>

            {/* Swiper Gallery */}
            <CampaignGallery images={campaign.images} title={campaign.title} />

            {/* Dynamic Interactive Progress Card ("О СБОРЕ" / "ПОДДЕРЖАЛИ") */}
            <CampaignProgressCard
              current={campaign.current}
              total={campaign.total}
              feed={campaign.feed}
            />

            {/* Description Card ("О ПРОЕКТЕ") */}
            <CampaignScrollAnimations delay={0.1}>
              <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-stone-200/60 shadow-[0_4px_25px_rgba(0,0,0,0.015)]">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
                  <div className="w-10 h-10 rounded-xl bg-[#fdf0e9] border border-[#f59e0b]/10 flex items-center justify-center shrink-0">
                    <span className="text-[#d97706] text-base">🛡️</span>
                  </div>
                  <h3 className="font-sans font-black uppercase tracking-wider text-base md:text-lg text-stone-850">
                    О ПРОЕКТЕ
                  </h3>
                </div>

                <div className="prose prose-stone prose-sm sm:prose-base max-w-none text-stone-600 font-medium leading-relaxed space-y-6">
                  {campaign.longDesc.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="leading-relaxed">{paragraph.trim()}</p>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-stone-100 flex items-center">
                  <span className="text-[#d97706] mr-2 text-xs">🧡</span>
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#8c857b]/60">
                    ОФИЦИАЛЬНЫЙ СБОР ФОНДА
                  </span>
                </div>
              </div>
            </CampaignScrollAnimations>

          </div>

          {/* Right Column (4 Columns - Sticky Payment Form Widget) */}
          <div className="lg:col-span-4 lg:sticky lg:top-8 self-start">
            <CampaignInteractiveWidget campaignId={campaign.id} />
          </div>

        </div>

        {/* ═══ Other Campaigns Grid ═══ */}
        {otherCampaigns.length > 0 && (
          <CampaignScrollAnimations delay={0.15}>
            <section className="mt-20 border-t border-stone-200/50 pt-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold uppercase tracking-tight text-[#1c1c1c] text-center mb-12 md:mb-16">
                ДРУГИЕ <span className="text-[#d97706]">СБОРЫ</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" role="list">
                {otherCampaigns.map((item) => {
                  const itemStartDate = new Date(item.createdAt);
                  const startMonth = itemStartDate.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
                  const deadlineStr = item.deadline
                    ? new Date(item.deadline).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })
                    : "бессрочно";
                  return (
                    <div key={item.id} className="group">
                      <Link
                        href={`/campaigns/${item.id}`}
                        className="flex flex-col h-full bg-white rounded-[1.5rem] overflow-hidden border border-stone-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] transition-all duration-300"
                      >
                        <div className="aspect-[16/10] overflow-hidden relative shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#d97706] border border-[#f59e0b]/10 shadow-2xs font-sans">
                            {item.tag}
                          </div>
                        </div>
                        <div className="p-6 md:p-7 flex flex-col flex-1 justify-between">
                          <div>
                            <h3 className="font-serif font-bold text-xl md:text-2xl text-[#1c1c1c] leading-snug mb-3 group-hover:text-[#d97706] transition-colors duration-200">
                              {item.title}
                            </h3>
                            {item.shortDesc && (
                              <p className="text-sm text-[#8c857b] leading-relaxed mb-4 font-serif line-clamp-2">
                                {item.shortDesc}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[#8c857b]/70 mb-5 font-sans">
                              <span className="flex items-center gap-1">
                                <span className="text-[#d97706]">📅</span> {startMonth}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="text-[#d97706]">🎯</span> {deadlineStr}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div 
                              className="w-full h-3 bg-stone-100 rounded-full relative overflow-hidden mb-3"
                              role="progressbar"
                              aria-valuenow={item.current}
                              aria-valuemin={0}
                              aria-valuemax={item.total}
                            >
                              <div className="absolute top-0 left-0 h-full rounded-full bg-[#f59e0b]" style={{ width: `${Math.min(100, (item.current / item.total) * 100)}%` }} />
                            </div>
                            <div className="flex justify-between text-[11px] md:text-xs text-[#8c857b] font-bold uppercase tracking-[0.12em] font-sans">
                              <span className="text-[#1c1c1c] font-black">{item.current.toLocaleString()} ₽</span>
                              <span>из {item.total.toLocaleString()} ₽</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>

              <div className="text-center mt-14 md:mt-16">
                <Link
                  href="/campaigns"
                  className="inline-flex items-center gap-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white px-12 py-5 rounded-full font-extrabold uppercase tracking-widest text-xs shadow-sm transition-all duration-300 hover:scale-102 font-serif"
                >
                  <span>Все сборы</span>
                  <span className="text-sm leading-none">→</span>
                </Link>
              </div>
            </section>
          </CampaignScrollAnimations>
        )}
      </main>

      {/* Mobile Floating CTA */}
      <CampaignMobileCta />
    </div>
  );
}
