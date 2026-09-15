"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import {
  Search,
  X,
  RotateCcw,
  Filter,
  Dog,
  Cat,
  Smile,
  Mars,
  Venus,
  Ruler,
  ArrowUpDown,
  PawPrint,
  Home,
  Heart
} from "lucide-react";
import { CustomDropdown, type DropdownOption } from "@/components/ui/custom-dropdown";

export function PetsControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "shelter";
  const currentSort = searchParams.get("sort") || "name_asc";
  const currentType = searchParams.get("type") || "";
  const currentSex = searchParams.get("sex") || "";
  const currentSize = searchParams.get("size") || "";
  const currentSearch = searchParams.get("search") || "";

  // Local state for search input
  const [searchTerm, setSearchTerm] = useState(currentSearch);

  // Sync state with URL search param when it changes
  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  const [favoritesCount, setFavoritesCount] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const isFavoritesActive = searchParams.get("favorites") === "true";

  useEffect(() => {
    const updateFavs = () => {
      if (typeof window !== "undefined") {
        const favs = JSON.parse(localStorage.getItem("pet-favorites") || "[]");
        setFavoritesCount(favs.length);
        setFavoriteIds(favs);
      }
    };
    updateFavs();
    window.addEventListener("favorites-changed", updateFavs);
    return () => window.removeEventListener("favorites-changed", updateFavs);
  }, []);

  const toggleFavoritesFilter = () => {
    const nextActive = !isFavoritesActive;
    if (nextActive) {
      router.push(
        pathname +
          "?" +
          createQueryString({
            favorites: "true",
            ids: favoriteIds.join(","),
          })
      );
    } else {
      router.push(
        pathname +
          "?" +
          createQueryString({
            favorites: null,
            ids: null,
          })
      );
    }
  };

  // Keep URL 'ids' param in sync dynamically if favorites list changes while filter is active
  useEffect(() => {
    if (isFavoritesActive) {
      const currentIdsParam = searchParams.get("ids") || "";
      const newIdsParam = favoriteIds.join(",");
      if (currentIdsParam !== newIdsParam) {
        const params = new URLSearchParams(searchParams.toString());
        if (newIdsParam) {
          params.set("ids", newIdsParam);
        } else {
          params.delete("ids");
        }
        router.replace(pathname + "?" + params.toString(), { scroll: false });
      }
    }
  }, [favoriteIds, isFavoritesActive, searchParams, pathname, router]);

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      Object.entries(updates).forEach(([name, value]) => {
        if (value === null || value === "") {
          params.delete(name);
        } else {
          params.set(name, value);
        }
      });
      
      // Reset page to 1 on filter/search change
      params.set('page', '1');
      return params.toString();
    },
    [searchParams]
  );

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    router.push(pathname + "?" + createQueryString({ search: searchTerm }));
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    router.push(pathname + "?" + createQueryString({ search: null }));
  };

  const handleFilterChange = (name: string, value: string) => {
    router.push(pathname + "?" + createQueryString({ [name]: value }));
  };

  const handleResetAll = () => {
    setSearchTerm("");
    const params = new URLSearchParams();
    // Keep status and sort, clear all filters
    if (currentStatus) params.set("status", currentStatus);
    if (currentSort) params.set("sort", currentSort);
    router.push(pathname + "?" + params.toString());
  };

  const hasActiveFilters = currentType || currentSex || currentSize || currentSearch || isFavoritesActive;

  // Dropdown options
  const typeOptions: DropdownOption<string>[] = [
    { value: "", label: "Все виды", icon: <PawPrint size={14} /> },
    { value: "dog", label: "Собаки", icon: <Dog size={14} /> },
    { value: "cat", label: "Кошки", icon: <Cat size={14} /> },
  ];

  const sexOptions: DropdownOption<string>[] = [
    { value: "", label: "Любой пол", icon: <Smile size={14} /> },
    { value: "male", label: "Мальчики", icon: <Mars size={14} /> },
    { value: "female", label: "Девочки", icon: <Venus size={14} /> },
  ];

  const sizeOptions: DropdownOption<string>[] = [
    { value: "", label: "Любой размер", icon: <Ruler size={14} /> },
    { value: "small", label: "Маленькие (S)", icon: <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded shrink-0">S</span> },
    { value: "medium", label: "Средние (M)", icon: <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded shrink-0">M</span> },
    { value: "large", label: "Большие (L)", icon: <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded shrink-0">L</span> },
  ];

  const sortOptions: DropdownOption<string>[] = [
    { value: "name_asc", label: "По имени А–Я", icon: <span className="text-[10px] font-bold text-amber-600">А-Я</span> },
    { value: "name_desc", label: "По имени Я–А", icon: <span className="text-[10px] font-bold text-amber-600">Я-А</span> },
    { value: "age_asc", label: "Сначала младшие", icon: <span className="text-[10px] font-bold text-blue-600">1 → 9</span> },
    { value: "age_desc", label: "Сначала старшие", icon: <span className="text-[10px] font-bold text-blue-600">9 → 1</span> },
  ];

  return (
    <section 
      aria-label="Панель фильтрации и сортировки питомцев"
      className="flex flex-col gap-6 mb-12 relative z-30 w-full pointer-events-auto"
    >
      {/* 1. Top Section: Search and Status Switcher */}
      <div className="flex flex-col lg:flex-row gap-4 w-full justify-between items-stretch lg:items-center">
        {/* Search Bar */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="flex-1 max-w-xl flex bg-white rounded-full p-1 sm:p-1.5 shadow-xs border border-[#1c1c1c]/5 items-center relative"
        >
          <div className="pl-3 sm:pl-4 text-[#1c1c1c]/30">
            <Search size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по имени питомца..."
            aria-label="Поиск питомца по имени"
            className="flex-1 bg-transparent border-none text-[#1c1c1c] text-xs sm:text-sm font-light px-2 sm:px-3 py-2 sm:py-3 outline-none focus:ring-0 placeholder:text-[#1c1c1c]/30 focus-visible:ring-2 focus-visible:ring-amber-500/50 rounded-full"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="p-1.5 sm:p-2 text-[#1c1c1c]/40 hover:text-[#1c1c1c] transition-colors mr-1 sm:mr-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden rounded-full"
            >
              <X size={14} className="sm:w-[16px] sm:h-[16px]" />
            </button>
          )}
          <button
            type="submit"
            className="bg-[#2e2620] text-white hover:bg-amber-500 px-4 sm:px-6 py-3 sm:py-3 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden"
          >
            Найти
          </button>
        </form>

        {/* Status Switcher (Shelter / Adopted) */}
        <div className="flex bg-white rounded-full p-1 shadow-xs border border-[#1c1c1c]/5 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => handleFilterChange("status", "shelter")}
            aria-pressed={currentStatus === "shelter"}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-3 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
              currentStatus === "shelter" 
                ? "bg-[#2e2620] text-white" 
                : "text-[#1c1c1c]/50 hover:text-[#1c1c1c] hover:bg-[#1c1c1c]/3"
            }`}
          >
            <PawPrint 
              size={13} 
              className={`transition-colors shrink-0 ${
                currentStatus === "shelter" ? "text-amber-400" : "text-[#1c1c1c]/40"
              }`} 
            />
            <span>В приюте</span>
          </button>
          <button
            onClick={() => handleFilterChange("status", "home")}
            aria-pressed={currentStatus === "home"}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-3 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
              currentStatus === "home" 
                ? "bg-[#2e2620] text-white" 
                : "text-[#1c1c1c]/50 hover:text-[#1c1c1c] hover:bg-[#1c1c1c]/3"
            }`}
          >
            <Home 
              size={13} 
              className={`transition-colors shrink-0 ${
                currentStatus === "home" ? "text-emerald-400" : "text-[#1c1c1c]/40"
              }`} 
            />
            <span>Нашли дом</span>
          </button>
        </div>
      </div>

      {/* 2. Bottom Section: Advanced Selects, Sorting, and Reset Button */}
      <div className="flex flex-col lg:flex-row flex-wrap items-stretch lg:items-center justify-between gap-4 bg-white/50 backdrop-blur-md rounded-[2rem] sm:rounded-[2.25rem] p-4 sm:p-6 border border-[#1c1c1c]/5">
        
        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#1c1c1c]/60 font-semibold text-[10px] sm:text-xs uppercase tracking-wider mr-1 sm:mr-2">
            <Filter size={12} className="sm:w-[14px] sm:h-[14px]" /> Фильтры:
          </div>

          {/* Species Custom Dropdown */}
          <CustomDropdown
            label="Все виды"
            value={currentType}
            options={typeOptions}
            onChange={(val) => handleFilterChange("type", val)}
            icon={<PawPrint size={14} />}
          />

          {/* Gender Custom Dropdown */}
          <CustomDropdown
            label="Любой пол"
            value={currentSex}
            options={sexOptions}
            onChange={(val) => handleFilterChange("sex", val)}
            icon={<Smile size={14} />}
          />

          {/* Size Custom Dropdown */}
          <CustomDropdown
            label="Любой размер"
            value={currentSize}
            options={sizeOptions}
            onChange={(val) => handleFilterChange("size", val)}
            icon={<Ruler size={14} />}
          />

          {/* Favorites Filter Toggle */}
          <button
            type="button"
            onClick={toggleFavoritesFilter}
            aria-pressed={isFavoritesActive}
            className={`flex items-center gap-1.5 sm:gap-2.5 rounded-full px-4 py-3 sm:px-5 sm:py-2.5 border text-[10px] sm:text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 shadow-2xs hover:shadow-xs focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-hidden ${
              isFavoritesActive
                ? "bg-rose-500 border-rose-500 text-white hover:bg-rose-600 hover:border-rose-600"
                : "bg-white border-[#1c1c1c]/5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/3 hover:text-[#1c1c1c] hover:border-[#1c1c1c]/10"
            }`}
          >
            <Heart size={12} fill={isFavoritesActive ? "currentColor" : "none"} className={isFavoritesActive ? "text-white animate-pulse" : "text-rose-500"} />
            <span>Любимчики ({favoritesCount})</span>
          </button>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 sm:gap-2 text-amber-600 hover:text-amber-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all px-3 sm:px-4 py-3 sm:py-2.5 rounded-full hover:bg-amber-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden"
            >
              <RotateCcw size={12} className="sm:w-[14px] sm:h-[14px]" /> Сбросить
            </button>
          )}
        </div>

        {/* Sorting Custom Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40">Сортировка:</span>
          <CustomDropdown
            label="Сортировка"
            value={currentSort}
            options={sortOptions}
            onChange={(val) => handleFilterChange("sort", val)}
            icon={<ArrowUpDown size={14} />}
            align="right"
            activeColorClass="border-[#1c1c1c]/20 bg-[#1c1c1c]/5 text-[#1c1c1c]"
          />
        </div>

      </div>
    </section>
  );
}
