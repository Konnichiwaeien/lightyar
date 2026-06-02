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
  Calendar,
  ArrowUpDown,
  Tag as TagIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StrapiTag } from "@/lib/api/types";

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
  isMultiple?: boolean;
}

function CustomDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  icon,
  activeColorClass = "border-amber-500 bg-amber-50/50 text-amber-900",
  align = "left",
  isMultiple = false,
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selectedValues = isMultiple
    ? (value ? value.split(",").filter(Boolean) : [])
    : [value];

  const hasValueSelected = isMultiple
    ? selectedValues.length > 0
    : (value !== "" && value !== undefined);

  // Compute trigger button label
  let displayLabel = label;
  if (hasValueSelected) {
    if (isMultiple) {
      if (selectedValues.length === 1) {
        const found = options.find((opt) => opt.value === selectedValues[0]);
        displayLabel = found ? found.label : label;
      } else {
        displayLabel = `${label} (${selectedValues.length})`;
      }
    } else {
      const found = options.find((opt) => opt.value === value);
      displayLabel = found ? found.label : label;
    }
  }

  const handleOptionClick = (optionValue: T) => {
    if (isMultiple) {
      if (optionValue === "") {
        // "All" clicked, clear everything
        onChange("" as T);
      } else {
        const index = selectedValues.indexOf(optionValue);
        const nextValues = [...selectedValues];
        if (index > -1) {
          nextValues.splice(index, 1);
        } else {
          nextValues.push(optionValue);
        }
        onChange(nextValues.join(",") as T);
      }
      // Note: do not close the dropdown for multiple select
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const dropdownId = label.toLowerCase().replace(/[^a-zа-я0-9]+/g, "-");

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        ref={triggerRef}
        id={`dropdown-btn-${dropdownId}`}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`dropdown-list-${dropdownId}`}
        className={`flex items-center gap-1.5 sm:gap-2.5 rounded-full px-3 py-2 sm:px-5 sm:py-2.5 border text-[10px] sm:text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 shadow-2xs hover:shadow-xs focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
          hasValueSelected
            ? activeColorClass
            : "bg-white border-[#1c1c1c]/5 text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/3 hover:text-[#1c1c1c] hover:border-[#1c1c1c]/10"
        }`}
      >
        <span className="shrink-0">{icon}</span>
        <span>{displayLabel}</span>
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
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ position: "absolute" }}
            className={`z-50 mt-2 bg-white rounded-2xl border border-[#1c1c1c]/5 shadow-xl p-2 min-w-[200px] max-w-[calc(100vw-32px)] overflow-x-hidden flex flex-col gap-1 ${
              align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
            }`}
          >
            {options.map((option) => {
              const isSelected = isMultiple
                ? (option.value === "" ? selectedValues.length === 0 : selectedValues.includes(option.value))
                : option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleOptionClick(option.value)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500/30 ${
                    isSelected
                      ? "bg-amber-500/10 text-amber-900"
                      : "text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/3 hover:text-[#1c1c1c] focus-visible:bg-amber-500/10 focus-visible:text-amber-900"
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

interface NewsControlsProps {
  tags: StrapiTag[];
}

export function NewsControls({ tags }: NewsControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTag = searchParams.get("tag") || "";
  const currentSort = searchParams.get("sort") || "publishedAt:desc";
  const currentSearch = searchParams.get("search") || "";

  // Local state for search
  const [searchTerm, setSearchTerm] = useState(currentSearch);

  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

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
      params.set("page", "1");
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

  const handleTagChange = (slugs: string) => {
    router.push(pathname + "?" + createQueryString({ tag: slugs || null }));
  };

  const handleSortChange = (sortVal: string) => {
    router.push(pathname + "?" + createQueryString({ sort: sortVal }));
  };

  const handleResetAll = () => {
    setSearchTerm("");
    const params = new URLSearchParams();
    if (currentSort) params.set("sort", currentSort);
    router.push(pathname + "?" + params.toString());
  };

  const hasActiveFilters = currentTag || currentSearch;

  const tagOptions: Option<string>[] = [
    { value: "", label: "Все темы", icon: <TagIcon size={14} /> },
    ...tags.map((t) => ({
      value: t.slug,
      label: t.name,
      icon: <TagIcon size={14} />
    }))
  ];

  const sortOptions: Option<string>[] = [
    { value: "publishedAt:desc", label: "Сначала новые", icon: <Calendar size={14} className="text-amber-600" /> },
    { value: "publishedAt:asc", label: "Сначала старые", icon: <Calendar size={14} className="text-amber-400" /> },
  ];

  return (
    <div className="flex flex-col gap-6 mb-12 relative z-30 w-full pointer-events-auto">
      {/* 1. Top Row: Search input */}
      <div className="flex flex-col lg:flex-row gap-4 w-full justify-between items-stretch">
        <form 
          onSubmit={handleSearchSubmit} 
          className="flex-1 max-w-2xl flex bg-white rounded-full p-1 sm:p-1.5 shadow-xs border border-[#1c1c1c]/5 items-center relative transition-all duration-300 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500"
        >
          <div className="pl-3 sm:pl-4 text-[#1c1c1c]/30">
            <Search size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по названию или тексту новости..."
            aria-label="Поиск по новостям"
            className="flex-1 bg-transparent border-none text-[#1c1c1c] text-xs sm:text-sm font-light px-2 sm:px-3 py-2 sm:py-3 outline-hidden focus:ring-0 placeholder:text-[#1c1c1c]/30"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="p-1.5 sm:p-2 text-[#1c1c1c]/40 hover:text-[#1c1c1c] transition-all mr-1 sm:mr-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden rounded-full"
            >
              <X size={14} className="sm:w-[16px] sm:h-[16px]" />
            </button>
          )}
          <button
            type="submit"
            className="bg-[#2e2620] text-white hover:bg-amber-500 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden focus-visible:ring-offset-2"
          >
            Найти
          </button>
        </form>
      </div>

      {/* 2. Bottom Row: Filters & Sort */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white/50 backdrop-blur-md rounded-[2rem] sm:rounded-[2.25rem] p-4 sm:p-6 border border-[#1c1c1c]/5">
        
        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#1c1c1c]/60 font-semibold text-[10px] sm:text-xs uppercase tracking-wider mr-1 sm:mr-2">
            <Filter size={12} className="sm:w-[14px] sm:h-[14px]" /> Фильтры:
          </div>

          {/* Tags Dropdown */}
          <CustomDropdown
            label="Все темы"
            value={currentTag}
            options={tagOptions}
            onChange={handleTagChange}
            icon={<TagIcon size={14} />}
            isMultiple={true}
          />

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 text-amber-600 hover:text-amber-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all px-3 sm:px-4 py-2 sm:py-2.5 rounded-full hover:bg-amber-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden"
            >
              <RotateCcw size={12} className="sm:w-[14px] sm:h-[14px]" /> Сбросить
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-3 shrink-0 justify-between lg:justify-end border-t border-[#1c1c1c]/5 lg:border-none pt-4 lg:pt-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40">Сортировка:</span>
          <CustomDropdown
            label="Сортировка"
            value={currentSort}
            options={sortOptions}
            onChange={handleSortChange}
            icon={<ArrowUpDown size={14} />}
            align="right"
            activeColorClass="border-[#1c1c1c]/20 bg-[#1c1c1c]/5 text-[#1c1c1c]"
          />
        </div>

      </div>
    </div>
  );
}
