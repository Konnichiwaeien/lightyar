"use client";

import { Heart } from "lucide-react";

import { requestDonationIntent } from "@/lib/donations/donation-intent";

/**
 * Кнопка «Помочь» на карточке сбора.
 *
 * Открывает тот же поток взноса, что и на главной, с подставленной суммой
 * ступени. Отдельный клиентский островок, чтобы сама страница со списком
 * осталась серверной и не уехала в разметку целиком.
 */
export function CampaignHelpButton({ id, title }: { id: string; title: string }) {
  return (
    <button
      className="camp-btn"
      type="button"
      onClick={() => requestDonationIntent({ kind: "campaign", id, title, amount: 500 })}
    >
      <Heart size={18} aria-hidden="true" /> Помочь
    </button>
  );
}
