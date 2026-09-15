"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ArrowUpDown, CheckCircle2, Flame, History, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

import { CustomDropdown, type DropdownOption } from "@/components/ui/custom-dropdown";

/**
 * Фильтр и сортировка сборов. Состояние живёт в адресе, поэтому ссылку на
 * отфильтрованный список можно переслать, а кнопка «назад» возвращает
 * прежний набор.
 *
 * Переключатель и список те же, что в каталоге питомцев: белая пилюля,
 * капитель, значок у каждого пункта. Рядом с каждой вкладкой стоит число
 * сборов в ней, чтобы пустая вкладка не выглядела поломкой.
 *
 * Выбор взаимоисключающий, поэтому это переключатель, а не пара
 * независимых кнопок: скринридер объявит «такой-то из двух».
 */

const SORTS: DropdownOption<string>[] = [
  { value: "date_desc", label: "Сначала новые", icon: <Sparkles size={14} /> },
  { value: "date_asc", label: "Сначала старые", icon: <History size={14} /> },
  { value: "collected_desc", label: "Больше собрано", icon: <TrendingUp size={14} /> },
  { value: "collected_asc", label: "Меньше собрано", icon: <TrendingDown size={14} /> },
];

export function CampaignsControls({ counts }: { counts: { active: number; closed: number } }) {
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
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const tabs = [
    { key: "active", label: "Идут сейчас", Icon: Flame, count: counts.active },
    { key: "closed", label: "Закрытые", Icon: CheckCircle2, count: counts.closed },
  ];

  return (
    <div className="camp-controls">
      <div className="camp-tabs" role="radiogroup" aria-label="Какие сборы показывать">
        {tabs.map(({ key, label, Icon, count }) => (
          <button
            key={key}
            className="camp-tab"
            type="button"
            role="radio"
            aria-checked={currentStatus === key}
            onClick={() => go("status", key)}
          >
            <Icon aria-hidden="true" size={13} />
            <span>{label}</span>
            <b aria-label={`${count} шт.`}>{count}</b>
          </button>
        ))}
      </div>

      {/* Подписи «Сортировка» рядом нет: список сам показывает выбранное
          («Сначала новые»), и слово рядом было бы повтором. Для читалки
          подпись осталась в самом списке. */}
      <div className="camp-sort">
        <CustomDropdown
          label="Сортировка"
          value={currentSort}
          options={SORTS}
          onChange={(value) => go("sort", value)}
          icon={<ArrowUpDown size={14} />}
          align="right"
          activeColorClass="border-[#1c1c1c]/10 bg-white text-[#1c1c1c] hover:border-[#1c1c1c]/25"
        />
      </div>
    </div>
  );
}
