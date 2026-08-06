/**
 * Сводка по подопечным для страниц отчётности.
 *
 * Считается из карточек животных, а не хранится отдельно: единственный источник
 * правды — сами записи. Дата поступления и дата пристройства обязательны для
 * годовых разрезов; записи без них не попадают в разбивку по годам, но остаются
 * в общих счётчиках.
 */

export interface PetStatsInput {
  petStatus?: string | null;
  type?: string | null;
  intakeDate?: string | null;
  adoptedAt?: string | null;
  undergoingTreatment?: boolean | null;
}

export interface YearSlice {
  year: number;
  intake: number;
  adopted: number;
}

export interface PetStats {
  /** Всего карточек — все, кто когда-либо попадал под опеку */
  total: number;
  /** Сейчас ищут дом */
  inCare: number;
  /** Уже дома */
  adopted: number;
  /** Из тех, кто под опекой, сейчас лечится */
  inTreatment: number;
  dogs: number;
  cats: number;
  /** Годы, в которых что-то происходило, от раннего к позднему */
  years: YearSlice[];
  /** Накопительная кривая пристройств по месяцам, для графика */
  adoptionTimeline: { month: string; total: number }[];
  /** Сколько записей осталось без даты поступления — честная оговорка под графиком */
  withoutIntakeDate: number;
}

function yearOf(value?: string | null): number | undefined {
  if (!value) return undefined;
  const year = Number(String(value).slice(0, 4));
  return Number.isInteger(year) ? year : undefined;
}

function monthOf(value?: string | null): string | undefined {
  if (!value) return undefined;
  const month = String(value).slice(0, 7);
  return /^\d{4}-\d{2}$/.test(month) ? month : undefined;
}

function addMonth(month: string): string {
  const [year, monthIndex] = month.split("-").map(Number);
  return monthIndex === 12
    ? `${year + 1}-01`
    : `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export function buildPetStats(pets: PetStatsInput[]): PetStats {
  const adoptedPets = pets.filter((pet) => pet.petStatus === "home");
  const inCarePets = pets.filter((pet) => pet.petStatus !== "home");

  const yearMap = new Map<number, YearSlice>();
  const touchYear = (year: number): YearSlice => {
    let slice = yearMap.get(year);
    if (!slice) {
      slice = { year, intake: 0, adopted: 0 };
      yearMap.set(year, slice);
    }
    return slice;
  };

  for (const pet of pets) {
    const intakeYear = yearOf(pet.intakeDate);
    if (intakeYear !== undefined) touchYear(intakeYear).intake += 1;
    const adoptedYear = yearOf(pet.adoptedAt);
    if (adoptedYear !== undefined) touchYear(adoptedYear).adopted += 1;
  }

  const adoptionMonths = adoptedPets
    .map((pet) => monthOf(pet.adoptedAt))
    .filter((month): month is string => Boolean(month))
    .sort();

  const adoptionTimeline: { month: string; total: number }[] = [];
  if (adoptionMonths.length > 0) {
    const perMonth = new Map<string, number>();
    for (const month of adoptionMonths) {
      perMonth.set(month, (perMonth.get(month) || 0) + 1);
    }
    // непрерывная шкала: месяцы без пристройств тоже нужны, иначе линия врёт про темп
    let cursor = adoptionMonths[0];
    const last = adoptionMonths[adoptionMonths.length - 1];
    let running = 0;
    while (true) {
      running += perMonth.get(cursor) || 0;
      adoptionTimeline.push({ month: cursor, total: running });
      if (cursor === last) break;
      cursor = addMonth(cursor);
    }
  }

  return {
    total: pets.length,
    inCare: inCarePets.length,
    adopted: adoptedPets.length,
    inTreatment: inCarePets.filter((pet) => pet.undergoingTreatment === true).length,
    dogs: pets.filter((pet) => pet.type === "dog").length,
    cats: pets.filter((pet) => pet.type === "cat").length,
    years: [...yearMap.values()].sort((left, right) => left.year - right.year),
    adoptionTimeline,
    withoutIntakeDate: pets.filter((pet) => !pet.intakeDate).length,
  };
}

export const EMPTY_PET_STATS: PetStats = {
  total: 0,
  inCare: 0,
  adopted: 0,
  inTreatment: 0,
  dogs: 0,
  cats: 0,
  years: [],
  adoptionTimeline: [],
  withoutIntakeDate: 0,
};
