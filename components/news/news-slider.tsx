"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface NewsSliderProps {
  images: string[];
  title: string;
}

export function NewsSlider({ images, title }: NewsSliderProps) {
  const showControls = images.length > 1;

  return (
    <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden shadow-[0_12px_40px_rgb(0,0,0,0.03)] border border-[#1c1c1c]/5 bg-white mb-12 group/slider pointer-events-auto">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={showControls ? {
          prevEl: ".swiper-button-prev-custom",
          nextEl: ".swiper-button-next-custom",
        } : false}
        pagination={showControls ? {
          clickable: true,
          el: ".swiper-pagination-custom",
          bulletClass: "inline-block w-2 h-2 rounded-full bg-[#1c1c1c]/20 mx-1 transition-all duration-300 cursor-pointer hover:bg-amber-500/50",
          bulletActiveClass: "!bg-amber-500 !w-5",
        } : false}
        autoplay={showControls ? {
          delay: 5000,
          disableOnInteraction: false,
        } : false}
        loop={showControls}
        className="w-full h-full"
      >
        {images.map((img, idx) => (
          <SwiperSlide key={idx} className="relative w-full h-full">
            <Image
              src={img}
              alt={`${title} - Фото ${idx + 1}`}
              fill
              priority={idx === 0}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1400px) 80vw, 800px"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation */}
      {showControls && (
        <>
          <button className="swiper-button-prev-custom absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/95 text-[#1c1c1c] hover:bg-amber-500 hover:text-white transition-all duration-300 shadow-md cursor-pointer opacity-0 group-hover/slider:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden">
            <ChevronLeft size={20} />
          </button>
          <button className="swiper-button-next-custom absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/95 text-[#1c1c1c] hover:bg-amber-500 hover:text-white transition-all duration-300 shadow-md cursor-pointer opacity-0 group-hover/slider:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden">
            <ChevronRight size={20} />
          </button>
          
          {/* Custom Pagination Container Wrapper */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-white/20 pointer-events-auto">
            <div className="swiper-pagination-custom flex items-center justify-center !static !w-auto !inset-auto !transform-none" />
          </div>
        </>
      )}
    </div>
  );
}
export default NewsSlider;
