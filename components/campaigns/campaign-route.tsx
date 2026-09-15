"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import type { RouteStation } from "@/lib/campaigns/summary";
import { useMotionPreference } from "@/components/reports/use-motion-preference";

/**
 * Секция «Куда уходит взнос»: коллаж.
 *
 * Та же грамматика, что у обложки: плоское поле своего цвета, поверх него
 * свободно лежащие вырезки и крупные числа, за ними геометрические фигуры,
 * одна вырезка переходит через шов в следующее поле.
 *
 * До этого секция была лентой: длинная картина ехала влево по прокрутке.
 * Владелец отклонил её вместе с обложкой, и по делу: лента это прямоугольник,
 * а в референсах прямоугольных фотоблоков нет.
 *
 * Числа настоящие: сколько собрано по каждой нужде, считается из Strapi.
 * Станция без своих сборов на поле не появляется вовсе.
 *
 * Вырезки предметов заказаны брифом docs/asset-brief-campaigns-collage.md.
 * Пока их нет, поле собирается из чисел и геометрии и выглядит законченным.
 */

const money = (value: number) => `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;

/**
 * Где на поле стоит каждая нужда.
 *
 * Места нарочно неровные: ровный ряд из четырёх блоков превращает коллаж
 * обратно в таблицу. Последняя станция уходит ниже кромки и ложится на
 * следующее поле.
 */
const SLOTS = [
  { left: "4%", top: "20%", size: "20%", drift: -30 },
  { left: "30%", top: "54%", size: "23%", drift: -62 },
  { left: "56%", top: "14%", size: "19%", drift: -44 },
  { left: "76%", top: "48%", size: "22%", drift: -78 },
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
        <Drift className="camp-route__disc" distance={-34} progress={scrollYProgress} still={still} />
        <Drift className="camp-route__dots" distance={-18} progress={scrollYProgress} still={still} />
      </div>

      <div className="camp-inner camp-route__copy">
        <p className="camp-kicker">Куда уходит взнос</p>
        <h2 id="camp-route-title">
          На что идут
          <em>ваши {money(unit)}</em>
        </h2>
      </div>

      <div className="camp-route__needs">
        {stations.map((station, index) => {
          const slot = SLOTS[index % SLOTS.length];
          return (
            <Drift
              className="camp-route__need"
              distance={slot.drift}
              key={station.tag}
              progress={scrollYProgress}
              still={still}
              style={{ left: slot.left, top: slot.top, width: slot.size }}
            >
              {station.art ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" aria-hidden="true" loading="lazy" src={station.art} />
              ) : null}
              <figure>
                <figcaption>{station.tag}</figcaption>
                <b>{money(station.collected)}</b>
                <span>уже собрано</span>
              </figure>
            </Drift>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Слой коллажа, который плывёт по прокрутке.
 *
 * Чем ближе предмет к читателю, тем дальше он уезжает. Смещение своё у каждого
 * слоя, поэтому поле не едет целиком и коллаж не превращается в картинку.
 *
 * Преобразование функцией, а не парой отрезков: от пары отрезков framer
 * отдаёт значение браузеру нативной шкалой прокрутки и для узких окон внутри
 * пути считает его неверно. Это стоило одного полного переписывания секции.
 */
function Drift({
  className,
  distance,
  progress,
  still,
  style,
  children,
}: {
  className: string;
  distance: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  still: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const y = useTransform(progress, (value) => (value - 0.5) * distance);
  return (
    <motion.div className={className} style={still ? style : { ...style, y }}>
      {children}
    </motion.div>
  );
}
