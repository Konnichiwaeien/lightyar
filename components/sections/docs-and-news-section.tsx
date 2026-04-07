"use client";

import { FileText } from "lucide-react";

interface Props {
  textEnter: () => void;
  textLeave: () => void;
}

const DOCS = [
  "Устав АНБО «Светлый»",
  "Свидетельство о регистрации",
  "Публичная оферта",
  "Реквизиты организации",
  "Отчет за 2024 год",
];

const NEWS = [
  { date: "15 Мар", title: "Рекс сделал первые шаги после операции" },
  { date: "10 Мар", title: "Закупили 500 кг корма. Спасибо вам!" },
  { date: "01 Мар", title: "Герда нашла свою семью" },
];

export function DocsAndNewsSection({ textEnter, textLeave }: Props) {
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20" id="docs">
      {/* Documents */}
      <div onMouseEnter={textEnter} onMouseLeave={textLeave}>
        <h2 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-12 text-white">[ Открытость ]</h2>
        <div className="space-y-6">
          {DOCS.map((doc, i) => (
            <a
              key={i}
              href="#"
              className="flex items-center justify-between py-6 border-b border-white/10 hover:border-white transition-colors group pointer-events-auto cursor-none"
            >
              <div className="flex items-center gap-6">
                <FileText size={20} className="text-white/30 group-hover:text-amber-500 transition-colors" />
                <span className="font-serif text-xl md:text-2xl group-hover:pl-4 transition-all duration-300 text-white">
                  {doc}
                </span>
              </div>
              <span className="text-xs uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity text-amber-500">
                PDF
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* News */}
      <div onMouseEnter={textEnter} onMouseLeave={textLeave}>
        <h2 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-12 flex justify-between items-center text-white">
          <span>[ Дневник ]</span>
          <a href="#" className="hover:text-amber-500 transition-colors pointer-events-auto cursor-none">
            Все новости →
          </a>
        </h2>
        <div className="space-y-8">
          {NEWS.map((news, i) => (
            <div key={i} className="flex gap-6 items-start group pointer-events-auto cursor-none">
              <div className="text-sm font-bold uppercase tracking-widest text-white/40 pt-1 group-hover:text-amber-500 transition-colors w-16">
                {news.date}
              </div>
              <h3 className="text-2xl font-serif leading-tight group-hover:opacity-70 transition-opacity text-white">
                {news.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
