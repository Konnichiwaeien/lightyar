"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Фильтр и сортировка сборов. Состояние живёт в адресе, поэтому ссылку на
 * отфильтрованный список можно переслать, а кнопка «назад» возвращает
 * прежний набор.
 *
 * Вкладки те же, что в переписи подопечных: выбор взаимоисключающий,
 * поэтому это переключатель, а не пара независимых кнопок.
 */
export function CampaignsControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "active";
  const currentSort = searchParams.get("sort") || "date_desc";

  const go = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      // Смена фильтра возвращает на первую страницу: иначе выборка из двух
      // сборов открывалась бы на четвёртой и выглядела пустой.
      if (name !== "page") params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="camp-controls">
      <div className="reports-tabs" role="radiogroup" aria-label="Какие сборы показывать">
        {[
          { key: "active", label: "Идут сейчас" },
          { key: "closed", label: "Закрытые" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="radio"
            aria-checked={currentStatus === tab.key}
            aria-pressed={currentStatus === tab.key}
            onClick={() => go("status", tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <label className="camp-sort">
        <span>Сортировка</span>
        <select value={currentSort} onChange={(event) => go("sort", event.target.value)}>
          <option value="date_desc">Сначала новые</option>
          <option value="date_asc">Сначала старые</option>
          <option value="collected_desc">Больше собрано</option>
          <option value="collected_asc">Меньше собрано</option>
        </select>
      </label>
    </div>
  );
}
