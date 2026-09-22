import { cache } from "react";

import { campaignsService } from "@/lib/api/services/campaigns";
import type { StrapiCampaign } from "@/lib/api/types";
import { campaignFallbackCover } from "./fallback-cover";

/**
 * Загрузка одного сбора для его страницы.
 *
 * Обёрнута в `cache`, потому что сбор нужен дважды за один проход: сначала
 * `generateMetadata` собирает заголовок и картинку для соцсетей, потом сама
 * страница рисует содержимое. Без обёртки это два обхода CMS подряд, причём
 * второй начинается только после первого.
 */
export const loadFund = cache((idOrSlug: string) => campaignsService.getCampaignByIdOrSlug(idOrSlug));

/**
 * Кадр выпадает только по приговору хранилища.
 *
 * Запись в CMS переживает свой файл, и тогда в круге появляется надпись «фото
 * временно недоступно» — поломка на самом видном месте страницы. Поэтому
 * адреса проверяются заголовочным запросом.
 *
 * Но «хранилище промолчало» это не то же самое, что «файла нет»: на холодном
 * старте проверка упиралась в свои две с половиной секунды, и страница
 * выходила вообще без кадра, хотя все файлы были на месте. Считается мёртвым
 * только явный отказ: нет, удалено, не отдам. Таймаут и сетевая ошибка
 * оставляют кадр, а если он и правда мёртв, его подменит запасной вид
 * картинки — это заметно хуже, чем пустой круг, но случается только когда
 * файла нет и хранилище об этом молчит.
 */
async function keepable(src: string): Promise<boolean> {
  if (!src || src.startsWith("/")) return true;
  try {
    const answer = await fetch(src, {
      method: "HEAD",
      signal: AbortSignal.timeout(2500),
      next: { revalidate: 3600 },
    });
    return ![403, 404, 410].includes(answer.status);
  } catch {
    return true;
  }
}

/**
 * Кадры сбора: свои снимки, а за ними портреты подопечного, ради которого
 * сбор открыт. Если все фотографии пропали, используем локальную
 * тематическую иллюстрацию, а не фотографию чужого питомца.
 *
 * Обёрнута в `cache`: кадры нужны и разметке для соцсетей, и самой странице,
 * а проверка ходит в хранилище.
 */
export const fundPhotos = cache(async (fund: StrapiCampaign): Promise<string[]> => {
  const own = (fund.images ?? []).map((image) => campaignsService.resolveMediaUrl(image.url));
  const pet = (fund.pet?.photos ?? []).map((photo) => campaignsService.resolveMediaUrl(photo.url));
  const candidates = [...own, ...pet].slice(0, 6);
  const checks = await Promise.all(candidates.map(keepable));
  const available = candidates.filter((_, index) => checks[index]).slice(0, 5);
  return available.length ? available : [campaignFallbackCover(fund.title)];
});

/** Дата по-русски: «14 сентября 2026». Без «г.»: в строке из трёх слов эта
    приписка ничего не уточняет, а в капители читается сокращением подписи. */
const DATE = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });
export const fundDate = (value: string | null | undefined) =>
  value ? DATE.format(new Date(value)).replace(/\s*г\.$/, "") : "";
