"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Flame } from "lucide-react";

import { plural } from "@/lib/reports/shelter-scales";

/**
 * Сколько осталось до срока сбора — бейдж в ряду с тегом и подопечным.
 *
 * Считается в браузере, а не на сервере: страница отдаётся из кэша на минуту
 * и живёт в нём до следующей сборки, а «осталось 4 дня» в такой разметке
 * протухает молча. До счёта бейджа нет вовсе, поэтому разметка сервера и
 * первый кадр браузера совпадают.
 *
 * Пересчёта по часам нет: число дней меняется раз в сутки, а таймер на минуту
 * будил бы вкладку впустую.
 *
 * Значок здесь рисованный. На его месте стояли песочные часы эмодзи: эмодзи
 * приходит из системного шрифта, у каждой платформы он свой, и рядом с
 * набором значков страницы читался чужим.
 */

export function CampaignCountdown({ deadline }: { deadline: string | null }) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    if (!deadline) return;
    const left = new Date(deadline).getTime() - Date.now();
    if (left <= 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDays(Math.ceil(left / 86_400_000));
  }, [deadline]);

  if (days === null) return null;

  const urgent = days <= 3;

  return (
    <span className={`camp-badge ${urgent ? "camp-badge--urgent" : "camp-badge--term"}`}>
      {urgent ? <Flame aria-hidden="true" size={12} /> : <CalendarClock aria-hidden="true" size={12} />}
      {days <= 1 ? "Последний день" : `Осталось ${days} ${plural(days, "день", "дня", "дней")}`}
    </span>
  );
}
