"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Gift, HandHeart, Info, ChevronLeft, ChevronRight, CircleDollarSign } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import { GiftOrderModal } from "@/components/wishlist/gift-order-modal";
import type { WishlistItem, WishlistSettings } from "@/lib/api/services/wishlist";
import "swiper/css";
import "swiper/css/navigation";
import "./needs-section.css";

const price = (value: number) =>
  `~${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value)} ₽`;

export function NeedsSection({
  items = [],
  settings = { marketplaceName: "Ozon" },
}: {
  items?: WishlistItem[];
  settings?: WishlistSettings;
}) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [active, setActive] = useState<WishlistItem | null>(null);
  // стрелки гаснут на краях: кнопка, которая ничего не делает, врёт о своей роли
  const [edges, setEdges] = useState({ start: true, end: false });

  const syncEdges = (instance: SwiperClass) =>
    setEdges({ start: instance.isBeginning, end: instance.isEnd });

  // если CMS недоступна, секция молча исчезает: пустой вишлист хуже отсутствующего
  if (items.length === 0) return null;

  return (
    <section className="wishlist" id="needs">
      <div className="wishlist-inner">
        <div className="wishlist-head">
          <h2>
            <span className="wishlist-mark" aria-hidden="true">
              <Gift size={26} />
            </span>
            Вишлист
          </h2>
          <div className="wishlist-nav">
            <button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              disabled={edges.start}
              aria-label="Предыдущие позиции"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              disabled={edges.end}
              aria-label="Следующие позиции"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        <p className="wishlist-lead">
          Это то, что нужно приюту прямо сейчас. Вы заказываете покупку на маркетплейсе с доставкой в наш пункт
          выдачи — мы забираем и показываем в отчёте.
        </p>

        <Swiper
          modules={[Navigation, A11y]}
          onSwiper={(instance) => {
            swiperRef.current = instance;
            syncEdges(instance);
          }}
          onSlideChange={syncEdges}
          onResize={syncEdges}
          spaceBetween={24}
          slidesPerView={1.15}
          breakpoints={{
            560: { slidesPerView: 2.1 },
            900: { slidesPerView: 3.1 },
            1200: { slidesPerView: 4 },
          }}
          a11y={{ prevSlideMessage: "Предыдущие позиции", nextSlideMessage: "Следующие позиции" }}
          className="wishlist-track"
        >
          {items.map((item) => (
            <SwiperSlide key={item.documentId} className="wishlist-card">
              <div className="wishlist-card__media">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 700px) 80vw, 300px"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <span className="wishlist-card__placeholder" aria-hidden="true">
                    <Gift size={40} />
                  </span>
                )}
                {item.urgent ? <span className="wishlist-urgent">Срочно</span> : null}
              </div>

              <div className="wishlist-card__title">
                <b>{item.title}</b>
                {item.approxPrice !== undefined ? (
                  <span className="wishlist-price">
                    {price(item.approxPrice)}
                    {item.note ? (
                      <span className="wishlist-info" title={item.note}>
                        <Info size={14} aria-hidden="true" />
                        <span className="sr-only">{item.note}</span>
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </div>

              {item.brand || item.specs ? (
                <p className="wishlist-specs">{[item.brand, item.specs].filter(Boolean).join(", ")}</p>
              ) : null}

              <button type="button" className="wishlist-btn" onClick={() => setActive(item)}>
                <Gift size={16} aria-hidden="true" />
                Подарить
              </button>

              <a className="wishlist-btn wishlist-btn--quiet" href="#donate">
                <CircleDollarSign size={15} aria-hidden="true" />
                Или оплатить пожертвованием
              </a>
            </SwiperSlide>
          ))}

          <SwiperSlide className="wishlist-card wishlist-card--own">
            <span className="wishlist-own-icon" aria-hidden="true">
              <HandHeart size={44} />
            </span>
            <b>Свой вариант</b>
            <p>Хотите передать вещи лично? Мы будем рады любой помощи!</p>
            <a
              className="wishlist-btn wishlist-btn--light"
              href={settings.contactUrl || "#footer"}
              target={settings.contactUrl ? "_blank" : undefined}
              rel={settings.contactUrl ? "noopener noreferrer" : undefined}
            >
              Связаться
            </a>
          </SwiperSlide>
        </Swiper>
      </div>

      <GiftOrderModal item={active} settings={settings} open={active !== null} onClose={() => setActive(null)} />
    </section>
  );
}
