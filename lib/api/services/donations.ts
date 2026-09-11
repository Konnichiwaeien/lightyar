import { StrapiClient } from "../client";
import { StrapiDonation, StrapiResponseCollection } from "../types";

export type DonationsApiResult =
  | { status: "ready"; donations: StrapiDonation[] }
  | { status: "empty"; donations: [] }
  | { status: "unavailable"; donations: [] };

/** Взносы открытых сборов одним счётом: сколько их, на сколько и от кого. */
export interface DonationRoll {
  count: number;
  sum: number;
  names: string[];
}

/** Хранилище молчит: страница обязана пережить это без счёта взносов. */
const EMPTY_ROLL: DonationRoll = { count: 0, sum: 0, names: [] };

export class DonationsService extends StrapiClient {
  /**
   * Fetch the most recent donations for the live feed
   */
  async getRecentDonations(limit = 20): Promise<DonationsApiResult> {
    try {
      const response = await this.fetchJson<StrapiResponseCollection<StrapiDonation>>(
        `/donations?sort[0]=createdAt:desc&pagination[limit]=${limit}&fields[0]=donorName&fields[1]=amount&fields[2]=type&fields[3]=createdAt`,
        {
          next: { revalidate: 60 } // Cache and revalidate the donations feed every minute
        }
      );
      const donations = response.data || [];
      return donations.length > 0
        ? { status: "ready", donations }
        : { status: "empty", donations: [] };
    } catch (error) {
      console.error("[DonationsService] getRecentDonations failed:", error);
      return { status: "unavailable", donations: [] };
    }
  }

  /**
   * Взносы, пришедшие в открытые сборы.
   *
   * Нужен не список, а счёт: из скольких взносов сложилась собранная сумма и
   * кто их сделал. Фильтр по статусу сбора обязателен, иначе в счёт попадут
   * взносы в уже закрытые сборы и число перестанет сходиться с деньгами,
   * которые страница показывает рядом.
   */
  async getActiveCampaignRoll(): Promise<DonationRoll> {
    try {
      const response = await this.fetchJson<StrapiResponseCollection<StrapiDonation>>(
        "/donations?filters[campaign][status][$eq]=active&pagination[limit]=200" +
          "&fields[0]=donorName&fields[1]=amount&sort[0]=createdAt:desc",
        { next: { revalidate: 60 } }
      );
      const rows = response.data || [];
      return {
        count: rows.length,
        sum: rows.reduce((total, row) => total + (Number(row.amount) || 0), 0),
        names: rows.map((row) => (row.donorName || "").trim()),
      };
    } catch (error) {
      console.error("[DonationsService] getActiveCampaignRoll failed:", error);
      return EMPTY_ROLL;
    }
  }
}

export const donationsService = new DonationsService();
export default donationsService;
