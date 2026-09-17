import type { CensusPet } from "../api/services/pet-stats";
import type { StrapiNews } from "../api/types";
import { buildComposition, type Composition } from "./shelter-scales";

/**
 * Все разрезы одного года в одном месте.
 *
 * Секции страницы берут отсюда готовые числа и сами прячутся, если разрез
 * пустой: первый неполный год и полный год должны держаться на одной вёрстке.
 * Считается по карточкам подопечных, отчёту и новостям, ни одно значение
 * не задано руками.
 */

const DAY = 86_400_000;
export const MONTHS_SHORT = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
export const MONTHS_IN = [
  "январе", "феврале", "марте", "апреле", "мае", "июне", "июле", "августе", "сентябре", "октябре", "ноябре", "декабре",
];

export interface YearPet {
  documentId: string;
  slug?: string;
  name: string;
  cover?: string;
  photo?: string;
  intakeDate?: string;
  adoptedAt?: string;
  type: "dog" | "cat";
  /** Полных лет на конец года, если известна дата рождения */
  age?: number;
}

export interface MonthSlice {
  month: number;
  label: string;
  intake: number;
  adopted: number;
  /** Кто поступил в этом месяце: имена для подписи под столбиком */
  names: string[];
}

export interface WalkHome {
  name: string;
  cover?: string;
  days: number;
}

export interface YearReport {
  year: number;
  /** Поступили под опеку в этом году */
  arrived: YearPet[];
  /** Уехали домой в этом году */
  adopted: YearPet[];
  /** Под опекой на 31 декабря этого года */
  inCare: YearPet[];
  /** Помесячная хроника, только месяцы года */
  months: MonthSlice[];
  /** Поступления по всем двенадцати месяцам: для сезонной кривой */
  monthlyIntake: number[];
  /** Самый плотный месяц по поступлениям */
  busiestMonth?: MonthSlice;
  /** Состав тех, кто был под опекой на конец года */
  composition: Composition;
  /** Возрастные группы на конец года */
  ages: { key: string; label: string; count: number }[];
  /** Сроки от поступления до дома у тех, кто уехал в этом году */
  walks: WalkHome[];
  /** Пришли в этом году и уже дома, даже если уехали позже: путь целиком */
  homeWalks: WalkHome[];
  /** Середина этих сроков */
  medianWalk?: number;
  /** Сколько кадров лежит в карточках подопечных этого года */
  photos: number;
  /** Новости, вышедшие в этом году */
  news: StrapiNews[];
}

function parseYearOf(value?: string): number | undefined {
  const head = String(value ?? "").slice(0, 4);
  if (!/^\d{4}$/.test(head)) return undefined;
  return Number(head);
}

function toYearPet(pet: CensusPet, endOfYear: Date): YearPet {
  const age = pet.birthDate
    ? Math.floor((endOfYear.getTime() - new Date(pet.birthDate).getTime()) / (DAY * 365.25))
    : undefined;
  return {
    documentId: pet.documentId,
    slug: pet.slug,
    name: pet.name,
    cover: pet.cover,
    photo: pet.photo,
    intakeDate: pet.intakeDate,
    adoptedAt: pet.adoptedAt,
    type: pet.type,
    age: age !== undefined && age >= 0 ? age : undefined,
  };
}

export function buildYearReport(year: number, pets: CensusPet[], news: StrapiNews[] = []): YearReport {
  const endOfYear = new Date(`${year}-12-31T23:59:59`);
  const arrivedPets = pets.filter((pet) => parseYearOf(pet.intakeDate) === year);
  const adoptedPets = pets.filter((pet) => parseYearOf(pet.adoptedAt) === year);
  // Под опекой на конец года: поступили не позже 31 декабря и не уехали раньше.
  const inCarePets = pets.filter((pet) => {
    const intake = parseYearOf(pet.intakeDate);
    if (intake === undefined || intake > year) return false;
    const left = parseYearOf(pet.adoptedAt);
    return left === undefined || left > year;
  });

  const months: MonthSlice[] = MONTHS_SHORT.map((label, month) => ({ month, label, intake: 0, adopted: 0, names: [] }));
  for (const pet of arrivedPets) {
    const month = Number(String(pet.intakeDate).slice(5, 7)) - 1;
    if (months[month]) {
      months[month].intake += 1;
      months[month].names.push(pet.name);
    }
  }
  for (const pet of adoptedPets) {
    const month = Number(String(pet.adoptedAt).slice(5, 7)) - 1;
    if (months[month]) months[month].adopted += 1;
  }

  const groups = [
    { key: "puppy", label: "до года", count: 0 },
    { key: "young", label: "от года до трёх", count: 0 },
    { key: "adult", label: "от четырёх до семи", count: 0 },
    { key: "senior", label: "восемь и старше", count: 0 },
  ];
  for (const pet of inCarePets) {
    if (!pet.birthDate) continue;
    const age = Math.floor((endOfYear.getTime() - new Date(pet.birthDate).getTime()) / (DAY * 365.25));
    if (age < 0) continue;
    groups[age < 1 ? 0 : age <= 3 ? 1 : age <= 7 ? 2 : 3].count += 1;
  }

  const walks = adoptedPets
    .filter((pet) => pet.intakeDate && pet.adoptedAt)
    .map((pet) => ({
      name: pet.name,
      cover: pet.cover,
      days: Math.max(0, Math.round((new Date(pet.adoptedAt!).getTime() - new Date(pet.intakeDate!).getTime()) / DAY)),
    }))
    .sort((left, right) => left.days - right.days);

  const withEvents = months.filter((slice) => slice.intake > 0 || slice.adopted > 0);
  const busiest = months.reduce<MonthSlice | undefined>(
    (best, slice) => (slice.intake > 0 && (!best || slice.intake > best.intake) ? slice : best),
    undefined,
  );

  return {
    year,
    arrived: arrivedPets.map((pet) => toYearPet(pet, endOfYear)),
    adopted: adoptedPets.map((pet) => toYearPet(pet, endOfYear)),
    inCare: inCarePets.map((pet) => toYearPet(pet, endOfYear)),
    // Хронику показываем от первого события до последнего: пустые месяцы
    // в середине остаются, а хвосты до начала работы приюта не нужны.
    months: withEvents.length > 0 ? months.slice(withEvents[0].month, withEvents[withEvents.length - 1].month + 1) : [],
    monthlyIntake: months.map((slice) => slice.intake),
    busiestMonth: busiest,
    composition: buildComposition(inCarePets),
    ages: groups.filter((group) => group.count > 0),
    walks,
    // Дорога домой у тех, кто пришёл в этом году: уехать они могли и позже,
    // но путь начался здесь, и без этого разреза первый год выглядит пустым.
    homeWalks: arrivedPets
      .filter((pet) => pet.intakeDate && pet.adoptedAt)
      .map((pet) => ({
        name: pet.name,
        cover: pet.cover,
        days: Math.max(0, Math.round((new Date(pet.adoptedAt!).getTime() - new Date(pet.intakeDate!).getTime()) / DAY)),
      }))
      .sort((left, right) => left.days - right.days),
    medianWalk: walks.length > 0 ? walks[Math.floor(walks.length / 2)].days : undefined,
    photos: arrivedPets.reduce((sum, pet) => sum + (pet.photoCount ?? 0), 0),
    news: news.filter((item) => parseYearOf(item.publishedAt) === year),
  };
}
