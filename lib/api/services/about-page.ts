import { StrapiClient } from "../client";
import type { StrapiAboutPage, StrapiResponseSingle } from "../types";
import { mergeAboutContent, type AboutPageContent } from "../../about/about-content";
import { normalizeAboutPage } from "../../about/normalize-about-page";

const ABOUT_POPULATE = [
  "populate[heroVideo]=true",
  "populate[heroPoster]=true",
  "populate[directionsImage]=true",
  "populate[historyImage]=true",
  "populate[currentStats]=true",
  "populate[teamMembers][populate][photo]=true",
  "populate[resultsImage]=true",
  "populate[volunteerVideo]=true",
  "populate[volunteerPoster]=true",
  "populate[faqItems]=true",
  "populate[faqImage]=true",
].join("&");

export class AboutPageService extends StrapiClient {
  async getAboutPage(): Promise<AboutPageContent> {
    try {
      const response = await this.fetchJson<StrapiResponseSingle<StrapiAboutPage>>(
        `/about-page?status=published&${ABOUT_POPULATE}`,
        { next: { revalidate: 60 } },
      );
      return response.data
        ? normalizeAboutPage(response.data, (url) => this.resolveMediaUrl(url))
        : mergeAboutContent();
    } catch (error) {
      console.error("[AboutPageService] getAboutPage failed; using local fallback:", error);
      return mergeAboutContent();
    }
  }
}

export const aboutPageService = new AboutPageService();
export default aboutPageService;
