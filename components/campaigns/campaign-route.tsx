"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import type { RouteStation } from "@/lib/campaigns/summary";
import { useMotionPreference } from "@/components/reports/use-motion-preference";

/**
 * Секция 3 страницы сборов: лента «Куда уходит взнос».
 *
 * Одна длинная картина едет влево, пока читатель прокручивает страницу вниз.
 * Слева монета, справа полная миска, между ними то, на что уходят взносы.
 * Подпись станции проявляется, когда станция подходит к середине экрана, и
 * несёт настоящую сумму, собранную по этой нужде.
 *
 * Картина одна: `public/campaigns/ribbon.webp`, 9000 на 900, десять к одному.
 * Координаты станций внутри неё те же числа, что в `lib/campaigns/summary.ts`,
 * поэтому подпись не может уехать от предмета.
 *
 * Замысел в docs/campaigns-scroll-plan.md, секция 3. Бриф на картину в
 * docs/asset-brief-campaigns-ribbon.md.
 */

/** Узкий экран: сцена не липнет, а проигрывается, пока секция идёт через экран. */
const COMPACT = "(max-width: 860px)";

const subscribeCompact = (onChange: () => void) => {
  const media = window.matchMedia(COMPACT);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

const useCompact = () =>
  useSyncExternalStore(
    subscribeCompact,
    () => window.matchMedia(COMPACT).matches,
    () => false,
  );

const money = (value: number) => `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;

/** Окно, внутри которого лента проезжает весь путь. Края оставлены на вход и выход. */
const TRAVEL: [number, number] = [0.06, 0.94];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Подпись станции.
 *
 * Момент появления считается из координаты станции на картине, а не задаётся
 * руками: станция выходит на середину экрана при прогрессе
 * `(at * длина - половина окна) / (длина - окно)`. Поэтому подписи не нужно
 * пересчитывать, когда меняется ширина экрана или высота полосы.
 *
 * Преобразование здесь функцией, а не парой отрезков, и это не стиль, а
 * необходимость. От пары отрезков framer отдаёт значение браузеру нативной
 * шкалой прокрутки, и для узкого окна внутри пути оно считается неверно:
 * библиотека пишет в инлайновый стиль прозрачность ноль, а на экране стоит
 * 0,53, потому что ускоренная анимация перебивает свой же стиль. С функцией
 * ускорение не включается, значение считает сама библиотека, и оно совпадает
 * с расчётом. Сдвиг ленты ниже остаётся на отрезках: там ускорение работает
 * верно, а двигать картину в девять тысяч пикселей выгоднее на стороне
 * браузера.
 */
function Station({
  station,
  progress,
  ratio,
  live,
}: {
  station: RouteStation;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  ratio: number;
  live: boolean;
}) {
  const span = TRAVEL[1] - TRAVEL[0];
  const centre = ratio > 1 ? TRAVEL[0] + span * ((station.at * ratio - 0.5) / (ratio - 1)) : 0.5;
  const from = Math.max(0, centre - 0.14);
  const to = Math.max(from + 0.02, centre - 0.02);

  const reveal = useTransform(progress, (value) => clamp01((value - from) / (to - from)));
  const y = useTransform(reveal, (value) => 18 * (1 - value));

  return (
    <motion.figure
      className="camp-route__station"
      style={live ? { left: `${station.at * 100}%`, opacity: reveal, y } : { left: `${station.at * 100}%` }}
    >
      <figcaption>{station.tag}</figcaption>
      <b>{money(station.collected)}</b>
      <span>уже собрано</span>
    </motion.figure>
  );
}

export function CampaignRoute({ stations, unit }: { stations: RouteStation[]; unit: number }) {
  const still = useMotionPreference();
  const compact = useCompact();
  return (
    <RouteScene key={compact ? "compact" : "wide"} compact={compact} stations={stations} still={still} unit={unit} />
  );
}

function RouteScene({
  stations,
  unit,
  compact,
  still,
}: {
  stations: RouteStation[];
  unit: number;
  compact: boolean;
  still: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  /* Длина картины относительно окна замеряется: она считается от высоты
     полосы, а та от высоты экрана. От этого же числа зависит и путь ленты,
     и момент каждой подписи. */
  const [ratio, setRatio] = useState(0);
  const [travel, setTravel] = useState(0);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const strip = stripRef.current;
    if (!track || !strip) return;

    const measure = () => {
      const trackWidth = track.clientWidth;
      const stripWidth = strip.scrollWidth;
      if (trackWidth <= 0) return;
      setRatio(stripWidth / trackWidth);
      setTravel(Math.max(0, stripWidth - trackWidth));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(strip);
    return () => observer.disconnect();
  }, []);

  // На широком экране прогресс идёт по липкой сцене, на узком по проходу
  // секции через экран: от входа снизу до ухода вверх.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: compact ? ["start 85%", "end 15%"] : ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, TRAVEL, [0, -travel]);
  // Тёплый свет догоняет собаку у миски к концу пути.
  const glow = useTransform(scrollYProgress, (value) => clamp01((value - 0.08) / 0.84));

  const live = !still && travel > 0;

  /* Раскладку решает только настройка движения. Замер длины приходит кадром
     позже, и если вешать на него ещё и липкость, страница прыгнет на
     загрузке. */
  return (
    <section
      aria-labelledby="camp-route-title"
      className="camp-route"
      data-still={still ? "true" : "false"}
      ref={sectionRef}
    >
      <div className="camp-route__sticky">
        <div className="camp-inner camp-route__head">
          <p className="camp-kicker">Куда уходит взнос</p>
          <h2 id="camp-route-title">
            {money(unit)} доезжают
            <em>до миски</em>
          </h2>
          <p className="camp-route__lead">
            Слева монета, справа полная миска. Между ними то, на что уходят взносы, и сколько на каждую нужду
            уже собрано.
          </p>
        </div>

        <div className="camp-route__track" ref={trackRef}>
          <motion.div className="camp-route__strip" ref={stripRef} style={live ? { x } : undefined}>
            {/* Картина подключена обычным img, а не next/image: она нарезана
                под сцену, и подстановка размеров под брейкпоинты сдвинула бы
                станции относительно подписей. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" aria-hidden="true" className="camp-route__art" loading="lazy" src="/campaigns/ribbon.webp" />

            {stations.map((station) => (
              <Station key={station.tag} live={live} progress={scrollYProgress} ratio={ratio} station={station} />
            ))}
          </motion.div>

          <motion.span aria-hidden="true" className="camp-route__glow" style={live ? { opacity: glow } : undefined} />
        </div>
      </div>
    </section>
  );
}
