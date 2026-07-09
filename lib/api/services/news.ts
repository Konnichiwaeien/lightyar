import { StrapiClient } from "../client";
import { StrapiNews, StrapiResponseCollection, StrapiTag } from "../types";

export class NewsService extends StrapiClient {
  /**
   * Fetch news with custom filtering, searching, and pagination meta
   */
  async getNews(options?: {
    tag?: string;
    search?: string;
    sort?: string;
    limit?: number;
    start?: number;
  }): Promise<StrapiResponseCollection<StrapiNews>> {
    try {
      const sortQuery = options?.sort || "publishedAt:desc";
      let query = `/news?populate[0]=mainImage&populate[1]=tags&populate[2]=gallery&sort[0]=${sortQuery}`;
      
      if (options?.tag) {
        const tagSlugs = options.tag.split(",").filter(Boolean);
        if (tagSlugs.length > 0) {
          tagSlugs.forEach((slug, idx) => {
            query += `&filters[tags][slug][$in][${idx}]=${slug}`;
          });
        }
      }
      if (options?.search) {
        query += `&filters[title][$containsi]=${encodeURIComponent(options.search)}`;
      }
      if (options?.limit) {
        query += `&pagination[limit]=${options.limit}`;
      }
      if (options?.start) {
        query += `&pagination[start]=${options.start}`;
      }

      const response = await this.fetchJson<StrapiResponseCollection<StrapiNews>>(query, {
        next: { revalidate: 60 } // Cache and revalidate news catalogs every minute
      });
      return response || { data: [] };
    } catch (error) {
      console.error("[NewsService] getNews failed:", error);
      throw error;
    }
  }

  /**
   * Fetch all available tags
   */
  async getTags(): Promise<StrapiTag[]> {
    try {
      const response = await this.fetchJson<StrapiResponseCollection<StrapiTag>>(
        "/tags?sort[0]=name:asc",
        {
          next: { revalidate: 3600 } // Cache tags list for an hour
        }
      );
      return response.data || [];
    } catch (error) {
      console.error("[NewsService] getTags failed:", error);
      throw error;
    }
  }

  /**
   * Fetch latest news with pagination and population
   */
  async getLatestNews(limit: number = 5): Promise<StrapiNews[]> {
    try {
      const response = await this.fetchJson<StrapiResponseCollection<StrapiNews>>(
        `/news?populate[0]=mainImage&populate[1]=tags&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=publishedAt&fields[4]=documentId&sort[0]=publishedAt:desc&pagination[limit]=${limit}`,
        {
          next: { revalidate: 3600 } // Cache and revalidate every hour
        }
      );
      return response.data || [];
    } catch (error) {
      console.error("[NewsService] getLatestNews failed:", error);
      throw error;
    }
  }

  /**
   * Fetch a single news article by its slug
   */
  async getNewsBySlug(slug: string): Promise<StrapiNews | null> {
    try {
      const response = await this.fetchJson<StrapiResponseCollection<StrapiNews>>(
        `/news?filters[slug][$eq]=${slug}&populate=*`,
        {
          next: { revalidate: 3600 } // Cache and revalidate every hour
        }
      );
      return response.data?.[0] || null;
    } catch (error) {
      console.error(`[NewsService] getNewsBySlug failed for slug: ${slug}`, error);
      throw error;
    }
  }

  /**
   * Fetch all news slugs for dynamic routing static parameters (SSG)
   */
  async getAllNewsSlugs(): Promise<string[]> {
    try {
      // Fetch news list with minimal fields to conserve bandwidth
      const response = await this.fetchJson<StrapiResponseCollection<{ slug: string }>>(
        `/news?fields[0]=slug&pagination[limit]=100`,
        {
          next: { revalidate: 3600 }
        }
      );
      return (response.data || []).map(item => item.slug);
    } catch (error) {
      console.error("[NewsService] getAllNewsSlugs failed:", error);
      return [];
    }
  }
}

export const newsService = new NewsService();
export default newsService;

