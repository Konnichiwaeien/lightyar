"use client";

import { useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Thumbs } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ResilientImage } from "@/components/ui/resilient-image";
import "swiper/css";
import "swiper/css/thumbs";
import "swiper/css/a11y";

const MODULES = [A11y, Thumbs];
const LIMIT = 6;

export function CampaignPhotos({ photos, title }: { photos: string[]; title: string }) {
  const list = photos.slice(0, LIMIT);
  const main = useRef<SwiperInstance | null>(null);
  const [thumbs, setThumbs] = useState<SwiperInstance | null>(null);
  const [shown, setShown] = useState(0);
  const still = useReducedMotion();

  if (!list.length) return null;

  return (
    <div className="fund-shots" role="region" aria-label="Фотографии сбора" aria-roledescription="карусель">
      <div className="fund-shots__viewport">
        <div className="fund-shots__stack">
          <Swiper className="fund-shots__main" modules={MODULES} slidesPerView={1}
            speed={still ? 0 : 420} rewind watchOverflow touchAngle={35}
            thumbs={{ swiper: thumbs && !thumbs.destroyed ? thumbs : null, autoScrollOffset: 1 }}
            a11y={{ containerMessage: title, slideLabelMessage: 'Фото {{index}} из {{slidesLength}}' }}
            onSwiper={swiper => { main.current = swiper; }}
            onSlideChange={swiper => setShown(swiper.activeIndex)}>
            {list.map((src, index) => (
              <SwiperSlide className="fund-shots__slide" key={src}>
                {({ isActive, isPrev, isNext }) => (
                  // SSR includes the LCP image; only nearby full-size frames mount after hydration.
                  index === 0 || isActive || isPrev || isNext ? <ResilientImage
                    alt={index === 0 ? title : `${title}: кадр ${index + 1}`}
                    className="fund-shots__img" width={1200} height={1200}
                    fetchPriority={index === 0 ? "high" : "low"}
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 680px) calc(100vw - 40px), (max-width: 1100px) 45vw, 50vw"
                    src={src} /> : null
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        {list.length > 1 && <>
          <motion.button className="fund-shots__arrow fund-shots__arrow--prev" aria-label="Предыдущий кадр"
            whileTap={still ? undefined : { scale: .92 }} onClick={() => main.current?.slidePrev()} type="button">
            <ChevronLeft aria-hidden="true" size={20} />
          </motion.button>
          <span className="fund-shots__count" aria-live="polite" aria-atomic="true">
            {shown + 1} <i aria-hidden="true">/</i> {list.length}
          </span>
          <motion.button className="fund-shots__arrow fund-shots__arrow--next" aria-label="Следующий кадр"
            whileTap={still ? undefined : { scale: .92 }} onClick={() => main.current?.slideNext()} type="button">
            <ChevronRight aria-hidden="true" size={20} />
          </motion.button>
        </>}
      </div>
      {list.length > 1 && <div className="fund-shots__thumbs" role="group" aria-label="Выбрать фотографию"
        style={{ '--thumb-count': list.length } as CSSProperties}>
        <Swiper className="fund-shots__thumb-rail" onSwiper={setThumbs}
          slidesPerView="auto" spaceBetween={8} watchSlidesProgress watchOverflow touchAngle={35}>
          {list.map((src, index) => <SwiperSlide key={src}>
            <button type="button" className="fund-shots__thumb" aria-label={`Показать фото ${index + 1}`}
              aria-pressed={shown === index} onClick={() => main.current?.slideTo(index)}>
              <ResilientImage src={src} alt="" width={120} height={90} sizes="80px" loading="lazy" />
            </button>
          </SwiperSlide>)}
        </Swiper>
      </div>}
    </div>
  );
}
