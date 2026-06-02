import { StrapiClient } from "../client";
import { StrapiCampaign, StrapiResponseCollection } from "../types";

export class CampaignsService extends StrapiClient {
  /**
   * Fetch campaigns with custom sorting and filtering
   */
  async getCampaigns(options?: {
    status?: 'active' | 'closed';
    sort?: string;
    limit?: number;
    start?: number;
  }): Promise<StrapiResponseCollection<StrapiCampaign>> {
    try {
      const sortQuery = options?.sort || "createdAt:desc";
      // We populate pet and images
      let query = `/campaigns?populate[0]=images&populate[1]=pet&populate[2]=pet.photos&sort[0]=${sortQuery}`;
      
      if (options?.status) {
        query += `&filters[status][$eq]=${options.status}`;
      }
      if (options?.limit) {
        query += `&pagination[limit]=${options.limit}`;
      }
      if (options?.start) {
        query += `&pagination[start]=${options.start}`;
      }

      const response = await this.fetchJson<StrapiResponseCollection<StrapiCampaign>>(query, {
        next: { revalidate: 60 } // Cache and revalidate campaigns every minute
      });
      return response || { data: [] };
    } catch (error) {
      console.error("[CampaignsService] getCampaigns failed:", error);
      throw error;
    }
  }

  /**
   * Fetch a single campaign by ID or Slug
   */
  async getCampaignByIdOrSlug(idOrSlug: string): Promise<StrapiCampaign | null> {
    try {
      // In Strapi v5, we can check by documentId directly, or look up by slug.
      // Let's check both: first try fetching by documentId. If that fails or is empty, we search by slug.
      let response;
      try {
        response = await this.fetchJson<{ data: StrapiCampaign }>(
          `/campaigns/${idOrSlug}?populate[0]=images&populate[1]=pet&populate[2]=pet.photos&populate[3]=donations`,
          { next: { revalidate: 60 } }
        );
        if (response && response.data) {
          return response.data;
        }
      } catch {
        // Document ID not found or invalid format, try searching by slug
      }

      // If documentId fetch failed, try slug filter
      const slugResponse = await this.fetchJson<StrapiResponseCollection<StrapiCampaign>>(
        `/campaigns?filters[slug][$eq]=${encodeURIComponent(idOrSlug)}&populate[0]=images&populate[1]=pet&populate[2]=pet.photos&populate[3]=donations`,
        { next: { revalidate: 60 } }
      );
      return slugResponse.data?.[0] || null;
    } catch (error) {
      console.error(`[CampaignsService] getCampaignByIdOrSlug failed for: ${idOrSlug}`, error);
      throw error;
    }
  }

  /**
   * Fetch all campaign documentIds and slugs for static parameter generation (SSG/ISR)
   */
  async getAllCampaignIdentifiers(): Promise<{ id: string; slug: string }[]> {
    try {
      const response = await this.fetchJson<StrapiResponseCollection<{ documentId: string; slug: string }>>(
        `/campaigns?fields[0]=documentId&fields[1]=slug&pagination[limit]=100`,
        { next: { revalidate: 3600 } }
      );
      return (response.data || []).map(item => ({
        id: item.documentId,
        slug: item.slug
      }));
    } catch (error) {
      console.error("[CampaignsService] getAllCampaignIdentifiers failed:", error);
      return [];
    }
  }
}

export const campaignsService = new CampaignsService();
export default campaignsService;
