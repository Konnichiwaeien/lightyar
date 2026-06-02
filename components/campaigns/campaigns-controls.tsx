"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function CampaignsControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "active";
  const currentSort = searchParams.get("sort") || "date_desc";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      if (name !== 'page') params.set('page', '1'); // reset page on filter change
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
      {/* Status Tabs */}
      <div className="flex bg-white rounded-full p-1 shadow-sm border border-[#1c1c1c]/5 pointer-events-auto cursor-none">
        <button
          onClick={() => router.push(pathname + "?" + createQueryString("status", "active"))}
          aria-pressed={currentStatus === "active"}
          className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
            currentStatus === "active" ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/50 hover:text-[#1c1c1c]"
          }`}
        >
          Актуальные
        </button>
        <button
          onClick={() => router.push(pathname + "?" + createQueryString("status", "closed"))}
          aria-pressed={currentStatus === "closed"}
          className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
            currentStatus === "closed" ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/50 hover:text-[#1c1c1c]"
          }`}
        >
          Закрытые
        </button>
      </div>

      {/* Sorting */}
      <div className="flex items-center gap-4 w-full md:w-auto bg-white rounded-full px-6 py-3 shadow-sm border border-[#1c1c1c]/5 pointer-events-auto cursor-none">
        <label htmlFor="campaigns-sort-select" className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 cursor-pointer">Сортировка:</label>
        <select
          id="campaigns-sort-select"
          value={currentSort}
          onChange={(e) => router.push(pathname + "?" + createQueryString("sort", e.target.value))}
          className="bg-transparent border-none text-[#1c1c1c] font-medium text-sm focus:ring-0 cursor-none outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden rounded-md px-1"
        >
          <option value="date_desc">Сначала новые</option>
          <option value="date_asc">Сначала старые</option>
          <option value="collected_desc">Больше собрано</option>
          <option value="collected_asc">Меньше собрано</option>
        </select>
      </div>
    </div>
  );
}
