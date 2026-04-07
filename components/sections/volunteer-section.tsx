"use client";

import { Mail } from "lucide-react";

interface Props {
  imageEnter: () => void;
  imageLeave: () => void;
}

export function VolunteerSection({ imageEnter, imageLeave }: Props) {
  return (
    <section
      className="relative py-24 md:py-32 flex items-center justify-center text-center overflow-hidden"
      id="volunteer"
      onMouseEnter={imageEnter}
      onMouseLeave={imageLeave}
    >
      {/* Background — gradient only, no placeholder text */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-linear-to-br from-[#262420] via-[#3d362b] to-[#262420]" />
        <div className="absolute inset-0 bg-linear-to-b from-[#1c1c1c]/50 via-transparent to-[#1c1c1c]/50" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6">
        <h2 className="text-4xl md:text-7xl font-bold uppercase tracking-tighter mb-6 text-white">
          Стань частью<br />
          <span className="font-serif italic text-amber-500">Команды</span>
        </h2>
        <p className="text-lg md:text-xl text-white/50 mb-10 font-light max-w-lg mx-auto">
          Нам нужны фотографы, автоволонтеры и просто люди с большим сердцем для выгула собак.
        </p>
        <a
          href="mailto:help@svetly.ru?subject=Хочу стать волонтером"
          className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-amber-500 transition-colors pointer-events-auto cursor-none"
        >
          <Mail size={16} /> Отправить заявку
        </a>
      </div>
    </section>
  );
}
