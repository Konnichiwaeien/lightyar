"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";
import { useInView } from "framer-motion";
import { Gift, HandHeart, Info, ChevronLeft, ChevronRight, CircleDollarSign, MessageCircleHeart } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import { GiftOrderModal } from "@/components/wishlist/gift-order-modal";
import { GiftObjectArt, DestinationArt } from "@/components/wishlist/gift-objects";
import { requestDonationIntent } from "@/lib/donations/donation-intent";
import type { WishlistItem, WishlistSettings } from "@/lib/api/services/wishlist";
import "swiper/css";
import "swiper/css/navigation";
import "./needs-section.css";

const price = (value: number) =>
  `~${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value)} ₽`;

/** Три равных сектора орбиты: верх, низ справа и низ слева. */
const ORBIT_ANGLES = [-90, 30, 150];

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
  const sceneRef = useRef<HTMLDivElement>(null);
  const orbitVisible = useInView(sceneRef, { margin: "100px" });

  const syncEdges = (instance: SwiperClass) =>
    setEdges({ start: instance.isBeginning, end: instance.isEnd });

  // если CMS недоступна, секция молча исчезает: пустой вишлист хуже отсутствующего
  if (items.length === 0) return null;

  const decor = items.slice(0, ORBIT_ANGLES.length);

  return (
    <section className="wishlist" id="needs">
      <div className="wishlist-inner">
        <div className="wishlist-stage">
          <div className="wishlist-stage__copy">
            <p className="wishlist-kicker">Что нужно подопечным</p>
            <h2>
              <span>Соберём</span>
              <em>посылку</em>
            </h2>
            <p className="wishlist-lead">
              {settings.acceptingOrders
                ? `Выберите нужную вещь на ${settings.marketplaceName} и закажите её в наш пункт выдачи. Мы заберём посылку и покажем в отчёте, кому она помогла.`
                : "Выберите подарок для подопечных. Перед заказом свяжитесь с нами — уточним, что сейчас нужно и как передать посылку."}
            </p>
          </div>

          <div className="wishlist-scene" ref={sceneRef} data-visible={orbitVisible} aria-hidden="true">
            <div className="wishlist-disc" />

            <div className="wishlist-orbit">
              {decor.map((item, index) => {
                const angle = ORBIT_ANGLES[index];

                return (
                  <div
                    key={item.documentId}
                    className="wishlist-orbit__slot"
                    style={{ "--orbit-angle": `${angle}deg` } as CSSProperties}
                  >
                    <div className="wishlist-object-anchor">
                      <div
                        className="wishlist-object"
                      >
                        <GiftObjectArt title={item.title} className="wishlist-object__art" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="wishlist-bag">
              <DestinationArt className="wishlist-bag__art" />
            </div>
          </div>
        </div>

        <div className="wishlist-head">
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
            560: { slidesPerView: 1.5 },
            1100: { slidesPerView: 3.1 },
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
                  <GiftObjectArt title={item.title} className="wishlist-card__object" />
                )}
                {item.urgent ? <span className="wishlist-urgent">Срочно</span> : null}
              </div>

              <div className="wishlist-card__content">
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
              </div>

              <div className="wishlist-card__actions">
                <button type="button" className="wishlist-btn" onClick={() => setActive(item)}>
                  <Gift size={16} aria-hidden="true" />
                  Подарить
                </button>

                <span className="wishlist-choice" aria-hidden="true">или</span>
                <button
                  type="button"
                  className="wishlist-btn wishlist-btn--quiet"
                  onClick={() => requestDonationIntent({
                    kind: "gift",
                    id: item.documentId,
                    title: item.title,
                    amount: item.approxPrice ?? 500,
                  })}
                >
                  <CircleDollarSign size={15} aria-hidden="true" />
                  <span>Оплатить пожертвованием</span>
                </button>
              </div>
            </SwiperSlide>
          ))}

          <SwiperSlide className="wishlist-card wishlist-card--own">
            <span className="wishlist-own-icon" aria-hidden="true">
              <HandHeart size={44} />
            </span>
            <b>Свой вариант</b>
            <p>Хотите привезти корм, амуницию или другие нужные вещи сами? Напишите нам, договоримся.</p>
            <a
              className="wishlist-btn wishlist-btn--light"
              href={settings.contactUrl || "#footer"}
              target={settings.contactUrl ? "_blank" : undefined}
              rel={settings.contactUrl ? "noopener noreferrer" : undefined}
            >
              <MessageCircleHeart size={18} strokeWidth={1.8} aria-hidden="true" />
              Связаться
            </a>
          </SwiperSlide>
        </Swiper>
      </div>

      <GiftOrderModal item={active} settings={settings} open={active !== null} onClose={() => setActive(null)} />
    </section>
  );
}
