"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import "./rescued-ring.css";

/**
 * Кольцо портретов: «кого мы вытащили».
 *
 * Портреты едут по замкнутому контуру, нарисованному от руки. Контур живёт
 * в CSS как offset-path — это свойство браузера, и считает его композитор,
 * а не главный поток. Motion двигает по нему одну величину, offsetDistance,
 * и он же приводит движение к прокрутке и гасит его при «меньше движения».
 *
 * Когда секция доходит до центра экрана, кольцо стягивается к середине
 * и гаснет, оставляя цифры.
 */

/** Оборот кольца, мс. Очень медленно: это фон для текста, а не карусель.
 *  На 26 секундах собаки заметно бежали и мешали читать. */
const LAP = 64_000;

const PORTRAITS = [
  "dzhek",
  "silviya",
  "tessi",
  "lakki",
  "matilda",
  "bim",
  "mira",
  "serkan",
  "alfa",
  "kapral",
  "dzhessi",
];

/**
 * Первая композиция каждого портрета относительно его будущей точки на
 * орбите. Это намеренно не кольцо: в начале сцены животные рассыпаны по
 * всему кадру, а затем по очереди собираются на общий контур.
 */
const PORTRAIT_SCATTER = [
  { x: -376, y: -6, scale: 1.485, rotate: -10 },
  { x: -300, y: -11, scale: 1.17, rotate: 8 },
  { x: -172, y: -122, scale: 1.395, rotate: -6 },
  { x: 24, y: -208, scale: 1.08, rotate: 10 },
  { x: 152, y: -80, scale: 1.35, rotate: -8 },
  { x: 158, y: 5, scale: 1.125, rotate: 7 },
  { x: 80, y: 5, scale: 1.305, rotate: -9 },
  { x: -3, y: 46, scale: 1.17, rotate: 5 },
  { x: -69, y: 22, scale: 1.395, rotate: -7 },
  { x: -12, y: 19, scale: 1.125, rotate: 8 },
  { x: 405, y: 154, scale: 1.215, rotate: -6 },
];

const compactRingQuery = "(max-width: 1180px)";
const spaciousRingQuery = "(min-width: 1600px) and (min-height: 850px)";
const reducedRingQuery = "(prefers-reduced-motion: reduce)";

function subscribeMediaQuery(queryText: string, callback: () => void) {
  const query = window.matchMedia(queryText);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

const subscribeCompactRing = (callback: () => void) => subscribeMediaQuery(compactRingQuery, callback);
const subscribeSpaciousRing = (callback: () => void) => subscribeMediaQuery(spaciousRingQuery, callback);
const getSpaciousRingSnapshot = () => window.matchMedia(spaciousRingQuery).matches;
const subscribeReducedRing = (callback: () => void) => subscribeMediaQuery(reducedRingQuery, callback);
const getCompactRingSnapshot = () => window.matchMedia(compactRingQuery).matches;
const getReducedRingSnapshot = () => window.matchMedia(reducedRingQuery).matches;

const getRingServerSnapshot = () => false;

/**
 * Что слетается к колонке.
 *
 * Приём из секции с сумкой: предметы не лежат по углам, а собираются к
 * цели по мере прокрутки. Здесь цель — колонка о фонде, и собираются
 * ровно те вещи, которые в ней названы: корм, лекарства, наполнитель.
 * Падают сверху и закрепляются по краям всей колонки, каждый со своей
 * задержкой. Так они работают как декорация текста, а не как куча под ним.
 */
const GATHER = [
  { src: "item-dry-food", x: -14, y: 12, size: 88, from: [-36, -280], tilt: -10, delay: 0 },
  { src: "item-medicine", x: 88, y: 5, size: 70, from: [42, -340], tilt: 8, delay: 0.12 },
  { src: "item-litter", x: 90, y: 39, size: 94, from: [54, -400], tilt: 7, delay: 0.24 },
  { src: "item-bowl", x: -15, y: 50, size: 78, from: [-48, -440], tilt: -7, delay: 0.36 },
];

const SIZES = [1, 0.9, 0.86, 1.04, 0.82, 1.08, 0.88, 1.02, 0.94, 0.9, 0.96];

function useOrbitTime(running: boolean) {
  const time = useMotionValue(0);

  useEffect(() => {
    if (!running) return;

    let animationFrameId = 0;
    const initialTime = time.get();
    const startedAt = performance.now();
    const update = (now: number) => {
      time.set(initialTime + now - startedAt);
      animationFrameId = requestAnimationFrame(update);
    };
    animationFrameId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationFrameId);
  }, [running, time]);

  return time;
}

