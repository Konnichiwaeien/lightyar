import Image from "next/image";
import Link from "next/link";
import type { StrapiNews } from "@/lib/api/types";
import { newsService } from "@/lib/api/services/news";
import { pickYearMoments } from "@/lib/reports/moments";
import { verified } from "@/lib/reports/moments-verify";

/* Двадцать кадров: два крупных, два широких, два высоких, остальные по
   одной клетке. На шести колонках это ровно пять рядов; на четырёх и двух
   высокие становятся обычными, и сетка снова закрывается без дыр. */
const COUNT = 20;
/** Меньше восьми кадров стеной не смотрятся: тогда берём весь архив. */
const MIN = 8;
const SPANS: (string | undefined)[] = [
  "big", undefined, undefined, "tall", undefined, undefined, "wide", undefined, undefined,
  "big", undefined, undefined, "tall", undefined, "wide", undefined, undefined, undefined, undefined, undefined,
];

const when = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });

/**
 * Стена кадров года: жизнь приюта, какой её снимают волонтёры.
 *
 * Берём новости этого года. Если их кадров на стену не хватает, стена
 * собирается из всего архива, и лид честно говорит об этом: у каждого
 * кадра стоит своя дата, а ссылка ведёт на заметку.
 */
export async function YearMoments({ news, archive, year }: { news: StrapiNews[]; archive: StrapiNews[]; year: number }) {
  const resolve = (url: string) => newsService.resolveMediaUrl(url);
  const own = await verified(pickYearMoments(news, COUNT + 8, resolve), MIN);
  const ownYear = own.length >= MIN;
  const shots = (ownYear ? own : await verified(pickYearMoments(archive, COUNT + 8, resolve), MIN)).slice(0, COUNT);
  if (shots.length < MIN) return null;

  return (
    <section className="reports-year-moments" aria-labelledby="year-moments-title">
      <div className="reports-wrap">
        <h2 id="year-moments-title">
          {ownYear ? year + " год " : "Приют "}
          <span className="reports-mark">в кадрах</span>
        </h2>
        <p className="reports-year-lead">
          {ownYear ? (
            <>
              Кадры из новостей приюта за <strong>{year} год</strong>. Нажмите на любой, откроется заметка.
            </>
          ) : (
            <>
              За {year} год в новостях {own.length === 0 ? "кадров нет" : "кадров мало"}, так что здесь{" "}
              <strong>вся жизнь приюта</strong>, как её снимают волонтёры. Под каждым кадром своя дата. Нажмите на любой,
              откроется заметка.
            </>
          )}
        </p>
      </div>

      <ul className="reports-year-moments-grid">
        {shots.map((shot, index) => (
          <li key={shot.src} data-span={SPANS[index]} style={{ "--i": index } as React.CSSProperties}>
            <Link href={shot.href} className="reports-moment" aria-label={shot.title + ", " + when.format(new Date(shot.date))}>
              <Image
                src={shot.src}
                alt=""
                width={shot.width}
                height={shot.height}
                sizes="(max-width: 700px) 50vw, (max-width: 1100px) 25vw, 17vw"
              />
              <span className="reports-moment-caption">
                <b>{shot.title}</b>
                <small>{when.format(new Date(shot.date))}</small>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
