import { InnerHeader } from "@/components/layout/inner-header";
import { CampaignGallery } from "@/components/campaigns/campaign-gallery";
import { Heart, PawPrint, Calendar, Ruler, Weight, Syringe, Scissors, Home, Info, ShoppingBag, ArrowUpRight } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Питомец | Светлый",
};

interface PageProps {
  params: { id: string };
}

function getPetMock(id: string) {
  return {
    id,
    name: "Верба",
    species: "Собака",
    breed: "Метис",
    age: 2.5,
    gender: "Девочка",
    color: "Рыжий с белым",
    weight: "18 кг",
    height: "45 см в холке",
    vaccinated: true,
    sterilized: true,
    status: "shelter" as const,
    shortDesc: "Верба — добрейшая рыжая красотка, которая обожает людей и мечтает о своём диване. Ласковая, послушная, отлично гуляет на поводке.",
    longDesc: `Верба попала к нам полтора года назад — её нашли привязанной к дереву у дороги. Сначала она очень боялась людей, но буквально за пару недель расцвела и стала самой общительной девочкой в приюте.

Верба обожает долгие прогулки, с удовольствием бежит рядом на поводке и никогда не тянет. Она прекрасно ладит с другими собаками, а вот к кошкам относится настороженно — поэтому лучше в дом без кошачьих.

Верба знает базовые команды: «сидеть», «лежать», «ко мне». Она невероятно умная и схватывает всё на лету. Идеальный компаньон для активной семьи или человека, который любит пешие прогулки.

Верба привита (комплекс), стерилизована, обработана от паразитов. Полностью здорова, есть ветеринарный паспорт. Мы поможем с доставкой в пределах Ярославской области.`,
    images: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&q=80&w=800",
    ],
    traits: [
      { icon: "calendar", label: "Возраст", value: "2.5 года" },
      { icon: "ruler", label: "Рост", value: "45 см в холке" },
      { icon: "weight", label: "Вес", value: "18 кг" },
      { icon: "syringe", label: "Вакцинация", value: "Привита (комплекс)" },
      { icon: "scissors", label: "Стерилизация", value: "Да" },
      { icon: "paw", label: "Порода", value: "Метис" },
    ],
    wishlist: [
      { name: "Лечебный корм Royal Canin", desc: "Гипоаллергенный, 12 кг", price: 5800, urgent: true },
      { name: "Ошейник от клещей", desc: "Bravecto, на 3 месяца", price: 1200, urgent: false },
      { name: "Тёплая подстилка", desc: "Размер L, зимняя", price: 2500, urgent: false },
      { name: "Игрушка-канат", desc: "Для активных игр", price: 450, urgent: false },
    ],
  };
}

const TRAIT_ICONS: Record<string, React.ReactNode> = {
  calendar: <Calendar size={18} />,
  ruler: <Ruler size={18} />,
  weight: <Weight size={18} />,
  syringe: <Syringe size={18} />,
  scissors: <Scissors size={18} />,
  paw: <PawPrint size={18} />,
};

