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
 * Обложка страницы сборов: коллаж из кадров приюта.
 *
 * Вокруг типографики лежат настоящие снимки: руки волонтёра на морде собаки,
 * котёнок на руках, пёс, встающий лапами к человеку, общий выход на выгул.
 * У каждого своя форма, свой наклон и свой путь по прокрутке; справа внизу
 * вырезка подопечного на янтарном круге уходит лапами через шов в каталог.
 *
 * Формы задаёт CSS, а не запечённая маска: кадр остаётся прямоугольным, и
 * круг или арку из него делает скругление. Так кадр можно переснять, не
 * перерисовывая ассет.
 *
 * Мышиного параллакса здесь больше нет. Слои ехали за курсором через пружину,
 * и на каждом кадре их смещение пересчитывалось в доли пикселя: коллаж мелко
 * дрожал, пока мышь была над полем. Дрейф по прокрутке остался, он идёт
 * редкими шагами и не дрожит.
 *
 * Кадры выбраны из медиатеки CMS и обрезаны под формы; исходники и размеры
 * перечислены в docs/campaigns-scroll-plan.md.
 */

const RUB = new Intl.NumberFormat("ru-RU");
const money = (value: number) => `${RUB.format(Math.round(value))} ₽`;

/**
 * Слои коллажа. Места и формы заданы в стилях по модификатору, здесь путь по
 * прокрутке, наклон и очередь появления.
 *
 * Дальше всех уезжают мелкие кадры по краям, меньше всех главная вырезка, на
 * которой держится композиция: то, что мельче, читается ближним.
 */
const SHOTS = [
  {
    mod: "care",
    src: "/campaigns/hero/care.webp",
    alt: "Волонтёр держит морду собаки в ладонях",
    drift: -150,
    rotate: -4,
    delay: 0.18,
    small: false,
  },
  {
    mod: "greet",
    src: "/campaigns/hero/greet.webp",
    alt: "Пёс встаёт лапами на волонтёра",
    drift: -95,
    rotate: 3,
    delay: 0.3,
    small: false,
  },
  {
    mod: "kitten",
    src: "/campaigns/hero/kitten.webp",
    alt: "Рыжий котёнок на руках",
    drift: -170,
    rotate: 5,
    delay: 0.42,
    small: true,
  },
  {
    mod: "team",
    src: "/campaigns/hero/team.webp",
    alt: "Волонтёры вывели собак на прогулку",
    drift: -60,
    rotate: -2,
    delay: 0.52,
    small: true,
  },
];

const spring = { type: "spring", stiffness: 110, damping: 15, mass: 0.9 } as const;

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
        <div className="camp-cover__field">
          <Drift
            className="camp-cover__dots"
            distance={70}
            origin="start"
            progress={scrollYProgress}
            still={still}
          >
            <motion.i
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.5 }}
            />
          </Drift>

          {SHOTS.map((shot) => (
            <Drift
              className={`camp-cover__shot camp-cover__shot--${shot.mod}`}
              distance={shot.drift}
              key={shot.mod}
              origin="start"
              progress={scrollYProgress}
              rotate={shot.rotate}
              small={shot.small}
              still={still}
            >
              <motion.img
                alt={shot.alt}
                decoding="async"
                initial={{ opacity: 0, scale: 0.86, rotate: shot.rotate > 0 ? -5 : 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                src={shot.src}
                transition={{ ...spring, delay: shot.delay, opacity: { duration: 0.3, delay: shot.delay } }}
              />
            </Drift>
          ))}

          {/* Подопечный на янтарном круге: единственная вырезка на поле, она
              же переход через шов в каталог. */}
          <Drift
            aria-hidden="true"
            className="camp-cover__pet"
            distance={-70}
            origin="start"
            progress={scrollYProgress}
            still={still}
          >
            <i />
            <motion.img
              alt=""
              initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              src="/pets/cutout-kapral.webp"
              transition={{ ...spring, delay: 0.08, opacity: { duration: 0.25, delay: 0.08 } }}
            />
          </Drift>
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
