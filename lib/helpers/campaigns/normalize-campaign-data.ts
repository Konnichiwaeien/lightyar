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
  } else if (camp.pet?.photos && camp.pet.photos.length > 0) {
    // У сбора нет своих картинок — показываем фото питомца, для которого он открыт
    imageUrl = campaignsService.resolveMediaUrl(camp.pet.photos[0].url);
  } else {
    imageUrl = "/photo-placeholder.jpg";
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
