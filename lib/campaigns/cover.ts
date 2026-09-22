import { firstAlive } from "@/lib/media/alive";
import { campaignFallbackCover } from "./fallback-cover";

export interface CampaignShot {
  src?: string;
  borrowed: boolean;
}

/** Keep this campaign's own photos; otherwise use a local thematic illustration. */
export async function resolveCovers<T extends { title?: string; image?: string; petImage?: string }>(
  funds: T[],
): Promise<(T & { shot: CampaignShot })[]> {
  return Promise.all(funds.map(async fund => {
    const candidates = [fund.image].filter(
      (src): src is string => Boolean(src) && src !== "/photo-placeholder.jpg",
    );
    const src = await firstAlive(candidates, { strict: true });
    return { ...fund, shot: { src: src ?? campaignFallbackCover(fund.title), borrowed: false } };
  }));
}
