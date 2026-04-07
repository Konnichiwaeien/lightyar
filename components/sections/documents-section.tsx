"use client";

import { FileText, Download } from "lucide-react";

interface Props {
  textEnter: () => void;
  textLeave: () => void;
}

const DOCUMENTS = [
  { title: "Устав АНБО «Светлый»", size: "1.2 MB" },
  { title: "Свидетельство о регистрации", size: "840 KB" },
  { title: "Свидетельство ИНН", size: "450 KB" },
  { title: "Публичная оферта", size: "2.1 MB" },
  { title: "Отчёт за 2024 год", size: "5.4 MB" },
  { title: "Реквизиты организации", size: "120 KB" },
];

export function DocumentsSection({ textEnter, textLeave }: Props) {
  return (
    <section className="relative pt-12 pb-24 px-6 md:px-12 bg-[#e8e4dc] text-[#1c1c1c]" id="docs">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c1c1c]/40 mb-10">
          [ Документы ]
        </h2>

        {/* Outer Bento Box for Documents */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            
            {DOCUMENTS.map((doc, i) => (
              <a
                key={i}
                href="#"
                className="group flex items-start gap-4 pointer-events-auto cursor-none outline-none"
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1c1c1c]/5 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors duration-500">
                  <FileText className="w-5 h-5 text-[#1c1c1c]/40 group-hover:text-amber-600 transition-colors duration-500" />
                </div>
                
                <div className="flex flex-col">
                  <h4 className="text-base sm:text-lg font-medium text-[#1c1c1c] group-hover:text-amber-500 transition-colors duration-300 leading-tight mb-2">
                    {doc.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-[#1c1c1c]/40">
                    <span>PDF • {doc.size}</span>
                    <span className="flex items-center gap-1 text-amber-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 font-medium">
                      <Download size={14} />
                      Скачать
                    </span>
                  </div>
                </div>
              </a>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
}
