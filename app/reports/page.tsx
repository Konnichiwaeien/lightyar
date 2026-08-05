import type { Metadata } from "next";
import { DarkInnerHeader } from "@/components/layout/dark-inner-header";
import { ReportArchive } from "@/components/reports/report-archive";
import { ReportBeam } from "@/components/reports/report-beam";
import { ReportEmptyState } from "@/components/reports/report-empty-state";
import { ReportsHero } from "@/components/reports/reports-hero";
import { reportsService } from "@/lib/api/services/reports";
import type { AnnualReport } from "@/lib/reports/normalize-report";
import "@/components/reports/reports.css";

export const metadata: Metadata = {
  title: "Отчётность | АНБО «Светлый»",
  description: "Годовые документы и подтверждённые показатели работы АНБО «Светлый».",
  alternates: { canonical: "/reports" },
};

export default async function ReportsPage() {
  let reports: AnnualReport[] = [];
  let unavailable = false;

  try {
    reports = await reportsService.getReports();
  } catch (error) {
    unavailable = true;
    console.error("[ReportsPage] reports are unavailable:", error);
  }

  return (
    <div className="reports-experience selection:bg-amber-400 selection:text-[#0a0a0a]">
      <DarkInnerHeader />
      <ReportBeam />
      <main id="main-content">
        <ReportsHero latestYear={reports[0]?.year} reportCount={reports.length} />
        {reports.length > 0 ? <ReportArchive reports={reports} /> : <ReportEmptyState unavailable={unavailable} />}
      </main>
    </div>
  );
}
