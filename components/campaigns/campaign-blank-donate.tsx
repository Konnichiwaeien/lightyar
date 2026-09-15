"use client";

import { HeartHandshake } from "lucide-react";

import { preloadDonatePanel, requestDonateOpen } from "@/lib/donations/donation-intent";

/**
 * Кнопка взноса в пустом состоянии каталога.
 *
 * Отдельный островок, чтобы страница со списком осталась серверной: ей нужен
 * обработчик, а всей странице клиентский код не нужен.
 */
export function CampaignBlankDonate() {
  return (
    <button
      className="camp-btn camp-blank__cta"
      onClick={requestDonateOpen}
      onFocus={preloadDonatePanel}
      onMouseEnter={preloadDonatePanel}
      type="button"
    >
      <HeartHandshake aria-hidden="true" size={17} />
      Помочь без цели
    </button>
  );
}
