"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Выпадающий список в стиле панелей каталога: белая пилюля, капитель, значок
 * у каждого пункта. Раньше жил внутри панели питомцев; вынесен сюда, когда
 * та же сортировка понадобилась каталогу сборов. Один компонент на оба
 * каталога, чтобы они не разъехались по виду.
 */

export interface DropdownOption<T> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps<T> {
  label: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  icon: React.ReactNode;
  activeColorClass?: string;
  align?: "left" | "right";
}

export function CustomDropdown<T extends string>({
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

  // Фокус идёт за клавиатурой: стрелки меняют индекс, индекс двигает фокус.
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  const hasValueSelected = value !== "" && value !== undefined;

  // Идентификатор из подписи, чтобы кнопка и список были связаны для читалки.
  const dropdownId = label.toLowerCase().replace(/[^a-zа-я0-9]+/g, "-");

  const toggleDropdown = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      const selectedIdx = options.findIndex((opt) => opt.value === value);
      setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0);
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
      setFocusedIndex((index + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((index - 1 + options.length) % options.length);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "Tab") {
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
          className={`text-current/60 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
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
                    triggerRef.current?.focus();
                  }}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  tabIndex={0}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer outline-none ${
                    isSelected
                      ? "bg-amber-500/10 text-amber-900"
                      : "text-[#1c1c1c]/70 hover:bg-[#1c1c1c]/3 hover:text-[#1c1c1c]"
                  } ${isFocused ? "ring-2 ring-amber-500/50 bg-amber-500/5" : ""}`}
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
