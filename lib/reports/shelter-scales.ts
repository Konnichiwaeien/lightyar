import type { CensusPet } from "../api/services/pet-stats";

/**
 * Разрезы, которые показывают шкалы-сцены.
 *
 * Всё считается из карточек животных: отдельной таблицы со сводкой нет,
 * и заводить её означало бы держать вторую версию правды.
 */

export interface AgeGroup {
  key: string;
  label: string;
  count: number;
  pets: CensusPet[];
}

export interface WaitStats {
  /** Сколько сейчас ждут дом */
  waiting: number;
  /** Из них живут в приюте дольше года */
  overYear: number;
  /** Кто ждёт дольше всех, сколько дней и его фото из карточки */
  longest?: { name: string; days: number; cover?: string };
  /** Дни от поступления до дома у тех, кто уехал */
  adoptedDays: number[];
  /** Середина этого ряда: половина уехала быстрее, половина дольше */
  medianDays?: number;
}

export interface Composition {
  dogs: number;
  cats: number;
  females: number;
  males: number;
  large: number;
  medium: number;
  small: number;
  sterilized: number;
  /** Пол не указан: обычно помёт, записанный одной карточкой */
  unsexed: number;
  total: number;
}

const DAY = 86_400_000;

/** Полных лет на указанную дату. */
function years(birth: string, at: Date): number {
  return Math.floor((at.getTime() - new Date(birth).getTime()) / (DAY * 365.25));
}

/**
 * Возраст группами.
 *
 * Границы выбраны по тому, как меняются шансы найти дом: щенка разбирают
 * быстро, пожилую собаку могут не замечать годами. Карточки без даты рождения
 * в группы не попадают, поэтому сумма групп бывает меньше общего числа.
 */
export function buildAgeGroups(pets: CensusPet[], now = new Date()): AgeGroup[] {
  const groups: AgeGroup[] = [
    { key: "puppy", label: "до года", count: 0, pets: [] },
    { key: "young", label: "от года до трёх", count: 0, pets: [] },
    { key: "adult", label: "от четырёх до семи", count: 0, pets: [] },
    { key: "senior", label: "восемь и старше", count: 0, pets: [] },
  ];

  for (const pet of pets) {
    if (!pet.birthDate) continue;
    const age = years(pet.birthDate, now);
    const index = age < 1 ? 0 : age <= 3 ? 1 : age <= 7 ? 2 : 3;
    groups[index].pets.push(pet);
    groups[index].count += 1;
  }

  return groups.filter((group) => group.count > 0);
}

/** Сроки ожидания: сколько ждут сейчас и сколько занял путь домой. */
export function buildWaitStats(pets: CensusPet[], now = new Date()): WaitStats {
  const waitingPets = pets.filter((pet) => pet.status !== "home" && pet.intakeDate);
  const days = (from: string, to: Date | string) =>
    Math.max(0, Math.round(((typeof to === "string" ? new Date(to) : to).getTime() - new Date(from).getTime()) / DAY));

  const waits = waitingPets
    .map((pet) => ({ name: pet.name, days: days(pet.intakeDate!, now), cover: pet.cover }))
    .sort((left, right) => right.days - left.days);

  const adoptedDays = pets
    .filter((pet) => pet.status === "home" && pet.intakeDate && pet.adoptedAt)
    .map((pet) => days(pet.intakeDate!, pet.adoptedAt!))
    .sort((left, right) => left - right);

  return {
    waiting: waitingPets.length,
    overYear: waits.filter((entry) => entry.days > 365).length,
    longest: waits[0],
    adoptedDays,
    medianDays: adoptedDays.length ? adoptedDays[Math.floor(adoptedDays.length / 2)] : undefined,
  };
}

/** Состав: пол, размер, стерилизация. Поля заполнены не у всех карточек. */
export function buildComposition(pets: CensusPet[]): Composition {
  const count = (predicate: (pet: CensusPet) => boolean) => pets.filter(predicate).length;
  return {
    dogs: count((pet) => pet.type === "dog"),
    cats: count((pet) => pet.type === "cat"),
    females: count((pet) => pet.sex === "female"),
    males: count((pet) => pet.sex === "male"),
    large: count((pet) => pet.size === "large"),
    medium: count((pet) => pet.size === "medium"),
    small: count((pet) => pet.size === "small"),
    sterilized: count((pet) => pet.sterilized === true),
    unsexed: count((pet) => pet.sex !== "female" && pet.sex !== "male"),
    total: pets.length,
  };
}

/** Склонение существительного при числе: 1 день, 2 дня, 5 дней. */
export function plural(value: number, one: string, few: string, many: string): string {
  const mod100 = Math.abs(value) % 100;
  const mod10 = mod100 % 10;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

/**
 * Поступления по месяцам года за всё время: январь первым.
 * Показывает сезон, а не хронологию: её несёт график по кварталам.
 */
export function buildMonthlyIntake(pets: CensusPet[]): number[] {
  const months = new Array<number>(12).fill(0);
  for (const pet of pets) {
    if (!pet.intakeDate) continue;
    const month = new Date(pet.intakeDate).getMonth();
    if (Number.isInteger(month)) months[month] += 1;
  }
  return months;
}
