"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useMotionValueEvent,
  type Variants,
} from "framer-motion";
import "./about-narrative.css";

/* ─── Data ───────────────────────────────────────────────── */

const chaptersData = [
  {
    id: "1",
    nav: "АНБО «Светлый»",
    mediaType: "video",
    mediaSrc: "/hero-video.mp4",
    accent: "#f59e0b",
    alt: "Видео-презентация благотворительной организации АНБО Светлый"
  },
  {
    id: "2",
    nav: "Направления помощи",
    mediaType: "image",
    mediaSrc: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1600&q=80",
    accent: "#34d399",
    alt: "Заботливые волонтеры кормят и ласкают собак в приюте Светлый"
  },
  {
    id: "3",
    nav: "История проекта",
    mediaType: "image",
    mediaSrc: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1600&q=80",
    accent: "#a78bfa",
    alt: "Счастливая собака в вольере благотворительного приюта Светлый"
  },
  {
    id: "4",
    nav: "Марина Морозова",
    mediaType: "image",
    mediaSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1600&q=80",
    accent: "#fbbf24",
    alt: "Марина Морозова — соучредитель и руководитель администрации АНБО Светлый"
  },
  {
    id: "5",
    nav: "Светлана Клюкина",
    mediaType: "image",
    mediaSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1600&q=80",
    accent: "#e879a0",
    alt: "Светлана Клюкина — соучредитель, куратор медицинского и юридического контроля"
  },
  {
    id: "6",
    nav: "Андрей Синицын",
    mediaType: "image",
    mediaSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80",
    accent: "#34d399",
    alt: "Андрей Синицын — соучредитель, руководитель материально-технического обеспечения"
  },
  {
    id: "7",
    nav: "Наши результаты",
    mediaType: "image",
    mediaSrc: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=1600&q=80",
    accent: "#60a5fa",
    alt: "Счастливый пес, успешно пристроенный в любящую семью"
  },
  {
    id: "8",
    nav: "Как помочь приюту",
    mediaType: "video",
    mediaSrc: "/hero-video-2.mp4",
    accent: "#f87171",
    alt: "Видео-презентация волонтерской деятельности и прогулок в приюте Светлый"
  },
  {
    id: "9",
    nav: "Частые вопросы",
    mediaType: "image",
    mediaSrc: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=1600&q=80",
    accent: "#4ade80",
    alt: "Собака преданно смотрит в глаза волонтеру на прогулке"
  },
];

const faqData = [
  { q: "Как стать волонтёром?", a: "Напишите нам в социальных сетях или позвоните. Мы приглашаем на первую прогулку с собаками, где вы знакомитесь с командой и подопечными. Никакого специального опыта не нужно — мы всему научим." },
  { q: "Нужен ли опыт работы с животными?", a: "Нет. Главное — желание помогать и ответственный подход. Опытные волонтёры всегда рядом и помогут освоиться. Вы можете начать с простых задач: прогулки, помощь с кормлением." },
  { q: "Где находится приют?", a: "Приют расположен в Ярославской области. Основные площадки волонтёрской активности находятся в Ярославле и Рыбинске. Точный адрес сообщим при первом контакте." },
  { q: "Как помочь финансово?", a: "Вы можете сделать пожертвование на официальные реквизиты АНБО «Светлый» (ОГРН 1247600009590). Все средства идут на корм, ветеринарию и обустройство вольеров." },
];

/* ─── Framer variants ────────────────────────────────────── */

const revealUp: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 25, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─── Count-up hook ──────────────────────────────────────── */

function useCountUp(target: number, isActive: boolean) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!isActive || started.current) return;
    started.current = true;
    let start: number | null = null;
    const duration = 2000;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isActive, target]);

  return count;
}


