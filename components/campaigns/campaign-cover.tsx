"use client";

import { useRef } from "react";
import Link from "next/link";
import { MotionConfig, motion, useScroll } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import type { CampaignSummary } from "@/lib/campaigns/summary";
import { plural } from "@/lib/reports/shelter-scales";
import { Drift } from "@/components/campaigns/collage-drift";
import { useMotionPreference } from "@/components/reports/use-motion-preference";

/**
 * Обложка страницы сборов: коллаж.
 *
 * Грамматика взята с референсов и подтверждена владельцем 15 сентября: плоское
 * цветное поле, поверх него свободно лежащие вырезки, за ними геометрические
 * фигуры, крупная смешанная типографика, вырезки переходят через шов между
 * секциями.
 *
 * Движение двух родов. При загрузке вырезки и круг вскакивают на поле
 * пружиной, по очереди: это первое, что видит читатель, и поле не должно
 * лежать мёртвым. Дальше по прокрутке слои разъезжаются с разной скоростью,
 * а мелкие вырезки ещё и поворачиваются: так коллаж отличается от наклейки.
 *
 * Вырезки настоящие: подопечные приюта из `public/pets`, прошедшие числовой
 * отсев по docs/pet-cutout-standard.md. Капрал и Лакки выходят за нижнюю
 * кромку и ложатся на поле каталога; под них у каталога оставлен отступ,
 * чтобы лапы не наступали на фильтр.
 *
 * Разбор секций в docs/campaigns-scroll-plan.md.
 */

const money = (value: number) => `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;

/**
 * Кто лежит на поле. Места заданы в стилях по модификатору, здесь только
 * движение: путь по прокрутке, поворот и очередь появления.
 *
 * Имена настоящие, это подопечные приюта. Капрал стоит главным: по нему снята
 * планка вырезки, остальные меряются по нему. Чем мельче вырезка, тем дальше
 * она уезжает и тем сильнее поворачивается: мелкое читается как ближнее.
 */
const PETS = [
  { src: "/pets/cutout-kapral.webp", name: "Капрал", mod: "lead", small: false, drift: -70, rotate: 0, delay: 0.1 },
  { src: "/pets/cutout-lakki.webp", name: "Лакки", mod: "lakki", small: true, drift: -130, rotate: 5, delay: 0.32 },
  { src: "/pets/cutout-dzhek.webp", name: "Джек", mod: "dzhek", small: true, drift: -190, rotate: -9, delay: 0.46 },
];

const spring = { type: "spring", stiffness: 120, damping: 14, mass: 0.9 } as const;

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

  return (
    <MotionConfig reducedMotion="user">
      <section className="camp-cover" ref={sectionRef}>
        <div aria-hidden="true" className="camp-cover__field">
          <Drift className="camp-cover__dots" distance={90} origin="start" progress={scrollYProgress} still={still}>
            <motion.i initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.5 }} />
          </Drift>
          <Drift className="camp-cover__disc" distance={140} origin="start" progress={scrollYProgress} still={still}>
            <motion.i initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring, delay: 0.05 }} />
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
              <motion.img
                alt=""
                src={pet.src}
                initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ ...spring, delay: pet.delay, opacity: { duration: 0.25, delay: pet.delay } }}
              />
            </Drift>
          ))}
        </div>

        <div className="camp-inner camp-cover__copy">
          <p className="camp-kicker">Чем помочь прямо сейчас</p>
          <h1>
            Открытые
            <em>сборы</em>
          </h1>
          <p className="camp-cover__lead">
            Каждый сбор закрывает одну нужду приюта: корм, лечение, тёплые вольеры. Сейчас открыто{" "}
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
