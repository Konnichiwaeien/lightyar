"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useCursor } from "@/components/ui/cursor-context";
import Image from "next/image";

interface Particle {
  size: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
  opacity: number;
  driftX: number;
  driftY: number;
  blur: number;
  zIndex: number;
}

// Мягкие световые пузырьки с тремя планами глубины.
function LightParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const timer = setTimeout(() => {
      setParticles(
        Array.from({ length: 30 }, (_, i) => {
          const layer = i % 3;
          
          let size, blur, opacity, zIndex;
          if (layer === 0) {
            size = 5 + Math.random() * 5;
            blur = 2 + Math.random() * 3;
            opacity = 0.42 + Math.random() * 0.24;
            zIndex = 0;
          } else if (layer === 1) {
            size = 3 + Math.random() * 3;
            blur = 0.5 + Math.random() * 1.2;
            opacity = 0.58 + Math.random() * 0.24;
            zIndex = 10;
          } else {
            size = 10 + Math.random() * 9;
            blur = 4 + Math.random() * 5;
            opacity = 0.22 + Math.random() * 0.2;
            zIndex = 20;
          }

          return {
            size,
            left: Math.random() * 100,
            top: Math.random() * 100,
            duration: 15 + Math.random() * 20,
            delay: -(Math.random() * 20),
            opacity,
            driftX: -20 + Math.random() * 40,
            driftY: -30 + Math.random() * -40,
            blur: blur,
            zIndex: zIndex
          };
        })
      );
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (particles.length === 0) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes cinematicFloat {
          0% { 
            transform: translate(0, 0); 
            opacity: 0;
          }
          15% {
            opacity: var(--base-opacity);
          }
          50% {
            transform: translate(calc(var(--drift-x) * 0.5), calc(var(--drift-y) * 0.5)); 
            opacity: var(--base-opacity);
          }
          85% {
            opacity: var(--base-opacity);
          }
          100% {
            transform: translate(var(--drift-x), var(--drift-y));
            opacity: 0;
          }
        }
      `}</style>
      <div 
        className="about-light-field absolute inset-0 z-0 h-full w-full pointer-events-none"
        style={{
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)"
        }}
      >
        {particles.map((p, i) => (
          <div
            key={i}
            className="about-light-particle absolute rounded-full pointer-events-none"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              boxShadow: `0 0 ${p.size * 2.6}px ${p.size * 0.7}px rgba(245, 158, 11, 0.48)`,
              filter: `blur(${p.blur}px)`,
              opacity: 0,
              zIndex: p.zIndex,
              animation: `cinematicFloat ${p.duration}s ${p.delay}s ease-in-out infinite`,
              willChange: "transform, opacity",
              // @ts-expect-error CSS custom properties
              "--drift-x": `${p.driftX}vw`,
              "--drift-y": `${p.driftY}vh`,
              "--base-opacity": p.opacity,
            }}
          />
        ))}
      </div>
    </>
  );
}

/**
 * Показатели считаются из карточек животных, а не пишутся руками.
 * Раньше здесь стояли 60/25/100, и секция спорила с кольцом ниже,
 * которое берёт те же величины из CMS.
 *
 * Каждому показателю — вырезанный портрет подопечного. Готовый значок
 * ничего не значит; настоящая собака рядом с числом значит ровно то,
 * о чём число.
 */
/** Число добегает до значения один раз, когда показатель попал в кадр. */
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const value = useMotionValue(0);
  const spring = useSpring(value, { stiffness: 55, damping: 20 });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (seen) value.set(to);
  }, [seen, to, value]);

  useEffect(() => spring.on("change", (v) => setShown(Math.round(v))), [spring]);

  return (
    <span ref={ref} className="tabular-nums">
      {reduced || !seen ? to : shown}
    </span>
  );
}

interface Stat {
  value: number;
  unit: string;
  note: string;
  photo: string;
  mark: string;
}

export function AboutSection({
  imageUrl,
  total,
  dogs,
  adopted,
}: {
  imageUrl?: string;
  total: number;
  dogs: number;
  cats: number;
  adopted: number;
}) {
  const { textEnter, textLeave, imageEnter, imageLeave } = useCursor();

  const stats: Stat[] = [
    { value: total, unit: "под опекой", note: "сейчас", photo: "dzhek", mark: "bg-[#efe3cb]" },
    { value: dogs, unit: "собак", note: "на кураторстве", photo: "mira", mark: "bg-[#f0d7c6]" },
    { value: adopted, unit: "уже дома", note: "нашли семью", photo: "kapral", mark: "bg-[#F5A623]" },
  ];
  return (
    <section className="about-section relative w-full overflow-hidden px-6 pt-20 pb-20 md:px-12 md:pt-28 md:pb-28" id="about">
      <LightParticles />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
        {/* Massive Centered Editorial Title (Logical Section Heading) */}
        <h2
          className="text-4xl md:text-6xl lg:text-7xl font-serif leading-[1.05] text-center tracking-tight mb-12 max-w-5xl text-stone-800 text-wrap: balance md:text-pretty"
          onMouseEnter={textEnter}
          onMouseLeave={textLeave}
        >
          {/* С планшета — две строки: первая чернилами, вторая светлым тоном.
              Одной строкой заголовок читался как сплошная плита. */}
          <span className="block">Небольшая команда,</span>
          <span className="block text-stone-800/55">
            <span className="text-[#F5A623]">большое</span>{" "}
            <span className="italic text-stone-800/85">дело</span>
          </span>
        </h2>

        {/* Subtitle / Description */}
        <p className="max-w-4xl text-center text-lg font-light leading-relaxed text-stone-700/85 mb-12 md:mb-16 md:text-2xl">
          АНБО «Светлый» появилась в Ярославле в октябре 2024 года, но наша команда помогает
          животным уже много лет. Даём им временный дом и уход, учим снова доверять людям
          и ищем ответственных хозяев.
        </p>

        {/* Cinematic Integrated Block */}
        <div className="w-full relative flex flex-col items-center">
          
          {/* Overlapping Floating Stats - Semantic list */}
          {/*
            На мобильном карточка — строка: значок слева, число и подпись справа.
            Раньше на узком экране каждая растягивалась во всю ширину вокруг
            одинокой цифры по центру и выглядела пустой.
          */}
          <ul className="about-stats relative z-20 mb-10 w-full px-2 md:mb-14 md:px-4 lg:px-8 xl:px-12">
            {stats.map(({ value, unit, note, photo, mark }) => (
              <li key={unit} className="about-stat flex min-w-0 items-center">
                {/* мягкий круг позади вырезки — приём из отчётов Wikimedia:
                    он держит силуэт на фоне, не превращая его в карточку */}
                <span className="about-stat__portrait relative grid place-items-end justify-center overflow-visible">
                  {/* пятно неровное: идеальный круг под живым силуэтом
                      читается как значок из набора */}
                  <span
                    className="about-stat__halo absolute inset-0 rounded-[47%_53%_44%_56%_/_52%_45%_55%_48%]"
                    aria-hidden="true"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/pets/cutout-${photo}.webp`}
                    alt=""
                    className="relative h-[108%] w-[104%] max-w-none object-contain object-bottom"
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="about-stat__copy flex min-w-0 flex-col">
                  <span className="about-stat__value font-serif leading-none text-stone-800">
                    <CountUp to={value} />
                  </span>
                  {/* подпись в две строки: единица под маркером сверху,
                      уточнение отдельной строкой — одной строкой оно
                      растягивало карточку и ломало сетку на планшете */}
                  <span className="mt-2 flex flex-col items-start gap-1 text-xs leading-snug md:text-sm lg:text-base">
                    <mark className={`${mark} rounded-sm px-1.5 py-0.5 text-stone-900`}>{unit}</mark>
                    <span className="opacity-55">{note}</span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
          {/* Panoramic Image Container */}
          <div 
            className="about-panorama relative z-10 w-full overflow-hidden rounded-4xl bg-gradient-to-br from-stone-200/50 to-[#F5A623]/20 shadow-2xl shadow-[#F5A623]/10 cursor-none md:rounded-[3rem]"
            onMouseEnter={imageEnter}
            onMouseLeave={imageLeave}
          >
            <Image
              src={imageUrl || "/about/panorama.jpg"}
              alt="Собаки в приюте Светлый на прогулке"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              className="about-panorama__image object-cover transition-transform duration-[1.5s] motion-safe:hover:scale-105"
            />
            {/* Subtle overlay for text legibility and aesthetic premium feel */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/15 via-transparent to-transparent pointer-events-none" />
          </div>

        </div>

      </div>
    </section>
  );
}
