import type { FinancialSummary } from "@/lib/reports/normalize-report";
import { CountUp } from "./count-up";

/**
 * Куда ушли деньги: мешок наполняется по прокрутке, гранулы падают сверху.
 *
 * Уровень в мешке равен доле потраченного от поступившего, поэтому видно
 * не только сумму, но и то, сколько от собранного приют успел израсходовать.
 * Секция прячется, если в отчёте нет ни одной статьи расхода: за первый
 * неполный год тратить было нечего, и пустой мешок ничего не объяснит.
 */

const money = (value: number) =>
  `${new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} ₽`;

/** Гранулы падают вразнобой: доля ширины мешка и свой отрезок прокрутки. */
const KIBBLE = Array.from({ length: 9 }, (_, index) => ({
  left: 22 + ((index * 41) % 56),
  delay: index * 6,
  tilt: -80 + ((index * 57) % 160),
  // Своя ячейка на общем листе гранул, чтобы формы не повторялись.
  cell: `${(index % 3) * 50}% ${Math.floor(index / 3) * 50}%`,
}));

export function YearSpending({ year, finance }: { year: number; finance?: FinancialSummary }) {
  if (!finance) return null;
  const target = finance.targetExpenses ?? 0;
  const operating = finance.operatingExpenses ?? 0;
  const fees = finance.bankFees ?? 0;
  const spent = target + operating + fees;
  if (spent <= 0) return null;

  const income = finance.income ?? 0;
  const share = income > 0 ? Math.min(1, spent / income) : 1;
  const rows = [
    { key: "target", value: target, label: "на подопечных: корм, лечение, содержание" },
    { key: "operating", value: operating, label: "на работу организации" },
    { key: "fees", value: fees, label: "комиссия банка" },
  ].filter((row) => row.value > 0);

  return (
    <section className="reports-spending" aria-labelledby="spending-title">
      <div className="reports-wrap reports-spending-stage">
        <div className="reports-spending-copy">
          <h2 id="spending-title">
            Куда ушли <span className="reports-mark">деньги</span>
          </h2>
          <p>
            Всё, что приют потратил за {year} год, <strong>до копейки</strong>. Суммы из отчёта для Минюста, сам файл
            лежит ниже на этой странице.
          </p>

          <p className="reports-spending-total">
            <b className="reports-num">
              <CountUp value={spent} kind="money" />
            </b>
            <span>
              потрачено за год{income > 0 ? `, это ${(share * 100).toFixed(1).replace(".", ",")}% от собранного` : ""}
            </span>
          </p>

          <dl className="reports-spending-rows">
            {rows.map((row) => (
              <div key={row.key}>
                <dt>{row.label}</dt>
                <dd className="reports-num">{money(row.value)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="reports-spending-scene" aria-hidden="true" style={{ "--fill": share } as React.CSSProperties}>
          {/* Гранулы сыплются, только когда есть чему сыпаться: при доле
              в доли процента они падали бы в пустой мешок. */}
          {share >= 0.05
            ? KIBBLE.map((grain) => (
                <span
                  className="reports-spending-grain"
                  key={grain.left + grain.delay}
                  style={
                    {
                      left: `${grain.left}%`,
                      "--delay": grain.delay,
                      "--tilt": `${grain.tilt}deg`,
                      "--cell": grain.cell,
                    } as React.CSSProperties
                  }
                />
              ))
            : null}
          <span className="reports-spending-sack">
            <span className="reports-spending-fill" />
          </span>
        </div>
      </div>
    </section>
  );
}
