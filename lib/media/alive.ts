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
 * Первый живой адрес из списка. Если хранилище молчит целиком, отдаёт
 * первый непустой: пустая страница хуже возможной серой заглушки.
 */
export async function firstAlive(candidates: (string | undefined)[]): Promise<string | undefined> {
  const list = candidates.filter((item): item is string => Boolean(item));
  if (list.length === 0) return undefined;

  const checks = await Promise.all(list.map(alive));
  return list.find((_, index) => checks[index]) ?? list[0];
}
