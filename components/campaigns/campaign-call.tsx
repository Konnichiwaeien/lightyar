"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScroll } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { Drift } from "@/components/campaigns/collage-drift";
import { useMotionPreference } from "@/components/reports/use-motion-preference";

/**
 * Секция 5: финальный призыв.
 *
 * Та же грамматика, третье поле. Обложка стоит на кремовом, «Куда уходит
 * взнос» на тёплом кремовом, финал на янтаре: цвет меняется от секции к
 * секции, и к концу страницы он доходит до полного акцента.
 *
 * Пустая миска выходит за верхнюю кромку и ложится на предыдущее поле. Это
 * последний переход через шов, и он тянет читателя обратно к тому, на что
 * уходят деньги.
 *
 * Эта секция заменила янтарную карточку «Просто помочь», которая стояла
 * последней в сетке сборов. Карточка говорила ровно это же, и держать обе
 * означало сказать одно дважды.
 *
 * Разбор секций в docs/campaigns-scroll-plan.md.
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
        <Drift className="camp-call__disc" distance={-30} progress={scrollYProgress} still={still} />
        <Drift className="camp-call__dots" distance={-16} progress={scrollYProgress} still={still} />
        <Drift className="camp-call__bowl" distance={-58} progress={scrollYProgress} still={still}>
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
          Взнос без цели идёт на то, что нужнее прямо сейчас: корм, лекарства, оплату клиники. Приют сам решит,
          какую миску наполнить первой.
        </p>
        <Link className="camp-btn camp-call__cta" href="/#donate">
          Сделать взнос
          <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </section>
  );
}
