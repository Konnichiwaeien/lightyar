import type { YearReport } from "@/lib/reports/year-report";
import { CountUp } from "./count-up";
import { ReportCharts } from "./report-charts";

/**
 * Приют в разрезе на конец года: четыре кольца и сезонная кривая.
 *
 * Те же диаграммы, что на общей странице, но по составу этого года. Секция
 * прячется, если под опекой к 31 декабря было меньше трёх подопечных:
 * кольца из двух долей ничего не объясняют.
 */
export function YearBreakdown({ data }: { data: YearReport }) {
  if (data.inCare.length < 3) return null;

  return (
    <section className="reports-charts" aria-labelledby="breakdown-title">
      <div className="reports-wrap">
        <h2 id="breakdown-title">
          Приют <span className="reports-mark">в разрезе</span>
        </h2>
        <p className="reports-breakdown-lead">
          Кто оставался под опекой <strong>к 31 декабря {data.year} года</strong>: собаки и кошки, девочки и мальчики,
          крупные и небольшие. Кривая ниже показывает, в какие месяцы приходили новые.
        </p>
        <ReportCharts composition={data.composition} monthly={data.monthlyIntake} />
      </div>
    </section>
  );
}

/**
 * Возраст будками: сторона растёт как корень из доли, поэтому сравниваются
 * площади. Прячется, если ни у кого из подопечных нет даты рождения.
 */
export function YearAges({ data }: { data: YearReport }) {
  if (data.ages.length === 0) return null;
  const widest = Math.max(...data.ages.map((group) => group.count));

  return (
    <section className="reports-year-ages" aria-labelledby="ages-title">
      <div className="reports-wrap">
        <h2 id="ages-title">
          Сколько им <span className="reports-mark">было лет</span>
        </h2>
        <p className="reports-breakdown-lead">
          Возраст <strong>на 31 декабря {data.year} года</strong>, по датам рождения из карточек.
        </p>

        <figure className="reports-kennels">
          <ol>
            {data.ages.map((group, index) => (
              <li key={group.key} style={{ "--size": Math.sqrt(group.count / widest), "--i": index } as React.CSSProperties}>
                <span className="reports-kennel" aria-hidden="true">
                  <i className="reports-kennel-light" />
                  <i className="reports-kennel-body" />
                </span>
                <b>
                  <CountUp value={group.count} />
                </b>
                <span>{group.label}</span>
              </li>
            ))}
          </ol>
        </figure>
      </div>
    </section>
  );
}
