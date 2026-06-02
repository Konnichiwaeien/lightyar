"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Dog, Cat } from "lucide-react";

interface Props {
  images: string[];
  petName?: string;
  species?: string;
}

export function CampaignGallery({ images, petName, species }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasImages = images && images.length > 0;

  return (
    <div className="flex flex-col gap-4 w-full pointer-events-auto">
      {/* Main Image */}
      <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden bg-[#1c1c1c]/5">
        {hasImages ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={images[currentIndex]}
                alt={petName && species 
                  ? `Фотография питомца ${petName} (${species.toLowerCase()}) в приюте «Светлый» — кадр ${currentIndex + 1} из ${images.length}`
                  : `Фотография галереи — кадр ${currentIndex + 1} из ${images.length}`
                }
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
                priority={currentIndex === 0}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 bg-[#f4ece1] flex flex-col items-center justify-center text-amber-600/70 p-8 select-none">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xs mb-4 text-amber-500/80">
              {species === "Собака" ? <Dog size={36} strokeWidth={1.5} /> : <Cat size={36} strokeWidth={1.5} />}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#1c1c1c]/40 text-center">Фотография питомца скоро появится</span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <ul className="grid grid-cols-4 gap-4" role="list">
          {images.map((img, idx) => (
            <li key={idx}>
              <button
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Просмотреть фотографию ${idx + 1}`}
                aria-pressed={currentIndex === idx}
                className={`relative w-full aspect-square md:aspect-[4/3] rounded-[1rem] overflow-hidden transition-all duration-300 cursor-pointer block focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
                  currentIndex === idx ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-[#e8e4dc] opacity-100" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image 
                  src={img} 
                  alt={petName 
                    ? `Миниатюра фото ${idx + 1} питомца ${petName}`
                    : `Миниатюра фото ${idx + 1}`
                  } 
                  fill 
                  sizes="(max-width: 1024px) 25vw, 15vw" 
                  className="object-cover" 
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


