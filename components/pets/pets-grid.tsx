"use client";

import { PawPrint, Heart } from "lucide-react";
import { MappedPet } from "@/lib/helpers/pets/normalize-pet-data";
import { PetCard } from "./pet-card";
import { AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export interface PetsGridProps {
  pets: MappedPet[];
}

export function PetsGrid({ pets }: PetsGridProps) {
  const searchParams = useSearchParams();
  const isFavoritesActive = searchParams.get("favorites") === "true";
  const [localFavorites, setLocalFavorites] = useState<string[]>([]);

  useEffect(() => {
    const updateFavs = () => {
      if (typeof window !== "undefined") {
        const favs = JSON.parse(localStorage.getItem("pet-favorites") || "[]");
        setLocalFavorites(favs);
      }
    };
    updateFavs();
    window.addEventListener("favorites-changed", updateFavs);
    return () => window.removeEventListener("favorites-changed", updateFavs);
  }, []);

  const displayedPets = isFavoritesActive
    ? pets.filter((pet) => localFavorites.includes(pet.id))
    : pets;

  return (
    <ul 
      aria-label="Список подопечных приюта"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start list-none p-0 m-0 relative min-h-[400px] [&>li]:[content-visibility:auto] [&>li]:[contain-intrinsic-size:auto_420px]"
    >
      <AnimatePresence mode="popLayout">
        {displayedPets.length > 0 ? (
          displayedPets.map((pet, index) => {
            // Bento visual style: 1st (index 0) and 6th (index 5) elements are wider (colspan-2)
            const isLarge = index === 0 || index === 5;
            return <PetCard key={pet.id} pet={pet} isLarge={isLarge} index={index} />;
          })
        ) : (
          <li key="empty-state" className="col-span-full py-24 text-center w-full list-none">
            <span className="inline-block p-6 bg-white rounded-full mx-auto mb-6">
              {isFavoritesActive ? (
                <Heart size={48} className="text-rose-500/20" fill="currentColor" />
              ) : (
                <PawPrint size={48} className="text-[#1c1c1c]/10" />
              )}
            </span>
            <h3 className="text-2xl font-serif text-[#1c1c1c] mb-2">
              {isFavoritesActive ? "Любимчиков пока нет" : "Питомцев не найдено"}
            </h3>
            <p className="text-[#1c1c1c]/50">
              {isFavoritesActive 
                ? "Добавьте понравившихся питомцев, нажав на сердечко на карточке." 
                : "Попробуйте изменить параметры фильтрации."}
            </p>
          </li>
        )}
      </AnimatePresence>
    </ul>
  );
}
