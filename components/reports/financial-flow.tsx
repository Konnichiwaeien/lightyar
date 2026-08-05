import type { FinancialSummary } from "@/lib/reports/normalize-report";
import { FinancialFlowMotion } from "./financial-flow-motion";

function formatMoney(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function FinancialFlow({ financialSummary }: { financialSummary: FinancialSummary }) {
  const steps: { key: string; label: string; value: number; tone: string }[] = [];
  if (financialSummary.income !== undefined) {
    steps.push({ key: "income", label: "Поступления", value: financialSummary.income, tone: "source" });
  }
  if (financialSummary.targetExpenses !== undefined && financialSummary.targetExpenses !== 0) {
    steps.push({ key: "target", label: "Целевые расходы", value: financialSummary.targetExpenses, tone: "expense" });
  }
  if (financialSummary.operatingExpenses !== undefined && financialSummary.operatingExpenses !== 0) {
    steps.push({ key: "operating", label: "Операционные расходы", value: financialSummary.operatingExpenses, tone: "expense" });
  }
  if (financialSummary.bankFees !== undefined) {
    steps.push({ key: "fees", label: "Комиссия банка", value: financialSummary.bankFees, tone: "expense" });
  }
  if (financialSummary.closingBalance !== undefined) {
    steps.push({ key: "balance", label: "Остаток", value: financialSummary.closingBalance, tone: "balance" });
  }

  if (steps.length === 0 && !financialSummary.note) return null;
  const path = "M 20 92 C 150 20 255 164 390 92 S 620 20 780 92";

  return (
    <section className="financial-flow" aria-labelledby="financial-title" aria-label="Движение средств">
      <div className="financial-flow__heading">
        <div>
          <p className="reports-kicker">Финансовая сводка</p>
          <h2 id="financial-title">Движение средств</h2>
        </div>
        <p>Визуализируем только заполненные и подтверждённые значения.</p>
      </div>

      {steps.length > 0 && (
        <div className="financial-flow__visual">
          <svg viewBox="0 0 800 184" role="img" aria-label="Схема движения средств; точные суммы перечислены ниже">
            <path d={path} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="3" />
            <g className="financial-flow__path"><FinancialFlowMotion path={path} /></g>
          </svg>
          <dl className="financial-flow__values">
            {steps.map((step) => (
              <div key={step.key} data-tone={step.tone}>
                <dt>{step.label}</dt>
                <dd>{formatMoney(step.value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {financialSummary.targetExpenses === 0 && (
        <p className="financial-flow__zero">
          Целевые расходы в проверенном отчёте не заявлены — показываем подтверждённый ноль, а не пустое значение.
        </p>
      )}
      {financialSummary.note && <p className="financial-flow__note">{financialSummary.note}</p>}
    </section>
  );
}
