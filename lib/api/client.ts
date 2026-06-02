export class StrapiClient {
  protected baseUrl: string;
  private apiToken?: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1443/api";
    this.apiToken = process.env.REST_API_KEY;
  }

  /**
   * Helper to resolve media URLs (handles both S3 absolute paths and local relative paths)
   */
  public resolveMediaUrl(url?: string): string {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    // Remove the '/api' suffix to get the host base URL
    const strapiBaseUrl = this.baseUrl.endsWith('/api') 
      ? this.baseUrl.slice(0, -4) 
      : this.baseUrl;
    return `${strapiBaseUrl}${url}`;
  }

  /**
   * Universal fetch method with authorization and logging
   */
  protected async fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const headers = new Headers(options?.headers);

    if (this.apiToken) {
      headers.set("Authorization", `Bearer ${this.apiToken}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`Strapi API Error: ${response.status} ${response.statusText} for ${url}`);
      }
      return await response.json() as T;
    } catch (error) {
      console.error(`[StrapiClient] Request failed for ${url}:`, error);
      throw error;
    }
  }
}

export const strapiClient = new StrapiClient();
