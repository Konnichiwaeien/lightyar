import Image from "next/image";
import Link from "next/link";
import type { StrapiNews } from "@/lib/api/types";
import { newsService } from "@/lib/api/services/news";
import { pickMoments } from "@/lib/reports/moments";
import { verified } from "@/lib/reports/moments-verify";

/* Тринадцать: первая плитка на четыре клетки, остальные по одной, и на
   четырёх, трёх и двух колонках сетка закрывается без пустых клеток. */
const COUNT = 14;
/** Раскладка мозаики: клетки по индексу кадра, сумма кратна четырём. */
const SPANS: (string | undefined)[] = [
  "big", undefined, undefined, undefined, undefined,
  "wide", undefined, undefined,
  "tall", undefined, undefined, undefined,
  "wide", undefined,
];

const when = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });

/**
 * Моменты: мозаика случайных кадров из новостей приюта.
 *
 * Не портреты из карточек, а жизнь приюта, какой её снимают волонтёры.
 * Каждый кадр ведёт на свою заметку. Размеры разные: первый на четыре клетки,
 * два широких, один высокий, остальные по одной. Двадцать клеток закрывают
 * пять рядов на четырёх колонках и десять на двух, без дыр по кромке.
 */
export async function MomentsGallery({ news }: { news: StrapiNews[] }) {
  const shots = (await verified(pickMoments(news, COUNT + 6, (url) => newsService.resolveMediaUrl(url)))).slice(0, COUNT);
  if (shots.length < 6) return null;

  return (
    <section className="reports-moments" aria-labelledby="moments-title">
      <div className="reports-wrap">
        <h2 id="moments-title">
          Жизнь между <span className="reports-mark">отчётами</span>
        </h2>
        <p className="reports-moments-lead">Случайные кадры из новостей приюта. Нажмите на любой, откроется заметка.</p>

        <ul className="reports-moments-grid">
          {shots.map((shot, index) => (
            <li key={shot.src} data-span={SPANS[index]} style={{ "--i": index } as React.CSSProperties}>
              <Link href={shot.href} className="reports-moment" aria-label={`${shot.title}, ${when.format(new Date(shot.date))}`}>
                <Image
                  src={shot.src}
                  alt=""
                  width={shot.width}
                  height={shot.height}
                  sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw"
                />
                <span className="reports-moment-caption">
                  <b>{shot.title}</b>
                  <small>{when.format(new Date(shot.date))}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
