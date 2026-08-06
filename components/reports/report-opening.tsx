import Image from "next/image";
import { CalendarDays } from "lucide-react";
import type { AnnualReport } from "@/lib/reports/normalize-report";

/**
 * Кинематографичное открытие годового отчёта: кадр во весь экран,
 * год крупно по центру. Эмоция идёт первой, аргументы — ниже по странице.
 */
export function ReportOpening({ report, period }: { report: AnnualReport; period?: string }) {
  return (
    <section className="reports-opening">
      <div className="reports-opening-inner">
        {report.coverImage ? (
          <div className="reports-opening-media">
            <Image
              src={report.coverImage}
              alt={`Работа фонда в ${report.year} году`}
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        ) : null}
        <div className="reports-opening-body">
          <span className="reports-opening-year reports-num">{report.year}</span>
          <h1>{report.title}</h1>
          <p>{report.summary}</p>
          {period ? (
            <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", letterSpacing: "0.06em" }}>
              <CalendarDays className="reports-pic" aria-hidden="true" style={{ width: 16, height: 16, verticalAlign: "-3px", marginRight: 8 }} />
              {period}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
