import type { Moment } from "./moments";
import { alive } from "../media/alive";

/** Оставляет кадры, которые хранилище подтвердило. Если подтверждённых
 *  меньше порога, отдаёт всё как есть: хранилище могло лечь целиком,
 *  и это лучше пустоты. */
export async function verified(candidates: Moment[], min = 6): Promise<Moment[]> {
  const checks = await Promise.all(candidates.map((moment) => alive(moment.src)));
  const live = candidates.filter((_, index) => checks[index]);
  return live.length >= min ? live : candidates;
}
