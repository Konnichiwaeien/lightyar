export type Qualifier = "exact" | "atLeast" | "approximately";

export function parseOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function formatQualifiedValue(value: number, qualifier: Qualifier): string {
  const formatted = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(value);
  if (qualifier === "atLeast") return `${formatted}+`;
  if (qualifier === "approximately") return `≈${formatted}`;
  return formatted;
}

export function sortByOrder<T extends { order?: number | null }>(items: readonly T[]): T[] {
  return [...items].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
}

export function sortReportsNewestFirst<T extends { year: number }>(items: readonly T[]): T[] {
  return [...items].sort((left, right) => right.year - left.year);
}
