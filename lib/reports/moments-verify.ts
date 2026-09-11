import type { Moment } from "./moments";

/**
 * Часть файлов в хранилище пропала, а записи на них ещё ссылаются:
 * в мозаике такой кадр стоял бы серым квадратом. Спрашиваем хранилище
 * заголовком, без тела, и держим ответ час.
 */
async function alive(src: string): Promise<boolean> {
  try {
    const response = await fetch(src, { method: "HEAD", signal: AbortSignal.timeout(2500), next: { revalidate: 3600 } });
    return response.ok;
  } catch {
    return false;
  }
}

/** Оставляет кадры, которые хранилище подтвердило. Если подтверждённых
 *  меньше порога, отдаёт всё как есть: хранилище могло лечь целиком,
 *  и это лучше пустоты. */
export async function verified(candidates: Moment[], min = 6): Promise<Moment[]> {
  const checks = await Promise.all(candidates.map((moment) => alive(moment.src)));
  const live = candidates.filter((_, index) => checks[index]);
  return live.length >= min ? live : candidates;
}
