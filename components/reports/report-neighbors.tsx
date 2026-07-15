import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

export function ReportNeighbors({ newerYear, olderYear }: { newerYear?: number; olderYear?: number }) {
  return (
    <nav className="report-neighbors" aria-label="Навигация по отчётам">
      <div className="report-neighbors__years">
        {newerYear && (
          <Link href={`/reports/${newerYear}`}>
            <ArrowLeft aria-hidden="true" size={18} /> Более новый: {newerYear}
          </Link>
        )}
        {olderYear && (
          <Link href={`/reports/${olderYear}`}>
            Более ранний: {olderYear} <ArrowRight aria-hidden="true" size={18} />
          </Link>
        )}
        {!newerYear && !olderYear && <Link href="/reports"><ArrowLeft aria-hidden="true" size={18} /> Ко всему архиву</Link>}
      </div>
      <Link href="/about" className="report-neighbors__about">
        Узнать о команде <ArrowUpRight aria-hidden="true" size={18} />
      </Link>
    </nav>
  );
}
