"use client";

import { motion, useInView } from "framer-motion";
import { useMotionPreference } from "./use-motion-preference";
import { useRef, type ReactNode } from "react";
import type { FinancialSummary } from "@/lib/reports/normalize-report";

const money = (value: number) =>
  `${new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} ₽`;

interface Row {
  label: string;
  value: number;
  soft?: boolean;
}

/**
 * Движение средств. Ширина полосы — это данные, она выставляется сразу;
 * появление рисуется clip-path, чтобы не анимировать раскладку.
 *
 * Ноль показывается как ноль: пустое поле означало бы «нет данных», а это разные вещи.
 */
export function FinancialFlow({
  financialSummary,
  heading,
  note,
}: {
  financialSummary: FinancialSummary;
  heading: ReactNode;
  note?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const shown = reduced || inView;

  const rows: Row[] = [];
  if (financialSummary.income !== undefined) rows.push({ label: "Поступило от граждан", value: financialSummary.income });
  if (financialSummary.targetExpenses !== undefined)
    rows.push({ label: "Целевые расходы", value: financialSummary.targetExpenses, soft: true });
  if (financialSummary.operatingExpenses !== undefined)
    rows.push({ label: "Административные расходы", value: financialSummary.operatingExpenses, soft: true });
  if (financialSummary.bankFees !== undefined)
    rows.push({ label: "Банковская комиссия", value: financialSummary.bankFees, soft: true });
  if (financialSummary.closingBalance !== undefined)
    rows.push({ label: "Остаток на счёте", value: financialSummary.closingBalance });

  if (rows.length === 0) return null;

  const scale = Math.max(...rows.map((row) => Math.abs(row.value)), 1);

  return (
    <section className="reports-money" aria-label="Движение средств">
      <div className="reports-wrap" ref={ref}>
        <h2>{heading}</h2>
        <dl className="reports-flow">
          {rows.map((row, index) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>
              <div aria-hidden="true" className={`reports-bar${row.soft ? " reports-bar--soft" : ""}`}>
                <motion.i
                  style={{ width: `${Math.max((Math.abs(row.value) / scale) * 100, row.value > 0 ? 1.5 : 0)}%` }}
                  initial={false}
                  animate={{ clipPath: shown ? "inset(0 0 0 0)" : "inset(0 100% 0 0)" }}
                  transition={{ duration: 1.2, delay: reduced ? 0 : index * 0.12, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span>{money(row.value)}</span>
              </dd>
            </div>
          ))}
        </dl>
        {note ? <p className="reports-money-note">{note}</p> : null}
      </div>
    </section>
  );
}
