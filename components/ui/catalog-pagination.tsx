import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./catalog-pagination.module.css";

interface Props {
  currentPage: number;
  totalPages: number;
  label: string;
  pageUrl: (page: number) => string;
}

export function CatalogPagination({ currentPage, totalPages, label, pageUrl }: Props) {
  if (totalPages <= 1) return null;

  const pages = totalPages <= 5
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : [...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])]
      .filter(page => page > 0 && page <= totalPages).sort((a, b) => a - b);

  return (
    <nav className={styles.pagination} aria-label={label}>
      {currentPage > 1 ? (
        <Link className={`${styles.control} ${styles.previous}`} href={pageUrl(currentPage - 1)} rel="prev" aria-label="Предыдущая страница">
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
      ) : (
        <span className={`${styles.control} ${styles.previous}`} role="link" aria-disabled="true" aria-label="Предыдущая страница">
          <ArrowLeft size={20} aria-hidden="true" />
        </span>
      )}
      {pages.map((page, index) => (
        <span className={styles.item} data-distant={Math.abs(page - currentPage) > 1} key={page}>
          {index > 0 && page - pages[index - 1] > 1 && <span className={styles.gap} aria-hidden="true">…</span>}
          <Link className={styles.control} href={pageUrl(page)} aria-current={page === currentPage ? "page" : undefined} aria-label={`Страница ${page}`}>
            {page}
          </Link>
        </span>
      ))}
      {currentPage < totalPages ? (
        <Link className={`${styles.control} ${styles.next}`} href={pageUrl(currentPage + 1)} rel="next" aria-label="Следующая страница">
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
      ) : (
        <span className={`${styles.control} ${styles.next}`} role="link" aria-disabled="true" aria-label="Следующая страница">
          <ArrowRight size={20} aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
