import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface ReportEmptyStateProps {
  unavailable?: boolean;
}

/**
 * Пустое состояние архива. Недоступные данные не подменяются примерными числами —
 * это тот случай, когда честнее показать пустоту, чем правдоподобную выдумку.
 */
export function ReportEmptyState({ unavailable = false }: ReportEmptyStateProps) {
  return (
    <section className="reports-archive" aria-labelledby="reports-empty-title">
      <div className="reports-wrap">
        <div className="reports-empty">
          <h2 id="reports-empty-title">
            {unavailable ? "Отчётность временно недоступна" : "Первый отчёт готовится к публикации"}
          </h2>
          <p>
            {unavailable
              ? "Мы не подменяем недоступные данные примерными цифрами. Вернитесь чуть позже — опубликованный архив появится здесь автоматически."
              : "После публикации в CMS год появится здесь без изменения кода."}
          </p>
          <p>
            <Link className="reports-year-cta" href="/about">
              Как устроен «Светлый» <ArrowUpRight aria-hidden="true" size={18} />
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
