"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useMotionPreference } from "./use-motion-preference";

/**
 * Первый экран раздела.
 *
 * Вместо одной маски с видео здесь сменяют друг друга настоящие подопечные:
 * фотографии из Strapi с вырезанным фоном, все вписаны в один бокс и прижаты
 * к низу, поэтому при смене собака не прыгает по размеру. Смена медленная,
 * через растворение: страница про отчётность, а не карусель.
 *
 * Форма под ними не круг, а пятно, которое медленно перетекает из одного
 * очертания в другое. Морф идёт на border-radius: контур не перерисовывается
 * на каждом кадре, работает композитор.
 *
 * Заголовок набран тем же Playfair, что и заголовки секций: гротеск Black
 * капителью давал чёрный кирпич и спорил с остальной страницей.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Оформительские портреты, а не выдача из базы. Кадры отобраны по маске:
 * силуэт нигде не касается рамки снимка, поэтому лапы целые, а не срезаны
 * краем кадра. Имена настоящие, это подопечные приюта.
 *
 * Вырезка держится только на ровном светлом фоне, поэтому все снимки зимние:
 * по летней траве заливка от края останавливается и тащит землю с собакой.
 */
const PETS = [
  { src: "/reports/pets/taya.webp", name: "Тая" },
  { src: "/reports/pets/dzhin.webp", name: "Джин" },
  { src: "/reports/pets/ilyusha.webp", name: "Илюша" },
  { src: "/reports/pets/kapral.webp", name: "Капрал" },
  { src: "/reports/pets/matilda.webp", name: "Матильда" },
  { src: "/reports/pets/barni.webp", name: "Барни" },
  { src: "/reports/pets/dzhena.webp", name: "Джена" },
] as const;

const HOLD_MS = 6200;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const rise = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
};

export function ReportsHero() {
  const [active, setActive] = useState(0);
  const reduced = useMotionPreference();
  const goToOverview = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("itogi");
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", "#itogi");
  };

  // Кадры сменяются только при живом движении: при просьбе его убрать
  // остаётся первый портрет, а морф формы гасится в CSS.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((index) => (index + 1) % PETS.length), HOLD_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="reports-hero">
      <div className="reports-wrap reports-hero-layout">
        <motion.div className="reports-hero-copy" variants={stagger} initial={reduced ? "visible" : "hidden"} animate="visible">
          <motion.h1 variants={rise}>
            <span>
              <span className="reports-mark">Считайте</span> вместе с нами
            </span>
            <em>отчёты, документы, имена</em>
          </motion.h1>
          {/* Кнопка внизу колонки: заголовок и она держат экран за два угла,
              а между ними остаётся воздух. Плавно ведёт ко второй секции;
              при «меньше движения» прыжок без анимации. */}
          <motion.a className="reports-hero-cta" href="#itogi" variants={rise} onClick={goToOverview}>
            К отчётам
            <span className="reports-hero-cta-ico" aria-hidden="true">
              <ArrowDown className="reports-pic" />
            </span>
          </motion.a>
        </motion.div>
      </div>

      <div className="reports-hero-stage">
        <motion.div
          className="reports-hero-blob"
          aria-hidden="true"
          initial={reduced ? false : { opacity: 0, scale: 0.78 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.3, ease: EASE }}
        />

        <div className="reports-hero-pets">
          {PETS.map((pet, index) => (
            <Image
              key={pet.src}
              className="reports-hero-pet"
              data-active={index === active}
              src={pet.src}
              alt={`${pet.name} из приюта «Светлый»`}
              width={900}
              height={1150}
              priority={index === 0}
              sizes="(max-width: 900px) 78vw, 42vw"
            />
          ))}
        </div>

      </div>

      <div className="reports-hero-grain" aria-hidden="true" />
    </section>
  );
}
