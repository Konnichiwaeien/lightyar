import type { Metadata } from "next";
import { HandCoins, Wallet, Users } from "lucide-react";
import { InnerHeader } from "@/components/layout/inner-header";
import { DocumentStack } from "@/components/reports/document-stack";
import { FinancialFlow } from "@/components/reports/financial-flow";
import { CareDynamics } from "@/components/reports/care-dynamics";
import { CuriousStats } from "@/components/reports/curious-stats";
import { DonationTill } from "@/components/reports/donation-till";
import { IntakeTreemap } from "@/components/reports/intake-treemap";
import { MomentsGallery } from "@/components/reports/moments-gallery";
import { PetCensus } from "@/components/reports/pet-census";
import { ReportArchive } from "@/components/reports/report-archive";
import { ReportCharts } from "@/components/reports/report-charts";
import { ShelterScales } from "@/components/reports/shelter-scales";
import { buildQuarters } from "@/lib/reports/care-dynamics";
import { buildComposition, buildMonthlyIntake } from "@/lib/reports/shelter-scales";
import { ReportEmptyState } from "@/components/reports/report-empty-state";
import { ReportReveal } from "@/components/reports/report-reveal";
import { ReportsHero } from "@/components/reports/reports-hero";
import { newsService } from "@/lib/api/services/news";
import { petStatsService } from "@/lib/api/services/pet-stats";
import { reportsService } from "@/lib/api/services/reports";
import type { FinancialSummary } from "@/lib/reports/normalize-report";
import "@/components/reports/reports.css";

export const metadata: Metadata = {
  title: "Отчётность",
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
  // Новости нужны только мозаике моментов: если они не пришли, страница
  // живёт без неё, а не падает целиком.
  const [reports, stats, censusPets, news] = await Promise.all([
    reportsService.getReports(),
    petStatsService.getPetStats(),
    petStatsService.getCensusPets(),
    newsService.getNews({ limit: 60 }).then((response) => response.data).catch(() => []),
  ]);

  const publishedYears = new Set(reports.map((report) => report.year));
  const pendingYears = stats.years
    .map((slice) => slice.year)
    .filter((year) => !publishedYears.has(year))
    .sort((left, right) => right - left);

  // Клиентским компонентам уходит только то, что они читают: полный список
  // с галереями и весом сериализовался бы в разметку целиком.
  const censusLite = censusPets.map(({ documentId, name, photo, status, type, intakeYear, inTreatment }) => ({
    documentId,
    name,
    photo,
    status,
    type,
    intakeYear,
    inTreatment,
  }));
  const quarters = buildQuarters(censusPets);
  const dynamicsCovers = censusPets.flatMap((pet) => (pet.cover ? [pet.cover] : [])).slice(0, 2);

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
        <ReportsHero />

        <section className="reports-total" id="itogi">
          <div className="reports-wrap">
            <h2>Сколько животных и на какие <span className="reports-mark">деньги</span></h2>
            {/* Следы появляются по одному, пока читатель прокручивает заголовок:
                одной картинкой это была полоска, а по одному читается как шаги. */}
            <span className="reports-scribble" aria-hidden="true">
              {Array.from({ length: 7 }, (_, index) => (
                <i key={index} style={{ "--i": index } as React.CSSProperties} />
              ))}
            </span>
          </div>
          <ReportReveal>
            <div className="reports-wrap">
              <IntakeTreemap stats={stats} pets={censusPets} />
            </div>
          </ReportReveal>

          <ReportReveal delay={0.05}>
            <div className="reports-wrap">
              <div className="reports-trust">
                <article>
                  <div className="reports-badge">
                    <HandCoins className="reports-pic" aria-hidden="true" />
                  </div>
                  <h3>Только частные деньги</h3>
                  <p>
                    В отчёте Минюста стоит один источник: <em>деньги граждан России</em>. Ни грантов, ни бюджета,
                    ни иностранного финансирования.
                  </p>
                </article>
                <article>
                  <div className="reports-badge">
                    <Wallet className="reports-pic" aria-hidden="true" />
                  </div>
                  <h3>Ни рубля на себя</h3>
                  <p>
                    Целевых расходов в 2024 году не было вообще. Единственное движение по счёту: <em>банковская комиссия 60,75 ₽</em>.
                  </p>
                </article>
                <article>
                  <div className="reports-badge">
                    <Users className="reports-pic" aria-hidden="true" />
                  </div>
                  <h3>Трое учредителей, один сотрудник</h3>
                  <p>
                    Марина Морозова (директор), Светлана Клюкина, Андрей Синицин. За год учредители собирались{" "}
                    <em>один раз</em>.
                  </p>
                </article>
              </div>
            </div>
          </ReportReveal>
        </section>
        <ReportReveal>
          <ShelterScales pets={censusPets} />
        </ReportReveal>

        <ReportReveal>
          <section className="reports-charts">
            <div className="reports-wrap">
              <h2>
                Приют <span className="reports-mark">в разрезе</span>
              </h2>
              <ReportCharts composition={buildComposition(censusPets)} monthly={buildMonthlyIntake(censusPets)} />
            </div>
          </section>
        </ReportReveal>

        <DonationTill year={reports[0]?.year} finance={reports[0]?.financialSummary} />

        <ReportReveal>
          <CuriousStats pets={censusPets} />
        </ReportReveal>

        <ReportReveal>
          <MomentsGallery news={news} />
        </ReportReveal>


        <section className="reports-census" id="podopechnye">
          <div className="reports-wrap">
            <div className="reports-section-head">
              <h2>За каждым кружком <span className="reports-mark">чья-то жизнь</span></h2>
              <p>
                Здесь все, кто прошёл через приют. Нажмите вкладку, и нужные кружки загорятся, остальные
                останутся на месте: так видно, какую часть занимает группа.
              </p>
            </div>
            <ReportReveal delay={0.05}>
              <PetCensus pets={censusLite} />
            </ReportReveal>
          </div>
        </section>

        <ReportReveal>
          <CareDynamics quarters={quarters} covers={dynamicsCovers} />
        </ReportReveal>

        <ReportReveal>
          <ReportArchive reports={reports} pendingYears={pendingYears} />
        </ReportReveal>

        {allTimeFinance ? (
          <FinancialFlow
            financialSummary={allTimeFinance}
            heading={<>Куда ушли деньги с <span className="reports-mark">октября 2024</span></>}
            note="Целевых расходов не было ни разу. По счёту прошла одна комиссия банка, и всё. Цифры из отчётов, которые мы подали в Управление Минюста по Ярославской области."
          />
        ) : null}

        <ReportReveal>
          <DocumentStack documents={allDocuments} heading={<>Не верьте на слово, откройте <span className="reports-mark">файлы</span></>}
          />
        </ReportReveal>
      </main>
    </div>
  );
}
