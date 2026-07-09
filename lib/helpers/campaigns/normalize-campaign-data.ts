import { StrapiCampaign } from "@/lib/api/types";
import { campaignsService } from "@/lib/api/services/campaigns";

export interface MappedCampaign {
  id: string;
  title: string;
  desc: string;
  current: number;
  total: number;
  image: string;
  status: string;
  date: string;
  tag: string;
  petName: string;
}

/**
 * Normalizes a raw StrapiCampaign object into a flat, well-structured MappedCampaign object
 * optimized for presentation rendering and page filtering.
 *
 * @param camp Raw StrapiCampaign object returned from the API
 * @returns Normalized MappedCampaign object
 */
export function normalizeCampaignData(camp: StrapiCampaign): MappedCampaign {
  let imageUrl = "";
  if (camp.images && camp.images.length > 0) {
    imageUrl = campaignsService.resolveMediaUrl(camp.images[0].url);
  } else {
    const DEFAULT_CAMP_IMAGES = [
      "https://images.unsplash.com/photo-1544568100-847a9ec5d878?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800"
    ];
    imageUrl = DEFAULT_CAMP_IMAGES[camp.id % DEFAULT_CAMP_IMAGES.length];
  }

  return {
    id: camp.documentId,
    title: camp.title,
    desc: camp.shortDesc,
    current: Number(camp.current) || 0,
    total: Number(camp.total) || 100,
    image: imageUrl,
    status: camp.status || "active",
    date: camp.createdAt || "",
    tag: camp.tag || "Срочно",
    petName: camp.pet?.name || ""
  };
}
