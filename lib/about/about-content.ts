import type { Qualifier } from "../reports/report-domain";

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
  heroIntro: "Автономная некоммерческая благотворительная организация «Светлый» создана, чтобы помогать бездомным и попавшим в беду животным. Им дают временный дом и уход. Показывают, что такое любовь и забота. Учат впервые или вновь доверять человеку. И, конечно, ищут ответственных хозяев.",
  heroVideo: "/hero-video.mp4",
  missionTitle: "Системная помощь начинается с заботы",
  missionBody: "Мы стараемся подходить к помощи животным комплексно: даём временный дом и уход, организуем ветеринарную помощь, социализацию и ищем ответственных хозяев.",
  directionsImage: "/photo-placeholder.jpg",
  historyTitle: "Молодая организация с большим опытом",
  historyBody: "АНБО «Светлый» открыта в октябре 2024 года в Ярославле. Однако, будучи официально молодой, организация имеет большой опыт зоозащитной работы. Её основатели — команда волонтёров с многолетним стажем, на счету которых почти сотня спасённых собачьих и кошачьих жизней. Создание благотворительной организации стало новой ступенью этой работы, которая позволит помочь ещё большему числу животных.",
  historyImage: "/photo-placeholder.jpg",
  currentStats: [
    { label: "собак находятся на кураторстве", value: 60, qualifier: "atLeast", unit: "собак", order: 10 },
    { label: "кошек находятся на кураторстве", value: 25, qualifier: "exact", unit: "кошек", order: 20 },
  ],
  teamMembers: [
    {
      name: "Марина Морозова",
      role: "Учредитель, предприниматель",
      city: "Рыбинск",
      bio: "Предприниматель из Рыбинска Ярославской области. Человек с большим сердцем, который очень любит животных и занимается благотворительностью в сфере зоозащиты.",
      quote: "Помогать животным — это зов сердца. Когда очередной подопечный обретает семью, понимаешь, ради чего мы всё это делаем.",
      photo: "/photo-placeholder.jpg",
      order: 10,
    },
    {
      name: "Светлана Клюкина",
      role: "Учредитель, адвокат",
      city: "Ярославль",
      bio: "Адвокат из Ярославля. Много лет помогает бездомным и оказавшимся в беде животным — на её счету немало спасённых кошачьих и собачьих судеб. Часть подопечных нашла новый дом, а часть продолжает оставаться под кураторством Светланы.",
      quote: "У бездомного животного нет голоса, чтобы защитить себя. Быть этим голосом — и есть наша работа.",
      photo: "/photo-placeholder.jpg",
      order: 20,
    },
    {
      name: "Андрей Синицин",
      role: "Учредитель, предприниматель",
      city: "Ярославль",
      bio: "Предприниматель из Ярославля. Совершенно непубличный человек и крепкий хозяйственник, который помогает «Светлому» с материально-техническим обеспечением.",
      quote: "Безопасный вольер, надёжный забор и качественный корм — это то, с чего начинается реальная забота и тепло для каждой собаки.",
      photo: "/photo-placeholder.jpg",
      order: 30,
    },
  ],
  resultsTitle: "Ежедневная забота в цифрах",
  resultsBody: "Эти показатели складываются из ежедневного труда волонтёров и поддержки неравнодушных людей. Мы показываем их с понятными оговорками и обновляем по мере появления подтверждённых данных.",
  resultsImage: "/photo-placeholder.jpg",
  volunteerTitle: "Помогать можно по-разному",
  volunteerBody: "В команде «Светлого» есть прекрасные волонтёры, которым мы бесконечно благодарны за безвозмездную помощь: прогулки с собаками, автоперевозки животных, фотосессии, распространение информации и многое другое. Мы всегда рады новым людям — ждём всех, кто хочет и готов помогать животным.",
  volunteerVideo: "/hero-video-2.mp4",
  faqItems: [
    {
      question: "Как стать волонтёром?",
      answer: "Напишите нам в социальных сетях или позвоните. Мы приглашаем на первую прогулку с собаками, где вы знакомитесь с командой и подопечными. Никакого специального опыта не нужно — мы всему научим.",
      order: 10,
    },
    {
      question: "Нужен ли опыт работы с животными?",
      answer: "Нет. Главное — желание помогать и ответственный подход. Опытные волонтёры всегда рядом и помогут освоиться. Вы можете начать с простых задач: прогулки, помощь с кормлением.",
      order: 20,
    },
    {
      question: "Где находится приют?",
      answer: "Приют расположен в Ярославской области. Основные площадки волонтёрской активности находятся в Ярославле и Рыбинске. Точный адрес сообщим при первом контакте.",
      order: 30,
    },
    {
      question: "Как помочь финансово?",
      answer: "Вы можете сделать пожертвование на официальные реквизиты АНБО «Светлый» (ОГРН 1247600009590). Все средства идут на корм, ветеринарию и обустройство вольеров.",
      order: 40,
    },
  ],
  faqImage: "/photo-placeholder.jpg",
  reportsTitle: "Помощь должна быть видимой",
  reportsBody: "Мы публикуем годовые документы и подтверждённые показатели, чтобы каждый мог увидеть, как устроена работа АНБО «Светлый».",
};

function managedText(value: string | undefined, fallback: string): string {
  return value?.trim() ? value : fallback;
}

function managedArray<T extends { order: number }>(value: T[] | undefined, fallback: T[]): T[] {
  const source = value?.length ? value : fallback;
  return [...source].sort((left, right) => left.order - right.order);
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
    teamMembers: managedArray(content.teamMembers, ABOUT_FALLBACK.teamMembers),
    resultsTitle: managedText(content.resultsTitle, ABOUT_FALLBACK.resultsTitle),
    resultsBody: managedText(content.resultsBody, ABOUT_FALLBACK.resultsBody),
    resultsImage: content.resultsImage || ABOUT_FALLBACK.resultsImage,
    volunteerTitle: managedText(content.volunteerTitle, ABOUT_FALLBACK.volunteerTitle),
    volunteerBody: managedText(content.volunteerBody, ABOUT_FALLBACK.volunteerBody),
    volunteerVideo: content.volunteerVideo || ABOUT_FALLBACK.volunteerVideo,
    volunteerPoster: content.volunteerPoster || ABOUT_FALLBACK.volunteerPoster,
    faqItems: managedArray(content.faqItems, ABOUT_FALLBACK.faqItems),
    faqImage: content.faqImage || ABOUT_FALLBACK.faqImage,
    reportsTitle: managedText(content.reportsTitle, ABOUT_FALLBACK.reportsTitle),
    reportsBody: managedText(content.reportsBody, ABOUT_FALLBACK.reportsBody),
  };
}
