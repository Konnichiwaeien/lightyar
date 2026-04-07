"use client";

import { useState } from "react";
import { FileText, Download, ArrowUpRight, Mail, Phone, MapPin, ChevronDown } from "lucide-react";
import Link from "next/link";

interface Props {
  textEnter?: () => void;
  textLeave?: () => void;
}

const DOCUMENTS = [
  "Устав АНБО «Светлый»",
  "Свидетельство о регистрации",
  "Свидетельство ИНН",
  "Публичная оферта",
  "Отчет за 2024 год"
];

const noop = () => {};

export function Footer({ textEnter, textLeave }: Props = {}) {
  const [showRequisites, setShowRequisites] = useState(false);
  const onEnter = textEnter ?? noop;
  const onLeave = textLeave ?? noop;
  const cursorClass = textEnter ? "cursor-none" : "";

  return (
    <footer className="w-full flex flex-col lg:flex-row relative z-20 rounded-t-[3rem] md:rounded-t-[4rem] overflow-hidden shadow-2xl" id="footer">
      
      {/* ═══ Left Side: Dark / Emotion & Contacts ═══ */}
      <div 
        className="relative w-full lg:w-1/2 text-[#f4f1eb] flex flex-col justify-between pointer-events-auto"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=1200" 
            alt="Спасенная собака" 
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity" 
          />
          <div className="absolute inset-0 bg-[#211f1a]/85"></div>
          <div className="absolute inset-0 bg-linear-to-t from-[#11100e] via-[#11100e]/40 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-10 md:p-16 lg:p-24 flex flex-col flex-1">
          <div className="mb-16 lg:mb-24">
            <Link href="/" className={`text-4xl lg:text-7xl font-serif mb-6 text-white leading-none block hover:text-amber-500 transition-colors duration-300 ${cursorClass}`}>Светлый.</Link>
            <p className="text-white/80 text-lg md:text-xl font-light leading-relaxed max-w-sm drop-shadow-md">
              Мы работаем каждый день, чтобы у каждого хвостатого появился свой дом. Несем свет туда, где темно.
            </p>
          </div>
          
          <div className="space-y-12 mb-auto">
            <div>
              <span className="text-sm font-bold uppercase tracking-widest text-[#f4f1eb]/50 mb-4 flex items-center gap-2">
                <Mail size={16} className="text-amber-500" /> Напишите нам
              </span>
              <a 
                href="mailto:info@svetly.ru" 
                className={`text-3xl md:text-4xl lg:text-5xl leading-none font-light hover:text-amber-500 transition-colors ${cursorClass} inline-flex items-center gap-4 group`}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
              >
                info@svetly.ru <ArrowUpRight size={28} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 hidden md:block" />
              </a>
            </div>
            
            <div>
              <span className="text-sm font-bold uppercase tracking-widest text-[#f4f1eb]/50 mb-4 flex items-center gap-2">
                <Phone size={16} className="text-amber-500" /> Позвоните нам
              </span>
              <a 
                href="tel:+79990000000" 
                className={`text-3xl md:text-4xl lg:text-5xl leading-none font-light hover:text-amber-500 transition-colors ${cursorClass} inline-flex items-center gap-4 group`}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
              >
                +7 (999) 000-00-00 <ArrowUpRight size={28} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 hidden md:block" />
              </a>
            </div>

            <div>
              <span className="text-sm font-bold uppercase tracking-widest text-[#f4f1eb]/50 mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-amber-500" /> Мы находимся
              </span>
              <span className="text-3xl lg:text-4xl font-light text-white flex flex-col items-start gap-2">
                г. Ярославль
                <span className="text-base lg:text-lg text-white/40 font-sans tracking-tight">(точный адрес по запросу)</span>
              </span>
            </div>
          </div>

          <div className="mt-24 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
            <div className="flex gap-8">
              <a 
                href="#" 
                className={`text-lg font-medium hover:text-amber-500 transition-colors ${cursorClass}`}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
              >
                Telegram
              </a>
              <a 
                href="#" 
                className={`text-lg font-medium hover:text-amber-500 transition-colors ${cursorClass}`}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
              >
                VKontakte
              </a>
            </div>
            <div className="text-[#f4f1eb]/30 text-xs font-bold uppercase tracking-widest drop-shadow-sm">
              © {new Date().getFullYear()} АНБО Светлый
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Right Side: Light / Legal & Docs ═══ */}
      <div 
        className="w-full lg:w-1/2 bg-[#fcfaf7] text-[#1c1c1c] p-10 md:p-16 lg:p-24 flex flex-col justify-between pointer-events-auto"
      >
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#1c1c1c]/40 mb-16">
            [ Правовая база ]
          </h3>

          {/* Documents Box */}
          <div className="mb-16">
            <h4 className="text-2xl lg:text-3xl font-serif mb-8 text-[#1c1c1c]">Документы фонда</h4>
            <div className="flex flex-col">
              {DOCUMENTS.map((doc, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className={`group flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-[#1c1c1c]/10 hover:border-[#1c1c1c]/30 transition-colors ${cursorClass}`}
                  onMouseEnter={onEnter}
                  onMouseLeave={onLeave}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1c1c1c]/5 flex items-center justify-center shrink-0 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors duration-300">
                      <FileText size={16} className="text-[#1c1c1c]/40 group-hover:text-amber-600 transition-colors" />
                    </div>
                    <span className="font-medium text-lg text-[#1c1c1c]/80 group-hover:text-[#1c1c1c] transition-colors">{doc}</span>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-600 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    PDF <Download size={14} />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Requisites — Collapsible */}
          <div>
            <button
              onClick={() => setShowRequisites(!showRequisites)}
              className="flex items-center justify-between w-full group"
            >
              <h4 className="text-2xl lg:text-3xl font-serif text-[#1c1c1c] group-hover:text-amber-500 transition-colors">Реквизиты</h4>
              <div className={`w-10 h-10 rounded-full bg-[#1c1c1c]/5 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors duration-300 ${showRequisites ? 'rotate-180' : ''} transition-transform`}>
                <ChevronDown size={20} className="text-[#1c1c1c]/40 group-hover:text-amber-600 transition-colors" />
              </div>
            </button>
            
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${showRequisites ? 'max-h-[500px] opacity-100 mt-8' : 'max-h-0 opacity-0 mt-0'}`}
            >
              <div className="bg-white border border-[#1c1c1c]/5 rounded-[2rem] p-8 shadow-xs">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-sm font-mono text-[#1c1c1c]/70">
                  <li>
                    <span className="text-[#1c1c1c]/40 block text-[10px] font-sans font-bold tracking-widest uppercase mb-1">ИНН</span> 
                    <span className="text-base font-medium text-[#1c1c1c]">7600000000</span>
                  </li>
                  <li>
                    <span className="text-[#1c1c1c]/40 block text-[10px] font-sans font-bold tracking-widest uppercase mb-1">КПП</span> 
                    <span className="text-base font-medium text-[#1c1c1c]">760000000</span>
                  </li>
                  <li>
                    <span className="text-[#1c1c1c]/40 block text-[10px] font-sans font-bold tracking-widest uppercase mb-1">ОГРН</span> 
                    <span className="text-base font-medium text-[#1c1c1c]">1247600000000</span>
                  </li>
                  <li className="sm:col-span-2">
                    <span className="text-[#1c1c1c]/40 block text-[10px] font-sans font-bold tracking-widest uppercase mb-1">Расчетный счет</span> 
                    <span className="text-base font-medium text-[#1c1c1c]">40703810000000000000</span>
                  </li>
                  <li className="sm:col-span-2">
                    <span className="text-[#1c1c1c]/40 block text-[10px] font-sans font-bold tracking-widest uppercase mb-1">Банк</span> 
                    <span className="text-base font-medium text-[#1c1c1c]">ПАО СБЕРБАНК</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom text right */}
        <div className="mt-24 pt-8 border-t border-[#1c1c1c]/10 text-xs font-medium uppercase tracking-widest text-[#1c1c1c]/30 flex justify-between">
          <span>Сделано с любовью</span>
          <span>К хвостатым</span>
        </div>
      </div>

    </footer>
  );
}
