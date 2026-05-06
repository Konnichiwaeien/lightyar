"use client";

import { Heart, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface Props {
  textEnter: () => void;
  textLeave: () => void;
}

const FUNDS = [
  { id: 1, title: "Операция для Рекса", desc: "Сбит машиной. Требуется срочная операция на тазобедренном суставе.", current: 15, total: 45, image: "https://images.unsplash.com/photo-1544568100-847a9ec5d878?auto=format&fit=crop&q=80&w=800" },
  { id: 2, title: "Корм на декабрь", desc: "Еда для 85 хвостиков на самый сложный морозный месяц. Важен каждый рубль.", current: 80, total: 120, image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800" },
  { id: 3, title: "Утепление вольеров", desc: "Закупка сена, ремонт будок и установка ветрозащиты перед грядущими морозами.", current: 5, total: 50, image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800" },
];

export function CampaignsSection({ textEnter, textLeave }: Props) {
  return (
    <section className="relative z-20 py-24 md:py-32" id="campaigns">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
        <h2
          className="text-[10vw] md:text-[8vw] leading-none font-bold uppercase tracking-tighter text-white"
          onMouseEnter={textEnter}
          onMouseLeave={textLeave}
        >
          Нужна <br />
          <span className="text-amber-500 italic font-serif">помощь</span>
        </h2>
      </div>

      <div className="relative px-6 md:px-12 max-w-7xl mx-auto">
        {FUNDS.map((fund, i) => (
          <div
            key={fund.id}
            className="sticky w-full bg-[#111] border border-white/10 rounded-3xl md:rounded-[2.5rem] p-4 md:p-8 mb-6 shadow-2xl origin-top flex flex-col justify-between"
            style={{ zIndex: i + 1, top: `calc(120px + ${i * 40}px)` }}
            onMouseEnter={textEnter}
            onMouseLeave={textLeave}
          >
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 justify-between items-stretch">
              {/* Image Container */}
              <div className="w-full lg:w-[45%] rounded-2xl md:rounded-3xl overflow-hidden relative min-h-[250px] md:min-h-[350px]">
                <img 
                  src={fund.image} 
                  alt={fund.title} 
                  className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000" 
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-amber-500 text-xs font-bold uppercase tracking-widest bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  Сбор 0{fund.id}
                </div>
              </div>

              {/* Content Container */}
              <div className="w-full lg:w-[55%] flex flex-col justify-between py-2 md:py-4">
                <div className="mb-8 md:mb-12">
                  <h3 className="text-3xl md:text-5xl font-serif mb-4 md:mb-6 text-white leading-tight">{fund.title}</h3>
                  <p className="text-white/50 text-lg md:text-xl font-light leading-relaxed">{fund.desc}</p>
                </div>

                {/* Progress Box */}
                <div className="bg-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5">
                  <div className="flex justify-between items-end mb-5">
                    <div>
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/50 block mb-2">Собрано</span>
                      <span className="text-2xl md:text-4xl font-serif text-white flex items-center gap-2">{fund.current * 1000} <span className="font-sans font-light text-amber-500">₽</span></span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/30 block mb-2">Цель</span>
                      <span className="text-xl md:text-2xl font-serif text-white/60 flex items-center justify-end gap-2">{fund.total * 1000} <span className="font-sans font-light text-white/30">₽</span></span>
                    </div>
                  </div>

                  {/* Thicker Progress Bar */}
                  <div className="w-full h-3 md:h-4 bg-white/10 rounded-full relative overflow-hidden mb-8">
                    <div
                      className="absolute top-0 left-0 h-full bg-amber-500 rounded-full"
                      style={{ width: `${(fund.current / fund.total) * 100}%` }}
                    />
                  </div>

                  {/* Buttons Row */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => alert(`Помочь: ${fund.title}`)}
                      className="flex-1 bg-amber-500 text-black py-4 md:py-6 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-amber-400 transition-all pointer-events-auto cursor-none flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] transform hover:-translate-y-1"
                    >
                      <Heart size={20} className="fill-black/30 text-black/50" />
                      Помочь
                    </button>
                    <Link
                      href={`/campaigns/camp-${fund.id}`}
                      className="bg-white/10 text-white py-4 md:py-6 px-6 md:px-8 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-white/20 transition-all pointer-events-auto cursor-none flex items-center justify-center gap-2 border border-white/10 hover:border-white/30 transform hover:-translate-y-1"
                    >
                      <ArrowUpRight size={20} />
                      Подробнее
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-16 flex justify-center relative z-20">
          <Link 
            href="/campaigns"
            className="group px-10 py-5 bg-white/5 border border-white/20 hover:border-white/50 hover:bg-white text-white hover:text-black rounded-full transition-all duration-300 pointer-events-auto cursor-none flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em]"
          >
            Все сборы
            <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
