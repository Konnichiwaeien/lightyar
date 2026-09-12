import { campaignsService } from "@/lib/api/services/campaigns";

/**
 * Сводка по всем открытым сборам.
 *
 * Считается по всем открытым сборам, а не по странице списка: фильтр и номер
 * страницы под обложкой меняются, а нужда приюта от этого не меняется.
 */

export interface CampaignSummary {
  /** Сколько сборов открыто. */
  funds: number;
  /** Сумма целей. */
  goal: number;
  /** Сколько уже собрано. */
  got: number;
  /** Сколько не хватает до всех целей. */
  rest: number;
}

export async function getCampaignSummary(): Promise<CampaignSummary | null> {
  const data = await campaignsService.getCampaigns({ status: "active", limit: 100 });
  const open = data.data || [];
  if (open.length === 0) return null;

  const goal = open.reduce((sum, fund) => sum + (Number(fund.total) || 0), 0);
  const got = open.reduce((sum, fund) => sum + (Number(fund.current) || 0), 0);

  return { funds: open.length, goal, got, rest: Math.max(0, goal - got) };
}
