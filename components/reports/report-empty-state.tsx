import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface ReportEmptyStateProps {
  unavailable?: boolean;
}

export function ReportEmptyState({ unavailable = false }: ReportEmptyStateProps) {
  return (
    <section id="report-archive" className="reports-empty" aria-labelledby="reports-empty-title">
      <p className="reports-kicker">Архив</p>
      <h2 id="reports-empty-title">
        {unavailable ? "Отчётность временно недоступна" : "Первый отчёт готовится к публикации"}
      </h2>
      <p>
        {unavailable
          ? "Мы не подменяем недоступные данные примерными цифрами. Вернитесь чуть позже — опубликованный архив появится здесь автоматически."
          : "После публикации в Strapi год появится здесь без изменения кода."}
      </p>
      <Link href="/about" className="reports-empty__link">
        Как устроен «Светлый» <ArrowUpRight aria-hidden="true" size={18} />
      </Link>
    </section>
  );
}
