import { StrapiClient } from "../client";
import { StrapiDonation, StrapiResponseCollection } from "../types";

export type DonationsApiResult =
  | { status: "ready"; donations: StrapiDonation[] }
  | { status: "empty"; donations: [] }
  | { status: "unavailable"; donations: [] };

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
}

export const donationsService = new DonationsService();
export default donationsService;
