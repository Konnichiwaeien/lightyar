"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Props {
  textEnter: () => void;
  textLeave: () => void;
  imageEnter: () => void;
  imageLeave: () => void;
}

const DOGS = [
  { name: "Байкал", tag: "Найден на трассе", isLink: false },
  { name: "Герда", tag: "Робкая и нежная", isLink: false },
  { name: "Граф", tag: "Знает команды", isLink: false },
  { name: "Малыш", tag: "Спасен с промзоны", isLink: false },
  { name: "Все хвостики", tag: "Каталог", isLink: true },
];

export function DogsStoriesSection({ textEnter, textLeave, imageEnter, imageLeave }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Pan the strip smoothly from start to the absolute right edge of the content
  const x = useTransform(scrollYProgress, [0, 1], ["calc(0% + 0vw)", "calc(-100% + 100vw)"]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[250vh]"
      id="pets"
    >
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        {/* Header - Increased distance to fix overlap with cards */}
        <div className="px-6 md:px-12 mb-10 md:mb-16">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <span className="text-sm font-bold uppercase tracking-[0.2em] opacity-50">[ Ищут дом ]</span>
            <span className="text-xs opacity-30 hidden md:block uppercase tracking-widest">Скролл → панорама</span>
          </div>
          <h2
            className="text-[10vw] md:text-[8vw] leading-none font-bold uppercase tracking-tighter"
            onMouseEnter={textEnter}
            onMouseLeave={textLeave}
          >
            Они <br />
            <span className="text-amber-500 italic font-serif">ищут</span> дом.
          </h2>
        </div>

        {/* Horizontal cards - Using w-max to get absolute correct width for transform */}
        <motion.div
          style={{ x }}
          className="flex gap-5 md:gap-8 px-6 md:px-12 w-max will-change-transform"
        >
          {DOGS.map((dog, i) => (
            <div
              key={i}
              className="relative w-[78vw] sm:w-[55vw] md:w-[32vw] lg:w-[28vw] h-[45vh] md:h-[55vh] shrink-0 group rounded-2xl md:rounded-3xl overflow-hidden"
              onMouseEnter={dog.isLink ? textEnter : imageEnter}
              onMouseLeave={dog.isLink ? textLeave : imageLeave}
            >
              {/* Placeholder bg */}
              <div className="absolute inset-0 bg-linear-to-br from-amber-100/40 via-stone-200/30 to-stone-300/40 opacity-80" />

              {!dog.isLink ? (
                <div className="absolute inset-0 bg-linear-to-t from-stone-900 via-stone-900/40 to-transparent p-6 md:p-8 flex flex-col justify-end text-white">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 mb-3 block">
                      {dog.tag}
                    </span>
                    <h3 className="text-3xl md:text-4xl font-serif italic mb-3">{dog.name}</h3>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-[10px] uppercase tracking-widest border-b border-amber-500 pb-1 inline-block text-white/80">
                      Помочь {dog.name} →
                    </span>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-stone-900 flex items-center justify-center transition-all duration-500 group-hover:bg-amber-500 cursor-none">
                  <div className="text-center text-white">
                    <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter mb-4">
                      Все<br/>хвостики
                    </h3>
                    <ArrowRight size={24} className="mx-auto group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Scroll progress */}
        <div className="px-6 md:px-12 mt-8 md:mt-12">
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
