import { cache } from "react";

import { campaignsService } from "@/lib/api/services/campaigns";
import type { StrapiCampaign } from "@/lib/api/types";
import { alive } from "@/lib/media/alive";

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
 * Кадры сбора: свои снимки, а за ними портреты подопечного, ради которого
 * сбор открыт.
 *
 * Каждый адрес проверяется на месте ли файл. Записи в CMS переживают свои
 * файлы, и на странице это была надпись «фото временно недоступно» в круге —
 * то есть поломка на самом видном месте. Мёртвые адреса просто выпадают, а
 * если не осталось ни одного, страница обходится без круга: композиция без
 * него собирается сама, а заглушка читалась бы сбоем.
 *
 * Обёрнута в `cache`: кадры нужны и разметке для соцсетей, и самой странице,
 * а проверка ходит в хранилище.
 */
export const fundPhotos = cache(async (fund: StrapiCampaign): Promise<string[]> => {
  const own = (fund.images ?? []).map((image) => campaignsService.resolveMediaUrl(image.url));
  const pet = (fund.pet?.photos ?? []).map((photo) => campaignsService.resolveMediaUrl(photo.url));
  const candidates = [...own, ...pet].slice(0, 6);
  const checks = await Promise.all(candidates.map(alive));
  return candidates.filter((_, index) => checks[index]).slice(0, 5);
});

/** Дата по-русски: «14 сентября 2026». Без «г.»: в строке из трёх слов эта
    приписка ничего не уточняет, а в капители читается сокращением подписи. */
const DATE = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });
export const fundDate = (value: string | null | undefined) =>
  value ? DATE.format(new Date(value)).replace(/\s*г\.$/, "") : "";
