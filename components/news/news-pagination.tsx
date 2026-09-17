"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { CatalogPagination } from "@/components/ui/catalog-pagination";

export function NewsPagination({ totalPages, currentPage }: { totalPages: number; currentPage: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params}`;
  };

  return <CatalogPagination currentPage={currentPage} totalPages={totalPages} label="Навигация по новостной ленте" pageUrl={pageUrl} />;
}
