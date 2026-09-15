/**
 * Адрес сайта.
 *
 * Берётся из окружения, потому что он разный: на рабочей машине один, на
 * боевой площадке другой. Ключ с префиксом `NEXT_PUBLIC_`, иначе значение не
 * доедет до клиентских компонентов, а адрес нужен и там, и в серверной
 * разметке для поисковика.
 *
 * Запасное значение оставлено нарочно: без него сборка на площадке, где ключ
 * забыли прописать, молча даёт относительные ссылки в разметке `ItemList` и
 * в хлебных крошках, а это хуже неверного домена. Ключ проверяется на вид
 * адреса: строка «lightyar.shdk.tech» без протокола роняет `new URL`.
 *
 * До этого адрес лежал в двух местах и расходился: `metadataBase` указывал на
 * одну площадку, а хлебные крошки страницы сбора на другую, и поисковик по
 * крошкам уходил на чужой домен.
 */

const FALLBACK = "https://lightyar.shdk.tech";

function readSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return FALLBACK;
    return url.origin;
  } catch {
    return FALLBACK;
  }
}

export const SITE_URL = readSiteUrl();

/** Полный адрес страницы: для канонических ссылок и разметки. */
export const siteUrl = (path: string) => new URL(path, SITE_URL).toString();
