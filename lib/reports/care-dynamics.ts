import type { CensusPet } from "../api/services/pet-stats";

export interface QuarterSlice {
  /** Подпись оси: римский номер квартала и две цифры года */
  label: string;
  /** Сортировочный ключ вида 2025-2 */
  key: string;
  intake: number;
  adopted: number;
}

const ROMAN = ["I", "II", "III", "IV"];

/**
 * Поступления и пристройства по кварталам.
 *
 * Квартал, а не месяц: за первые два года пристройства случались всего
 * в пяти месяцах, и на месячной сетке вторая линия почти везде лежала бы
 * на нуле, а подписи значений наезжали бы друг на друга.
 *
 * Даты пристройства нет у части карточек, поэтому животное может попасть
 * в поступления и не попасть в пристройства: это не потеря, а отсутствие
 * даты в исходных данных.
 */
export function buildQuarters(pets: Pick<CensusPet, "intakeYear">[] | CensusDates[]): QuarterSlice[] {
  const map = new Map<string, QuarterSlice>();

  const touch = (year: number, quarter: number): QuarterSlice => {
    const key = `${year}-${quarter}`;
    let slice = map.get(key);
    if (!slice) {
      slice = { key, label: `${ROMAN[quarter]} ${String(year).slice(2)}`, intake: 0, adopted: 0 };
      map.set(key, slice);
    }
    return slice;
  };

  for (const pet of pets as CensusDates[]) {
    const intake = parse(pet.intakeDate);
    if (intake) touch(intake.year, intake.quarter).intake += 1;
    const adopted = parse(pet.adoptedAt);
    if (adopted) touch(adopted.year, adopted.quarter).adopted += 1;
  }

  const slices = [...map.values()].sort((left, right) => left.key.localeCompare(right.key, "en", { numeric: true }));
  // Кварталы без единого события всё равно нужны: без них линия перескакивает
  // через провал и врёт о ритме поступлений.
  return fillGaps(slices, touch, map);
}

interface CensusDates {
  intakeDate?: string | null;
  adoptedAt?: string | null;
  intakeYear?: number;
}

function parse(value?: string | null): { year: number; quarter: number } | null {
  if (!value) return null;
  const year = Number(String(value).slice(0, 4));
  const month = Number(String(value).slice(5, 7));
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null;
  return { year, quarter: Math.floor((month - 1) / 3) };
}

function fillGaps(
  slices: QuarterSlice[],
  touch: (year: number, quarter: number) => QuarterSlice,
  map: Map<string, QuarterSlice>,
): QuarterSlice[] {
  if (slices.length === 0) return slices;
  const first = slices[0].key.split("-").map(Number);
  const last = slices[slices.length - 1].key.split("-").map(Number);
  let [year, quarter] = first;
  while (year < last[0] || (year === last[0] && quarter <= last[1])) {
    touch(year, quarter);
    quarter += 1;
    if (quarter > 3) {
      quarter = 0;
      year += 1;
    }
  }
  return [...map.values()].sort((left, right) => {
    const [ly, lq] = left.key.split("-").map(Number);
    const [ry, rq] = right.key.split("-").map(Number);
    return ly - ry || lq - rq;
  });
}
