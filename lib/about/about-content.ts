import type { Qualifier } from "../reports/report-domain";
import { applyRussianTypography } from "../typography.ts";

export interface AboutStatistic {
  id?: number;
  label: string;
  value: number;
  qualifier: Qualifier;
  unit?: string;
  order: number;
}

export interface AboutTeamMember {
  id?: number;
  name: string;
  role: string;
  city?: string;
  bio?: string;
  quote?: string;
  photo?: string;
  order: number;
}

export interface AboutFaqItem {
  id?: number;
  question: string;
  answer: string;
  order: number;
}

export interface AboutPageContent {
  heroTitle: string;
  heroIntro: string;
  heroVideo?: string;
  heroPoster?: string;
  missionTitle: string;
  missionBody: string;
  directionsImage?: string;
  historyTitle: string;
  historyBody: string;
  historyImage?: string;
  currentStats: AboutStatistic[];
  teamMembers: AboutTeamMember[];
  resultsTitle: string;
  resultsBody: string;
  resultsImage?: string;
  volunteerTitle: string;
  volunteerBody: string;
  volunteerVideo?: string;
  volunteerPoster?: string;
  faqItems: AboutFaqItem[];
  faqImage?: string;
  reportsTitle: string;
  reportsBody: string;
}

export const ABOUT_FALLBACK: AboutPageContent = {
  heroTitle: "АНБО «Светлый»: помогаем животным",
  heroIntro: "Мы помогаем бездомным и попавшим в беду животным. Даём дом на время, лечим и выхаживаем, заново учим доверять человеку — и ищем тех, кто заберёт к себе навсегда.",
  heroPoster: "/about/real/community-care.jpg",
  missionTitle: "Помощь начинается с заботы",
  missionBody: "За каждым подопечным стоит одна и та же работа: место, где жить, лечение и терпеливая социализация. Семью ищем только после этого — когда животное к ней готово.",
  directionsImage: "/about/real/group-training.jpg",
  historyTitle: "Мы молодые только на бумаге",
  historyBody: "АНБО «Светлый» зарегистрирована в октябре 2024 года в Ярославле. Но команда собралась намного раньше: основатели волонтёрят много лет и за это время вытащили из беды почти сотню собак и кошек.\n\nОрганизация понадобилась, чтобы делать то же самое, но для большего числа животных — с расчётным счётом, отчётами и правом принимать помощь официально.",
  historyImage: "/about/real/shelter-yard.jpg",
  currentStats: [
    { label: "собак находятся на кураторстве", value: 60, qualifier: "atLeast", unit: "собак", order: 10 },
    { label: "кошек находятся на кураторстве", value: 25, qualifier: "exact", unit: "кошек", order: 20 },
  ],
  teamMembers: [
    {
      name: "Марина Морозова",
      role: "Учредитель, предприниматель",
      city: "Рыбинск",
      bio: "Предприниматель из Рыбинска Ярославской области. Много лет занимается зоозащитой и вкладывает в неё собственные силы и средства.",
      quote: "Помогать животным — это зов сердца. Когда очередной подопечный обретает семью, понимаешь, ради чего мы всё это делаем.",
      order: 10,
    },
    {
      name: "Светлана Клюкина",
      role: "Учредитель, адвокат",
      city: "Ярославль",
      bio: "Адвокат из Ярославля. Много лет вытаскивает животных из беды: кто-то из её подопечных уже дома, кто-то до сих пор на её попечении.",
      quote: "У бездомного животного нет голоса, чтобы защитить себя. Быть этим голосом — и есть наша работа.",
      photo: "/about/real/team/svetlana-klyukina.jpg",
      order: 20,
    },
    {
      name: "Андрей Синицин",
      role: "Учредитель, предприниматель",
      city: "Ярославль",
      bio: "Предприниматель из Ярославля. Публичности избегает, зато на нём вольеры, заборы и всё, что нужно чинить и достраивать.",
      quote: "Безопасный вольер, надёжный забор и качественный корм — это то, с чего начинается реальная забота и тепло для каждой собаки.",
      order: 30,
    },
  ],
  resultsTitle: "Ежедневная забота в цифрах",
  resultsBody: "За каждой цифрой — прогулки в дождь, поездки в клинику и чьи-то деньги, отправленные незнакомой собаке. Показываем только то, что можем подтвердить, и обновляем, когда появляются новые данные.",
  resultsImage: "/about/real/care-indoor.jpg",
  volunteerTitle: "Помогать можно по-разному",
  volunteerBody: "Волонтёры «Светлого» гуляют с собаками, возят их в клинику, снимают для анкет и рассказывают о подопечных друзьям. Всё это — в свободное время и бесплатно.\n\nЕсли хотите присоединиться, опыт не нужен: научим на первой же прогулке.",
  volunteerPoster: "/about/real/volunteer-walk.jpg",
  faqItems: [
    {
      question: "Как стать волонтёром?",
      answer: "Напишите нам во «ВКонтакте». Позовём на ближайшую прогулку — там познакомитесь с командой и с собаками. Опыта не нужно, всему научим на месте.",
      order: 10,
    },
    {
      question: "Нужен ли опыт работы с животными?",
      answer: "Нет. Нужны желание и обязательность: собака привыкает к человеку и ждёт его. Начать можно с прогулок и помощи с кормлением — рядом всегда будет кто-то из опытных волонтёров.",
      order: 20,
    },
    {
      question: "Где находится приют?",
      answer: "Приют в Ярославской области, прогулки проходят в Ярославле и Рыбинске. Точный адрес пришлём, когда договоримся о первой встрече.",
      order: 30,
    },
    {
      question: "Как помочь финансово?",
      answer: "Переведите пожертвование на реквизиты АНБО «Светлый» (ОГРН 1247600009590) или оставьте в одном из наших боксов в Ярославле и Рыбинске. Деньги уходят на корм, лечение и вольеры.",
      order: 40,
    },
  ],
  faqImage: "/about/real/dog-blackwhite.jpg",
  reportsTitle: "Помощь должна быть видимой",
  reportsBody: "Публикуем годовые отчёты и подтверждённые цифры — чтобы каждый, кто помог, видел, куда ушли деньги.",
};

