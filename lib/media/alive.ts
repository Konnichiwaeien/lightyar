/**
 * Проверка, что файл в хранилище на месте.
 *
 * Записи в CMS переживают свои файлы: обложка сбора или кадр новости
 * ссылаются на объект, которого в бакете уже нет. На странице это серый
 * прямоугольник, который читается как поломка сайта.
 *
 * Спрашиваем хранилище заголовком, без тела, и держим ответ час: адреса
 * стабильные, а лишний запрос на каждый показ страницы дорог.
 */
export async function alive(src: string): Promise<boolean> {
  if (!src || src.startsWith("/")) return true;
  try {
    const response = await fetch(src, { method: "HEAD", signal: AbortSignal.timeout(2500), next: { revalidate: 3600 } });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Первый живой адрес из списка.
 *
 * По умолчанию, если хранилище молчит целиком, отдаёт первый непустой:
 * для галереи возможная заглушка лучше пустоты. Со строгим режимом не
 * отдаёт ничего, и тогда вызывающий рисует своё: плитку цветом вместо
 * битой картинки.
 */
export async function firstAlive(
  candidates: (string | undefined)[],
  { strict = false } = {},
): Promise<string | undefined> {
  const list = candidates.filter((item): item is string => Boolean(item));
  if (list.length === 0) return undefined;

  const checks = await Promise.all(list.map(alive));
  const found = list.find((_, index) => checks[index]);
  return found ?? (strict ? undefined : list[0]);
}
