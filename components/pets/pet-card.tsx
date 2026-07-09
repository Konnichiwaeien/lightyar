"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Home, Mars, PawPrint, Venus, Heart, Info, X, Sparkles, Dog, Cat, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { MappedPet } from "@/lib/helpers/pets/normalize-pet-data";
import { formatAge } from "@/lib/helpers/pets/format-age";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getBreedInfo } from "@/lib/helpers/pets/breed-database";

export interface PetCardProps {
  pet: MappedPet;
  isLarge?: boolean;
  index?: number;
}

export function PetCard({ pet, isLarge = false, index = 0 }: PetCardProps) {
  const colSpanClass = isLarge ? "sm:col-span-2 lg:col-span-2" : "col-span-1";
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showBreedTooltip, setShowBreedTooltip] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  const toggleBreedTooltip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBreedTooltip(!showBreedTooltip);
  };

  const breedInfo = getBreedInfo(pet.breed);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (showBreedTooltip && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showBreedTooltip, isMobile]);

  useEffect(() => {
    const checkFav = () => {
      if (typeof window !== "undefined") {
        const favs = JSON.parse(localStorage.getItem("pet-favorites") || "[]");
        setIsFavorite(favs.includes(pet.id));
      }
    };
    checkFav();
    window.addEventListener("favorites-changed", checkFav);
    return () => window.removeEventListener("favorites-changed", checkFav);
  }, [pet.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const favs = JSON.parse(localStorage.getItem("pet-favorites") || "[]");
      let newFavs;
      if (favs.includes(pet.id)) {
        newFavs = favs.filter((id: string) => id !== pet.id);
      } else {
        newFavs = [...favs, pet.id];
      }
      localStorage.setItem("pet-favorites", JSON.stringify(newFavs));
      window.dispatchEvent(new Event("favorites-changed"));
    }
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
         opacity: { duration: 0.3, delay: Math.min(index * 0.04, 0.3) },
         y: { type: "spring", stiffness: 120, damping: 16, delay: Math.min(index * 0.04, 0.3) },
         layout: { type: "spring", stiffness: 300, damping: 30 } 
      }}
      className={`${colSpanClass} h-full list-none card-lazy ${showBreedTooltip ? "relative z-40" : ""}`}
    >
      <Link
        href={`/pets/${pet.id}`}
        className="group relative bg-white border border-[#1c1c1c]/5 rounded-[2rem] flex flex-col shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 pointer-events-auto h-full min-h-[440px] cursor-pointer w-full"
        id={`pet-card-${pet.id}`}
      >
        <article className="h-full flex flex-col justify-between flex-1">
          <figure 
            className={`w-full ${isLarge ? 'h-96 sm:h-72' : 'h-72 sm:h-56'} shrink-0 overflow-hidden rounded-[2rem] relative select-none`}
            onMouseLeave={() => setActivePhotoIndex(0)}
          >
            {/* Carousel Images with absolute transition crossfade or beautiful styled placeholder */}
            {!pet.image ? (
              <div className="absolute inset-0 w-full h-full bg-[#f4ece1] flex flex-col items-center justify-center text-amber-600/70 p-6 select-none">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xs mb-3 text-amber-500/80">
                  {pet.species === "Собака" ? <Dog size={24} strokeWidth={1.5} /> : <Cat size={24} strokeWidth={1.5} />}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 text-center">Фото скоро появится</span>
              </div>
            ) : (
              <div
                className="absolute inset-0 w-full h-full"
                onTouchStart={(e) => {
                  setTouchStartX(e.targetTouches[0].clientX);
                }}
                onTouchEnd={(e) => {
                  const touchEndX = e.changedTouches[0].clientX;
                  const diff = touchStartX - touchEndX;
                  if (!pet.images || pet.images.length <= 1) return;
                  
                  if (diff > 40) {
                    // Swiped left -> next photo
                    setActivePhotoIndex((prev) => (prev + 1) % pet.images.length);
                  } else if (diff < -40) {
                    // Swiped right -> prev photo
                    setActivePhotoIndex((prev) => (prev - 1 + pet.images.length) % pet.images.length);
                  }
                }}
              >
                <Image
                  src={pet.images?.[activePhotoIndex] || pet.image}
                  alt={`Фотография питомца ${pet.name} — порода ${pet.breed.toLowerCase()}, ${pet.gender.toLowerCase()}, статус: ${pet.status === 'home' ? 'обрел дом' : 'ищет любящую семью'}`}
                  fill
                  sizes={isLarge ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
                  className={`object-cover transition-transform duration-1000 ${pet.status === 'home' ? 'grayscale-[30%] opacity-80' : 'group-hover:scale-105'}`}
                  priority={isLarge}
                />
              </div>
            )}

            {/* Stories-style translucent indicator bars */}
            {pet.images && pet.images.length > 1 && (
              <div className="absolute top-2 left-4 right-4 z-20 flex gap-1.5 px-0.5 pointer-events-none">
                {pet.images.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-1 flex-1 rounded-full overflow-hidden bg-black/15 backdrop-blur-xs"
                  >
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor: idx === activePhotoIndex ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.35)"
                      }}
                      transition={{ duration: 0.15 }}
                      className="h-full w-full"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Top Badge Row - Grouped at top-left with premium icons */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5 pointer-events-none">
              {/* Tag Badge */}
              <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-[#1c1c1c] flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-black/5">
                {pet.tag === "Дома" ? (
                  <Home size={11} className="text-emerald-500 shrink-0" />
                ) : pet.tag === "Новенький" ? (
                  <Sparkles size={11} className="text-amber-500 shrink-0" />
                ) : pet.tag === "Срочно" ? (
                  <Flame size={11} className="text-rose-500 fill-rose-500 animate-pulse shrink-0" />
                ) : (
                  <Heart size={11} className="text-rose-500 shrink-0" />
                )}
                <span>{pet.tag}</span>
              </div>

              {/* Species Badge */}
              <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-[#1c1c1c]/60 flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-black/5">
                {pet.species === "Собака" ? (
                  <Dog size={11} className="text-[#1c1c1c]/50 shrink-0" />
                ) : (
                  <Cat size={11} className="text-[#1c1c1c]/50 shrink-0" />
                )}
                <span>{pet.species}</span>
              </div>
            </div>

            {/* Favorites Heart Button with bounce micro-animation */}
            <motion.button
              type="button"
              onClick={toggleFavorite}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 12 }}
              className="absolute top-4 right-4 bg-white/95 hover:bg-white backdrop-blur-md w-8 h-8 rounded-full flex items-center justify-center shadow-sm z-30 text-[#1c1c1c]/50 hover:text-rose-500 transition-all duration-300 pointer-events-auto cursor-pointer border-none"
              aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
            >
              <motion.div
                key={isFavorite ? "fav" : "not-fav"}
                initial={{ scale: 0.85 }}
                animate={isFavorite ? { scale: [1, 1.45, 0.85, 1.2, 1], rotate: [0, 15, -15, 5, 0] } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <Heart 
                  size={15} 
                  fill={isFavorite ? "currentColor" : "none"} 
                  className={`transition-colors duration-300 ${isFavorite ? "text-rose-500" : "text-[#1c1c1c]/40 group-hover:text-rose-500"}`} 
                />
              </motion.div>
            </motion.button>

            {/* Left and Right Chevron navigation buttons for easy tapping on mobile, visible on hover on desktop */}
            {pet.images && pet.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActivePhotoIndex((prev) => (prev - 1 + pet.images.length) % pet.images.length);
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/75 hover:bg-white text-[#1c1c1c]/70 hover:text-black flex items-center justify-center shadow-md z-30 transition-all pointer-events-auto border border-black/5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                  aria-label="Предыдущее фото"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActivePhotoIndex((prev) => (prev + 1) % pet.images.length);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/75 hover:bg-white text-[#1c1c1c]/70 hover:text-black flex items-center justify-center shadow-md z-30 transition-all pointer-events-auto border border-black/5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                  aria-label="Следующее фото"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* Invisible segment zones for hover switching (desktop only) */}
            {pet.images && pet.images.length > 1 && !isMobile && (
              <div 
                className="absolute inset-0 z-10 flex cursor-pointer select-none"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {pet.images.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-full flex-1"
                    onMouseEnter={() => setActivePhotoIndex(idx)}
                  />
                ))}
              </div>
            )}
          </figure>

          <div className="p-4 sm:p-6 md:p-8 flex flex-col flex-1 bg-white rounded-b-[2rem] relative z-10 w-full h-full justify-between">
            <div className="mb-6">
              <h2 className={`font-serif leading-tight mb-2 text-[#1c1c1c] ${pet.status === 'home' ? 'text-black/60' : 'group-hover:text-amber-500'} transition-colors duration-300 ${isLarge ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-lg sm:text-xl md:text-2xl'}`}>
                {pet.name}
              </h2>
              
              <div className="flex flex-wrap gap-1.5 mb-3">
                {/* Age Badge */}
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50/70 border border-amber-500/10 px-3 py-1 rounded-full transition-all shrink-0">
                  <Calendar size={11} className="shrink-0" />
                  {formatAge(pet.age)}
                </span>
                
                {/* Gender Badge */}
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border transition-all shrink-0 ${
                  pet.gender === "Мальчик" 
                    ? "text-blue-600 bg-blue-50/70 border-blue-500/10" 
                    : "text-rose-600 bg-rose-50/70 border-rose-500/10"
                }`}>
                  {pet.gender === "Мальчик" ? (
                    <Mars size={11} className="shrink-0 text-blue-500" />
                  ) : (
                    <Venus size={11} className="shrink-0 text-rose-500" />
                  )}
                  {pet.gender}
                </span>

                {/* Breed Badge (Static) */}
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#b45309] bg-[#fef3c7] border border-[#f59e0b]/20 px-3 py-1 rounded-full shrink-0">
                  <PawPrint size={11} className="shrink-0 text-[#d97706]" />
                  <span className="truncate inline-block max-w-[130px]">{pet.breed}</span>
                </span>

                {/* Color Badge (Окрас) */}
                {pet.colorName && (
                  <span 
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/50 bg-[#1c1c1c]/4 border border-[#1c1c1c]/5 px-3 py-1 rounded-full transition-all shrink-0 max-w-[200px] overflow-hidden"
                    title={pet.colorName}
                  >
                    {pet.colorHex ? (
                      <span 
                        className="w-2 h-2 rounded-full border border-black/10 shrink-0" 
                        style={{ backgroundColor: pet.colorHex }}
                      />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-300 border border-black/10 shrink-0" />
                    )}
                    <span className="truncate inline-block max-w-[150px]">{pet.colorName}</span>
                  </span>
                )}
              </div>

              <p className={`text-[#1c1c1c]/50 text-sm font-light ${isLarge ? 'line-clamp-3' : 'line-clamp-2'}`}>
                {pet.description}
              </p>
            </div>

            {/* Bottom Action */}
            <div className="mt-auto pt-4 border-t border-[#1c1c1c]/5 flex items-stretch gap-2 relative">
              {pet.status === 'shelter' ? (
                <div className="flex-1 bg-[#2e2620] hover:bg-amber-500 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-colors flex items-center justify-center gap-2">
                  <PawPrint size={16} /> Познакомиться
                </div>
              ) : (
                <div className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-100 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center gap-2">
                  <Home size={16} /> Дома
                </div>
              )}

              {/* Interactive Breed Info Button */}
              <div className="relative shrink-0 z-30 flex items-stretch">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleBreedTooltip(e);
                  }}
                  className="h-full w-12 bg-transparent hover:bg-amber-50/50 text-amber-700 hover:text-amber-800 border border-amber-500/25 hover:border-amber-500/50 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer outline-none group/breed"
                  title={`Нажмите для просмотра справки о породе ${breedInfo.name}`}
                >
                  <Info size={18} className="shrink-0 text-[#d97706] group-hover:text-amber-600 transition-colors animate-pulse" />
                </button>

                <AnimatePresence>
                  {showBreedTooltip && (
                    <>
                      {/* Dimmer backdrop listener to close tooltip on outer click */}
                      <div 
                        className={`fixed inset-0 z-40 ${isMobile ? "bg-[#1c1c1c]/30 backdrop-blur-xs" : "bg-transparent"} cursor-default`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowBreedTooltip(false);
                        }}
                      />
                      
                      {isMounted && isMobile ? (
                        createPortal(
                          <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 320, damping: 28 }}
                            className="fixed bottom-0 left-0 right-0 z-50 w-full max-h-[85vh] overflow-y-auto bg-white border-t border-[#1c1c1c]/10 rounded-t-[2.5rem] p-6 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] text-left cursor-default pointer-events-auto"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            {/* Bottom sheet drag handle indicator */}
                            <div className="w-12 h-1.5 bg-[#1c1c1c]/10 rounded-full mx-auto mb-5" />

                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1c1c1c]/5">
                              <span className="text-[11px] font-extrabold text-[#d97706] uppercase tracking-widest flex items-center gap-1.5">
                                <Sparkles size={12} className="animate-pulse" /> Справка о породе
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setShowBreedTooltip(false);
                                }}
                                className="text-black/40 hover:text-black p-2 hover:bg-black/5 rounded-full transition-colors cursor-pointer border-none flex items-center justify-center"
                                aria-label="Закрыть"
                              >
                                <X size={20} />
                              </button>
                            </div>

                            <h4 className="font-serif text-2xl text-[#1c1c1c] mb-3 leading-tight font-medium">
                              {breedInfo.name}
                            </h4>

                            <p className="text-[#1c1c1c]/70 text-sm font-light leading-relaxed mb-6">
                              {breedInfo.description}
                            </p>

                            {/* Stats ratings */}
                            <div className="space-y-4 border-t border-[#1c1c1c]/5 pt-5 mb-6">
                              {/* Activity */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-semibold text-[#1c1c1c]/80">
                                  <span>Активность</span>
                                  <span className="text-[#d97706] font-bold">{breedInfo.stats.activity} / 5</span>
                                </div>
                                <div className="w-full h-2.5 bg-[#1c1c1c]/5 rounded-full overflow-hidden relative">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(breedInfo.stats.activity / 5) * 100}%` }}
                                    transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.05 }}
                                    className="absolute inset-y-0 left-0 bg-linear-to-r from-amber-400 to-[#d97706] rounded-full"
                                  />
                                </div>
                              </div>

                              {/* Friendliness */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-semibold text-[#1c1c1c]/80">
                                  <span>Дружелюбие</span>
                                  <span className="text-rose-500 font-bold">{breedInfo.stats.friendliness} / 5</span>
                                </div>
                                <div className="w-full h-2.5 bg-[#1c1c1c]/5 rounded-full overflow-hidden relative">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(breedInfo.stats.friendliness / 5) * 100}%` }}
                                    transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.15 }}
                                    className="absolute inset-y-0 left-0 bg-linear-to-r from-rose-400 to-rose-500 rounded-full"
                                  />
                                </div>
                              </div>

                              {/* Care Needs */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-semibold text-[#1c1c1c]/80">
                                  <span>Сложность ухода</span>
                                  <span className="text-blue-500 font-bold">{breedInfo.stats.careNeeds} / 5</span>
                                </div>
                                <div className="w-full h-2.5 bg-[#1c1c1c]/5 rounded-full overflow-hidden relative">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(breedInfo.stats.careNeeds / 5) * 100}%` }}
                                    transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.25 }}
                                    className="absolute inset-y-0 left-0 bg-linear-to-r from-blue-400 to-blue-500 rounded-full"
                                  />
                                </div>
                              </div>

                              {/* Trainability */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-semibold text-[#1c1c1c]/80">
                                  <span>Обучаемость</span>
                                  <span className="text-emerald-500 font-bold">{breedInfo.stats.trainability} / 5</span>
                                </div>
                                <div className="w-full h-2.5 bg-[#1c1c1c]/5 rounded-full overflow-hidden relative">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(breedInfo.stats.trainability / 5) * 100}%` }}
                                    transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.35 }}
                                    className="absolute inset-y-0 left-0 bg-linear-to-r from-emerald-400 to-emerald-500 rounded-full"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Breed Tips */}
                            <div className="bg-amber-50/50 border border-amber-500/10 rounded-2xl p-5">
                              <span className="text-[10px] font-bold text-[#b45309] uppercase tracking-widest block mb-2.5">Совет по содержанию:</span>
                              <ul className="space-y-2">
                                {breedInfo.tips.map((tip, idx) => (
                                  <li key={idx} className="text-xs text-[#1c1c1c]/70 font-light leading-relaxed flex items-start gap-2">
                                    <span className="text-[#d97706] select-none shrink-0">•</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>,
                          document.body
                        )
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.92, y: 12 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.92, y: 12 }}
                          transition={{ type: "spring", stiffness: 450, damping: 26 }}
                          className="absolute bottom-full right-0 mb-3.5 z-50 w-72 md:w-80 bg-white border border-[#1c1c1c]/10 rounded-2xl p-5 shadow-[0_15px_40px_rgba(0,0,0,0.12)] text-left cursor-default pointer-events-auto"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          {/* Symmetrical downward arrow indicator */}
                          <div className="absolute top-full right-[18px] -mt-1.5 w-3 h-3 bg-white border-r border-b border-[#1c1c1c]/10 rotate-45" />

                          <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#1c1c1c]/5">
                            <span className="text-[9px] font-extrabold text-[#d97706] uppercase tracking-widest flex items-center gap-1">
                              <Sparkles size={10} className="animate-pulse" /> Справка о породе
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowBreedTooltip(false);
                              }}
                              className="text-black/30 hover:text-black p-0.5 hover:bg-black/5 rounded-full transition-colors cursor-pointer border-none flex items-center justify-center"
                              aria-label="Закрыть"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          <h4 className="font-serif text-base text-[#1c1c1c] mb-1.5 leading-tight font-medium">
                            {breedInfo.name}
                          </h4>

                          <p className="text-[#1c1c1c]/60 text-xs font-light leading-relaxed mb-4">
                            {breedInfo.description}
                          </p>

                          {/* Stats ratings */}
                          <div className="space-y-3.5 border-t border-[#1c1c1c]/5 pt-4 mb-4">
                            {/* Activity */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[11px] font-semibold text-[#1c1c1c]/70">
                                <span>Активность</span>
                                <span className="text-[#d97706] font-bold">{breedInfo.stats.activity} / 5</span>
                              </div>
                              <div className="w-full h-2 bg-[#1c1c1c]/5 rounded-full overflow-hidden relative">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(breedInfo.stats.activity / 5) * 100}%` }}
                                  transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.05 }}
                                  className="absolute inset-y-0 left-0 bg-linear-to-r from-amber-400 to-[#d97706] rounded-full"
                                />
                              </div>
                            </div>

                            {/* Friendliness */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[11px] font-semibold text-[#1c1c1c]/70">
                                <span>Дружелюбие</span>
                                <span className="text-rose-500 font-bold">{breedInfo.stats.friendliness} / 5</span>
                              </div>
                              <div className="w-full h-2 bg-[#1c1c1c]/5 rounded-full overflow-hidden relative">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(breedInfo.stats.friendliness / 5) * 100}%` }}
                                  transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.15 }}
                                  className="absolute inset-y-0 left-0 bg-linear-to-r from-rose-400 to-rose-500 rounded-full"
                                />
                              </div>
                            </div>

                            {/* Care Needs */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[11px] font-semibold text-[#1c1c1c]/70">
                                <span>Сложность ухода</span>
                                <span className="text-blue-500 font-bold">{breedInfo.stats.careNeeds} / 5</span>
                              </div>
                              <div className="w-full h-2 bg-[#1c1c1c]/5 rounded-full overflow-hidden relative">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(breedInfo.stats.careNeeds / 5) * 100}%` }}
                                  transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.25 }}
                                  className="absolute inset-y-0 left-0 bg-linear-to-r from-blue-400 to-blue-500 rounded-full"
                                />
                              </div>
                            </div>

                            {/* Trainability */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[11px] font-semibold text-[#1c1c1c]/70">
                                <span>Обучаемость</span>
                                <span className="text-emerald-500 font-bold">{breedInfo.stats.trainability} / 5</span>
                              </div>
                              <div className="w-full h-2 bg-[#1c1c1c]/5 rounded-full overflow-hidden relative">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(breedInfo.stats.trainability / 5) * 100}%` }}
                                  transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.35 }}
                                  className="absolute inset-y-0 left-0 bg-linear-to-r from-emerald-400 to-emerald-500 rounded-full"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Breed Tips */}
                          <div className="bg-amber-50/50 border border-amber-500/10 rounded-xl p-3">
                            <span className="text-[8px] font-bold text-[#b45309] uppercase tracking-widest block mb-1">Совет по содержанию:</span>
                            <ul className="space-y-1">
                              {breedInfo.tips.map((tip, idx) => (
                                <li key={idx} className="text-[10px] text-[#1c1c1c]/70 font-light leading-snug flex items-start gap-1">
                                  <span className="text-[#d97706] select-none">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.li>
  );
}
