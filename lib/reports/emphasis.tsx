import { Fragment, type ReactNode } from "react";

/**
 * Выделение цифр в тексте, который пришёл из CMS.
 *
 * Редактор пишет обычным предложением и не расставляет разметку. На странице
 * при этом всё держится на числах: даты, суммы, сроки. Поэтому число вместе
 * с единицей измерения или месяцем поднимается в чернильный полужирный, как
 * в подписях под заголовками разделов.
 *
 * Функция чистая и одинаково работает на сервере и в браузере: разметка
 * после гидратации не расходится.
 */

/**
 * Слово, которое читается вместе с числом и выделяется заодно с ним.
 * Длинные варианты стоят раньше коротких: иначе «года» обрывалось на «год».
 */
const UNIT =
  "годов|года|году|год|лет|месяцев|месяца|месяц|недель|недели|неделю|дней|день|дня|рублей|рубля|рубль|₽|%|января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря";

/**
 * Конец слова по-русски. Встроенная граница \b считает словом только латиницу
 * и цифры, поэтому на кириллице она не срабатывает вовсе и единица теряется.
 */
const WORD_END = String.raw`(?![а-яёa-z])`;

/** Число целиком: разряды через пробел, копейки через запятую, следом единица. */
const FIGURE = new RegExp(String.raw`\d[\d\s ]*(?:[.,]\d+)?(?:\s*(?:${UNIT})${WORD_END})?`, "gi");

export function withFigures(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(FIGURE)) {
    const start = match.index ?? 0;
    // Хвостовой пробел ушёл бы внутрь выделения и разъехался бы с соседним словом.
    const figure = match[0].replace(/\s+$/, "");
    if (figure.length === 0) continue;

    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(<strong key={`${start}-${figure}`}>{figure}</strong>);
    cursor = start + figure.length;
  }

  if (cursor === 0) return text;
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts.map((part, index) => <Fragment key={index}>{part}</Fragment>);
}

/**
 * Заголовок из CMS с янтарной пометкой на последних словах.
 *
 * Разделы страницы носят пометку вручную, а заголовок отчёта приходит строкой.
 * Берём два последних слова: на коротком заголовке пометка съела бы его
 * целиком, поэтому там её нет вовсе.
 */
export function markTail(title: string): ReactNode {
  const words = title.trim().split(/\s+/);
  if (words.length < 4) return title;

  const head = words.slice(0, -2).join(" ");
  const tail = words.slice(-2).join(" ");
  return (
    <>
      {head} <span className="reports-mark">{tail}</span>
    </>
  );
}