/* ─── FAQ Item ───────────────────────────────────────────── */

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  const buttonId = `faq-btn-${index}`;
  const panelId = `faq-panel-${index}`;

  const handleToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    // Sync open state with native details element (handles both manual click and browser Find-in-page auto-reveal!)
    setOpen(e.currentTarget.open);
  };

  return (
    <details
      open={open}
      onToggle={handleToggle}
      className="group border-b border-foreground/10 last:border-0 transition-colors duration-300 hover:bg-foreground/[0.015] rounded-xl px-4 -mx-4 list-none [&::-webkit-details-marker]:hidden"
    >
      <summary
        className="w-full flex items-center justify-between py-4.5 gap-4 text-left cursor-pointer transition-colors duration-300 hover:text-amber font-bold text-base sm:text-lg text-foreground list-none select-none outline-hidden focus-visible:text-amber focus-visible:ring-2 focus-visible:ring-amber/50 rounded-lg"
        id={buttonId}
        aria-controls={panelId}
      >
        <span>{q}</span>
        <div className={`w-7 h-7 flex-shrink-0 rounded-full bg-foreground/5 flex items-center justify-center transition-all duration-500 ease-out ${open ? "rotate-45 bg-amber" : ""}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
        </div>
      </summary>
      <motion.div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="overflow-hidden"
        initial={{ height: 0 }}
        animate={{ height: open ? "auto" : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="pb-6 text-sm sm:text-base leading-relaxed text-foreground/80 max-w-[52ch]">{a}</div>
      </motion.div>
    </details>
  );
}

/* ─── Reveal wrapper ─────────────────────────────────────── */

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={revealUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Video Player Helper for Stage ──────────────────────── */

function StageVideo({ src, isActive, title }: { src: string; isActive: boolean; title?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (isActive) {
      ref.current.play().catch(() => {});
    } else {
      ref.current.pause();
    }
  }, [isActive]);

  return (
    <video
      ref={ref}
      className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1s] ease-out will-change-[opacity,transform] ${isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-[1.08] z-0"}`}
      src={src}
      autoPlay={isActive}
      loop
      muted
      playsInline
      title={title}
    />
  );
}

/* ─── Stage (sticky left panel) ──────────────────────────── */

function Stage({ activeChapter }: { activeChapter: string }) {
  return (
    <aside className="hidden lg:block lg:sticky lg:top-0 lg:h-screen lg:w-full lg:overflow-hidden lg:bg-foreground lg:z-1" aria-hidden="true">
      {chaptersData.map((ch) => {
        const isActive = ch.id === activeChapter;
        return ch.mediaType === "video" ? (
          <StageVideo key={ch.id} src={ch.mediaSrc} isActive={isActive} title={ch.alt} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={ch.id}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1s] ease-out will-change-[opacity,transform] ${isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-[1.08] z-0"}`}
            src={ch.mediaSrc}
            alt=""
          />
        );
      })}

      <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-black/40 pointer-events-none z-20" />

      {/* Floating particles */}
      <div className={`absolute pointer-events-none transition-opacity duration-[1s] z-30 ${activeChapter === "2" ? "opacity-100 active" : "opacity-0"}`} style={{ top: "20%", left: "15%" }}>
        <svg className="pd-particle-icon" width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      </div>
      <div className={`absolute pointer-events-none transition-opacity duration-[1s] z-30 ${activeChapter === "6" ? "opacity-100 active" : "opacity-0"}`} style={{ bottom: "30%", right: "20%" }}>
        <svg className="pd-particle-icon" width="60" height="60" viewBox="0 0 24 24" fill="var(--color-amber)"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      </div>
    </aside>
  );
}

/* ─── Chapter Media Helper for Mobile View ──────────────── */

