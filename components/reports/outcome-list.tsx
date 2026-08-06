import { PawPrint, Home, HeartPulse, Users, Dog, Cat, CircleDot } from "lucide-react";
import type { ReportCustomMetric, ReportOutcome } from "@/lib/reports/normalize-report";
import { formatQualifiedValue } from "@/lib/reports/report-domain";

const OUTCOME_LABEL: Record<ReportOutcome["kind"], string> = {
  dogsInCare: "собак под опекой",
  catsInCare: "кошек под опекой",
  rescued: "животных попали под опеку фонда",
  treated: "получили ветеринарную помощь",
  adopted: "нашли постоянный дом",
  volunteers: "учредителей и волонтёров в команде",
};

const OUTCOME_ICON: Record<ReportOutcome["kind"], typeof PawPrint> = {
  dogsInCare: Dog,
  catsInCare: Cat,
  rescued: PawPrint,
  treated: HeartPulse,
  adopted: Home,
  volunteers: Users,
};

/**
 * Показатели года. Подтверждённый ноль подаётся отдельным цветом, а не прячется:
 * для первого года фонда «ноль пристроенных» — это и есть главный честный факт.
 */
export function OutcomeList({
  outcomes,
  customMetrics,
  heading,
  note,
}: {
  outcomes: ReportOutcome[];
  customMetrics: ReportCustomMetric[];
  heading: string;
  note?: string;
}) {
  if (outcomes.length === 0 && customMetrics.length === 0) return null;

  return (
    <section className="reports-outcomes" aria-label="Показатели года">
      <div className="reports-wrap">
        <h2>{heading}</h2>
        <ul className="reports-outcome-grid">
          {outcomes.map((outcome) => {
            const Icon = OUTCOME_ICON[outcome.kind];
            return (
              <li
                key={`${outcome.kind}-${outcome.order}`}
                className={`reports-outcome${outcome.value === 0 ? " reports-outcome--zero" : ""}`}
              >
                <Icon className="reports-pic" aria-hidden="true" />
                <b className="reports-num">{formatQualifiedValue(outcome.value, outcome.qualifier)}</b>
                <span>{outcome.note || OUTCOME_LABEL[outcome.kind]}</span>
              </li>
            );
          })}

          {customMetrics.map((metric) => (
            <li
              key={`${metric.label}-${metric.order}`}
              className={`reports-outcome${metric.value === 0 ? " reports-outcome--zero" : ""}`}
            >
              <CircleDot className="reports-pic" aria-hidden="true" />
              <b className="reports-num">
                {formatQualifiedValue(metric.value, metric.qualifier)}
                {metric.unit ? ` ${metric.unit}` : ""}
              </b>
              <span>{metric.note || metric.label}</span>
            </li>
          ))}
        </ul>
        {note ? <p className="reports-outcome-note">{note}</p> : null}
      </div>
    </section>
  );
}
