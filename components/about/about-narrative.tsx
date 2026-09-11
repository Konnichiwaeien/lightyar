"use client";

import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Camera,
  CarFront,
  Footprints,
  HandCoins,
  HandHeart,
  HeartHandshake,
  House,
  Megaphone,
  PawPrint,
  Plus,
  Stethoscope,
  Wrench,
} from "lucide-react";
import { formatQualifiedValue } from "@/lib/reports/report-domain";
import type { AboutPageContent } from "@/lib/about/about-content";
import { buildAboutStatisticSegments } from "@/lib/about/about-statistics";
import { ABOUT_FIRST_YEAR_GROUPS, ABOUT_FIRST_YEAR_SOURCE } from "@/lib/about/about-figures";
import "./about-narrative.css";

/** Знак у каждой группы показателей — чтобы вкладки читались с одного взгляда. */
const FIGURE_GROUP_ICONS: Record<string, typeof PawPrint> = {
  animals: PawPrint,
  vet: Stethoscope,
  people: HandHeart,
  voice: Megaphone,
};

type ChapterId = "organization" | "mission" | "history" | "team" | "results" | "volunteer" | "reports" | "faq";
type ChapterTone = "paper" | "white" | "cream" | "dark" | "green" | "amber";

/** Кадры, у которых нет отдельного поля в CMS, живут рядом с остальной реальной съёмкой. */
const TEAM_STAGE_IMAGE = "/about/real/team-together.jpg";
const REPORTS_STAGE_IMAGE = "/about/real/handover.jpg";

interface StageScene {
  id: string;
  media?: string;
  poster?: string;
  mediaType: "image" | "video" | "abstract";
  alt: string;
}

interface ChapterPresentation extends StageScene {
  id: ChapterId;
  tone: ChapterTone;
}

function paragraphs(value: string): string[] {
  return value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
}

function usePrefersReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduceMotion;
}

