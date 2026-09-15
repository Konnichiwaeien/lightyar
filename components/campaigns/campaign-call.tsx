"use client";

import { useRef } from "react";
import { useScroll } from "framer-motion";
import { HeartHandshake } from "lucide-react";

import { Drift } from "@/components/campaigns/collage-drift";
import { useMotionPreference } from "@/components/reports/use-motion-preference";
import { preloadDonatePanel, requestDonateOpen } from "@/lib/donations/donation-intent";

/**
 * Секция 5: финальный призыв.
 *
 * Та же грамматика, третье поле. Обложка стоит на кремовом, «На что идут
 * ваши деньги» на тёплом кремовом, финал на янтаре: цвет меняется от секции
 * к секции, и к концу страницы он доходит до полного акцента.
 *
 * Справа одна группа: пустая миска на кремовом круге, за ними сетка точек.
 * Круг и точки лежат внутри группы, а не расставлены процентами по полю:
 * порознь они ехали по прокрутке в разные стороны, миска вверх, а круг
 * вниз, и к середине прохода расходились на полтораста пикселей. Миска
 * висела в воздухе над собственным кругом и наезжала на натюрморт секции
 * выше. Теперь группа едет целиком.
 *
 * Миска верхом заходит на предыдущее поле: это последний переход через шов.
 * Наклона у неё нет: она снята в сильном ракурсе, и повёрнутая читается
 * опрокинутой.
 *
 * Янтарное поле уходит под скруглённый верх подвала. Подвал общий для сайта и
 * скруглён поверх фона страницы; на других страницах под углами лежит тот же
 * серый лист, а здесь лежал бы он же вместо янтаря, и углы читались бы двумя
 * серыми ушами. Поле продлено вниз на радиус подвала, и подвал ложится на него.
 */

export function CampaignCall() {
  const still = useMotionPreference();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <section aria-labelledby="camp-call-title" className="camp-call" ref={sectionRef}>
      <div aria-hidden="true" className="camp-call__field">
        <Drift className="camp-call__unit" distance={-46} progress={scrollYProgress} still={still}>
          <i className="camp-call__dots" />
          <i className="camp-call__disc" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" loading="lazy" src="/campaigns/need-bowl.webp" />
        </Drift>
      </div>

      <div className="camp-inner camp-call__copy">
        <p className="camp-kicker">Не выбрали сбор</p>
        <h2 id="camp-call-title">
          Помочь можно
          <em>просто так</em>
        </h2>
        <p className="camp-call__lead">
          Взнос без цели идёт туда, <mark className="camp-mark camp-mark--sheet">где нужнее</mark>: на корм,
          лекарства или оплату клиники. Приют сам решит, какую миску наполнить первой.
        </p>
        <button
          className="camp-btn camp-call__cta"
          onClick={requestDonateOpen}
          onFocus={preloadDonatePanel}
          onMouseEnter={preloadDonatePanel}
          type="button"
        >
          <HeartHandshake aria-hidden="true" size={18} />
          Сделать взнос
        </button>
      </div>
    </section>
  );
}
