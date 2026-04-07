"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  images: string[];
}

export function CampaignGallery({ images }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="flex flex-col gap-4 w-full pointer-events-auto">
      {/* Main Image */}
      <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden bg-[#1c1c1c]/5">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Фотография ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative aspect-square md:aspect-[4/3] rounded-[1rem] overflow-hidden transition-all duration-300 ${
                currentIndex === idx ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-[#e8e4dc]" : "opacity-60 hover:opacity-100"
              }`}
            >
              <img src={img} alt={`Миниатюра ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
