import Image from "next/image";
import type { AnnualReport } from "@/lib/reports/normalize-report";

/**
 * Обложка годового отчёта: год огромными цифрами, внутри которых идёт видео.
 *
 * Цифры вырезаны из бумажного полотна маской, поэтому сквозь них видно кадр
 * приюта: год работает окном, а не подписью. Приём отложили сюда с общей
 * страницы, где он спорил с фотографиями подопечных.
 *
 * Без видео цифры остаются цифрами: маска показывает постер или янтарь.
 */
export function ReportOpening({
  report,
  faces = [],
  video,
  poster,
  period,
}: {
  report: AnnualReport;
  faces?: { src: string; name: string }[];
  video?: string;
  poster?: string;
  period?: string;
}) {
  const shots = report.coverImage
    ? [{ src: report.coverImage, name: `Работа фонда в ${report.year} году` }]
    : faces.slice(0, 3);
  const maskId = `year-cut-${report.year}`;

  return (
    <section className="reports-opening">
      <div className="reports-wrap">
        <figure className="reports-year-window" aria-label={`Отчёт за ${report.year} год`}>
          {video ? (
            <video autoPlay muted loop playsInline poster={poster} aria-hidden="true">
              <source src={video} type="video/mp4" />
            </video>
          ) : poster ? (
            <Image src={poster} alt="" fill sizes="100vw" priority style={{ objectFit: "cover" }} />
          ) : null}

          {/* Полотно цвета бумаги с вырезанными цифрами: всё, кроме года,
              закрашено, поэтому кадр виден только внутри цифр. */}
          <svg viewBox="0 0 1000 520" preserveAspectRatio="xMidYMid meet" role="presentation">
            <defs>
              <mask id={maskId}>
                <rect x="-4" y="-4" width="1008" height="528" fill="#fff" />
                <text x="500" y="400" textAnchor="middle" textLength="950" lengthAdjust="spacingAndGlyphs" fill="#000">
                  {report.year}
                </text>
              </mask>
            </defs>
            <rect x="-4" y="-4" width="1008" height="528" fill="var(--reports-window, var(--paper))" mask={`url(#${maskId})`} />
          </svg>
        </figure>

        <div className="reports-opening-inner">
          <div className="reports-opening-body">
            <h1>{report.title}</h1>
            <p className="reports-opening-lead">{report.summary}</p>
            {period ? <p className="reports-opening-period">{period}</p> : null}
          </div>

          {shots.length > 0 ? (
            <div className="reports-opening-faces" data-count={shots.length} aria-hidden="true">
              {shots.map((shot) => (
                <span key={shot.src}>
                  <Image src={shot.src} alt="" fill sizes="(max-width: 900px) 50vw, 25vw" />
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