function ChapterMedia({ chId }: { chId: string }) {
  const ch = chaptersData.find((c) => c.id === chId);
  if (!ch) return null;
  const isDarkChapter = chId === "3";
  return (
    <div className={`w-full aspect-[16/10] relative overflow-hidden mb-8 rounded-[1.75rem] shadow-[0_12px_36px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.02)] border lg:hidden ${isDarkChapter ? "border-white/10" : "border-foreground/6"}`}>
      {ch.mediaType === "video" ? (
        <video
          src={ch.mediaSrc}
          autoPlay
          loop
          muted
          playsInline
          title={ch.alt}
          className="w-full h-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ch.mediaSrc}
          alt={ch.alt}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}

/* ─── Interactive Timeline Component ─────────────────────── */

function TimelineItem({
  number,
  year,
  title,
  description,
  isLast,
}: {
  number: number;
  year: string;
  title: string;
  description: string;
  isLast: boolean;
}) {
  const itemRef = useRef<HTMLDivElement>(null);

  // Track scroll of this specific item relative to screen center
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start center", "end center"],
  });

  // Smooth the scroll progress for a high-end line filling animation
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
    restDelta: 0.001,
  });

  const [isActive, setIsActive] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Activate circle when top of item crosses viewport center
    setIsActive(latest > 0);
  });

  return (
    <div ref={itemRef} className={`relative mb-[40px] pl-[46px] sm:mb-[70px] sm:pl-[68px] transition-all duration-500 last:mb-0 ${isActive ? "active" : ""}`}>
      {/* Background Line segment */}
      {!isLast && <div className="absolute left-[15px] sm:left-[21px] top-8 sm:top-11 bottom-[-40px] sm:bottom-[-70px] w-[2px] bg-white/8 rounded-full" />}

      {/* Active Line segment (animated with scaleY) */}
      {!isLast && (
        <motion.div
          className="absolute left-[15px] sm:left-[21px] top-8 sm:top-11 bottom-[-40px] sm:bottom-[-70px] w-[2px] bg-amber shadow-[0_0_8px_var(--color-amber),0_0_20px_rgba(245,158,11,0.35)] rounded-full origin-top will-change-transform z-[1]"
          style={{ scaleY }}
        />
      )}

      {/* Glowing Number Circle Badge */}
      <div className={`absolute left-0 top-0 w-8 h-8 sm:w-11 sm:h-11 rounded-full border-[2px] sm:border-[2.5px] border-amber bg-[#121212] flex items-center justify-center font-serif italic text-sm sm:text-lg text-amber font-extrabold transition-all duration-600 z-[2] shadow-[0_0_0px_transparent] ${isActive ? "bg-amber text-[#121212] border-amber shadow-[0_0_16px_var(--color-amber),0_0_32px_rgba(245,158,11,0.35)] scale-115 -rotate-[5deg]" : ""}`}>
        {number}
      </div>

      {/* Content */}
      <div className={`transition-all duration-700 ease-out will-change-[opacity,transform] ${isActive ? "opacity-100 translate-y-0" : "opacity-25 translate-y-3"}`}>
        <h3 className={`font-sans text-base sm:text-xl font-extrabold mb-1.5 transition-all duration-500 ${isActive ? "text-white" : "text-white/40"}`}>
          <span className={`font-serif italic font-bold transition-all duration-500 ${isActive ? "text-amber" : "text-amber/40"}`}>{year}</span>
          <span className="text-white/15 font-normal"> · </span>
          {title}
        </h3>
        <p className={`text-xs sm:text-base leading-relaxed text-white/45 max-w-[52ch] margin-0 transition-all duration-500 ${isActive ? "text-white/70" : ""}`}>{description}</p>
      </div>
    </div>
  );
}

function Timeline() {
  const milestones = [
    {
      number: 1,
      year: "2021–2023",
      title: "Самостоятельная работа",
      description: "Марина, Светлана и Андрей помогали животным как частные волонтёры: забирали с улиц, лечили и пристраивали. За это время помогли найти дом более чем 40 собакам.",
    },
    {
      number: 2,
      year: "Октябрь 2024",
      title: "Регистрация организации",
      description: "Зарегистрировали АНБО «Светлый» в Минюсте РФ (ОГРН 1247600009590), чтобы объединить усилия и сделать отчётность прозрачной.",
    },
    {
      number: 3,
      year: "2025",
      title: "Строительство вольеров",
      description: "Построили первые 10 тёплых вольеров, обустроили территорию приюта и начали регулярный приём питомцев на постоянное содержание.",
    },
    {
      number: 4,
      year: "2026",
      title: "Настоящее время",
      description: "Развиваем волонтёрскую сеть, координируем помощь в Ярославле и Рыбинске, лечим сложных подопечных и находим им любящие семьи.",
    }
  ];

  return (
    <div className="relative mt-12 flex flex-col">
      {milestones.map((m, idx) => (
        <TimelineItem
          key={m.number}
          number={m.number}
          year={m.year}
          title={m.title}
          description={m.description}
          isLast={idx === milestones.length - 1}
        />
      ))}
    </div>
  );
}

/* ─── Typographic Stats Component ────────────────────────── */

function MinimalStatItem({ value, suffix, label, active }: { value: number; suffix: string; label: string; active: boolean }) {
  const count = useCountUp(value, active);
  return (
    <li className="flex flex-col items-start relative group">
      <div className="font-serif italic text-4xl sm:text-5xl font-bold text-amber leading-none tracking-tight tabular-nums">
        {count}
        <span className="font-serif italic text-amber">{suffix}</span>
      </div>
      <div className="h-[2px] bg-amber/20 my-3.5 w-[60px] rounded-full transition-all duration-500 group-hover:w-full group-hover:bg-amber group-hover:shadow-[0_0_8px_rgba(245,158,11,0.35)]" />
      <div className="text-sm font-bold text-foreground/80 leading-normal max-w-[32ch] transition-colors duration-300 group-hover:text-foreground">{label}</div>
    </li>
  );
}

