import { formatQualifiedValue } from "@/lib/reports/report-domain";
import type { ReportCustomMetric, ReportOutcome } from "@/lib/reports/normalize-report";

const labels: Record<ReportOutcome["kind"], string> = {
  dogsInCare: "Собак на кураторстве",
  catsInCare: "Кошек на кураторстве",
  rescued: "Животных спасено",
  treated: "Прошли лечение",
  adopted: "Нашли новый дом",
  volunteers: "Волонтёров в команде",
};

export function OutcomeList({ outcomes, customMetrics }: { outcomes: ReportOutcome[]; customMetrics: ReportCustomMetric[] }) {
  if (outcomes.length === 0 && customMetrics.length === 0) return null;
  const items = [
    ...outcomes.map((item) => ({
      key: `outcome-${item.id ?? item.kind}`,
      label: labels[item.kind],
      value: formatQualifiedValue(item.value, item.qualifier),
      unit: "",
      note: item.note,
    })),
    ...customMetrics.map((item) => ({
      key: `custom-${item.id ?? item.label}`,
      label: item.label,
      value: formatQualifiedValue(item.value, item.qualifier),
      unit: item.unit || "",
      note: item.note,
    })),
  ];

  return (
    <section className="report-outcomes" aria-labelledby="outcomes-title">
      <p className="reports-kicker">Результаты</p>
      <h2 id="outcomes-title">То, что удалось сделать</h2>
      <ol>
        {items.map((item, index) => (
          <li key={item.key}>
            <span className="report-outcomes__number">{String(index + 1).padStart(2, "0")}</span>
            <span className="report-outcomes__value">{item.value}{item.unit && <small> {item.unit}</small>}</span>
            <span className="report-outcomes__label">{item.label}</span>
            {item.note && <p>{item.note}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}
