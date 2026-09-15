"use client";

import { useRef } from "react";
import { MotionConfig, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { ArrowDown } from "lucide-react";

import type { CampaignSummary } from "@/lib/campaigns/summary";
import { plural } from "@/lib/reports/shelter-scales";
import { Drift } from "@/components/campaigns/collage-drift";
import { useMotionPreference } from "@/components/reports/use-motion-preference";
import { useLenis } from "@/components/ui/smooth-scroll";

/**
 * Обложка страницы сборов: коллаж.
 *
 * Устройство с обоих референсов. Типографика по центру поля, как у Vogue и
 * Wikimedia: «Все» гротеском и «сборы» на янтарной плашке в одну строку.
 * По углам поля четыре группы сопоставимого веса, и каждая уходит за свою
 * кромку.
 *
 * Группа это связка «фигура и вырезка на ней», собранная разметкой, а не
 * процентами по полю. Так было не всегда, и вот почему пришлось: холст у
 * всех вырезок квадратный, 620 на 620, а собака внутри занимает от трети
 * ширины (Капрал) до девяти десятых (Мира). Круг, поставленный процентами
 * от поля, совпадал с боксом вырезки, но не с самой собакой, и группы
 * разъезжались тем сильнее, чем уже была вырезка. Теперь круг лежит внутри
 * группы и считается от её размера.
 *
 * Механики оттуда же. Мышиный параллакс: группы едут за курсором, каждая на
 * свою глубину, как головы на обложке Vogue (там сдвиг доходит до ста
 * тридцати пикселей, замерено в браузере). Внутри группы круг едет вдвое
 * медленнее вырезки: глубина есть, а группа не рвётся. Пружина при
 * загрузке, дрейф по прокрутке с разной скоростью.
 *
 * Строка под заголовком не перечисляет нужды: сборы бывают на что угодно,
 * от корма до машины, и список из трёх слов врал бы. Кнопка ведёт к
 * каталогу на этой же странице, а не на главную.
 *
 * Разбор секций в docs/campaigns-scroll-plan.md.
 */

const RUB = new Intl.NumberFormat("ru-RU");
const money = (value: number) => `${RUB.format(Math.round(value))} ₽`;

/**
 * Группы по углам поля. Места и размеры заданы в стилях по модификатору,
 * здесь только движение: путь по прокрутке, поворот, глубина под мышь и
 * очередь появления.
 *
 * Глубина не привязана к размеру: на референсе мелкая голова в углу едет
 * меньше средней у заголовка. Здесь дальше всех едут мелкие по краям, а
 * главная группа, на которой держится композиция, едет меньше всех.
 *
 * Фигура у каждой своя и сдвинута в свою сторону: одинаковый круг под
 * каждой вырезкой читается штампом, а не коллажем.
 */
const UNITS = [
  {
    src: "/pets/cutout-kapral.webp",
    name: "Капрал",
    mod: "lead",
    small: false,
    shape: "disc",
    drift: -60,
    rotate: 0,
    depth: 0.4,
    delay: 0.08,
  },
  {
    src: "/pets/cutout-mira.webp",
    name: "Мира",
    mod: "mira",
    small: false,
    shape: "disc",
    drift: -105,
    rotate: 3,
    depth: 0.72,
    delay: 0.26,
  },
  {
    src: "/pets/cutout-dzhessi.webp",
    name: "Джесси",
    mod: "dzhessi",
    small: true,
    shape: "dots",
    drift: -165,
    rotate: -7,
    depth: 1,
    delay: 0.4,
  },
  {
    src: "/pets/cutout-dzhek.webp",
    name: "Джек",
    mod: "dzhek",
    small: true,
    shape: "disc",
    drift: -140,
    rotate: 6,
    depth: 0.86,
    delay: 0.5,
  },
];

const spring = { type: "spring", stiffness: 120, damping: 14, mass: 0.9 } as const;

/** Слой, который едет за курсором на свою глубину. */
function Mouse({
  x,
  y,
  depth,
  still,
  className,
  children,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  depth: number;
  still: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const dx = useTransform(x, (value) => value * depth * 110);
  const dy = useTransform(y, (value) => value * depth * 60);
  return (
    <motion.div className={className ?? "camp-cover__mouse"} style={still ? undefined : { x: dx, y: dy }}>
      {children}
    </motion.div>
  );
}

export function CampaignCover({ summary }: { summary: CampaignSummary }) {
  const still = useMotionPreference();
  const sectionRef = useRef<HTMLElement>(null);
  const { getLenis } = useLenis();

  /* Прогресс идёт по уходу обложки вверх: она стоит первой на странице, и
     ничего другого у неё нет. К первому кадру обложка уже целиком в экране,
     поэтому отсчёт слоёв от начала, а не от середины пути. */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /* Курсор в долях поля от центра, от −0,5 до 0,5. Пружина, чтобы слои
     догоняли курсор мягко, а не дёргались за ним. */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const softX = useSpring(mouseX, { stiffness: 55, damping: 16, mass: 0.6 });
  const softY = useSpring(mouseY, { stiffness: 55, damping: 16, mass: 0.6 });

  /* Кнопка ведёт к каталогу ниже на этой же странице. Ссылка, а не кнопка:
     без JS якорь всё равно приводит куда нужно; с плавной прокруткой едет
     через неё, без неё нативно. */
  const goToList = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("camp-list");
    if (!target) return;
    event.preventDefault();
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { offset: -8, duration: 1.1 });
    else target.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
  };

  return (
    <MotionConfig reducedMotion="user">
      <section
        className="camp-cover"
        ref={sectionRef}
        onMouseMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          mouseX.set((event.clientX - box.left) / box.width - 0.5);
          mouseY.set((event.clientY - box.top) / box.height - 0.5);
        }}
        onMouseLeave={() => {
          mouseX.set(0);
          mouseY.set(0);
        }}
      >
        <div aria-hidden="true" className="camp-cover__field">
          {UNITS.map((unit) => (
            <Drift
              className={`camp-cover__unit camp-cover__unit--${unit.mod}`}
              distance={unit.drift}
              rotate={unit.rotate}
              origin="start"
              key={unit.src}
              progress={scrollYProgress}
              small={unit.small}
              still={still}
            >
              {/* Фигура внутри группы: круг или сетка точек. Едет вдвое
                  медленнее вырезки, поэтому глубина есть, а группа цела. */}
              <Mouse className="camp-cover__shape" depth={unit.depth * 0.45} still={still} x={softX} y={softY}>
                {unit.shape === "disc" ? (
                  <motion.i initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring, delay: unit.delay - 0.06 }} />
                ) : (
                  <motion.i initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: unit.delay }} />
                )}
              </Mouse>
              <Mouse className="camp-cover__mouse" depth={unit.depth} still={still} x={softX} y={softY}>
                <motion.img
                  alt=""
                  src={unit.src}
                  initial={{ opacity: 0, scale: 0.55, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ ...spring, delay: unit.delay, opacity: { duration: 0.25, delay: unit.delay } }}
                />
              </Mouse>
            </Drift>
          ))}
        </div>

        <div className="camp-inner camp-cover__copy">
          <p className="camp-kicker">Чем помочь прямо сейчас</p>
          <h1>
            Все <em>сборы</em>
          </h1>
          <p className="camp-cover__lead">
            Каждый сбор закрывает <mark className="camp-mark camp-mark--amber">одну конкретную нужду</mark> приюта,
            и по каждому видно, <mark className="camp-mark camp-mark--moss">сколько уже собрано</mark>. Сейчас
            открыто{" "}
            <strong>
              {summary.funds} {plural(summary.funds, "сбор", "сбора", "сборов")}
            </strong>
            , до всех целей не хватает <strong>{money(summary.rest)}</strong>.
          </p>
          <a className="camp-btn camp-cover__cta" href="#camp-list" onClick={goToList}>
            Помочь
            <ArrowDown aria-hidden="true" size={17} />
          </a>
        </div>
      </section>
    </MotionConfig>
  );
}
