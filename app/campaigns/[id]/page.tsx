import { InnerHeader } from "@/components/layout/inner-header";
import { CampaignGallery } from "@/components/campaigns/campaign-gallery";
import { Heart } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { campaignsService } from "@/lib/api/services/campaigns";

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

  return {
    title: `${campaign.title} | Сборы приюта «Светлый»`,
    description: campaign.shortDesc || "Поддержите сборы и проекты помощи бездомным животным в Ярославле.",
  };
}

// Generate static params for compile-time speed (SSG)
export async function generateStaticParams() {
  const identifierObjects = await campaignsService.getAllCampaignIdentifiers();
  // Return both ids and slugs as potential parameters to pre-render
  const paramsList = [];
  for (const item of identifierObjects) {
    if (item.id) paramsList.push({ id: item.id });
    if (item.slug) paramsList.push({ id: item.slug });
  }
  return paramsList;
}

export default async function CampaignDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const rawCampaign = await campaignsService.getCampaignByIdOrSlug(resolvedParams.id);

  if (!rawCampaign) {
    notFound();
  }

  // Parse total and current
  const total = Number(rawCampaign.total) || 100;
  const current = Number(rawCampaign.current) || 0;
  const deadlineDate = rawCampaign.deadline ? new Date(rawCampaign.deadline) : null;
  const deadlineStr = deadlineDate ? deadlineDate.toLocaleDateString("ru-RU") : "окончания сбора";

  // Resolve image URLs
  const imageUrls: string[] = [];
  if (rawCampaign.images && rawCampaign.images.length > 0) {
    rawCampaign.images.forEach(img => {
      imageUrls.push(campaignsService.resolveMediaUrl(img.url));
    });
  } else {
    // Default fallback images matching visual guidelines
    imageUrls.push(
      "https://images.unsplash.com/photo-1544568100-847a9ec5d878?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800"
    );
  }

  // Resolve direct linked pet details
  const petName = rawCampaign.pet?.name || "";
  const petUrl = rawCampaign.pet?.documentId ? `/pets/${rawCampaign.pet.documentId}` : null;

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
    deadline: deadlineStr,
    images: imageUrls,
    feed: feedMapped,
    petName,
    petUrl
  };

  const detailedDescription = (
    <div className="bg-white rounded-[2rem] p-8 md:p-12 lg:p-16 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-[#1c1c1c]/5 w-full pointer-events-auto">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-8 text-[#1c1c1c]">О сборе подробно</h2>
      <div className="prose prose-lg max-w-none text-[#1c1c1c]/70 font-light leading-relaxed prose-p:mb-6">
        {campaign.longDesc.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph.trim()}</p>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#e8e4dc] selection:bg-amber-500 selection:text-white font-sans text-[#1c1c1c]">
      <InnerHeader />
      <main className="max-w-[1400px] mx-auto pt-8 px-6 md:px-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start relative mb-12">
          
          {/* Left: Gallery (Sticky) */}
          <div className="lg:col-span-7 lg:sticky lg:top-8">
            <CampaignGallery images={campaign.images} />
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Main Info Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-[#1c1c1c]/5 pointer-events-auto">
              {campaign.petName && campaign.petUrl && (
                <Link
                  href={campaign.petUrl}
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-500/10 mb-4 hover:bg-amber-500 hover:text-white transition-all duration-300 pointer-events-auto"
                >
                  Сбор для питомца: {campaign.petName} →
                </Link>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif leading-[1.1] mb-6 text-[#1c1c1c]">
                {campaign.title}
              </h1>
              <p className="text-[#1c1c1c]/50 text-base font-light mb-10">
                {campaign.shortDesc}
              </p>

              {/* Progress Section */}
              <div className="mb-8">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl md:text-5xl font-serif text-[#1c1c1c]">
                    {campaign.current.toLocaleString()} <span className="font-sans font-light text-amber-500">₽</span>
                  </span>
                  <span className="text-sm font-sans font-light text-[#1c1c1c]/30">/ {campaign.total.toLocaleString()} ₽</span>
                </div>
                
                <div className="w-full h-2 md:h-3 bg-[#e8e4dc] rounded-full relative overflow-hidden mb-3">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 bg-amber-500"
                    style={{ width: `${Math.min(100, (campaign.current / campaign.total) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#1c1c1c]/40 uppercase tracking-widest font-bold">
                  Осталось собрать: {Math.max(0, campaign.total - campaign.current).toLocaleString()} ₽ до {campaign.deadline}
                </p>
              </div>

              {/* Main Action Button */}
              <button className="w-full bg-[#1c1c1c] text-white hover:bg-amber-500 transition-colors duration-300 py-5 rounded-[1.5rem] md:rounded-[1.5rem] font-bold uppercase tracking-widest text-xs">
                Сделать пожертвование
              </button>
            </div>

            {/* Alert Card */}
            {/* <div className="bg-amber-50 rounded-[2rem] p-6 flex gap-4 items-start border border-amber-500/10 shadow-[0_4px_20px_rgb(0,0,0,0.02)] pointer-events-auto">
              <div className="bg-amber-500 text-white p-3 rounded-[1rem] shrink-0 shadow-[0_4px_10px_rgba(245,158,11,0.2)]">
                <Megaphone size={20} strokeWidth={2} />
              </div>
              <p className="text-xs font-medium text-[#1c1c1c]/70 leading-relaxed pt-1">
                Друзья, внимание! В случае, если сбор превысит потребности, пожертвования будут использованы на другие срочные сборы фонда. Спасибо вам!
              </p>
            </div> */}

            {/* Donation Feed Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-[#1c1c1c]/5 pointer-events-auto flex flex-col max-h-[400px]">
              <h3 className="font-serif text-2xl mb-4 text-[#1c1c1c] shrink-0">Лента помощи</h3>
              
              <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                {campaign.feed.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#f9f8f6] rounded-[1rem] p-4 transition-all duration-300 hover:bg-[#e8e4dc]/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-amber-500 shadow-sm">
                        <Heart size={16} className="fill-amber-500/20" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#1c1c1c] mb-0.5">{item.name}</div>
                        <div className="text-[10px] text-[#1c1c1c]/40 uppercase tracking-widest">{item.type}, {item.date}</div>
                      </div>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-white text-[#1c1c1c] font-bold text-xs shadow-sm">
                      {item.amount.toFixed(0)} ₽
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Detail Text Card */}
        {detailedDescription}

        {/* Promo Block */}
        <section className="mt-16 mb-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#1c1c1c] mb-4">
              Помогите <span className="italic text-amber-500">другим</span> подопечным
            </h2>
            <p className="text-[#1c1c1c]/50 text-lg font-light max-w-xl mx-auto">
              Каждый сбор — это чья-то надежда. Посмотрите, кому ещё нужна ваша поддержка.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Операция для Рекса", img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600", current: 22000, total: 50000, tag: "Срочно" },
              { title: "Закупка корма на зиму", img: "https://images.unsplash.com/photo-1601630138404-32b0ed355153?auto=format&fit=crop&q=80&w=600", current: 18000, total: 40000, tag: "Регулярный" },
              { title: "Стерилизация кошек приюта", img: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee9?auto=format&fit=crop&q=80&w=600", current: 9500, total: 30000, tag: "Медицина" },
            ].map((item, idx) => (
              <Link
                key={idx}
                href="/campaigns"
                className="group bg-white rounded-[2rem] overflow-hidden border border-[#1c1c1c]/5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden relative">
                  <Image src={item.img} alt={item.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-linear-to-t from-white via-white/20 to-transparent opacity-80" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]">
                    {item.tag}
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="font-serif text-xl mb-4 text-[#1c1c1c] group-hover:text-amber-500 transition-colors duration-300 leading-tight">
                    {item.title}
                  </h3>
                  <div className="w-full h-2 bg-[#e8e4dc] rounded-full relative overflow-hidden mb-3">
                    <div className="absolute top-0 left-0 h-full rounded-full bg-amber-500" style={{ width: `${(item.current / item.total) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-[#1c1c1c]/40 font-bold uppercase tracking-widest">
                    <span>{item.current.toLocaleString()} ₽</span>
                    <span>из {item.total.toLocaleString()} ₽</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-3 bg-[#1c1c1c] text-white px-10 py-5 rounded-[1.5rem] font-bold uppercase tracking-widest text-xs hover:bg-amber-500 transition-colors duration-300"
            >
              Смотреть все сборы
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
