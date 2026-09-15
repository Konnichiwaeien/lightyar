"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScroll } from "framer-motion";

import type { RouteStation } from "@/lib/campaigns/summary";
import { Drift } from "@/components/campaigns/collage-drift";
import { CountUp } from "@/components/reports/count-up";
import { useMotionPreference } from "@/components/reports/use-motion-preference";

/**
 * Секция «Куда уходит взнос».
 *
 * Сюжет взят с «цифр года» из референса Wikimedia: заголовок по центру поля,
 * под ним четыре нужды, и у каждой своя мини-композиция. Слева группа из
 * трёх слоёв: сетка точек сзади, круг размером с предмет посередине,
 * вырезка предмета спереди, и она ломает кромку круга. Справа тег, сумма и
 * «собрано из», под ними тонкая шкала.
 *
 * В референсе круг никогда не живёт сам по себе: он всегда сиденье под
 * конкретной вырезкой. До этого здесь был один огромный круг в углу и блок
 * точек в другом, и владелец спросил, какую роль они играют. Никакой. Теперь
 * у каждой фигуры есть предмет, а у каждого предмета фигура.
 *
 * Движение. Группа въезжает снизу с наклоном и встаёт ровно, пока входит в
 * экран, шкала просмотра у каждой своя, очередь по номеру. Сумма набегает от
 * нуля. Предметы плывут по прокрутке с разной скоростью, подписи стоят: так
 * группа читается объёмной. Это framer, один прогресс на все предметы.
 *
 * Числа настоящие: сколько собрано и сколько нужно по каждому тегу, из
 * Strapi. Нужда без своих сборов на поле не появляется. Каждая нужда это
 * ссылка на свой сбор.
 *
 * Вырезки предметов сняты по брифу docs/asset-brief-campaigns-collage.md.
 * Пока файла нет, группа собирается из круга и точек и выглядит законченной.
 */

const money = (value: number) => `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;

/**
 * Движение и цвет каждого места.
 *
 * Круги разных цветов, как в референсе, где каждая вырезка сидит на своём:
 * янтарь под мешком, светлый лист под коробкой лекарств, мох под миской,
 * тёмный янтарь под брезентом. Путь и наклон у всех свои: одинаковые
 * превращают четыре группы в одну картинку, которую подвинули.
 */
const SLOTS = [
  { tone: "var(--c-amber)", drift: -50, rotate: -3, tilt: "-7deg" },
  { tone: "var(--c-sheet)", drift: -80, rotate: 4, tilt: "6deg" },
  { tone: "rgba(111, 115, 85, 0.42)", drift: -60, rotate: -2, tilt: "-5deg" },
  { tone: "var(--c-amber-deep)", drift: -95, rotate: 3, tilt: "8deg" },
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
      <div className="camp-inner">
        <header className="camp-route__head">
          <p className="camp-kicker">Куда уходит взнос</p>
          <h2 id="camp-route-title">
            На что идут <em>ваши {money(unit)}</em>
          </h2>
          <p className="camp-route__lead">
            Каждый взнос закрывает одну из {stations.length === 4 ? "четырёх" : "открытых"} нужд приюта. Столько по
            каждой уже собрано и столько нужно, чтобы закрыть её целиком.
          </p>
        </header>

        <ul className="camp-route__needs">
          {stations.map((station, index) => {
            const slot = SLOTS[index % SLOTS.length];
            const share = station.goal > 0 ? Math.min(1, station.collected / station.goal) : 0;
            return (
              <li
                className="camp-route__need"
                key={station.tag}
                style={{ "--i": index, "--tilt": slot.tilt, "--tone": slot.tone } as React.CSSProperties}
              >
                <Link aria-label={station.title} className="camp-route__link" href={`/campaigns/${station.id}`}>
                  <Drift
                    className="camp-route__figure"
                    distance={slot.drift}
                    rotate={slot.rotate}
                    progress={scrollYProgress}
                    still={still}
                  >
                    <i aria-hidden="true" className="camp-route__dots" />
                    <i aria-hidden="true" className="camp-route__disc" />
                    {station.art ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt="" aria-hidden="true" loading="lazy" src={station.art} />
                    ) : null}
                  </Drift>

                  <span className="camp-route__text">
                    <span className="camp-route__tag">{station.tag}</span>
                    <b>
                      <CountUp value={station.collected} kind="rub" />
                    </b>
                    <span className="camp-route__of">собрано из {money(station.goal)}</span>
                    <span
                      className="camp-route__bar"
                      role="progressbar"
                      aria-valuenow={station.collected}
                      aria-valuemin={0}
                      aria-valuemax={station.goal}
                      aria-label={`Собрано ${station.collected} рублей из ${station.goal}`}
                    >
                      <i style={{ "--fill": `${share * 100}%` } as React.CSSProperties} />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
