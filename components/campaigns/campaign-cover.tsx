import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { CampaignSummary } from "@/lib/campaigns/summary";
import { plural } from "@/lib/reports/shelter-scales";

/**
 * Обложка страницы сборов: «Сквозь вещи».
 *
 * Кадр снят из-за предметов. Вплотную к объективу, слева и справа, крупно и
 * мягко не в фокусе стоят вещи, которые приют собирает. В просвете между ними,
 * в фокусе, подопечный смотрит на читателя. Глубже двор.
 *
 * По прокрутке передние вещи разъезжаются к своим краям и уходят вниз, двор
 * почти стоит, собака слегка растёт. К концу полосы между читателем и собакой
 * чисто. Смысл без подписи: между нуждой и животным стоят эти вещи, и их можно
 * купить.
 *
 * Замысел и разбор в docs/campaigns-scroll-plan.md, секция 1.
 * Бриф на съёмку в docs/asset-brief-campaigns-cover.md.
 */

const money = (value: number) => `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;

/**
 * Временная замена, пока не пришли четыре слоя из брифа.
 *
 * Собрана из того, что уже лежит в public: панорама двора, вырезка подопечного
 * и предметы вишлиста вместо передних гроздей. Годится, чтобы смотреть ход
 * движения, и не годится, чтобы судить о композиции: предметы вишлиста сняты
 * почти белыми на белом и резкими, а передний план обязан быть мягким.
 *
 * Когда файлы придут, здесь меняются только пути, а гроздь из двух предметов
 * схлопывается в один слой на каждую сторону.
 */
const STAND_IN = {
  yard: "/about/panorama.jpg",
  pet: "/pets/cutout-lakki.webp",
  left: ["/wishlist/item-bowl.webp", "/wishlist/item-dry-food.webp"],
  right: ["/wishlist/item-medicine.webp", "/wishlist/item-blanket.webp"],
};

export function CampaignCover({ summary }: { summary: CampaignSummary }) {
  return (
    <section className="camp-cover">
      {/* Сцена целиком декоративна: всё, что она говорит, сказано текстом
          рядом, поэтому читалке она не нужна. */}
      <div aria-hidden="true" className="camp-cover__scene">
        {/* eslint-disable @next/next/no-img-element */}
        <img alt="" className="camp-cover__yard" src={STAND_IN.yard} />
        <img alt="" className="camp-cover__pet" src={STAND_IN.pet} />

        <span className="camp-cover__near camp-cover__near--left">
          {STAND_IN.left.map((src, index) => (
            <img alt="" key={src} src={src} style={{ "--n": index } as React.CSSProperties} />
          ))}
        </span>

        <span className="camp-cover__near camp-cover__near--right">
          {STAND_IN.right.map((src, index) => (
            <img alt="" key={src} src={src} style={{ "--n": index } as React.CSSProperties} />
          ))}
        </span>
        {/* eslint-enable @next/next/no-img-element */}

        {/* Кремовая вуаль слева: заголовок стоит на фотографии, и без неё
            тёмные буквы тонут в траве. Полоса остаётся бумагой, а не
            превращается в тёмный баннер. */}
        <span className="camp-cover__veil" />
      </div>

      <div className="camp-inner camp-cover__copy">
        <p className="camp-kicker">Чем помочь прямо сейчас</p>
        <h1>
          Открытые
          <em>сборы</em>
        </h1>
        <p className="camp-cover__lead">
          Каждый сбор закрывает одну нужду приюта: корм, лечение, тёплые вольеры. Сейчас открыто{" "}
          <strong>
            {summary.funds} {plural(summary.funds, "сбор", "сбора", "сборов")}
          </strong>
          , и до всех целей не хватает <strong>{money(summary.rest)}</strong>.
        </p>
        <Link className="camp-btn camp-cover__cta" href="/#donate">
          Помочь · 500 ₽
          <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </section>
  );
}
