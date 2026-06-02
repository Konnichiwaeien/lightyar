"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  totalPages: number;
  currentPage: number;
}

export function PetsPagination({ totalPages, currentPage }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return pathname + "?" + params.toString();
  };

  const getPageNumbers = () => {
    const delta = 1; // Number of neighbors on each side
    const range: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
      return range;
    }

    // Always include the first page
    range.push(1);

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    if (start > 2) {
      range.push("...");
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (end < totalPages - 1) {
      range.push("...");
    }

    // Always include the last page
    range.push(totalPages);

    return range;
  };

  const pages = getPageNumbers();

  return (
    <nav 
      aria-label="Навигация по каталогу питомцев" 
      className="flex justify-center items-center gap-1.5 sm:gap-2 mt-12 sm:mt-20 relative z-10 pointer-events-auto"
    >
      {/* Back Button */}
      {currentPage <= 1 ? (
        <span 
          aria-disabled="true"
          className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 flex items-center justify-center rounded-full border border-[#1c1c1c]/10 bg-white text-[#1c1c1c]/20 transition-all duration-300 shadow-sm shrink-0 cursor-not-allowed opacity-20"
        >
          <ArrowLeft size={14} className="sm:w-[16px] sm:h-[16px]" />
        </span>
      ) : (
        <Link
          href={createPageUrl(currentPage - 1)}
          aria-label="Предыдущая страница"
          rel="prev"
          className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 flex items-center justify-center rounded-full border border-[#1c1c1c]/10 bg-white text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-white focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden transition-all duration-300 shadow-sm shrink-0 cursor-pointer"
        >
          <ArrowLeft size={14} className="sm:w-[16px] sm:h-[16px]" />
        </Link>
      )}
      
      {/* Pagination Numbers and Ellipses */}
      <div className="flex bg-white rounded-full border border-[#1c1c1c]/5 shadow-sm p-0.5 sm:p-1 gap-0.5 sm:gap-1 mx-0.5 sm:mx-2 items-center">
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-6 sm:w-8 md:w-10 h-7 sm:h-8 md:h-10 flex items-center justify-center rounded-full text-[10px] sm:text-xs md:text-sm font-bold text-[#1c1c1c]/30 select-none cursor-default"
              >
                ...
              </span>
            );
          }

          const isCurrent = currentPage === p;
          const pageNum = Number(p);

          return (
            <Link
              key={`page-${pageNum}`}
              href={createPageUrl(pageNum)}
              aria-current={isCurrent ? "page" : undefined}
              aria-label={`Страница ${pageNum}`}
              className={`w-7 sm:w-8 md:w-10 h-7 sm:h-8 md:h-10 flex items-center justify-center rounded-full text-[10px] sm:text-xs md:text-sm font-bold focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden transition-all duration-300 cursor-pointer ${
                isCurrent
                  ? "bg-[#1c1c1c] text-white shadow-md scale-105"
                  : "text-[#1c1c1c]/50 hover:bg-[#1c1c1c]/5 hover:text-[#1c1c1c]"
              }`}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage >= totalPages ? (
        <span 
          aria-disabled="true"
          className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 flex items-center justify-center rounded-full border border-[#1c1c1c]/10 bg-white text-[#1c1c1c]/20 transition-all duration-300 shadow-sm shrink-0 cursor-not-allowed opacity-20"
        >
          <ArrowRight size={14} className="sm:w-[16px] sm:h-[16px]" />
        </span>
      ) : (
        <Link
          href={createPageUrl(currentPage + 1)}
          aria-label="Следующая страница"
          rel="next"
          className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 flex items-center justify-center rounded-full border border-[#1c1c1c]/10 bg-white text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-white focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden transition-all duration-300 shadow-sm shrink-0 cursor-pointer"
        >
          <ArrowRight size={14} className="sm:w-[16px] sm:h-[16px]" />
        </Link>
      )}
    </nav>
  );
}

