"use client";

import { Heart } from "lucide-react";

import { preloadDonatePanel, requestDonationIntent } from "@/lib/donations/donation-intent";

/**
 * Кнопка «Помочь» на карточке сбора.
 *
 * Открывает ту же панель помощи, что на главной, с подставленным сбором и
 * суммой ступени; на странице сборов панель живёт в диалоге. Отдельный
 * клиентский островок, чтобы сама страница со списком осталась серверной и
 * не уехала в разметку целиком.
 *
 * Панель грузится динамически, поэтому её код подтягивается заранее, при
 * наведении или фокусе: к клику он уже на месте.
 */
export function CampaignHelpButton({ id, title }: { id: string; title: string }) {
  return (
    <button
      className="camp-btn"
      type="button"
      onFocus={preloadDonatePanel}
      onMouseEnter={preloadDonatePanel}
      onClick={() => requestDonationIntent({ kind: "campaign", id, title, amount: 500 })}
    >
      <Heart size={18} aria-hidden="true" /> Помочь
    </button>
  );
}