/** Весь текст страницы проходит через типографику — и из CMS, и запасной. */
function managedText(value: string | undefined, fallback: string): string {
  return applyRussianTypography(value?.trim() ? value : fallback);
}

function managedArray<T extends { order: number }>(value: T[] | undefined, fallback: T[]): T[] {
  const source = value?.length ? value : fallback;
  return [...source].sort((left, right) => left.order - right.order);
}

function managedTeamMembers(value: AboutTeamMember[] | undefined, fallback: AboutTeamMember[]): AboutTeamMember[] {
  const fallbackByName = new Map(fallback.map((member) => [member.name, member]));
  return managedArray(value, fallback).map((member) => {
    const photo = member.photo || fallbackByName.get(member.name)?.photo;
    const typographed: AboutTeamMember = {
      ...member,
      role: applyRussianTypography(member.role),
      bio: member.bio ? applyRussianTypography(member.bio) : member.bio,
      quote: member.quote ? applyRussianTypography(member.quote) : member.quote,
    };
    return photo ? { ...typographed, photo } : typographed;
  });
}

function managedFaqItems(value: AboutFaqItem[] | undefined, fallback: AboutFaqItem[]): AboutFaqItem[] {
  return managedArray(value, fallback).map((item) => ({
    ...item,
    question: applyRussianTypography(item.question),
    answer: applyRussianTypography(item.answer),
  }));
}

export function mergeAboutContent(content: Partial<AboutPageContent> = {}): AboutPageContent {
  return {
    heroTitle: managedText(content.heroTitle, ABOUT_FALLBACK.heroTitle),
    heroIntro: managedText(content.heroIntro, ABOUT_FALLBACK.heroIntro),
    heroVideo: content.heroVideo || ABOUT_FALLBACK.heroVideo,
    heroPoster: content.heroPoster || ABOUT_FALLBACK.heroPoster,
    missionTitle: managedText(content.missionTitle, ABOUT_FALLBACK.missionTitle),
    missionBody: managedText(content.missionBody, ABOUT_FALLBACK.missionBody),
    directionsImage: content.directionsImage || ABOUT_FALLBACK.directionsImage,
    historyTitle: managedText(content.historyTitle, ABOUT_FALLBACK.historyTitle),
    historyBody: managedText(content.historyBody, ABOUT_FALLBACK.historyBody),
    historyImage: content.historyImage || ABOUT_FALLBACK.historyImage,
    currentStats: managedArray(content.currentStats, ABOUT_FALLBACK.currentStats),
    teamMembers: managedTeamMembers(content.teamMembers, ABOUT_FALLBACK.teamMembers),
    resultsTitle: managedText(content.resultsTitle, ABOUT_FALLBACK.resultsTitle),
    resultsBody: managedText(content.resultsBody, ABOUT_FALLBACK.resultsBody),
    resultsImage: content.resultsImage || ABOUT_FALLBACK.resultsImage,
    volunteerTitle: managedText(content.volunteerTitle, ABOUT_FALLBACK.volunteerTitle),
    volunteerBody: managedText(content.volunteerBody, ABOUT_FALLBACK.volunteerBody),
    volunteerVideo: content.volunteerVideo || ABOUT_FALLBACK.volunteerVideo,
    volunteerPoster: content.volunteerPoster || ABOUT_FALLBACK.volunteerPoster,
    faqItems: managedFaqItems(content.faqItems, ABOUT_FALLBACK.faqItems),
    faqImage: content.faqImage || ABOUT_FALLBACK.faqImage,
    reportsTitle: managedText(content.reportsTitle, ABOUT_FALLBACK.reportsTitle),
    reportsBody: managedText(content.reportsBody, ABOUT_FALLBACK.reportsBody),
  };
}
