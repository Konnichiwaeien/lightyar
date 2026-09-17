"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, PawPrint } from "lucide-react";
import { useCursor } from "@/components/ui/cursor-context";
import Image from "next/image";
import Link from "next/link";

interface PetCardData {
  id: string;
  slug?: string;
  name: string;
  tag: string;
  image: string;
}

interface DogsStoriesSectionProps {
  initialPets?: PetCardData[];
}

export function DogsStoriesSection({ initialPets = [] }: DogsStoriesSectionProps) {
  const { textEnter, textLeave, imageEnter, imageLeave } = useCursor();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Pan the strip smoothly from start to the absolute right edge of the content
  const x = useTransform(scrollYProgress, [0, 1], ["calc(0% + 0vw)", "calc(-100% + 100vw)"]);

  const fallbackPets: PetCardData[] = [
    { id: "baikal", name: "Байкал", tag: "Найден на трассе", image: "" },
    { id: "gerda", name: "Герда", tag: "Робкая и нежная", image: "" },
    { id: "graf", name: "Граф", tag: "Знает команды", image: "" },
    { id: "malysh", name: "Малыш", tag: "Спасен с промзоны", image: "" },
  ];

  const petsToUse = initialPets.length > 0 ? initialPets : fallbackPets;

  const cards = [
    ...petsToUse.map((p) => ({ ...p, isLink: false })),
    { id: "catalog", name: "Все хвостики", tag: "Каталог", image: "", isLink: true },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative h-[250vh]"
      id="pets"
    >
      <div className="pet-stories__stage sticky top-0 flex flex-col justify-center overflow-hidden">
        {/* Header */}
        <div className="mb-6 px-6 md:mb-10 md:px-12">
          <h2
            className="text-[10vw] md:text-[8vw] leading-none font-bold uppercase tracking-tighter"
            onMouseEnter={textEnter}
            onMouseLeave={textLeave}
          >
            Они <br />
            <span className="text-amber-500 italic font-serif">ищут</span> дом.
          </h2>
        </div>

        {/* Horizontal cards */}
        <motion.div
          style={{ x }}
          className="flex gap-5 md:gap-8 px-6 md:px-12 w-max will-change-transform"
        >
          {cards.map((dog, i) => (
            <div
              key={i}
              className="pet-story-card group relative shrink-0 overflow-hidden rounded-2xl bg-[#e4dfd5] md:rounded-3xl"
              onMouseEnter={dog.isLink ? textEnter : imageEnter}
              onMouseLeave={dog.isLink ? textLeave : imageLeave}
            >
              {!dog.isLink ? (
                <Link
                  href={`/pets/${dog.slug || dog.id}`}
                  className="absolute inset-0 block focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-hidden rounded-2xl md:rounded-3xl"
                >
                  {dog.image ? (
                    <Image
                      src={dog.image}
                      alt={dog.name}
                      fill
                      sizes="(max-width: 640px) 78vw, (max-width: 768px) 55vw, (max-width: 1024px) 32vw, 28vw"
                      className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f4ece1]">
                      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xs mb-3 text-amber-500/60">
                        <PawPrint size={40} strokeWidth={1.5} aria-hidden="true" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1c]/40 text-center">Фото скоро появится</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-stone-950 via-stone-900/40 to-transparent z-10" />
                  <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white z-20">
                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 mb-3 block">
                        {dog.tag}
                      </span>
                      <h3 className="text-3xl md:text-4xl font-serif italic mb-3">{dog.name}</h3>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-[10px] uppercase tracking-widest border-b border-amber-500 pb-1 inline-block text-white/80">
                        Познакомиться с {dog.name} →
                      </span>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/pets"
                  className="absolute inset-0 bg-stone-900 flex items-center justify-center transition-all duration-500 group-hover:bg-amber-500 focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-hidden rounded-2xl md:rounded-3xl"
                >
                  <div className="text-center text-white">
                    <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter mb-4">
                      Все<br />хвостики
                    </h3>
                    <ArrowRight size={24} className="mx-auto group-hover:translate-x-2 transition-transform" aria-hidden="true" />
                  </div>
                </Link>
              )}
            </div>
          ))}
        </motion.div>

        {/* Scroll progress */}
        <div className="mt-4 px-6 md:mt-6 md:px-12" aria-hidden="true">
          <div className="w-48 h-1 bg-stone-200 rounded-full overflow-hidden">
            <motion.div
              style={{ scaleX: scrollYProgress }}
              className="h-full bg-amber-500 origin-left"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