export default function PetDetailPage({ params }: PageProps) {
  const pet = getPetMock(params.id);

  return (
    <div className="min-h-screen bg-[#e8e4dc] selection:bg-amber-500 selection:text-white font-sans text-[#1c1c1c]">
      <InnerHeader />
      <main className="max-w-[1400px] mx-auto pt-8 px-6 md:px-12 pb-20">

        {/* ═══ Hero: Gallery + Info Card ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start relative mb-16">

          {/* Left: Gallery (Sticky) */}
          <div className="lg:col-span-7 lg:sticky lg:top-8">
            <CampaignGallery images={pet.images} />
          </div>

          {/* Right: Quick Info */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* Name Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-[#1c1c1c]/5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full">{pet.species}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 bg-[#1c1c1c]/5 px-3 py-1.5 rounded-full">{pet.gender}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 bg-[#1c1c1c]/5 px-3 py-1.5 rounded-full">{pet.status === "shelter" ? "В приюте" : "Дома"}</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1] mb-4 text-[#1c1c1c]">
                {pet.name}
              </h1>
              <p className="text-[#1c1c1c]/50 text-base font-light mb-8 leading-relaxed">
                {pet.shortDesc}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3">
                <button className="w-full bg-[#1c1c1c] text-white hover:bg-amber-500 transition-colors duration-300 py-5 rounded-[1.5rem] font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                  <Heart size={18} /> Хочу забрать домой
                </button>
                <button className="w-full bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors duration-300 py-4 rounded-[1.5rem] font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 border border-amber-200">
                  <PawPrint size={18} /> Стать куратором
                </button>
              </div>
            </div>

            {/* Traits Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-[#1c1c1c]/5">
              <h3 className="font-serif text-2xl mb-6 text-[#1c1c1c]">Характеристики</h3>
              <div className="grid grid-cols-2 gap-4">
                {pet.traits.map((trait, idx) => (
                  <div key={idx} className="bg-[#f9f8f6] rounded-[1rem] p-4 flex items-start gap-3 hover:bg-[#e8e4dc]/50 transition-colors">
                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-amber-500 shadow-sm shrink-0 mt-0.5">
                      {TRAIT_ICONS[trait.icon] || <Info size={18} />}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 mb-1">{trait.label}</div>
                      <div className="text-sm font-medium text-[#1c1c1c]">{trait.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-amber-50 rounded-[2rem] p-6 flex gap-4 items-start border border-amber-500/10 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <div className="bg-amber-500 text-white p-3 rounded-[1rem] shrink-0 shadow-[0_4px_10px_rgba(245,158,11,0.2)]">
                <Info size={20} strokeWidth={2} />
              </div>
              <p className="text-xs font-medium text-[#1c1c1c]/70 leading-relaxed pt-1">
                Перед тем как забрать питомца, мы проводим собеседование и проверку условий содержания. Это помогает найти лучшую семью для каждого подопечного.
              </p>
            </div>

          </div>
        </div>

        {/* ═══ About Section ═══ */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 lg:p-16 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-[#1c1c1c]/5 w-full mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4 text-[#1c1c1c]">
            Кто такая <span className="italic text-amber-500">{pet.name}</span>?
          </h2>
          <p className="text-[#1c1c1c]/40 text-sm font-bold uppercase tracking-widest mb-10">История подопечной</p>
          <div className="prose prose-lg max-w-none text-[#1c1c1c]/70 font-light leading-relaxed prose-p:mb-6">
            {pet.longDesc.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph.trim()}</p>
            ))}
          </div>
        </div>

        {/* ═══ Wishlist Section ═══ */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 lg:p-16 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-[#1c1c1c]/5 w-full mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-2 text-[#1c1c1c]">
                Вишлист <span className="italic text-amber-500">{pet.name}</span>
              </h2>
              <p className="text-[#1c1c1c]/50 font-light">Вещи, которые нужны прямо сейчас</p>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-200">
              <ShoppingBag size={16} />
              {pet.wishlist.length} позиций
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pet.wishlist.map((item, idx) => (
              <div
                key={idx}
                className={`group bg-[#f9f8f6] rounded-[1.5rem] p-6 flex justify-between items-start gap-4 hover:bg-[#e8e4dc]/50 transition-all duration-300 ${item.urgent ? 'ring-2 ring-amber-500/30' : ''}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-[#1c1c1c] text-base">{item.name}</h4>
                    {item.urgent && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-amber-500 px-2 py-0.5 rounded-full">Срочно</span>
                    )}
                  </div>
                  <p className="text-[#1c1c1c]/40 text-sm font-light">{item.desc}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xl font-serif text-[#1c1c1c] mb-1">
                    {item.price.toLocaleString()} <span className="font-sans font-light text-amber-500 text-base">₽</span>
                  </div>
                  <button className="text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1 ml-auto">
                    Купить <ArrowUpRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Other Pets Promo ═══ */}
        <section className="mt-8 mb-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#1c1c1c] mb-4">
              Другие <span className="italic text-amber-500">подопечные</span>
            </h2>
            <p className="text-[#1c1c1c]/50 text-lg font-light max-w-xl mx-auto">
              Познакомьтесь с другими хвостиками, которые тоже мечтают о доме.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Барон", species: "Собака", age: "4 года", img: "https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=600" },
              { name: "Соня", species: "Кошка", age: "1 год", img: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee9?auto=format&fit=crop&q=80&w=600" },
              { name: "Тоша", species: "Собака", age: "6 мес", img: "https://images.unsplash.com/photo-1601630138404-32b0ed355153?auto=format&fit=crop&q=80&w=600" },
            ].map((item, idx) => (
              <Link
                key={idx}
                href="/pets"
                className="group bg-white rounded-[2rem] overflow-hidden border border-[#1c1c1c]/5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1"
              >
                <div className="h-56 overflow-hidden relative">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-linear-to-t from-white via-white/20 to-transparent opacity-80" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]">
                    {item.species}
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="font-serif text-2xl mb-2 text-[#1c1c1c] group-hover:text-amber-500 transition-colors duration-300 leading-tight">
                    {item.name}
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-50 px-3 py-1 rounded-full">{item.age}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 bg-[#1c1c1c]/5 px-3 py-1 rounded-full">Ищет дом</span>
                  </div>
                  <div className="w-full bg-[#1c1c1c] text-white py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 group-hover:bg-amber-500 transition-colors">
                    <PawPrint size={14} /> Познакомиться
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/pets"
              className="inline-flex items-center gap-3 bg-[#1c1c1c] text-white px-10 py-5 rounded-[1.5rem] font-bold uppercase tracking-widest text-xs hover:bg-amber-500 transition-colors duration-300"
            >
              Все питомцы
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
