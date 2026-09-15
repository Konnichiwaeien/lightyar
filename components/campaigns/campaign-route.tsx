"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";

import type { RouteStation } from "@/lib/campaigns/summary";
import { useMotionPreference } from "@/components/reports/use-motion-preference";

/**
 * Секция «На что идут ваши деньги»: закреплённая сцена.
 *
 * Механика с микросайта Vogue: там фигура стоит закреплённой посреди
 * экрана, а по прокрутке к ней съезжаются вещи, и она в них одевается.
 * Здесь посреди поля стоит подопечный приюта, Серкан, на янтарном круге, а
 * по прокрутке к нему по очереди приезжают вещи, которые покупают на
 * взносы: мешок корма, миска, лекарства, брезент для утепления. Каждая
 * встаёт на своё место в натюрморте, и рядом проявляется подпись: тег,
 * сумма набегает от нуля, «из» цели, тонкая шкала. Ничего не кликается,
 * это картина, а не список.
 *
 * Секция высотой в два с половиной экрана, сцена внутри липкая. На узком
 * экране липкость снимается: держать сцену на телефоне некуда, и вещи
 * съезжаются, пока секция идёт мимо экрана. Подписи там стоят под сценой.
 *
 * Один прогресс кормит все слои с перекрывающимися фазами, поэтому это
 * framer, а не шкала просмотра CSS; так же устроена касса в отчётности.
 * Преобразования функцией, а не парой отрезков: от пары отрезков framer
 * отдаёт значение браузеру нативной шкалой и внутри пути считает неверно.
 *
 * Числа настоящие: сколько собрано и сколько нужно по каждому тегу, из
 * Strapi. Нужда без своих сборов на сцену не приезжает.
 */

