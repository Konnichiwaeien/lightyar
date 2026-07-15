import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DarkInnerHeader } from "@/components/layout/dark-inner-header";
import { DocumentStack } from "@/components/reports/document-stack";
import { FinancialFlow } from "@/components/reports/financial-flow";
import { OutcomeList } from "@/components/reports/outcome-list";
import { ReportBeam } from "@/components/reports/report-beam";
import { ReportCover } from "@/components/reports/report-cover";
import { ReportNeighbors } from "@/components/reports/report-neighbors";
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
  const paragraphs = report.body?.split(/\n\s*\n/).filter(Boolean) || [];

  return (
    <div className="reports-experience report-detail selection:bg-amber-400 selection:text-[#0a0a0a]">
      <DarkInnerHeader />
      <ReportBeam />
      <main id="main-content">
        <ReportCover report={report} />
        <div className="report-detail__paper">
          {report.financialSummary && <FinancialFlow financialSummary={report.financialSummary} />}
          <OutcomeList outcomes={report.outcomes} customMetrics={report.customMetrics} />
          {paragraphs.length > 0 && (
            <section className="report-story" aria-labelledby="story-title">
              <p className="reports-kicker">Контекст года</p>
              <h2 id="story-title">Что стоит за документами</h2>
              <div>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
            </section>
          )}
          <DocumentStack documents={report.documents} year={report.year} />
          <ReportNeighbors newerYear={newerYear} olderYear={olderYear} />
        </div>
      </main>
    </div>
  );
}
