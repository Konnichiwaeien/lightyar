"use client";

import { Heart, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCursor } from "@/components/ui/cursor-context";
import { requestDonationIntent } from "@/lib/donations/donation-intent";

interface CampaignItem {
  id: string;
  slug?: string;
  title: string;
  desc: string;
  current: number;
  total: number;
  image: string;
  tag: string;
  petName?: string;
}

interface CampaignsSectionProps {
  initialCampaigns?: CampaignItem[];
}

export function CampaignsSection({ initialCampaigns = [] }: CampaignsSectionProps) {
  const { textEnter, textLeave } = useCursor();
  
  if (initialCampaigns.length === 0) {
    return null; // Don't render section if there are no active campaigns
  }

  return (
    <section className="relative z-20 py-20 md:py-28 px-6 md:px-12" id="campaigns">
      <div className="max-w-7xl mx-auto mb-12 md:mb-16">
        <h2
          className="text-[10vw] md:text-[8vw] leading-none font-bold uppercase tracking-tighter text-white text-wrap: balance"
          onMouseEnter={textEnter}
          onMouseLeave={textLeave}
        >
          Нужна <br />
          <span className="text-amber-500 italic font-serif">помощь</span>
        </h2>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <ul className="w-full" role="list">
          {initialCampaigns.map((fund, i) => (
            <li
              key={fund.id}
              className="sticky w-full bg-[#111] border border-white/10 rounded-3xl md:rounded-[2.5rem] p-4 md:p-8 mb-6 shadow-2xl origin-top flex flex-col justify-between block animate-none"
              style={{ zIndex: i + 1, top: `calc(120px + ${i * 40}px)` }}
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
            >
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 justify-between items-stretch">
                {/* Image Container */}
                <div className="w-full lg:w-[45%] rounded-2xl md:rounded-3xl overflow-hidden relative min-h-[250px] md:min-h-[350px]">
                  <Image 
                    src={fund.image} 
                    alt={fund.title} 
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover motion-safe:hover:scale-105 transition-transform duration-1000" 
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-amber-500 text-xs font-bold uppercase tracking-widest bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    {fund.tag}
                  </div>
                </div>

                {/* Content Container */}
                <div className="w-full lg:w-[55%] flex flex-col justify-between py-2 md:py-4">
                  <div className="mb-8 md:mb-12">
                    {fund.petName && (
                      <div className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-3">
                        Сбор для питомца: {fund.petName}
                      </div>
                    )}
                    <h3 className="text-3xl md:text-5xl font-serif mb-4 md:mb-6 text-white leading-tight">{fund.title}</h3>
                    <p className="text-white/50 text-lg md:text-xl font-light leading-relaxed">{fund.desc}</p>
                  </div>

                  {/* Progress Box */}
                  <div className="bg-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5">
                    <div className="flex justify-between items-end mb-5">
                      <div>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/50 block mb-2">Собрано</span>
                        <span className="text-2xl md:text-4xl font-serif text-white flex items-center gap-2">{fund.current.toLocaleString()} <span className="font-sans font-light text-amber-500">₽</span></span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/30 block mb-2">Цель</span>
                        <span className="text-xl md:text-2xl font-serif text-white/60 flex items-center justify-end gap-2">{fund.total.toLocaleString()} <span className="font-sans font-light text-white/30">₽</span></span>
                      </div>
                    </div>

                    {/* Thicker Progress Bar */}
                    <div 
                      className="w-full h-3 md:h-4 bg-white/10 rounded-full relative overflow-hidden mb-8"
                      role="progressbar" 
                      aria-valuenow={fund.current} 
                      aria-valuemin={0} 
                      aria-valuemax={fund.total} 
                      aria-label={`Прогресс сбора: собрано ${fund.current} рублей из ${fund.total}`}
                    >
                      <div
                        className="absolute top-0 left-0 h-full bg-amber-500 rounded-full"
                        style={{ width: `${(fund.current / fund.total) * 100}%` }}
                      />
                    </div>

                    {/* Buttons Row */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => requestDonationIntent({
                          kind: "campaign",
                          id: fund.id,
                          title: fund.title,
                          amount: 500,
                        })}
                        className="flex-1 bg-amber-500 text-black py-4 md:py-6 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-amber-400 transition-all pointer-events-auto cursor-none flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] transform hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-hidden"
                      >
                        <Heart size={20} className="fill-black/30 text-black/50" aria-hidden="true" />
                        Помочь
                      </button>
                      <Link
                        href={`/campaigns/${fund.slug || fund.id}`}
                        className="bg-white/10 text-white py-4 md:py-6 px-6 md:px-8 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-white/20 transition-all pointer-events-auto cursor-none flex items-center justify-center gap-2 border border-white/10 hover:border-white/30 transform hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-hidden"
                      >
                        <ArrowUpRight size={20} aria-hidden="true" />
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-12 md:mt-16 flex justify-center relative z-20">
          <Link 
            href="/campaigns"
            className="group px-10 py-5 bg-white/5 border border-white/20 hover:border-white/50 hover:bg-white text-white hover:text-black rounded-full transition-all duration-300 pointer-events-auto cursor-none flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-hidden"
          >
            Все сборы
            <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
