"use client";

import { useState, useEffect } from "react";
import { useCursor } from "@/components/ui/cursor-context";
import Image from "next/image";
import { Dog, Cat, HeartHandshake } from "lucide-react";

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

// Light particle dust motes — beautiful cinematic style with depth of field
function LightParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const timer = setTimeout(() => {
      setParticles(
        Array.from({ length: 18 }, (_, i) => {
          // Create depth of field effect: 3 layers
          const layer = i % 3; // 0: background (blurry), 1: midground (sharp), 2: foreground (very blurry)
          
          let size, blur, opacity, zIndex;
          if (layer === 0) {
            // Background (blurry, small)
            size = 2 + Math.random() * 3;
            blur = 2 + Math.random() * 2;
            opacity = 0.4 + Math.random() * 0.4; // Slightly increased for visibility
            zIndex = 0;
          } else if (layer === 1) {
            // Midground (sharp, tiny)
            size = 1 + Math.random() * 1.5;
            blur = 0.5 + Math.random() * 1;
            opacity = 0.6 + Math.random() * 0.4;
            zIndex = 10;
          } else {
            // Foreground (very blurry, large)
            size = 4 + Math.random() * 6;
            blur = 3 + Math.random() * 4;
            opacity = 0.2 + Math.random() * 0.3;
            zIndex = 20;
          }

          return {
            size,
            left: Math.random() * 100,
            top: Math.random() * 100,
            duration: 15 + Math.random() * 20, // Much slower, organic drift
            delay: -(Math.random() * 20), // Negative delay so they are already moving on mount
            opacity,
            driftX: -20 + Math.random() * 40,
            driftY: -30 + Math.random() * -40, // Mostly drift upwards
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
            opacity: calc(var(--base-opacity) * 1.5);
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
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)"
        }}
      >
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none mix-blend-normal"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              background: "#ffffff",
              boxShadow: `0 0 ${p.size * 3}px ${p.size}px rgba(255, 200, 100, 0.8)`,
              filter: `blur(${p.blur}px)`,
              opacity: 0, // Starts at 0, animation handles opacity
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

/** Показатели фонда для витрины на главной. Значения согласуются с CMS вручную. */
const STATS = [
  { icon: Dog, value: 60, plus: true, label: "Собак на кураторстве", accent: false },
  { icon: Cat, value: 25, plus: false, label: "Кошек в безопасности", accent: false },
  { icon: HeartHandshake, value: 100, plus: true, label: "Спасённых жизней", accent: true },
] as const;

export function AboutSection({ imageUrl }: { imageUrl?: string }) {
  const { textEnter, textLeave, imageEnter, imageLeave } = useCursor();
  return (
    <section className="relative py-20 md:py-28 px-6 md:px-12 w-full overflow-hidden" id="about">
      <LightParticles />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Label (Semantic Span inside outline) */}
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] mb-10 text-[#F5A623] inline-block">
          <span aria-hidden="true">[ </span>О нас<span aria-hidden="true"> ]</span>
        </span>

        {/* Massive Centered Editorial Title (Logical Section Heading) */}
        <h2
          className="text-4xl md:text-6xl lg:text-7xl font-serif leading-[1.05] text-center tracking-tight mb-12 max-w-5xl text-stone-800 text-wrap: balance md:text-pretty"
          onMouseEnter={textEnter}
          onMouseLeave={textLeave}
        >
          Небольшая команда, большое <span className="italic font-light text-[#F5A623]">дело</span>
        </h2>

        {/* Subtitle / Description */}
        <p className="text-lg md:text-2xl font-light opacity-60 text-center max-w-4xl leading-relaxed mb-12 md:mb-16">
          Мы — волонтёры из Ярославля с многолетним стажем. В октябре 2024 объединились в фонд, чтобы помогать системно. Сейчас на попечении 85 хвостиков — и каждому мы ищем свою семью.
        </p>

        {/* Cinematic Integrated Block */}
        <div className="w-full relative flex flex-col items-center">
          
          {/* Overlapping Floating Stats - Semantic list */}
          {/*
            На мобильном карточка — строка: значок слева, число и подпись справа.
            Раньше на узком экране каждая растягивалась во всю ширину вокруг
            одинокой цифры по центру и выглядела пустой.
          */}
          <ul className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 px-4 md:px-12 mb-8 md:-mb-12 relative z-20">
            {STATS.map(({ icon: Icon, value, plus, label, accent }) => (
              <li
                key={label}
                className="flex items-center gap-4 rounded-3xl bg-[#FDFBF7]/70 p-4 backdrop-blur-md md:flex-col md:justify-center md:gap-1 md:bg-transparent md:p-4 md:text-center md:backdrop-blur-none"
              >
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-2xl md:size-14 md:rounded-full ${accent ? "bg-[#F5A623] text-stone-900" : "bg-stone-900/5 text-stone-700"}`}
                  aria-hidden="true"
                >
                  <Icon className="size-6 md:size-7" strokeWidth={1.75} />
                </span>
                <span className="flex min-w-0 flex-col md:items-center">
                  <span
                    className={`font-serif text-4xl leading-none tabular-nums md:text-6xl lg:text-[5.5rem] ${accent ? "text-[#F5A623]" : "text-stone-800"}`}
                  >
                    {value}
                    {plus ? <span className={accent ? "font-light text-stone-800" : "font-light text-[#F5A623]"}>+</span> : null}
                  </span>
                  <span
                    className={`mt-1 text-[11px] font-bold uppercase tracking-[0.16em] md:mt-2 md:text-xs md:tracking-[0.2em] ${accent ? "text-[#F5A623]" : "opacity-50"}`}
                  >
                    {label}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {/* Panoramic Image Container */}
          <div 
            className="w-full aspect-video md:aspect-21/9 rounded-4xl md:rounded-[3rem] overflow-hidden bg-gradient-to-br from-stone-200/50 to-[#F5A623]/20 relative shadow-2xl shadow-[#F5A623]/10 z-10 cursor-none"
            onMouseEnter={imageEnter}
            onMouseLeave={imageLeave}
          >
            <Image
              src={imageUrl || "/photo-placeholder.jpg"}
              alt="Собаки в приюте Светлый на прогулке"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              className="object-cover transition-transform duration-[1.5s] motion-safe:hover:scale-105"
            />
            {/* Subtle overlay for text legibility and aesthetic premium feel */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/15 via-transparent to-transparent pointer-events-none" />
          </div>

        </div>

      </div>
    </section>
  );
}
