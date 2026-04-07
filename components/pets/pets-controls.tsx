"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function PetsControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "shelter";
  const currentSort = searchParams.get("sort") || "name_asc";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      if (name !== 'page') params.set('page', '1');
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
      {/* Status Tabs */}
      <div className="flex bg-white rounded-full p-1 shadow-sm border border-[#1c1c1c]/5 pointer-events-auto">
        <button
          onClick={() => router.push(pathname + "?" + createQueryString("status", "shelter"))}
          className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
            currentStatus === "shelter" ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/50 hover:text-[#1c1c1c]"
          }`}
        >
          В приюте
        </button>
        <button
          onClick={() => router.push(pathname + "?" + createQueryString("status", "home"))}
          className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
            currentStatus === "home" ? "bg-[#1c1c1c] text-white" : "text-[#1c1c1c]/50 hover:text-[#1c1c1c]"
          }`}
        >
          Нашли дом
        </button>
      </div>

      {/* Sorting */}
      <div className="flex items-center gap-4 w-full md:w-auto bg-white rounded-full px-6 py-3 shadow-sm border border-[#1c1c1c]/5 pointer-events-auto">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40">Сортировка:</span>
        <select
          value={currentSort}
          onChange={(e) => router.push(pathname + "?" + createQueryString("sort", e.target.value))}
          className="bg-transparent border-none text-[#1c1c1c] font-medium text-sm focus:ring-0 outline-none"
        >
          <option value="name_asc">По имени А–Я</option>
          <option value="name_desc">По имени Я–А</option>
          <option value="age_asc">Сначала младшие</option>
          <option value="age_desc">Сначала старшие</option>
        </select>
      </div>
    </div>
  );
}
