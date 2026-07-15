"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { formatQualifiedValue } from "@/lib/reports/report-domain";
import type { AboutPageContent } from "@/lib/about/about-content";
import "./about-narrative.css";

type ChapterId = "organization" | "mission" | "history" | "team" | "results" | "volunteer" | "reports" | "faq";
type ChapterTone = "paper" | "white" | "dark" | "green" | "amber";

interface ChapterPresentation {
  id: ChapterId;
  label: string;
  number: string;
  media?: string;
  poster?: string;
  mediaType: "image" | "video" | "abstract";
  alt: string;
  tone: ChapterTone;
}

function paragraphs(value: string): string[] {
  return value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function MediaFrame({ chapter, mobile = false }: { chapter: ChapterPresentation; mobile?: boolean }) {
  const frameClass = mobile ? "about-mobile-media" : "about-stage__media";
  if (!chapter.media || chapter.mediaType === "abstract") {
    return (
      <div className={`${frameClass} about-media-abstract`} aria-hidden="true">
        <span />
      </div>
    );
  }
  if (chapter.mediaType === "video") {
    return (
      <div className={frameClass}>
        <video
          src={chapter.media}
          poster={chapter.poster}
          autoPlay={!mobile}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={chapter.alt}
        />
      </div>
    );
  }
  return (
    <div className={frameClass}>
      <Image
        src={chapter.media}
        alt={mobile ? chapter.alt : ""}
        fill
        sizes={mobile ? "100vw" : "50vw"}
        className="object-cover"
      />
    </div>
  );
}

function AboutStage({ chapter }: { chapter: ChapterPresentation }) {
  const reduceMotion = useReducedMotion();
  return (
    <aside className="about-stage" aria-hidden="true">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={chapter.id}
          className="about-stage__transition"
          initial={reduceMotion ? false : { opacity: 0, scale: 1.035 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 0.985 }}
          transition={{ duration: reduceMotion ? 0 : 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <MediaFrame chapter={chapter} />
        </motion.div>
      </AnimatePresence>
      <div className="about-stage__shade" />
      <div className="about-stage__caption">
        <span>{chapter.number}</span>
        <p>{chapter.label}</p>
      </div>
    </aside>
  );
}

function ChapterNavigation({ chapters, active }: { chapters: ChapterPresentation[]; active: ChapterId }) {
  return (
    <nav className="about-chapter-nav" aria-label="Разделы страницы о нас">
      <ol>
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <button
              type="button"
              aria-current={active === chapter.id ? "location" : undefined}
              onClick={() => document.getElementById(`about-${chapter.id}`)?.scrollIntoView({ behavior: "smooth" })}
            >
              <span>{chapter.number}</span>
              <span>{chapter.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
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
      data-about-chapter={chapter.id}
      data-tone={chapter.tone}
      className="about-chapter"
    >
      <MediaFrame chapter={chapter} mobile />
      <div className="about-chapter__inner">{children}</div>
    </article>
  );
}

export function AboutNarrative({ content }: { content: AboutPageContent }) {
  const chapters = useMemo<ChapterPresentation[]>(() => [
    {
      id: "organization",
      label: "Организация",
      number: "01",
      media: content.heroVideo,
      poster: content.heroPoster,
      mediaType: content.heroVideo ? "video" : "abstract",
      alt: "Видео-презентация АНБО «Светлый»",
      tone: "paper",
    },
    {
      id: "mission",
      label: "Направления помощи",
      number: "02",
      media: content.directionsImage,
      mediaType: content.directionsImage ? "image" : "abstract",
      alt: "Волонтёры помогают животным",
      tone: "white",
    },
    {
      id: "history",
      label: "История",
      number: "03",
      media: content.historyImage,
      mediaType: content.historyImage ? "image" : "abstract",
      alt: "Подопечный АНБО «Светлый»",
      tone: "dark",
    },
    {
      id: "team",
      label: "Команда",
      number: "04",
      media: content.teamMembers[0]?.photo,
      mediaType: content.teamMembers[0]?.photo ? "image" : "abstract",
      alt: "Команда АНБО «Светлый»",
      tone: "paper",
    },
    {
      id: "results",
      label: "Результаты",
      number: "05",
      media: content.resultsImage,
      mediaType: content.resultsImage ? "image" : "abstract",
      alt: "Животное, которому помогла команда",
      tone: "green",
    },
    {
      id: "volunteer",
      label: "Как помочь",
      number: "06",
      media: content.volunteerVideo,
      poster: content.volunteerPoster,
      mediaType: content.volunteerVideo ? "video" : "abstract",
      alt: "Волонтёры на прогулке с собаками",
      tone: "white",
    },
    {
      id: "reports",
      label: "Прозрачность",
      number: "07",
      mediaType: "abstract",
      alt: "",
      tone: "dark",
    },
    {
      id: "faq",
      label: "Частые вопросы",
      number: "08",
      media: content.faqImage,
      mediaType: content.faqImage ? "image" : "abstract",
      alt: "Собака на прогулке с волонтёром",
      tone: "paper",
    },
  ], [content]);

  const [activeChapter, setActiveChapter] = useState<ChapterId>("organization");

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-about-chapter]"));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      const id = visible?.target.getAttribute("data-about-chapter") as ChapterId | null;
      if (id) setActiveChapter(id);
    }, { rootMargin: "-36% 0px -36% 0px", threshold: [0, 0.25, 0.6] });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const activePresentation = chapters.find((chapter) => chapter.id === activeChapter) || chapters[0];

  return (
    <div className="about-managed">
      <ChapterNavigation chapters={chapters} active={activeChapter} />
      <div className="about-story-grid">
        <AboutStage chapter={activePresentation} />
        <div className="about-story">
          <ChapterShell chapter={chapters[0]}>
            <Reveal>
              <p className="about-kicker">Автономная благотворительная организация</p>
              <h1>{content.heroTitle}</h1>
            </Reveal>
            <Reveal>
              <p className="about-lead">{content.heroIntro}</p>
            </Reveal>
            <Reveal className="about-actions">
              <a href="#about-mission" className="about-button about-button--primary">
                Узнать больше <ArrowDown aria-hidden="true" size={18} />
              </a>
              <a href="#about-volunteer" className="about-button about-button--ghost">
                Помочь животным <ArrowRight aria-hidden="true" size={18} />
              </a>
            </Reveal>
          </ChapterShell>

          <ChapterShell chapter={chapters[1]}>
            <Reveal>
              <p className="about-kicker">Направления</p>
              <h2>{content.missionTitle}</h2>
            </Reveal>
            <Reveal className="about-prose">
              {paragraphs(content.missionBody).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </Reveal>
            <Reveal>
              <ul className="about-principles">
                <li><span>01</span><strong>Временный дом</strong><p>Безопасность, корм и ежедневный уход.</p></li>
                <li><span>02</span><strong>Здоровье</strong><p>Лечение, вакцинация и восстановление.</p></li>
                <li><span>03</span><strong>Доверие</strong><p>Социализация и поиск ответственной семьи.</p></li>
              </ul>
            </Reveal>
          </ChapterShell>

          <ChapterShell chapter={chapters[2]}>
            <Reveal>
              <p className="about-kicker">С 2024 года</p>
              <h2>{content.historyTitle}</h2>
            </Reveal>
            <div className="about-history">
              <span aria-hidden="true">2024</span>
              <Reveal className="about-prose">
                {paragraphs(content.historyBody).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </Reveal>
            </div>
          </ChapterShell>

          <ChapterShell chapter={chapters[3]}>
            <Reveal>
              <p className="about-kicker">Люди «Светлого»</p>
              <h2>Команда, которая остаётся рядом</h2>
            </Reveal>
            <div className="about-team">
              {content.teamMembers.map((member, index) => (
                <Reveal key={`${member.name}-${member.order}`} className="about-person">
                  <div className="about-person__number">{String(index + 1).padStart(2, "0")}</div>
                  {member.photo && (
                    <div className="about-person__photo">
                      <Image src={member.photo} alt={member.name} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover" />
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
              <h2>{content.resultsTitle}</h2>
              <p className="about-section-intro">{content.resultsBody}</p>
            </Reveal>
            <ol className="about-statistics">
              {content.currentStats.map((item, index) => (
                <li key={`${item.label}-${item.order}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{formatQualifiedValue(item.value, item.qualifier)}</strong>
                  <p>{item.label}</p>
                </li>
              ))}
            </ol>
          </ChapterShell>

          <ChapterShell chapter={chapters[5]}>
            <Reveal>
              <p className="about-kicker">Участие</p>
              <h2>{content.volunteerTitle}</h2>
            </Reveal>
            <Reveal className="about-prose">
              {paragraphs(content.volunteerBody).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </Reveal>
            <Reveal className="about-help-list">
              <span>Прогулки</span><span>Автопомощь</span><span>Фотографии</span><span>Ремонт</span><span>Пожертвования</span>
            </Reveal>
            <Reveal className="about-actions">
              <a href="https://vk.com/im?sel=-228082117" target="_blank" rel="noreferrer" className="about-button about-button--primary">
                Стать волонтёром <ArrowUpRight aria-hidden="true" size={18} />
              </a>
            </Reveal>
          </ChapterShell>

          <ChapterShell chapter={chapters[6]}>
            <div className="about-transparency-beam" aria-hidden="true" />
            <Reveal>
              <p className="about-kicker">Прозрачность</p>
              <h2>{content.reportsTitle}</h2>
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
              <h2>Ответы на частые вопросы</h2>
            </Reveal>
            <div className="about-faq">
              {content.faqItems.map((item, index) => (
                <details key={`${item.question}-${item.order}`}>
                  <summary>
                    <span><small>{String(index + 1).padStart(2, "0")}</small>{item.question}</span>
                    <Plus aria-hidden="true" size={20} />
                  </summary>
                  <div><p>{item.answer}</p></div>
                </details>
              ))}
            </div>
          </ChapterShell>
        </div>
      </div>
    </div>
  );
}
