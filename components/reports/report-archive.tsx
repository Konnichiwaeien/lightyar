import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { formatQualifiedValue } from "@/lib/reports/report-domain";
import type { AnnualReport } from "@/lib/reports/normalize-report";

const outcomeLabels: Record<string, string> = {
  dogsInCare: "собак на кураторстве",
  catsInCare: "кошек на кураторстве",
  rescued: "животных спасено",
  treated: "животных прошли лечение",
  adopted: "питомцев нашли дом",
  volunteers: "волонтёров в команде",
};

function formatMoney(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function reportFacts(report: AnnualReport): { label: string; value: string }[] {
  const facts: { label: string; value: string }[] = [];
  const finance = report.financialSummary;
  if (finance?.income !== undefined) facts.push({ label: "поступления", value: formatMoney(finance.income) });
  if (finance?.closingBalance !== undefined) facts.push({ label: "остаток", value: formatMoney(finance.closingBalance) });
  for (const outcome of report.outcomes.slice(0, 2)) {
    facts.push({
      label: outcomeLabels[outcome.kind] || outcome.kind,
      value: formatQualifiedValue(outcome.value, outcome.qualifier),
    });
  }
  return facts.slice(0, 3);
}

export function ReportArchive({ reports }: { reports: AnnualReport[] }) {
  return (
    <section id="report-archive" className="report-archive" aria-labelledby="archive-title">
      <div className="report-archive__intro">
        <div>
          <p className="reports-kicker">Архив по годам</p>
          <h2 id="archive-title">Проверяемое важнее впечатляющего</h2>
        </div>
        <p>
          Каждый год — отдельная открытая история. Показываем только заполненные показатели и прикладываем исходные документы.
        </p>
      </div>

      <div className="report-archive__layout">
        <nav className="report-year-nav" aria-label="Быстрый переход по годам">
          <span>Годы</span>
          <ul>
            {reports.map((report) => (
              <li key={report.documentId}>
                <a href={`#report-${report.year}`}>{report.year}</a>
              </li>
            ))}
          </ul>
        </nav>

        <ol className="report-year-list" aria-label="Архив годовых отчётов">
          {reports.map((report) => {
            const facts = reportFacts(report);
            return (
              <li key={report.documentId} id={`report-${report.year}`} className="report-year-item">
                <article className="report-year-card">
                  <div className="report-year-card__year">{report.year}</div>
                  <div className="report-year-card__content">
                    <p className="reports-kicker">Годовой отчёт</p>
                    <h3>{report.title}</h3>
                    <p className="report-year-card__summary">{report.summary}</p>

                    {facts.length > 0 && (
                      <dl className="report-year-card__facts">
                        {facts.map((fact) => (
                          <div key={fact.label}>
                            <dt>{fact.label}</dt>
                            <dd>{fact.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}

                    <div className="report-year-card__actions">
                      <span className="report-year-card__documents">
                        <FileText aria-hidden="true" size={17} />
                        {report.documents.length} {report.documents.length === 1 ? "документ" : "документа"}
                      </span>
                      <Link
                        href={`/reports/${report.year}`}
                        className="report-year-card__link focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500"
                      >
                        Открыть год <ArrowUpRight aria-hidden="true" size={18} />
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
