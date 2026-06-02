"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect, useRef } from "react";
import { 
  Search, 
  X, 
  RotateCcw, 
  Filter, 
  ChevronDown, 
  Check, 
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
import { motion, AnimatePresence } from "framer-motion";

interface Option<T> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps<T> {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  icon: React.ReactNode;
  activeColorClass?: string;
  align?: "left" | "right";
}

function CustomDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  icon,
  activeColorClass = "border-amber-500 bg-amber-50/50 text-amber-900",
  align = "left",
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle focus transition when focusedIndex changes
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  const hasValueSelected = value !== "" && value !== undefined;
  
  // Create a clean URL-friendly unique ID from the label
  const dropdownId = label.toLowerCase().replace(/[^a-zа-я0-9]+/g, "-");

  const toggleDropdown = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      const selectedIdx = options.findIndex((opt) => opt.value === value);
      setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0);
      // Clean up refs array size
      itemRefs.current = itemRefs.current.slice(0, options.length);
    }
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        const selectedIdx = options.findIndex((opt) => opt.value === value);
        setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0);
      } else {
        setFocusedIndex(0);
      }
    } else if (e.key === "Escape" && isOpen) {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (index + 1) % options.length;
      setFocusedIndex(nextIndex);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (index - 1 + options.length) % options.length;
      setFocusedIndex(prevIndex);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "Tab") {
      // Let standard focus tab out, close the dropdown
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        ref={triggerRef}
        id={`dropdown-btn-${dropdownId}`}
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`dropdown-list-${dropdownId}`}
        className={`flex items-center gap-1.5 sm:gap-2.5 rounded-full px-4 py-3 sm:px-5 sm:py-2.5 border text-[10px] sm:text-[11px] font-bold uppercase tracking-widest cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden transition-all duration-300 shadow-2xs hover:shadow-xs ${
          hasValueSelected
            ? activeColorClass
            : "bg-white border-[#1c1c1c]/5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/3 hover:text-[#1c1c1c] hover:border-[#1c1c1c]/10"
        }`}
      >
        <span className="shrink-0">{hasValueSelected && selectedOption?.icon ? selectedOption.icon : icon}</span>
        <span>{hasValueSelected ? selectedOption?.label : label}</span>
        <ChevronDown
          size={12}
          className={`text-current/60 shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`dropdown-list-${dropdownId}`}
            role="listbox"
            aria-labelledby={`dropdown-btn-${dropdownId}`}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ position: "absolute" }}
            className={`z-50 mt-2 bg-white rounded-2xl border border-[#1c1c1c]/5 shadow-xl p-2 min-w-[200px] max-w-[calc(100vw-32px)] overflow-x-hidden flex flex-col gap-1 ${
              align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
            }`}
          >
            {options.map((option, idx) => {
              const isSelected = option.value === value;
              const isFocused = idx === focusedIndex;
              return (
                <button
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  id={`dropdown-opt-${dropdownId}-${option.value || "all"}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    triggerRef.current?.focus(); // Accessibility: return focus to button
                  }}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  tabIndex={0}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer outline-none ${
                    isSelected
                      ? "bg-amber-500/10 text-amber-900"
                      : "text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/3 hover:text-[#1c1c1c]"
                  } ${
                    isFocused ? "ring-2 ring-amber-500/50 bg-amber-500/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {option.icon && (
                      <span className={`shrink-0 ${isSelected ? "text-amber-600" : "text-current/60"}`}>
                        {option.icon}
                      </span>
                    )}
                    <span className="truncate max-w-[140px] inline-block">{option.label}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-amber-600 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  const typeOptions: Option<string>[] = [
    { value: "", label: "Все виды", icon: <PawPrint size={14} /> },
    { value: "dog", label: "Собаки", icon: <Dog size={14} /> },
    { value: "cat", label: "Кошки", icon: <Cat size={14} /> },
  ];

  const sexOptions: Option<string>[] = [
    { value: "", label: "Любой пол", icon: <Smile size={14} /> },
    { value: "male", label: "Мальчики", icon: <Mars size={14} /> },
    { value: "female", label: "Девочки", icon: <Venus size={14} /> },
  ];

  const sizeOptions: Option<string>[] = [
    { value: "", label: "Любой размер", icon: <Ruler size={14} /> },
    { value: "small", label: "Маленькие (S)", icon: <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded shrink-0">S</span> },
    { value: "medium", label: "Средние (M)", icon: <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded shrink-0">M</span> },
    { value: "large", label: "Большие (L)", icon: <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded shrink-0">L</span> },
  ];

  const sortOptions: Option<string>[] = [
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
