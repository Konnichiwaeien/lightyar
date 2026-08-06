import Image from "next/image";
import { Banknote, Wallet, FileText, ShieldCheck } from "lucide-react";
import type { AnnualReport } from "@/lib/reports/normalize-report";
import { formatQualifiedValue } from "@/lib/reports/report-domain";

const money = (value: number) =>
  `${new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} ₽`;

/**
 * Архив годовых отчётов. Семантически это упорядоченный список, а не таблица:
 * каждый год — самостоятельная запись со своей обложкой и цифрами.
 */
export function ReportArchive({
  reports,
  pendingYears = [],
}: {
  reports: AnnualReport[];
  pendingYears?: number[];
}) {
  return (
    <section className="reports-archive" id="arhiv">
      <div className="reports-wrap">
        <h2>Годовой отчёт на каждый год работы</h2>
        <ol aria-label="Архив годовых отчётов">
          {reports.map((report) => {
            const rescued = report.outcomes.find((outcome) => outcome.kind === "rescued");
            const finance = report.financialSummary;
            return (
              <li key={report.documentId}>
                <article className="reports-year">
                  <div>
                    <p className="reports-year-no reports-num">{report.year}</p>
                    <h3>{report.title}</h3>
                    <p className="reports-year-desc">{report.summary}</p>

                    <dl className="reports-year-facts">
                      {finance?.income !== undefined ? (
                        <div>
                          <Banknote className="reports-pic" aria-hidden="true" />
                          <dt>Поступило от граждан</dt>
                          <dd>
                            <b>{money(finance.income)}</b>
                          </dd>
                        </div>
                      ) : null}
                      {finance?.closingBalance !== undefined ? (
                        <div>
                          <Wallet className="reports-pic" aria-hidden="true" />
                          <dt>Остаток на счёте</dt>
                          <dd>
                            <b>{money(finance.closingBalance)}</b>
                          </dd>
                        </div>
                      ) : null}
                      {rescued ? (
                        <div>
                          <ShieldCheck className="reports-pic" aria-hidden="true" />
                          <dt>Поступили под опеку</dt>
                          <dd>
                            <b>{formatQualifiedValue(rescued.value, rescued.qualifier)}</b>
                          </dd>
                        </div>
                      ) : null}
                      {report.documents.length > 0 ? (
                        <div>
                          <FileText className="reports-pic" aria-hidden="true" />
                          <dt>Приложенных документов</dt>
                          <dd>
                            <b>{report.documents.length}</b>
                          </dd>
                        </div>
                      ) : null}
                    </dl>

                    <a className="reports-year-cta" href={`/reports/${report.year}`}>
                      Открыть отчёт за {report.year} →
                    </a>
                  </div>
                  <figure>
                    {report.coverImage ? (
                      <Image
                        src={report.coverImage}
                        alt={`Обложка отчёта за ${report.year} год`}
                        width={900}
                        height={620}
                        sizes="(max-width: 900px) 100vw, 50vw"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : null}
                  </figure>
                </article>
              </li>
            );
          })}

          {pendingYears.map((year) => (
            <li key={year}>
              <article className="reports-year reports-year--pending">
                <div>
                  <p className="reports-year-no reports-num">{year}</p>
                  <h3>Отчёт готовится</h3>
                  <p className="reports-year-desc">
                    Сводка появится после закрытия финансового года и сверки документов.
                  </p>
                  <span className="reports-year-cta">Появится позже</span>
                </div>
                <figure />
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
