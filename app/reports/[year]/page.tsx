import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InnerHeader } from "@/components/layout/inner-header";
import { DocumentStack } from "@/components/reports/document-stack";
import { FinancialFlow } from "@/components/reports/financial-flow";
import { OutcomeList } from "@/components/reports/outcome-list";
import { ReportNeighbors } from "@/components/reports/report-neighbors";
import { ReportOpening } from "@/components/reports/report-opening";
import { ReportReveal } from "@/components/reports/report-reveal";
import { reportsService } from "@/lib/api/services/reports";
import "@/components/reports/reports.css";

function parseYear(value: string): number | undefined {
  if (!/^\d{4}$/.test(value)) return undefined;
  const year = Number(value);
  return year >= 2000 && year <= 2100 ? year : undefined;
}

export async function generateMetadata({ params }: PageProps<"/reports/[year]">): Promise<Metadata> {
  const { year: yearParam } = await params;
  const year = parseYear(yearParam);
  if (year === undefined) notFound();
  const report = await reportsService.getReportByYear(year);
  if (!report) notFound();
  return {
    title: `${report.title} — ${report.year}`,
    description: report.summary,
    alternates: { canonical: `/reports/${report.year}` },
  };
}

export default async function AnnualReportPage({ params }: PageProps<"/reports/[year]">) {
  const { year: yearParam } = await params;
  const year = parseYear(yearParam);
  if (year === undefined) notFound();

  const [report, years] = await Promise.all([
    reportsService.getReportByYear(year),
    reportsService.getReportYears(),
  ]);
  if (!report) notFound();

  const currentIndex = years.indexOf(year);
  const newerYear = currentIndex > 0 ? years[currentIndex - 1] : undefined;
  const olderYear = currentIndex >= 0 ? years[currentIndex + 1] : undefined;
  const firstYear = years.length > 0 ? years[years.length - 1] : undefined;
  const paragraphs = report.body?.split(/\n\s*\n/).filter(Boolean) || [];

  return (
    <div className="reports-experience">
      <InnerHeader />
      <main id="main-content">
        <ReportOpening report={report} />

        {paragraphs.length > 0 ? (
          <section className="reports-letter" aria-labelledby="story-title">
            <div className="reports-wrap reports-letter-grid">
              <ReportReveal>
                <div>
                  <h2 id="story-title" className="sr-only">
                    Что стоит за документами
                  </h2>
                  <blockquote>{paragraphs[0]}</blockquote>
                  {paragraphs.slice(1).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  <div className="reports-signature">
                    <b>Морозова Марина Владимировна</b>
                    <span>директор АНБО «Светлый»</span>
                  </div>
                </div>
              </ReportReveal>
            </div>
          </section>
        ) : null}

        <OutcomeList
          outcomes={report.outcomes}
          customMetrics={report.customMetrics}
          heading={`Что произошло за ${report.year} год`}
          note="Показатели считаются по датам поступления и пристройства в карточках подопечных. Пустая ячейка означала бы «нет данных» — ноль здесь подтверждённый."
        />

        {report.financialSummary ? (
          <FinancialFlow
            financialSummary={report.financialSummary}
            heading={`Движение средств за ${report.year} год`}
            note={report.financialSummary.note}
          />
        ) : null}

        <DocumentStack documents={report.documents} heading={`Исходные документы за ${report.year} год`} />

        <ReportNeighbors olderYear={olderYear} newerYear={newerYear} firstYear={firstYear} />
      </main>
    </div>
  );
}
