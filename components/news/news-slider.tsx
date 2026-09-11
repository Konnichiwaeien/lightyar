"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";

import type { NewsSlide } from "@/lib/news/news-media";

import "swiper/css";
import "swiper/css/navigation";
import "./news-slider.css";

interface NewsSliderProps {
  items: NewsSlide[];
  title: string;
}

export function NewsSlider({ items, title }: NewsSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const showControls = items.length > 1;
  const hasVideo = items.some((item) => item.kind === "video");
  const shouldAutoplay = showControls && !hasVideo && !prefersReducedMotion;

  const pauseMedia = () => {
    rootRef.current
      ?.querySelectorAll<HTMLMediaElement>("video, audio")
      .forEach((media) => media.pause());
  };

  if (items.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className="news-slider-shell group/slider pointer-events-auto relative mb-12 aspect-video w-full overflow-hidden rounded-[2rem] border border-[#1c1c1c]/5 bg-[#111] shadow-[0_12px_40px_rgb(0,0,0,0.03)]"
    >
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation={showControls ? {
          prevEl: ".swiper-button-prev-custom",
          nextEl: ".swiper-button-next-custom",
        } : false}
        autoplay={shouldAutoplay ? {
          delay: 5000,
          disableOnInteraction: false,
        } : false}
        loop={showControls && !hasVideo}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          pauseMedia();
          setActiveIndex(swiper.realIndex);
        }}
        onBeforeDestroy={pauseMedia}
        className="news-slider h-full w-full"
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.key} className="relative h-full w-full">
            {item.kind === "image" ? (
              <Image
                src={item.src}
                alt={item.alt}
                fill
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1400px) 80vw, 800px"
              />
            ) : item.src ? (
              <video
                className="swiper-no-swiping h-full w-full bg-black object-contain"
                controls
                playsInline
                preload="none"
                poster={item.poster}
                aria-label={item.title}
              >
                <source src={item.src} type={item.mime} />
                {item.captionsSrc && (
                  <track
                    src={item.captionsSrc}
                    kind="captions"
                    srcLang="ru"
                    label="Русские субтитры"
                  />
                )}
                Ваш браузер не поддерживает видео. Если источник доступен,
                воспользуйтесь ссылкой под медиаматериалами.
              </video>
            ) : (
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1c1c1c]">
                {item.poster && (
                  <Image
                    src={item.poster}
                    alt=""
                    fill
                    loading="lazy"
                    className="object-cover opacity-75"
                    sizes="(max-width: 768px) 100vw, (max-width: 1400px) 80vw, 800px"
                  />
                )}
                <div className="absolute inset-0 bg-black/30" />
                {item.externalUrl && (
                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="swiper-no-swiping relative z-10 flex max-w-[80%] flex-col items-center gap-4 text-center text-white transition-transform duration-300 hover:scale-[1.03] focus-visible:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-amber-400 motion-reduce:transition-none motion-reduce:hover:scale-100"
                    aria-label={`Открыть видео «${item.title}» в новом окне`}
                  >
                    <span className="flex size-16 items-center justify-center rounded-full bg-amber-500 shadow-lg sm:size-20">
                      <Play className="ml-1 size-7 fill-current sm:size-9" aria-hidden="true" />
                    </span>
                    <span className="flex items-center gap-2 text-sm font-semibold sm:text-base">
                      {item.title}
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </span>
                  </a>
                )}
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {showControls && (
        <>
          <button
            type="button"
            aria-label={`Предыдущий медиаматериал: ${title}`}
            className="swiper-button-prev-custom absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-[#1c1c1c] opacity-100 shadow-md transition-[color,background-color,opacity,translate,scale,rotate] duration-300 hover:bg-amber-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 motion-reduce:transition-none md:left-6 md:size-12 md:opacity-0 md:group-hover/slider:opacity-100 md:focus-visible:opacity-100"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Следующий медиаматериал: ${title}`}
            className="swiper-button-next-custom absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-[#1c1c1c] opacity-100 shadow-md transition-[color,background-color,opacity,translate,scale,rotate] duration-300 hover:bg-amber-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 motion-reduce:transition-none md:right-6 md:size-12 md:opacity-0 md:group-hover/slider:opacity-100 md:focus-visible:opacity-100"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>

          <div
            className="swiper-pagination"
            role="group"
            aria-label="Выбор медиаматериала"
          >
            {items.map((item, index) => (
              <button
                key={`pagination:${item.key}`}
                type="button"
                className={`swiper-pagination-bullet${activeIndex === index ? " swiper-pagination-bullet-active" : ""}`}
                aria-label={`Показать медиаматериал ${index + 1} из ${items.length}`}
                aria-current={activeIndex === index ? "true" : undefined}
                onClick={() => swiperRef.current?.slideToLoop(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default NewsSlider;
