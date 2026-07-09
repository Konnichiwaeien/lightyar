import { StrapiClient } from "../client";
import { StrapiDonation, StrapiResponseCollection } from "../types";

export class DonationsService extends StrapiClient {
  /**
   * Fetch the most recent donations for the live feed
   */
  async getRecentDonations(limit = 20): Promise<StrapiDonation[]> {
    try {
      const response = await this.fetchJson<StrapiResponseCollection<StrapiDonation>>(
        `/donations?sort[0]=createdAt:desc&pagination[limit]=${limit}&fields[0]=donorName&fields[1]=amount&fields[2]=type&fields[3]=createdAt`,
        {
          next: { revalidate: 60 } // Cache and revalidate the donations feed every minute
        }
      );
      return response.data || [];
    } catch (error) {
      console.error("[DonationsService] getRecentDonations failed:", error);
      return [];
    }
  }
}

export const donationsService = new DonationsService();
export default donationsService;
