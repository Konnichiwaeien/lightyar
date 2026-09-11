import type { StrapiMedia, StrapiNews } from "../api/types";

export interface Moment {
  src: string;
  width: number;
  height: number;
  /** Заголовок новости, из которой кадр */
  title: string;
  /** Ссылка на заметку */
  href: string;
  /** Дата публикации новости, ISO */
  date: string;
  /** Форма кадра задаёт место в мозаике: широкий на две колонки, высокий на два ряда */
  shape: "wide" | "tall" | "square";
}

/**
 * Случайные кадры из новостей приюта.
 *
 * Не портреты подопечных, а жизнь приюта: то, что волонтёры сами сняли
 * и выложили. Берём обложки новостей, их выбирали руками; в галереях
 * попадаются скриншоты заказов и кадры из видео с чёрными полями.
 * Случайность честная, без сида: набор меняется при каждой пересборке.
 */
export function pickMoments(
  news: StrapiNews[],
  count: number,
  resolve: (url: string) => string,
  random: () => number = Math.random,
): Moment[] {
  const pool = news
    .map((item) => ({ item, photos: framesOf([item.mainImage]) }))
    .filter((entry) => entry.photos.length > 0);
  shuffle(pool, random);

  const basket = new Basket(count, resolve);
  for (const entry of pool) basket.take(entry.item, entry.photos[0]);
  return basket.picked;
}

/**
 * Кадры для большой стены года: обложки и снимки из галерей новостей.
 *
 * Сначала по обложке от каждой новости, потом по кругу из галерей, чтобы
 * одна многолюдная заметка не заняла всю стену. Скриншоты чеков и вытянутые
 * кадры отсеиваются по пропорциям, как и в маленькой мозаике.
 */
export function pickYearMoments(
  news: StrapiNews[],
  count: number,
  resolve: (url: string) => string,
  random: () => number = Math.random,
): Moment[] {
  const pool = news
    .map((item) => ({ item, photos: framesOf([item.mainImage, ...(item.gallery ?? [])]) }))
    .filter((entry) => entry.photos.length > 0);
  shuffle(pool, random);

  const basket = new Basket(count, resolve);
  for (let round = 0; !basket.full; round++) {
    let any = false;
    for (const entry of pool) {
      const photo = entry.photos[round];
      if (!photo) continue;
      any = true;
      basket.take(entry.item, photo);
      if (basket.full) break;
    }
    if (!any) break;
  }
  return basket.picked;
}

interface Frame {
  url: string;
  width: number;
  height: number;
}

/** Корзина кадров: один и тот же файл не попадает дважды. */
class Basket {
  readonly picked: Moment[] = [];
  private readonly seen = new Set<string>();

  constructor(
    private readonly count: number,
    private readonly resolve: (url: string) => string,
  ) {}

  get full(): boolean {
    return this.picked.length >= this.count;
  }

  take(item: StrapiNews, photo: Frame) {
    if (this.full || this.seen.has(photo.url)) return;
    this.seen.add(photo.url);
    const ratio = photo.width / photo.height;
    this.picked.push({
      src: this.resolve(photo.url),
      width: photo.width,
      height: photo.height,
      title: item.title,
      href: `/news/${item.slug}`,
      date: item.publishedAt,
      shape: ratio > 1.25 ? "wide" : ratio < 0.8 ? "tall" : "square",
    });
  }
}

/** Кадры в среднем размере, только с известными пропорциями. */
function framesOf(media: (StrapiMedia | undefined)[]): Frame[] {
  return media.flatMap((entry) => {
    if (!entry) return [];
    const format = entry.formats?.large ?? entry.formats?.medium;
    const url = format?.url ?? entry.url;
    const width = format?.width ?? entry.width;
    const height = format?.height ?? entry.height;
    return url && width && height && looksLikePhoto(width, height) ? [{ url, width, height }] : [];
  });
}

/** Скриншоты чеков вытянуты как экран телефона, у фотографий пропорции короче. */
export function looksLikePhoto(width: number, height: number): boolean {
  const ratio = width / height;
  return ratio >= 0.6 && ratio <= 2;
}

function shuffle<T>(list: T[], random: () => number): T[] {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}
