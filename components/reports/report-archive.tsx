import Image from "next/image";
import { ArrowUpRight, FileText, HandCoins, PawPrint, Wallet } from "lucide-react";
import type { AnnualReport } from "@/lib/reports/normalize-report";
import { formatQualifiedValue } from "@/lib/reports/report-domain";

const money = (value: number) =>
  `${new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} ₽`;

/** Последнее слово заголовка под янтарной отметкой, как в заголовках разделов. */
function Marked({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return <>{text}</>;
  const last = words.pop();
  return (
    <>
      {words.join(" ")} <span className="reports-mark">{last}</span>
    </>
  );
}

/**
 * Архив годовых отчётов. Семантически это упорядоченный список, а не таблица:
 * каждый год это самостоятельная запись со своей обложкой и цифрами.
 * Опубликованные и будущие годы идут одной хронологией: раньше готовые
 * шли первыми, и за 2024 следовал 2026, а потом 2025.
 * Без рамок: у цифр значки в янтарных кружках, кнопка залита янтарём,
 * карточки будущих лет лежат на тёплой подложке без пунктира.
 */
export function ReportArchive({
  reports,
  pendingYears = [],
}: {
  reports: AnnualReport[];
  pendingYears?: number[];
}) {
  // Год у карточки «готовится» читается по-разному: текущий ещё не закрыт,
  // прошедший ждёт сверки. Раньше обе карточки говорили одно и то же.
  const currentYear = new Date().getFullYear();

  const cards = [
    ...reports.map((report) => ({ year: report.year, report })),
    ...pendingYears.filter((year) => !reports.some((report) => report.year === year)).map((year) => ({ year, report: undefined })),
  ].sort((left, right) => left.year - right.year);

  return (
    <section className="reports-archive" id="arhiv">
      <div className="reports-wrap">
        <h2>Каждому году свой <span className="reports-mark">отчёт</span></h2>
        <ol aria-label="Архив годовых отчётов">
          {cards.map(({ year, report }) => {
            if (!report) {
              return (
                <li key={year}>
                  <article className="reports-year reports-year--pending reports-year--flat">
                    <div>
                      <p className="reports-year-no reports-num">{year}</p>
                      <h3>
                        <Marked text={`Отчёт за ${year} год готовится`} />
                      </h3>
                      <p className="reports-year-desc">
                        {year >= currentYear
                          ? "Год ещё идёт. Отчёт появится, когда мы закроем год и сверим документы."
                          : "Собираем данные. Сверим документы, сдадим отчёт в Минюст, тогда и покажем."}
                      </p>
                      <span className="reports-year-cta reports-year-cta--soon">Появится позже</span>
                    </div>
                  </article>
                </li>
              );
            }

            const rescued = report.outcomes.find((outcome) => outcome.kind === "rescued");
            const finance = report.financialSummary;
            return (
              <li key={report.documentId}>
                <article className={`reports-year${report.coverImage ? "" : " reports-year--flat"}`}>
                  <div>
                    <p className="reports-year-no reports-num">{report.year}</p>
                    <h3>
                      <Marked text={report.title} />
                    </h3>
                    <p className="reports-year-desc">{report.summary}</p>

                    <ul className="reports-year-facts">
                      {finance?.income !== undefined ? (
                        <li>
                          <i className="reports-year-ico" aria-hidden="true">
                            <HandCoins className="reports-pic" />
                          </i>
                          <b className="reports-num">{money(finance.income)}</b>
                          <span>поступило от граждан</span>
                        </li>
                      ) : null}
                      {finance?.closingBalance !== undefined ? (
                        <li>
                          <i className="reports-year-ico" aria-hidden="true">
                            <Wallet className="reports-pic" />
                          </i>
                          <b className="reports-num">{money(finance.closingBalance)}</b>
                          <span>остаток на счёте</span>
                        </li>
                      ) : null}
                      {rescued ? (
                        <li>
                          <i className="reports-year-ico" aria-hidden="true">
                            <PawPrint className="reports-pic" />
                          </i>
                          <b className="reports-num">{formatQualifiedValue(rescued.value, rescued.qualifier)}</b>
                          <span>под опекой</span>
                        </li>
                      ) : null}
                      {report.documents.length > 0 ? (
                        <li>
                          <i className="reports-year-ico" aria-hidden="true">
                            <FileText className="reports-pic" />
                          </i>
                          <b className="reports-num">{report.documents.length}</b>
                          <span>{report.documents.length === 1 ? "документ" : "документа"}</span>
                        </li>
                      ) : null}
                    </ul>

                    <a className="reports-year-cta" href={`/reports/${report.year}`}>
                      Открыть отчёт
                      <span className="reports-year-cta-ico" aria-hidden="true">
                        <ArrowUpRight className="reports-pic" />
                      </span>
                    </a>
                  </div>
                  {/* Без обложки колонка под изображение не создаётся: пустая
                      рамка читалась как незагрузившаяся картинка. */}
                  {report.coverImage ? (
                    <figure>
                      <Image
                        src={report.coverImage}
                        alt={`Обложка отчёта за ${report.year} год`}
                        width={900}
                        height={620}
                        sizes="(max-width: 900px) 100vw, 50vw"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </figure>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
