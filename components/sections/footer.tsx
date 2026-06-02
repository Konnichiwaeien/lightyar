"use client";

import { useState } from "react";
import { 
  FileText, 
  Download, 
  MapPin, 
  ChevronDown, 
  Heart,
  Send
} from "lucide-react";
import Link from "next/link";
import { useCursor } from "@/components/ui/cursor-context";
import { motion, AnimatePresence } from "framer-motion";

const DOCUMENTS = [
  { name: "Устав АНБО «Светлый»", size: "3.4 MB" },
  { name: "Свидетельство о регистрации", size: "1.2 MB" },
  { name: "Свидетельство ИНН", size: "0.8 MB" },
  { name: "Публичная оферта", size: "2.1 MB" },
  { name: "Отчет за 2024 год", size: "4.5 MB" }
];

const REQUISITES = {
  inn: "7604398926",
  kpp: "760401001",
  ogrn: "1247600009590",
  account: "40703810202910000277",
  bank: "АО \"Альфа-банк\"",
  bik: "044525593",
  corrAccount: "30101810200000000593"
};

// ═════════════════════════════════════════════════════════════════════════════
// 🌐 CUSTOM LINE-ART BRAND ICONS
// ═════════════════════════════════════════════════════════════════════════════
const VKIcon = ({ size = 20 }: { size?: number }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
    <path d="M8 7.5v9M16 7.5c-1 0-2 .5-2.8 1.5L11 12M11 12l2.8 3c.8 1 1.8 1.5 2.8 1.5M11 12H8" />
  </svg>
);