function Reveal({
  children,
  className = "",
  sceneId,
}: {
  children: ReactNode;
  className?: string;
  sceneId?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      data-about-reveal=""
      data-about-scene={sceneId}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function HeadingAccent({ level, text }: { level: 1 | 2; text: string }) {
  const reduceMotion = useReducedMotion();
  const match = text.match(/^([\s\S]*\s)?(\S+)$/);
  const prefix = match?.[1] || "";
  const accent = match?.[2] || text;
  const content = (
    <>
      {prefix}<span className="about-heading-accent">
        <motion.span
          aria-hidden="true"
          className="about-heading-accent__fill"
          initial={{ opacity: 0, scaleX: 0.18 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={{ duration: reduceMotion ? 0 : 0.58, delay: reduceMotion ? 0 : 0.12, ease: [0.23, 1, 0.32, 1] }}
        />
        <span className="about-heading-accent__text">{accent}</span>
      </span>
    </>
  );

  return level === 1 ? <h1>{content}</h1> : <h2>{content}</h2>;
}

/**
 * Три опоры помощи. Кадры стоят без рамок и подложек — только снимок,
 * знак направления и подпись, в которой отмечено главное слово.
 */
const ABOUT_PRINCIPLES = [
  {
    title: "Временный дом",
    icon: House,
    lead: "Крыша, корм и",
    mark: "ежедневный уход",
    tail: " — пока не найдётся семья.",
    image: "/about/real/shelter-home.jpg",
    alt: "Подопечный фонда на крыше своей будки во дворе приюта",
  },
  {
    title: "Здоровье",
    icon: Stethoscope,
    lead: "Осмотр, лечение, прививки и",
    mark: "стерилизация",
    tail: " — до полного выздоровления.",
    image: "/about/real/rescued-dog.jpg",
    alt: "Спасённая собака после лечения",
  },
  {
    title: "Доверие",
    icon: HeartHandshake,
    lead: "Занятия с кинологом, время и терпение. И только потом — поиск",
    mark: "ответственной семьи",
    tail: ".",
    image: "/about/real/dog-hand.jpg",
    alt: "Собака доверчиво тянется к руке волонтёра",
  },
];

function PrinciplesChapters() {
  const reduceMotion = useReducedMotion();

  return (
    <ol className="about-principles">
      {ABOUT_PRINCIPLES.map((principle, index) => {
        const Icon = principle.icon;
        return (
          <motion.li
            key={principle.title}
            className="about-principle"
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: reduceMotion ? 0 : 0.72,
              delay: reduceMotion ? 0 : index * 0.09,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div className="about-principle__media">
              <Image
                src={principle.image}
                alt={principle.alt}
                fill
                sizes="(max-width: 640px) 92vw, (max-width: 1023px) 31vw, 22vw"
                className="object-cover"
              />
            </div>
            <h3>
              <span className="about-principle__icon" aria-hidden="true"><Icon /></span>
              {principle.title}
            </h3>
            <p>
              {principle.lead} <span className="about-mark">{principle.mark}</span>{principle.tail}
            </p>
          </motion.li>
        );
      })}
    </ol>
  );
}

function MediaFrame({
  scene,
  mobile = false,
  active = true,
  onReady,
}: {
  scene: StageScene;
  mobile?: boolean;
  active?: boolean;
  onReady?: () => void;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameClass = mobile ? "about-mobile-media" : "about-stage__media";
  const frameClasses = `${frameClass} ${frameClass}--${scene.id}`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const shouldPlay = active && !mobile && !reduceMotion;
    video.autoplay = shouldPlay;
    video.loop = !reduceMotion;
    if (!shouldPlay) {
      video.pause();
      if (reduceMotion) video.currentTime = 0;
      return;
    }

    void video.play().catch(() => undefined);
  }, [active, mobile, reduceMotion]);

  if (!scene.media || scene.mediaType === "abstract") {
    return (
      <div className={`${frameClasses} about-media-abstract`} aria-hidden="true">
        <span />
      </div>
    );
  }
  if (scene.mediaType === "video") {
    return (
      <div className={frameClasses}>
        <video
          ref={videoRef}
          key={reduceMotion ? "still" : "motion"}
          src={scene.media}
          poster={scene.poster}
          autoPlay={active && !mobile && !reduceMotion}
          muted
          loop={!reduceMotion}
          playsInline
          preload="metadata"
          aria-label={scene.alt}
        />
      </div>
    );
  }
  return (
    <div className={frameClasses}>
      <Image
        src={scene.media}
        alt={mobile ? scene.alt : ""}
        fill
        priority={!mobile && scene.id === "organization"}
        sizes={mobile ? "(max-width: 1023px) 100vw, 1px" : "(min-width: 1024px) 48vw, 1px"}
        className="object-cover"
        onLoad={onReady}
      />
    </div>
  );
}

/**
 * Активная сцена определяется тем, какой блок накрывает середину экрана.
 * Вложенная сцена (например, карточка человека внутри главы) выигрывает
 * у своей главы, потому что она короче.
 */
function useActiveScene(sceneIds: readonly string[]) {
  const [activeId, setActiveId] = useState(sceneIds[0]);
  const key = sceneIds.join("|");

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-about-scene]"));
    if (!nodes.length) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const center = window.innerHeight / 2;
      let started: string | null = null;

      for (const node of nodes) {
        const id = node.dataset.aboutScene;
        if (!id) continue;
        const rect = node.getBoundingClientRect();
        if (rect.height === 0) continue;
        if (rect.top <= center) started = id;
      }

      const next = started ?? nodes[0]?.dataset.aboutScene;
      if (next) setActiveId((current) => (current === next ? current : next));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [key]);

  return activeId;
}

/**
 * Кадры соседних глав держатся в DOM и меняются перекрёстным затуханием,
 * поэтому между главами не бывает ни чёрного экрана, ни мигания. Новый кадр
 * становится видимым только после того, как картинка действительно загрузилась,
 * а прежний до этого момента остаётся на месте.
 *
 * В памяти живёт узкое окно из соседних кадров: держать все главы сразу — это
 * несколько крупных слоёв композитора и заметные подтормаживания при скролле.
 */
function AboutStage({ scenes, activeIndex }: { scenes: StageScene[]; activeIndex: number }) {
  const [readyIds, setReadyIds] = useState<readonly string[]>([]);
  const [shown, setShown] = useState({ index: 0, previous: 0 });

  const markReady = useCallback((id: string) => {
    setReadyIds((current) => (current.includes(id) ? current : [...current, id]));
  }, []);

  // Кадр меняется прямо во время рендера, как только его картинка загружена:
  // так между сменой главы и сменой кадра не проходит лишнего кадра отрисовки.
  const activeScene = scenes[activeIndex];
  const activeReady = Boolean(activeScene)
    && (activeScene.mediaType !== "image" || readyIds.includes(activeScene.id));
  if (activeReady && shown.index !== activeIndex) {
    setShown({ index: activeIndex, previous: shown.index });
  }

  const mounted = new Set([shown.index, shown.previous, activeIndex - 1, activeIndex, activeIndex + 1]);

  return (
    <aside className="about-stage" aria-hidden="true">
      {scenes.map((scene, index) => {
        if (!mounted.has(index)) return null;
        const isVisible = index === shown.index;
        // Прежний кадр остаётся непрозрачным под новым, пока тот проявляется,
        // поэтому в момент смены главы под ними ничего не просвечивает.
        const state = isVisible ? "active" : index === shown.previous ? "behind" : "idle";
        return (
          <div key={scene.id} className="about-stage__layer" data-state={state}>
            <MediaFrame scene={scene} active={isVisible} onReady={() => markReady(scene.id)} />
          </div>
        );
      })}
      <div className="about-stage__shade" />
    </aside>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const answerId = useId();
  const questionId = `${answerId}-question`;

  return (
    <div className="about-faq__item" data-open={open ? "true" : "false"}>
      <button
        id={questionId}
        type="button"
        aria-expanded={open}
        aria-controls={answerId}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{question}</span>
        <motion.span
          className="about-faq__icon"
          aria-hidden="true"
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.23, 1, 0.32, 1] }}
        >
          <Plus size={20} />
        </motion.span>
      </button>
      <motion.div
        id={answerId}
        role="region"
        aria-labelledby={questionId}
        aria-hidden={!open}
        className="about-faq__answer"
        initial={false}
        animate={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="about-faq__answer-inner"><p>{answer}</p></div>
      </motion.div>
    </div>
  );
}

