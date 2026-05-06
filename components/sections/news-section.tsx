"use client";

import { ArrowRight } from "lucide-react";

interface Props {
  textEnter: () => void;
  textLeave: () => void;
}

const NEWS = [
  {
    date: "15 Мар 2025",
    title: "Рекс сделал первые шаги после сложной операции",
    desc: "После тяжелой операции на позвоночнике Рекс начал ходить. Впереди долгая реабилитация, мы благодарим всех неравнодушных за помощь в оплате клиники. Благодаря вам, у Рекса есть будущее, и самое страшное уже позади.",
    tag: "Главное",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200", 
  },
  {
    date: "10 Мар 2025",
    title: "Закупили 500 кг корма",
    desc: "Благодаря вашим донатам наши подопечные сыты на 2 месяца вперед.",
    tag: "Отчёт",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800",
  },
  {
    date: "01 Мар 2025",
    title: "Герда нашла свою семью",
    desc: "Герда уехала домой к замечательной паре из Москвы.",
    tag: "Счастье",
    image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee9?auto=format&fit=crop&q=80&w=800",
  },
  {
    date: "25 Фев 2025",
    title: "Волонтерские выходные",
    desc: "Более 40 человек приехали помочь с выгулом собак.",
    tag: "Событие",
    image: "https://images.unsplash.com/photo-1601630138404-32b0ed355153?auto=format&fit=crop&q=80&w=800",
  },
  {
    date: "15 Фев 2025",
    title: "Новые будки к зиме",
    desc: "Мы утеплили все вольеры благодаря вашей поддержке.",
    tag: "Обновление",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800",
  },
];

export function NewsSection({ textEnter, textLeave }: Props) {
  return (
    <section className="relative pt-24 pb-36 md:pb-48 px-6 md:px-12 bg-[#e8e4dc] text-[#1c1c1c]" id="news">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#1c1c1c] leading-[1.05] tracking-tight mb-6">
              Новости <span className="italic text-amber-500">приюта</span>
            </h2>
            <p className="text-[#1c1c1c]/60 text-lg md:text-xl font-light">
              Что у нас происходит: пристройства, сборы, отчёты и истории подопечных.
            </p>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          
          {/* 1. Large Card */}
          <a
            href="#"
            className="group md:col-span-2 md:row-span-2 bg-white rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 flex flex-col pointer-events-auto cursor-none"
            onMouseEnter={textEnter}
            onMouseLeave={textLeave}
          >
            <div className="w-full h-64 md:h-[400px] shrink-0 overflow-hidden relative">
              <img 
                src={NEWS[0].image} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                alt={NEWS[0].title}
              />
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-[#1c1c1c]">
                {NEWS[0].tag}
              </div>
            </div>
            
            <div className="p-8 md:p-12 flex flex-col flex-1 justify-between bg-white relative z-10">
              <div>
                <span className="text-sm font-medium text-[#1c1c1c]/40 mb-4 block">{NEWS[0].date}</span>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-6 leading-tight group-hover:text-amber-500 transition-colors duration-500">
                  {NEWS[0].title}
                </h3>
                <p className="text-[#1c1c1c]/60 md:text-lg flex-1">
                  {NEWS[0].desc}
                </p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-[#1c1c1c]/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 font-medium bg-[#1c1c1c] text-white px-6 py-3 rounded-full group-hover:bg-amber-500 transition-colors duration-300">
                  Читать полностью <ArrowRight size={18} />
                </span>
              </div>
            </div>
          </a>

          {/* 2-5: Small Cards */}
          {NEWS.slice(1).map((item, i) => (
            <a
              key={i}
              href="#"
              className="group bg-white rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 flex flex-col pointer-events-auto cursor-none"
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
            >
              <div className="w-full h-48 md:h-56 shrink-0 overflow-hidden relative">
                <img 
                  src={item.image} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  alt={item.title}
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]">
                  {item.tag}
                </div>
              </div>
              
              <div className="p-6 md:p-8 flex flex-col flex-1 bg-white relative z-10">
                <div className="flex-1">
                  <span className="text-xs font-medium text-[#1c1c1c]/40 mb-3 block">{item.date}</span>
                  <h4 className="text-xl md:text-2xl font-serif leading-snug mb-3 group-hover:text-amber-500 transition-colors duration-500">
                    {item.title}
                  </h4>
                  <p className="text-[#1c1c1c]/60 text-sm line-clamp-3">
                    {item.desc}
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-[#1c1c1c]/5">
                  <span className="inline-flex items-center gap-2 font-medium text-[#1c1c1c] group-hover:text-amber-500 transition-colors duration-300">
                    Читать полностью <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </a>
          ))}

        </div>

        {/* Global Button */}
        <div className="mt-16 md:mt-24 flex justify-center">
          <a
            href="#"
            className="inline-flex items-center gap-3 bg-transparent border border-[#1c1c1c]/20 text-[#1c1c1c] px-10 py-5 rounded-full font-medium sm:text-lg hover:border-amber-500 hover:bg-amber-500 hover:text-white transition-all duration-300 pointer-events-auto cursor-none"
            onMouseEnter={textEnter}
            onMouseLeave={textLeave}
          >
            Читать все новости <ArrowRight size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}
