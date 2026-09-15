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
 * Справа одна группа, как в референсе: пустая миска на кремовом круге
 * размером с неё, за ними сетка точек. Миска падает сверху с поворотом,
 * пока секция входит в экран, и верхом заходит на предыдущее поле. Строки
 * текста поднимаются очередью. Всё это шкала просмотра секции в CSS; по
 * прокрутке слои ещё и плывут с разной скоростью, это framer.
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
        <Drift className="camp-call__dots" distance={36} progress={scrollYProgress} still={still} />
        <Drift className="camp-call__disc" distance={80} progress={scrollYProgress} still={still}>
          <i />
        </Drift>
        <Drift className="camp-call__bowl" distance={-90} rotate={-6} progress={scrollYProgress} still={still}>
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
          Взнос без цели идёт на то, что <mark className="camp-mark camp-mark--sheet">нужнее прямо сейчас</mark>:
          корм, лекарства, оплату клиники. Приют сам решит, какую миску наполнить первой.
        </p>
        {/* Кнопка открывает панель помощи прямо здесь, в диалоге, а не уводит
            на главную: до этого читатель терял страницу, с которой пришёл. */}
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