/**
 * Число «дорастает» до значения, когда блок появляется на экране.
 * Стартовое состояние — готовое число: без JS и до анимации на странице
 * всё равно стоит настоящий показатель, а не ноль.
 */
function CountUp({ value, active }: { value: number; active: boolean }) {
  const reduceMotion = useReducedMotion();
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const format = (amount: number) => amount.toLocaleString("ru-RU");
    if (reduceMotion || !active) {
      node.textContent = format(value);
      return;
    }

    let frame = 0;
    const started = performance.now();
    const duration = 900;

    const tick = (now: number) => {
      const elapsed = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      node.textContent = format(Math.round(value * eased));
      if (elapsed < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, reduceMotion, value]);

  return <span ref={nodeRef}>{value.toLocaleString("ru-RU")}</span>;
}

/** Кольцо текущего кураторства: сегмент можно навести, выбрать мышью и клавиатурой. */
function StatisticsRing({
  segments,
  total,
  selectedIndex,
  onSelect,
  label,
}: {
  segments: ReturnType<typeof buildAboutStatisticSegments>["segments"];
  total: number;
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
  label: string;
}) {
  const size = 240;
  const stroke = 30;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = segments.length > 1 ? 3 : 0;
  const selected = selectedIndex === null ? null : segments[selectedIndex];

  return (
    <figure className="about-ring">
      <div className="about-ring__frame">
        <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} className="about-ring__svg">
          <circle
            className="about-ring__track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
          />
          {segments.map((segment, index) => {
            const length = Math.max(0, (segment.share / 100) * circumference - gap);
            const offset = (segment.start / 360) * circumference;
            const isActive = selectedIndex === index;
            return (
              <circle
                key={`${segment.label}-${segment.order}`}
                className="about-ring__segment"
                data-active={isActive ? "true" : "false"}
                data-dimmed={selectedIndex !== null && !isActive ? "true" : "false"}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={stroke}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-(offset + gap / 2)}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                onPointerEnter={() => onSelect(index)}
                onPointerLeave={() => onSelect(null)}
              />
            );
          })}
        </svg>
        <div className="about-ring__center">
          <strong>{selected ? formatQualifiedValue(selected.value, selected.qualifier) : total.toLocaleString("ru-RU")}</strong>
          <span>{selected ? selected.label : "под опекой сейчас"}</span>
        </div>
      </div>
      <figcaption>Состав текущего кураторства</figcaption>
    </figure>
  );
}