function MinimalStats() {
  const ref = useRef<HTMLUListElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { value: 10, suffix: "+", label: "лет совокупного опыта у волонтёров приюта" },
    { value: 100, suffix: "+", label: "пристроенных питомцев нашли новые семьи" },
    { value: 20, suffix: "+", label: "активных помощников в нашей дружной команде" },
    { value: 2, suffix: "", label: "ключевых города волонтёрской деятельности" },
  ];

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-9 sm:gap-y-12 sm:gap-x-8 mt-9 w-full list-none p-0" ref={ref}>
      {stats.map((s, i) => (
        <MinimalStatItem
          key={i}
          value={s.value}
          suffix={s.suffix}
          label={s.label}
          active={isInView}
        />
      ))}
    </ul>
  );
}

/* ─── Volunteer Bento Grid Component ────────────────────── */

function VolunteerBento() {
  const items = [
    {
      title: "Выгул собак & социализация",
      desc: "Организуем регулярные поездки в приют по выходным. Прогулки в лесу помогают собакам доверять людям и быстрее социализироваться.",
      size: "large",
      badge: "Самое популярное",
      accent: "var(--color-amber)",
      icon: "🐕"
    },
    {
      title: "Автоволонтёрство",
      desc: "Если у вас есть свободный час и машина — помогите отвезти подопечного в клинику или привезти корма.",
      size: "medium",
      badge: "Всегда актуально",
      accent: "#34d399",
      icon: "🚗"
    },
    {
      title: "Фотосессии & Соцсети",
      desc: "Красивые кадры творят чудеса. Фотографы и авторы помогают животным быстрее находить новый дом.",
      size: "medium",
      badge: "Творчество",
      accent: "#a78bfa",
      icon: "📸"
    },
    {
      title: "Помощь по хозяйству",
      desc: "Утепление будок, ремонт вольеров, мелкое строительство — рабочие руки в приюте ценятся на вес золота.",
      size: "small",
      badge: "Дело",
      accent: "#60a5fa",
      icon: "🛠️"
    },
    {
      title: "Финансовая поддержка",
      desc: "Пожертвование на корма, лекарства или стройматериалы. Любая сумма помогает спасти чью-то жизнь.",
      size: "small",
      badge: "Пожертвования",
      accent: "#e879a0",
      icon: "❤️"
    }
  ];

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mt-9 w-full"
    >
      {items.map((item, idx) => {
        const sizeClass = {
          large: "col-span-1 sm:col-span-2 lg:col-span-6",
          medium: idx === 1 ? "col-span-1 sm:col-span-1 lg:col-span-4" : "col-span-1 sm:col-span-1 lg:col-span-2",
          small: "col-span-1 sm:col-span-1 lg:col-span-3"
        };
        return (
          <motion.div key={idx} variants={cardReveal} className={`bg-foreground/5 p-6 rounded-[2rem] border border-foreground/5 ${sizeClass[item.size as keyof typeof sizeClass]}`}>
            <div className="text-2xl mb-3">{item.icon}</div>
            <h3 className="font-extrabold text-lg mb-2">{item.title}</h3>
            <p className="text-sm text-foreground/70 leading-relaxed">{item.desc}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

export function AboutNarrative() {
  const [activeChapter, setActiveChapter] = useState("1");
  const activeChapterRef = useRef("1");
  const chapterEls = useRef<(HTMLElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // Synchronize ref to avoid stale closures in window event listeners
  useEffect(() => {
    activeChapterRef.current = activeChapter;
  }, [activeChapter]);

  /* ── Chapter detection via scroll midpoint exactly like podarit-dom-preview ── */
  useEffect(() => {
    function update() {
      const mid = window.innerHeight / 2;
      let best: string | null = null;
      let bestDist = Infinity;

      chapterEls.current.forEach((el) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const chMid = (r.top + r.bottom) / 2;
        const dist = Math.abs(chMid - mid);

        if (dist < bestDist) {
          bestDist = dist;
          best = el.dataset.chapter ?? null;
        }
      });

      if (best && best !== activeChapterRef.current) {
        setActiveChapter(best);
      }

      // Progress bar
      const scrollTotal = window.scrollY || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (scrollTotal / height) * 100 : 0;
      if (progressRef.current) {
        progressRef.current.style.width = `${scrolled}%`;
      }
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  /* ── Dark mode class toggle ── */
  useEffect(() => {
    const el = document.querySelector(`.js-pd-chapter[data-chapter="${activeChapter}"]`);
    pageRef.current?.classList.toggle("is-dark-mode", el?.classList.contains("pd-dark") ?? false);
  }, [activeChapter]);

  const scrollTo = useCallback((id: string) => {
    chapterEls.current[parseInt(id) - 1]?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const setRef = useCallback((idx: number) => (el: HTMLElement | null) => { chapterEls.current[idx] = el; }, []);

  /* ── Arrow SVGs ── */
  const ArrowRight = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
  const ArrowDiag = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>;

  return (
    <main className="font-sans bg-background text-foreground antialiased relative" ref={pageRef}>
      <div className="fixed top-0 left-0 h-1 bg-amber w-0 z-[200]" ref={progressRef} />

      {/* Nav dots */}
      <nav className="fixed right-5 lg:right-10 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-[100]" aria-label="Навигация по разделам страницы">
        {chaptersData.map((ch) => (
          <button
            key={ch.id}
            className={`group pd-dot ${activeChapter === ch.id ? "active" : ""}`}
            onClick={() => scrollTo(ch.id)}
            aria-label={`Перейти к разделу: ${ch.nav}`}
            aria-current={activeChapter === ch.id ? "true" : "false"}
            type="button"
          >
            <span className="absolute right-6 top-1/2 -translate-y-1/2 translate-x-2 bg-foreground text-background px-3 py-1.5 rounded-md text-[0.8rem] font-[700] whitespace-nowrap opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 shadow-md transition-all duration-300">
              {ch.nav}
            </span>
          </button>
        ))}
      </nav>

      {/* ── Narrative ── */}
      <div className="relative lg:grid lg:grid-cols-2 lg:items-start">
        <Stage activeChapter={activeChapter} />

        <div className="relative z-10 lg:z-[2]">

          {/* ═══ 1. HERO ═══ */}
          <article ref={setRef(0)} className="relative px-6 py-16 sm:px-10 lg:px-[8vw] lg:py-[12vh] flex flex-col justify-center min-h-[50vh] lg:min-h-screen bg-paper transition-colors duration-800 rounded-none m-0 js-pd-chapter" data-chapter="1">
            <ChapterMedia chId="1" />
            <Reveal>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.08] tracking-tight mb-7 text-balance text-foreground">
                АНБО «Светлый»: помогаем <em className="font-serif italic text-amber">животным</em>
              </h1>
            </Reveal>
            <Reveal>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold leading-normal mb-7 relative before:content-['«'] before:text-amber before:mr-1 after:content-['»'] after:text-amber after:ml-1">
                Объединяем опыт волонтёров и ресурсы неравнодушных людей для <em className="font-serif italic text-amber">системной помощи.</em>
              </p>
            </Reveal>
            <Reveal>
              <p className="text-sm sm:text-base leading-relaxed mb-4.5 max-w-[52ch] text-foreground/80">
                Мы — автономная некоммерческая благотворительная организация, зарегистрированная в <strong className="font-bold text-foreground">октябре 2024 года</strong> в Ярославской области. Наша цель — не просто давать временный приют, а находить животным надёжные семьи и организовывать качественный уход.
              </p>
            </Reveal>
            <Reveal>
              <div className="mt-9 flex flex-col sm:flex-row sm:flex-wrap gap-3.5">
                <button onClick={() => scrollTo("8")} className="relative inline-flex items-center justify-center gap-2.5 bg-amber hover:bg-amber-400 text-foreground px-7 py-3.5 rounded-full font-extrabold text-sm shadow-[0_6px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_12px_30px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 cursor-pointer">{ArrowRight} Стать волонтёром</button>
                <button onClick={() => scrollTo("2")} className="relative inline-flex items-center justify-center gap-2.5 bg-transparent border-2 border-foreground text-foreground px-7 py-3.5 rounded-full font-extrabold text-sm hover:bg-foreground hover:text-background hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 cursor-pointer">{ArrowDiag} Познакомиться с нами</button>
              </div>
            </Reveal>
          </article>

          {/* ═══ 2. MISSION ═══ */}
          <article ref={setRef(1)} className="relative px-6 py-16 sm:px-10 lg:px-[8vw] lg:py-[12vh] flex flex-col justify-center min-h-[50vh] lg:min-h-screen bg-white rounded-[3rem_3rem_0_0] lg:rounded-none transition-colors duration-800 rounded-none m-0 js-pd-chapter" data-chapter="2">
            <ChapterMedia chId="2" />
            <Reveal>
              <div className="inline-flex items-center bg-amber/12 text-amber-800 font-extrabold text-xs uppercase tracking-wider px-3.5 py-1 rounded-full mb-5">
                Направления
              </div>
            </Reveal>
            <Reveal>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-[1.12] tracking-tight mb-7 text-balance text-foreground">
                Чем мы <em className="font-serif italic text-amber">занимаемся</em>
              </h2>
            </Reveal>
            <Reveal>
              <p className="text-sm sm:text-base leading-relaxed mb-4.5 max-w-[52ch] text-foreground/80">
                Мы стараемся подходить к помощи животным комплексно: от обустройства вольеров до ветеринарного ухода и правовой поддержки.
              </p>
            </Reveal>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7">
              {[
                { icon: "🏠", title: "Приют", desc: "Строим тёплые вольеры, закупаем качественные корма и обустраиваем территорию приюта." },
                { icon: "⚖️", title: "Юридическая помощь", desc: "Помогаем решать правовые вопросы, связанные с защитой прав бездомных животных." },
                { icon: "🤝", title: "Волонтёрское движение", desc: "Организуем прогулки, автопомощь, фотосессии для пристройства и ведем соцсети." },
                { icon: "🏥", title: "Ветеринарный уход", desc: "Сотрудничаем с клиниками, вакцинируем подопечных и лечим пострадавших животных." },
              ].map((c, i) => (
                <motion.div key={i} variants={cardReveal} className="bg-foreground/5 border border-foreground/6 rounded-[1.75rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.05)]">
                  <div className="w-11 h-11 bg-amber/10 rounded-full flex items-center justify-center mb-3.5 text-xl">{c.icon}</div>
                  <h3 className="text-[1.05rem] font-extrabold mb-2 tracking-tight">{c.title}</h3>
                  <p className="text-[0.9rem] text-foreground/80 leading-relaxed margin-0">{c.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </article>

          {/* ═══ 3. TIMELINE ═══ */}
          <article ref={setRef(2)} className="relative px-6 py-16 sm:px-10 lg:px-[8vw] lg:py-[12vh] flex flex-col justify-center min-h-[50vh] lg:min-h-screen bg-[#121212] text-white rounded-[3rem] lg:rounded-none my-8 lg:my-0 transition-colors duration-800 js-pd-chapter pd-dark" data-chapter="3">
            <ChapterMedia chId="3" />
            <Reveal>
              <div className="inline-flex items-center bg-amber/18 text-amber font-extrabold text-xs uppercase tracking-wider px-3.5 py-1 rounded-full mb-5">
                История
              </div>
            </Reveal>
            <Reveal>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-[1.12] tracking-tight mb-7 text-balance text-white">
                Как развивался <em className="font-serif italic text-amber">проект</em>
              </h2>
            </Reveal>
            <Reveal>
              <Timeline />
            </Reveal>
          </article>

          {/* ═══ 4. MARINA MOROZOVA ═══ */}
          <article ref={setRef(3)} className="relative px-6 py-16 sm:px-10 lg:px-[8vw] lg:py-[12vh] flex flex-col justify-center min-h-[50vh] lg:min-h-screen bg-paper transition-colors duration-800 rounded-none m-0 js-pd-chapter" data-chapter="4">
            <ChapterMedia chId="4" />
            <Reveal>
              <div className="inline-flex items-center bg-amber/12 text-amber-800 font-extrabold text-xs uppercase tracking-wider px-3.5 py-1 rounded-full mb-5">
                Учредители
              </div>
            </Reveal>
            <Reveal>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-[1.12] tracking-tight mb-1.5 text-balance text-foreground">
                Марина Морозова
              </h2>
              <div className="text-xs font-extrabold uppercase tracking-widest mb-7 text-amber">
                Развитие приюта & администрация
              </div>
            </Reveal>
            <Reveal>
              <blockquote className="font-serif italic text-lg sm:text-xl lg:text-2xl font-[500] leading-relaxed text-foreground mb-7 pl-5 border-l-3 border-amber text-balance">
                <p>«Каждое спасённое животное — это отдельная история доверия, которую мы пишем вместе с нашими волонтёрами.»</p>
              </blockquote>
            </Reveal>
            <Reveal>
              <p className="text-sm sm:text-base leading-relaxed mb-4.5 max-w-[52ch] text-foreground/80">
                Марина координирует административную работу АНБО «Светлый», отвечает за юридическую чистоту проектов, стратегическое развитие приюта и привлечение системного финансирования. Под её руководством организация получила официальный статус и наладила прозрачную систему отчётности.
              </p>
            </Reveal>
          </article>

          {/* ═══ 5. SVETLANA KLYUKINA ═══ */}
          <article ref={setRef(4)} className="relative px-6 py-16 sm:px-10 lg:px-[8vw] lg:py-[12vh] flex flex-col justify-center min-h-[50vh] lg:min-h-screen bg-white rounded-[3rem_3rem_0_0] lg:rounded-none transition-colors duration-800 rounded-none m-0 js-pd-chapter" data-chapter="5">
            <ChapterMedia chId="5" />
            <Reveal>
              <div className="inline-flex items-center bg-amber/12 text-amber-800 font-extrabold text-xs uppercase tracking-wider px-3.5 py-1 rounded-full mb-5">
                Учредители
              </div>
            </Reveal>
            <Reveal>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-[1.12] tracking-tight mb-1.5 text-balance text-foreground">
                Светлана Клюкина
              </h2>
              <div className="text-xs font-extrabold uppercase tracking-widest mb-7 text-[#e879a0]">
                Юридический & медицинский контроль
              </div>
            </Reveal>
            <Reveal>
              <blockquote className="font-serif italic text-lg sm:text-xl lg:text-2xl font-[500] leading-relaxed text-foreground mb-7 pl-5 border-l-3 border-amber text-balance">
                <p>«Ветеринария и забота о здоровье — это фундамент, без которого невозможно подарить бездомному животному счастливую жизнь.»</p>
              </blockquote>
            </Reveal>
            <Reveal>
              <p className="text-sm sm:text-base leading-relaxed mb-4.5 max-w-[52ch] text-foreground/80">
                Светлана координирует медицинскую помощь, взаимодействует с ведущими ветеринарными клиниками региона, контролирует вакцинацию и стерилизацию подопечных. Благодаря её правовому сопровождению, АНБО «Светлый» системно решает сложные правовые вопросы зоозащиты.
              </p>
            </Reveal>
          </article>

          {/* ═══ 6. ANDREY SINITSYN ═══ */}
          <article ref={setRef(5)} className="relative px-6 py-16 sm:px-10 lg:px-[8vw] lg:py-[12vh] flex flex-col justify-center min-h-[50vh] lg:min-h-screen bg-paper transition-colors duration-800 rounded-none m-0 js-pd-chapter" data-chapter="6">
            <ChapterMedia chId="6" />
            <Reveal>
              <div className="inline-flex items-center bg-amber/12 text-amber-800 font-extrabold text-xs uppercase tracking-wider px-3.5 py-1 rounded-full mb-5">
                Учредители
              </div>
            </Reveal>
            <Reveal>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-[1.12] tracking-tight mb-1.5 text-balance text-foreground">
                Андрей Синицын
              </h2>
              <div className="text-xs font-extrabold uppercase tracking-widest mb-7 text-[#34d399]">
                Материально-техническое обеспечение
              </div>
            </Reveal>
            <Reveal>
              <blockquote className="font-serif italic text-lg sm:text-xl lg:text-2xl font-[500] leading-relaxed text-foreground mb-7 pl-5 border-l-3 border-amber text-balance">
                <p>«Безопасный вольер, надёжный забор и качественный корм — это то, с чего начинается реальная забота и тепло для каждой собаки.»</p>
              </blockquote>
            </Reveal>
            <Reveal>
              <p className="text-sm sm:text-base leading-relaxed mb-4.5 max-w-[52ch] text-foreground/80">
                Андрей отвечает за инфраструктуру приюта: строительство и ремонт вольеров, закупки строительных материалов и качественных кормов. Он организует логистику, координирует автоволонтёров и руководит хозяйственной деятельностью на территории приюта.
              </p>
            </Reveal>
          </article>

          {/* ═══ 7. STATS ═══ */}
          <article ref={setRef(6)} className="relative px-6 py-16 sm:px-10 lg:px-[8vw] lg:py-[12vh] flex flex-col justify-center min-h-[50vh] lg:min-h-screen bg-white rounded-[3rem_3rem_0_0] lg:rounded-none transition-colors duration-800 rounded-none m-0 js-pd-chapter" data-chapter="7">
            <ChapterMedia chId="7" />
            <Reveal>
              <div className="inline-flex items-center bg-amber/12 text-amber-800 font-extrabold text-xs uppercase tracking-wider px-3.5 py-1 rounded-full mb-5">
                Результаты
              </div>
            </Reveal>
            <Reveal>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-[1.12] tracking-tight mb-7 text-balance text-foreground">
                Наши показатели в <em className="font-serif italic text-amber">цифрах</em>
              </h2>
            </Reveal>
            <MinimalStats />
            <Reveal>
              <p className="text-sm leading-relaxed max-w-[42ch] text-center italic mx-auto mt-9 text-foreground/80">
                Эти цифры складываются из ежедневного труда наших волонтёров и поддержки неравнодушных людей.
              </p>
            </Reveal>
          </article>

          {/* ═══ 8. HELP ═══ */}
          <article ref={setRef(7)} className="relative px-6 py-16 sm:px-10 lg:px-[8vw] lg:py-[12vh] flex flex-col justify-center min-h-[50vh] lg:min-h-screen bg-paper rounded-[3rem_3rem_0_0] lg:rounded-none transition-colors duration-800 rounded-none m-0 js-pd-chapter" data-chapter="8">
            <ChapterMedia chId="8" />
            <Reveal>
              <div className="inline-flex items-center bg-amber/12 text-amber-800 font-extrabold text-xs uppercase tracking-wider px-3.5 py-1 rounded-full mb-5">
                Помощь
              </div>
            </Reveal>
            <Reveal>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-[1.12] tracking-tight mb-7 text-balance text-foreground">
                Как нам можно <em className="font-serif italic text-amber">помочь</em>
              </h2>
            </Reveal>
            <Reveal>
              <p className="text-sm sm:text-base leading-relaxed mb-4.5 max-w-[52ch] text-foreground/80">
                Мы всегда рады новым людям в нашей команде. Помогать приюту можно по-разному — не только физически на территории, но и удалённо.
              </p>
            </Reveal>
            <Reveal>
              <VolunteerBento />
            </Reveal>
            <Reveal>
              <div className="mt-9 flex flex-col sm:flex-row sm:flex-wrap gap-3.5">
                <a href="https://vk.com/im?sel=-228082117" target="_blank" rel="noopener noreferrer" className="relative inline-flex items-center justify-center gap-2.5 bg-amber hover:bg-amber-400 text-foreground px-7 py-3.5 rounded-full font-extrabold text-sm shadow-[0_6px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_12px_30px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 cursor-pointer">{ArrowRight} Стать волонтёром</a>
                <a href="https://vk.com/im?sel=-228082117" target="_blank" rel="noopener noreferrer" className="relative inline-flex items-center justify-center gap-2.5 bg-transparent border-2 border-foreground text-foreground px-7 py-3.5 rounded-full font-extrabold text-sm hover:bg-foreground hover:text-background hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 cursor-pointer">{ArrowDiag} Написать нам</a>
              </div>
            </Reveal>
          </article>

          {/* ═══ 9. FAQ ═══ */}
          <article ref={setRef(8)} className="relative px-6 py-16 sm:px-10 lg:px-[8vw] lg:py-[12vh] flex flex-col justify-center min-h-[50vh] lg:min-h-screen bg-white rounded-[3rem_3rem_0_0] lg:rounded-none transition-colors duration-800 js-pd-chapter" data-chapter="9">
            <ChapterMedia chId="9" />
            <Reveal>
              <div className="inline-flex items-center text-amber font-extrabold text-sm uppercase tracking-wider mb-5">
                FAQ
              </div>
            </Reveal>
            <Reveal>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-[1.12] tracking-tight mb-7 text-balance text-foreground">
                Ответы на частые <em className="font-serif italic text-amber">вопросы</em>
              </h2>
            </Reveal>
            <Reveal>
              <div className="mt-7 border-t border-foreground/10">
                {faqData.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} index={i} />)}
              </div>
            </Reveal>
            <Reveal>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold leading-normal mt-12 mb-7 relative before:content-['«'] before:text-amber before:mr-1 after:content-['»'] after:text-amber after:ml-1">
                Мы стремимся к тому, чтобы каждый питомец нашёл свой <em className="font-serif italic text-amber">постоянный и безопасный дом.</em>
              </p>
            </Reveal>
            <Reveal>
              <div className="mt-10 bg-amber/8 border border-amber/15 rounded-[1.75rem] p-6">
                <p className="m-0 text-sm sm:text-base leading-relaxed text-foreground">
                  <strong className="font-bold">Контакты:</strong> кураторы приюта — свяжитесь с нами через личные сообщения во ВКонтакте
                </p>
              </div>
            </Reveal>
            <Reveal>
              <div className="mt-9 flex flex-col sm:flex-row sm:flex-wrap gap-3.5">
                <button className="relative inline-flex items-center justify-center gap-2.5 bg-amber hover:bg-amber-400 text-foreground px-7 py-3.5 rounded-full font-extrabold text-sm shadow-[0_6px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_12px_30px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 cursor-pointer">{ArrowRight} Стать волонтёром</button>
              </div>
            </Reveal>
          </article>

        </div>
      </div>
    </main>
  );
}
