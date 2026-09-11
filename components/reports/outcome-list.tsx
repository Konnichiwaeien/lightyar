import type { ReactNode } from "react";
import Image from "next/image";
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

/** Значок из той же серии масок, что и на общей странице. Команде и
 *  собственным показателям достаются руки с лапой: плитка без значка
 *  читалась как пустая ячейка. */
const OUTCOME_ICON: Record<ReportOutcome["kind"], string> = {
  dogsInCare: "dog-head",
  catsInCare: "cat",
  rescued: "paw",
  treated: "stethoscope",
  adopted: "kennel",
  volunteers: "hands-paw",
};

/** Тона идут по кругу, а подтверждённый ноль всегда чернильный: он тут главный. */
const TONES = ["amber", "moss", "card", "clay", "card"] as const;

/**
 * Показатели года мозаикой: крупная цифра на цветной плитке, у большинства
 * свой значок, первая плитка с фотографией подопечного этого года.
 *
 * Раньше это была сетка одинаковых белых карточек «значок, число, подпись»,
 * где последняя карточка оставалась сиротой в своём ряду.
 */
export function OutcomeList({
  outcomes,
  customMetrics,
  heading,
  face,
}: {
  outcomes: ReportOutcome[];
  customMetrics: ReportCustomMetric[];
  heading: ReactNode;
  face?: { src: string; name: string };
}) {
  if (outcomes.length === 0 && customMetrics.length === 0) return null;

  const tiles = [
    ...outcomes.map((outcome) => ({
      key: `${outcome.kind}-${outcome.order}`,
      value: formatQualifiedValue(outcome.value, outcome.qualifier),
      label: outcome.note && outcome.note.length <= 46 ? outcome.note : OUTCOME_LABEL[outcome.kind],
      icon: OUTCOME_ICON[outcome.kind],
      zero: outcome.value === 0,
    })),
    ...customMetrics.map((metric) => ({
      key: `${metric.label}-${metric.order}`,
      value: `${formatQualifiedValue(metric.value, metric.qualifier)}${metric.unit ? ` ${metric.unit}` : ""}`,
      label: metric.note && metric.note.length <= 46 ? metric.note : metric.label,
      icon: "hands-paw",
      zero: metric.value === 0,
    })),
  ];

  return (
    <section className="reports-outcomes" aria-label="Показатели года">
      <div className="reports-wrap">
        <h2>{heading}</h2>

        <ul className="reports-curio-grid">
          {face ? (
            <li className="reports-curio" data-tone="photo" data-span="big" style={{ "--i": 0 } as React.CSSProperties}>
              <Image src={face.src} alt="" fill sizes="(max-width: 700px) 100vw, 50vw" />
              <span className="reports-curio-scrim" aria-hidden="true" />
              <b>{face.name}</b>
              <span>под опекой фонда с этого года</span>
            </li>
          ) : null}

          {/* На телефоне колонки две, и при нечётном числе показателей последняя
              плитка оставалась одна: она растягивается на всю ширину. */}
          {tiles.map((tile, index) => (
            <li
              key={tile.key}
              className="reports-curio"
              data-orphan={index === tiles.length - 1 && tiles.length % 2 === 1 ? "true" : undefined}
              data-tone={tile.zero ? "ink" : TONES[index % TONES.length]}
              style={{ "--i": index + 1 } as React.CSSProperties}
            >
              {tile.icon ? <i className="reports-fact-ico reports-curio-ico" data-icon={tile.icon} aria-hidden="true" /> : null}
              <b>{tile.value}</b>
              <span>{tile.label}</span>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
