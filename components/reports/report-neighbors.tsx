import Link from "next/link";

/**
 * Переход к соседним годам. Отсутствующий сосед не превращается в мёртвую ссылку —
 * он честно объясняет, почему его нет.
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
      <div className="reports-neighbor-grid">
        {olderYear ? (
          <Link className="reports-neighbor" href={`/reports/${olderYear}`}>
            <span>Предыдущий год</span>
            <b className="reports-num">{olderYear}</b>
            <p>Отчёт за {olderYear} год</p>
          </Link>
        ) : (
          <div className="reports-neighbor reports-neighbor--empty">
            <span>Предыдущий год</span>
            <b>—</b>
            <p>{firstYear ? `${firstYear} — первый год работы фонда` : "Более ранних отчётов нет"}</p>
          </div>
        )}

        {newerYear ? (
          <Link className="reports-neighbor reports-neighbor--right" href={`/reports/${newerYear}`}>
            <span>Следующий год</span>
            <b className="reports-num">{newerYear}</b>
            <p>Отчёт за {newerYear} год</p>
          </Link>
        ) : (
          <div className="reports-neighbor reports-neighbor--right reports-neighbor--empty">
            <span>Следующий год</span>
            <b>—</b>
            <p>Отчёт готовится после закрытия финансового года</p>
          </div>
        )}
      </div>
    </nav>
  );
}
