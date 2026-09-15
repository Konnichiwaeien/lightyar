/**
 * Адрес сайта.
 *
 * Лежит в одном месте, потому что расходился: в `metadataBase` стоял
 * lightyar.shdk.tech, а в хлебных крошках и картинке для соцсетей на странице
 * сбора был svetly.org. Поисковик по таким крошкам уходит на чужой домен, а
 * картинка для превью не отдаётся вовсе.
 */
export const SITE_URL = "https://lightyar.shdk.tech";

/** Полный адрес страницы: для канонических ссылок и разметки. */
export const siteUrl = (path: string) => new URL(path, SITE_URL).toString();
