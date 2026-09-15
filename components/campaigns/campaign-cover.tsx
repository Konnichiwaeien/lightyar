"use client";

import { useRef } from "react";
import Link from "next/link";
import { MotionConfig, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import type { CampaignSummary } from "@/lib/campaigns/summary";
import { plural } from "@/lib/reports/shelter-scales";
import { Drift } from "@/components/campaigns/collage-drift";
import { useMotionPreference } from "@/components/reports/use-motion-preference";

/**
 * Обложка страницы сборов: коллаж.
 *
 * Устройство с обоих референсов. Типографика по центру поля, как у Vogue и
 * Wikimedia: «Все» гротеском и «сборы» на янтарной плашке в одну строку,
 * строка под ними с плашками на ключевых словах. Вырезки подопечных стоят по
 * краям поля и уходят за его кромки, каждая на своей фигуре: Капрал на
 * янтарном круге справа, Мира на моховом слева, Тесси с сеткой точек в
 * левом верхнем углу, Джек на светлом кружке в правом.
 *
 * Механики оттуда же. Мышиный параллакс: вырезки едут за курсором, каждая
 * на свою глубину, как головы на обложке Vogue (там сдвиг доходит до ста
 * тридцати пикселей, замерено в браузере). Пружина при загрузке: фигуры и
 * вырезки вскакивают на поле по очереди. Дрейф по прокрутке с разной
 * скоростью и поворотом.
 *
 * Вырезки настоящие: подопечные приюта из `public/pets`. Капрал лапами
 * выходит за нижнюю кромку на поле каталога; под них у каталога отступ.
 *
 * Разбор секций в docs/campaigns-scroll-plan.md.
 */

const money = (value: number) => `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;

/**
 * Кто лежит на поле. Места заданы в стилях по модификатору, здесь движение:
 * путь по прокрутке, поворот, глубина под мышь и очередь появления.
 *
 * Глубина не привязана к размеру: на референсе мелкая голова в углу едет
 * меньше средней у заголовка. Здесь дальше всех едут мелкие по краям, а
 * главная вырезка, на которой держится композиция, едет меньше всех.
 */
const PETS = [
  { src: "/pets/cutout-kapral.webp", name: "Капрал", mod: "lead", small: false, drift: -70, rotate: 0, depth: 0.45, delay: 0.1 },
  { src: "/pets/cutout-mira.webp", name: "Мира", mod: "mira", small: true, drift: -110, rotate: 3, depth: 0.7, delay: 0.28 },
  { src: "/pets/cutout-tessi.webp", name: "Тесси", mod: "tessi", small: false, drift: -170, rotate: -8, depth: 1, delay: 0.42 },
  { src: "/pets/cutout-dzhek.webp", name: "Джек", mod: "dzhek", small: true, drift: -150, rotate: 7, depth: 0.85, delay: 0.52 },
];

const spring = { type: "spring", stiffness: 120, damping: 14, mass: 0.9 } as const;

/** Слой, который едет за курсором на свою глубину. */
function Mouse({
  x,
  y,
  depth,
  still,
  children,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  depth: number;
  still: boolean;
  children: React.ReactNode;
}) {
  const dx = useTransform(x, (value) => value * depth * 110);
  const dy = useTransform(y, (value) => value * depth * 60);
  return <motion.div className="camp-cover__mouse" style={still ? undefined : { x: dx, y: dy }}>{children}</motion.div>;
}

export function CampaignCover({ summary }: { summary: CampaignSummary }) {
  const still = useMotionPreference();
  const sectionRef = useRef<HTMLElement>(null);

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
          {/* Фигуры за вырезками. Каждая на свою глубину под мышь, как и вырезка над ней. */}
          <Drift className="camp-cover__dots camp-cover__dots--lead" distance={90} origin="start" progress={scrollYProgress} still={still}>
            <Mouse x={softX} y={softY} depth={0.3} still={still}>
              <motion.i initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.5 }} />
            </Mouse>
          </Drift>
          <Drift className="camp-cover__dots camp-cover__dots--tessi" distance={60} origin="start" progress={scrollYProgress} still={still}>
            <Mouse x={softX} y={softY} depth={0.6} still={still}>
              <motion.i initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.7 }} />
            </Mouse>
          </Drift>
          <Drift className="camp-cover__disc camp-cover__disc--lead" distance={140} origin="start" progress={scrollYProgress} still={still}>
            <Mouse x={softX} y={softY} depth={0.3} still={still}>
              <motion.i initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring, delay: 0.05 }} />
            </Mouse>
          </Drift>
          <Drift className="camp-cover__disc camp-cover__disc--mira" distance={100} origin="start" progress={scrollYProgress} small still={still}>
            <Mouse x={softX} y={softY} depth={0.45} still={still}>
              <motion.i initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring, delay: 0.2 }} />
            </Mouse>
          </Drift>
          <Drift className="camp-cover__disc camp-cover__disc--dzhek" distance={120} origin="start" progress={scrollYProgress} small still={still}>
            <Mouse x={softX} y={softY} depth={0.6} still={still}>
              <motion.i initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring, delay: 0.45 }} />
            </Mouse>
          </Drift>

          {PETS.map((pet) => (
            <Drift
              className={`camp-cover__pet camp-cover__pet--${pet.mod}`}
              distance={pet.drift}
              rotate={pet.rotate}
              origin="start"
              key={pet.src}
              progress={scrollYProgress}
              small={pet.small}
              still={still}
            >
              <Mouse x={softX} y={softY} depth={pet.depth} still={still}>
                <motion.img
                  alt=""
                  src={pet.src}
                  initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ ...spring, delay: pet.delay, opacity: { duration: 0.25, delay: pet.delay } }}
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
            Каждый сбор закрывает одну нужду приюта: <mark className="camp-mark camp-mark--amber">корм</mark>,{" "}
            <mark className="camp-mark camp-mark--moss">лечение</mark>,{" "}
            <mark className="camp-mark camp-mark--sheet">тёплые вольеры</mark>. Сейчас открыто{" "}
            <strong>
              {summary.funds} {plural(summary.funds, "сбор", "сбора", "сборов")}
            </strong>
            , и до всех целей не хватает <strong>{money(summary.rest)}</strong>.
          </p>
          <Link className="camp-btn camp-cover__cta" href="/#donate">
            Помочь · 500 ₽
            <ArrowUpRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </section>
    </MotionConfig>
  );
}
