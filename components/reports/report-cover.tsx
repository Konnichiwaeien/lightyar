import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { AnnualReport } from "@/lib/reports/normalize-report";

export function ReportCover({ report }: { report: AnnualReport }) {
  return (
    <section className="report-cover" aria-labelledby="report-title">
      <div className="report-cover__meta">
        <Link href="/reports" className="report-cover__back">
          <ArrowLeft aria-hidden="true" size={17} /> Архив отчётности
        </Link>
        <span>Опубликованный годовой отчёт</span>
      </div>
      <div className="report-cover__year" aria-hidden="true">{report.year}</div>
      <div className="report-cover__copy">
        <p className="reports-kicker">{report.year}</p>
        <h1 id="report-title">{report.title}</h1>
        <p>{report.summary}</p>
      </div>
    </section>
  );
}
