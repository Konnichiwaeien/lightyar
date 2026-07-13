import { StrapiClient } from "../client";
import { StrapiSiteMedia } from "../types";

/** Resolved media URLs managed via the «Медиа сайта» single type */
export interface SiteMedia {
  homeAbout?: string;
  directions?: string;
  history?: string;
  marina?: string;
  svetlana?: string;
  andrey?: string;
  results?: string;
  faq?: string;
  heroVideo?: string;
  heroPoster?: string;
  presentationVideo?: string;
  presentationPoster?: string;
}

export class SiteMediaService extends StrapiClient {
  /**
   * Fetch the About Page single type and resolve its media URLs.
   * Returns an empty map when the entry is missing or the API is down —
   * consumers fall back to the local placeholder.
   */
  async getSiteMedia(): Promise<SiteMedia> {
    try {
      const response = await this.fetchJson<{ data: StrapiSiteMedia | null }>(
        `/site-media?populate=*`,
        {
          next: { revalidate: 60 }
        }
      );
      const page = response.data;
      if (!page) return {};

      const resolve = (media?: { url: string } | null) =>
        media?.url ? this.resolveMediaUrl(media.url) : undefined;

      return {
        homeAbout: resolve(page.homeAboutImage),
        directions: resolve(page.directionsImage),
        history: resolve(page.historyImage),
        marina: resolve(page.marinaPhoto),
        svetlana: resolve(page.svetlanaPhoto),
        andrey: resolve(page.andreyPhoto),
        results: resolve(page.resultsImage),
        faq: resolve(page.faqImage),
        heroVideo: resolve(page.heroVideo),
        heroPoster: resolve(page.heroPoster),
        presentationVideo: resolve(page.presentationVideo),
        presentationPoster: resolve(page.presentationPoster),
      };
    } catch (error) {
      console.error("[SiteMediaService] getSiteMedia failed:", error);
      return {};
    }
  }
}

export const siteMediaService = new SiteMediaService();
export default siteMediaService;
