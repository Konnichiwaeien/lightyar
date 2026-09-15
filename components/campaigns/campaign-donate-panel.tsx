"use client";

import { useEffect } from "react";

import { DonationExperience } from "@/components/donations/donation-experience";
import type { DonationFeedState } from "@/lib/donations/donation-feed-state";

/**
 * Панель помощи внутри диалога. Грузится динамически, по первому клику:
 * панель с полями, ступенями, лентой и подопечным тяжёлая, а нужна не при
 * загрузке страницы, а когда читатель решил помочь.
 *
 * `onReady` зовётся после того, как панель подписалась на событие
 * назначения: эффекты детей идут раньше эффектов родителя, поэтому к этому
 * моменту подписка уже есть, и диалог может повторить событие, которое
 * пришло до загрузки панели.
 */
export function CampaignDonatePanel({ feed, onReady }: { feed: DonationFeedState; onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);

  return <DonationExperience feed={feed} />;
}
