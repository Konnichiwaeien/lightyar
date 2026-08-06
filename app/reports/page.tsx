import type { Metadata } from "next";
import { HandCoins, Wallet, Users } from "lucide-react";
import { InnerHeader } from "@/components/layout/inner-header";
import { DocumentStack } from "@/components/reports/document-stack";
import { FinancialFlow } from "@/components/reports/financial-flow";
import { IntakeTreemap } from "@/components/reports/intake-treemap";
import { PetCensus } from "@/components/reports/pet-census";
import { ReportArchive } from "@/components/reports/report-archive";
import { ReportCharts } from "@/components/reports/report-charts";
import { ReportEmptyState } from "@/components/reports/report-empty-state";
import { ReportReveal } from "@/components/reports/report-reveal";
import { ReportsHero } from "@/components/reports/reports-hero";
import { petStatsService } from "@/lib/api/services/pet-stats";
import { reportsService } from "@/lib/api/services/reports";
import { siteMediaService } from "@/lib/api/services/site-media";
import type { FinancialSummary } from "@/lib/reports/normalize-report";
import "@/components/reports/reports.css";

export const metadata: Metadata = {
  title: "Отчётность | АНБО «Светлый»",
  description:
    "Итоги работы АНБО «Светлый» с октября 2024 года: подопечные, движение средств и годовые отчёты с исходными документами.",
  alternates: { canonical: "/reports" },
};

/** Суммирует финансы всех опубликованных лет в один итог «за всё время» */
function totalFinance(summaries: (FinancialSummary | undefined)[]): FinancialSummary | undefined {
  const present = summaries.filter((summary): summary is FinancialSummary => Boolean(summary));
  if (present.length === 0) return undefined;

  const sum = (pick: (summary: FinancialSummary) => number | undefined) => {
    const values = present.map(pick).filter((value): value is number => value !== undefined);
    return values.length > 0 ? values.reduce((total, value) => total + value, 0) : undefined;
  };

  return {
    currency: "RUB",
    income: sum((summary) => summary.income),
    targetExpenses: sum((summary) => summary.targetExpenses),
    operatingExpenses: sum((summary) => summary.operatingExpenses),
    bankFees: sum((summary) => summary.bankFees),
    // остаток не складывается: берём последний известный
    closingBalance: present[0].closingBalance,
  };
}

export default async function ReportsPage() {
  const [reports, stats, censusPets, siteMedia] = await Promise.all([
    reportsService.getReports(),
    petStatsService.getPetStats(),
    petStatsService.getCensusPets(),
    siteMediaService.getSiteMedia(),
  ]);

  const publishedYears = new Set(reports.map((report) => report.year));
  const pendingYears = stats.years
    .map((slice) => slice.year)
    .filter((year) => !publishedYears.has(year))
    .sort((left, right) => right - left);

  const heroImage = siteMedia.heroPoster || reports[0]?.coverImage || censusPets.find((pet) => pet.photo)?.photo;
  const allTimeFinance = totalFinance(reports.map((report) => report.financialSummary));
  const allDocuments = reports.flatMap((report) => report.documents);

  if (reports.length === 0 && stats.total === 0) {
    return (
      <div className="reports-experience">
        <InnerHeader />
        <main id="main-content">
          <ReportEmptyState unavailable />
        </main>
      </div>
    );
  }

  return (
    <div className="reports-experience">
      <InnerHeader />
      <main id="main-content">
        <ReportsHero imageUrl={heroImage} latestYear={reports[0]?.year} />

        <section className="reports-total" id="itogi">
          <div className="reports-wrap">
            <h2>Всё, что сделано с октября 2024 года</h2>
            <svg className="reports-scribble" viewBox="0 0 260 22" aria-hidden="true">
              <path d="M4 15c38-9 72 4 108-2 30-5 58-9 84 3" />
            </svg>
          </div>
          <ReportReveal>
            <div className="reports-wrap">
              <IntakeTreemap stats={stats} pets={censusPets} />
            </div>
          </ReportReveal>

          <div className="reports-wrap">
            <div className="reports-trust">
              <article>
                <div className="reports-badge">
                  <HandCoins className="reports-pic" aria-hidden="true" />
                </div>
                <h3>Только частные деньги</h3>
                <p>
                  В отчёте Минюста отмечен единственный источник — <em>целевые поступления от граждан России</em>. Ни
                  грантов, ни бюджетных средств, ни иностранного финансирования.
                </p>
              </article>
              <article>
                <div className="reports-badge">
                  <Wallet className="reports-pic" aria-hidden="true" />
                </div>
                <h3>Ни рубля на себя</h3>
                <p>
                  Целевых расходов в 2024 году не было вообще. Единственное движение по счёту —{" "}
                  <em>банковская комиссия 60,75 ₽</em>.
                </p>
              </article>
              <article>
                <div className="reports-badge">
                  <Users className="reports-pic" aria-hidden="true" />
                </div>
                <h3>Трое учредителей, один сотрудник</h3>
                <p>
                  Марина Морозова (директор), Светлана Клюкина, Андрей Синицин. Собрание учредителей провело{" "}
                  <em>одно заседание</em> за год.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="reports-census" id="podopechnye">
          <div className="reports-wrap">
            <div className="reports-section-head">
              <h2>Все подопечные — не диаграмма, а лица</h2>
              <p>
                Каждый кружок — настоящее животное из карточек фонда. Переключатель показывает долю, не пряча целое.
              </p>
            </div>
            <PetCensus pets={censusPets} />
          </div>
        </section>

        <ReportReveal>
          <section className="reports-charts">
            <div className="reports-wrap">
              <h2>Цифры, у которых есть форма</h2>
              <ReportCharts stats={stats} />
            </div>
          </section>
        </ReportReveal>

        <ReportArchive reports={reports} pendingYears={pendingYears} />

        {allTimeFinance ? (
          <FinancialFlow
            financialSummary={allTimeFinance}
            heading="Куда ушли деньги с октября 2024 года"
            note="Ноль — это тоже результат, и мы его не прячем. Суммы взяты из отчётов, поданных в Управление Минюста по Ярославской области."
          />
        ) : null}

        <DocumentStack documents={allDocuments} heading="Не верьте на слово — откройте файлы" />
      </main>
    </div>
  );
}