function Portrait({
  slug,
  index,
  total,
  time,
  progress,
  pauseOrbit,
  scatter,
}: {
  slug: string;
  index: number;
  total: number;
  time: MotionValue<number>;
  progress: MotionValue<number>;
  pauseOrbit: boolean;
  scatter: boolean;
}) {
  const offset = (index / total) * 100;

  // остаток от деления заворачивает движение обратно к началу контура:
  // без него портрет доехал бы до конца пути и встал
  const distance = useTransform(time, (value) => `${(offset + ((value / LAP) * 100)) % 100}%`);

  const portraitSize = SIZES[index % SIZES.length];
  const scatterPose = PORTRAIT_SCATTER[index % PORTRAIT_SCATTER.length];
  const gatherStart = 0.04 + index * 0.012;
  const gatherEnd = 0.39 + index * 0.008;
  const x = useTransform(progress, [gatherStart, gatherEnd], [scatterPose.x, 0]);
  const y = useTransform(progress, [gatherStart, gatherEnd], [scatterPose.y, 0]);
  const scale = useTransform(progress, [gatherStart, gatherEnd], [scatterPose.scale, 1]);
  const rotate = useTransform(progress, [gatherStart, gatherEnd], [scatterPose.rotate, 0]);

  return (
    <motion.div
      className="ring-portrait"
      style={{
        offsetDistance: pauseOrbit ? `${offset}%` : distance,
        width: `calc(var(--ring-portrait) * ${portraitSize})`,
        ...(scatter ? { x, y, scale, rotate } : undefined),
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/pets/cutout-${slug}.webp`} alt="" loading="lazy" decoding="async" />
    </motion.div>
  );
}

function GatheredItem({
  item,
  progress,
  still,
}: {
  item: (typeof GATHER)[number];
  progress: MotionValue<number>;
  still: boolean;
}) {
  const start = 0.72 + item.delay * 0.12;
  const end = start + 0.14;
  const x = useTransform(progress, [start, end], [item.from[0], 0]);
  const y = useTransform(progress, [start, end], [item.from[1], 0]);
  const scale = useTransform(progress, [start, end], [0, 1]);
  const rotate = useTransform(progress, [start, end], [0, item.tilt]);

  return (
    <motion.img
      className="ring-gather__item"
      src={`/wishlist/paper-v2/${item.src}.webp`}
      alt=""
      loading="lazy"
      decoding="async"
      style={
        still
          ? { left: `${item.x}%`, top: `${item.y}%`, width: item.size }
          : {
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: item.size,
              x,
              y,
              scale,
              rotate,
            }
      }
    />
  );
}

/** Счётчик, который добегает до значения один раз, когда его увидели. */
function Count({ to, run, immediate = false }: { to: number; run: boolean; immediate?: boolean }) {
  const value = useMotionValue(0);
  const spring = useSpring(value, { stiffness: 60, damping: 18 });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (run) value.set(to);
  }, [run, to, value]);

  useEffect(() => spring.on("change", (v) => setShown(Math.round(v))), [spring]);

  return <>{immediate ? to : run ? shown : 0}</>;
}

export function RescuedRing({
  total,
  looking,
  dogs,
  cats,
}: {
  total: number;
  looking: number;
  dogs: number;
  cats: number;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useSyncExternalStore(
    subscribeReducedRing,
    getReducedRingSnapshot,
    getRingServerSnapshot,
  );
  const compact = useSyncExternalStore(
    subscribeCompactRing,
    getCompactRingSnapshot,
    getRingServerSnapshot,
  );
  const still = Boolean(reduced);
  const spacious = useSyncExternalStore(subscribeSpaciousRing, getSpaciousRingSnapshot, getRingServerSnapshot);
  const ringVisible = useInView(sectionRef, { margin: "120px 0px 120px 0px" });
  const time = useOrbitTime(!still && ringVisible);

  useEffect(() => {
    const node = sectionRef.current;
    node?.setAttribute("data-ring-hydrated", "");
    return () => node?.removeAttribute("data-ring-hydrated");
  }, []);

  const stickyRef = useRef<HTMLDivElement>(null);
  // The compact story is taller than a viewport; count when the ring itself appears.
  const visualRef = useRef<HTMLDivElement>(null);
  const inView = useInView(visualRef, { once: true, amount: 0.4 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const ambientAmberX = useTransform(scrollYProgress, [0, 1], ["-18vw", "28vw"]);
  const ambientAmberY = useTransform(scrollYProgress, [0, 0.55, 1], ["-8vh", "14vh", "2vh"]);
  const ambientClayX = useTransform(scrollYProgress, [0, 1], ["22vw", "-26vw"]);
  const ambientClayY = useTransform(scrollYProgress, [0, 0.6, 1], ["18vh", "-10vh", "8vh"]);
  const ambientThreadRotate = useTransform(scrollYProgress, [0, 1], [-7, 9]);

  /* Четыре обратимые фазы по прокрутке липкой сцены:
     0.00–0.44  крупная россыпь портретов постепенно собирается в орбиту
     0.08–0.44  крупный центральный заголовок возвращается в центр круга
     0.60–0.82  готовое кольцо уезжает влево, справа выходит колонка
     0.72–1.00  предметы по очереди опускаются к краям колонки
     Все значения привязаны к scrollYProgress: при движении назад кольцо
     собирается, колонка уходит, а предметы разлетаются тем же маршрутом. */
  const titleScale = useTransform(scrollYProgress, [0, 0.08, 0.44, 1], [2.15, 2.15, spacious ? 1.2 : 1, spacious ? 1.2 : 1]);
  const ringScale = useTransform(scrollYProgress, [0, 0.6, 0.8, 1], [1, 1, spacious ? 0.88 : 0.68, spacious ? 0.88 : 0.68]);
  const ringX = useTransform(scrollYProgress, [0, 0.6, 0.8, 1], ["0%", "0%", spacious ? "-20%" : "-30.2%", spacious ? "-20%" : "-30.2%"]);
  const storyX = useTransform(scrollYProgress, [0.66, 0.82], ["60vw", "0vw"]);

  return (
    <section className="ring" id="rescued" ref={sectionRef}>
      <div className="ring-ambient" aria-hidden="true">
        <div className="ring-ambient__canvas">
          <motion.span
            className="ring-ambient__wash ring-ambient__wash--amber"
            style={{ x: ambientAmberX, y: ambientAmberY }}
          />
          <motion.span
            className="ring-ambient__wash ring-ambient__wash--clay"
            style={{ x: ambientClayX, y: ambientClayY }}
          />
          <motion.span
            className="ring-ambient__threads"
            style={{ rotate: ambientThreadRotate }}
          />
        </div>
      </div>

      <div className="ring-sticky" ref={stickyRef}>
        <div className="ring-stage">
          <div className="ring-visual" ref={visualRef}>
            {/* .ring-fit держит масштаб под ширину экрана, .ring-orbit — анимацию:
                оба ставят transform, и на одном узле они бы затёрли друг друга */}
            <div className="ring-fit" aria-hidden="true">
              <motion.div
                className="ring-orbit"
                style={still || compact ? undefined : { scale: ringScale, x: ringX }}
              >
                <div className="ring-glow" />
                {PORTRAITS.map((slug, index) => (
                  <Portrait
                    key={slug}
                    slug={slug}
                    index={index}
                    total={PORTRAITS.length}
                    time={time}
                    progress={scrollYProgress}
                    pauseOrbit={still || !ringVisible}
                    scatter={!compact && !still && ringVisible}
                  />
                ))}
              </motion.div>
            </div>

            {/* Текст использует тот же масштабируемый холст, что и орбита.
                Иначе центр сцены и центр нарисованной траектории расходятся
                на низком desktop, где высоту сцены ограничивает max-height. */}
            <div className="ring-center-fit">
              <motion.div
                className="ring-center"
                style={still || compact ? undefined : { x: ringX, scale: titleScale }}
              >
                <div className="ring-center__copy">
                  <p className="ring-kicker">Под опекой фонда</p>
                  <p className="ring-line">
                    <mark className="ring-mark">
                      <span className="ring-mark__value">
                        <Count to={total} run={inView || still} immediate={still} />
                      </span>
                    </mark>{" "}
                    жизней
                  </p>
                  <p className="ring-line ring-line--second">
                    <mark className="ring-mark ring-mark--clay">
                      <span className="ring-mark__value">
                        <Count to={looking} run={inView || still} immediate={still} />
                      </span>
                    </mark>{" "}
                    ещё ищут дом
                  </p>
                  <p className="ring-foot">
                    {dogs} собак и {cats} кошек. Кого-то забрали из подвала, кого-то нашли на трассе
                    или в промзоне. Теперь каждый под опекой.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          <p className="ring-foot ring-foot--phone">
            {dogs} собак и {cats} кошек. Кого-то забрали из подвала, кого-то нашли на трассе
            или в промзоне. Теперь каждый под опекой.
          </p>

          {/* Колонка выходит на освободившееся место справа: круг не
              исчезает, он отступает и продолжает идти за текстом. */}
          <motion.div
            className="ring-aside"
            style={still || compact ? undefined : { x: storyX }}
          >
            <p className="ring-aside__lead">
              Теперь помощь не держится <span className="ring-aside__lead-accent">на одном человеке.</span>
            </p>
            <p className="ring-aside__note">
              Раньше волонтёры спасали животных поодиночке, за свои деньги и в свободные выходные.
              Помогали ровно стольким, скольких могли вытянуть сами.
            </p>
            <p className="ring-aside__note">
              С фондом можно <mark className="soft">лечить по плану</mark>, а не ждать сбора на срочную
              операцию. У каждого подопечного своя карточка: прививки, анализы, характер, отношения
              с другими животными. В отчёте видно, <mark className="soft">куда ушёл каждый рубль</mark>.
            </p>
            <p className="ring-aside__note">
              У нас нет большого приюта. Каждый из этих {total} живёт у куратора или на передержке,
              то есть в обычном доме. Корм, лекарства и наполнитель нужны им каждый день.
            </p>
            <p className="ring-aside__note">
              Сейчас под опекой {dogs} собак и {cats} кошек. <mark>{looking} всё ещё ждут семью</mark>.
              Это не сухая цифра: у каждого есть имя, характер и своя история.
            </p>
            <Link className="ring-aside__cta" href="/pets">
              Посмотреть всех
            </Link>
          </motion.div>

          {/* Предметы падают и закрепляются по краям текстовой колонки. */}
          <div className="ring-gather" aria-hidden="true">
            {GATHER.map((item) => (
              <GatheredItem
                key={item.src}
                item={item}
                progress={scrollYProgress}
                still={still || compact}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
