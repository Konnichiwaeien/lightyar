export function campaignCatalogState(params: Record<string, string | string[] | undefined>) {
  const requested = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isSafeInteger(requested) && requested > 0 ? requested : 1;
  const status = params.status === "closed" ? "closed" : "active";
  const sort = typeof params.sort === "string" && ["date_asc", "collected_desc", "collected_asc"].includes(params.sort)
    ? params.sort : "date_desc";
  const query = new URLSearchParams();
  if (status === "closed") query.set("status", status);
  if (sort !== "date_desc") query.set("sort", sort);
  if (page > 1) query.set("page", String(page));
  return { page, status, sort, noindex: sort !== "date_desc", canonical: `/campaigns${query.size ? `?${query}` : ""}` } as const;
}
