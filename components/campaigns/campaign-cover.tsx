"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScroll } from "framer-motion";
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
 * фигуры, крупная смешанная типографика в пустой середине, вырезки переходят
 * через шов между секциями.
 *
 * Прямоугольников в сцене нет. До этого обложка была фотополосой, и владелец
 * отклонил её вместе с шестью другими заходами: в референсах фотополос нет ни
 * одной, там всё вырезано и лежит на цвете.
 *
 * Вырезки настоящие: подопечные приюта из `public/pets`, прошедшие числовой
 * отсев по docs/pet-cutout-standard.md. Главная выходит за нижнюю кромку
 * секции и ложится на следующее поле.
 *
 * Разбор секций в docs/campaigns-scroll-plan.md.
 */

const money = (value: number) => `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;

/**
 * Кто лежит на поле и где.
 *
 * Имена настоящие, это подопечные приюта. Капрал стоит главным: по нему снята
 * планка вырезки, остальные меряются по нему. Размеры и места подобраны так,
 * чтобы коллаж читался несобранным: одинаковые размеры и ровный ряд сразу
 * превращают его обратно в полосу.
 */
const PETS = [
  {
    src: "/pets/cutout-kapral.webp",
    name: "Капрал",
    small: false,
    style: { right: "2%", bottom: "-8%", height: "94%" },
    drift: -54,
  },
  {
    src: "/pets/cutout-dzhek.webp",
    name: "Джек",
    small: true,
    style: { left: "37%", top: "2%", height: "32%" },
    drift: -38,
  },
  {
    src: "/pets/cutout-lakki.webp",
    name: "Лакки",
    small: true,
    style: { left: "33%", bottom: "0%", height: "42%" },
    drift: -26,
  },
];

export function CampaignCover({ summary }: { summary: CampaignSummary }) {
  const still = useMotionPreference();
  const sectionRef = useRef<HTMLElement>(null);

  /* Прогресс идёт по уходу обложки вверх: она стоит первой на странице, и
     ничего другого у неё нет. К первому кадру обложка уже целиком в экране. */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  return (
    <section className="camp-cover" ref={sectionRef}>
      <div aria-hidden="true" className="camp-cover__field">
        <Drift className="camp-cover__dots" distance={-14} progress={scrollYProgress} still={still} />
        <Drift className="camp-cover__disc" distance={-22} progress={scrollYProgress} still={still} />

        {PETS.map((pet) => (
          <Drift
            className="camp-cover__pet"
            distance={pet.drift}
            key={pet.src}
            progress={scrollYProgress}
            small={pet.small}
            still={still}
            style={pet.style}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" src={pet.src} />
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
  );
}
