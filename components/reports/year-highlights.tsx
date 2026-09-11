import Image from "next/image";
import type { YearReport } from "@/lib/reports/year-report";
import type { FinancialSummary } from "@/lib/reports/normalize-report";
import { plural } from "@/lib/reports/shelter-scales";
import { CountUp } from "./count-up";

const money = (value: number) =>
  `${new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} ₽`;

/**
 * Три числа, которыми год открывается: кто пришёл, кто остался под опекой
 * и сколько денег собрали. Крупная плитка слева с настоящим кадром, две
 * цветные справа. Секция прячется, если ни одного числа нет.
 */
export function YearHighlights({ data, finance }: { data: YearReport; finance?: FinancialSummary }) {
  const face = data.arrived.find((pet) => pet.cover) ?? data.inCare.find((pet) => pet.cover);
  const income = finance?.income;
  const hasNumbers = data.arrived.length > 0 || data.inCare.length > 0 || income !== undefined;
  if (!hasNumbers) return null;

  return (
    <section className="reports-highlights" aria-labelledby="highlights-title">
      <div className="reports-wrap">
        <h2 id="highlights-title">
          Год <span className="reports-mark">коротко</span>
        </h2>

        <ul className="reports-curio-grid">
          <li className="reports-curio" data-tone={face ? "photo" : "card"} data-span="big" style={{ "--i": 0 } as React.CSSProperties}>
            {face?.cover ? (
              <>
                <Image src={face.cover} alt="" fill sizes="(max-width: 700px) 100vw, 50vw" priority />
                <span className="reports-curio-scrim" aria-hidden="true" />
              </>
            ) : null}
            <b>
              <CountUp value={data.arrived.length} />
              <small>{plural(data.arrived.length, "подопечный", "подопечных", "подопечных")}</small>
            </b>
            <span>поступили под опеку за год</span>
          </li>

          <li className="reports-curio" data-tone="amber" data-span="tall" style={{ "--i": 1 } as React.CSSProperties}>
            <i className="reports-fact-ico reports-curio-ico" data-icon="hands-paw" aria-hidden="true" />
            <b>
              <CountUp value={data.inCare.length} />
            </b>
            <span>оставались под опекой к 31 декабря</span>
          </li>

          {income !== undefined ? (
            <li className="reports-curio" data-tone="ink" data-fit="long" style={{ "--i": 2 } as React.CSSProperties}>
              <i className="reports-fact-ico reports-curio-ico" data-icon="ruble" aria-hidden="true" />
              <b>{money(income)}</b>
              <span>поступило от граждан</span>
            </li>
          ) : null}

          {data.photos > 0 ? (
            <li className="reports-curio" data-tone="moss" style={{ "--i": 3 } as React.CSSProperties}>
              <i className="reports-fact-ico reports-curio-ico" data-icon="camera" aria-hidden="true" />
              <b>
                <CountUp value={data.photos} />
              </b>
              <span>кадров в карточках этих подопечных</span>
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