/** Кураторство сейчас: кольцо и легенда делят одно выделение сегмента. */
function CurrentCare({ stats }: { stats: AboutPageContent["currentStats"] }) {
  const reduceMotion = useReducedMotion();
  const statistics = useMemo(() => buildAboutStatisticSegments(stats), [stats]);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  /* Полоски долей наблюдаем через список: сама полоска сжата в ноль по ширине,
     и наблюдатель за отдельным элементом такой кадр не считает видимым. */
  const listRef = useRef<HTMLUListElement>(null);
  const listInView = useInView(listRef, { once: true, margin: "-8% 0px" });

  const chartLabel = statistics.segments.length
    ? statistics.segments.map((item) => `${item.label}: ${formatQualifiedValue(item.value, item.qualifier)}`).join("; ")
    : "Актуальные показатели пока не опубликованы";

  return (
    <Reveal className="about-statistics-now">
      <StatisticsRing
        segments={statistics.segments}
        total={statistics.total}
        selectedIndex={selectedSegment}
        onSelect={setSelectedSegment}
        label={chartLabel}
      />

      <ul className="about-statistics-list" ref={listRef}>
        {statistics.segments.map((item, index) => (
          <li key={`${item.label}-${item.order}`} data-active={selectedSegment === index ? "true" : "false"}>
            <button
              type="button"
              aria-pressed={selectedSegment === index}
              onClick={() => setSelectedSegment((current) => (current === index ? null : index))}
              onPointerEnter={() => setSelectedSegment(index)}
              onPointerLeave={() => setSelectedSegment(null)}
            >
              <span className="about-statistics-list__dot" style={{ backgroundColor: item.color }} aria-hidden="true" />
              <span className="about-statistics-list__copy">
                <strong>{formatQualifiedValue(item.value, item.qualifier)}</strong>
                <span>{item.label}</span>
              </span>
              <span className="about-statistics-list__share">{item.share.toLocaleString("ru-RU")}%</span>
              <span className="about-statistics-list__bar" aria-hidden="true">
                <motion.span
                  style={{ "--about-stat-share": `${item.share}%`, backgroundColor: item.color } as CSSProperties}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: listInView ? 1 : 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.76, delay: reduceMotion ? 0 : index * 0.06, ease: [0.23, 1, 0.32, 1] }}
                />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

/** Итоги первого года: вкладки со своим состоянием и пересчёт чисел. */
const FirstYearFigures = memo(function FirstYearFigures() {
  const reduceMotion = useReducedMotion();
  const [groupId, setGroupId] = useState(ABOUT_FIRST_YEAR_GROUPS[0].id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const figuresRef = useRef<HTMLDivElement>(null);
  const figuresInView = useInView(figuresRef, { once: true, margin: "-15% 0px -15% 0px" });
  const panelId = useId();

  const group = ABOUT_FIRST_YEAR_GROUPS.find((item) => item.id === groupId) ?? ABOUT_FIRST_YEAR_GROUPS[0];
  const groupIndex = ABOUT_FIRST_YEAR_GROUPS.indexOf(group);

  const focusTab = (index: number) => {
    const next = (index + ABOUT_FIRST_YEAR_GROUPS.length) % ABOUT_FIRST_YEAR_GROUPS.length;
    setGroupId(ABOUT_FIRST_YEAR_GROUPS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <Reveal className="about-figures">
      <div className="about-figures__head">
        <h3>Первый год работы</h3>
        <p>{group.summary}</p>
      </div>

      <div className="about-figures__tabs" role="tablist" aria-label="Показатели первого года работы">
        {ABOUT_FIRST_YEAR_GROUPS.map((item, index) => {
          const selected = item.id === group.id;
          const GroupIcon = FIGURE_GROUP_ICONS[item.id] ?? PawPrint;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${panelId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${panelId}-panel`}
              tabIndex={selected ? 0 : -1}
              ref={(node) => { tabRefs.current[index] = node; }}
              onClick={() => setGroupId(item.id)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") { event.preventDefault(); focusTab(groupIndex + 1); }
                if (event.key === "ArrowLeft") { event.preventDefault(); focusTab(groupIndex - 1); }
                if (event.key === "Home") { event.preventDefault(); focusTab(0); }
                if (event.key === "End") { event.preventDefault(); focusTab(ABOUT_FIRST_YEAR_GROUPS.length - 1); }
              }}
            >
              {selected && (
                <motion.span
                  className="about-figures__tab-fill"
                  layoutId="about-figures-tab"
                  aria-hidden="true"
                  transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.23, 1, 0.32, 1] }}
                />
              )}
              <span className="about-figures__tab-label">
                <GroupIcon aria-hidden="true" />
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div
        ref={figuresRef}
        className="about-figures__panel"
        role="tabpanel"
        id={`${panelId}-panel`}
        aria-labelledby={`${panelId}-tab-${group.id}`}
      >
        <ol key={group.id}>
          {group.figures.map((figure, index) => (
            <motion.li
              key={figure.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.5,
                delay: reduceMotion ? 0 : index * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <strong>
                <CountUp value={figure.value} active={figuresInView} />
                {figure.unit ? <em>{figure.unit}</em> : null}
              </strong>
              <p>{figure.label}</p>
              {figure.note ? <small>{figure.note}</small> : null}
            </motion.li>
          ))}
        </ol>
      </div>

      <p className="about-figures__source">
        Источник —{" "}
        <a href={ABOUT_FIRST_YEAR_SOURCE.href} target="_blank" rel="noreferrer">
          {ABOUT_FIRST_YEAR_SOURCE.label}
          <ArrowUpRight aria-hidden="true" size={14} />
        </a>
      </p>
    </Reveal>
  );
});

function AboutStatistics({ content }: { content: AboutPageContent }) {
  return (
    <div className="about-statistics-dashboard">
      <CurrentCare stats={content.currentStats} />
      <FirstYearFigures />
    </div>
  );
}

/**
 * Ровная сетка 3×3: один ведущий кадр на четыре клетки и пять равных клеток
 * вокруг него. Ряды одной высоты, поэтому подписи стоят на общих линиях.
 */
const VOLUNTEER_TILES = [
  {
    id: "walk",
    title: "Прогулки",
    body: "Каждую неделю выходим с собаками: учим спокойно идти рядом и не бояться людей.",
    icon: Footprints,
    image: "/about/real/walk-together.jpg",
    alt: "Волонтёры на прогулке с подопечными собаками",
  },
  {
    id: "car",
    title: "Автопомощь",
    body: "Отвезти в клинику или к новой семье.",
    icon: CarFront,
    image: "/about/real/dog-car.jpg",
    alt: "Подопечный фонда в машине по дороге в клинику",
  },
  {
    id: "photo",
    title: "Фотографии",
    body: "Хорошее фото — половина пути к дому.",
    icon: Camera,
    image: "/about/real/dog-portrait.jpg",
    alt: "Портрет подопечного фонда",
  },
  {
    id: "repair",
    title: "Ремонт",
    body: "Вольеры, будки, заборы и медблок.",
    icon: Wrench,
  },
  {
    id: "donate",
    title: "Пожертвования",
    body: "Корм и лечение — каждый месяц.",
    icon: HandCoins,
  },
] as const;

function VolunteerBento() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="about-bento">
      {VOLUNTEER_TILES.map((tile, index) => {
        const Icon = tile.icon;
        const image = "image" in tile ? tile.image : undefined;
        return (
          <motion.article
            key={tile.id}
            className={`about-bento__tile about-bento__tile--${tile.id}`}
            data-media={image ? "photo" : "flat"}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: reduceMotion ? 0 : 0.62,
              delay: reduceMotion ? 0 : index * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {image ? (
              <div className="about-bento__media">
                <Image
                  src={image}
                  alt={"alt" in tile ? tile.alt : ""}
                  fill
                  sizes="(max-width: 640px) 92vw, (max-width: 1023px) 46vw, 24vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            <span className="about-bento__icon" aria-hidden="true"><Icon /></span>
            <div className="about-bento__copy">
              <h3>{tile.title}</h3>
              <p>{tile.body}</p>
            </div>
          </motion.article>
        );
      })}

      <motion.a
        href="https://vk.com/im?sel=-228082117"
        target="_blank"
        rel="noreferrer"
        className="about-bento__tile about-bento__tile--cta"
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: reduceMotion ? 0 : 0.62, delay: reduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="about-bento__icon" aria-hidden="true"><HeartHandshake /></span>
        <div className="about-bento__copy">
          <h3>Стать волонтёром</h3>
          <p>Напишите нам во «ВКонтакте».</p>
        </div>
        <span className="about-bento__arrow" aria-hidden="true"><ArrowUpRight /></span>
      </motion.a>
    </div>
  );
}

function ChapterShell({
  chapter,
  children,
}: {
  chapter: ChapterPresentation;
  children: ReactNode;
}) {
  return (
    <article
      id={`about-${chapter.id}`}
      data-about-scene={chapter.id}
      data-tone={chapter.tone}
      className="about-chapter"
    >
      <MediaFrame scene={chapter} mobile />
      <div className="about-chapter__inner">{children}</div>
    </article>
  );
}

/**
 * Колонка рассказа зависит только от материала страницы. Она вынесена в memo,
 * чтобы смена кадра в левой колонке при прокрутке не перерисовывала все главы.
 */
const AboutStory = memo(function AboutStory({
  content,
  chapters,
}: {
  content: AboutPageContent;
  chapters: ChapterPresentation[];
}) {
  return (
    <div className="about-story">
      <ChapterShell chapter={chapters[0]}>
        <Reveal>
          <p className="about-kicker">Автономная благотворительная организация</p>
          <HeadingAccent level={1} text={content.heroTitle} />
        </Reveal>
        <Reveal>
          <p className="about-lead">{content.heroIntro}</p>
        </Reveal>
        <Reveal className="about-actions">
          <Link href="/pets" className="about-button about-button--primary">
            <PawPrint aria-hidden="true" size={18} /> Посмотреть подопечных
          </Link>
          <Link href="/#donate" className="about-button about-button--ghost">
            <HeartHandshake aria-hidden="true" size={18} /> Помочь фонду
          </Link>
        </Reveal>
      </ChapterShell>

      <ChapterShell chapter={chapters[1]}>
        <Reveal>
          <p className="about-kicker">Направления</p>
          <HeadingAccent level={2} text={content.missionTitle} />
        </Reveal>
        <Reveal className="about-prose">
          {paragraphs(content.missionBody).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </Reveal>
        <PrinciplesChapters />
      </ChapterShell>

      <ChapterShell chapter={chapters[2]}>
        <Reveal>
          <p className="about-kicker">История фонда</p>
          <HeadingAccent level={2} text={content.historyTitle} />
        </Reveal>
        <div className="about-history">
          <Reveal className="about-prose">
            {paragraphs(content.historyBody).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </Reveal>
        </div>
      </ChapterShell>

      <ChapterShell chapter={chapters[3]}>
        <Reveal>
          <p className="about-kicker">Люди «Светлого»</p>
          <HeadingAccent level={2} text="Команда, которая остаётся рядом" />
        </Reveal>
        <div className="about-team">
          {content.teamMembers.map((member, index) => (
            <Reveal
              key={`${member.name}-${member.order}`}
              className="about-person"
              sceneId={member.photo ? `team-member-${index}` : undefined}
            >
              {member.photo && (
                <div className="about-person__photo">
                  <Image src={member.photo} alt={member.name} fill sizes="(max-width: 1023px) 100vw, 1px" className="object-cover" />
                </div>
              )}
              <h3>{member.name}</h3>
              <p className="about-person__role">{member.role}{member.city ? ` · ${member.city}` : ""}</p>
              {member.quote && <blockquote>«{member.quote}»</blockquote>}
              {member.bio && <p className="about-person__bio">{member.bio}</p>}
            </Reveal>
          ))}
        </div>
      </ChapterShell>

      <ChapterShell chapter={chapters[4]}>
        <Reveal>
          <p className="about-kicker">Актуальные показатели</p>
          <HeadingAccent level={2} text={content.resultsTitle} />
          <p className="about-section-intro">{content.resultsBody}</p>
        </Reveal>
        <AboutStatistics content={content} />
      </ChapterShell>

      <ChapterShell chapter={chapters[5]}>
        <Reveal>
          <p className="about-kicker">Участие</p>
          <HeadingAccent level={2} text={content.volunteerTitle} />
        </Reveal>
        <Reveal className="about-prose">
          {paragraphs(content.volunteerBody).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </Reveal>
        <VolunteerBento />
      </ChapterShell>

      <ChapterShell chapter={chapters[6]}>
        <div className="about-transparency-beam" aria-hidden="true" />
        <Reveal>
          <p className="about-kicker">Прозрачность</p>
          <HeadingAccent level={2} text={content.reportsTitle} />
        </Reveal>
        <Reveal>
          <p className="about-lead">{content.reportsBody}</p>
        </Reveal>
        <Reveal>
          <Link href="/reports" className="about-reports-link">
            <span>Открыть отчётность</span>
            <ArrowUpRight aria-hidden="true" size={28} />
          </Link>
        </Reveal>
      </ChapterShell>

      <ChapterShell chapter={chapters[7]}>
        <Reveal>
          <p className="about-kicker">FAQ</p>
          <HeadingAccent level={2} text="Ответы на частые вопросы" />
        </Reveal>
        <div className="about-faq">
          {content.faqItems.map((item) => (
            <FaqItem
              key={`${item.question}-${item.order}`}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </ChapterShell>
    </div>
  );
});

export function AboutNarrative({ content }: { content: AboutPageContent }) {
  const chapters = useMemo<ChapterPresentation[]>(() => [
    {
      id: "organization",
      media: content.heroVideo || content.heroPoster,
      poster: content.heroPoster,
      mediaType: content.heroVideo ? "video" : content.heroPoster ? "image" : "abstract",
      alt: "Волонтёры АНБО «Светлый» вместе с подопечными",
      tone: "paper",
    },
    {
      id: "mission",
      media: content.directionsImage,
      mediaType: content.directionsImage ? "image" : "abstract",
      alt: "Волонтёры помогают животным",
      tone: "white",
    },
    {
      id: "history",
      media: content.historyImage,
      mediaType: content.historyImage ? "image" : "abstract",
      alt: "Двор приюта, где живут подопечные",
      tone: "paper",
    },
    {
      id: "team",
      media: TEAM_STAGE_IMAGE,
      mediaType: "image",
      alt: "Команда АНБО «Светлый» на занятии с собаками",
      tone: "white",
    },
    {
      id: "results",
      media: content.resultsImage,
      mediaType: content.resultsImage ? "image" : "abstract",
      alt: "Волонтёры с подопечными животными",
      tone: "cream",
    },
    {
      id: "volunteer",
      media: content.volunteerVideo || content.volunteerPoster,
      poster: content.volunteerPoster,
      mediaType: content.volunteerVideo ? "video" : content.volunteerPoster ? "image" : "abstract",
      alt: "Волонтёры на прогулке с собаками",
      tone: "white",
    },
    {
      id: "reports",
      media: REPORTS_STAGE_IMAGE,
      mediaType: "image",
      alt: "Волонтёр передаёт подопечного новой семье",
      tone: "dark",
    },
    {
      id: "faq",
      media: content.faqImage,
      mediaType: content.faqImage ? "image" : "abstract",
      alt: "Собака на прогулке с волонтёром",
      tone: "paper",
    },
  ], [content]);

  /**
   * Портрет человека — тоже сцена: пока читаешь его историю,
   * в левой колонке стоит именно его фотография.
   */
  const teamScenes = useMemo(
    () => content.teamMembers
      .map((member, index) => ({ member, index }))
      .filter((item) => Boolean(item.member.photo))
      .map((item) => ({
        sceneId: `team-member-${item.index}`,
        name: item.member.name,
        photo: item.member.photo as string,
      })),
    [content.teamMembers],
  );

  const scenes = useMemo<StageScene[]>(() => {
    const teamPosition = chapters.findIndex((chapter) => chapter.id === "team");
    const memberScenes: StageScene[] = teamScenes.map((item) => ({
      id: item.sceneId,
      media: item.photo,
      mediaType: "image",
      alt: item.name,
    }));
    return [
      ...chapters.slice(0, teamPosition + 1),
      ...memberScenes,
      ...chapters.slice(teamPosition + 1),
    ];
  }, [chapters, teamScenes]);

  const sceneIds = useMemo(() => scenes.map((scene) => scene.id), [scenes]);
  const activeScene = useActiveScene(sceneIds);
  const activeIndex = Math.max(0, scenes.findIndex((scene) => scene.id === activeScene));

  return (
    <div className="about-managed">
      <div className="about-story-grid">
        <AboutStage scenes={scenes} activeIndex={activeIndex} />
        <AboutStory content={content} chapters={chapters} />
      </div>
    </div>
  );
}
