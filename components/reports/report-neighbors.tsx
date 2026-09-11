import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * Переход к соседним годам. Отсутствующий сосед не превращается в мёртвую
 * ссылку: он объясняет словами, почему его нет.
 */
export function ReportNeighbors({
  olderYear,
  newerYear,
  firstYear,
}: {
  olderYear?: number;
  newerYear?: number;
  firstYear?: number;
}) {
  return (
    <nav className="reports-neighbors" aria-label="Другие годы">
      <div className="reports-wrap reports-neighbor-grid">
        {olderYear ? (
          <Link className="reports-neighbor" href={`/reports/${olderYear}`}>
            <span>Предыдущий год</span>
            <b className="reports-num">{olderYear}</b>
            <p>
              Открыть отчёт
              <ArrowUpRight className="reports-pic" aria-hidden="true" />
            </p>
          </Link>
        ) : (
          <div className="reports-neighbor reports-neighbor--empty">
            <span>Предыдущий год</span>
            <b>нет</b>
            <p>{firstYear ? `${firstYear} год стал первым в работе фонда` : "Более ранних отчётов нет"}</p>
          </div>
        )}

        {newerYear ? (
          <Link className="reports-neighbor reports-neighbor--right" href={`/reports/${newerYear}`}>
            <span>Следующий год</span>
            <b className="reports-num">{newerYear}</b>
            <p>
              Открыть отчёт
              <ArrowUpRight className="reports-pic" aria-hidden="true" />
            </p>
          </Link>
        ) : (
          <div className="reports-neighbor reports-neighbor--right reports-neighbor--empty">
            <span>Следующий год</span>
            <b>скоро</b>
            <p>Отчёт появится после того, как мы закроем финансовый год</p>
          </div>
        )}
      </div>
    </nav>
  );
}