const money = (value: number) => `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;

/** Доля пути от a до b, срезанная в [0, 1], с мягким подходом к концу. */
const ease = (p: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
  return 1 - Math.pow(1 - t, 3);
};

/**
 * Фазы сцены в долях пути. Круг и собака стоят с первого кадра и только
 * досаживаются: закреплённая сцена без них читалась бы дырой под
 * заголовком. Потом вещи по очереди с шагом в шестнадцать сотых: каждая
 * едет восемнадцать сотых, подпись проявляется на последней трети её пути,
 * сумма набегает чуть дольше. Последняя вещь встаёт к восьмидесяти сотым,
 * дальше сцена стоит и уходит.
 */
const PHASE = {
  disc: [0, 0.1],
  dog: [0, 0.12],
  item: (i: number) => [0.14 + i * 0.16, 0.32 + i * 0.16],
  label: (i: number) => [0.26 + i * 0.16, 0.34 + i * 0.16],
  count: (i: number) => [0.26 + i * 0.16, 0.5 + i * 0.16],
} as const;

/**
 * Место вещи в натюрморте по тегу, а не по порядковому номеру: если у тега
 * нет открытых сборов, он на сцену не приезжает, и номера сдвинулись бы.
 * Откуда и с каким наклоном вещь едет, тоже своё: стороны чередуются.
 */
const SLOT: Record<string, { mod: string; from: number; tilt: number }> = {
  Корм: { mod: "food", from: -1, tilt: -22 },
  Медицина: { mod: "meds", from: 1, tilt: 18 },
  Реабилитация: { mod: "rehab", from: -1, tilt: 16 },
  Срочно: { mod: "warm", from: 1, tilt: -24 },
};

const slotOf = (tag: string, index: number) =>
  SLOT[tag] ?? { mod: `extra-${index + 1}`, from: index % 2 ? 1 : -1, tilt: index % 2 ? 18 : -22 };

/** Узкий экран: липкость снимается, прогресс идёт по проходу секции. */
function useCompact(query = "(max-width: 860px)") {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const sync = () => setCompact(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [query]);
  return compact;
}

function Item({
  station,
  index,
  progress,
  still,
}: {
  station: RouteStation & { art: string | null };
  index: number;
  progress: MotionValue<number>;
  still: boolean;
}) {
  const flight = slotOf(station.tag, index);
  const [a, b] = PHASE.item(index);
  const x = useTransform(progress, (p) => flight.from * 900 * (1 - ease(p, a, b)));
  const y = useTransform(progress, (p) => 140 * (1 - ease(p, a, b)));
  const rotate = useTransform(progress, (p) => flight.tilt * (1 - ease(p, a, b)));
  const opacity = useTransform(progress, (p) => Math.min(1, ease(p, a, a + 0.04) * 1.2));

  /* При гашении движения итог задан явными числами, а не снятым style: framer
     оставляет в инлайновом стиле то, что записал до переключения, и вещи
     стояли бы с нулевой прозрачностью. */
  return (
    <motion.div
      className={`camp-route__item camp-route__item--${flight.mod}`}
      style={still ? { x: 0, y: 0, rotate: 0, opacity: 1 } : { x, y, rotate, opacity }}
    >
      {station.art ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" src={station.art} />
      ) : null}
    </motion.div>
  );
}

function Label({
  station,
  index,
  progress,
  still,
}: {
  station: RouteStation;
  index: number;
  progress: MotionValue<number>;
  still: boolean;
}) {
  const [a, b] = PHASE.label(index);
  const [c, d] = PHASE.count(index);
  const share = station.goal > 0 ? Math.min(1, station.collected / station.goal) : 0;

  const opacity = useTransform(progress, (p) => ease(p, a, b));
  const y = useTransform(progress, (p) => 24 * (1 - ease(p, a, b)));
  const sum = useTransform(progress, (p) => money(station.collected * ease(p, c, d)));
  const fill = useTransform(progress, (p) => share * ease(p, c, d));

  /* На сервере и до первого кадра стоит итог: без JS страница показывает
     настоящие суммы, а не нули. Живое число подставляется после монтажа. */
  const [live, setLive] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLive(true);
  }, []);
  const animated = live && !still;

  return (
    <motion.li
      className={`camp-route__label camp-route__label--${slotOf(station.tag, index).mod}`}
      style={animated ? { opacity, y } : { opacity: 1, y: 0 }}
    >
      <span className="camp-route__tag">{station.tag}</span>
      <b>{animated ? <motion.span>{sum}</motion.span> : money(station.collected)}</b>
      <span className="camp-route__of">из {money(station.goal)}</span>
      <span
        className="camp-route__bar"
        role="progressbar"
        aria-valuenow={station.collected}
        aria-valuemin={0}
        aria-valuemax={station.goal}
        aria-label={`Собрано ${station.collected} рублей из ${station.goal}`}
      >
        <motion.i style={animated ? { scaleX: fill } : { scaleX: share }} />
      </span>
    </motion.li>
  );
}

export function CampaignRoute({ stations }: { stations: (RouteStation & { art: string | null })[] }) {
  const still = useMotionPreference();
  const compact = useCompact();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: compact ? ["start 80%", "end 30%"] : ["start start", "end end"],
  });

  const [discA, discB] = PHASE.disc;
  const [dogA, dogB] = PHASE.dog;
  const discScale = useTransform(scrollYProgress, (p) => 0.82 + 0.18 * ease(p, discA, discB));
  const dogY = useTransform(scrollYProgress, (p) => 48 * (1 - ease(p, dogA, dogB)));

  return (
    <section aria-labelledby="camp-route-title" className="camp-route" ref={sectionRef}>
      <div className="camp-route__stage">
        <header className="camp-inner camp-route__head">
          <p className="camp-kicker">Куда уходит взнос</p>
          <h2 id="camp-route-title">
            На что идут <em>ваши деньги</em>
          </h2>
        </header>

        <div className="camp-inner camp-route__body">
          <div className="camp-route__scene">
            <motion.i
              aria-hidden="true"
              className="camp-route__disc"
              style={still ? { scale: 1 } : { scale: discScale }}
            />
            <motion.div className="camp-route__dog" style={still ? { y: 0 } : { y: dogY }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" src="/pets/cutout-serkan.webp" />
            </motion.div>
            {stations.map((station, index) => (
              <Item index={index} key={station.tag} progress={scrollYProgress} station={station} still={still} />
            ))}
          </div>

          <ul className="camp-route__labels">
            {stations.map((station, index) => (
              <Label index={index} key={station.tag} progress={scrollYProgress} station={station} still={still} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
