import type { CensusPet } from "../api/services/pet-stats";

/**
 * Цифры, которых нет в отчётах.
 *
 * В форму для Минюста это не попадает, но о приюте рассказывает больше
 * любой сводки. Всё считается по карточкам животных, ни одно значение
 * не задано руками.
 */

export interface PetMark {
  name: string;
  cover?: string;
  sex?: string;
  value: number;
}

export interface CuriousStats {
  /** Самый старший житель и его полные годы */
  oldest?: PetMark;
  /** Кто приехал последним и когда */
  newest?: { name: string; cover?: string; sex?: string; date: string };
  /** Сколько лет суммарно ждут дом все, кто ждёт сейчас */
  waitingYears: number;
  /** Средний срок в приюте у тех, кто ещё ждёт, в днях */
  averageWaitDays?: number;
  /** Сколько подопечных старше десяти лет */
  overTen: number;
  /** Сколько весят все подопечные вместе, кг */
  weightTotal?: number;
  /** Самый тяжёлый и его вес */
  heaviest?: PetMark;
  /** Фотографий во всех карточках */
  photos: number;
  /** Самая частая первая буква имени */
  topLetter?: { letter: string; count: number };
  /** День недели, на который пришлось больше всего поступлений */
  busiestDay?: { label: string; count: number };
  /** Поступления за зимние и летние месяцы всех лет */
  winterIntake: number;
  summerIntake: number;
}

const DAY = 86_400_000;

/** Дни недели в винительном падеже, как после «пришлось на». */
const WEEKDAYS = ["воскресенье", "понедельник", "вторник", "среду", "четверг", "пятницу", "субботу"];

function years(from: string, to: Date): number {
  return (to.getTime() - new Date(from).getTime()) / (DAY * 365.25);
}

function days(from: string, to: Date): number {
  return Math.max(0, Math.round((to.getTime() - new Date(from).getTime()) / DAY));
}

function top<T>(list: T[], score: (item: T) => number): T | undefined {
  return list.reduce<T | undefined>((best, item) => (best === undefined || score(item) > score(best) ? item : best), undefined);
}

export function buildCuriousStats(pets: CensusPet[], now = new Date()): CuriousStats {
  const aged = pets.filter((pet) => pet.birthDate);
  const oldestPet = top(aged, (pet) => years(pet.birthDate!, now));
  const arrived = pets.filter((pet) => pet.intakeDate);
  const newestPet = top(arrived, (pet) => new Date(pet.intakeDate!).getTime());
  const waiting = arrived.filter((pet) => pet.status !== "home");
  const waitingDays = waiting.reduce((sum, pet) => sum + days(pet.intakeDate!, now), 0);
  const weighed = pets.filter((pet) => pet.weight !== undefined);
  const heaviestPet = top(weighed, (pet) => pet.weight!);

  const letters = new Map<string, number>();
  for (const pet of pets) {
    const letter = pet.name.trim().charAt(0).toUpperCase();
    if (letter) letters.set(letter, (letters.get(letter) ?? 0) + 1);
  }
  const topLetterEntry = top([...letters.entries()], ([, count]) => count);

  const weekdays = new Array<number>(7).fill(0);
  let winterIntake = 0;
  let summerIntake = 0;
  for (const pet of arrived) {
    const date = new Date(pet.intakeDate!);
    weekdays[date.getDay()] += 1;
    const month = date.getMonth();
    if (month === 11 || month <= 1) winterIntake += 1;
    if (month >= 5 && month <= 7) summerIntake += 1;
  }
  const busiest = weekdays.indexOf(Math.max(...weekdays));

  return {
    oldest: oldestPet
      ? { name: oldestPet.name, cover: oldestPet.cover, sex: oldestPet.sex, value: Math.floor(years(oldestPet.birthDate!, now)) }
      : undefined,
    newest: newestPet ? { name: newestPet.name, cover: newestPet.cover, sex: newestPet.sex, date: newestPet.intakeDate! } : undefined,
    waitingYears: Math.round(waitingDays / 365.25),
    averageWaitDays: waiting.length ? Math.round(waitingDays / waiting.length) : undefined,
    overTen: aged.filter((pet) => years(pet.birthDate!, now) >= 10).length,
    weightTotal: weighed.length ? Math.round(weighed.reduce((sum, pet) => sum + pet.weight!, 0)) : undefined,
    heaviest: heaviestPet
      ? { name: heaviestPet.name, cover: heaviestPet.cover, sex: heaviestPet.sex, value: Math.round(heaviestPet.weight!) }
      : undefined,
    photos: pets.reduce((sum, pet) => sum + (pet.photoCount ?? 0), 0),
    topLetter: topLetterEntry ? { letter: topLetterEntry[0], count: topLetterEntry[1] } : undefined,
    busiestDay: arrived.length ? { label: WEEKDAYS[busiest], count: weekdays[busiest] } : undefined,
    winterIntake,
    summerIntake,
  };
}
