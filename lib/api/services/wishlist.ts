import { StrapiClient } from "../client";
import type { StrapiMedia, StrapiResponseCollection, StrapiResponseSingle } from "../types";

export interface WishlistItem {
  documentId: string;
  title: string;
  brand?: string;
  specs?: string;
  approxPrice?: number;
  image?: string;
  marketplaceUrl?: string;
  note?: string;
  urgent: boolean;
}

export interface WishlistSettings {
  acceptingOrders?: boolean;
  pickupAddress?: string;
  marketplaceName: string;
  marketplaceUrl?: string;
  instructions?: string;
  contactUrl?: string;
}

interface StrapiWishlistItem {
  documentId: string;
  title: string;
  brand?: string | null;
  specs?: string | null;
  approxPrice?: number | string | null;
  image?: StrapiMedia | null;
  marketplaceUrl?: string | null;
  note?: string | null;
  urgency?: "regular" | "urgent" | null;
  order?: number | null;
}

interface StrapiWishlistSettings {
  acceptingOrders?: boolean;
  pickupAddress?: string | null;
  marketplaceName?: string | null;
  marketplaceUrl?: string | null;
  instructions?: string | null;
  contactUrl?: string | null;
}

const DEFAULT_SETTINGS: WishlistSettings = { marketplaceName: "Ozon" };
function safeLink(value?: string | null): string | undefined {
  try { const url = new URL(value?.trim() || ""); return url.protocol === "https:" ? url.href : undefined; }
  catch { return undefined; }
}

export class WishlistService extends StrapiClient {
  async getItems(): Promise<WishlistItem[]> {
    try {
      const response = await this.fetchJson<StrapiResponseCollection<StrapiWishlistItem>>(
        "/wishlist-items?status=published&populate[image]=true&sort[0]=order:asc&sort[1]=title:asc&pagination[pageSize]=50",
        { next: { revalidate: 300 } },
      );
      return (response.data || []).map((item) => ({
        documentId: item.documentId,
        title: item.title,
        brand: item.brand?.trim() || undefined,
        specs: item.specs?.trim() || undefined,
        approxPrice: item.approxPrice === null || item.approxPrice === undefined ? undefined : Number(item.approxPrice),
        image: item.image?.url ? this.resolveMediaUrl(item.image.url) : undefined,
        marketplaceUrl: safeLink(item.marketplaceUrl),
        note: item.note?.trim() || undefined,
        urgent: item.urgency === "urgent",
      }));
    } catch (error) {
      console.error("[WishlistService] getItems failed:", error);
      return [];
    }
  }

  async getSettings(): Promise<WishlistSettings> {
    try {
      const response = await this.fetchJson<StrapiResponseSingle<StrapiWishlistSettings>>(
        "/wishlist-setting?status=published",
        { next: { revalidate: 300 } },
      );
      const data = response.data;
      if (!data) return DEFAULT_SETTINGS;
      return {
        acceptingOrders: data.acceptingOrders === true && Boolean(data.pickupAddress?.trim()) && process.env.GIFT_ORDERS_ENABLED === "true" && Boolean(process.env.STRAPI_GIFT_WRITE_TOKEN),
        pickupAddress: data.pickupAddress?.trim() || undefined,
        marketplaceName: data.marketplaceName?.trim() || DEFAULT_SETTINGS.marketplaceName,
        marketplaceUrl: safeLink(data.marketplaceUrl),
        instructions: data.instructions?.trim() || undefined,
        contactUrl: safeLink(data.contactUrl),
      };
    } catch (error) {
      console.error("[WishlistService] getSettings failed; using defaults:", error);
      return DEFAULT_SETTINGS;
    }
  }
}

export const wishlistService = new WishlistService();
export default wishlistService;