export function Footer() {
  const { textEnter, textLeave } = useCursor();
  const [showReq, setShowReq] = useState(false);
  const cursorClass = "cursor-none";

  return (
    <footer className="w-full bg-[#fcfaf7] text-[#1c1c1c] rounded-t-[2.5rem] md:rounded-t-[3.5rem] p-8 md:p-12 lg:p-16 shadow-2xl relative z-20 border-t border-[#1c1c1c]/5" id="footer">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Section: Main 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 pb-12 border-b border-[#1c1c1c]/10">
          
          {/* Column 1: Brand, Tagline & Proper Social Icons */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Link 
                href="/" 
                className={`text-3xl lg:text-4xl font-serif text-[#1c1c1c] hover:text-amber-600 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden rounded-xl px-2 py-1 transition-colors inline-block ${cursorClass}`}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                Светлый.
              </Link>
              <p className="text-sm text-[#1c1c1c]/60 leading-relaxed font-light max-w-[280px]">
                Благотворительный фонд помощи бездомным животным Ярославля. Лечим, стерилизуем, находим любящую семью. Каждый день — без выходных.
              </p>
            </div>
            
            {/* Social Icons with Premium Circular Animation */}
            <div className="flex gap-3 pt-2">
              <a 
                href="https://t.me/svetly" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Наш Telegram канал"
                className={`w-11 h-11 rounded-full bg-[#1c1c1c]/5 text-[#1c1c1c]/70 hover:bg-[#229ED9] hover:text-white focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden transition-all duration-300 flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 ${cursorClass}`}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                <Send size={18} className="translate-x-[-0.5px] translate-y-[0.5px]" />
              </a>
              <a 
                href="https://vk.com/public228082117" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Наша группа ВКонтакте"
                className={`w-11 h-11 rounded-full bg-[#1c1c1c]/5 text-[#1c1c1c]/70 hover:bg-[#0077FF] hover:text-white focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden transition-all duration-300 flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 ${cursorClass}`}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                <VKIcon size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Compact Contacts */}
          <div className="space-y-6 lg:pl-8">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 font-sans">
              Связаться с нами
            </h4>
            <div className="space-y-4 text-sm text-[#1c1c1c]/80 font-light">
              <a 
                href="https://vk.com/im?sel=-228082117" 
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 hover:text-amber-600 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden rounded-xl p-1 transition-colors font-medium group ${cursorClass}`}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                <div className="w-8 h-8 rounded-full bg-[#1c1c1c]/5 flex items-center justify-center text-[#1c1c1c]/60 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors shrink-0">
                  <VKIcon size={16} />
                </div>
                <span>Написать нам в ВК</span>
              </a>
              
              <p className="text-xs text-[#1c1c1c]/50 leading-relaxed font-light pl-11">
                По всем возникающим вопросам пишите в сообщения группы. Вам ответят при первой возможности.
              </p>

              <div className="flex items-start gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-[#1c1c1c]/5 flex items-center justify-center text-[#1c1c1c]/60 shrink-0">
                  <MapPin size={14} />
                </div>
                <div className="leading-tight pt-1">
                  <span className="block font-medium">г. Ярославль</span>
                  <span className="text-[11px] text-[#1c1c1c]/40">точный адрес по запросу</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Documents and Requisites Trigger */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 font-sans">
              Документы и реквизиты
            </h4>
            
            <ul className="space-y-2 text-xs">
              {DOCUMENTS.slice(0, 3).map((doc, idx) => (
                <li key={idx}>
                  <a 
                    href="#" 
                    onClick={(e) => e.preventDefault()}
                    className={`flex items-center justify-between p-2 rounded-xl hover:bg-[#1c1c1c]/5 text-[#1c1c1c]/80 hover:text-[#1c1c1c] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden transition-all group ${cursorClass}`}
                    onMouseEnter={textEnter}
                    onMouseLeave={textLeave}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <FileText size={14} className="text-[#1c1c1c]/40 shrink-0" />
                      <span className="truncate font-medium">{doc.name}</span>
                    </span>
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-amber-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      {doc.size} <Download size={10} />
                    </div>
                  </a>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setShowReq(!showReq)}
              aria-expanded={showReq}
              aria-controls="footer-requisites"
              className={`w-full py-2.5 px-4 rounded-xl border border-[#1c1c1c]/10 text-xs font-semibold hover:border-amber-600 hover:text-amber-700 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden transition-all flex items-center justify-between group ${cursorClass}`}
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
            >
              <span>Юридические реквизиты</span>
              <ChevronDown size={14} className={`text-[#1c1c1c]/40 group-hover:text-amber-600 transition-transform ${showReq ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Collapsible Requisites Drawer (with framer-motion) */}
        <AnimatePresence>
          {showReq && (
            <motion.div
              id="footer-requisites"
              role="region"
              aria-label="Юридические реквизиты"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-b border-[#1c1c1c]/10"
            >
              <div className="py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-xs font-mono text-[#1c1c1c]/70 bg-white/50 rounded-2xl px-6 my-4 border border-[#1c1c1c]/5 shadow-2xs">
                <div>
                  <span className="text-[9px] font-sans font-bold text-[#1c1c1c]/40 uppercase block mb-1">ИНН</span>
                  <span className="text-sm font-medium text-[#1c1c1c]">{REQUISITES.inn}</span>
                </div>
                <div>
                  <span className="text-[9px] font-sans font-bold text-[#1c1c1c]/40 uppercase block mb-1">КПП</span>
                  <span className="text-sm font-medium text-[#1c1c1c]">{REQUISITES.kpp}</span>
                </div>
                <div>
                  <span className="text-[9px] font-sans font-bold text-[#1c1c1c]/40 uppercase block mb-1">ОГРН</span>
                  <span className="text-sm font-medium text-[#1c1c1c]">{REQUISITES.ogrn}</span>
                </div>
                <div>
                  <span className="text-[9px] font-sans font-bold text-[#1c1c1c]/40 uppercase block mb-1">БИК</span>
                  <span className="text-sm font-medium text-[#1c1c1c]">{REQUISITES.bik}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] font-sans font-bold text-[#1c1c1c]/40 uppercase block mb-1">Расчетный счет</span>
                  <span className="text-sm font-medium text-[#1c1c1c]">{REQUISITES.account}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] font-sans font-bold text-[#1c1c1c]/40 uppercase block mb-1">Банк получателя</span>
                  <span className="text-sm font-medium text-white/0 text-[#1c1c1c]">{REQUISITES.bank}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] font-semibold uppercase tracking-widest text-[#1c1c1c]/40">
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2">
            <span>© {new Date().getFullYear()} АНБО Светлый</span>
            <span className="hidden sm:inline">·</span>
            <span>Лицензированная помощь животным</span>
          </div>
          <div className="flex items-center gap-1 select-none">
            Сделано с <Heart size={10} className="text-red-500 fill-red-500 animate-pulse" /> для хвостатых
          </div>
        </div>

      </div>
    </footer>
  );
}
