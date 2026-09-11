import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InnerHeader } from "@/components/layout/inner-header";
import { DocumentStack } from "@/components/reports/document-stack";
import { FinancialFlow } from "@/components/reports/financial-flow";
import { OutcomeList } from "@/components/reports/outcome-list";
import { ReportNeighbors } from "@/components/reports/report-neighbors";
import { ReportOpening } from "@/components/reports/report-opening";
import { DonationTill } from "@/components/reports/donation-till";
import { YearAges, YearBreakdown } from "@/components/reports/year-breakdown";
import { YearArrivals } from "@/components/reports/year-arrivals";
import { YearHealth, YearWalkHome } from "@/components/reports/year-scenes";
import { YearSpending } from "@/components/reports/year-spending";
import { YearHighlights } from "@/components/reports/year-highlights";
import { YearMoments } from "@/components/reports/year-moments";
import { buildYearReport } from "@/lib/reports/year-report";
import { newsService } from "@/lib/api/services/news";
import { petStatsService } from "@/lib/api/services/pet-stats";
import { reportsService } from "@/lib/api/services/reports";
import { siteMediaService, type SiteMedia } from "@/lib/api/services/site-media";
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
    title: `${report.title}. ${report.year}`,
    description: report.summary,
    alternates: { canonical: `/reports/${report.year}` },
  };
}

export default async function AnnualReportPage({ params }: PageProps<"/reports/[year]">) {
  const { year: yearParam } = await params;
  const year = parseYear(yearParam);
  if (year === undefined) notFound();

  // Лица подопечных этого года: обложка и первая плитка итогов. Если карточки
  // не пришли, страница живёт без фотографий, а не падает.
  const [report, years, censusPets, siteMedia, news] = await Promise.all([
    reportsService.getReportByYear(year),
    reportsService.getReportYears(),
    petStatsService.getCensusPets().catch(() => []),
    siteMediaService.getSiteMedia().catch((): SiteMedia => ({})),
    newsService.getNews({ limit: 100 }).then((response) => response.data).catch(() => []),
  ]);
  if (!report) notFound();

  const faces = censusPets
    .filter((pet) => pet.intakeYear === year && pet.cover)
    .map((pet) => ({ src: pet.cover!, name: pet.name }));

  // Все разрезы года считаются один раз, секции берут отсюда готовое.
  const data = buildYearReport(year, censusPets, news);

  const currentIndex = years.indexOf(year);
  const newerYear = currentIndex > 0 ? years[currentIndex - 1] : undefined;
  const olderYear = currentIndex >= 0 ? years[currentIndex + 1] : undefined;
  const firstYear = years.length > 0 ? years[years.length - 1] : undefined;

  return (
    <div className="reports-experience" data-page="year">
      <InnerHeader />
      <main id="main-content">
        <ReportOpening report={report} faces={faces} video={siteMedia.heroVideo} poster={siteMedia.heroPoster} />

        <YearHighlights data={data} finance={report.financialSummary} />

        <YearMoments news={data.news} archive={news} year={report.year} />

        <YearArrivals data={data} />

        <YearWalkHome data={data} />

        <YearHealth data={data} />

        <YearBreakdown data={data} />

        <YearAges data={data} />

        <OutcomeList
          outcomes={report.outcomes}
          customMetrics={report.customMetrics}
          heading={
            <>
              Что произошло <span className="reports-mark">за {report.year} год</span>
            </>
          }
          face={faces[0]}
          note="Цифры взяты из карточек подопечных: даты поступления и пристройства. Ноль здесь настоящий, а не «нет данных»: без данных ячейка осталась бы пустой."
        />

        <DonationTill year={report.year} finance={report.financialSummary} />

        <YearSpending year={report.year} finance={report.financialSummary} />

        {report.financialSummary ? (
          <FinancialFlow
            financialSummary={report.financialSummary}
            heading={
              <>
                Движение средств <span className="reports-mark">за {report.year} год</span>
              </>
            }
            note={report.financialSummary.note}
          />
        ) : null}

        <DocumentStack documents={report.documents} heading={
            <>
              Исходные документы <span className="reports-mark">за {report.year} год</span>
            </>
          } stamped />

        <ReportNeighbors olderYear={olderYear} newerYear={newerYear} firstYear={firstYear} />
      </main>
    </div>
  );
}
