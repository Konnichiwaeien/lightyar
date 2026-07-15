import { ArrowDown } from "lucide-react";

interface ReportsHeroProps {
  latestYear?: number;
  reportCount: number;
}

export function ReportsHero({ latestYear, reportCount }: ReportsHeroProps) {
  return (
    <section className="reports-hero" aria-labelledby="reports-title">
      <div className="reports-hero__eyebrow">
        <span>Публичная отчётность</span>
        <span>{latestYear ? `по ${latestYear} год` : "архив готовится"}</span>
      </div>

      <h1 id="reports-title" className="reports-hero__title">
        Помощь должна быть <em>видимой</em>
      </h1>

      <div className="reports-hero__footer">
        <p>
          Годовые документы, движение средств и подтверждённые результаты АНБО «Светлый» — без декоративной статистики и скрытых допущений.
        </p>
        <a href="#report-archive" className="reports-hero__jump">
          <span>{reportCount ? `Открыть ${reportCount === 1 ? "отчёт" : "архив"}` : "О состоянии архива"}</span>
          <ArrowDown aria-hidden="true" size={18} />
        </a>
      </div>
    </section>
  );
}
