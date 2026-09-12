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
 * По прокрутке передние грозди разъезжаются к своим краям и уходят вниз, двор
 * почти стоит, собака слегка растёт. К концу полосы между читателем и собакой
 * чисто. Смысл без подписи: между нуждой и животным стоят эти вещи, и их можно
 * купить.
 *
 * Замысел и разбор в docs/campaigns-scroll-plan.md, секция 1.
 * Бриф на съёмку в docs/asset-brief-campaigns-cover.md.
 */

const money = (value: number) => `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;

/**
 * Четыре слоя одного кадра.
 *
 * Все нарисованы на одном холсте 2400 на 1350 и вписываются одинаково, поэтому
 * совмещаются при любой ширине полосы. Порядок в разметке снизу вверх: двор,
 * подопечный, ближние грозди.
 */
const LAYERS = {
  yard: "/campaigns/cover-yard.webp",
  pet: "/campaigns/cover-pet.webp",
  left: "/campaigns/cover-near-left.png",
  right: "/campaigns/cover-near-right.png",
};

export function CampaignCover({ summary }: { summary: CampaignSummary }) {
  return (
    <section className="camp-cover">
      {/* Сцена целиком декоративна: всё, что она говорит, сказано текстом
          рядом, поэтому читалке она не нужна. */}
      <div aria-hidden="true" className="camp-cover__scene">
        {/* Слои идут обычными img, а не next/image: они уже нарезаны под холст
            сцены, и подстановка размеров под брейкпоинты сдвинула бы их друг
            относительно друга. */}
        {/* eslint-disable @next/next/no-img-element */}
        <img alt="" className="camp-cover__yard" fetchPriority="high" src={LAYERS.yard} />
        <img alt="" className="camp-cover__pet" fetchPriority="high" src={LAYERS.pet} />
        {/* eslint-enable @next/next/no-img-element */}

        {/* Кремовая вуаль слева: заголовок стоит на фотографии, и без неё
            тёмные буквы тонут в земле. Полоса остаётся бумагой, а не
            превращается в тёмный баннер.

            Стоит под ближними гроздями, а не поверх всего. Перед ними ей
            стоять нечем: они ближе всех к объективу, и вуаль поверх съедала
            левую гроздь целиком. */}
        <span className="camp-cover__veil" />

        {/* eslint-disable @next/next/no-img-element */}
        <img alt="" className="camp-cover__near camp-cover__near--left" src={LAYERS.left} />
        <img alt="" className="camp-cover__near camp-cover__near--right" src={LAYERS.right} />
        {/* eslint-enable @next/next/no-img-element */}
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
