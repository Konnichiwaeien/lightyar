"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  totalPages: number;
  currentPage: number;
}

export function CampaignsPagination({ totalPages, currentPage }: Props) {
  const router = useRouter();
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
    <div className="flex justify-center items-center gap-2 mt-20 relative z-10 pointer-events-auto">
      <button
        onClick={() => router.push(createPageUrl(currentPage - 1))}
        disabled={currentPage <= 1}
        className="w-12 h-12 flex items-center justify-center rounded-full border border-[#1c1c1c]/10 bg-white text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#1c1c1c] transition-all shadow-sm shrink-0"
      >
        <ArrowLeft size={16} />
      </button>
      
      <div className="flex bg-white rounded-full border border-[#1c1c1c]/5 shadow-sm p-1 gap-1 mx-2">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => router.push(createPageUrl(p))}
            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
              currentPage === p
                ? "bg-[#1c1c1c] text-white"
                : "text-[#1c1c1c]/50 hover:bg-[#1c1c1c]/5 hover:text-[#1c1c1c]"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        onClick={() => router.push(createPageUrl(currentPage + 1))}
        disabled={currentPage >= totalPages}
        className="w-12 h-12 flex items-center justify-center rounded-full border border-[#1c1c1c]/10 bg-white text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#1c1c1c] transition-all shadow-sm shrink-0"
      >
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
