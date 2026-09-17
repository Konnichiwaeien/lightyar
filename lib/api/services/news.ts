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
    includeGallery?: boolean;
  }): Promise<StrapiResponseCollection<StrapiNews>> {
    try {
      const sortQuery = options?.sort || "publishedAt:desc";
      let query = `/news?populate[0]=mainImage&populate[1]=tags${options?.includeGallery === false ? "" : "&populate[2]=gallery"}&sort[0]=${sortQuery}`;
      
      if (options?.tag) {
        const tagSlugs = options.tag.split(",").filter(Boolean);
        if (tagSlugs.length > 0) {
          tagSlugs.forEach((slug, idx) => {
            query += `&filters[tags][slug][$in][${idx}]=${encodeURIComponent(slug)}`;
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
          next: { revalidate: 60 } // Newly imported posts also reach the homepage promptly.
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
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
    try {
      const populate = [
        "populate[mainImage]=true",
        "populate[gallery]=true",
        "populate[tags]=true",
        "populate[attachments][populate][media]=true",
        "populate[attachments][populate][poster]=true",
        "populate[attachments][populate][captions]=true",
      ].join("&");
      const response = await this.fetchJson<StrapiResponseCollection<StrapiNews>>(
        `/news?filters[slug][$eq]=${encodeURIComponent(slug)}&${populate}`,
        {
          next: { revalidate: 60 } // Renamed titles reach canonical URLs promptly
        }
      );
      if (response.data?.[0]) return response.data[0];
      // Preserve historical document-ID links while the public address uses a slug.
      if (/^[a-z0-9]{24}$/.test(slug)) {
        try {
          const legacy = await this.fetchJson<{ data: StrapiNews }>(`/news/${encodeURIComponent(slug)}?${populate}`, { next: { revalidate: 60 } });
          return legacy.data || null;
        } catch (error) {
          if (error instanceof Error && error.message.startsWith('Strapi API Error: 404 ')) return null;
          throw error;
        }
      }
      return null;
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
      const slugs: string[] = [];
      let start = 0;
      while (true) {
        const response = await this.fetchJson<StrapiResponseCollection<{ slug: string }>>(
          `/news?fields[0]=slug&sort[0]=id:asc&pagination[limit]=100&pagination[start]=${start}`,
          { next: { revalidate: 60 } },
        );
        const items = response.data || [];
        slugs.push(...items.map(item => item.slug).filter(Boolean));
        start += items.length;
        if (!items.length || start >= (response.meta?.pagination?.total ?? start)) break;
      }
      return [...new Set(slugs)];
    } catch (error) {
      console.error("[NewsService] getAllNewsSlugs failed:", error);
      return [];
    }
  }
}

export const newsService = new NewsService();
export default newsService;
