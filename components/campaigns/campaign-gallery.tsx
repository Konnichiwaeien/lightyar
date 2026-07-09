"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

interface CampaignGalleryProps {
  images: string[];
  title?: string;
  petName?: string;
  species?: string;
}

export function CampaignGallery({ images, title, petName }: CampaignGalleryProps) {
  const altText = petName || title || "Фото";
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ── Main Image Swiper ── */}
      <div
        className="group relative w-full aspect-[16/10] rounded-[2rem] overflow-hidden bg-stone-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Swiper
          modules={[Navigation, Thumbs, Autoplay]}
          navigation={{
            prevEl: ".campaign-gallery-prev",
            nextEl: ".campaign-gallery-next",
          }}
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={images.length > 1}
          className="h-full w-full"
        >
          {images.map((src, idx) => (
            <SwiperSlide key={idx}>
              <div className="relative h-full w-full">
                <Image
                  src={src}
                  alt={`${altText} — фото ${idx + 1} из ${images.length}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                  priority={idx === 0}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Предыдущее фото"
              className={`campaign-gallery-prev absolute left-4 top-1/2 z-10 -translate-y-1/2
                flex h-10 w-10 items-center justify-center
                rounded-full bg-white/60 backdrop-blur-sm
                text-stone-700 shadow-lg
                transition-all duration-300 cursor-pointer
                hover:bg-white/90 hover:scale-105
                ${isHovered ? "opacity-100" : "opacity-0"}
              `}
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              aria-label="Следующее фото"
              className={`campaign-gallery-next absolute right-4 top-1/2 z-10 -translate-y-1/2
                flex h-10 w-10 items-center justify-center
                rounded-full bg-white/60 backdrop-blur-sm
                text-stone-700 shadow-lg
                transition-all duration-300 cursor-pointer
                hover:bg-white/90 hover:scale-105
                ${isHovered ? "opacity-100" : "opacity-0"}
              `}
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnails Strip ── */}
      {images.length > 1 && (
        <Swiper
          modules={[Thumbs]}
          onSwiper={setThumbsSwiper}
          watchSlidesProgress
          slidesPerView="auto"
          spaceBetween={12}
          className="w-full !overflow-visible"
        >
          {images.map((src, idx) => (
            <SwiperSlide
              key={idx}
              className="!w-20 !h-20 flex-shrink-0 cursor-pointer"
            >
              <div
                className={`
                  relative w-20 h-20 rounded-xl overflow-hidden
                  border-2 transition-all duration-300
                  [.swiper-slide-thumb-active_&]:border-[#f59e0b]
                  [.swiper-slide-thumb-active_&]:shadow-[0_0_0_1px_#f59e0b]
                  border-stone-200/60
                  hover:border-white hover:shadow-md
                `}
              >
                <Image
                  src={src}
                  alt={`Миниатюра ${idx + 1} — ${altText}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
