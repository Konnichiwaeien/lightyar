"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScroll } from "framer-motion";

import type { RouteStation } from "@/lib/campaigns/summary";
import { Drift } from "@/components/campaigns/collage-drift";
import { CountUp } from "@/components/reports/count-up";
import { useMotionPreference } from "@/components/reports/use-motion-preference";

/**
 * Секция «Куда уходит взнос»: коллаж.
 *
 * Та же грамматика, что у обложки: плоское поле своего цвета, поверх него
 * свободно лежащие вырезки и крупные числа, за ними геометрические фигуры.
 *
 * Движение в три слоя. Каждая нужда въезжает снизу с наклоном и встаёт ровно,
 * пока входит в экран: это шкала просмотра CSS, и она у каждой нужды своя,
 * поэтому очередь получается сама, по местам на поле. Сумма набегает от нуля,
 * когда попадает в кадр. И всё поле плывёт по прокрутке с разной скоростью:
 * это framer, потому что здесь один прогресс кормит все слои сразу.
 *
 * Числа настоящие: сколько собрано по каждой нужде, считается из Strapi.
 * Станция без своих сборов на поле не появляется вовсе. Каждая нужда это
 * ссылка на свой сбор.
 *
 * Вырезки предметов сняты по брифу docs/asset-brief-campaigns-collage.md.
 * Пока файла нет, поле собирается из чисел и геометрии и выглядит законченным.
 */

/**
 * Движение каждого места на поле. Сами места заданы в стилях по номеру.
 *
 * Путь у мест разный нарочно: одинаковая скорость это одна картинка, которую
 * подвинули целиком. Наклон при въезде тоже свой, и он же уходит в CSS
 * переменной, чтобы вырезки не вставали одинаковым строем.
 */
const SLOTS = [
  { art: 1, drift: -70, rotate: -2, tilt: "-7deg" },
  { art: 0.8, drift: -140, rotate: 3, tilt: "6deg" },
  { art: 0.95, drift: -100, rotate: -2, tilt: "-5deg" },
  { art: 1.1, drift: -170, rotate: 2, tilt: "8deg" },
];

export function CampaignRoute({
  stations,
  unit,
}: {
  stations: (RouteStation & { art: string | null })[];
  unit: number;
}) {
  const still = useMotionPreference();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <section aria-labelledby="camp-route-title" className="camp-route" ref={sectionRef}>
      <div aria-hidden="true" className="camp-route__field">
        <Drift className="camp-route__disc" distance={110} progress={scrollYProgress} still={still}>
          <i />
        </Drift>
        <Drift className="camp-route__dots" distance={50} progress={scrollYProgress} still={still} />
      </div>

      <div className="camp-inner">
        <div className="camp-route__copy">
          <p className="camp-kicker">Куда уходит взнос</p>
          <h2 id="camp-route-title">
            На что идут
            <em>ваши {new Intl.NumberFormat("ru-RU").format(unit)} ₽</em>
          </h2>
        </div>

        <div className="camp-route__needs">
          {stations.map((station, index) => {
            const slot = SLOTS[index % SLOTS.length];
            return (
              <Drift
                className={`camp-route__need camp-route__need--${(index % SLOTS.length) + 1}`}
                distance={slot.drift}
                rotate={slot.rotate}
                key={station.tag}
                progress={scrollYProgress}
                still={still}
                style={{ "--art": slot.art, "--tilt": slot.tilt } as React.CSSProperties}
              >
                <Link aria-label={station.title} className="camp-route__link" href={`/campaigns/${station.id}`}>
                  {station.art ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" aria-hidden="true" loading="lazy" src={station.art} />
                  ) : null}
                  <figure>
                    <figcaption>{station.tag}</figcaption>
                    <b>
                      <CountUp value={station.collected} kind="rub" />
                    </b>
                    <span>уже собрано</span>
                  </figure>
                </Link>
              </Drift>
            );
          })}
        </div>
      </div>
    </section>
  );
}
