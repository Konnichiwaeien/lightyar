const GET_RETRY_DELAYS_MS = [0, 250, 750] as const;
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

export class StrapiClient {
  protected baseUrl: string;
  private apiToken?: string;

  constructor() {
    this.baseUrl = process.env.STRAPI_API_URL || "http://localhost:1443/api";
    this.apiToken = process.env.STRAPI_READ_TOKEN || process.env.REST_API_KEY;
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
    const method = (config.method || "GET").toUpperCase();
    const retryDelays = method === "GET" ? GET_RETRY_DELAYS_MS : [0];
    let lastError: unknown;

    for (let attempt = 0; attempt < retryDelays.length; attempt += 1) {
      const delay = retryDelays[attempt];
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      try {
        const response = await fetch(url, config);
        if (!response.ok) {
          const error = new Error(`Strapi API Error: ${response.status} ${response.statusText} for ${url}`);
          const canRetry = method === "GET"
            && RETRYABLE_STATUS_CODES.has(response.status)
            && attempt < retryDelays.length - 1;

          if (canRetry) {
            lastError = error;
            console.warn(`[StrapiClient] Transient response for ${url}; retrying (${attempt + 1}/${retryDelays.length - 1}).`);
            continue;
          }

          throw error;
        }
        return await response.json() as T;
      } catch (error) {
        const isHttpError = error instanceof Error && error.message.startsWith("Strapi API Error:");
        const canRetry = method === "GET" && !isHttpError && attempt < retryDelays.length - 1;

        if (canRetry) {
          lastError = error;
          console.warn(`[StrapiClient] Connection failed for ${url}; retrying (${attempt + 1}/${retryDelays.length - 1}).`);
          continue;
        }

        console.error(`[StrapiClient] Request failed for ${url}:`, error);
        throw error;
      }
    }

    throw lastError instanceof Error ? lastError : new Error(`Strapi request failed for ${url}`);
  }
}

export const strapiClient = new StrapiClient();
