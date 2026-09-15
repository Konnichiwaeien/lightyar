import { petStatsService } from "@/lib/api/services/pet-stats";
import { firstAlive } from "@/lib/media/alive";

/**
 * Кадр для сбора.
 *
 * Своя обложка, а если её файл пропал из хранилища, портрет подопечного,
 * ради которого сбор открыт. Не нашлось и его, берём кадр из общей ленты
 * приюта: тёмный прямоугольник на витрине читается как поломка, а чужой
 * кадр честно подписан.
 */

export interface CampaignShot {
  src?: string;
  /** Кадр не про этот сбор: подпись на карточке скажет об этом читателю. */
  borrowed: boolean;
}

/**
 * Запас кадров приюта: берём один раз на отрисовку страницы, а не на карточку.
 *
 * Кандидаты проверяются пачкой, а не по одному. Раньше здесь стоял цикл с
 * ожиданием внутри: каждый следующий запрос к хранилищу ждал предыдущего, и на
 * четыре недостающих кадра уходило четыре round trip подряд. Берём с запасом
 * втрое, проверяем разом и оставляем первые живые в исходном порядке.
 */
async function shelterShots(limit: number): Promise<string[]> {
  if (limit <= 0) return [];
  try {
    const pets = await petStatsService.getCensusPets();
    const covers = pets.flatMap((pet) => (pet.cover ? [pet.cover] : [])).slice(0, limit * 3);
    if (covers.length === 0) return [];
    const checks = await Promise.all(covers.map((cover) => firstAlive([cover], { strict: true })));
    return checks.filter((src): src is string => Boolean(src)).slice(0, limit);
  } catch {
    return [];
  }
}

export async function resolveCovers<T extends { image?: string; petImage?: string }>(
  funds: T[],
): Promise<(T & { shot: CampaignShot })[]> {
  const own = await Promise.all(
    funds.map(async (fund) => {
      // Заглушка из public не в счёт: это не файл хранилища, а серый кадр.
      const candidates = [fund.image, fund.petImage].filter(
        (src): src is string => typeof src === "string" && src.length > 0 && !src.startsWith("/"),
      );
      return firstAlive(candidates, { strict: true });
    }),
  );

  const missing = own.filter((src) => !src).length;
  const spare = await shelterShots(missing);
  let taken = 0;

  return funds.map((fund, index) => {
    const src = own[index];
    if (src) return { ...fund, shot: { src, borrowed: false } };
    const borrowed = spare[taken++];
    return { ...fund, shot: { src: borrowed, borrowed: Boolean(borrowed) } };
  });
}
