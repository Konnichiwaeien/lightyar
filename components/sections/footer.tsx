"use client";

import { useState } from "react";
import { 
  FileText, 
  Download, 
  MapPin, 
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { ShdkTerminal } from "@/components/ui/shdk-terminal";
import { useCursor } from "@/components/ui/cursor-context";
import { BrandLogo } from "@/components/ui/brand-logo";
import { motion, AnimatePresence } from "framer-motion";

const DOCUMENTS = [
  { name: "Отчёт о благотворительной деятельности за 2024 год", size: "13 КБ", href: "/documents/charity-2024.docx" },
  { name: "Отчёт в Минюст за 2024 год", size: "23 КБ", href: "/documents/minjust-2024.docx" },
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

// Official VK mark from Simple Icons (simple-icons.org).
const VKIcon = ({ size = 20 }: { size?: number }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="m9.489.004.729-.003h3.564l.73.003.914.01.433.007.418.011.403.014.388.016.374.021.36.025.345.03.333.033c1.74.196 2.933.616 3.833 1.516.9.9 1.32 2.092 1.516 3.833l.034.333.029.346.025.36.02.373.025.588.012.41.013.644.009.915.004.98-.001 3.313-.003.73-.01.914-.007.433-.011.418-.014.403-.016.388-.021.374-.025.36-.03.345-.033.333c-.196 1.74-.616 2.933-1.516 3.833-.9.9-2.092 1.32-3.833 1.516l-.333.034-.346.029-.36.025-.373.02-.588.025-.41.012-.644.013-.915.009-.98.004-3.313-.001-.73-.003-.914-.01-.433-.007-.418-.011-.403-.014-.388-.016-.374-.021-.36-.025-.345-.03-.333-.033c-1.74-.196-2.933-.616-3.833-1.516-.9-.9-1.32-2.092-1.516-3.833l-.034-.333-.029-.346-.025-.36-.02-.373-.025-.588-.012-.41-.013-.644-.009-.915-.004-.98.001-3.313.003-.73.01-.914.007-.433.011-.418.014-.403.016-.388.021-.374.025-.36.03-.345.033-.333c.196-1.74.616-2.933 1.516-3.833.9-.9 2.092-1.32 3.833-1.516l.333-.034.346-.029.36-.025.373-.02.588-.025.41-.012.644-.013.915-.009.98-.004ZM6.79 7.3H4.05c.13 6.24 3.25 9.99 8.72 9.99h.31v-3.57c2.01.2 3.53 1.67 4.14 3.57h2.84c-.78-2.84-2.83-4.41-4.11-5.01 1.28-.74 3.08-2.54 3.51-4.98h-2.58c-.56 1.98-2.22 3.78-3.8 3.95V7.3H10.5v6.92c-1.6-.4-3.62-2.34-3.71-6.92Z" />
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
          
          {/* Column 1: Brand and short description */}
          <div>
            <div className="space-y-4">
              <Link
                href="/"
                aria-label="Главная страница приюта Светлый"
                className={`block size-20 overflow-hidden rounded-full bg-[#f7f3eb] transition-[background-color,box-shadow,translate,scale,rotate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_30px_rgba(28,28,28,0.1)] focus-visible:-translate-y-0.5 focus-visible:bg-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none ${cursorClass}`}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                <BrandLogo sizes="80px" />
              </Link>
              <Link 
                href="/" 
                className={`text-3xl lg:text-4xl font-serif text-[#1c1c1c] inline-block rounded-sm decoration-amber-500/60 decoration-2 underline-offset-[6px] transition-[color,text-decoration-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-amber-700 hover:underline focus-visible:text-amber-700 focus-visible:underline focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden motion-reduce:transition-none ${cursorClass}`}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                Светлый.
              </Link>
              <p className="text-[15px] text-[#1c1c1c]/60 leading-relaxed font-light max-w-[300px]">
                АНБО «Светлый» помогает бездомным и попавшим в беду животным в Ярославле. Даём им временный дом и уход, учим снова доверять людям и ищем ответственных хозяев.
              </p>
            </div>
          </div>

          {/* Column 2: Compact Contacts */}
          <div className="lg:pl-8">
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 font-sans">
              Связаться с нами
            </h4>
            <div className="text-[15px] text-[#1c1c1c]/80 font-light">
              <div className="space-y-2">
                <a
                  href="https://vk.com/im?sel=-228082117"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex w-fit items-center gap-3 rounded-sm font-medium group transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-amber-700 focus-visible:text-amber-700 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fcfaf7] focus-visible:outline-hidden motion-reduce:transition-none ${cursorClass}`}
                  onMouseEnter={textEnter}
                  onMouseLeave={textLeave}
                >
                  <div className="w-8 h-8 rounded-full bg-[#1c1c1c]/5 flex items-center justify-center text-[#1c1c1c]/60 group-hover:bg-amber-100 group-hover:text-amber-700 group-focus-visible:bg-amber-100 group-focus-visible:text-amber-700 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none shrink-0">
                    <VKIcon size={16} />
                  </div>
                  <span className="decoration-amber-500/60 decoration-2 underline-offset-4 group-hover:underline group-focus-visible:underline">Написать нам в ВК</span>
                </a>
                <p className="text-[13px] text-[#1c1c1c]/50 leading-relaxed font-light pl-11">
                  Хотите помочь или узнать о подопечных? Напишите нам во ВКонтакте. Ответим, как только сможем.
                </p>
              </div>

              <div className="mt-5 flex items-start gap-3">
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
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 font-sans">
              Документы и реквизиты
            </h4>
            
            <ul className="space-y-2 text-sm">
              {DOCUMENTS.map((doc) => (
                <li key={doc.href}>
                  <a 
                    href={doc.href}
                    download
                    className={`flex items-center justify-between gap-3 rounded-sm py-1 text-[#1c1c1c]/80 group transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-amber-800 focus-visible:text-amber-800 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fcfaf7] focus-visible:outline-hidden motion-reduce:transition-none ${cursorClass}`}
                    onMouseEnter={textEnter}
                    onMouseLeave={textLeave}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <FileText size={14} className="text-[#1c1c1c]/40 shrink-0" />
                      <span className="truncate font-medium decoration-amber-500/60 decoration-2 underline-offset-4 group-hover:underline group-focus-visible:underline">{doc.name}</span>
                    </span>
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-amber-700 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-[opacity,translate,scale,rotate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:transform-none">
                      {doc.size} <Download size={10} />
                    </div>
                  </a>
                </li>
              ))}
              </ul>

              <Link
                href="/privacy"
                className={`inline-flex min-h-6 items-center rounded-sm py-0.5 text-sm text-[#1c1c1c]/70 underline decoration-[#1c1c1c]/25 decoration-2 underline-offset-4 transition-[color,text-decoration-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-amber-800 hover:decoration-amber-500/60 focus-visible:text-amber-800 focus-visible:decoration-amber-500/60 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fcfaf7] focus-visible:outline-hidden motion-reduce:transition-none ${cursorClass}`}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                Политика конфиденциальности
              </Link>

            <button
              onClick={() => setShowReq(!showReq)}
              aria-expanded={showReq}
              aria-controls="footer-requisites"
              className={`w-full py-2.5 px-4 rounded-xl border border-[#1c1c1c]/10 text-sm font-semibold flex items-center justify-between group transition-[background-color,border-color,color,translate,scale,rotate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 focus-visible:border-amber-300 focus-visible:bg-amber-50 focus-visible:text-amber-800 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none ${cursorClass}`}
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
            >
              <span>Юридические реквизиты</span>
              <ChevronDown size={14} className={`text-[#1c1c1c]/40 group-hover:text-amber-700 group-focus-visible:text-amber-700 transition-[color,translate,scale,rotate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${showReq ? "rotate-180" : ""}`} />
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

        {/* Нижняя строка: юридическое имя фонда слева, подпись разработчика справа */}
        <div className="pt-8 md:pt-12 lg:pt-16 border-t border-[#1c1c1c]/10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center lg:items-start gap-2 text-center lg:text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1c1c1c]/45">
            <div className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-1">
              <span>© {new Date().getFullYear()} АНБО «Светлый»</span>
              <span>Все права защищены</span>
            </div>
            <span className="normal-case tracking-normal text-[12px] text-[#1c1c1c]/40">
              Ярославль · помощь бездомным животным
            </span>
          </div>

          <a
            href="https://www.shdk.tech/ru"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Разработано SHDK"
            className="group flex items-center gap-2 whitespace-nowrap rounded-sm text-sm text-[#1a7a0a] transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-[#147007] focus-visible:text-[#147007] focus-visible:ring-2 focus-visible:ring-[#1a7a0a] focus-visible:ring-offset-4 focus-visible:ring-offset-[#fcfaf7] focus-visible:outline-hidden motion-reduce:transition-none"
          >
            <span className="decoration-[#1a7a0a]/50 decoration-2 underline-offset-4 group-hover:underline group-focus-visible:underline">Разработано с❤️и☕</span>
            <ShdkTerminal />
          </a>
        </div>

      </div>
    </footer>
  );
}
