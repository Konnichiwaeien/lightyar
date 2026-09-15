"use client";

import { useRef } from "react";
import { MotionConfig, motion, useScroll } from "framer-motion";
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
 * Движение. При загрузке фигуры и вырезки вскакивают пружиной по очереди,
 * дальше слои плывут по прокрутке, каждый со своей скоростью и поворотом.
 *
 * Мышиный параллакс здесь был и снят. Слои ехали за курсором через пружину,
 * и на каждом кадре их смещение пересчитывалось в доли пикселя: коллаж мелко
 * дрожал, пока мышь была над полем.
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
    delay: 0.5,
  },
];

const spring = { type: "spring", stiffness: 120, damping: 14, mass: 0.9 } as const;

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
      <section className="camp-cover" ref={sectionRef}>
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
              {/* Фигура внутри группы: круг или сетка точек. */}
              <span className="camp-cover__shape">
                {unit.shape === "disc" ? (
                  <motion.i initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring, delay: unit.delay - 0.06 }} />
                ) : (
                  <motion.i initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: unit.delay }} />
                )}
              </span>
              <motion.img
                alt=""
                src={unit.src}
                initial={{ opacity: 0, scale: 0.55, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ ...spring, delay: unit.delay, opacity: { duration: 0.25, delay: unit.delay } }}
              />
            </Drift>
          ))}
        </div>

        <div className="camp-inner camp-cover__copy">
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
