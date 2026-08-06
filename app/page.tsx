import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { DogsStoriesSection } from "@/components/sections/dogs-stories-section";
import { CampaignsSection } from "@/components/sections/campaigns-section";
import { PaymentSection } from "@/components/sections/payment-section";
import { NeedsSection } from "@/components/sections/needs-section";
import { wishlistService, type WishlistItem, type WishlistSettings } from "@/lib/api/services/wishlist";
import { VolunteerSection } from "@/components/sections/volunteer-section";
import { NewsSection } from "@/components/sections/news-section";
import { HomeHeader } from "@/components/home/home-header";
import { ColorTransitionWrapper } from "@/components/home/color-transition-wrapper";
import { newsService } from "@/lib/api/services/news";
import { petsService } from "@/lib/api/services/pets";
import { campaignsService } from "@/lib/api/services/campaigns";
import { donationsService } from "@/lib/api/services/donations";
import { siteMediaService, type SiteMedia } from "@/lib/api/services/site-media";
import type { RecentDonation } from "@/components/sections/payment-section";
import { normalizePetData } from "@/lib/helpers/pets/normalize-pet-data";
import { normalizeCampaignData, MappedCampaign } from "@/lib/helpers/campaigns/normalize-campaign-data";

export default async function Home() {
  let news: Awaited<ReturnType<typeof newsService.getLatestNews>> = [];
  let petsInShelter: { id: string; name: string; tag: string; image: string }[] = [];
  let activeCampaigns: MappedCampaign[] = [];
  let recentDonations: RecentDonation[] = [];
  let siteMedia: SiteMedia = {};
  let wishlistItems: WishlistItem[] = [];
  let wishlistSettings: WishlistSettings = { marketplaceName: "Ozon" };

  try {
    const [newsResult, realPetsRaw, campaignsRaw, donationsRaw, siteMediaRaw, wishlistRaw, wishlistSettingsRaw] =
      await Promise.all([
        newsService.getLatestNews(5),
        petsService.getPets({ status: "shelter", limit: 5 }).then(r => r || []),
        campaignsService.getCampaigns({ status: "active", limit: 3 }),
        donationsService.getRecentDonations(20),
        siteMediaService.getSiteMedia(),
        wishlistService.getItems(),
        wishlistService.getSettings(),
      ]);

    siteMedia = siteMediaRaw;
    wishlistItems = wishlistRaw;
    wishlistSettings = wishlistSettingsRaw;

    news = newsResult;

    recentDonations = donationsRaw.map((d) => ({
      name: d.donorName || "Анонимный помощник",
      amount: d.amount,
      type: d.type,
    }));

    petsInShelter = realPetsRaw
      .map(normalizePetData)
      .map((pet) => ({
        id: String(pet.id),
        name: pet.name,
        tag: pet.tag,
        image: pet.image
      }));

    activeCampaigns = (campaignsRaw.data || []).map(normalizeCampaignData);
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
  }

  return (
    <ColorTransitionWrapper
      lightZone={
        <>
          <HomeHeader />
          <HeroSection videoUrl={siteMedia.heroVideo} posterUrl={siteMedia.heroPoster} />
          <AboutSection imageUrl={siteMedia.homeAbout} />
          <DogsStoriesSection initialPets={petsInShelter} />
        </>
      }
      darkZoneTrigger={
        <CampaignsSection initialCampaigns={activeCampaigns} />
      }
      darkZone={
        <>
          <PaymentSection recentDonations={recentDonations} />
          <NeedsSection items={wishlistItems} settings={wishlistSettings} />
          <VolunteerSection />
          <NewsSection initialNews={news} />
        </>
      }
    />
  );
}
