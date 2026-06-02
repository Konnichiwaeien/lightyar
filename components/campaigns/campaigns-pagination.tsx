"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Props {
  totalPages: number;
  currentPage: number;
}

export function CampaignsPagination({ totalPages, currentPage }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return pathname + "?" + params.toString();
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Пагинация сборов" className="flex justify-center items-center gap-2 mt-20 relative z-10 pointer-events-auto">
      {currentPage <= 1 ? (
        <span 
          className="w-12 h-12 flex items-center justify-center rounded-full border border-[#1c1c1c]/10 bg-white text-[#1c1c1c] opacity-30 shadow-sm shrink-0 select-none animate-none"
          aria-hidden="true"
        >
          <ArrowLeft size={16} />
        </span>
      ) : (
        <Link
          href={createPageUrl(currentPage - 1)}
          rel="prev"
          aria-label="Предыдущая страница"
          className="w-12 h-12 flex items-center justify-center rounded-full border border-[#1c1c1c]/10 bg-white text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-white focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden transition-all shadow-sm shrink-0"
        >
          <ArrowLeft size={16} />
        </Link>
      )}
      
      <ul className="flex bg-white rounded-full border border-[#1c1c1c]/5 shadow-sm p-1 gap-1 mx-2" role="list">
        {pages.map((p) => (
          <li key={p}>
            <Link
              href={createPageUrl(p)}
              aria-label={`Страница ${p}`}
              aria-current={currentPage === p ? "page" : undefined}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
                currentPage === p
                  ? "bg-[#1c1c1c] text-white"
                  : "text-[#1c1c1c]/50 hover:bg-[#1c1c1c]/5 hover:text-[#1c1c1c]"
              }`}
            >
              {p}
            </Link>
          </li>
        ))}
      </ul>

      {currentPage >= totalPages ? (
        <span 
          className="w-12 h-12 flex items-center justify-center rounded-full border border-[#1c1c1c]/10 bg-white text-[#1c1c1c] opacity-30 shadow-sm shrink-0 select-none animate-none"
          aria-hidden="true"
        >
          <ArrowRight size={16} />
        </span>
      ) : (
        <Link
          href={createPageUrl(currentPage + 1)}
          rel="next"
          aria-label="Следующая страница"
          className="w-12 h-12 flex items-center justify-center rounded-full border border-[#1c1c1c]/10 bg-white text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-white focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden transition-all shadow-sm shrink-0"
        >
          <ArrowRight size={16} />
        </Link>
      )}
    </nav>
  );
}
