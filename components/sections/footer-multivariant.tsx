"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  ArrowUpRight, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronDown, 
  Palette, 
  Heart
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
  inn: "7600000000",
  kpp: "760000000",
  ogrn: "1247600000000",
  account: "40703810000000000000",
  bank: "ПАО СБЕРБАНК",
  bik: "047888607",
  corrAccount: "30101810100000000607"
};

type FooterVariant = "classic" | "cream" | "dark" | "centered";

export function Footer() {
  const [variant, setVariant] = useState<FooterVariant>("classic");
  const [mounted, setMounted] = useState(false);

  // Load saved variant from localStorage (safe for SSR)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const saved = localStorage.getItem("lightyar-footer-variant") as FooterVariant;
      if (saved && ["classic", "cream", "dark", "centered"].includes(saved)) {
        setVariant(saved);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleVariantChange = (newVariant: FooterVariant) => {
    setVariant(newVariant);
    localStorage.setItem("lightyar-footer-variant", newVariant);
    
    // Smooth scroll to footer to see changes if needed
    const footerElement = document.getElementById("footer");
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!mounted) {
    // SSR Fallback (render classic to match initial layout)
    return <ClassicSplitFooter showSwitcher={false} activeVariant="classic" onVariantChange={() => {}} />;
  }

  return (
    <div className="relative w-full overflow-hidden" id="footer">
      <AnimatePresence mode="wait">
        <motion.div
          key={variant}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full"
        >
          {variant === "classic" && (
            <ClassicSplitFooter 
              showSwitcher={true} 
              activeVariant={variant} 
              onVariantChange={handleVariantChange} 
            />
          )}
          {variant === "cream" && (
            <CreamLightFooter 
              showSwitcher={true} 
              activeVariant={variant} 
              onVariantChange={handleVariantChange} 
            />
          )}
          {variant === "dark" && (
            <SleekDarkFooter 
              showSwitcher={true} 
              activeVariant={variant} 
              onVariantChange={handleVariantChange} 
            />
          )}
          {variant === "centered" && (
            <CenteredFooter 
              showSwitcher={true} 
              activeVariant={variant} 
              onVariantChange={handleVariantChange} 
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 🎨 SHARED SWITCHER COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
interface SwitcherProps {
  activeVariant: FooterVariant;
  onChange: (v: FooterVariant) => void;
  dark?: boolean;
}

function LiveSwitcher({ activeVariant, onChange, dark = false }: SwitcherProps) {
  const { textEnter, textLeave } = useCursor();
  
  return (
    <div className={`flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${
      dark 
        ? "bg-white/5 border-white/10 text-white/80" 
        : "bg-[#1c1c1c]/5 border-[#1c1c1c]/10 text-[#1c1c1c]/80"
    }`}>
      <span className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 shrink-0 opacity-60">
        <Palette size={12} className={dark ? "text-amber-400" : "text-amber-600"} />
        Тема футера:
      </span>
      <div className="flex flex-wrap gap-1 justify-center">
        {(["classic", "cream", "dark", "centered"] as FooterVariant[]).map((v) => {
          const isActive = activeVariant === v;
          const label = {
            classic: "Раздельный",
            cream: "Кремовый",
            dark: "Темный",
            centered: "Центрированный"
          }[v];

          return (
            <button
              key={v}
              onClick={() => onChange(v)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all duration-300 cursor-none ${
                isActive
                  ? dark
                    ? "bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20"
                    : "bg-amber-600 text-white font-semibold shadow-md shadow-amber-600/20"
                  : dark
                    ? "hover:bg-white/10 text-white/60 hover:text-white"
                    : "hover:bg-[#1c1c1c]/10 text-[#1c1c1c]/60 hover:text-[#1c1c1c]"
              }`}
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 1️⃣ VARIANT: CLASSIC SPLIT REFINED
// ═════════════════════════════════════════════════════════════════════════════
function ClassicSplitFooter({ 
  showSwitcher, 
  activeVariant, 
  onVariantChange 
}: { 
  showSwitcher: boolean; 
  activeVariant: FooterVariant; 
  onVariantChange: (v: FooterVariant) => void;
}) {
  const { textEnter, textLeave } = useCursor();
  const [showReq, setShowReq] = useState(false);
  const cursorClass = "cursor-none";

  return (
    <footer className="w-full flex flex-col lg:flex-row relative z-20 rounded-t-[2.5rem] md:rounded-t-[3.5rem] overflow-hidden shadow-2xl bg-[#11100e]">
      
      {/* Left Side: Dark / Image Accent (Refined sizes/spacings) */}
      <div className="relative w-full lg:w-1/2 text-[#f4f1eb] flex flex-col justify-between pointer-events-auto">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=1200" 
            alt="Спасенная собака" 
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover opacity-50 mix-blend-luminosity transition-transform duration-1000 hover:scale-105" 
          />
          <div className="absolute inset-0 bg-[#161512]/90"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#11100e] via-[#11100e]/30 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col flex-1 justify-between">
          <div className="mb-10 lg:mb-12">
            <Link 
              href="/" 
              className={`text-3xl lg:text-5xl font-serif mb-4 text-white leading-none block hover:text-amber-500 transition-colors duration-300 ${cursorClass}`}
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
            >
              Светлый.
            </Link>
            <p className="text-white/70 text-base md:text-lg font-light leading-relaxed max-w-sm drop-shadow-sm">
              Лечим, любим, ищем семью. Каждый день — без выходных.
            </p>
          </div>
          
          <div className="space-y-8 my-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#f4f1eb]/40 mb-2 flex items-center gap-1.5">
                <Mail size={12} className="text-amber-500" /> Напишите нам
              </span>
              <a 
                href="mailto:info@svetly.ru" 
                className={`text-xl md:text-2xl lg:text-3xl leading-none font-light hover:text-amber-500 transition-colors ${cursorClass} inline-flex items-center gap-3 group`}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                info@svetly.ru 
                <ArrowUpRight size={20} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden md:block" />
              </a>
            </div>
            
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#f4f1eb]/40 mb-2 flex items-center gap-1.5">
                <Phone size={12} className="text-amber-500" /> Позвоните нам
              </span>
              <a 
                href="tel:+79990000000" 
                className={`text-xl md:text-2xl lg:text-3xl leading-none font-light hover:text-amber-500 transition-colors ${cursorClass} inline-flex items-center gap-3 group`}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                +7 (999) 000-00-00 
                <ArrowUpRight size={20} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden md:block" />
              </a>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#f4f1eb]/40 mb-2 flex items-center gap-1.5">
                <MapPin size={12} className="text-amber-500" /> Мы находимся
              </span>
              <span className="text-xl md:text-2xl font-light text-white flex flex-col items-start">
                г. Ярославль
                <span className="text-sm text-white/40 font-sans tracking-tight">(точный адрес по запросу)</span>
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex gap-6">
              <a 
                href="#" 
                className={`text-base font-medium text-white/80 hover:text-amber-500 transition-colors ${cursorClass}`}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                Telegram
              </a>
              <a 
                href="#" 
                className={`text-base font-medium text-white/80 hover:text-amber-500 transition-colors ${cursorClass}`}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                VKontakte
              </a>
            </div>
            <div className="text-[#f4f1eb]/30 text-[10px] font-bold uppercase tracking-widest drop-shadow-sm">
              © {new Date().getFullYear()} АНБО Светлый
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Light / Legal & Docs (Refined padding & alignments) */}
      <div className="w-full lg:w-1/2 bg-[#fcfaf7] text-[#1c1c1c] p-8 md:p-12 lg:p-16 flex flex-col justify-between pointer-events-auto">
        <div className="space-y-10">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40">
              [ Правовая база ]
            </h3>
            {showSwitcher && (
              <div className="hidden lg:block">
                <LiveSwitcher activeVariant={activeVariant} onChange={onVariantChange} dark={false} />
              </div>
            )}
          </div>

          {/* Documents Box */}
          <div>
            <h4 className="text-xl lg:text-2xl font-serif mb-4 text-[#1c1c1c]">Документы фонда</h4>
            <div className="flex flex-col">
              {DOCUMENTS.map((doc, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className={`group flex items-center justify-between py-3.5 border-b border-[#1c1c1c]/10 hover:border-[#1c1c1c]/30 transition-colors ${cursorClass}`}
                  onMouseEnter={textEnter}
                  onMouseLeave={textLeave}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1c1c1c]/5 flex items-center justify-center shrink-0 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors duration-300">
                      <FileText size={14} className="text-[#1c1c1c]/40 group-hover:text-amber-600 transition-colors" />
                    </div>
                    <span className="font-medium text-sm md:text-base text-[#1c1c1c]/80 group-hover:text-[#1c1c1c] transition-colors">{doc.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    {doc.size} <Download size={12} />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Requisites — Collapsible with Framer Motion */}
          <div>
            <button
              onClick={() => setShowReq(!showReq)}
              className={`flex items-center justify-between w-full group ${cursorClass}`}
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
            >
              <h4 className="text-xl lg:text-2xl font-serif text-[#1c1c1c] group-hover:text-amber-500 transition-colors">Реквизиты</h4>
              <div className={`w-8 h-8 rounded-full bg-[#1c1c1c]/5 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors duration-300 ${showReq ? 'rotate-180' : ''} transition-transform`}>
                <ChevronDown size={16} className="text-[#1c1c1c]/40 group-hover:text-amber-600 transition-colors" />
              </div>
            </button>
            
            <AnimatePresence initial={false}>
              {showReq && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white border border-[#1c1c1c]/5 rounded-2xl p-6 mt-4 shadow-xs">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs font-mono text-[#1c1c1c]/70">
                      <li>
                        <span className="text-[#1c1c1c]/40 block text-[9px] font-sans font-bold tracking-widest uppercase mb-0.5">ИНН</span> 
                        <span className="text-sm font-medium text-[#1c1c1c]">{REQUISITES.inn}</span>
                      </li>
                      <li>
                        <span className="text-[#1c1c1c]/40 block text-[9px] font-sans font-bold tracking-widest uppercase mb-0.5">КПП</span> 
                        <span className="text-sm font-medium text-[#1c1c1c]">{REQUISITES.kpp}</span>
                      </li>
                      <li>
                        <span className="text-[#1c1c1c]/40 block text-[9px] font-sans font-bold tracking-widest uppercase mb-0.5">ОГРН</span> 
                        <span className="text-sm font-medium text-[#1c1c1c]">{REQUISITES.ogrn}</span>
                      </li>
                      <li>
                        <span className="text-[#1c1c1c]/40 block text-[9px] font-sans font-bold tracking-widest uppercase mb-0.5">БИК</span> 
                        <span className="text-sm font-medium text-[#1c1c1c]">{REQUISITES.bik}</span>
                      </li>
                      <li className="sm:col-span-2">
                        <span className="text-[#1c1c1c]/40 block text-[9px] font-sans font-bold tracking-widest uppercase mb-0.5">Расчетный счет</span> 
                        <span className="text-sm font-medium text-[#1c1c1c]">{REQUISITES.account}</span>
                      </li>
                      <li className="sm:col-span-2">
                        <span className="text-[#1c1c1c]/40 block text-[9px] font-sans font-bold tracking-widest uppercase mb-0.5">Банк получателя</span> 
                        <span className="text-sm font-medium text-[#1c1c1c]">{REQUISITES.bank}</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Bottom row */}
        <div className="mt-12 pt-6 border-t border-[#1c1c1c]/10 flex flex-col gap-4 sm:flex-row justify-between items-center text-[10px] font-medium uppercase tracking-widest text-[#1c1c1c]/30">
          <div className="flex gap-4">
            <span>Сделано с любовью</span>
            <span>·</span>
            <span>К хвостатым</span>
          </div>
          {showSwitcher && (
            <div className="lg:hidden w-full sm:w-auto">
              <LiveSwitcher activeVariant={activeVariant} onChange={onVariantChange} dark={false} />
            </div>
          )}
        </div>
      </div>

    </footer>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 2️⃣ VARIANT: MINIMAL CREAM LIGHT ("Чистый Воздух")
// ═════════════════════════════════════════════════════════════════════════════
function CreamLightFooter({ 
  showSwitcher, 
  activeVariant, 
  onVariantChange 
}: { 
  showSwitcher: boolean; 
  activeVariant: FooterVariant; 
  onVariantChange: (v: FooterVariant) => void;
}) {
  const { textEnter, textLeave } = useCursor();
  const [showReq, setShowReq] = useState(false);
  const cursorClass = "cursor-none";

  return (
    <footer className="w-full bg-[#fcfaf7] text-[#1c1c1c] rounded-t-[2.5rem] md:rounded-t-[3.5rem] p-8 md:p-12 lg:p-16 shadow-2xl relative z-20 border-t border-[#1c1c1c]/5">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Section: Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-12 border-b border-[#1c1c1c]/10">
          
          {/* Column 1: Brand & Emotion */}
          <div className="space-y-4">
            <Link 
              href="/" 
              className={`text-3xl font-serif text-[#1c1c1c] hover:text-amber-600 transition-colors inline-block ${cursorClass}`}
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
            >
              Светлый.
            </Link>
            <p className="text-sm text-[#1c1c1c]/60 leading-relaxed font-light max-w-[240px]">
              Благотворительный фонд помощи бездомным животным Ярославля. Лечим, стерилизуем, находим дом.
            </p>
            <div className="flex gap-4 pt-2">
              <a 
                href="#" 
                className={`text-xs font-semibold uppercase tracking-wider text-[#1c1c1c]/70 hover:text-amber-600 transition-colors ${cursorClass}`}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                Telegram
              </a>
              <a 
                href="#" 
                className={`text-xs font-semibold uppercase tracking-wider text-[#1c1c1c]/70 hover:text-amber-600 transition-colors ${cursorClass}`}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                VKontakte
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 font-sans">
              Навигация
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: "Главная страница", path: "/" },
                { name: "Наши питомцы", path: "#pets" },
                { name: "Срочные нужды", path: "#needs" },
                { name: "Истории спасения", path: "#stories" },
                { name: "О фонде", path: "#about" }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link 
                    href={link.path}
                    className={`text-sm text-[#1c1c1c]/70 hover:text-[#1c1c1c] hover:translate-x-1 transition-all duration-300 inline-block font-medium ${cursorClass}`}
                    onMouseEnter={textEnter}
                    onMouseLeave={textLeave}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Compact Contacts */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 font-sans">
              Контакты
            </h4>
            <div className="space-y-3.5 text-sm text-[#1c1c1c]/80 font-light">
              <a 
                href="mailto:info@svetly.ru" 
                className={`flex items-center gap-2.5 hover:text-amber-600 transition-colors font-medium group ${cursorClass}`}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                <div className="w-7 h-7 rounded-full bg-[#1c1c1c]/5 flex items-center justify-center text-[#1c1c1c]/60 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                  <Mail size={12} />
                </div>
                info@svetly.ru
              </a>
              <a 
                href="tel:+79990000000" 
                className={`flex items-center gap-2.5 hover:text-amber-600 transition-colors font-medium group ${cursorClass}`}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                <div className="w-7 h-7 rounded-full bg-[#1c1c1c]/5 flex items-center justify-center text-[#1c1c1c]/60 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                  <Phone size={12} />
                </div>
                +7 (999) 000-00-00
              </a>
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#1c1c1c]/5 flex items-center justify-center text-[#1c1c1c]/60 shrink-0">
                  <MapPin size={12} />
                </div>
                <div className="leading-tight pt-0.5">
                  <span className="block font-medium">г. Ярославль</span>
                  <span className="text-[11px] text-[#1c1c1c]/40">точный адрес по запросу</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Documents and Requisites Trigger */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 font-sans">
              Информация
            </h4>
            <ul className="space-y-2 text-xs">
              {DOCUMENTS.slice(0, 3).map((doc, idx) => (
                <li key={idx}>
                  <a 
                    href="#" 
                    className={`flex items-center justify-between p-2 rounded-lg hover:bg-[#1c1c1c]/5 text-[#1c1c1c]/80 hover:text-[#1c1c1c] transition-all group ${cursorClass}`}
                    onMouseEnter={textEnter}
                    onMouseLeave={textLeave}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <FileText size={12} className="text-[#1c1c1c]/40 shrink-0" />
                      <span className="truncate">{doc.name}</span>
                    </span>
                    <Download size={10} className="text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                  </a>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setShowReq(!showReq)}
              className={`w-full py-2.5 px-4 rounded-xl border border-[#1c1c1c]/10 text-xs font-semibold hover:border-amber-600 hover:text-amber-700 transition-all flex items-center justify-between group ${cursorClass}`}
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
            >
              <span>Показать реквизиты</span>
              <ChevronDown size={14} className={`text-[#1c1c1c]/40 group-hover:text-amber-600 transition-transform ${showReq ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Collapsible Requisites Drawer */}
        <AnimatePresence>
          {showReq && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-b border-[#1c1c1c]/10"
            >
              <div className="py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-xs font-mono text-[#1c1c1c]/70 bg-white/40 rounded-2xl px-6 my-4 border border-[#1c1c1c]/5">
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
                  <span className="text-[9px] font-sans font-bold text-[#1c1c1c]/40 uppercase block mb-1">Банк</span>
                  <span className="text-sm font-medium text-[#1c1c1c]">{REQUISITES.bank}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[#1c1c1c]/40 flex flex-wrap justify-center gap-x-6 gap-y-2">
            <span>© {new Date().getFullYear()} АНБО Светлый</span>
            <span className="hidden md:inline">·</span>
            <span>Лицензированная помощь животным</span>
            <span className="hidden md:inline">·</span>
            <span className="flex items-center gap-1">Сделано с <Heart size={10} className="text-red-500 fill-red-500" /></span>
          </div>

          {showSwitcher && (
            <div className="w-full md:w-auto">
              <LiveSwitcher activeVariant={activeVariant} onChange={onVariantChange} dark={false} />
            </div>
          )}
        </div>

      </div>
    </footer>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 3️⃣ VARIANT: PREMIUM SLEEK DARK ("Ночное Небо")
// ═════════════════════════════════════════════════════════════════════════════
function SleekDarkFooter({ 
  showSwitcher, 
  activeVariant, 
  onVariantChange 
}: { 
  showSwitcher: boolean; 
  activeVariant: FooterVariant; 
  onVariantChange: (v: FooterVariant) => void;
}) {
  const { textEnter, textLeave } = useCursor();
  const [showReq, setShowReq] = useState(false);
  const cursorClass = "cursor-none";

  return (
    <footer className="w-full bg-[#11100e] text-[#f4f1eb] rounded-t-[2.5rem] md:rounded-t-[3.5rem] p-8 md:p-12 lg:p-16 shadow-2xl relative z-20 overflow-hidden border-t border-white/5">
      
      {/* Decorative Radial Ambient Amber Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-600/5 rounded-full blur-[80px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-12 border-b border-white/10">
          
          {/* Main Block (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Link 
              href="/" 
              className={`text-4xl font-serif tracking-tight text-white hover:text-amber-400 transition-colors inline-block ${cursorClass}`}
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
            >
              Светлый.
            </Link>
            <p className="text-white/60 text-base font-light leading-relaxed max-w-sm">
              Мы лечим травмированных уличных животных, проводим стерилизацию и помогаем им найти любящую семью в Ярославле. Каждый хвост заслуживает дом.
            </p>
            <div className="flex gap-4">
              {["Telegram", "VKontakte"].map((soc, idx) => (
                <a 
                  key={idx}
                  href="#" 
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all text-white/80 hover:text-amber-400 ${cursorClass}`}
                  onMouseEnter={textEnter}
                  onMouseLeave={textLeave}
                >
                  {soc}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links (3 cols) */}
          <div className="lg:col-span-3 space-y-5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70 font-sans">
              Навигационные ссылки
            </h4>
            <ul className="grid grid-cols-2 lg:grid-cols-1 gap-y-3 gap-x-4">
              {[
                { name: "Главная страница", path: "/" },
                { name: "Наши питомцы", path: "#pets" },
                { name: "Срочные нужды", path: "#needs" },
                { name: "Истории спасения", path: "#stories" },
                { name: "О фонде", path: "#about" }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link 
                    href={link.path}
                    className={`text-sm text-white/70 hover:text-amber-400 hover:translate-x-1.5 transition-all duration-300 inline-block font-medium ${cursorClass}`}
                    onMouseEnter={textEnter}
                    onMouseLeave={textLeave}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Contacts & Docs (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70 font-sans">
              Свяжитесь с нами
            </h4>
            <div className="space-y-4">
              <a 
                href="mailto:info@svetly.ru" 
                className={`flex items-center gap-3 py-2 px-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-white/10 transition-all group ${cursorClass}`}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                <Mail size={16} className="text-amber-500/80" />
                <div className="text-left">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-white/40 leading-none mb-1">E-mail</span>
                  <span className="text-sm font-medium text-white/90 group-hover:text-amber-400 transition-colors">info@svetly.ru</span>
                </div>
                <ArrowUpRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
              </a>

              <a 
                href="tel:+79990000000" 
                className={`flex items-center gap-3 py-2 px-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-white/10 transition-all group ${cursorClass}`}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                <Phone size={16} className="text-amber-500/80" />
                <div className="text-left">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-white/40 leading-none mb-1">Телефон</span>
                  <span className="text-sm font-medium text-white/90 group-hover:text-amber-400 transition-colors">+7 (999) 000-00-00</span>
                </div>
                <ArrowUpRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
              </a>
            </div>

            {/* Doc & Requisites button row */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowReq(!showReq)}
                className={`flex-1 py-2.5 px-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500 text-xs font-semibold hover:text-amber-400 transition-all flex items-center justify-between group ${cursorClass}`}
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                <span>Реквизиты фонда</span>
                <ChevronDown size={14} className={`text-white/40 group-hover:text-amber-400 transition-transform ${showReq ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Monospace Requisites Panel */}
        <AnimatePresence>
          {showReq && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-b border-white/10"
            >
              <div className="py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs font-mono text-white/70 bg-white/5 rounded-2xl px-6 my-4 border border-white/10">
                <div>
                  <span className="text-[9px] font-sans font-bold text-white/40 uppercase block mb-1">ИНН</span>
                  <span className="text-sm font-medium text-white">{REQUISITES.inn}</span>
                </div>
                <div>
                  <span className="text-[9px] font-sans font-bold text-white/40 uppercase block mb-1">КПП</span>
                  <span className="text-sm font-medium text-white">{REQUISITES.kpp}</span>
                </div>
                <div>
                  <span className="text-[9px] font-sans font-bold text-white/40 uppercase block mb-1">ОГРН</span>
                  <span className="text-sm font-medium text-white">{REQUISITES.ogrn}</span>
                </div>
                <div>
                  <span className="text-[9px] font-sans font-bold text-white/40 uppercase block mb-1">БИК</span>
                  <span className="text-sm font-medium text-white">{REQUISITES.bik}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[9px] font-sans font-bold text-white/40 uppercase block mb-1">Расчетный счет</span>
                  <span className="text-sm font-medium text-white">{REQUISITES.account}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[9px] font-sans font-bold text-white/40 uppercase block mb-1">Банк получателя</span>
                  <span className="text-sm font-medium text-white">{REQUISITES.bank}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Documents Inline Grid (Pills) */}
        <div className="py-8 flex flex-wrap gap-3 items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 shrink-0">Документы PDF:</span>
          {DOCUMENTS.map((doc, idx) => (
            <a
              key={idx}
              href="#"
              className={`flex items-center gap-2 py-1.5 px-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-white/10 text-xs text-white/80 hover:text-amber-400 transition-all ${cursorClass}`}
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
            >
              <FileText size={12} className="text-amber-500/70" />
              <span>{doc.name.replace("АНБО «Светлый»", "")}</span>
              <Download size={10} className="opacity-40" />
            </a>
          ))}
        </div>

        {/* Bottom copyright row */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-white/40 flex flex-wrap justify-center gap-x-6 gap-y-2 text-center">
            <span>© {new Date().getFullYear()} АНБО Светлый</span>
            <span className="hidden md:inline">·</span>
            <span>Помощь бездомным собакам и кошкам</span>
            <span className="hidden md:inline">·</span>
            <span>Лицензированная НКО</span>
          </div>

          {showSwitcher && (
            <div className="w-full md:w-auto">
              <LiveSwitcher activeVariant={activeVariant} onChange={onVariantChange} dark={true} />
            </div>
          )}
        </div>

      </div>
    </footer>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 4️⃣ VARIANT: COMPACT CENTERED ("Гармония")
// ═════════════════════════════════════════════════════════════════════════════
function CenteredFooter({ 
  showSwitcher, 
  activeVariant, 
  onVariantChange 
}: { 
  showSwitcher: boolean; 
  activeVariant: FooterVariant; 
  onVariantChange: (v: FooterVariant) => void;
}) {
  const { textEnter, textLeave } = useCursor();
  const [showReq, setShowReq] = useState(false);
  const cursorClass = "cursor-none";

  return (
    <footer className="w-full bg-[#1c1a16] text-[#f4f1eb] rounded-t-[2.5rem] md:rounded-t-[3.5rem] py-12 px-6 md:px-12 shadow-2xl relative z-20 overflow-hidden border-t border-white/5">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-8">
        
        {/* Logo and Tagline */}
        <div className="space-y-3">
          <Link 
            href="/" 
            className={`text-4xl font-serif text-white hover:text-amber-400 transition-colors inline-block ${cursorClass}`}
            onMouseEnter={textEnter}
            onMouseLeave={textLeave}
          >
            Светлый.
          </Link>
          <p className="text-sm text-white/60 font-light max-w-md mx-auto leading-relaxed">
            Лечим, любим, ищем семью. Каждый день — без выходных. Благотворительный фонд помощи животным в Ярославле.
          </p>
        </div>

        {/* Centralized Navigation Row */}
        <div className="w-full border-y border-white/10 py-4 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
          {[
            { name: "Главная", path: "/" },
            { name: "Питомцы", path: "#pets" },
            { name: "Срочные нужды", path: "#needs" },
            { name: "Истории", path: "#stories" },
            { name: "О фонде", path: "#about" }
          ].map((link, idx) => (
            <Link 
              key={idx}
              href={link.path}
              className={`text-white/80 hover:text-amber-400 font-medium transition-all ${cursorClass}`}
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Contacts Row */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 text-sm font-light text-white/90">
          <a 
            href="mailto:info@svetly.ru" 
            className={`flex items-center gap-2 hover:text-amber-400 transition-colors font-medium ${cursorClass}`}
            onMouseEnter={textEnter}
            onMouseLeave={textLeave}
          >
            <Mail size={14} className="text-amber-500" />
            info@svetly.ru
          </a>
          <a 
            href="tel:+79990000000" 
            className={`flex items-center gap-2 hover:text-amber-400 transition-colors font-medium ${cursorClass}`}
            onMouseEnter={textEnter}
            onMouseLeave={textLeave}
          >
            <Phone size={14} className="text-amber-500" />
            +7 (999) 000-00-00
          </a>
          <span className="flex items-center gap-2 justify-center">
            <MapPin size={14} className="text-amber-500" />
            г. Ярославль
          </span>
        </div>

        {/* Documents Pills List */}
        <div className="flex flex-wrap justify-center gap-2">
          {DOCUMENTS.map((doc, idx) => (
            <a
              key={idx}
              href="#"
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/5 hover:bg-white/10 text-xs text-white/70 hover:text-amber-400 transition-all ${cursorClass}`}
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
            >
              <FileText size={10} className="text-amber-500/70" />
              <span>{doc.name.replace("АНБО «Светлый» ", "")}</span>
              <Download size={10} className="opacity-40" />
            </a>
          ))}
        </div>

        {/* Requisites Button */}
        <div>
          <button
            onClick={() => setShowReq(!showReq)}
            className={`py-2 px-5 rounded-full border border-white/10 hover:border-amber-500 hover:text-amber-400 text-xs font-semibold transition-all flex items-center gap-2 group mx-auto ${cursorClass}`}
            onMouseEnter={textEnter}
            onMouseLeave={textLeave}
          >
            <span>Реквизиты фонда</span>
            <ChevronDown size={14} className={`text-white/40 group-hover:text-amber-400 transition-transform ${showReq ? "rotate-180" : ""}`} />
          </button>

          {/* Requisites Drawer */}
          <AnimatePresence>
            {showReq && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden w-full max-w-xl mx-auto"
              >
                <div className="py-6 px-6 bg-white/5 rounded-2xl border border-white/10 mt-4 text-xs font-mono text-white/70 grid grid-cols-2 gap-4 text-left">
                  <div>
                    <span className="text-[9px] font-sans font-bold text-white/40 uppercase block mb-0.5">ИНН</span>
                    <span className="text-sm font-medium text-white">{REQUISITES.inn}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-sans font-bold text-white/40 uppercase block mb-0.5">КПП</span>
                    <span className="text-sm font-medium text-white">{REQUISITES.kpp}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-sans font-bold text-white/40 uppercase block mb-0.5">ОГРН</span>
                    <span className="text-sm font-medium text-white">{REQUISITES.ogrn}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-sans font-bold text-white/40 uppercase block mb-0.5">БИК</span>
                    <span className="text-sm font-medium text-white">{REQUISITES.bik}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] font-sans font-bold text-white/40 uppercase block mb-0.5">Расчетный счет</span>
                    <span className="text-sm font-medium text-white">{REQUISITES.account}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] font-sans font-bold text-white/40 uppercase block mb-0.5">Банк</span>
                    <span className="text-sm font-medium text-white">{REQUISITES.bank}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer switcher and Social row */}
        <div className="w-full pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-white/40 flex flex-col sm:flex-row justify-center items-center gap-x-6 gap-y-2">
            <span>© {new Date().getFullYear()} АНБО Светлый</span>
            <span className="hidden sm:inline">·</span>
            <span>г. Ярославль</span>
          </div>

          {showSwitcher && (
            <div className="w-full md:w-auto">
              <LiveSwitcher activeVariant={activeVariant} onChange={onVariantChange} dark={true} />
            </div>
          )}
        </div>

      </div>
    </footer>
  );
}
