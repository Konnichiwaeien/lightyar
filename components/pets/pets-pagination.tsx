"use client";

import { useSearchParams } from "next/navigation";
import { CatalogPagination } from "@/components/ui/catalog-pagination";

export function PetsPagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const params = useSearchParams();
  const pageUrl = (page: number) => {
    const next = new URLSearchParams(params.toString());
    if (page === 1) next.delete("page");
    else next.set("page", String(page));
    return `/pets?${next}#pets-catalog`;
  };

  return <CatalogPagination currentPage={currentPage} totalPages={totalPages} label="Страницы каталога" pageUrl={pageUrl} />;
}
